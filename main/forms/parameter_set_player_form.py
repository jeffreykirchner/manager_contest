'''
parameterset player edit form
'''

from django import forms

from main.models import ParameterSetPlayer
from main.models import InstructionSet

class ParameterSetPlayerForm(forms.ModelForm):
    '''
    parameterset player edit form
    '''
    
    instruction_set = forms.ModelChoiceField(label='instruction_set',
                                             empty_label=None,
                                             queryset=InstructionSet.objects.all(),
                                             widget=forms.Select(attrs={"v-model":"current_parameter_set_player.instruction_set",}))

    exchange_rate = forms.IntegerField(label='Exchange Rate (Points per $1)',
                                       initial=100,
                                       widget=forms.NumberInput(attrs={"v-model":"current_parameter_set_player.exchange_rate",}))

    class Meta:
        model=ParameterSetPlayer
        fields =['instruction_set', 'exchange_rate']
    
