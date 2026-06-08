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
take_submit_type_a_bid: function take_submit_type_a_bid(message)
{
    
    let source_player_id = message_data.source_player_id;

    if(source_player_id == app.session.player_id)
    {
        app.working = false;
    }

    if(message.error)
    {
        app.type_a_bid_error = message.error;
    }
    else
    {
        
        
    }
},
    