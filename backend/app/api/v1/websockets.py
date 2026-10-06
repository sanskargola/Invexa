from __future__ import annotations

import asyncio
import json
import random
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.state import state
from app.services.market_data import DEFAULT_SYMBOLS, get_quote

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


@router.get("/status")
def websocket_status() -> dict[str, Any]:
    return {
        "enabled": True,
        "channel": "market-data",
        "active_clients": len(manager.active_connections),
    }


@router.websocket("/stream")
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        # Send initial connection acknowledgment
        await websocket.send_text(
            json.dumps({"type": "connected", "message": "Invexa live market stream connected"})
        )

        while True:
            # Check for client messages with a 2-second timeout
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=2.0)
                parsed = json.loads(data)
                if parsed.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "time": asyncio.get_event_loop().time()}))
            except asyncio.TimeoutError:
                # Periodic ticker update
                symbol = random.choice(DEFAULT_SYMBOLS[:6])
                quote = get_quote(symbol)
                # Apply tiny micro-tick simulation
                jitter = round(random.gauss(0, 0.05), 2)
                stream_price = round(float(quote["price"]) + jitter, 2)
                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "ticker",
                            "symbol": symbol,
                            "price": stream_price,
                            "change": quote["change"],
                            "percent_change": quote["percent_change"],
                            "timestamp": asyncio.get_event_loop().time(),
                        }
                    )
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
