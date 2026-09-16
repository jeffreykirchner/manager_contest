'''
parameterset period edit form
'''

from django import forms

from main.models import ParameterSetPeriod


class ParameterSetPeriodForm(forms.ModelForm):
    '''
    parameterset period edit form
    '''    
    block_number = forms.IntegerField(label='Block Number',
                                      widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.block_number",
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

    work_payout = forms.DecimalField(label='AB Price(points)',
                                        max_digits=10,
                                        decimal_places=2,
                                        widget=forms.NumberInput(attrs={"v-model": "current_parameter_set_period.work_payout",
                                                                        "step": "0.01",
                                                                        "min": "0"}))
    
    outside_option_payout = forms.CharField(label='CSV List (by pair) of B Only Prices(points)',
                                               widget=forms.TextInput(attrs={"v-model": "current_parameter_set_period.outside_option_payout",
                                                                              }))

    class Meta:
        model = ParameterSetPeriod
        fields = ['block_number', 'type_a_units_player_1', 'type_a_units_player_2', 'type_b_units_player_1', 'type_b_units_player_2', 'work_payout', 'outside_option_payout']


    #verify that the outside option payout is a valid csv list of numbers
    #verify that the length of the list is equal to the number of pairs in the parameter set period
    def clean_outside_option_payout(self):
        outside_option_payout = self.cleaned_data.get('outside_option_payout')

        if outside_option_payout:
            #split the string into a list of strings
            payout_list = outside_option_payout.split(',')
            #check that the length of the list is equal to the number of pairs in the parameter set period
            if len(payout_list) != len(self.instance.pairs):
                raise forms.ValidationError(f"Must be a CSV list of {len(self.instance.pairs)} numbers.")
            
            #check that each string can be converted to a float
            for payout in payout_list:
                try:
                    float(payout)
                except ValueError:
                    raise forms.ValidationError(f"Must be a CSV list of numbers.")
        return outside_option_payout
