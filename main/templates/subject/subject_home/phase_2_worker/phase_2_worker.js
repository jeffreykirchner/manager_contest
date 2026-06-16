
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

    app.working = true;
    app.send_message("ready_to_go_on", {}, "group");
},

/**
 * take results of ready_to_go_on
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