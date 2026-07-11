{%if session.parameter_set.test_mode%}
/**
 * return random number between min and max inclusive
 */
random_number: function random_number(min, max){
    //return a random number between min and max
    min = Math.ceil(min);
    max = Math.floor(max+1);
    return Math.floor(Math.random() * (max - min) + min);
},

do_test_mode: function do_test_mode(){

    if(worker) worker.terminate();

    {%if DEBUG%}
    console.log("Do Test Mode");
    {%endif%}

    if(app.end_game_modal_visible && app.test_mode)
    {
        if(app.session_player.name == "")
        {
            Vue.nextTick(() => {
                app.session_player.name = app.random_string(5, 20);
                app.session_player.student_id =  app.random_number(1000, 10000);

                app.send_name();
            })
        }

        return;
    }

    if(app.session.started &&
       app.test_mode
       )
    {
        
        switch (app.session.world_state.current_experiment_phase)
        {
            case "Instructions":
                app.do_test_mode_instructions();
                break;
            case "Run":
                app.do_test_mode_run();
                break;
            
        }        
       
    }

    // setTimeout(app.do_test_mode, app.random_number(1000 , 1500));
    worker = new Worker("/static/js/worker_test_mode.js");

    worker.onmessage = function (evt) {   
        app.do_test_mode();
    };

    worker.postMessage(0);
},

/**
 * test during instruction phase
 */
do_test_mode_instructions: function do_test_mode_instructions()
 {
    if(app.session_player.instructions_finished) return;
    if(app.working) return;
    
   
    if(app.session_player.current_instruction == app.session_player.current_instruction_complete)
    {

        if(app.session_player.current_instruction == app.instructions.instruction_pages.length)
            document.getElementById("instructions_start_id").click();
        else
            document.getElementById("instructions_next_id").click();

    }else
    {
        //take action if needed to complete page
        switch (app.session_player.current_instruction)
        {
            case 1:
                break;
            case 2:
                
                break;
            case 3:
                
                break;
            case 4:
                
                break;
            case 5:
                break;
        }   
    }

    
 },

/**
 * test during run phase
 */
do_test_mode_run: function do_test_mode_run()
{
    
    if(app.session.world_state.finished) return;
    if(app.working) return;

    let world_state = app.session.world_state;
    let group = app.get_current_group();

    if(group.phase == "Phase 1")
    {
        app.do_test_mode_phase_1();
    }
    else if(group.phase == "Phase 2")
    {
        app.do_test_mode_phase_2();
    }
    else if(group.phase == "Review")
    {
        app.do_test_mode_review();
    }

},

/**
 * test mode phase 1 action
 */
do_test_mode_phase_1: function do_test_mode_phase_1()
{
    if(app.get_type_a_bid() != null) return;

    let world_state = app.session.world_state;
    let group = app.get_current_group();
    let type_a_units = app.get_my_type_a_units();
    let type_a_units_counterpart = app.get_counterpart_type_a_units();

    //random number of type a units
    app.type_a_bid = app.random_number(0, type_a_units);
    app.type_a_bid_counterpart = app.random_number(0, type_a_units_counterpart);

    app.submit_type_a_bid();
},

/**
 * test mode phase 2 action
 */
do_test_mode_phase_2: function do_test_mode_phase_2()
{

    let world_state = app.session.world_state;
    let group = app.get_current_group();
    let role = app.get_role();

    if(!app.spinner_complete)
    {
        if(!app.spinning)
        {
            app.spin_ready_to_go_on();
        }
    }
    else if(role == "manager")
    {
        if(group.manager_offer == null)
        {
            let total_value_string = app.get_total_value_value_string("json");
            app.manager_offer_to_worker = app.random_number(0, total_value_string.profit);
            app.submit_manager_offer_to_worker();
        }
    }
    else
    {
        if(group.manager_offer != null)
        {
            if(app.random_number(0, 1) == 0)
            {
                app.submit_worker_response_to_manager("accept");
            }
            else
            {
                app.submit_worker_response_to_manager("reject");
            }
        }
    }


},

/**
 * test mode review action
 */
do_test_mode_review: function do_test_mode_review()
{
    if(app.show_ready_to_go_on_button())
    {
        app.ready_to_go_on();
        return;
    }
},



{%endif%}