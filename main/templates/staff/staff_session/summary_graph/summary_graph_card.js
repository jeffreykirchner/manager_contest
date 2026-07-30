/**
 * Draw the summary graph on the staff screen. 
 * It displays a bar graph showing the average profit earned each period, above what the subject's starting good value was.
 */
draw_summary_graph: function draw_summary_graph()
{
    let temp_canvas = document.getElementById("summary_graph_id");

    if(!temp_canvas) return;

    let ctx = temp_canvas.getContext('2d');

    let world_state = app.session.world_state;

    let left_margin = 30;
    let right_margin = 30;
    let top_margin = 10;
    let bottom_margin = 10;
    let bar_spacing = 10;
    let w = temp_canvas.width;
    let h = temp_canvas.height;
    let max_y = 0;

    let bar_height = (h - top_margin - bottom_margin - 2 * bar_spacing) / 3;
    let y_offset = bar_height + bar_spacing;

    ctx.clearRect(0,0,w,h);

    ctx.save(); 
    ctx.translate(left_margin, top_margin);

    //x axis in center of canvas
    ctx.beginPath();
    ctx.moveTo(0, h/2 - top_margin - bottom_margin);
    ctx.lineTo(w - left_margin - right_margin, h/2 - top_margin - bottom_margin);
    ctx.strokeStyle = "black";
    ctx.stroke();

    //draw player_1_average_gain bar and player_2_average_gain bar for each period
    for(let i = 0; i < world_state.current_period; i++)
    {
        let session_period_id = world_state.session_periods_order[i];
        let session_period = world_state.session_periods[session_period_id];

        let x = i * (w - left_margin - right_margin) / world_state.session_periods_order.length;
        let y = h/2 - top_margin - bottom_margin;

        let scale_factor = 10; //scale factor for bar length

        let player_1_profit = Math.abs(session_period.player_1_average_gain);
        let player_2_profit = Math.abs(session_period.player_2_average_gain);

        let bar_length_player_1 = (player_1_profit) * scale_factor;
        let bar_length_player_2 = (player_2_profit) * scale_factor;

        let bar_width = (w - left_margin - right_margin) / world_state.session_periods_order.length - bar_spacing;

        if(bar_length_player_1 > 0)
        {
            if(session_period.player_1_average_gain < 0)
            {
                ctx.fillStyle = "red";
                ctx.fillRect(x, y, bar_width/2, bar_length_player_1);
            
            }
            else
            {
                ctx.fillStyle = "green";
                ctx.fillRect(x, y - bar_length_player_1, bar_width/2, bar_length_player_1);          
            }
         
        }

        if(bar_length_player_2 > 0)
        {
            if(session_period.player_2_average_gain < 0)
            {
                ctx.fillStyle = "red";
                ctx.fillRect(x + bar_width/2, y, bar_width/2, bar_length_player_2);
            
            }
            else
            {
                ctx.fillStyle = "green";
                ctx.fillRect(x + bar_width/2 , y - bar_length_player_2, bar_width/2, bar_length_player_2);          
            }
         
        }
    }
},