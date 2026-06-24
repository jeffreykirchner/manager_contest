'''
Parameterset edit form
'''

from django import forms

from main.models import ParameterSet

from main.globals import ChatGPTMode

import  main

class ParameterSetForm(forms.ModelForm):
    '''
    Parameterset edit form
    '''
    number_of_periods_paid = forms.IntegerField(label='Number of periods paid',
                                                min_value=0,
                                                initial=4,
                                                widget=forms.NumberInput(attrs={"v-model":"parameter_set.number_of_periods_paid",
                                                                                "step":"1",
                                                                                "min":"0"}))
    
    chat_gpt_mode = forms.ChoiceField(label='ChatGPT Mode',
                                      choices=ChatGPTMode.choices,
                                      widget=forms.Select(attrs={"v-model":"parameter_set.chat_gpt_mode",}))

    enable_chat = forms.ChoiceField(label='Enable Chat',
                                    choices=((1, 'Yes'), (0, 'No')),
                                    widget=forms.Select(attrs={"v-model":"parameter_set.enable_chat",}))

    show_instructions = forms.ChoiceField(label='Show Instructions',
                                          choices=((1, 'Yes'), (0,'No' )),
                                          widget=forms.Select(attrs={"v-model":"parameter_set.show_instructions",}))

    survey_required = forms.ChoiceField(label='Show Survey',
                                        choices=((1, 'Yes'), (0,'No' )),
                                        widget=forms.Select(attrs={"v-model":"parameter_set.survey_required",}))

    survey_link =  forms.CharField(label='Survey Link',
                                   required=False,
                                   widget=forms.TextInput(attrs={"v-model":"parameter_set.survey_link",}))
    
    prolific_mode = forms.ChoiceField(label='Prolific Mode',
                                      choices=((1, 'Yes'), (0,'No' )),
                                      widget=forms.Select(attrs={"v-model":"parameter_set.prolific_mode",}))

    prolific_completion_link =  forms.CharField(label='After Session, Forward Subjects to URL',
                                                required=False,
                                                widget=forms.TextInput(attrs={"v-model":"parameter_set.prolific_completion_link",}))
    
    reconnection_limit = forms.IntegerField(label='Re-connection Limit',
                                            min_value=1,
                                            widget=forms.NumberInput(attrs={"v-model":"parameter_set.reconnection_limit",
                                                                            "step":"1",
                                                                            "min":"1"}))
                                                                

    test_mode = forms.ChoiceField(label='Test Mode',
                                  choices=((1, 'Yes'), (0, 'No')),
                                  widget=forms.Select(attrs={"v-model":"parameter_set.test_mode",}))

    class Meta:
        model=ParameterSet
        fields =['number_of_periods_paid',
                 'chat_gpt_mode', 'enable_chat', 'show_instructions', 
                 'survey_required', 'survey_link', 'prolific_mode', 'prolific_completion_link', 'reconnection_limit',
                  'test_mode']

    def clean_survey_link(self):
        
        try:
           survey_link = self.data.get('survey_link')
           survey_required = int(self.data.get('survey_required'))

           if survey_required and (not survey_link or not "http" in survey_link):
               raise forms.ValidationError('Invalid link')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return survey_link
    
    def clean_prolific_completion_link(self):
        
        try:
           prolific_completion_link = self.data.get('prolific_completion_link')
           prolific_mode = int(self.data.get('prolific_mode'))

           if prolific_mode and (not prolific_completion_link or not "http" in prolific_completion_link):
               raise forms.ValidationError('Enter Prolific completion URL')
            
        except ValueError:
            raise forms.ValidationError('Invalid Entry')

        return prolific_completion_link
