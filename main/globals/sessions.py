'''
gloabal functions related to parameter sets
'''

from django.db import models
from django.utils.translation import gettext_lazy as _

import main

class ChatTypes(models.TextChoices):
    '''
    chat types
    '''
    ALL = 'All', _('All')
    INDIVIDUAL = 'Individual', _('Individual')

class ExperimentPhase(models.TextChoices):
    '''
    experiment phases
    '''
    INSTRUCTIONS = 'Instructions', _('Instructions')
    RUN = 'Run', _('Run')
    NAMES = 'Names', _('Names')
    DONE = 'Done', _('Done')

class ChatGPTMode(models.TextChoices):
    '''
    chat gpt modes
    '''
    OFF = 'Off', _('Off')
    WITH_CONTEXT = 'With Context', _('With Context')
    WITHOUT_CONTEXT = 'Without Context', _('Without Context')

class GroupPhase(models.TextChoices):
    '''
    group phases
    '''
    PHASE_1 = 'Phase 1', _('Phase 1')
    PHASE_2 = 'Phase 2', _('Phase 2')
    REVIEW = 'Review', _('Review')
    WAITING = 'Waiting', _('Waiting')
