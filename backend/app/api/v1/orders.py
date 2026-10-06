from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.state import state

router = APIRouter()


class OrderPayload(BaseModel):
    symbol: str
    side: str = Field(description="'Buy' or 'Sell'")
    quantity: int = Field(gt=0)
    type: str = Field(default="Market", description="'Market' or 'Limit' or 'Stop'")
    price: Optional[float] = None


class OrderResponse(BaseModel):
    id: str
    symbol: str
    side: str
    quantity: int
    type: str
    price: float
    status: str
    created_at: str
    filled_at: Optional[str] = None


@router.get("", response_model=list[OrderResponse])
def list_orders(status_filter: Optional[str] = Query(None, alias="status")) -> list[OrderResponse]:
    orders = state.orders
    if status_filter:
        orders = [o for o in orders if o.get("status", "").lower() == status_filter.lower()]
    return [OrderResponse(**o) for o in orders]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderPayload) -> OrderResponse:
    order = state.place_order(
        symbol=payload.symbol,
        side=payload.side,
        quantity=payload.quantity,
        order_type=payload.type,
        price=payload.price,
    )
    return OrderResponse(**order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str) -> OrderResponse:
    for order in state.orders:
        if order["id"] == order_id:
            return OrderResponse(**order)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")


@router.delete("/{order_id}", status_code=status.HTTP_200_OK)
def cancel_order(order_id: str) -> dict[str, str]:
    success = state.cancel_order(order_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled or was not found in open status",
        )
    return {"status": "ok", "message": f"Order {order_id} cancelled"}
