'''
instruction form admin screen
'''
from django import forms
from main.models import InstructionSet
from tinymce.widgets import TinyMCE

class InstructionSetFormAdmin(forms.ModelForm):
    '''
    instruction set form admin screen
    '''

    label = forms.CharField(label='Instruction Set Name',
                            widget=forms.TextInput(attrs={"width":"300px"}))
    
    action_page_1 = forms.IntegerField(label='Required Action: 1', initial=1, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))
    action_page_2 = forms.IntegerField(label='Required Action: 2', initial=2, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))
    action_page_3 = forms.IntegerField(label='Required Action: 3', initial=3, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))
    action_page_4 = forms.IntegerField(label='Required Action: 4', initial=4, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))
    action_page_5 = forms.IntegerField(label='Required Action: 5', initial=5, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))
    action_page_6 = forms.IntegerField(label='Required Action: 6', initial=6, widget=forms.NumberInput(attrs={"min":"1", "placeholder" : "Page Number"}))

    ex1_type_a_units_player_1 = forms.IntegerField(label='Type A Units - Player 1', initial=0, widget=forms.NumberInput(attrs={"min":"0"}))
    ex1_type_a_units_player_2 = forms.IntegerField(label='Type A Units - Player 2', initial=0, widget=forms.NumberInput(attrs={"min":"0"}))
    ex1_type_b_units_player_1 = forms.IntegerField(label='Type B Units - Player 1', initial=0, widget=forms.NumberInput(attrs={"min":"0"}))
    ex1_type_b_units_player_2 = forms.IntegerField(label='Type B Units - Player 2', initial=0, widget=forms.NumberInput(attrs={"min":"0"}))
    ex1_work_payout = forms.DecimalField(label='Work Payout', max_digits=10, decimal_places=2, initial=1.00, widget=forms.NumberInput(attrs={"min":"0", "step":"0.01"}))
    ex1_outside_option_payout = forms.DecimalField(label='Outside Option Payout', max_digits=10, decimal_places=2, initial=0.75, widget=forms.NumberInput(attrs={"min":"0", "step":"0.01"}))

    class Meta:
        model=InstructionSet
        fields = ('label', 'action_page_1', 'action_page_2', 'action_page_3', 'action_page_4', 'action_page_5', 'action_page_6', 
                  'ex1_type_a_units_player_1', 'ex1_type_a_units_player_2', 'ex1_type_b_units_player_1', 'ex1_type_b_units_player_2', 
                  'ex1_work_payout', 'ex1_outside_option_payout')