/**
 * return the role of the subject in the current session, either "manager" or "worker"
 */
get_role: function get_role()
{
    if(!app.session) return null;
    
    let group = app.get_current_group();

    if(group.phase == "Phase 1") return null;

    if(group.manager == app.session_player.id) return "manager";
    
    return "worker";
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
    
    let current_session_period_id = app.session.world_state.session_periods_order[app.session.world_state.current_period-1];
    return app.session.world_state.session_periods[current_session_period_id];
},


