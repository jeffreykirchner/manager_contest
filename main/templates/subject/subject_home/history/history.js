/**
 * get history for history card
 */
get_history: function get_history() 
{
    let history = [];
    if(!app.session) return history;
    if(!app.session.started) return history;
    
    let world_state = app.session.world_state;
    

    for(let i = 0; i < world_state.current_period; i++)
    {
        let session_period_id = world_state.session_periods_order[i];
        let session_period = world_state.session_periods[session_period_id];
        let group_id = session_period.group_map[app.session_player.id];
        let group = session_period.groups[group_id];

        let player_number = 1;
        if(group.player_2 == app.session_player.id) player_number = 2;
        let counterpart_number = 3 - player_number;
        let my_role = "";

        if(group.manager == app.session_player.id) my_role = "Manager";
        if(group.worker == app.session_player.id) my_role = "Non-manager";

        let manager_profit = "";
        let non_manager_profit = "";

        if(group.phase != "Phase 1" && group.phase != "Phase 2")
        {
            if(group.manager == group_id.player_1)
            {
                manager_profit = parseFloat(group["player_1_earnings"]).toFixed(2);
                non_manager_profit = parseFloat(group["player_2_earnings"]).toFixed(2);
            }
            else
            {
                manager_profit = parseFloat(group["player_2_earnings"]).toFixed(2);
                non_manager_profit = parseFloat(group["player_1_earnings"]).toFixed(2);
            }

            manager_profit = "$" + manager_profit;
            non_manager_profit = "$" + non_manager_profit;
        }

        let manager_offer = null;
        if(group["manager_offer"] != null)
        {
            manager_offer = "$" + group["manager_offer"].toFixed(2);
        }

        history.push({
            period_number: i + 1,
            my_type_a_phase_1_units: group["type_a_phase_1_units_player_" + player_number],
            counterpart_type_a_phase_1_units: group["type_a_phase_1_units_player_" + counterpart_number],
            my_role: my_role,
            group_id: group_id,
            player_number: player_number,
            counterpart_number: counterpart_number,
            manager_offer: manager_offer,
            non_manager_response: app.capitalize_first_letter(group["manager_offer_accepted"]),
            manager_profit:  manager_profit,
            non_manager_profit: non_manager_profit
        });
    }
    

    return history;
},