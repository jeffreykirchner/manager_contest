import logging

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
