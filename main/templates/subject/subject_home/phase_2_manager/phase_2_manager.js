/**
 * submit offer for manager role
 */
submit_manager_offer_to_worker: function submit_manager_offer_to_worker()
{
    if(!app.session.started) return;

    app.manager_offer_to_worker_error = null;

    app.working = true;
    app.send_message("submit_manager_offer_to_worker", 
                    {"manager_offer_to_worker" : app.manager_offer_to_worker,},
                    "group"); 

},

/**
 * take results of submit_manager_offer_to_worker
 */
take_submit_manager_offer_to_worker: function take_submit_manager_offer_to_worker(message_data)
{
    
    let source_player_id = message_data.source_player_id;
    let group = app.get_current_group();

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message_data.status == "fail")
    {
        app.manager_offer_to_worker_error = message_data.error_message;
    }
    else
    {
        group.manager_offer = message_data.group.manager_offer;
    }
},
    