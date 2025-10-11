from typing import Any, Optional, Dict, List, Callable
from dotenv import load_dotenv
import os
import logging

from app.agents.image_classifer_agent import ImageClassifierAgent
from app.agents.migration_analyzer_agent import MigrationAnalyzerAgent
from app.agents.gemini_agent import GeminiLLM
from app.agents.gemini_agent_2 import GeminiLLM2
from app.models.agent import Agent
from app.models.graph import NodeType, Node, GraphState, Result

load_dotenv()

IMAGE_API_URL = os.getenv("IMAGE_API_URL")
MIGRATION_API_URL = os.getenv("MIGRATION_API_URL")


class WorkflowGraph:
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, List[str]] = {}

    def add_node(self, node: Node):
        """
        add node to the graph with validation
        """
        logging.debug(f"adding node: {node.node_id}")
        if node.type == NodeType.CONDITIONAL and not node.condition_function: 
            raise ValueError(f"Conditional node {node.node_id} must have a condition_function")
        
        if node.type == NodeType.AGENT and not node.agent_name:
            raise ValueError(f"Agent node {node.node_id} must have an agent_name")

        self.nodes[node.node_id] = node

    def add_edge(self, from_node: str, to_node: str):
        """
        add edge to the graph 
        """
        logging.debug(f"adding edge {from_node} -> {to_node}")
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
        logging.info(f"validating graph")
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
        self.helper_functions = self._register_helper_functions()
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
            "route_by_intent": self._route_by_intent, 
            "should_generate_title": self._should_generate_title, 
        }

    def _register_helper_functions(self) -> Dict[str, Callable]: 
        return {
            "store_title_helper": self._store_title_helper,
        }

    def _store_title_helper(self, state: GraphState):
        prev_result = state.get_previous_result()
        state.title = prev_result.content
        return

    def _route_by_intent(self, state:GraphState):
        intent = state.intent
        if intent == 'greeting':
            return 'greeting'
        elif intent == 'animal_classification':
            return 'classification_agent'
        elif intent == 'migration_analyze':
            return 'migration_analyzer'
        elif intent == 'unkown': 
            return 'general_llm'
        else:
            return 'general_llm'

    def _should_generate_title(self, state: GraphState):
        """
        check if it should generate a title or not 
        """
        if state.title: 
            return 'end'
        prev_result = state.get_previous_result()
        if state.intent == 'greeting': 
            return 'done_response'
        if not prev_result: 
            return 'done_response'
        if len(prev_result.content) < 4: 
            return 'done_response'
        return 'title_generate'


    async def run(self, state: GraphState, max_steps=20):
        """
        run the orchestrator
        """
        logging.info("running the orchestrator")
        current_node_id = next(iter([nid for nid, n in self.graph.nodes.items() if n.type == NodeType.START]))

        steps = 0
        logging.info(f"Starting workflow with input: '{state.user_input.get('content')}'")

        while current_node_id and steps < max_steps:
            steps += 1
            node = self.graph.nodes[current_node_id]

            logging.info(f"📋Step {steps}: {node.node_id} ({node.type.value})")
            
            state.add_to_path(node.node_id)
            if node.type == NodeType.START:
                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None
            elif node.type == NodeType.HELPER:
                self._run_helper(node=node, state=state)
                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None                

            elif node.type == NodeType.CONDITIONAL:
                next_node_id = self._evaluate_condition(node, state)
                state.record_decision(node.node_id, next_node_id)
                current_node_id = next_node_id
                logging.debug(f"🔀 Conditional branching to: {current_node_id}")
            
            elif node.type == NodeType.AGENT: 
                task = self._format_task(node.task_template, state)
                agent = self.agents[node.agent_name]
                result = await agent.process(task=task)

                state.add_result(node_id=node.node_id, result=result)
                state.add_to_path(node.node_id)

                logging.info(f"✅ Agent '{node.agent_name}' completed task")

                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None

            elif node.type == NodeType.RESPONSE: 
                # do the response 
                logging.debug(f"response node: {node.node_id}")
                previous_node_result = state.get_previous_result()

                # logging.debug(f"previous response: {previous_node_result}")
                logging.debug(f"response data type: {type(previous_node_result)}")

                if not previous_node_result:
                    response_data = {
                        'type': node.response_type or 'message',
                        'content': node.response, 
                    }
                elif node.response_type == 'title': 
                    response_data = {
                        'type': node.response_type or 'message',
                        'content': previous_node_result.content, 
                    }
                elif isinstance(previous_node_result, str):
                    response_data = {
                        'type': node.response_type or 'message',
                        'content': previous_node_result
                    }
                elif isinstance(previous_node_result, Result): 
                    if node.response_type == 'animal':
                        response_data = {
                            'type': node.response_type or 'message',
                            'content': 'animal',
                            'animal': previous_node_result.content, 
                        }
                    elif node.node_id == 'migration_analyzer_response' and previous_node_result.success:
                        response_data = {
                            'type': node.response_type or 'message',
                            'content': node.response,
                            'data': previous_node_result.content
                        }
                        print(response_data.get("content"))
                    elif node.response_type == 'status':
                        response_data = {
                            'type': node.response_type,
                            'content': node.response,
                        }
                    elif previous_node_result.success:
                        response_data = {
                            'type': node.response_type or 'message',
                            'content': previous_node_result.content or node.response, 
                        }
                    else:
                        response_data = {
                            'type': node.response_type or 'error',
                            'content': previous_node_result.content or node.response, 
                        }
                else:
                    logging.error("response node received nothing")
                    response_data = {
                        'type': node.response_type or 'error',
                        'content': "error occured", 
                    }

                # logging.debug(f"response_data: {response_data}")
                # Trigger callback
                handler = self.response_handlers.get(response_data['type'])
                logging.debug(f"handler found: {handler is not None}")
                if handler:
                    await handler(response_data)

                next_nodes = self.graph.get_next_nodes(current_node_id)
                current_node_id = next_nodes[0] if next_nodes else None

                logging.debug(f"response node is done")
            elif node.type == NodeType.END: 
                logging.info("🏁 Workflow completed successfully!")
                break
            
        if steps >= max_steps:
            print("⚠️  Maximum steps reached, stopping workflow")
        
        return state
    
    def _run_helper(self, node: Node, state: GraphState): 
        if not node.helper_function:
            raise ValueError(f"Helper node {node.node_id} has no helper function")
        
        helper_func = self.helper_functions.get(node.helper_function)
        if not helper_func:
            raise ValueError(f"Unknown helper function: {node.helper_function}")
         
        helper_func(state)

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
            return {}

        session_context = state.context

        session_context.pop('image', None)
        session_context.pop('initial_message', None)
        context = {
            'user_input': state.user_input or '',
            'image': state.image or '',
            'csv': state.csv or '',
            'prev_result_content': previous_result.content if previous_result else '',
            'context': session_context
        }

        task_data = {}
        # Pattern 1: Just image - {"image": "path/to/image.jpg"}
        if task_template.strip() == "{image}" and context.get('image'):
            task_data['image'] = context['image']

        # Pattern 2: Just csv - {"csv": Attachment}
        if task_template.strip() == "{csv}":
            task_data['csv'] = state.csv
        # pattern: just prompt
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
            agents["general_llm_agent_2"] =  GeminiLLM2()
            agents["migration_analyzer_agent"] = MigrationAnalyzerAgent(
                url=MIGRATION_API_URL
            )
            
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
        animal_info_node = Node(
            node_id="animal_info",
            type=NodeType.AGENT,
            agent_name="general_llm_agent", 
            task_template="""Provide scientific information  {prev_result_content}. as a json file 
            name: 
            scientific_name:
            phylum: 
            class: 
            order:
            family:
            genus:
            species:
            locations:
            climate: (only one word)
            diet: (few words like zebra, grass, bugs)
            
            and return ONLY the json file."""
        ) 
        animal_info_response_node = Node(
            node_id="animal_info_response",
            type=NodeType.RESPONSE,
            response_type="animal", 
        )
        migration_analyzer_agent_node = Node (
            node_id="migration_analyzer", 
            type=NodeType.AGENT,
            agent_name="migration_analyzer_agent",
            task_template="{csv}"
        )
        migration_analyzer_response_node = Node(
            node_id="migration_analyzer_response",
            type=NodeType.RESPONSE,
            response_type="migration",
            response="Migration Analyze" 
        )
        summary_llm_node = Node(
            node_id="summary_llm",
            type=NodeType.AGENT,
            agent_name="general_llm_agent", 
            task_template="""
            context: {context}
            user request: {user_input} give me a summary. 
            
            bot:
            researching....
            research data: {prev_result_content}

            if there not enough data do research and generate the bot reply(summary). return only the reply.
            """
        )
        general_llm_node = Node(
            node_id="general_llm",
            type=NodeType.AGENT,
            agent_name="general_llm_agent_2", 
            task_template="""
            context: {context}
            user request: {user_input}
            
            bot: (bot reply)

            if there not enough data do research yourself and generate the bot reply. and return only the reply
            """
        )
        response_node = Node(
            node_id="response",
            type=NodeType.RESPONSE,
            response_type="message"
        )
        title_agent_node = Node(
            node_id="title_generate",
            type=NodeType.AGENT,
            agent_name="general_llm_agent_2",
            task_template="generate small title for: {prev_result_content}. return ONLY the title please"
        )
        should_title_node = Node(
            node_id="should_title",
            type=NodeType.CONDITIONAL,
            condition_function="should_generate_title"
        )
        store_title_node = Node(
            node_id="store_title",
            type=NodeType.HELPER,
            helper_function="store_title_helper"
        )
        title_response_node = Node(
            node_id="title_response",
            type=NodeType.RESPONSE,
            response_type="title"
        )
        done_response_node = Node(
            node_id="done_response", 
            type=NodeType.RESPONSE,
            response_type="status",
            response="done"
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
        graph.add_node(animal_info_node)
        graph.add_node(animal_info_response_node)
        graph.add_node(migration_analyzer_agent_node)
        graph.add_node(migration_analyzer_response_node)
        graph.add_node(summary_llm_node)
        graph.add_node(general_llm_node)
        graph.add_node(response_node)
        graph.add_node(title_agent_node)
        graph.add_node(should_title_node)
        graph.add_node(store_title_node)
        graph.add_node(title_response_node)
        graph.add_node(done_response_node)
        graph.add_node(end_node)
        
        # Define edges
        graph.add_edge("start", "intent_detection")
        graph.add_edge("intent_detection", "greeting")
        graph.add_edge("intent_detection", "classification_agent")
        graph.add_edge("intent_detection", "migration_analyzer")
        graph.add_edge("intent_detection", "general_llm")
        graph.add_edge("classification_agent", "animal_info") 
        graph.add_edge("animal_info", "animal_info_response")
        graph.add_edge("migration_analyzer", "migration_analyzer_response")
        graph.add_edge("migration_analyzer_response", "done_response")
        graph.add_edge("animal_info_response", "summary_llm")
        graph.add_edge("summary_llm", "response")
        graph.add_edge("general_llm", "response")
        graph.add_edge("greeting", "done_response")
        graph.add_edge("response", "should_title")
        graph.add_edge("should_title", "title_generate")
        graph.add_edge("should_title", "done_response")
        graph.add_edge("title_generate", "store_title")
        graph.add_edge("store_title", "title_response")
        graph.add_edge("title_response", "done_response")
        graph.add_edge("done_response", "end")
        
        return graph
