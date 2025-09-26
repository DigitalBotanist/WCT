from abc import ABC, abstractmethod
from typing import Dict 

class Agent(ABC):
    """ base class for agents """
    def __init__(self, name: str, expertise: str): 
        self.name = name
        self.expertise = expertise

    @abstractmethod
    def process(self, context: Dict, task:str=None, history:Dict=None) -> Dict: 
        """process the task"""
        pass

    