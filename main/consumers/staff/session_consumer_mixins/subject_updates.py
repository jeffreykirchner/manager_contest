
import logging
import math
import json
import random

from decimal import Decimal
from datetime import datetime, timedelta

from django.utils.html import strip_tags

from main.models import SessionPlayer
from main.models import Session
from main.models import SessionEvent

from main.globals import ExperimentPhase
from main.globals import GroupPhase
from main.globals import is_non_negative_int
from main.globals import get_total_player_value
from main.globals import get_total_group_value
from main.globals import is_non_negative_float_with_2_decimal_places

import main

class SubjectUpdatesMixin():
    '''
    subject updates mixin for staff session consumer
    '''

    async def chat(self, event):
        '''
        take chat from client
        '''    
        if self.controlling_channel != self.channel_name:
            return    
       
        logger = logging.getLogger(__name__) 
        # logger.info(f"take chat: Session ")
        
        status = "success"
        error_message = ""
        player_id = None

        if status == "success":
            try:
                player_id = self.session_players_local[event["player_key"]]["id"]
                event_data = event["message_text"]
                current_location = event_data["current_location"]
            except:
                logger.warning(f"chat: invalid data, {event['message_text']}")
                status = "fail"
                error_message = "Invalid data."
        
        target_list = [player_id]

        if status == "success":
            if not self.world_state_local["started"] or \
            self.world_state_local["finished"] or \
            self.world_state_local["current_experiment_phase"] != ExperimentPhase.RUN:
                logger.warning(f"take chat: failed, session not started, finished, or not in run phase")
                status = "fail"
                error_message = "Session not started."
        
        result = {"status": status, "error_message": error_message}
        result["sender_id"] = player_id

        if status == "success":
            session_player = self.world_state_local["session_players"][str(player_id)]
            session_player["current_location"] = current_location
            
            result["text"] = strip_tags(event_data["text"])
            result["nearby_players"] = []

            #format text for chat bubbles
            # wrapper = TextWrapper(width=13, max_lines=6)
            # result['text'] = wrapper.fill(text=result['text'])

            #find nearby players
            session_players = self.world_state_local["session_players"]
            for i in session_players:
                if i != str(result["sender_id"]):
                    source_pt = [session_players[str(result["sender_id"])]["current_location"]["x"], session_players[str(result["sender_id"])]["current_location"]["y"]]
                    target_pt = [session_players[i]["current_location"]["x"], session_players[i]["current_location"]["y"]]
                    
                    if math.dist(source_pt, target_pt) <= 1000:
                        result["nearby_players"].append(i)

            self.session_events.append(SessionEvent(session_id=self.session_id, 
                                                    session_player_id=result["sender_id"],
                                                    type="chat",
                                                    period_number=self.world_state_local["current_period"],
                                                    data=result))
            
            target_list = self.world_state_local["session_players_order"]

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False, 
                                send_to_group=True, target_list=target_list)

    async def update_chat(self, event):
        '''
        send chat to clients, if clients can view it
        '''
        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_connection_status(self, event):
        '''
        handle connection status update from group member
        '''
        logger = logging.getLogger(__name__) 
        event_data = event["data"]

        #update not from a client
        if event_data["value"] == "fail":
            if not self.session_id:
                self.session_id = event["session_id"]

            # logger.info(f"update_connection_status: event data {event}, channel name {self.channel_name}, group name {self.room_group_name}")

            if "session" in self.room_group_name:
                #connection from staff screen
                if event["connect_or_disconnect"] == "connect":
                    # session = await Session.objects.aget(id=self.session_id)
                    self.controlling_channel = event["sender_channel_name"]

                    if self.channel_name == self.controlling_channel:
                        # logger.info(f"update_connection_status: controller {self.channel_name}, session id {self.session_id}")
                        await Session.objects.filter(id=self.session_id).aupdate(controlling_channel=self.controlling_channel) 
                        await self.send_message(message_to_self=None, message_to_group={"controlling_channel" : self.controlling_channel},
                                                message_type="set_controlling_channel", send_to_client=False, send_to_group=True)
                else:
                    #disconnect from staff screen
                    pass                   
            return
        
        subject_id = event_data["result"]["id"]

        session_player = await SessionPlayer.objects.aget(id=subject_id)
        event_data["result"]["name"] = session_player.name
        event_data["result"]["student_id"] = session_player.student_id
        event_data["result"]["current_instruction"] = session_player.current_instruction
        event_data["result"]["survey_complete"] = session_player.survey_complete
        event_data["result"]["instructions_finished"] = session_player.instructions_finished

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_set_controlling_channel(self, event):
        '''
        only for subject screens
        '''
        pass

    async def update_name(self, event):
        '''
        send update name notice to staff screens
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_next_instruction(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_finish_instructions(self, event):
        '''
        send instruction status to staff
        '''

        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_survey_complete(self, event):
        '''
        send survey complete update
        '''
        event_data = event["data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_process_chat_gpt_prompt(self, event):
        '''
        process chat gpt prompt from subject consumer
        '''
        event_data = event["staff_data"]

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    async def update_clear_chat_gpt_history(self, event):
        '''
        clear chat gpt history from subject consumer
        '''
        event_data = event["staff_data"]

        player_id = event_data["session_player_id"]     
        session_player = self.world_state_local["session_players"][str(player_id)]
        parameter_set_player = self.parameter_set_local["parameter_set_players"][str(session_player["parameter_set_player_id"])]

        # store event
        self.session_events.append(SessionEvent(session_id=self.session_id, 
                                    session_player_id=player_id,
                                    type="clear_chat_gpt_history",
                                    period_number=self.world_state_local["current_period"],
                                    data=event_data,))
    
    async def show_help_doc(self, event):
        '''
        subject requests help doc from subject screen, also show on their group members screens
        '''

        logger = logging.getLogger(__name__)

        event_data =  event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        world_state = self.world_state_local
        
        result = {"help_doc" : event_data["help_doc"],
                  "session_player_id" : player_id,
                  "value" : "success"}

        self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=world_state["current_period"],
                                                    data=result))

        # logger.info(f"show_help_doc: player {player_id} requested help doc {event_data['help_doc']}")

        await self.send_message(message_to_self=None, message_to_group=result,
                                message_type=event['type'], send_to_client=False,
                                send_to_group=True, target_list=[player_id])
    
    async def update_show_help_doc(self, event):
        '''
        update show help doc from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def submit_type_a_bid(self, event):
        '''
        subject submits type a bid from subject screen
        '''

        status = "success"
        error_message = ""

        event_data = event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        world_state = self.world_state_local
        parameter_set_period = await self.get_world_state_current_parameter_set_period()

        type_a_bid = event_data["type_a_bid"]
        type_a_bid_counterpart = event_data["type_a_bid_counterpart"]

        group = await self.get_world_state_group(player_id)
        player_number = await self.get_world_state_player_number(player_id)

        group["type_a_phase_1_units_player_" + str(player_number)] = type_a_bid
        group["type_a_phase_1_units_player_" + str(player_number) + "_prediction"] = type_a_bid_counterpart

        player_1_bid = group["type_a_phase_1_units_player_1"]
        player_2_bid = group["type_a_phase_1_units_player_2"]

        #check if bid is a non-negative integer
        if not is_non_negative_int(type_a_bid):
            status = "fail"
            error_message = "Invalid entry for your bid."
        
        #check if prediction is a non-negative integer
        if status == "success":
            if not is_non_negative_int(type_a_bid_counterpart):
                status = "fail"
                error_message = "Invalid entry for your prediction."

        #check if bid is less than or equal to the inventory of type a units for the player
        if status == "success":     
            type_a_units_player = group["type_a_units_player_" + str(player_number)]
            if type_a_bid > type_a_units_player:
                status = "fail"
                error_message = f"Bid must be less than or equal to {type_a_units_player} (your inventory of type A units)."
        
        #check if prediction is less than or equal to the inventory of type a units for them
        if status == "success":   
            temp_player_number = 2 if player_number == 1 else 1  
            type_a_units_player_counterpart = group["type_a_units_player_" + str(temp_player_number)]
            if type_a_bid_counterpart > type_a_units_player_counterpart:
                status = "fail"
                error_message = f"Prediction must be less than or equal to {type_a_units_player_counterpart} (counterpart's inventory of type A units)."

        #check if both players in the group have submitted their type a bid, if so, process the bids and determine the manager for the next period
        #if the probability of player 1 winning is player 1's bid / (player 1's bid + player 2's bid), then we can randomly determine the winner based on that probability
        #if both players have a zero bid then we can randomly determine the winner with equal probability
        start_phase_2 = False
        if status == "success":
            if player_1_bid is not None and player_2_bid is not None:   
                start_phase_2 = True     
                if player_1_bid == 0 and player_2_bid == 0:
                    player_1_win_probability = 0.5
                else:
                    player_1_win_probability = player_1_bid / (player_1_bid + player_2_bid)
                    
                group["player_1_probability"] = player_1_win_probability
                group["player_2_probability"] = 1 - player_1_win_probability
                group["manager_draw"] = random.random()

                player_1_win = group["manager_draw"] < player_1_win_probability
                
                if player_1_win:
                    group["manager"] = group["player_1"]
                    group["worker"] = group["player_2"]
                else:
                    group["manager"] = group["player_2"]
                    group["worker"] = group["player_1"]

                group["phase"] = GroupPhase.PHASE_2
                group["type_a_units_player_1"] -= player_1_bid
                group["type_a_units_player_2"] -= player_2_bid

                group["player_1_total_value"] = await get_total_player_value(group, 1, parameter_set_period)
                group["player_2_total_value"] = await get_total_player_value(group, 2, parameter_set_period)
                group["group_total_value"] =  await get_total_group_value(group, parameter_set_period)
        
        result = {"group" : group,
                  "session_player_id" : player_id,
                  "status" : status,
                  "error_message" : error_message}
        
        if status == "success":
            #store event and update world state in database
            await self.store_world_state(force_store=True)
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                        session_player_id=player_id,
                                                        type=event['type'],
                                                        period_number=world_state["current_period"],
                                                        data={"result": result, "event_data": event_data}))
            await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
            self.session_events = []

        if start_phase_2:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[group["player_1"], group["player_2"]])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        
    async def update_submit_type_a_bid(self, event):
        '''
        update type a bid from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def submit_manager_offer_to_worker(self, event):
        '''
        subject submits manager offer to worker from subject screen
        '''

        status = "success"
        error_message = ""

        event_data = event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        world_state = self.world_state_local

        manager_offer_to_worker = event_data["manager_offer_to_worker"]

        group = await self.get_world_state_group(player_id)
        player_number = await self.get_world_state_player_number(player_id)

        if group["manager"] != player_id:
            status = "fail"
            error_message = "Only the manager can submit an offer."
        
        #check if offer is a non-negative integer
        if status == "success":
            if not is_non_negative_float_with_2_decimal_places(manager_offer_to_worker):
                status = "fail"
                error_message = "Invalid entry."

        #check if offer exceeds the total group value
        if status == "success":
            if Decimal(manager_offer_to_worker) > Decimal(group["group_total_value"]):
                status = "fail"
                error_message = f"Offer exceeds total group profit of ${group['group_total_value']:.2f}."

        if status == "success":
            group["manager_offer"] = manager_offer_to_worker

        result = {"group" : group,
                  "session_player_id" : player_id,
                  "status" : status,
                  "error_message" : error_message}
        
        if status == "success":
            #store event and update world state in database
            await self.store_world_state(force_store=True)
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                        session_player_id=player_id,
                                                        type=event['type'],
                                                        period_number=world_state["current_period"],
                                                        data={"result": result, "event_data": event_data}))
            await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
            self.session_events = []

            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[group["manager"], group["worker"]])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
    
    async def update_submit_manager_offer_to_worker(self, event):
        '''
        update manager offer to worker from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def submit_worker_response_to_manager(self, event):
        '''
        subject submits worker response to manager offer from subject screen
        '''
        status = "success"
        error_message = ""

        event_data = event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        world_state = self.world_state_local

        worker_response_to_manager = event_data["worker_response_to_manager"]

        group = await self.get_world_state_group(player_id)
        player_number = await self.get_world_state_player_number(player_id)

        if group["worker"] != player_id:
            status = "fail"
            error_message = "Only the worker can submit a response."

        if status == "success":
            if worker_response_to_manager not in ["accept", "reject"]:
                status = "fail"
                error_message = "Invalid response. Please enter 'accept' or 'reject'."
        
        if status == "success":
            group["manager_offer_accepted"] = worker_response_to_manager

            if group["manager_offer_accepted"] == "accept":

                if group["player_1"] == group["manager"]:
                    group["player_1_earnings"] =  Decimal(group["group_total_value"]) - Decimal(group["manager_offer"])
                    group["player_2_earnings"] = Decimal(group["manager_offer"])
                else:
                    group["player_2_earnings"] =  Decimal(group["group_total_value"]) - Decimal(group["manager_offer"])
                    group["player_1_earnings"] = Decimal(group["manager_offer"])
            else:
                group["player_1_earnings"] = group["player_1_total_value"]
                group["player_2_earnings"] = group["player_2_total_value"]
            
            group["phase"] = GroupPhase.REVIEW
        
        result = {"group" : group,
                  "session_player_id" : player_id,
                  "status" : status,
                  "error_message" : error_message}
        
        if status == "success":
            #store event and update world state in database
            await self.store_world_state(force_store=True)
            self.session_events.append(SessionEvent(session_id=self.session_id,
                                                        session_player_id=player_id,
                                                        type=event['type'],
                                                        period_number=world_state["current_period"],
                                                        data={"result": result, "event_data": event_data}))
            await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
            self.session_events = []

            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[group["manager"], group["worker"]])
        else:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])

    async def update_submit_worker_response_to_manager(self, event):
        '''
        update worker response to manager offer from subject screen
        '''

        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def ready_to_go_on(self, event):
        '''
        the ready to go on button is clicked
        '''
        status = "success"
        error_message = ""

        event_data = event["message_text"]
        player_id = self.session_players_local[event["player_key"]]["id"]
        world_state = self.world_state_local

        group = await self.get_world_state_group(player_id)
        player_number = await self.get_world_state_player_number(player_id)
        session_period = await self.get_world_state_current_session_period()

        group["player_" + str(player_number) + "_review_complete"] = True

        #check if all players have completed their review in all groups
        all_players_review_complete = True
        for g in session_period["groups"].values():
            if not all(g.get(f"player_{i}_review_complete", False) for i in [1, 2]):
                all_players_review_complete = False
                break

        result = {"group" : group,
                  "session_player_id" : player_id,
                  "status" : status,
                  "error_message" : error_message}
            
        #store event and update world state in database
        await self.store_world_state(force_store=True)
        self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type=event['type'],
                                                    period_number=world_state["current_period"],
                                                    data={"result": result, "event_data": event_data}))
        await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
        self.session_events = []
        
        if not all_players_review_complete:
            await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type=event['type'], send_to_client=False,
                                    send_to_group=True, target_list=[player_id])
        else:
            #start next period or end the experiment if this is the last period

            if world_state["current_period"] < len(world_state["session_periods_order"]):
                world_state["current_period"] += 1
                await self.store_world_state(force_store=True)

                result = {"current_period": world_state["current_period"]}

                self.session_events.append(SessionEvent(session_id=self.session_id,
                                                    session_player_id=player_id,
                                                    type="start_next_period",
                                                    period_number=world_state["current_period"],
                                                    data={"result": result, "event_data": event_data}))
                await SessionEvent.objects.abulk_create(self.session_events, ignore_conflicts=True)
                self.session_events = []

                await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type="start_next_period", send_to_client=False,
                                    send_to_group=True)
            else:
                
                #randomly select N session_periods from the experiment to pay the subjects on, where N is determined by the parameter set number_of_periods_paid
                number_of_periods_paid = self.parameter_set_local["number_of_periods_paid"]

                periods_paid = random.sample(self.world_state_local["session_periods_order"], min(number_of_periods_paid, len(self.world_state_local["session_periods_order"])))

                for p in periods_paid:
                    session_period = self.world_state_local["session_periods"][str(p)]                    
                    session_period["paid"] = True

                for session_player_id in self.world_state_local["session_players_order"]:
                    session_player = self.world_state_local["session_players"][str(session_player_id)]
                    session_player["earnings"] = 0

                    for p in periods_paid:
                        session_period = self.world_state_local["session_periods"][str(p)]
                        group_id = session_period["group_map"][str(session_player_id)]
                        group = session_period["groups"][str(group_id)]

                        if group["player_1"] == session_player_id:
                            session_player["earnings"] = Decimal(str(session_player["earnings"])) + Decimal(str(group["player_1_earnings"]))
                        elif group["player_2"] == session_player_id:
                            session_player["earnings"] = Decimal(str(session_player["earnings"])) + Decimal(str(group["player_2_earnings"]))

                self.world_state_local["current_experiment_phase"] = ExperimentPhase.NAMES
                
                await self.store_world_state(force_store=True)

                result = {"periods_paid": periods_paid,
                          "session_player_id" : player_id,
                          "session_players": self.world_state_local["session_players"],
                          "current_experiment_phase": self.world_state_local["current_experiment_phase"]}

                await self.send_message(message_to_self=None, message_to_group=result,
                                    message_type="end_game", send_to_client=False,
                                    send_to_group=True)
    
    async def update_ready_to_go_on(self, event):
        '''
        update the ready to go on status for a session player
        '''
        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
    
    async def update_end_game(self, event):
        '''
        update the end game status for a session player
        '''
        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)
        
    async def update_start_next_period(self, event):
        '''
        update the start next period status for a session player
        '''
        event_data = json.loads(event["group_data"])

        await self.send_message(message_to_self=event_data, message_to_group=None,
                                message_type=event['type'], send_to_client=True, send_to_group=False)

    # helpers
    async def get_world_state_current_session_period(self):
        '''
        get current session period for a session player id from the world state local
        '''
        session_period_id = self.world_state_local["session_periods_order"][self.world_state_local["current_period"]-1]
        session_period = self.world_state_local["session_periods"][str(session_period_id)]

        return session_period

    async def get_world_state_current_parameter_set_period(self):
        '''
        get current parameter set period for a session player id from the world state local
        '''
        session_period = await self.get_world_state_current_session_period()
        parameter_set_period_id = session_period["parameter_set_period_id"]
        parameter_set_period = self.parameter_set_local["parameter_set_periods"][str(parameter_set_period_id)]

        return parameter_set_period

    async def get_world_state_group(self, session_player_id):
        '''
        get group id for a session player id for the current period from the world state local
        '''
        session_period = await self.get_world_state_current_session_period()
        group_id = session_period["group_map"][str(session_player_id)]
        group = session_period["groups"][str(group_id)]

        return group

    async def get_world_state_player_number(self, session_player_id):
        '''
        get player number for a session player id for the current period from the world state local
        '''
        group = await self.get_world_state_group(session_player_id)

        if group["player_1"] == session_player_id:
            return 1

        return 2
                                      
    

                                
        

