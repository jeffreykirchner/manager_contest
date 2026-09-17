/**show edit parameter set period
 */
show_edit_parameter_set_period: function show_edit_parameter_set_period(index)
{

    if(app.session.started) return;
    if(app.working) return;

    app.clear_main_form_errors();
    app.current_parameter_set_period = Object.assign({}, app.parameter_set.parameter_set_periods[index]);

    app.edit_parameterset_period_modal.toggle();
},

/** update parameterset period
*/
send_update_parameter_set_period: function send_update_parameter_set_period()
{

    app.working = true;

    app.send_message("update_parameter_set_period", {"session_id" : app.session.id,
                                                      "parameterset_period_id" : app.current_parameter_set_period.id,
                                                      "form_data" : app.current_parameter_set_period});
},

/** remove the selected parameterset period
*/
send_remove_parameter_set_period: function send_remove_parameter_set_period()
{

    app.working = true;
    app.send_message("remove_parameterset_period", {"session_id" : app.session.id,
                                                     "parameterset_period_id" : app.current_parameter_set_period.id,});

},

/** add a new parameterset period
*/
send_add_parameter_set_period: function send_add_parameter_set_period()
{
    app.working = true;
    app.send_message("add_parameterset_period", {"session_id" : app.session.id});

},

/** setup round robin pairs
*/
send_setup_pairs: function send_setup_pairs()
{
    app.working = true;
    app.send_message("setup_pairs", {"session_id" : app.session.id});
},

/**
 * setup random pairs
 */
send_setup_random_pairs: function send_setup_random_pairs()
{
    app.working = true;
    app.send_message("setup_random_pairs", {"session_id" : app.session.id});
},

/**
 * setup round robin pairs (odd paired with random even) and randomize outside option prices
 */
send_setup_round_robin_prices: function send_setup_round_robin_prices()
{
    app.working = true;
    app.send_message("setup_round_robin_prices", {"session_id" : app.session.id});
},

/**
 * randomize period order within each block
 */
send_randomize_period_order_within_block: function send_randomize_period_order_within_block()
{
    app.working = true;
    app.send_message("randomize_period_order_within_block", {"session_id" : app.session.id});
},

/** copy current period settings forward to all future periods
*/
send_copy_forward_parameter_set_period: function send_copy_forward_parameter_set_period()
{
    app.working = true;
    app.send_message("copy_forward_parameter_set_period", {"session_id" : app.session.id,
                                                          "parameterset_period_id" : app.current_parameter_set_period.id,});
},

/**
 * get player number from parameter set player id
 */
get_player_number: function get_player_number(parameter_set_player_id)
{
    if(!app.parameter_set.parameter_set_players[parameter_set_player_id])
    {
        return null;
    }
    return app.parameter_set.parameter_set_players[parameter_set_player_id].player_number;
},

/** show upload periods modal
*/
show_upload_parameterset_periods: function show_upload_parameterset_periods()
{
    if(app.session.started) return;
    if(app.working) return;

    app.upload_parameterset_periods_text = "";
    app.upload_parameterset_periods_error = "";

    app.upload_parameterset_periods_modal.toggle();
},

/** send pasted csv/tab delimited period data to server
*/
send_upload_parameterset_periods: function send_upload_parameterset_periods()
{
    app.working = true;

    app.send_message("upload_parameterset_periods", {"session_id" : app.session.id,
                                                      "csv_data" : app.upload_parameterset_periods_text});
},

/** take result of uploading periods
*/
take_upload_parameterset_periods: function take_upload_parameterset_periods(message_data)
{
    if(message_data.status.value == "success")
    {
        app.take_get_parameter_set(message_data);

        app.upload_parameterset_periods_error = "";
        app.upload_parameterset_periods_modal.hide();
    }
    else
    {
        app.upload_parameterset_periods_error = message_data.status.errors;
    }
},

/** hide upload periods modal
*/
hide_upload_parameterset_periods: function hide_upload_parameterset_periods()
{
    app.upload_parameterset_periods_text = "";
},