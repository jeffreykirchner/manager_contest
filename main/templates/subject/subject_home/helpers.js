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
 */
get_total_player_value_string: function get_total_player_value_string(player_number)
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";

    let group = app.get_current_group();

    let type_a_units = group["type_a_units_player_" + player_number];
    let type_b_units = group["type_b_units_player_" + player_number];

    let parameter_set_period = app.get_current_parameter_set_period();

    if(!parameter_set_period) return "---";
    if(app.type_a_bid == null) return "---";
    if(app.type_a_bid_counterpart == null) return "---";

    //check if type_a_bid is a number
    if(!Number.isFinite(app.type_a_bid)) return "---";
    if(!Number.isFinite(app.type_a_bid_counterpart)) return "---";

    //check if type_a_bid is greater than or equal to 0
    if(app.type_a_bid < 0) return "---";
    if(app.type_a_bid_counterpart < 0) return "---";

    //remove type a units from calculation if used for bid
    if(player_number == app.get_player_number())
    {
        type_a_units -= parseInt(app.type_a_bid);
    }
    else
    {
        type_a_units -= parseInt(app.type_a_bid_counterpart);
    }

    if(type_a_units < 0) return "---";

   
    let work_payout = parseFloat(parameter_set_period.work_payout);
    let outside_option_payout = parseFloat(parameter_set_period.outside_option_payout);

    //calculate value for type A and type B units
    let units_for_work = Math.min(type_a_units, type_b_units);
    let value_from_work = parseFloat(units_for_work) * work_payout;

    //add value for unused type B units
    let unused_b_units = Math.max(0, type_b_units - type_a_units);
    let value_from_unused_b_units = parseFloat(unused_b_units) * outside_option_payout;

    let value_from_work_total = value_from_work + value_from_unused_b_units;

    let value_from_outside_option = parseFloat(type_b_units) * outside_option_payout;

    //format in 0.00

    if(value_from_work_total > value_from_outside_option)
    {
        return `${value_from_work_total.toFixed(2)}<br>(${units_for_work}ABs * ${work_payout.toFixed(2)} + ${unused_b_units}Bs * ${outside_option_payout.toFixed(2)})`;
    }
    else
    {
        return `${value_from_outside_option.toFixed(2)}<br>(${type_b_units}Bs * ${outside_option_payout.toFixed(2)})`;
    }

},

/**
 *  get total value for type A units and type B units.
    value is calculated as the minumum of type A and type B units multiplied by work_payout from the ParameterSetPeriod for the current period in the world state local.
    unused type B units are worth the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    unused type A units have no value.
    if the type B are more valuable as all outside option, then the total value is the total number of type B units multiplied by the outside option payout from the ParameterSetPeriod for the current period in the world state local.
 */
get_total_value_value_string : function get_total_value_value_string()
{
    if(!app.session) return "---";
    if(!app.session.started) return "---";

    let group = app.get_current_group();

    let type_a_units = group["type_a_units_player_1"] + group["type_a_units_player_2"];
    let type_b_units = group["type_b_units_player_1"] + group["type_b_units_player_2"];

    let parameter_set_period = app.get_current_parameter_set_period();

    if(!parameter_set_period) return "---";
    if(app.type_a_bid == null) return "---";
    if(app.type_a_bid_counterpart == null) return "---";

    //check if type_a_bid is a number
    if(!Number.isFinite(app.type_a_bid)) return "---";
    if(!Number.isFinite(app.type_a_bid_counterpart)) return "---";

    //check if type_a_bid is greater than or equal to 0
    if(app.type_a_bid < 0) return "---";
    if(app.type_a_bid_counterpart < 0) return "---";

    //chec if bids are greater than total type a units for players
    if(app.get_player_number() == 1)   
    {
       if(parseInt(app.type_a_bid) > group["type_a_units_player_1"]) return "---";
       if(parseInt(app.type_a_bid_counterpart) > group["type_a_units_player_2"]) return "---";
    }
    else
    {
       if(parseInt(app.type_a_bid) > group["type_a_units_player_2"]) return "---";
       if(parseInt(app.type_a_bid_counterpart) > group["type_a_units_player_1"]) return "---";
    }

    type_a_units -= (parseInt(app.type_a_bid) + parseInt(app.type_a_bid_counterpart));

    let work_payout = parseFloat(parameter_set_period.work_payout);
    let outside_option_payout = parseFloat(parameter_set_period.outside_option_payout);

    //calculate value for player 1
    let units_for_work = Math.min(type_a_units, type_b_units);
    let value_from_work = parseFloat(units_for_work) * work_payout;

    //add value for unused type B units for player 1
    let unused_b_units = Math.max(0, type_b_units - type_a_units);
    let value_from_unused_b_units = parseFloat(unused_b_units) * outside_option_payout;

    let value_from_work_total = value_from_work + value_from_unused_b_units;

    let value_from_outside_option = parseFloat(type_b_units) * outside_option_payout;

    if(value_from_work_total > value_from_outside_option)
    {
        return `${value_from_work_total.toFixed(2)}<br>(${units_for_work}ABs * ${work_payout.toFixed(2)} + ${unused_b_units}Bs * ${outside_option_payout.toFixed(2)})`;
    }
    else
    {
        return `${value_from_outside_option.toFixed(2)}<br>(${type_b_units}Bs * ${outside_option_payout.toFixed(2)})`;
    }
},
