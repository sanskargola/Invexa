from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class MarketQuote(BaseModel):
    symbol: str
    name: str
    exchange: str
    price: float
    change: float
    percent_change: float
    volume: int
    market_cap: float | None = None
    currency: str = "USD"


MARKET_QUOTES: list[MarketQuote] = [
    MarketQuote(symbol="AAPL", name="Apple Inc.", exchange="NASDAQ", price=214.88, change=3.42, percent_change=1.62, volume=5810000, market_cap=3200000000000, currency="USD"),
    MarketQuote(symbol="MSFT", name="Microsoft Corporation", exchange="NASDAQ", price=456.12, change=4.10, percent_change=0.91, volume=4900000, market_cap=3390000000000, currency="USD"),
    MarketQuote(symbol="NVDA", name="NVIDIA Corporation", exchange="NASDAQ", price=132.45, change=7.80, percent_change=6.25, volume=8900000, market_cap=3200000000000, currency="USD"),
    MarketQuote(symbol="RELIANCE", name="Reliance Industries", exchange="NSE", price=3098.65, change=74.40, percent_change=2.46, volume=8200000, market_cap=2120000000000, currency="INR"),
    MarketQuote(symbol="TCS", name="Tata Consultancy Services", exchange="NSE", price=3921.15, change=44.90, percent_change=1.16, volume=6400000, market_cap=1450000000000, currency="INR"),
    MarketQuote(symbol="INFY", name="Infosys", exchange="NSE", price=1844.20, change=-18.55, percent_change=-0.99, volume=5200000, market_cap=930000000000, currency="INR"),
    MarketQuote(symbol="HDFCBANK", name="HDFC Bank", exchange="NSE", price=1774.30, change=26.10, percent_change=1.49, volume=7100000, market_cap=1280000000000, currency="INR"),
    MarketQuote(symbol="SBIN", name="State Bank of India", exchange="NSE", price=890.55, change=16.25, percent_change=1.86, volume=9800000, market_cap=780000000000, currency="INR"),
]


@router.get("/overview")
def market_overview() -> dict[str, object]:
    return {
        "market_status": "open",
        "advancers": 1684,
        "decliners": 922,
        "volatility_index": 14.2,
        "total_volume": 230000000,
        "markets": ["NASDAQ", "NSE", "BSE"],
    }


@router.get("/search")
def search_quotes(q: str = "") -> list[MarketQuote]:
    query = (q or "").strip().lower()
    if not query:
        return MARKET_QUOTES
    return [
        item for item in MARKET_QUOTES
        if query in item.symbol.lower() or query in item.name.lower() or query in item.exchange.lower()
    ]


@router.get("/quotes", response_model=list[MarketQuote])
def list_quotes() -> list[MarketQuote]:
    return MARKET_QUOTES


@router.get("/quotes/{symbol}", response_model=MarketQuote)
def get_quote(symbol: str) -> MarketQuote:
    for quote in MARKET_QUOTES:
        if quote.symbol.lower() == symbol.lower():
            return quote
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quote for {symbol} not found")
