
/**
 * Given the page number return the requested instruction text
 * @param pageNumber : int
 */
get_instruction_page: function get_instruction_page(pageNumber){

    let non_manager_total_value_50c = 0;
    let counterpart_profit_if_working_alone = app.get_counterpart_profit_if_working_alone();
    counterpart_profit_if_working_alone += 0.50;


    for(let i=0;i<app.instructions.instruction_pages.length;i++)
    {
        if(app.instructions.instruction_pages[i].page_number==pageNumber)
        {
            let text_html = app.instructions.instruction_pages[i].text_html;
            text_html = text_html.replace("#non_manager_total_value_50c#", counterpart_profit_if_working_alone);
            return text_html;
        }
    }

    return "Text not found";
},

/**
 * advance to next instruction page
 */
send_next_instruction: function send_next_instruction(direction){

    if(app.working) return;
    
    app.working = true;
    app.send_message("next_instruction", {"direction" : direction});
},

/**
 * advance to next instruction page
 */
take_next_instruction: function take_next_instruction(message_data){
    if(message_data.value == "success")
    {
        let result = message_data.result;       
        
        app.session_player.current_instruction = result.current_instruction;
        app.session_player.current_instruction_complete = result.current_instruction_complete;

        app.process_instruction_page();
        app.instruction_display_scroll();

        app.working = false;
    } 
    else
    {
        
    }
    
},

/**
 * finish instructions
 */
send_finish_instructions: function send_finish_instructions(){

    if(app.working) return;
    
    app.working = true;
    app.send_message("finish_instructions", {});
},

/**
 * finish instructions
 */
take_finish_instructions: function take_finish_instructions(message_data){
    app.working = false;
    
    if(message_data.value == "success")
    {
        let result = message_data.result;       
        
        app.session_player.instructions_finished = result.instructions_finished;
        app.session_player.current_instruction_complete = result.current_instruction_complete;
    } 
    else
    {
        
    }
},

/**
 * send_current_instruction_complete
 */
send_current_instruction_complete: function current_instruction_complete()
{
    app.send_message("current_instruction_complete", 
                     {"page_number" : app.session_player.current_instruction_complete,
                      "quiz_answers" : app.session_player.quiz_answers});
},

/**
 * process instruction page
 */
process_instruction_page: function process_instruction_page(){
    let group = app.get_current_group();

     // check if example complete show review page
    if(app.session_player.current_instruction > app.instructions.action_page_3)
    {
        group.phase = "Phase 2";
        group.worker = app.session_player.id;
        group.manager = app.session_player.id+1;
        group.player_1 = app.session_player.id+1;
        group.player_2 = app.session_player.id;
        group.manager_draw = 0.4;
        group.manager_offer = null;
        group.player_1_probability = 0.6666666666666666;
        group.player_2_probability = 0.3333333333333333;
        group.type_a_units_player_1 = app.instructions.ex1_type_a_units_player_1 - app.instructions.ex1_type_a_bid;
        group.type_a_units_player_2 = app.instructions.ex1_type_a_units_player_2 - app.instructions.ex1_type_a_bid_counterpart;
        group.type_b_units_player_1 = app.instructions.ex1_type_b_units_player_1;
        group.type_b_units_player_2 = app.instructions.ex1_type_b_units_player_2;
        group.type_a_phase_1_units_player_1 = app.instructions.ex1_type_a_bid;
        group.type_a_phase_1_units_player_2 = app.instructions.ex1_type_a_bid_counterpart;

        group.manager_offer = app.instructions.ex1_part_2_offer;

        group.manager_offer_accepted = app.instructions.ex1_part_2_accept == 1 ? "accept" : "reject";   
        group.phase = "Review";          
        group.player_2_earnings = group.manager_offer;
        group.player_1_earnings = app.get_total_value_value_string("json").profit - group.manager_offer;
        group.player_1_review_complete=true;
        group.player_2_review_complete=true;

        Vue.nextTick(() => {
            app.update_graphs();
        });
    }

    //check for quiz question that needs to be answered
    //check if current instructions is in quiz_answers and if it is not complete
    if(app.session_player.current_instruction in app.session_player.quiz_answers && 
       !app.session_player.quiz_answers[app.session_player.current_instruction].complete)
    {
        return;
    }

    //update view when instructions changes
    switch(app.session_player.current_instruction){
        case app.instructions.action_page_1:    
            return;        
            break; 
        case app.instructions.action_page_2:
            if(app.session_player.current_instruction_complete > app.instructions.action_page_2) return;
            
            group.phase = "Phase 2";
            group.worker = app.session_player.id+1;
            group.manager = app.session_player.id;
            group.player_1 = app.session_player.id;
            group.player_2 = app.session_player.id+1;
            group.manager_draw = 0.4;
            group.manager_offer = null;
            group.player_1_probability = 0.6666666666666666;
            group.player_2_probability = 0.3333333333333333;
            group.type_a_units_player_1 = app.instructions.ex1_type_a_units_player_1 - app.instructions.ex1_type_a_bid;
            group.type_a_units_player_2 = app.instructions.ex1_type_a_units_player_2 - app.instructions.ex1_type_a_bid_counterpart;
            group.type_b_units_player_1 = app.instructions.ex1_type_b_units_player_1;
            group.type_b_units_player_2 = app.instructions.ex1_type_b_units_player_2;
            group.type_a_phase_1_units_player_1 = app.instructions.ex1_type_a_bid;
            group.type_a_phase_1_units_player_2 = app.instructions.ex1_type_a_bid_counterpart;

            if(app.session_player.current_instruction_complete == app.instructions.action_page_2)
            {
                group.manager_offer = app.instructions.ex1_part_2_offer;

                Vue.nextTick(() => {
                    app.update_graphs();
                });
            }
            else if(app.session_player.current_instruction_complete < app.instructions.action_page_2)
            {
                let message_data = {
                                group: group,
                                session_player_id: app.session_player.id,
                                status: "success",
                                error_message: ""};
        
                app.take_submit_type_a_bid(message_data)
            }

            return; 
            break;
        case app.instructions.action_page_3:
            if(app.session_player.current_instruction_complete > app.instructions.action_page_3) return;

            group.phase = "Phase 2";
            group.worker = app.session_player.id;
            group.manager = app.session_player.id+1;
            group.player_1 = app.session_player.id+1;
            group.player_2 = app.session_player.id;
            group.manager_draw = 0.4;
            group.manager_offer = null;
            group.player_1_probability = 0.6666666666666666;
            group.player_2_probability = 0.3333333333333333;
            group.type_a_units_player_1 = app.instructions.ex1_type_a_units_player_1 - app.instructions.ex1_type_a_bid;
            group.type_a_units_player_2 = app.instructions.ex1_type_a_units_player_2 - app.instructions.ex1_type_a_bid_counterpart;
            group.type_b_units_player_1 = app.instructions.ex1_type_b_units_player_1;
            group.type_b_units_player_2 = app.instructions.ex1_type_b_units_player_2;
            group.type_a_phase_1_units_player_1 = app.instructions.ex1_type_a_bid;
            group.type_a_phase_1_units_player_2 = app.instructions.ex1_type_a_bid_counterpart;

            group.manager_offer = app.instructions.ex1_part_2_offer;

            Vue.nextTick(() => {
                app.update_graphs();
            });

            if(app.session_player.current_instruction_complete == app.instructions.action_page_3)
            {
                group.manager_offer_accepted = app.instructions.ex1_part_2_accept == 1 ? "accept" : "reject";
                group.phase = "Review";          
                group.player_2_earnings = group.manager_offer;
                group.player_1_earnings = app.get_total_value_value_string("json").profit - group.manager_offer;
            }
            else if(app.session_player.current_instruction_complete < app.instructions.action_page_3)
            {
                // group.player_1_review_complete=false;
            }
            return; 
            break;
        case app.instructions.action_page_4:
            return; 
            break;
        case app.instructions.action_page_5:
            return; 
            break;
        case app.instructions.action_page_6:
            return; 
            break;
    }

    if(app.session_player.current_instruction_complete < app.session_player.current_instruction)
    {
        app.session_player.current_instruction_complete = app.session_player.current_instruction;
    }

        
},

/**
 * scroll instruction into view
 */
instruction_display_scroll: function instruction_display_scroll(){
    
    if(document.getElementById("instructions_frame"))
        document.getElementById("instructions_frame").scrollIntoView();
    
    Vue.nextTick(() => {
        app.scroll_update();
    });
},

scroll_update: function scroll_update()
{
    let scroll_top = document.getElementById('instructions_frame_a').scrollTop;
    let scroll_height = document.getElementById('instructions_frame_a').scrollHeight; // added
    let offset_height = document.getElementById('instructions_frame_a').offsetHeight;

    let content_height = scroll_height - offset_height; // added
    if (content_height <= scroll_top) // modified
    {
        // Now this is called when scroll end!
        app.instruction_pages_show_scroll = false;
    }
    else
    {
        app.instruction_pages_show_scroll = true;
    }
},


/*
* send chat instructions
*/
send_chat_instructions: function send_chat_instructions(chat_text_processed)
{

    if(app.session_player.current_instruction != app.instructions.action_page_3) return;

    let message_data = {
        "status": "success",
        "text": chat_text_processed,
        "sender_id": app.session_player.id,       
        "nearby_players": [],
    };

    app.take_update_chat(message_data);
},

/**
 * show quiz question answer box
 */
show_quiz_question_answer_box: function show_quiz_question_answer_box()
{
    if(app.session_player.current_instruction in app.session_player.quiz_answers && 
       !app.session_player.quiz_answers[app.session_player.current_instruction].complete)
    {
        return true;
    }
    else
    {
        return false;
    }
},

/**
 * show quiz question is answered correctly
 */
show_quiz_question_correct_answer: function show_quiz_question_correct_answer()
{
    if(app.session_player.current_instruction in app.session_player.quiz_answers && 
       app.session_player.quiz_answers[app.session_player.current_instruction].complete)
    {
        return true;
    }
    else
    {
        return false;
    }
},

/**
 * check if quiz question is answered correctly
 */
check_quiz_question_answer: function check_quiz_question_answer()
{
    let instruction = app.instructions.instruction_pages[app.session_player.current_instruction-1];

    app.show_quiz_error = false;

    if(instruction.quiz_question)
    {
        let quiz_answers = instruction.quiz_answer.split(",");

        app.session_player.quiz_answers[app.session_player.current_instruction].answers.push(app.quiz_answer);

        if(quiz_answers.includes(app.quiz_answer.trim().toLowerCase()))
        {
            app.session_player.quiz_answers[app.session_player.current_instruction].complete = true;
        
            app.session_player.current_instruction_complete = app.session_player.current_instruction;
            app.send_current_instruction_complete();
        }
        else
        {
            app.show_quiz_error = true;
        }
    }
},