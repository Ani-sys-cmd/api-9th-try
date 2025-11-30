import random
import json
import os
import numpy as np
from typing import Dict, Any, List

class RLEngine:
    def __init__(self, storage_path: str = "storage/q_table.json"):
        self.storage_path = storage_path
        self.epsilon = 0.3  # Exploration rate (30% chance to try random new things)
        self.alpha = 0.1    # Learning rate
        self.gamma = 0.9    # Discount factor
        
        # Define the "Actions" our Agent can take to attack the API
        self.actions = [
            "standard",       # Run the test as generated (Happy Path)
            "null_injection", # Send null values for required fields
            "sql_injection",  # Try ' OR 1=1 -- types of attacks
            "overflow",       # Send massive strings (>10kb)
            "type_mismatch"   # Send integers instead of strings
        ]
        
        self.q_table = self._load_q_table()

    def _load_q_table(self) -> Dict[str, Dict[str, float]]:
        """
        Loads the Q-Table from disk so learning persists between runs.
        Structure: { "endpoint_path": { "action1": 0.0, "action2": 5.0 } }
        """
        if os.path.exists(self.storage_path):
            with open(self.storage_path, 'r') as f:
                return json.load(f)
        return {}

    def save_q_table(self):
        """Persists the agent's knowledge."""
        with open(self.storage_path, 'w') as f:
            json.dump(self.q_table, f, indent=4)

    def get_state(self, endpoint_path: str) -> str:
        """
        Simplification: The 'State' is just the specific API Endpoint we are testing.
        """
        return endpoint_path

    def choose_action(self, endpoint_path: str) -> str:
        """
        Epsilon-Greedy Strategy:
        - With probability epsilon, explore a random mutation.
        - Otherwise, exploit the best known strategy for this endpoint.
        """
        state = self.get_state(endpoint_path)
        
        # Initialize state in Q-table if new
        if state not in self.q_table:
            self.q_table[state] = {action: 0.0 for action in self.actions}

        # Exploration: Try something random
        if random.random() < self.epsilon:
            return random.choice(self.actions)
        
        # Exploitation: Choose the action with the highest Q-value
        q_values = self.q_table[state]
        best_action = max(q_values, key=q_values.get)
        return best_action

    def update_policy(self, endpoint_path: str, action: str, reward: float):
        """
        Updates the Q-Value using the Bellman Equation:
        Q(s,a) = Q(s,a) + alpha * (reward + gamma * max(Q(s',a')) - Q(s,a))
        """
        state = self.get_state(endpoint_path)
        
        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in self.actions}
            
        current_q = self.q_table[state][action]
        
        # Since the 'next state' is the same endpoint (just the next iteration),
        # we look at the max Q-value for this state currently.
        max_future_q = max(self.q_table[state].values())
        
        # Calculate new Q-value
        new_q = current_q + self.alpha * (reward + (self.gamma * max_future_q) - current_q)
        self.q_table[state][action] = new_q
        
        self.save_q_table()
        print(f"RL Update for {endpoint_path} | Action: {action} | Reward: {reward} | New Q-Val: {new_q:.2f}")

    def generate_mutation_payload(self, schema: Dict[str, Any], action: str) -> Dict[str, Any]:
        """
        Applies the chosen RL Action to mutate the request payload.
        This is called by the Test Generator/Executor before sending a request.
        """
        payload = {}
        
        # Basic valid payload generation (simplified)
        for key, value_type in schema.items():
            payload[key] = "test_string" # Default
        
        # Apply RL Mutation Logic
        if action == "standard":
            pass # Keep default valid data
            
        elif action == "null_injection":
            # Set a random field to None
            if payload:
                target_key = random.choice(list(payload.keys()))
                payload[target_key] = None
                
        elif action == "sql_injection":
            if payload:
                target_key = random.choice(list(payload.keys()))
                payload[target_key] = "' OR '1'='1"
                
        elif action == "overflow":
            if payload:
                target_key = random.choice(list(payload.keys()))
                payload[target_key] = "A" * 10000
                
        elif action == "type_mismatch":
            if payload:
                target_key = random.choice(list(payload.keys()))
                payload[target_key] = 12345 # Send int where string is expected
                
        return payload

# Example usage
if __name__ == "__main__":
    rl = RLEngine()
    
    # simulate a learning loop
    endpoint = "/api/users"
    
    # 1. Agent chooses an action
    action = rl.choose_action(endpoint)
    print(f"Agent chose strategy: {action}")
    
    # 2. Executor runs test (simulated reward)
    # Let's say 'sql_injection' caused a crash (Reward +10)
    reward = 10.0 if action == "sql_injection" else 1.0
    
    # 3. Agent learns
    rl.update_policy(endpoint, action, reward)