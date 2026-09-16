import logging
import random

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set

#number of times to restart the full period loop if a period can't find a valid no-repeat assignment
TAKE_SETUP_ROUND_ROBIN_PRICES_MAX_RESTARTS = 1000000

class ParameterSetPeriodsMixin():
    '''
    parameter set period mixin
    '''

    async def update_parameter_set_period(self, event):
        '''
        update a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_update_parameter_set_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def remove_parameterset_period(self, event):
        '''
        remove a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_remove_parameterset_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def add_parameterset_period(self, event):
        '''
        add a parameterset period
        '''

        message_data = {}
        message_data["status"] = await take_add_parameterset_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def setup_pairs(self, event):
        '''
        setup pairs for all periods
        '''

        message_data = {}
        message_data["status"] = await take_setup_pairs(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def setup_random_pairs(self, event):
        '''
        setup random pairs for all periods
        '''

        message_data = {}
        message_data["status"] = await take_setup_random_pairs(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def setup_round_robin_prices(self, event):
        '''
        randomize pairs (odd paired with random even) and outside option prices per period,
        avoiding repeat prices for the same player within a block
        '''

        message_data = {}
        message_data["status"] = await take_setup_round_robin_prices(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)

    async def randomize_period_order_within_block(self, event):
        '''
        randomize period order within each block
        '''

        message_data = {}
        message_data["status"] = await take_randomize_period_order_within_block(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)
    
    async def copy_forward_parameter_set_period(self, event):
        '''
        copy current period settings forward to all future periods
        '''

        message_data = {}
        message_data["status"] = await take_copy_forward_parameter_set_period(event["message_text"])
        message_data["parameter_set"] = await take_get_parameter_set(event["message_text"]["session_id"])

        await self.send_message(message_to_self=message_data, message_to_group=None,
                                message_type="update_parameter_set", send_to_client=True, send_to_group=False)


@sync_to_async
def take_update_parameter_set_period(data):
    '''
    update parameterset period
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]
    form_data = data["form_data"]

    try:
        session = Session.objects.get(id=session_id)
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_update_parameter_set_period, not found ID: {parameterset_period_id}")
        return

    form = ParameterSetPeriodForm(form_data, instance=parameter_set_period)

    if form.is_valid():
        form.save()
        parameter_set_period.parameter_set.update_json_fk(update_periods=True)

        return {"value": "success"}

    logger.warning("Invalid parameterset period form")
    return {"value": "fail", "errors": dict(form.errors.items())}


@sync_to_async
def take_remove_parameterset_period(data):
    '''
    remove the specified parameterset period
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]

    try:
        session = Session.objects.get(id=session_id)
        parameter_set_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)

    except ObjectDoesNotExist:
        logger.warning(f"take_remove_parameterset_period, not found ID: {parameterset_period_id}")
        return

    parameter_set_period.delete()

    #renumber remaining periods
    remaining_periods = session.parameter_set.parameter_set_periods.order_by("period_number")
    for i, p in enumerate(remaining_periods):
        p.period_number = i + 1
        p.save()

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

@sync_to_async
def take_add_parameterset_period(data):
    '''
    add a new parameter period to the parameter set
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]

    try:
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_add_parameterset_period session, not found ID: {session_id}")
        return {"value": "fail"}

    max_period = session.parameter_set.parameter_set_periods.aggregate(max_number=Max("period_number")).get("max_number")
    next_period = (max_period or 0) + 1

    ParameterSetPeriod.objects.create(parameter_set=session.parameter_set,
                                      period_number=next_period)
    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

@sync_to_async
def take_setup_pairs(data):
    '''
    setup pairs for all periods, pair each player with a new player each period without repeating pairs
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]

    try:
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_setup_pairs session, not found ID: {session_id}")
        return {"value": "fail"}

    players = list(session.parameter_set.parameter_set_players.order_by("player_number"))
    
    num_players = len(players)

    #create a unique set of pairs for each ParameterSetPeriod, ensuring each player is paired
    #with a new player each ParameterSetPeriod without repeating pairs
    periods = list(session.parameter_set.parameter_set_periods.order_by("period_number"))

    if num_players < 2:
        logger.warning("take_setup_pairs requires at least 2 players")
        return {"value": "fail", "errors": {"players": ["At least 2 players are required."]}}

    # Round-robin that only pairs odd-numbered players with even-numbered players.
    odd_players = [p for p in players if p.player_number % 2 == 1]
    even_players = [p for p in players if p.player_number % 2 == 0]

    for idx, period in enumerate(periods):
        round_pairs = {}
        rotation_index = idx % len(even_players) if even_players else 0
        rotation_even = even_players[rotation_index:] + even_players[:rotation_index]

        for i, odd_player in enumerate(odd_players):
            if i >= len(rotation_even):
                continue

            even_player = rotation_even[i]

            #odd players are alwas first and even player second in the pair
            round_pairs[str(i+1)] = (odd_player.id, even_player.id)

        # Persist on period using commonly used JSON/list fields if present.
        if hasattr(period, "pairs"):
            period.pairs = round_pairs
            period.save(update_fields=["pairs"])
        elif hasattr(period, "pairings"):
            period.pairings = round_pairs
            period.save(update_fields=["pairings"])
        else:
            logger.warning("ParameterSetPeriod has no supported pairs field (expected 'pairs' or 'pairings')")
            return {
                "value": "fail",
                "error_message": f"Valid pairs not found for period {period.period_number}",
            }

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

@sync_to_async
def take_setup_random_pairs(data):
    '''
    setup random pairs for all periods, repeat pairs are ok
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]
    try:
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_setup_random_pairs session, not found ID: {session_id}")
        return {"value": "fail"}
    
    periods = list(session.parameter_set.parameter_set_periods.order_by("period_number"))

    for idx, period in enumerate(periods):
        round_pairs = {}
        players = list(session.parameter_set.parameter_set_players.order_by("player_number"))
        random.shuffle(players)

        while len(players) >= 2:
            p1 = players.pop()
            p2 = players.pop()

            if random.random() < 0.5:
                round_pairs[str(len(round_pairs)+1)] = (p1.id, p2.id)
            else:
                round_pairs[str(len(round_pairs)+1)] = (p2.id, p1.id)
        
        period.pairs = round_pairs
        period.save()
    
    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

@sync_to_async
def take_setup_round_robin_prices(data):
    '''
    randomize pairs (odd player paired with a random even player) for every period, and randomize the
    assignment of the outside_option_payout values (taken from the period with the lowest period_number)
    to pairs, ensuring a player is never assigned the same value twice within the same block_number
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]

    try:
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_setup_round_robin_prices session, not found ID: {session_id}")
        return {"value": "fail"}

    players = list(session.parameter_set.parameter_set_players.order_by("player_number"))
    odd_players = [p for p in players if p.player_number % 2 == 1]
    even_players = [p for p in players if p.player_number % 2 == 0]

    if len(odd_players) != len(even_players) or not odd_players:
        logger.warning("take_setup_round_robin_prices requires an equal, non-zero number of odd and even numbered players")
        return {"value": "fail", "errors": {"players": ["An equal, non-zero number of odd and even numbered players are required."]}}

    periods = list(session.parameter_set.parameter_set_periods.all())

    if not periods:
        logger.warning("take_setup_round_robin_prices requires at least one period")
        return {"value": "fail"}

    furthest_period = 0
    #set of block numbers to process
    block_numbers = set(p.block_number for p in periods)
    reference_values = session.parameter_set.parameter_set_periods.first().outside_option_payout.split(",")

    for block_number in block_numbers:

        used_pair = {}
        periods_in_block = [p for p in periods if p.block_number == block_number]

        error_found = True
        furthest_period_reached_before_restart = 0
        fail_count = 0
        retry_count = 0
        while error_found:

            if retry_count == 1000:
                logger.warning(f"retrying from the beginning.")
                furthest_period_reached_before_restart = 0
                retry_count = 0

            #generate random pairings
            for period in periods_in_block:

                if period.period_number < furthest_period_reached_before_restart:
                    continue

                round_pairs = {}

                #randomly assign odd players to even players without repeating pairs within the same block
                random.shuffle(even_players)
                for i, odd_player in enumerate(odd_players):
                    even_player = even_players[i]
                    round_pairs[str(i+1)] = (odd_player.id, even_player.id)

                period.pairs = round_pairs
                random.shuffle(reference_values)
                period.outside_option_payout = ",".join(reference_values)
                period.save()

            error_found = False

            #check if any player has been assigned the same outside_option_payout value more than once within the block, if so break and restart the process for this block
            player_value_assignments = {}
            
            for period in periods_in_block:
               
                payouts = period.outside_option_payout.split(",")

                for pair_id, (p1_id, p2_id) in period.pairs.items():
                    payout = payouts[int(pair_id)-1]

                    if p1_id not in player_value_assignments:
                        player_value_assignments[p1_id] = set()
                    if p2_id not in player_value_assignments:
                        player_value_assignments[p2_id] = set()

                    if payout in player_value_assignments[p1_id] or payout in player_value_assignments[p2_id]:
                        #restart the process for this block
                        error_found = True
                        break
                    else:
                        player_value_assignments[p1_id].add(payout)
                        player_value_assignments[p2_id].add(payout)

                if error_found:
                    if(furthest_period_reached_before_restart < period.period_number):
                        retry_count = 0
                        furthest_period_reached_before_restart = period.period_number
                        logger.warning(f"take_setup_round_robin_prices: Restarting block {block_number}, reached period {furthest_period_reached_before_restart} before restart")
                    
                    fail_count += 1
                    retry_count += 1
                    break

            if fail_count > TAKE_SETUP_ROUND_ROBIN_PRICES_MAX_RESTARTS:
                logger.warning(f"take_setup_round_robin_prices: Failed to find valid assignment for block {block_number} after {fail_count} restarts")
                error_found = False
            elif not error_found:
                logger.warning(f"take_setup_round_robin_prices completed block {block_number} with {fail_count} restarts")
                
        #test
        break
    

    session.parameter_set.update_json_fk(update_periods=True)
    return {"value": "success"}

@sync_to_async
def take_randomize_period_order_within_block(data):
    '''
    randomize the order of periods without moving them between blocks
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]

    try:
        session = Session.objects.get(id=session_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_randomize_period_order_within_block session, not found ID: {session_id}")
        return {"value": "fail"}

    periods = list(session.parameter_set.parameter_set_periods.order_by("period_number"))
    periods_by_block = {}
    for period in periods:
        periods_by_block.setdefault(period.block_number, []).append(period)

    for block_periods in periods_by_block.values():
        period_numbers = [period.period_number for period in block_periods]
        random.shuffle(block_periods)
        for period, period_number in zip(block_periods, period_numbers):
            period.period_number = period_number
            period.save(update_fields=["period_number", "updated"])

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

@sync_to_async
def take_copy_forward_parameter_set_period(data):
    '''
    copy current period settings forward to all future periods
    '''
    logger = logging.getLogger(__name__)

    session_id = data["session_id"]
    parameterset_period_id = data["parameterset_period_id"]

    try:
        session = Session.objects.get(id=session_id)
        source_period = ParameterSetPeriod.objects.get(id=parameterset_period_id)
    except ObjectDoesNotExist:
        logger.warning(f"take_copy_forward_parameter_set_period, not found ID: {parameterset_period_id}")
        return {"value": "fail"}

    future_periods = session.parameter_set.parameter_set_periods.filter(period_number__gt=source_period.period_number)

    for period in future_periods:
        period.block_number = source_period.block_number
        period.type_a_units_player_1 = source_period.type_a_units_player_1
        period.type_a_units_player_2 = source_period.type_a_units_player_2
        period.type_b_units_player_1 = source_period.type_b_units_player_1
        period.type_b_units_player_2 = source_period.type_b_units_player_2
        period.outside_option_payout = source_period.outside_option_payout
        period.pairs = source_period.pairs
        period.save()

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

    
