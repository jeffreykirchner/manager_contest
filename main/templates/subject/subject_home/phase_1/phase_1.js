/**
 * submit bid for manager role
 */
submit_type_a_bid: function submit_type_a_bid()
{
    if(!app.session.started) return;

    app.type_a_bid_error = null;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.submit_type_a_bid_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("submit_type_a_bid", 
                        {"type_a_bid" : app.type_a_bid,
                        "type_a_bid_counterpart" : app.type_a_bid_counterpart
                        },
                        "group"); 
    }

    

},

submit_type_a_bid_instructions: function submit_type_a_bid_instructions()
{
        if(app.session_player.current_instruction != app.instructions.action_page_1) return;

        if(app.type_a_bid != 2)
        {
            app.type_a_bid_error = "Error: You must bid 2 units to proceed.";
             return;
        }
        if(app.type_a_bid_counterpart != 1)
        {
            app.type_a_bid_error = "Error: Your prediction must be 1 unit to proceed.";
            return;
        }

        app.session_player.current_instruction_complete = app.instructions.action_page_1;
        app.send_current_instruction_complete();

        let group = app.get_current_group();

        let message_data = {
                group: {
                    phase: "Phase 1",
                    worker: app.session_player.id+1,
                    manager: app.session_player.id,
                    player_1: app.session_player.id,
                    player_2: app.session_player.id+1,
                    manager_draw: 0.4,
                    manager_offer: null,
                    player_1_probability: 0.6666666666666666,
                    player_2_probability: 0.3333333333333333,
                    type_a_units_player_1: group.type_a_units_player_1-2,
                    type_a_units_player_2: group.type_a_units_player_2-1,
                    type_b_units_player_1: group.type_b_units_player_1,
                    type_b_units_player_2: group.type_b_units_player_2,
                    type_a_phase_1_units_player_1: 2,
                    type_a_phase_1_units_player_2: 1,},
                session_player_id: app.session_player.id,
                status: "success",
                error_message: ""};
        
        app.take_submit_type_a_bid(message_data)
},

/**
 * take results of submit_type_a_bid
 */
take_submit_type_a_bid: function take_submit_type_a_bid(message_data)
{
    
    let source_player_id = message_data.source_player_id;
    let group = app.get_current_group();

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message_data.status == "fail")
    {
        app.type_a_bid_error = "Error: " + message_data.error_message;
    }
    else
    {
        group.type_a_phase_1_units_player_1 = message_data.group.type_a_phase_1_units_player_1;   
        group.type_a_phase_1_units_player_2 = message_data.group.type_a_phase_1_units_player_2; 
        group.type_a_units_player_1 = message_data.group.type_a_units_player_1;
        group.type_a_units_player_2 = message_data.group.type_a_units_player_2;
        group.phase = message_data.group.phase;
        group.manager = message_data.group.manager; 
        group.worker = message_data.group.worker;
        group.player_1_probability = message_data.group.player_1_probability;
        group.player_2_probability = message_data.group.player_2_probability;
        group.manager_draw = message_data.group.manager_draw;

        if(app.is_subject && group.phase == "Phase 2")
        {
            
             Vue.nextTick(() => {
                app.update_graphs();

                 try{
                    app.pixi_setup_pie_graph();
                    app.spinner_complete = false;
                    app.spinning = true;
                }
                catch(err)
                {
                    console.log("Error setting up pie graph: " + err);
                }
            });
        }
    }
},

/**
 * get probablity of becoming the manager
 * (my bid)/(my bid + counterpart's bid)
 */
get_manager_probability: function get_manager_probability()
{
    if(!app.session.started) return;  
    
    if(app.type_a_bid == null) return "---";
    if(app.type_a_bid_counterpart == null) return "---";

    if(app.type_a_bid == 0 && app.type_a_bid_counterpart == 0) return "50%";
    
    let win_probability = app.type_a_bid / (app.type_a_bid + app.type_a_bid_counterpart);
    
    win_probability *= 100;
    win_probability = Math.round(win_probability * 10) / 10;
    
    return win_probability + "%";
},

/**
 * draw units bar graph
 * draw a horizontal bar graph of the number of units of each type and label at the end of each bar with the number of units
 * colors are units_a: crimson, units_b:cornflowerblue, units_ab:purple
 * @param canvas_id {string} id of canvas to draw on
 * @param units_a {number} number of type A units
 * @param units_b {number} number of type B units
 * @param units_ab {number} number of type AB units
 * @param graph_max {number} maximum value for graph (for scaling)
 */
draw_units_graph: function draw_units_graph(canvas_id, 
                                            units_a, 
                                            units_a_total,
                                            units_b,
                                            units_b_total, 
                                            units_ab, 
                                            units_ab_total,
                                            graph_max, 
                                            clear_canvas_only=false)
{
    let temp_canvas = document.getElementById(canvas_id);

    if(!temp_canvas) return;

    let ctx = temp_canvas.getContext('2d');

    let left_margin = 30;
    let right_margin = 30;
    let top_margin = 10;
    let bottom_margin = 10;
    let bar_spacing = 10;
    let w = temp_canvas.width;
    let h = temp_canvas.height;
    let bar_height = (h - top_margin - bottom_margin - 2 * bar_spacing) / 3;
    let y_offset = bar_height + bar_spacing;

    ctx.clearRect(0,0,w,h);

    if(clear_canvas_only) return;

    ctx.save(); 
    ctx.translate(left_margin, top_margin);

    //draw units_a bar, fill with units_a
    let bar_width = (w - left_margin - right_margin) * (units_a / graph_max);
    let bar_fill_offset = (w - left_margin - right_margin) * ((units_a_total-units_a) / graph_max)
    ctx.fillStyle = "crimson";
    ctx.strokeStyle = "crimson";
    ctx.beginPath();
    ctx.roundRect(bar_fill_offset, 0, bar_width, bar_height, 5);
    ctx.fill();
    ctx.font = "18px Arial";
    ctx.fillText("A", -left_margin + 8, bar_height / 2 + 6);

    //draw units_a_total bar, outline with units_a_total
    bar_width = (w - left_margin - right_margin) * (units_a_total / graph_max);
    ctx.fillStyle = "crimson";
    ctx.strokeStyle = "crimson";
    ctx.beginPath();
    ctx.roundRect(0, 0, bar_width, bar_height, 5);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.font = "18px Arial";
    ctx.fillText(units_a, bar_width + 5, bar_height / 2 + 6);

    //draw units_b bar, fill with units_b    
    bar_width = (w - left_margin - right_margin) * (units_b / graph_max);
    bar_fill_offset = (w - left_margin - right_margin) * ((units_b_total-units_b) / graph_max)
    ctx.fillStyle = "cornflowerblue";
    ctx.strokeStyle = "cornflowerblue";
    ctx.beginPath();
    ctx.roundRect(0, y_offset, bar_width, bar_height, 5);
    ctx.fill();
    ctx.font = "18px Arial";
    ctx.fillText("B", -left_margin + 8, y_offset + bar_height / 2 + 6);

    //draw units_b_total bar, outline with units_b_total
    bar_width = (w - left_margin - right_margin) * (units_b_total / graph_max);
    ctx.fillStyle = "cornflowerblue";
    ctx.strokeStyle = "cornflowerblue";
    ctx.beginPath();
    ctx.roundRect(0, y_offset, bar_width, bar_height, 5);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.font = "18px Arial";
    ctx.fillText(units_b, bar_width + 5, y_offset + bar_height / 2 + 6);
    
    // if(units_ab == null)
    // {
    //     //replace bar with "Starting Units" text
    //     y_offset = 2 * (bar_height + bar_spacing);
    //     ctx.fillStyle = "black";
    //     ctx.font = "18px Arial";
    //     ctx.textalign = "center";
    //     ctx.fillText("Initial Units", w/2-left_margin-40, y_offset + bar_height / 2 + 6);
    // }
    // else
    // {
    //draw units_ab bar, fill with units_ab
    y_offset = 2 * (bar_height + bar_spacing);
    bar_width = (w - left_margin - right_margin) * (units_ab / graph_max);
    bar_fill_offset = (w - left_margin - right_margin) * ((units_ab_total-units_ab) / graph_max)
    ctx.fillStyle = "purple";
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.roundRect(bar_fill_offset, y_offset, bar_width, bar_height, 5);
    ctx.fill();
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.font = "18px Arial";
    // ctx.fillText(units_ab, bar_width + 5, y_offset + bar_height / 2 + 6);
    ctx.fillText("AB", -left_margin + 2, y_offset + bar_height / 2 + 6);

    //draw units_ab_total bar, outline with units_ab_total
    bar_width = (w - left_margin - right_margin) * (units_ab_total / graph_max);
    ctx.fillStyle = "purple";
    ctx.strokeStyle = "purple";
    ctx.beginPath();
    ctx.roundRect(0, y_offset, bar_width, bar_height, 5);
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.font = "18px Arial";

    if(units_ab != null)
    {
        ctx.fillText(units_ab, bar_width + 5, y_offset + bar_height / 2 + 6);
    }

    //draw y axis
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, h - top_margin - bottom_margin);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

},

/**
 * get wheather phase input is disabled
 * if not during the instructions then enabled.
 * if before the first action page, then disabled.
 */
is_phase_1_input_disabled: function is_phase_1_input_disabled()
{
    if(!app.session.started) return true;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        if(app.session_player.current_instruction < app.instructions.action_page_1)
        {
            return true;
        }
    }

    return false;
},

