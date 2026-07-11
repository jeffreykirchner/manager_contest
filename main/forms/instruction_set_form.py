'''
instruction set form
'''
from django import forms
from main.models import InstructionSet

class InstructionSetForm(forms.ModelForm):
    '''
    instruction set form 
    '''

    label = forms.CharField(label='Instruction Set Name',
                            widget=forms.TextInput(attrs={"width":"300px",
                                                          "v-model":"instruction_set.label",
                                                          "placeholder" : "Instruction Set Name"}))
    
    action_page_1 = forms.IntegerField(label='Required Action: Phase 1 bid', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                       "v-model":"instruction_set.action_page_1",
                                                                       "placeholder" : "Page Number"}))
    
    action_page_2 = forms.IntegerField(label='Required Action: Phase 2 manager', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                        "v-model":"instruction_set.action_page_2",
                                                                       "placeholder" : "Page Number"}))
    
    action_page_3 = forms.IntegerField(label='Required Action: Phase 2 non-manager', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                       "v-model":"instruction_set.action_page_3",
                                                                       "placeholder" : "Page Number"}))
    
    action_page_4 = forms.IntegerField(label='Required Action: 4', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                       "v-model":"instruction_set.action_page_4",
                                                                       "placeholder" : "Page Number"}))
    
    action_page_5 = forms.IntegerField(label='Required Action: 5', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                       "v-model":"instruction_set.action_page_5",
                                                                       "placeholder" : "Page Number"}))
    
    action_page_6 = forms.IntegerField(label='Required Action: 6', 
                                       widget=forms.NumberInput(attrs={"min":"1", 
                                                                       "v-model":"instruction_set.action_page_6",
                                                                       "placeholder" : "Page Number"}))
    
    ex1_type_a_units_player_1 = forms.IntegerField(label='Ex1 Type A Units - Player 1',
                                                  widget=forms.NumberInput(attrs={"min":"0",
                                                                                  "v-model":"instruction_set.ex1_type_a_units_player_1"}))
    
    ex1_type_a_units_player_2 = forms.IntegerField(label='Ex1 Type A Units - Player 2',
                                                  widget=forms.NumberInput(attrs={"min":"0",
                                                                                  "v-model":"instruction_set.ex1_type_a_units_player_2"}))
    
    ex1_type_b_units_player_1 = forms.IntegerField(label='Ex1 Type B Units - Player 1',
                                                  widget=forms.NumberInput(attrs={"min":"0",
                                                                                  "v-model":"instruction_set.ex1_type_b_units_player_1"}))  
    
    ex1_type_b_units_player_2 = forms.IntegerField(label='Ex1 Type B Units - Player 2',
                                                  widget=forms.NumberInput(attrs={"min":"0",
                                                                                  "v-model":"instruction_set.ex1_type_b_units_player_2"}))
    
    ex1_work_payout = forms.DecimalField(label='Ex1 Work Payout', max_digits=10, decimal_places=2,
                                        widget=forms.NumberInput(attrs={"min":"0", 
                                                                        "step":"0.01",
                                                                        "v-model":"instruction_set.ex1_work_payout"}))
    
    ex1_outside_option_payout = forms.DecimalField(label='Ex1 Outside Option Payout', max_digits=10, decimal_places=2,
                                                  widget=forms.NumberInput(attrs={"min":"0",
                                                                                  "step":"0.01",
                                                                                  "v-model":"instruction_set.ex1_outside_option_payout"}))

    class Meta:
        model=InstructionSet
        fields = ('label', 'action_page_1', 'action_page_2', 'action_page_3', 'action_page_4', 'action_page_5', 'action_page_6',
                  'ex1_type_a_units_player_1', 'ex1_type_a_units_player_2', 'ex1_type_b_units_player_1', 'ex1_type_b_units_player_2', 
                  'ex1_work_payout', 'ex1_outside_option_payout')