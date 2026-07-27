/**
 * process incoming message for the feed
 */
process_the_feed: function process_the_feed(message_type, message_data)
{
    if(message_data.status != "success") return;
    
    let html_text = "";
    let sender_label = "";
    let receiver_label = "";
    let group_label = "";
    let player_info = null;

    switch(message_type) {                
        
        case "update_chat":

            sender_label = app.get_parameter_set_player_from_player_id(message_data.sender_id).id_label;
            receiver_label = "";

            for(let i in message_data.nearby_players) {
                if(receiver_label != "") receiver_label += ", ";
                receiver_label += "<b>" + app.get_parameter_set_player_from_player_id(message_data.nearby_players[i]).id_label + "</b>";
            }

            html_text = "<b>" + sender_label + "</b> @ " + receiver_label + ": " +  message_data.text;

            break;
        case "update_submit_type_a_bid":
                player_info = app.get_the_feed_player_info(message_data.session_player_id);
                let bid = player_info.group["type_a_phase_1_units_player_" + player_info.player_number];

                html_text = `<b>P${player_info.player_label} | G${player_info.group.id}:</b> Spent ${bid} Type A unit(s) in Phase 1.`;
                break;
        case "update_submit_manager_offer_to_worker":
                player_info = app.get_the_feed_player_info(message_data.session_player_id);
                let offer = player_info.group.manager_offer;
                let value = null;
                if(player_info.player_number == 1) {
                    value = player_info.group.player_2_total_value;
                } else {
                    value = player_info.group.player_1_total_value;
                }

                html_text = `<b>P${player_info.player_label} | G${player_info.group.id}:</b> Offered $${offer.toFixed(2)} to their counterpart for their goods ($${value}) in Phase 2.`;
                break;
        case "update_submit_worker_response_to_manager":
                player_info = app.get_the_feed_player_info(message_data.session_player_id);
                let response = player_info.group.manager_offer_accepted;

                if(response == "accept") 
                {
                    response = "Accepted";
                } 
                else 
                {
                    response = "Rejected";
                }

                html_text = `<b>P${player_info.player_label} | G${player_info.group.id}:</b> ${response} their counterpart's offer of 
                             $${player_info.group.manager_offer.toFixed(2)} for their goods ($${player_info.group["player_" + player_info.player_number + "_total_value"]}) in Phase 2.`;
                break;
        case "update_start_next_period":
                html_text = "<center><b>Period " + app.session.world_state.current_period + " has started.</b></center>";
                break;
    }

    if(html_text != "") {
        if(app.the_feed.length > 100) app.the_feed.pop();
        app.the_feed.unshift(html_text);
    }

},

/**
 * Get player info for the feed
 * @param {number} session_player_id - The ID of the session player
 * @returns {Object} - The player info
 */
get_the_feed_player_info: function get_the_feed_player_info(session_player_id)
{
    let group = app.get_player_group(session_player_id);
    let session_player = app.session.world_state.session_players[session_player_id];
    let parameter_set_player = app.session.parameter_set.parameter_set_players[session_player.parameter_set_player_id];

    return {player_label: parameter_set_player.player_number, 
            group: group,
            player_number: group.player_1 == session_player_id ? 1 : 2,};
},