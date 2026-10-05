from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.market_data import get_news, get_quote, get_sentiment, list_quotes, market_overview, search_quotes

router = APIRouter()


class MarketQuote(BaseModel):
    symbol: str
    yahoo_symbol: str | None = None
    tradingview_symbol: str | None = None
    name: str
    exchange: str
    price: float
    change: float
    percent_change: float
    volume: int
    market_cap: float | None = None
    currency: str = "USD"


class SentimentSignal(BaseModel):
    symbol: str
    score: float
    label: str
    percent_change: float = 0
    headline_count: int = 0


class NewsItem(BaseModel):
    title: str
    publisher: str
    link: str = ""
    published: str = ""
    symbol: str


@router.get("/overview")
async def get_market_overview() -> dict[str, object]:
    try:
        return await run_in_threadpool(market_overview)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error


@router.get("/search", response_model=list[MarketQuote])
async def search_market_quotes(q: str = "") -> list[MarketQuote]:
    items = await run_in_threadpool(search_quotes, q)
    return [MarketQuote(**item) for item in items]


@router.get("/quotes", response_model=list[MarketQuote])
async def get_quotes() -> list[MarketQuote]:
    items = await run_in_threadpool(list_quotes)
    return [MarketQuote(**item) for item in items]


@router.get("/quotes/{symbol}", response_model=MarketQuote)
async def get_market_quote(symbol: str) -> MarketQuote:
    try:
        item = await run_in_threadpool(get_quote, symbol)
        return MarketQuote(**item)
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error


@router.get("/news/{symbol}", response_model=list[NewsItem])
async def get_market_news(symbol: str) -> list[NewsItem]:
    items = await run_in_threadpool(get_news, symbol)
    return [NewsItem(**item) for item in items]


@router.get("/sentiment/{symbol}", response_model=SentimentSignal)
async def get_market_sentiment(symbol: str) -> SentimentSignal:
    return SentimentSignal(**(await run_in_threadpool(get_sentiment, symbol)))
