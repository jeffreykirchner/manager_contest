/**
 * submit bid for manager role
 */
submit_type_a_bid: function submit_type_a_bid()
{
    if(!app.session.started) return;

    app.type_a_bid_error = null;

    app.working = true;
    app.send_message("submit_type_a_bid", 
                    {"type_a_bid" : app.type_a_bid,
                     "type_a_bid_counterpart" : app.type_a_bid_counterpart
                    },
                    "group"); 

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
        group.player_1_total_value = message_data.group.player_1_total_value;
        group.player_2_total_value = message_data.group.player_2_total_value;
        group.group_total_value = message_data.group.group_total_value;
        group.player_1_probability = message_data.group.player_1_probability;
        group.player_2_probability = message_data.group.player_2_probability;
        group.manager_draw = message_data.group.manager_draw;

        if(app.is_subject && group.phase == "Phase 2")
        {
            app.pixi_setup_pie_graph();
            app.spinner_complete = false;
            app.spinning = true;
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
    