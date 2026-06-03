'''
parameterset period edit form
'''

from django import forms

from main.models import ParameterSetPeriod


class ParameterSetPeriodForm(forms.ModelForm):
    '''
    parameterset period edit form
    '''

    period_number = forms.IntegerField(label='Period Number',
                                       min_value=1,
                                       widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.period_number",
                                                                       "step": "1",
                                                                       "min": "1"}))
    
    type_a_units_player_1 = forms.IntegerField(label='Type A Units Player 1',
                                         widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.type_a_units_player_1",
                                                                        "step": "1",
                                                                        "min": "0"}))
    
    type_a_units_player_2 = forms.IntegerField(label='Type A Units Player 2',
                                         widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.type_a_units_player_2",
                                                                        "step": "1",
                                                                        "min": "0"}))   
    
    type_b_units_player_1 = forms.IntegerField(label='Type B Units Player 1',
                                         widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.type_b_units_player_1",
                                                                        "step": "1",
                                                                        "min": "0"}))

    type_b_units_player_2 = forms.IntegerField(label='Type B Units Player 2',
                                         widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.type_b_units_player_2",
                                                                        "step": "1",
                                                                        "min": "0"}))
    
    outside_option_payout = forms.DecimalField(label='Outside Option Payout($)',
                                               max_digits=10,
                                               decimal_places=2,
                                               widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.outside_option_payout",
                                                                              "step": "0.01",
                                                                              "min": "0"}))

    class Meta:
        model = ParameterSetPeriod
        fields = ['period_number', 'type_a_units_player_1', 'type_a_units_player_2', 'type_b_units_player_1', 'type_b_units_player_2', 'outside_option_payout']
