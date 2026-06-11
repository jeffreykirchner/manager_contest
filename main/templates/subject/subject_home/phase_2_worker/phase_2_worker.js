
/**
 * submit worker response to manager
 */
submit_worker_response_to_manager: function submit_worker_response_to_manager(worker_response_to_manager)
{
    if(!app.session.started) return;

    app.worker_response_to_manager_error = null;

    app.working = true;
    app.send_message("submit_worker_response_to_manager", 
                    {"worker_response_to_manager" : worker_response_to_manager,},
                    "group");

},

/**
 * take results of submit_worker_response_to_manager
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
        group.worker_response = message_data.group.worker_response;
        group.phase = message_data.group.phase;
        group.player_1_earnings = message_data.group.player_1_earnings;
        group.player_2_earnings = message_data.group.player_2_earnings;
    }
},