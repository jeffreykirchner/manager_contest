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

/** validate pairs and outside option payouts across periods
 */
check_periods: function check_periods()
{
    let errors = [];
    let players = app.parameter_set.parameter_set_players || {};
    let periods = Object.values(app.parameter_set.parameter_set_periods || {});
    periods.sort((a, b) => a.period_number - b.period_number);

    let partners = {};  //block -> player id -> set of partner ids
    let payouts = {};   //block -> player id -> set of payouts
    let block_units = {};  //block -> first period seen
    const unit_fields = ["type_a_units_player_1", "type_a_units_player_2", "type_b_units_player_1", "type_b_units_player_2"];

    for(const period of periods)
    {
        let block = period.block_number;

        if(!block_units[block])
        {
            block_units[block] = period;
        }
        else
        {
            for(const field of unit_fields)
            {
                if(period[field] !== block_units[block][field])
                {
                    errors.push("Period " + period.period_number + " (block " + block + "): " + field + " is " + period[field] +
                                " but period " + block_units[block].period_number + " has " + block_units[block][field] + ".");
                }
            }
        }
        let values = (period.outside_option_payout || "").split(",").map(v => v.trim());
        partners[block] = partners[block] || {};
        payouts[block] = payouts[block] || {};

        for(const [pair_number, pair] of Object.entries(period.pairs || {}))
        {
            let n1 = players[pair[0]] ? players[pair[0]].player_number : null;
            let n2 = players[pair[1]] ? players[pair[1]].player_number : null;
            let label = "Period " + period.period_number + ", pair " + pair_number;

            if(n1 === null || n2 === null)
            {
                errors.push(label + ": unknown player.");
                continue;
            }

            if(n1 % 2 === n2 % 2)
            {
                errors.push(label + ": players " + n1 + " and " + n2 + " must be one odd and one even.");
            }

            let payout = values[parseInt(pair_number) - 1];

            for(const [me, other] of [[pair[0], pair[1]], [pair[1], pair[0]]])
            {
                let my_number = players[me].player_number;
                let other_number = players[other].player_number;

                partners[block][me] = partners[block][me] || new Set();
                if(partners[block][me].has(other))
                {
                    errors.push(label + " (block " + block + "): player " + my_number + " is paired with player " + other_number + " more than once.");
                }
                partners[block][me].add(other);

                payouts[block][me] = payouts[block][me] || new Set();
                if(payouts[block][me].has(payout))
                {
                    errors.push(label + " (block " + block + "): player " + my_number + " sees payout " + payout + " more than once.");
                }
                payouts[block][me].add(payout);
            }
        }
    }

    app.check_periods_results = errors;
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