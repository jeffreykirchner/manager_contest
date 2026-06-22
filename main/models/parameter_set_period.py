'''
parameterset period
'''

from django.db import models

from main.models import ParameterSet


class ParameterSetPeriod(models.Model):
    '''
    parameter set period
    '''

    parameter_set = models.ForeignKey(ParameterSet, on_delete=models.CASCADE, related_name="parameter_set_periods")

    period_number = models.IntegerField(verbose_name='Period Number', default=1)

    type_a_units_player_1 = models.IntegerField(verbose_name='Type A Player 1', default=0)            #starting number of type a units for player 1
    type_a_units_player_2 = models.IntegerField(verbose_name='Type A Player 2', default=0)            #starting number of type a units for player 2    
    type_b_units_player_1 = models.IntegerField(verbose_name='Type B Player 1', default=0)            #starting number of type b units for player 1
    type_b_units_player_2 = models.IntegerField(verbose_name='Type B Player 2', default=0)            #starting number of type b units for player 2

    work_payout = models.DecimalField(verbose_name='Work Payout', max_digits=10, decimal_places=2, default=1.00)                       #payout per unit of work, for both types and both players 
    outside_option_payout = models.DecimalField(verbose_name='Outside Option Payout', max_digits=10, decimal_places=2, default=0.75)   #payout for outside option, for type b units

    pairs = models.JSONField(verbose_name='Pairs', default=dict)  #store pairs for this period, format {"pair number": ()}

    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.period_number}"

    class Meta:
        verbose_name = 'Parameter Set Period'
        verbose_name_plural = 'Parameter Set Periods'
        ordering = ['period_number']
        # constraints = [
        #     models.UniqueConstraint(fields=['parameter_set', 'period_number'], name='unique_parameter_set_period_number')
        # ]

    def from_dict(self, new_ps):
        '''
        copy source values into this period
        source : dict object of parameterset period
        '''

        self.period_number = new_ps.get("period_number", self.period_number)
 
        self.type_a_units_player_1 = new_ps.get("type_a_units_player_1", self.type_a_units_player_1)
        self.type_a_units_player_2 = new_ps.get("type_a_units_player_2", self.type_a_units_player_2)
        self.type_b_units_player_1 = new_ps.get("type_b_units_player_1", self.type_b_units_player_1)
        self.type_b_units_player_2 = new_ps.get("type_b_units_player_2", self.type_b_units_player_2)

        self.work_payout = new_ps.get("work_payout", self.work_payout)
        self.outside_option_payout = new_ps.get("outside_option_payout", self.outside_option_payout)

        self.pairs = new_ps.get("pairs", self.pairs)

        self.save()

        message = "Parameters loaded successfully."

        return message

    def setup(self):
        '''
        default setup
        '''
        self.save()

    def update_json_local(self):
        '''
        update parameter set json
        '''
        self.parameter_set.json_for_session["parameter_set_periods"][str(self.id)] = self.json()

        self.parameter_set.save()

        self.save()

    def json(self):
        '''
        return json object of model
        '''

        return {
            "id": self.id,
            "period_number": self.period_number,
  
            "type_a_units_player_1": self.type_a_units_player_1,
            "type_a_units_player_2": self.type_a_units_player_2,
            "type_b_units_player_1": self.type_b_units_player_1,
            "type_b_units_player_2": self.type_b_units_player_2,

            "work_payout": self.work_payout,
            "outside_option_payout": self.outside_option_payout,
            "pairs": self.pairs,
        }

    def get_json_for_subject(self, update_required=False):
        '''
        return json object for subject screen, return cached version if unchanged
        '''

        return self.json()
