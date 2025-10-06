from typing import Any, Optional, Dict, List, Callable
from enum import Enum
from dataclasses import dataclass, field

class NodeType(Enum):
    START = "start"
    AGENT = "agent" 
    CONDITIONAL = "conditional"
    RESPONSE = "response"
    HELPER = "helper"
    END = "end"

@dataclass
class Node: 
    node_id: str
    type: NodeType
    agent_name: Optional[str] = None
    task_template: Optional[str] = None
    description: Optional[str] = None
    response_type: Optional[str] = None
    response: Optional[str] = None

    # Conditional nodes specific
    condition_function: Optional[str] = None
    condition_args: Optional[Dict[str, Any]] = None
    # For parallel execution support (future enhancement)
    is_parallel: bool = False

    helper_function: Optional[str] = None

@dataclass
class Result:
    success: bool
    content: str
    data: Optional[dict] = None
    details: Optional[str] = None

@dataclass
class GraphState:
    # Input data
    user_input: Dict 
    intent: str
    message_id: Optional[str] = None
    user_id: Optional[str] = None
    title: str = None
    
    # Dynamic data
    image: Optional[str] = None
    raw_data: Dict[str, Any] = field(default_factory=dict)
    
    # Execution data
    results: Dict[str, Any] = field(default_factory=dict)
    execution_path: List[str] = field(default_factory=list)
    branch_decisions: Dict[str, str] = field(default_factory=dict)
    
    # Metadata
    session_id: Optional[str] = None

    # Methods
    def add_result(self, node_id: str, result: Any):
        self.results[node_id] = result
    
    def add_to_path(self, step: str):
        self.execution_path.append(step)
    
    def record_decision(self, node_id: str, decision: str):
        self.branch_decisions[node_id] = decision
    
    def get_previous_result(self) -> Result:
        """Get result from the most recently executed node"""
        if not self.results:
            return None
        return next(reversed(self.results.values()))
