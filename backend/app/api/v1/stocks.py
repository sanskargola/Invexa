from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class Stock(BaseModel):
    symbol: str
    name: str
    exchange: str
    price: float
    change: float
    percent_change: float
    currency: str = "USD"


STOCKS: list[Stock] = [
    Stock(symbol="AAPL", name="Apple Inc.", exchange="NASDAQ", price=214.88, change=3.42, percent_change=1.62, currency="USD"),
    Stock(symbol="MSFT", name="Microsoft Corporation", exchange="NASDAQ", price=456.12, change=4.10, percent_change=0.91, currency="USD"),
    Stock(symbol="NVDA", name="NVIDIA Corporation", exchange="NASDAQ", price=132.45, change=7.80, percent_change=6.25, currency="USD"),
    Stock(symbol="RELIANCE", name="Reliance Industries", exchange="NSE", price=3098.65, change=74.40, percent_change=2.46, currency="INR"),
    Stock(symbol="TCS", name="Tata Consultancy Services", exchange="NSE", price=3921.15, change=44.90, percent_change=1.16, currency="INR"),
    Stock(symbol="INFY", name="Infosys", exchange="NSE", price=1844.20, change=-18.55, percent_change=-0.99, currency="INR"),
    Stock(symbol="HDFCBANK", name="HDFC Bank", exchange="NSE", price=1774.30, change=26.10, percent_change=1.49, currency="INR"),
    Stock(symbol="SBIN", name="State Bank of India", exchange="NSE", price=890.55, change=16.25, percent_change=1.86, currency="INR"),
    Stock(symbol="ITC", name="ITC Limited", exchange="NSE", price=475.80, change=5.65, percent_change=1.20, currency="INR"),
    Stock(symbol="LTIM", name="LTIMindtree", exchange="NSE", price=5704.10, change=-89.30, percent_change=-1.54, currency="INR"),
]


@router.get("", response_model=list[Stock])
def list_stocks() -> list[Stock]:
    return STOCKS


@router.get("/search")
def search_stocks(q: str = "") -> list[Stock]:
    query = (q or "").strip().lower()
    if not query:
        return STOCKS
    return [
        stock for stock in STOCKS
        if query in stock.symbol.lower() or query in stock.name.lower() or query in stock.exchange.lower()
    ]


@router.get("/{symbol}", response_model=Stock)
def get_stock(symbol: str) -> Stock:
    for stock in STOCKS:
        if stock.symbol.lower() == symbol.lower():
            return stock
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stock {symbol} not found")
