'''
instructions
'''

#import logging

from django.db import models

from tinymce.models import HTMLField

from main.models import InstructionSet

class Instruction(models.Model):
    '''
    instruction model
    '''

    instruction_set = models.ForeignKey(InstructionSet, on_delete=models.CASCADE, related_name="instructions")

    text_html = HTMLField(default="Text here", verbose_name="Page HTML Text")
    page_number = models.IntegerField(verbose_name='Page Number', default=1)
    quiz_question = models.BooleanField(verbose_name='Quiz Question', default=False)
    quiz_answer = models.CharField(verbose_name='Quiz Answer (CSV)', max_length=255, default="")
    
    timestamp = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.page_number}"

    class Meta:
        
        verbose_name = 'Instruction Page'
        verbose_name_plural = 'Instruction Pages'
        ordering = ['page_number']

    def from_dict(self, new_ps):
        '''
        copy source values into this instruction
        '''
        self.text_html = new_ps.get("text_html")
        self.page_number = new_ps.get("page_number")
        self.quiz_question = True if new_ps.get("quiz_question", False) else False
        self.quiz_answer = new_ps.get("quiz_answer")

        self.save()
        
    #return json object of class
    def json(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "page_number" : self.page_number,
            "text_html" : self.text_html,
            "quiz_question" : 1 if self.quiz_question else 0,
            "quiz_answer" :  self.quiz_answer,
        }
    
    #return json object of class
    async def ajson(self):
        '''
        json object of model
        '''

        return{
            "id" : self.id,         

            "page_number" : self.page_number,
            "text_html" : self.text_html,
            "quiz_question" : 1 if self.quiz_question else 0,
            "quiz_answer" : self.quiz_answer,
        }
        