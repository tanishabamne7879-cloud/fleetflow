from fastapi import WebSocket, WebSocketDisconnect, APIRouter
import json
import asyncio
from datetime import datetime
from app.websocket.manager import manager
from app.services.redis_service import redis_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        # Send connection success message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": "WebSocket connected successfully",
            "timestamp": datetime.utcnow().isoformat()
        }))
        
        while True:
            try:
                # Receive message with timeout
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                
                try:
                    message = json.loads(data)
                    msg_type = message.get("type")
                    
                    if msg_type == "ping":
                        await websocket.send_text(json.dumps({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        }))
                    
                    elif msg_type == "location_update":
                        location_data = message.get("data", {})
                        vehicle_id = location_data.get("vehicle_id")
                        
                        if vehicle_id:
                            # Save to Redis
                            redis_service.set(
                                f"vehicle_location_{vehicle_id}",
                                location_data,
                                60
                            )
                            
                            # Broadcast to all clients
                            broadcast_msg = json.dumps({
                                "type": "location_update",
                                "data": location_data
                            })
                            await manager.broadcast(broadcast_msg)
                    
                    elif msg_type == "subscribe":
                        vehicle_id = message.get("vehicle_id")
                        if vehicle_id:
                            manager.subscribe_vehicle(websocket, vehicle_id)
                            await websocket.send_text(json.dumps({
                                "type": "subscribed",
                                "vehicle_id": vehicle_id
                            }))
                    
                    elif msg_type == "unsubscribe":
                        vehicle_id = message.get("vehicle_id")
                        if vehicle_id:
                            manager.unsubscribe_vehicle(websocket, vehicle_id)
                            await websocket.send_text(json.dumps({
                                "type": "unsubscribed",
                                "vehicle_id": vehicle_id
                            }))
                
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }))
                
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                try:
                    await websocket.send_text(json.dumps({
                        "type": "ping",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                except Exception:
                    break
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)