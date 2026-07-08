/**
 * ready to go on button after spin is complete
 */
spin_ready_to_go_on: function spin_ready_to_go_on()
{
    app.spinner_complete = true;
    Vue.nextTick(() => {
        app.update_graphs();
    });
},