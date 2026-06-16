import logging
import random

from asgiref.sync import sync_to_async

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Max

from main.models import Session
from main.models import ParameterSetPeriod

from main.forms import ParameterSetPeriodForm

from ..session_parameters_consumer_mixins.get_parameter_set import take_get_parameter_set


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

    # Round-robin (circle method): produces unique, non-repeating pairs each round.
    rotation = list(players)
    if num_players % 2 == 1:
        rotation.append(None)  # bye slot

    rounds_available = len(rotation) - 1
    if len(periods) > rounds_available:
        logger.warning("Not enough unique rounds available for requested number of periods")
        return {
            "value": "fail",
            "errors": {
                "periods": [
                    f"Only {rounds_available} unique pairing rounds are possible with {num_players} players."
                ]
            },
        }

    seen_pairs = set()

    for idx, period in enumerate(periods):
        round_pairs = {}
        half = len(rotation) // 2

        for i in range(half):
            p1 = rotation[i]
            p2 = rotation[-(i + 1)]

            if p1 is None or p2 is None:
                continue

            pair_key = tuple(sorted((p1.id, p2.id)))
            if pair_key in seen_pairs:
                logger.warning("Duplicate pair detected while generating pairs")
                return {
                    "value": "fail",
                    "error_message": f"Valid pairs not found for period {period.period_number}",
                }

            seen_pairs.add(pair_key)

            if random.random() < 0.5:
                round_pairs[str(i+1)] = (p1.id, p2.id)
            else:
                round_pairs[str(i+1)] = (p2.id, p1.id)

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

        # Rotate players for next round (keep first fixed).
        if idx < len(periods) - 1:
            rotation = [rotation[0]] + [rotation[-1]] + rotation[1:-1]

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
        period.type_a_units_player_1 = source_period.type_a_units_player_1
        period.type_a_units_player_2 = source_period.type_a_units_player_2
        period.type_b_units_player_1 = source_period.type_b_units_player_1
        period.type_b_units_player_2 = source_period.type_b_units_player_2
        period.outside_option_payout = source_period.outside_option_payout
        period.pairs = source_period.pairs
        period.save()

    session.parameter_set.update_json_fk(update_periods=True)

    return {"value": "success"}

    
