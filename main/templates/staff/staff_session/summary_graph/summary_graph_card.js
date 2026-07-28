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

    //draw bars for each period
    for(let i = 0; i < world_state.current_period; i++)
    {
        let session_period_id = world_state.session_periods_order[i];
        let session_period = world_state.session_periods[session_period_id];

        let x = i * (w - left_margin - right_margin) / world_state.session_periods_order.length;
        let y = h/2 - top_margin - bottom_margin;

        let profit = 10;
        let bar_length = profit * 10; //scale factor

        if(bar_length > 0)
        {
            ctx.fillStyle = "green";
            ctx.fillRect(x, y - bar_length, (w - left_margin - right_margin) / world_state.session_periods_order.length - bar_spacing, bar_length);          
        }
    }
},