{% load static %}

/**
 * update the pixi players with new info
 */
setup_pixi: function setup_pixi(){    
    app.reset_pixi_app();
    app.pixi_tick_tock = {value:"tick", time:Date.now()};
},

reset_pixi_app: async function reset_pixi_app(){    

    let canvas = document.getElementById('sd_graph_id');

    pixi_app = new PIXI.Application()

    await pixi_app.init({resizeTo : canvas,
                         backgroundColor : 0xFFFFFF,
                         autoResize: true,
                         antialias: true,
                         resolution: 1,
                         canvas: canvas });

    // The stage will handle the move events
    // pixi_app.stage.hitArea = pixi_app.screen;

    app.canvas_width = canvas.width;
    app.canvas_height = canvas.height;

    app.last_collision_check = Date.now();

    app.setup_pixi_sheets();
    app.spinner_setup_complete = true;
},

/** load pixi sprite sheets
*/
setup_pixi_sheets: function setup_pixi_sheets(){

    pixi_container_main = new PIXI.Container();
    pixi_container_main.sortableChildren = true;

    pixi_app.stage.addChild(pixi_container_main);

    app.pixi_setup_pie_graph();
   
    {%if DEBUG or session.parameter_set.test_mode%}
    //fps counter
    let text_style = {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: {color:'black'},
        align: 'left',
    };
    let fps_label = new PIXI.Text({text:"0 fps", 
                                   style:text_style});

    pixi_fps_label = fps_label;
    pixi_fps_label.position.set(10, app.canvas_height-25);
    pixi_app.stage.addChild(pixi_fps_label);   
    {%endif%}

    //start game loop
    pixi_app.ticker.add(app.game_loop);
},

/**
 * setup pixi pie graph
 */
pixi_setup_pie_graph: function pixi_setup_pie_graph()
{
    if(pixi_pie_graph.container != null)
    {
        pixi_container_main.removeChild(pixi_pie_graph.container);
        pixi_pie_graph.container.destroy({ children: true });
        pixi_pie_graph.container = null;
    }

    let group = app.get_current_group();

    let pixi_pie_graph_container = new PIXI.Container();

    let my_player_number = app.get_player_number();
    let counterpart_player_number = 3 - my_player_number;
    
    //two part pie graph of group.player_1_probability and group.player_2_probability
    let player_1_probability = group["player_1_probability"];
    let player_2_probability = group["player_2_probability"];

    let my_probability = group["player_" + my_player_number + "_probability"];
    let counterpart_probability = group["player_" + counterpart_player_number + "_probability"];

    if(player_1_probability == null || player_2_probability == null)
    {
        player_1_probability = 0.5;
        player_2_probability = 0.5;
    }

    let total = player_1_probability + player_2_probability;
    if(total <= 0)
    {
        player_1_probability = 0.5;
        player_2_probability = 0.5;
        total = 1;
    }

    player_1_probability /= total;
    player_2_probability /= total;

    let starting_angle = -Math.PI/2; //start at top of circle

    let player_1_angle = 2 * Math.PI * player_1_probability;
    let player_2_angle = 2 * Math.PI * player_2_probability;

    let pie_graph_player_1 = new PIXI.Graphics();
    pie_graph_player_1.stroke({width: 2, color: "dimgray", alignment: 0.5});
    if(my_player_number === 1)
    {
        pie_graph_player_1.beginFill("cornflowerblue");
    }
    else
    {
        pie_graph_player_1.beginFill("crimson");
    }
    pie_graph_player_1.moveTo(0, 0);
    pie_graph_player_1.arc(0, 0, 250, starting_angle, starting_angle + player_1_angle);
    pie_graph_player_1.lineTo(0, 0);
    pie_graph_player_1.endFill();    

    let pie_graph_player_2 = new PIXI.Graphics();
    pie_graph_player_2.stroke({width: 2, color: "dimgray", alignment: 0.5});
    if(my_player_number === 2)
    {
        pie_graph_player_2.beginFill("cornflowerblue");
    }
    else
    {
        pie_graph_player_2.beginFill("crimson");
    }
    pie_graph_player_2.moveTo(0, 0);
    pie_graph_player_2.arc(0, 0, 250, starting_angle + player_1_angle, starting_angle + player_1_angle + player_2_angle);
    pie_graph_player_2.lineTo(0, 0);
    pie_graph_player_2.endFill();

    pie_graph_player_1.position.set(app.canvas_width/2, app.canvas_height/2);
    pie_graph_player_2.position.set(app.canvas_width/2, app.canvas_height/2);

    //add percentage labels
    let text_style_1 = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: {color:'cornflowerblue'},
    };

    let text_style_2 = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: {color:'crimson'},
    };

    let player_1_text = "My Probability: " + (my_probability * 100).toFixed(1) + "%";
    let player_2_text = "Counterpart Probability: " + (counterpart_probability * 100).toFixed(1) + "%";

    let player_1_label = new PIXI.Text(player_1_text, text_style_1);
    let player_2_label = new PIXI.Text(player_2_text, text_style_2);

    player_1_label.anchor.set(1, 0);
    player_2_label.anchor.set(0, 0);

    player_1_label.position.set(app.canvas_width-10, 10);
    player_2_label.position.set(10, 10);

    //add spinner arrow starting at top of circle

    let arrow_container = new PIXI.Container();
    
    let spinner_arrow_shaft = new PIXI.Graphics();   
    spinner_arrow_shaft.rect(-2, -250, 4, 350);
    spinner_arrow_shaft.fill({color:'black'}); 
    spinner_arrow_shaft.stroke({width: 2, 
                                color: "dimgray", 
                                pixelLine: true,
                                alignment: 0, 
                                join: "bevel"});

    arrow_container.addChild(spinner_arrow_shaft);

    let spinner_arrow_head = new PIXI.Graphics();
    spinner_arrow_head.beginFill("black");
    spinner_arrow_head.moveTo(0, -249);
    spinner_arrow_head.lineTo(-20, -220);
    spinner_arrow_head.lineTo(20, -220);
    spinner_arrow_head.lineTo(0, -249);
    spinner_arrow_head.endFill();
    spinner_arrow_head.stroke({width: 2, color: "dimgray", alignment: 0.5, join: "bevel"});
    arrow_container.addChild(spinner_arrow_head);

    let spinner_arrow_tail = new PIXI.Graphics();
    spinner_arrow_tail.circle(0, 100,15);
    spinner_arrow_tail.fill("black");
    spinner_arrow_tail.stroke({width: 2, color: "dimgray", alignment: 0.5, join: "bevel"});
    arrow_container.addChild(spinner_arrow_tail);

    let spinner_arrow_pin = new PIXI.Graphics();
    spinner_arrow_pin.circle(0, 0, 5);
    spinner_arrow_pin.fill("black");
    spinner_arrow_pin.stroke({width: 2, color: "dimgray", alignment: 0.5, join: "bevel"});
    arrow_container.addChild(spinner_arrow_pin);

    arrow_container.position.set(app.canvas_width/2, app.canvas_height/2);

    //add elements to container
    pixi_pie_graph_container.addChild(pie_graph_player_1);
    pixi_pie_graph_container.addChild(pie_graph_player_2);
    pixi_pie_graph_container.addChild(player_1_label);
    pixi_pie_graph_container.addChild(player_2_label);
    pixi_pie_graph_container.addChild(arrow_container);

    pixi_container_main.addChild(pixi_pie_graph_container);
    pixi_pie_graph.container = pixi_pie_graph_container;
    pixi_pie_graph.arrow = arrow_container;
},

/**
 * game loop for pixi
 */
game_loop: function game_loop(delta)
{
    
    {%if DEBUG%}
    pixi_fps_label.text = Math.round(pixi_app.ticker.FPS) + " FPS";
    {%endif%}

    //tick tock
    if(Date.now() - app.pixi_tick_tock.time >= 200)
    {
        app.pixi_tick_tock.time = Date.now();
        if(app.pixi_tick_tock.value == "tick") 
            app.pixi_tick_tock.value = "tock";
        else
            app.pixi_tick_tock.value = "tick";
    }

    if(pixi_pie_graph.arrow && app.spinning)
    {
        //rotate arrow clockwise about its center point

        if(app.spinning)
        {

            //if pixi_pie_graph.arrow.rotation > 4 * Math.PI, start slowing down the rotation until it reaches 4 * Math.PI + (2 * Math.PI * group.manager_draw)

            let rotation_rate = 0.15;
            let group = app.get_current_group();
            let max_rotation = 4 * Math.PI + (2 * Math.PI * group.manager_draw);
            
            if(pixi_pie_graph.arrow.rotation > 4 * Math.PI)
            {
                let remaining_rotation = max_rotation - pixi_pie_graph.arrow.rotation;

                if(remaining_rotation < 0.1)
                {
                    rotation_rate = 0.01;
                }
                else if(remaining_rotation < 1)
                {
                    rotation_rate = 0.05;
                }
            }

            pixi_pie_graph.arrow.rotation += rotation_rate;

            

            if(pixi_pie_graph.arrow.rotation > max_rotation)
            {
                app.spinning = false;
                // app.spinner_complete = true;
                pixi_pie_graph.arrow.rotation = max_rotation;
            }
        }
    }
},