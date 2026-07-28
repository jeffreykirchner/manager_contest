/**
 * Draw the summary graph on the staff screen. 
 * It displays a bar graph showing the average profit earned each period, above what the subject's starting good value was.
 */
draw_summary_graph: function draw_summary_graph()
{
    let temp_canvas = document.getElementById("summary_graph_id");

    if(!temp_canvas) return;

    let ctx = temp_canvas.getContext('2d');

    let parameter_set_period = app.get_current_parameter_set_period();

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

    if(clear_canvas_only) return;

    ctx.save(); 
    ctx.translate(left_margin, top_margin);

    //x axis in center of canvas
    ctx.beginPath();
    ctx.moveTo(0, h/2 - top_margin - bottom_margin);
    ctx.lineTo(w - left_margin - right_margin, h/2 - top_margin - bottom_margin);
    ctx.strokeStyle = "black";
    ctx.stroke();

    //draw bars for each period
    for(let i = 0; i < parameter_set_period.length; i++)
    {
        let period = parameter_set_period[i];
        let x = i * (w - left_margin - right_margin) / parameter_set_period.length;
        let y = h/2 - top_margin - bottom_margin;

        let profit = period.average_profit;
        let bar_length = profit * 10; //scale factor

        if(bar_length > 0)
        {
            ctx.fillStyle = "green";
            ctx.fillRect(x, y - bar_length, (w - left_margin - right_margin) / parameter_set_period.length - bar_spacing, bar_length);          
        }
    }
},