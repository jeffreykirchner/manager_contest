/**
 * get history for history card
 */
get_history: function get_history() 
{
    let history = [];
    if(!app.session) return history;
    if(!app.session.started) return history;
    
    let world_state = app.session.world_state;
    
    //reverse order of periods so that most recent is first
    for(let i = world_state.current_period - 1; i >= 0; i--)
    {
        let session_period_id = world_state.session_periods_order[i];
        let session_period = world_state.session_periods[session_period_id];
        let parameter_set_period = app.session.parameter_set.parameter_set_periods[session_period.parameter_set_period_id];
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
            if(group.manager == group.player_1)
            {
                manager_profit = parseFloat(group["player_1_earnings"]).toFixed(2);
                non_manager_profit = parseFloat(group["player_2_earnings"]).toFixed(2);
            }
            else
            {
                manager_profit = parseFloat(group["player_2_earnings"]).toFixed(2);
                non_manager_profit = parseFloat(group["player_1_earnings"]).toFixed(2);
            }

            manager_profit = manager_profit + "p";
            non_manager_profit = non_manager_profit + "p";
        }

        let manager_offer = null;
        if(group["manager_offer"] != null)
        {
            manager_offer =  parseFloat(group["manager_offer"]).toFixed(2)+"p";
        }

        let my_type_a_phase_1_units = null;
        if(group["type_a_phase_1_units_player_" + player_number] != null)
        {
            my_type_a_phase_1_units = group["type_a_phase_1_units_player_" + player_number]+"p";
        }

        let counterpart_type_a_phase_1_units = null;
        if(group["type_a_phase_1_units_player_" + counterpart_number] != null)
        {
            counterpart_type_a_phase_1_units = group["type_a_phase_1_units_player_" + counterpart_number]+"p";
        }

        //starting unit strings
        let my_starting_units_string = "";
        let counterpart_starting_units_string = "";

        if(player_number == 1)
        {
            my_starting_units_string = `<span style="color:crimson;">${parameter_set_period.type_a_units_player_1}A</span> 
                                        <span style="color:cornflowerblue;">${parameter_set_period.type_b_units_player_1}B</span>`;
            counterpart_starting_units_string = `<span style="color:crimson;">${parameter_set_period.type_a_units_player_2}A</span> 
                                                 <span style="color:cornflowerblue;">${parameter_set_period.type_b_units_player_2}B</span>`
        }
        else
        {
            my_starting_units_string = `<span style="color:crimson;">${parameter_set_period.type_a_units_player_2}A</span> 
                                        <span style="color:cornflowerblue;">${parameter_set_period.type_b_units_player_2}B</span>`;
            counterpart_starting_units_string = `<span style="color:crimson;">${parameter_set_period.type_a_units_player_1}A</span> 
                                                 <span style="color:cornflowerblue;">${parameter_set_period.type_b_units_player_1}B</span>`
        }

        history.push({
            period_number: i + 1,
            type_b_value: parameter_set_period.outside_option_payout,
            my_starting_units_string:my_starting_units_string,
            counterpart_starting_units_string:counterpart_starting_units_string,
            my_type_a_phase_1_units: my_type_a_phase_1_units,
            counterpart_type_a_phase_1_units: counterpart_type_a_phase_1_units,
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