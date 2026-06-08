/**
 * submit bid for manager role
 */
submit_type_a_bid: function submit_type_a_bid()
{
    if(!app.session.started) return;

    app.type_a_bid_error = null;

    app.working = true;
    app.send_message("submit_type_a_bid", 
                    {"type_a_bid" : app.type_a_bid,},
                    "group"); 

},

/**
 * take results of submit_type_a_bid
 */
take_submit_type_a_bid: function take_submit_type_a_bid(message_data)
{
    
    let source_player_id = message_data.source_player_id;
    let group = app.get_current_group();

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message_data.status == "fail")
    {
        app.type_a_bid_error = message_data.error_message;
    }
    else
    {
        group.type_a_phase_1_units_player_1 = message_data.group.type_a_phase_1_units_player_1;   
        group.type_a_phase_1_units_player_2 = message_data.group.type_a_phase_1_units_player_2;    
        group.phase = message_data.group.phase;
        group.manager = message_data.group.manager; 
        group.worker = message_data.group.worker;
    }
},
    