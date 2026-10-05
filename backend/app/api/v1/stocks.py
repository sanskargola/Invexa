from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.market_data import get_quote, list_quotes, search_quotes

router = APIRouter()


class Stock(BaseModel):
    symbol: str
    name: str
    exchange: str
    price: float
    change: float
    percent_change: float
    currency: str = "USD"
    tradingview_symbol: str | None = None


def _as_stock(item: dict) -> Stock:
    return Stock(
        symbol=item["symbol"],
        name=item["name"],
        exchange=item["exchange"],
        price=item["price"],
        change=item["change"],
        percent_change=item["percent_change"],
        currency=item.get("currency", "USD"),
        tradingview_symbol=item.get("tradingview_symbol"),
    )


@router.get("", response_model=list[Stock])
async def list_stocks() -> list[Stock]:
    return [_as_stock(item) for item in await run_in_threadpool(list_quotes)]


@router.get("/search", response_model=list[Stock])
async def search_stocks(q: str = "") -> list[Stock]:
    return [_as_stock(item) for item in await run_in_threadpool(search_quotes, q)]


@router.get("/{symbol}", response_model=Stock)
async def get_stock(symbol: str) -> Stock:
    try:
        return _as_stock(await run_in_threadpool(get_quote, symbol))
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error
