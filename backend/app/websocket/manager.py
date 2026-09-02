from typing import Dict, Set
import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.vehicle_subscriptions: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"✅ WebSocket connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        for vehicle_id in list(self.vehicle_subscriptions.keys()):
            self.vehicle_subscriptions[vehicle_id].discard(websocket)
            if not self.vehicle_subscriptions[vehicle_id]:
                del self.vehicle_subscriptions[vehicle_id]
        print(f"❌ WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: str):
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)
    
    async def broadcast_to_vehicle(self, vehicle_id: str, message: str):
        if vehicle_id in self.vehicle_subscriptions:
            disconnected = set()
            for connection in self.vehicle_subscriptions[vehicle_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    disconnected.add(connection)
            
            for conn in disconnected:
                self.disconnect(conn)
    
    def subscribe_vehicle(self, websocket: WebSocket, vehicle_id: str):
        if vehicle_id not in self.vehicle_subscriptions:
            self.vehicle_subscriptions[vehicle_id] = set()
        self.vehicle_subscriptions[vehicle_id].add(websocket)
        print(f"📡 Client subscribed to vehicle: {vehicle_id}")
    
    def unsubscribe_vehicle(self, websocket: WebSocket, vehicle_id: str):
        if vehicle_id in self.vehicle_subscriptions:
            self.vehicle_subscriptions[vehicle_id].discard(websocket)
            if not self.vehicle_subscriptions[vehicle_id]:
                del self.vehicle_subscriptions[vehicle_id]
            print(f"📡 Client unsubscribed from vehicle: {vehicle_id}")

manager = ConnectionManager()