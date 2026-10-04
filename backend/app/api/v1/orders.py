from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class Order(BaseModel):
    id: str
    symbol: str
    side: str
    quantity: int
    status: str = "pending"
    price: float


ORDERS: list[Order] = []


@router.get("", response_model=list[Order])
def list_orders() -> list[Order]:
    return ORDERS


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(order: Order) -> Order:
    ORDERS.append(order)
    return order


@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str) -> Order:
    for order in ORDERS:
        if order.id == order_id:
            return order
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
