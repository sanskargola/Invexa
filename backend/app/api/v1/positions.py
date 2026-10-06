from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.state import state
from app.services.market_data import get_quote

router = APIRouter()


class PositionItem(BaseModel):
    symbol: str
    quantity: int
    avg_cost: float
    market_price: float
    market_value: float
    pnl: float
    pnl_percent: float


@router.get("", response_model=list[PositionItem])
def list_positions() -> list[PositionItem]:
    items: list[PositionItem] = []
    for symbol, pos in list(state.positions.items()):
        try:
            quote = get_quote(symbol)
            price = float(quote["price"])
        except Exception:
            price = pos.get("avg_cost", 100.0)

        m_val = round(pos["quantity"] * price, 2)
        cost_basis = pos["quantity"] * pos["avg_cost"]
        unrealized = round(m_val - cost_basis, 2)
        pnl_pct = round((unrealized / cost_basis * 100), 2) if cost_basis else 0.0

        items.append(
            PositionItem(
                symbol=symbol,
                quantity=pos["quantity"],
                avg_cost=pos["avg_cost"],
                market_price=round(price, 2),
                market_value=m_val,
                pnl=unrealized,
                pnl_percent=pnl_pct,
            )
        )
    return items


@router.get("/{symbol}", response_model=PositionItem)
def get_position(symbol: str) -> PositionItem:
    sym = symbol.upper()
    if sym not in state.positions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No position for {sym}")
    pos = state.positions[sym]
    try:
        quote = get_quote(sym)
        price = float(quote["price"])
    except Exception:
        price = pos["avg_cost"]

    m_val = round(pos["quantity"] * price, 2)
    cost_basis = pos["quantity"] * pos["avg_cost"]
    unrealized = round(m_val - cost_basis, 2)
    pnl_pct = round((unrealized / cost_basis * 100), 2) if cost_basis else 0.0

    return PositionItem(
        symbol=sym,
        quantity=pos["quantity"],
        avg_cost=pos["avg_cost"],
        market_price=round(price, 2),
        market_value=m_val,
        pnl=unrealized,
        pnl_percent=pnl_pct,
    )


@router.post("/{symbol}/close", status_code=status.HTTP_200_OK)
def close_position(symbol: str) -> dict[str, Any]:
    order = state.close_position(symbol)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No open position for {symbol}")
    return {"status": "ok", "message": f"Position in {symbol} closed", "order": order}


@router.delete("/{symbol}", status_code=status.HTTP_200_OK)
def delete_position(symbol: str) -> dict[str, Any]:
    return close_position(symbol)
