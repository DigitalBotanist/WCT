from typing import Any, Optional, Dict, List, Callable
from dotenv import load_dotenv
import os

from app.agents.image_classifer_agent import ImageClassifierAgent
from app.agents.gemini_agent import GeminiLLM 
from app.models.agent import Agent
from app.models.graph import NodeType, Node, GraphState

load_dotenv()

IMAGE_API_URL = os.getenv("IMAGE_API_URL")


class WorkflowGraph:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, List[str]] = {}

    def add_node(self, node: Node):
        """
        add node to the graph with validation
        """
        if node.type == NodeType.CONDITIONAL and not node.condition_function: 
            raise ValueError(f"Conditional node {node.node_id} must have a condition_function")
        
        if node.type == NodeType.AGENT and not node.agent_name:
            raise ValueError(f"Agent node {node.node_id} must have an agent_name")

        self.nodes[node.node_id] = node

    def add_edge(self, from_node: str, to_node: str):
        """
        add edge to the graph 
        """
        if from_node not in self.nodes:
            raise ValueError(f"Source node {from_node} does not exist")
        if to_node not in self.nodes:
            raise ValueError(f"Target node {to_node} does not exist")
        
        if from_node not in self.edges:
            self.edges[from_node] = []
        self.edges[from_node].append(to_node)

    def get_next_nodes(self, node_id: str) -> List[str]: 
        return self.edges.get(node_id, [])

    def validate_graph(self):
        """
        validate the graph
        """

        # check if graph has a start and an end
        has_start = any(node.type == NodeType.START for node in self.nodes.values())
        has_end = any(node.type == NodeType.END for node in self.nodes.values())

        if not has_start:
            raise ValueError("Graph must have exactly one START node")
        if not has_end:
            raise ValueError("Graph must have at least one END node")

        # check if there are more than one start 
        start_nodes = [n for n in self.nodes.values() if n.type == NodeType.START]
        if len(start_nodes) > 1:
            raise ValueError("Graph can only have one START node")

        # check every node 
        for node_id, node in self.nodes.items(): 
            next_nodes = self.get_next_nodes(node_id)

            if node.type == NodeType.START:
                if len(next_nodes) != 1:
                    raise ValueError(f"START node must have exactly 1 outgoing edge, found {len(next_nodes)}")
            
            elif node.type == NodeType.AGENT:
                if len(next_nodes) > 1:
                    raise ValueError(f"AGENT node '{node_id}' has {len(next_nodes)} outgoing edges. Only CONDITIONAL nodes can have multiple outgoing edges.")
                # Agent nodes can have 0 or 1 next nodes
            
            elif node.type == NodeType.CONDITIONAL:
                if len(next_nodes) < 2:
                    raise ValueError(f"CONDITIONAL node '{node_id}' must have at least 2 outgoing edges for branching, found {len(next_nodes)}")
                # Conditional nodes can have 2+ edges for multi-way branching
            
            elif node.type == NodeType.END:
                if len(next_nodes) > 0:
                    raise ValueError(f"END node '{node_id}' cannot have outgoing edges")
        
        # Check for unreachable nodes
        self._check_connectivity()
        
        return True           

    def _check_connectivity(self):
        """
        check if all the nodes are reachable
        """
        visited = set()
        stack = [next(iter([nid for nid, n in self.nodes.items() if n.type == NodeType.START]))]

        while stack:
            node_id = stack.pop()
            if node_id not in visited:
                visited.add(node_id)
                stack.extend(self.get_next_nodes(node_id))
        
        unreachable = set(self.nodes.keys()) - visited
        if unreachable:
            raise ValueError(f"Unreachable nodes detected: {unreachable}")


class Orchestrator: 
    def __init__(self, agents: Dict[str, Agent], workflow_graph:WorkflowGraph):
        self.agents = agents
        self.graph = workflow_graph
        self.conditional_functions = self._register_conditional_functions()
        self.response_handlers = {}
        self._validate_setup()

    def _validate_setup(self):
        """Validate orchestrator setup"""
        if not self.graph.validate_graph():
            raise ValueError("Invalid workflow graph")

        # Check all referenced agents exist
        agent_nodes = [n for n in self.graph.nodes.values() if n.type == NodeType.AGENT]
        for node in agent_nodes:
            if node.agent_name not in self.agents:
                raise ValueError(f"Agent '{node.agent_name}' referenced in node '{node.node_id}' not found")
            
    def register_response_handler(self, response_type: str, handler: Callable): 
        self.response_handlers[response_type] = handler
    
    def _register_conditional_functions(self) -> Dict[str, Callable]:
        """Enhanced condition functions with multi-way branching support"""
        return {
            "route_by_intent": self._route_by_intent
        }

    def _route_by_intent(self, state:GraphState):
        intent = state.intent
        if intent == 'greeting':
            return 'greeting'
        elif intent == 'animal_classification':
            return 'classification_agent'
        elif intent == 'unkown': 
            return 'general_llm'
        else:
            return 'general_llm'


    async def run(self, state: GraphState, max_steps=20):
        current_node_id = next(iter([nid for nid, n in self.graph.nodes.items() if n.type == NodeType.START]))

        steps = 0
        print(f"🚀 Starting workflow with input: '{state.user_input}'")

        while current_node_id and steps < max_steps:
            steps += 1
            node = self.graph.nodes[current_node_id]

            print(f"\n📋 Step {steps}: {node.node_id} ({node.type.value})")
            
            state.add_to_path(node.node_id)
            if node.type == NodeType.START:
                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None

            elif node.type == NodeType.CONDITIONAL:
                next_node_id = self._evaluate_condition(node, state)
                state.record_decision(node.node_id, next_node_id)
                current_node_id = next_node_id
            
            elif node.type == NodeType.AGENT: 
                task = self._format_task(node.task_template, state)
                agent = self.agents[node.agent_name]
                result = await agent.process(task=task)

                state.add_result(node_id=node.node_id, result=result)
                state.add_to_path(node.node_id)

                print(f"✅ Agent '{node.agent_name}' completed task")

                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None

            elif node.type == NodeType.RESPONSE: 
                # do the response 
                previous_node_result = state.get_previous_result()

                print(previous_node_result)
                if isinstance(previous_node_result, str):
                    response_data = {
                        'type': node.response_type or 'message',
                        'content': node.response, 
                    }
                elif isinstance(previous_node_result, dict): 
                    if previous_node_result.get('success'):
                        response_data = {
                            'type': node.response_type or 'message',
                            'content': previous_node_result.get("response"), 
                        }
                    else:
                        response_data = {
                            'type': node.response_type or 'error',
                            'content': previous_node_result.get("error"), 
                        }

                # Trigger callback
                handler = self.response_handlers.get(response_data['type'])
                print("\n\nhandler",handler)
                if handler:
                    await handler(response_data)

                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None

            elif node.type == NodeType.END: 
                print("🏁 Workflow completed successfully!")
                break
            
        if steps >= max_steps:
            print("⚠️  Maximum steps reached, stopping workflow")
        
        return state

    def _evaluate_condition(self, node: Node, state: GraphState) -> str: 
        """
        evaluate the condition using condition function and
        return next node id 
        """
        # check if there is a conditional funcation
        if not node.condition_function:
            raise ValueError(f"Conditional node {node.node_id} has no condition function")

        condition_func = self.conditional_functions.get(node.condition_function)
        if not condition_func:
            raise ValueError(f"Unknown condition function: {node.condition_function}")
        
        # Get possible next nodes
        next_nodes = self.graph.get_next_nodes(node.node_id)
        if not next_nodes:
            raise ValueError(f"Conditional node {node.node_id} has no outgoing edges")
        
        # result of the conditional function
        result = condition_func(state)

        # get the next node 
        if result in next_nodes:
            return result
        else:
            # Fallback: choose first node and log warning
            print(f"⚠️  Condition returned '{result}' but not in available nodes. Choosing '{next_nodes[0]}'")
            return next_nodes[0]

    def _format_task(self, task_template: str, state: GraphState) -> Dict:
        """Format task template into a dictionary structure for agent processing"""

        previous_result = state.get_previous_result()
        if not task_template:
            return previous_result
        
        context = {
            'user_input': state.user_input or '',
            'image': state.image or '',
            'previous_result': state.get_previous_result() or '',
        }

        task_data = {}
        # Pattern 1: Just image - {"image": "path/to/image.jpg"}
        if task_template.strip() == "{image}" and context.get('image'):
            task_data['image'] = context['image']
        
        # pattern 2: just prompt
        else: 
            formatted_text = task_template
            for key, value in context.items():
                placeholder = f"{{{key}}}"
                if placeholder in formatted_text:
                    formatted_text = formatted_text.replace(placeholder, str(value))
            
            task_data['prompt'] = formatted_text

        return task_data

    @classmethod
    def get_orchestrator(cls) -> "Orchestrator":
        """
        Factory method to create and return an Orchestrator instance.
        """

        # Create agents
        agents = cls._initialize_agents()
        
        # Create workflow graph
        workflow_graph = cls._create_workflow_graph()
        
        # Create orchestrator instance
        orchestrator = cls(agents=agents, workflow_graph=workflow_graph)
        
        return orchestrator

    @staticmethod
    def _initialize_agents() -> Dict[str, Agent]:
        """Initialize and configure all agents"""
        agents = {}
        
        try:
            # Classification agent  
            agents["classification_agent"] = ImageClassifierAgent(
                url=IMAGE_API_URL
            )
            
            # General LLM agent
            agents["general_llm_agent"] =  GeminiLLM()
            
        except Exception as e:
            raise RuntimeError(f"Failed to initialize agents: {e}")
        
        return agents
    
    @staticmethod
    def _create_workflow_graph() -> WorkflowGraph:
        """Create and configure the workflow graph"""
        graph = WorkflowGraph()
        
        # Define nodes
        start_node = Node(
            node_id="start",
            type=NodeType.START
        )
        intent_node = Node(
            node_id="intent_detection",
            type=NodeType.CONDITIONAL,
            condition_function="route_by_intent"
        )
        greeting_response_node = Node(
            node_id="greeting",
            type=NodeType.RESPONSE,
            response_type="message", 
            response="Hello, How can i help you?"
        )
        classification_agent_node = Node(
            node_id="classification_agent", 
            type=NodeType.AGENT,
            agent_name="classification_agent",
            task_template="{image}"
        )
        scientific_llm_node = Node(
            node_id="scientification_llm",
            type=NodeType.AGENT,
            agent_name="general_llm_agent", 
            task_template="Provide scientific information  {previous_result} including taxonomy, habitat, and conservation status."
        ) 
        general_llm_node = Node(
            node_id="general_llm",
            type=NodeType.AGENT,
            agent_name="general_llm_agent", 
            task_template="{user_input}"
        )
        response_node = Node(
            node_id="response",
            type=NodeType.RESPONSE,
            response_type="message"
        )
        end_node = Node(
            node_id="end",
            type=NodeType.END
        )
        
        # Add nodes to graph
        graph.add_node(start_node)
        graph.add_node(intent_node)
        graph.add_node(greeting_response_node)
        graph.add_node(classification_agent_node)
        graph.add_node(scientific_llm_node)
        graph.add_node(general_llm_node)
        graph.add_node(response_node)
        graph.add_node(end_node)
        
        # Define edges
        graph.add_edge("start", "intent_detection")
        graph.add_edge("intent_detection", "greeting")
        graph.add_edge("intent_detection", "classification_agent")
        graph.add_edge("intent_detection", "general_llm")
        graph.add_edge("classification_agent", "scientification_llm") 
        graph.add_edge("general_llm", "response")
        graph.add_edge("scientification_llm", "response")
        graph.add_edge("greeting", "end")
        graph.add_edge("response", "end")
        
        return graph

# class Orchestrator: 
#     _instance = None 
#     def __init__(self, conversation_manager: ConversationManager): 
#         if Orchestrator._instance is not None: 
#             raise Exception("Use `get_instance()` to access the singleton instance.")

#         self.agent = {
#             'animal_classification': ImageClassifierAgent(url="http://localhost:8001")
#         } 

#         self.router = MessageRouter()
#         self.conversation_manager = conversation_manager
#         Orchestrator._instance = self

#     @classmethod
#     def get_orchestrator(cls, conversation_manager: ConversationManager = Depends(ConversationManager.get_conversation_manager)):
#         if cls._instance is None:
#             cls._instance = cls(conversation_manager)
#         return cls._instance

#     async def orchestrate_agents(self, websocket, session_id, user_id, data):
#                 # Get conversation history
#         # history = self.conversation_manager.get_history(session_id)
        
#         # Save user message
#         # self.conversation_manager.save_message(session_id, "user", "input", user_input)

#         request_message: ConversationMessage = self.conversation_manager.save_message(session_id=session_id, content=data.get("content"), role="user", agent_type="user")
     
#         intent, max_prob = self.router.classify_intent(data.get("content"))
#         if max_prob < 0.3:
#             response = {
#                 "type": "message",
#                 "content": "Sorry message is not clear"
#                 } 
#         elif (intent == 'greeting'):
#             response = {
#                 "type": "message",
#                 "content": "Hello how can i help you?"
#                 }

#         elif (intent == 'animal_classification'):
#             image_data = data.get('image')
#             if not image_data:
#                 response = {
#                     "type": "message",
#                     "content": f"No image is attached"
#                 }

             
#             if isinstance(image_data, str) and image_data.startswith("data:image/"):
#                 print("saving image")
#                 try:
#                     filepath = save_base64_image(image_data, save_dir="uploads/img")
#                     self.conversation_manager.save_attachments(type="img", message_id=request_message.id, attachemnts_paths=[filepath]) # save to the database 
#                     response = {
#                         "type": "image_received",
#                         "content": "Image received and processed"
#                     }

#                     agent_response = await self.agent[intent].process(task="classify", image_path=filepath, history={})

#                     response = {
#                         "type": "message",
#                         "content": f"This animal is: {agent_response['label']}"
#                     }
#                 except Exception as e:
#                     response = {
#                         "type": "error",
#                         "content": f"Failed to process image: {str(e)}"
#                     }
#         else:
#             response = {
#                 "type": "message",
#                 "content": "Sorry I can't understand"
#             }               


#         if not response: 
#             return; 
    
#         await websocket.send_json(response) 

#         self.conversation_manager.save_message(session_id=session_id, content=response["content"])
        
            


