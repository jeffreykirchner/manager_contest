from decimal import Decimal

async def get_total_group_value(group: dict, parameter_set_period: dict) -> float:
    '''
    get total value for type A units and type B units.
    value is calculated as the minumum of type A and type B units multiplied by work_payout from the ParameterSetPeriod for the current period in the world state local.
    unused type B units are worth the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    unused type A units have no value.
    if the type B are more valuable as all outside option, then the total value is the total number of type B units multiplied by the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    '''
    # parameter_set_period = await self.get_world_state_current_parameter_set_period()

    total_a_units = group["type_a_units_player_1"] + group["type_a_units_player_2"]
    total_b_units = group["type_b_units_player_1"] + group["type_b_units_player_2"]

    # calculate value for type A and type B units
    total_value = min(total_a_units, total_b_units) * Decimal(parameter_set_period["work_payout"])

    # add value for unused type B units
    unused_b_units = max(0, total_b_units - total_a_units)
    total_value += unused_b_units * Decimal(parameter_set_period["outside_option_payout"])  

    #check if all type B units are worth more than the work payout, if so calculate value as if all type B units are used for outside option
    if Decimal(parameter_set_period["outside_option_payout"]) * total_b_units > total_value:
        total_value = total_b_units * Decimal(parameter_set_period["outside_option_payout"])

    return float(total_value)

async def get_total_player_value(group: dict, player_number: int, parameter_set_period: dict) -> float:
    '''
    get total value for a player based on their type A and type B units.
    value is calculated as the minimum of the player's type A and type B units multiplied by work_payout from the ParameterSetPeriod for the current period in the world state local.
    unused type B units are worth the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    unused type A units have no value.
    if the type B are more valuable as all outside option, then the total value is the total number of type B units multiplied by the outside option payout from the ParameterSetPeriod for the current period in the world state local.
    '''
    # parameter_set_period = await self.get_world_state_current_parameter_set_period()

    if player_number == 1:
        a_units = group["type_a_units_player_1"]
        b_units = group["type_b_units_player_1"]
    else:
        a_units = group["type_a_units_player_2"]
        b_units = group["type_b_units_player_2"]

    # calculate value for type A and type B units
    total_value = min(a_units, b_units) * Decimal(parameter_set_period["work_payout"])

    # add value for unused type B units
    unused_b_units = max(0, b_units - a_units)
    total_value += unused_b_units * Decimal(parameter_set_period["outside_option_payout"])

    #check if all type B units are worth more than the work payout, if so calculate value as if all type B units are used for outside option
    if Decimal(parameter_set_period["outside_option_payout"]) * b_units > total_value:
        total_value = b_units * Decimal(parameter_set_period["outside_option_payout"])    

    return total_value