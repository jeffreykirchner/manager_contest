
/**
 * submit worker response to manager
 */
submit_worker_response_to_manager: function submit_worker_response_to_manager(worker_response_to_manager)
{
    if(!app.session.started) return;

    app.worker_response_to_manager_error = null;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.submit_worker_response_to_manager_instructions(worker_response_to_manager);
    }
    else
    {
        app.working = true;
        app.send_message("submit_worker_response_to_manager", 
                        {"worker_response_to_manager" : worker_response_to_manager,},
                        "group"); 
    }
},

/**
 * send worker response to manager for instructions
 */
submit_worker_response_to_manager_instructions: function submit_worker_response_to_manager_instructions(worker_response_to_manager)
{
    if(app.session_player.current_instruction != app.instructions.action_page_3) return;

    let group = app.get_current_group();

    if(worker_response_to_manager != "accept")
    {
        app.worker_response_to_manager_error = "Error: You must select Accept to proceed.";
        return;
    }

    group.manager_offer_accepted = (worker_response_to_manager == "accept");
    group.phase = "Phase 2";
    group.player_1_earnings = app.get_total_value_value_string("json").profit - group.manager_offer;
    group.player_2_earnings = group.manager_offer;

    app.session_player.current_instruction_complete = app.instructions.action_page_3;
    app.send_current_instruction_complete();

    let message_data = {
            group: {
                manager_offer_accepted: group.manager_offer_accepted,
                phase: "Review",
                player_1_earnings:app.get_total_value_value_string("json").profit - group.manager_offer,
                player_2_earnings: group.manager_offer,
            }
    };

    app.take_submit_worker_response_to_manager(message_data)
},

/**
 * take results of submit_worker_response_to_manager
 * @param {Object} message_data - data from server
 */
take_submit_worker_response_to_manager: function take_submit_worker_response_to_manager(message_data)
{
    
    let source_player_id = message_data.source_player_id;
    let group = app.get_current_group();

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message_data.status == "fail")
    {
        app.worker_response_to_manager_error = "Error: " + message_data.error_message;
    }
    else
    {
        group.manager_offer_accepted = message_data.group.manager_offer_accepted;
        group.phase = message_data.group.phase;
        group.player_1_earnings = message_data.group.player_1_earnings;
        group.player_2_earnings = message_data.group.player_2_earnings;
    }
},

/**
 * show ready to go on button if the player has not completed the review
 */
show_ready_to_go_on_button: function show_ready_to_go_on_button()
{
    let group = app.get_current_group();
    let player_number = app.get_player_number();

    if(player_number == 1 && group.player_1_review_complete)
    {
         return false;
    }
    if(player_number == 2 && group.player_2_review_complete) 
    {
        return false;
    }

    return true;
},

/**
 * ready to go on
 */
ready_to_go_on: function ready_to_go_on()
{
    if(!app.session.started) return;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.ready_to_go_on_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("ready_to_go_on", {}, "group");
    }
},


/**
 * ready to go on for instructions
 */
ready_to_go_on_instructions: function ready_to_go_on_instructions()
{
    if(!app.session.started) return;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    let message_data = {
        group: {
            player_1_review_complete: group.player_1_review_complete,
            player_2_review_complete: true,
        }
    };

    app.take_update_ready_to_go_on(message_data);
},

/**
 * take results of ready_to_go_on
 * @param {Object} message_data - data from server
 */
take_update_ready_to_go_on: function take_update_ready_to_go_on(message_data)
{
    
    let source_player_id = message_data.source_player_id;
    let group = app.get_current_group();

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message_data.status == "fail")
    {
        app.ready_to_go_on_error = "Error: " + message_data.error_message;
    }
    else
    {
        let player_number = app.get_player_number();
        if(player_number == 1)
        {
            group.player_1_review_complete = message_data.group.player_1_review_complete;
        }
        else
        {
            group.player_2_review_complete = message_data.group.player_2_review_complete;
        }
    }
},