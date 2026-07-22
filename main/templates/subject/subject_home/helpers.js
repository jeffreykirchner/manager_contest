/**
 * return the role of the subject in the current session, either "manager" or "worker"
 */
get_role: function get_role()
{
    if(!app.session) return null;
    if(!app.session.started) return null;
    
    let group = app.get_current_group();

    if(!group.phase) return null;

    if(group.phase == "Phase 1") return null;

    if(group.manager == app.session_player.id) return "manager";
    
    return "worker";
},

/**
 * get player number (1 or 2) for the subject from the current parameter set player id
 */
get_player_number: function get_player_number()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();

    if(group.player_1 == app.session_player.id) return 1;
    
    return 2;
},

/**
 * return the current group from world state for the subject
 */
get_current_group: function get_current_group()
{
    if(!app.session) return null;

    let current_session_period = app.get_current_session_period();

    if(!current_session_period) return null;

    let group_id = current_session_period.group_map[app.session_player.id];
    let group = current_session_period.groups[group_id];

    return group;
},

/**
 * get current session period from the world state
 */
get_current_session_period: function get_current_session_period()
{
    if(!app.session) return null;
    if(!app.session.started) return null;
    
    let current_session_period_id = app.session.world_state.session_periods_order[app.session.world_state.current_period-1];
    return app.session.world_state.session_periods[current_session_period_id];
},

/**
 * get parameter set period for the current session period from the world state
 */
get_current_parameter_set_period: function get_current_parameter_set_period()
{
    let current_session_period = app.get_current_session_period();

    if(!current_session_period) return null;

    let parameter_set_period_id = current_session_period.parameter_set_period_id;
    return app.session.parameter_set.parameter_set_periods[parameter_set_period_id];
},

/**
 * get my type A units for the current period
 */
get_my_type_a_units: function get_my_type_a_units()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    return group["type_a_units_player_" + player_number];
},

/**
 * get my type a units spent in phase 1 for the current period
 */
get_my_type_a_units_spent_in_phase_1: function get_my_type_a_units_spent_in_phase_1()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    return group["type_a_phase_1_units_player_" + player_number];
},

/**
 * get counterpart type A units for the current period
 */
get_counterpart_type_a_units: function get_counterpart_type_a_units()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    let counterpart_player_number = player_number == 1 ? 2 : 1;

    return group["type_a_units_player_" + counterpart_player_number];
},

/**
 * get counterpart type a units spent in phase 1 for the current period
 */
get_counterpart_type_a_units_spent_in_phase_1: function get_counterpart_type_a_units_spent_in_phase_1()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    let counterpart_player_number = player_number == 1 ? 2 : 1;

    return group["type_a_phase_1_units_player_" + counterpart_player_number];
},

/**
 * get my type B units for the current period
 */
get_my_type_b_units: function get_my_type_b_units()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    return group["type_b_units_player_" + player_number];
},

/**
 * get counterpart type B units for the current period
 */
get_counterpart_type_b_units: function get_counterpart_type_b_units()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    let counterpart_player_number = player_number == 1 ? 2 : 1;

    return group["type_b_units_player_" + counterpart_player_number];
},

/**
 * get type A bid for the current period
 */
get_type_a_bid: function get_type_a_bid()
{
    if(!app.session) return null;
    if(!app.session.started) return null;

    let group = app.get_current_group();
    let player_number = app.get_player_number();

    return group["type_a_phase_1_units_player_" + player_number];
},

/**
  get total value for a player based on their type A and type B units.
    value is calculated as the minimum of the player's type A and type B units multiplied by work_payout from the ParameterSetPeriod for the current period in the world state local.
    unused type B units are worth the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    unused type A units have no value.
    if the type B are more valuable as all outside option, then the total value is the total number of type B units multiplied by the outside option payout from the ParameterSetPeriod for the current period in the world state local.

    @param player_number {number} 1 or 2 for the player to calculate total value for
    @param format {string} "string" or "json" for the return format. If "string", return a string with the total value and a breakdown of the calculation. If "json", return an object with the number of type A, type B, and type AB units used in the calculation.
 */
get_total_player_value_string: function get_total_player_value_string(player_number, format = "string")
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";

    let group = app.get_current_group();
    let parameter_set_period = app.get_current_parameter_set_period();
    
    let place_holder = `<span class="fs-4">---</span><br>---`;
    let type_a_units = group["type_a_units_player_" + player_number];
    let type_a_total_units = group["type_a_units_start_player_" + player_number];
    let type_b_units = group["type_b_units_player_" + player_number];
    let type_b_total_units = type_b_units;
    let type_ab_total_units = parameter_set_period.work_payout>parameter_set_period.outside_option_payout ? Math.min(type_a_total_units, type_b_total_units) : 0;
    let type_a_spent = 0;

    if(format == "json")
    {
        place_holder = {
            "type_a_units": type_a_units,
            "type_a_total_units": type_a_total_units,
            "type_a_spent": type_a_spent,
            "type_b_units": type_b_units,
            "type_b_total_units": type_b_total_units,
            "type_ab_units": null,
            "type_ab_total_units": type_ab_total_units,
            "profit": null,
        };
    }

    // if(!app.session) return place_holder;
    // if(!app.session.started) return place_holder;

    if(!parameter_set_period) return ;

    if(group.phase =="Phase 1")
    {
        //remove type a units from calculation if used for bid
        if(player_number == app.get_player_number())
        {
            if(app.type_a_bid == null) return place_holder;

            //check if type_a_bid is a number
            if(!Number.isFinite(app.type_a_bid)) return place_holder;

            //check if type_a_bid is greater than or equal to 0
            if(app.type_a_bid < 0) return place_holder;

            type_a_units -= parseInt(app.type_a_bid);
            type_a_spent = parseInt(app.type_a_bid);
        }
        else
        {
            if(app.type_a_bid_counterpart == null) return place_holder;
            if(!Number.isFinite(app.type_a_bid_counterpart)) return place_holder;
            if(app.type_a_bid_counterpart < 0) return place_holder;

            type_a_units -= parseInt(app.type_a_bid_counterpart);
            type_a_spent = parseInt(app.type_a_bid_counterpart);
        }

        if(type_a_units < 0) return place_holder;
    }
    else if(group.phase == "Phase 2")
    {
        type_a_spent = group["type_a_phase_1_units_player_" + player_number];
    }

    let work_payout = parseFloat(parameter_set_period.work_payout);
    let outside_option_payout = parseFloat(parameter_set_period.outside_option_payout);

    //calculate value for type A and type B units
    let units_for_work = Math.min(type_a_units, type_b_units);
    let value_from_work = parseFloat(units_for_work) * work_payout;

    //add value for unused type B units
    let unused_b_units = Math.max(0, type_b_units - type_a_units);
    let unused_a_units = Math.max(0, type_a_units - type_b_units);
    let value_from_unused_b_units = parseFloat(unused_b_units) * outside_option_payout;

    let value_from_work_total = value_from_work + value_from_unused_b_units;

    let value_from_outside_option = parseFloat(type_b_units) * outside_option_payout;

    //format in 0.00
    if(format == "json")
    {
        if(work_payout >= outside_option_payout)
        {
            return {
                "type_a_units": unused_a_units,
                "type_a_total_units": type_a_total_units,
                "type_a_spent": type_a_spent,
                "type_b_units": unused_b_units,
                "type_b_total_units": type_b_total_units,
                "type_ab_units": units_for_work,
                "type_ab_total_units": type_ab_total_units,
                "profit": Math.round(value_from_work_total * 100) / 100,
            };
        }
        else
        {
            return {
                "type_a_units": type_a_units,
                "type_a_total_units": type_a_total_units,
                "type_a_spent": type_a_spent,
                "type_b_units": type_b_units,
                "type_b_total_units": type_b_units,
                "type_ab_units": 0,
                "type_ab_total_units": 0,
                "profit": Math.round(value_from_outside_option * 100) / 100,
            };
        }
    }
    else
    {
        if(work_payout >= outside_option_payout)
        {
            return `<span class="fs-4">$${value_from_work_total.toFixed(2)}</span>
                    <br>
                    (<span style="color:crimson">${unused_a_units}A x $0.00</span> + 
                     <span style="color:cornflowerblue">${unused_b_units}B x $${outside_option_payout.toFixed(2)}</span> + 
                     <span style="color:purple">${units_for_work}AB x $${work_payout.toFixed(2)}</span>)`;
        }
        else
        {
            return `<span class="fs-4">$${value_from_outside_option.toFixed(2)}</span>
                    <br>
                    (<span style="color:crimson">${type_a_units}A x $0.00</span> + 
                     <span style="color:cornflowerblue">${type_b_units}B * $${outside_option_payout.toFixed(2)}</span>)`;
        }
    }

},

/**
 *  get total value for type A units and type B units.
    value is calculated as the minumum of type A and type B units multiplied by work_payout from the ParameterSetPeriod for the current period in the world state local.
    unused type B units are worth the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    unused type A units have no value.
    if the type B are more valuable as all outside option, then the total value is the total number of type B units multiplied by the outside option payout from the ParameterSetPeriod for the current period in the world state local.
 */
get_total_value_value_string : function get_total_value_value_string(format = "string")
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";

    let group = app.get_current_group();
    let parameter_set_period = app.get_current_parameter_set_period();

    let type_a_units = group["type_a_units_player_1"] + group["type_a_units_player_2"];
    let type_a_total_units = group["type_a_units_start_player_1"] + group["type_a_units_start_player_2"];;
    let type_b_units = group["type_b_units_player_1"] + group["type_b_units_player_2"];
    let type_b_total_units = type_b_units;
    let type_a_spent = 0;
    let type_ab_total_units = parameter_set_period.work_payout>parameter_set_period.outside_option_payout ? Math.min(type_a_total_units, type_b_total_units) : 0;

    let place_holder = `<span class="fs-4">---</span><br>---`;

    if(format == "json")
    {
        place_holder = {
            "type_a_units": type_a_units,
            "type_a_total_units": type_a_total_units,
            "type_a_spent": type_a_spent,
            "type_b_units": type_b_units,
            "type_b_total_units": type_b_total_units,
            "type_ab_units": null,
            "type_ab_total_units": type_ab_total_units,
            "profit": null,
        };
    }

    if(group.phase =="Phase 1")
    {
        if(!parameter_set_period) return place_holder;
        if(app.type_a_bid == null) return place_holder;
        if(app.type_a_bid_counterpart == null) return place_holder;

        //check if type_a_bid is a number
        if(!Number.isFinite(app.type_a_bid)) return place_holder;
        if(!Number.isFinite(app.type_a_bid_counterpart)) return place_holder;

        //check if type_a_bid is greater than or equal to 0
        if(app.type_a_bid < 0) return place_holder;
        if(app.type_a_bid_counterpart < 0) return place_holder;

        //chec if bids are greater than total type a units for players
        if(app.get_player_number() == 1)   
        {
            if(parseInt(app.type_a_bid) > group["type_a_units_player_1"]) return place_holder;
            if(parseInt(app.type_a_bid_counterpart) > group["type_a_units_player_2"]) return place_holder;
        }
        else
        {
            if(parseInt(app.type_a_bid) > group["type_a_units_player_2"]) return place_holder;
            if(parseInt(app.type_a_bid_counterpart) > group["type_a_units_player_1"]) return place_holder;
        }

        type_a_units -= (parseInt(app.type_a_bid) + parseInt(app.type_a_bid_counterpart));
        type_a_spent = parseInt(app.type_a_bid) + parseInt(app.type_a_bid_counterpart);

        if(type_a_units < 0) return place_holder;
    }
    else if(group.phase == "Phase 2")
    {
        type_a_spent = group["type_a_phase_1_units_player_1"] + group["type_a_phase_1_units_player_2"]; 
    }

    let work_payout = parseFloat(parameter_set_period.work_payout);
    let outside_option_payout = parseFloat(parameter_set_period.outside_option_payout);

    //calculate value for player 1
    let units_for_work = Math.min(type_a_units, type_b_units);
    let value_from_work = parseFloat(units_for_work) * work_payout;

    //add value for unused type B units for player 1
    let unused_b_units = Math.max(0, type_b_units - type_a_units);
    let unused_a_units = Math.max(0, type_a_units - type_b_units);
    let value_from_unused_b_units = parseFloat(unused_b_units) * outside_option_payout;

    let value_from_work_total = value_from_work + value_from_unused_b_units;

    let value_from_outside_option = parseFloat(type_b_units) * outside_option_payout;

    if(format == "json")
    {
        if(work_payout >= outside_option_payout)
        {
            return {
                "type_a_units": unused_a_units,
                "type_a_total_units": type_a_total_units,
                "type_a_spent": type_a_spent,
                "type_b_units": unused_b_units,
                "type_b_total_units": type_b_units,
                "type_ab_units": units_for_work,
                "type_ab_total_units": type_ab_total_units,
                "profit": value_from_work_total,
            };
        }
        else
        {
            return {
                "type_a_units": type_a_units,
                "type_a_total_units": type_a_total_units,
                "type_a_spent": type_a_spent,
                "type_b_units": type_b_units,
                "type_b_total_units": type_b_units,
                "type_ab_units": 0,
                "type_ab_total_units": 0,
                "profit": value_from_outside_option,
            };
        }
    }
    else
    {
        if(work_payout >= outside_option_payout)
        {
            return `<span class="fs-4">$${value_from_work_total.toFixed(2)}</span>
                    <br>
                    (<span style="color:crimson">${unused_a_units}A x $0.00</span> + 
                     <span style="color:cornflowerblue">${unused_b_units}B x $${outside_option_payout.toFixed(2)}</span> + 
                     <span style="color:purple">${units_for_work}AB x $${work_payout.toFixed(2)})</span>`;
        }
        else
        {
            return `<span class="fs-4">$${value_from_outside_option.toFixed(2)}</span>
                    <br>
                    (<span style="color:crimson">${type_a_units}A x $0.00</span> + 
                     <span style="color:cornflowerblue">${type_b_units}B x $${outside_option_payout.toFixed(2)}</span>)`;
        }
    }
},

/**
 * get my profit if I work alone
 */
get_my_profit_if_working_alone: function get_my_profit_if_working_alone()
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";
    
    let group = app.get_current_group();
    let player_number = app.get_player_number();
    let total_player_value_string = app.get_total_player_value_string(player_number, "json");

    return total_player_value_string.profit;
},

/**
 * get conterpart profit if they work alone
 */
get_counterpart_profit_if_working_alone: function get_counterpart_profit_if_working_alone()
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";
    
    let group = app.get_current_group();
    let player_number = app.get_player_number();

    let counterpart_player_number = player_number == 1 ? 2 : 1;

    let total_player_value_string = app.get_total_player_value_string(counterpart_player_number, "json");

    return total_player_value_string.profit;
},

/**
 * get manager offer to worker
 */
get_manager_offer_to_worker: function get_manager_offer_to_worker()
{
    let group = app.get_current_group();
    return group.manager_offer;
},

/**
 * get my final profit
 */
get_my_final_profit_string: function get_my_final_profit_string()
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";
    
    let group = app.get_current_group();
    let player_number = app.get_player_number();

    return "$" + parseFloat(group["player_" + player_number + "_earnings"]).toFixed(2);
},

/**
 * capitalize the first letter of a string
 */
capitalize_first_letter: function capitalize_first_letter(string)
{
    try
    {
        if(!string) return "";
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    catch(e)
    {
        return string;
    }
},

/**
 * generate a random string of characters with a length between min_length and max_length
 */
random_string: function random_string(min_length, max_length){

    let s = "";
    let r = app.random_number(min_length, max_length);

    for(let i=0;i<r;i++)
    {
        let v = app.random_number(48, 122);
        s += String.fromCharCode(v);
    }

    return s;
},
