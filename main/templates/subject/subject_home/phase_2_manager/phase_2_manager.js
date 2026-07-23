/**
 * submit offer for manager role
 */
submit_manager_offer_to_worker: function submit_manager_offer_to_worker()
{
    if(!app.session.started) return;

    app.manager_offer_to_worker_error = null;

    if(app.session.world_state.current_experiment_phase == 'Instructions')
    {
        app.submit_manager_offer_to_worker_instructions();
    }
    else
    {
        app.working = true;
        app.send_message("submit_manager_offer_to_worker", 
                        {"manager_offer_to_worker" : app.manager_offer_to_worker,},
                        "group"); 
    }
},

/*
submit_manager_offer_to_worker for instructions
*/
submit_manager_offer_to_worker_instructions: function submit_manager_offer_to_worker_instructions()
{
        if(app.session_player.current_instruction != app.instructions.action_page_2) return;

        let counterpart_profit_if_working_alone = app.get_counterpart_profit_if_working_alone();
        counterpart_profit_if_working_alone += 0.5;

        if(app.manager_offer_to_worker != counterpart_profit_if_working_alone)
        {
            app.manager_offer_to_worker_error = "Error: You must offer $" + counterpart_profit_if_working_alone.toFixed(2) + " to the non-manager to proceed.";
            return;
        }

        app.session_player.current_instruction_complete = app.instructions.action_page_2;
        app.send_current_instruction_complete();

        let group = app.get_current_group();

        let message_data = {
                group: {
                    manager_offer: app.manager_offer_to_worker,
                }
        };

        app.take_submit_manager_offer_to_worker(message_data)
},


/**
 * take results of submit_manager_offer_to_worker
 * @param {Object} message_data - data from server
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
        app.manager_offer_to_worker_error = "Error: " + message_data.error_message;
    }
    else
    {
        group.manager_offer = message_data.group.manager_offer;
    }
},

/**
 * get manager share if worker accepts offer
 */
get_manager_share_if_worker_accepts_offers_string: function get_manager_share_if_worker_accepts_offers_string()
{

    if(app.manager_offer_to_worker == null)
    {
        return "$---";
    }

    if(!Number.isFinite(app.manager_offer_to_worker)) return "$---";
    if(app.manager_offer_to_worker < 0) return "$---";

    let group = app.get_current_group();

    let total_value_string = app.get_total_value_value_string("json")

    let manager_offer = parseFloat(total_value_string.profit) - parseFloat(app.manager_offer_to_worker);

    if(manager_offer < 0)
    {
        return "$---";
    } 
    return "$" + manager_offer.toFixed(2);
},
    