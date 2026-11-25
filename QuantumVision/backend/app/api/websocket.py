"""
Real-Time Telemetry and Disaster Broadcast WebSocket Endpoint.
"""
import asyncio
import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.logger import logger

router = APIRouter(prefix="/ws", tags=["Real-time Telemetry WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/telemetry")
async def websocket_telemetry_feed(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Broadcast simulated live telemetry every 3 seconds
            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "sensor_readings": {
                    "wildfire_thermal_mw": 840.5,
                    "flood_river_gauge_m": 8.45,
                    "seismic_pga_g": 0.14,
                    "quantum_entanglement_fidelity": 0.984
                },
                "active_responders": 24,
                "evacuation_corridors_open": 5
            }
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(websocket)
