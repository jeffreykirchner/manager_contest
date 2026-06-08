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
