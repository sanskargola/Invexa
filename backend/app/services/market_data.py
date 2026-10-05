from __future__ import annotations

import math
import threading
import time
from typing import Any

import pandas as pd
import yfinance as yf

NSE_SYMBOLS = {
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "SBIN",
    "ITC",
    "LTIM",
    "WIPRO",
    "BHARTIARTL",
    "ICICIBANK",
    "HINDUNILVR",
    "AXISBANK",
    "KOTAKBANK",
    "BAJFINANCE",
}

DEFAULT_SYMBOLS = [
    "AAPL",
    "MSFT",
    "NVDA",
    "TSLA",
    "AMZN",
    "GOOGL",
    "META",
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "SBIN",
]

KNOWN_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "NVDA": "NVIDIA Corporation",
    "TSLA": "Tesla, Inc.",
    "AMZN": "Amazon.com, Inc.",
    "GOOGL": "Alphabet Inc.",
    "META": "Meta Platforms, Inc.",
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "INFY.NS": "Infosys Limited",
    "HDFCBANK.NS": "HDFC Bank",
    "SBIN.NS": "State Bank of India",
}

TIMEFRAMES: dict[str, dict[str, str]] = {
    "1m": {"interval": "1m", "period": "1d"},
    "5m": {"interval": "5m", "period": "5d"},
    "15m": {"interval": "15m", "period": "5d"},
    "30m": {"interval": "30m", "period": "1mo"},
    "1H": {"interval": "60m", "period": "1mo"},
    "4H": {"interval": "60m", "period": "3mo", "resample": "4h"},
    "1D": {"interval": "1d", "period": "1y"},
    "1W": {"interval": "1wk", "period": "5y"},
    "1M": {"interval": "1mo", "period": "max"},
}

INTRADAY = {"1m", "5m", "15m", "30m", "1H", "4H"}

_CACHE: dict[str, tuple[float, Any]] = {}
_LOCK = threading.Lock()


def _cached(key: str, ttl: float, factory):
    now = time.time()
    with _LOCK:
        hit = _CACHE.get(key)
        if hit and hit[0] > now:
            return hit[1]
    value = factory()
    with _LOCK:
        _CACHE[key] = (now + ttl, value)
    return value


def resolve_yahoo_symbol(symbol: str) -> str:
    raw = (symbol or "").strip().upper()
    if not raw:
        raise ValueError("Symbol is required")
    if raw.endswith((".NS", ".BO", ".L", ".TO")) or "." in raw:
        return raw
    if raw in NSE_SYMBOLS:
        return f"{raw}.NS"
    return raw


def display_symbol(yahoo_symbol: str) -> str:
    symbol = yahoo_symbol.upper()
    for suffix in (".NS", ".BO"):
        if symbol.endswith(suffix):
            return symbol[: -len(suffix)]
    return symbol


def tradingview_symbol(yahoo_symbol: str, exchange: str = "") -> str:
    symbol = display_symbol(yahoo_symbol)
    yahoo = yahoo_symbol.upper()
    exchange_name = (exchange or "").upper()
    if yahoo.endswith(".NS") or exchange_name in {"NSE", "NSI", "NATIONAL STOCK EXCHANGE OF INDIA"}:
        return f"NSE:{symbol}"
    if yahoo.endswith(".BO") or exchange_name in {"BSE", "BOM"}:
        return f"BSE:{symbol}"
    if exchange_name in {"NYSE", "NYQ"}:
        return f"NYSE:{symbol}"
    if exchange_name in {"AMEX", "NYSEARCA", "ARCA", "PCX"}:
        return f"AMEX:{symbol}"
    return f"NASDAQ:{symbol}"


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if not math.isfinite(number):
        return default
    return number


def _safe_int(value: Any) -> int:
    return int(_safe_float(value, 0))


def _column(frame: pd.DataFrame, name: str) -> pd.Series | None:
    if name in frame.columns:
        return frame[name]
    matches = [column for column in frame.columns if str(column).lower() == name.lower()]
    if matches:
        return frame[matches[0]]
    if isinstance(frame.columns, pd.MultiIndex):
        for column in frame.columns:
            parts = [str(part).lower() for part in (column if isinstance(column, tuple) else (column,))]
            if name.lower() in parts:
                return frame[column]
    return None


def _exchange_for(yahoo_symbol: str) -> str:
    if yahoo_symbol.endswith(".NS"):
        return "NSE"
    if yahoo_symbol.endswith(".BO"):
        return "BSE"
    return "NASDAQ"


def _currency_for(yahoo_symbol: str) -> str:
    return "INR" if yahoo_symbol.endswith((".NS", ".BO")) else "USD"


def _quote_payload(
    yahoo_symbol: str,
    *,
    price: float,
    previous_close: float,
    volume: int,
    name: str = "",
    exchange: str = "",
    market_cap: float | None = None,
) -> dict[str, Any]:
    change = price - previous_close
    percent_change = (change / previous_close * 100) if previous_close else 0.0
    shown = display_symbol(yahoo_symbol)
    return {
        "symbol": shown,
        "yahoo_symbol": yahoo_symbol,
        "tradingview_symbol": tradingview_symbol(yahoo_symbol, exchange),
        "name": name or KNOWN_NAMES.get(yahoo_symbol, shown),
        "exchange": exchange or _exchange_for(yahoo_symbol),
        "price": round(price, 4),
        "change": round(change, 4),
        "percent_change": round(percent_change, 4),
        "volume": volume,
        "market_cap": market_cap,
        "currency": _currency_for(yahoo_symbol),
    }


def _quote_from_frame(yahoo_symbol: str, frame: pd.DataFrame) -> dict[str, Any]:
    close_col = _column(frame, "Close")
    volume_col = _column(frame, "Volume")
    if close_col is None:
        raise LookupError(f"No market data for {yahoo_symbol}")
    closes = close_col.dropna()
    if closes.empty:
        raise LookupError(f"No market data for {yahoo_symbol}")
    price = _safe_float(closes.iloc[-1])
    previous = _safe_float(closes.iloc[-2], price) if len(closes) >= 2 else price
    volume = _safe_int(volume_col.dropna().iloc[-1] if volume_col is not None and not volume_col.dropna().empty else 0)
    return _quote_payload(yahoo_symbol, price=price, previous_close=previous, volume=volume)


def _history_frame(yahoo_symbol: str, period: str, interval: str) -> pd.DataFrame:
    frame = yf.download(
        yahoo_symbol,
        period=period,
        interval=interval,
        auto_adjust=True,
        progress=False,
        threads=False,
        timeout=15,
    )
    if frame is None or frame.empty:
        ticker = yf.Ticker(yahoo_symbol)
        frame = ticker.history(period=period, interval=interval, auto_adjust=True, actions=False, timeout=15)
    if frame is None or frame.empty:
        raise LookupError(f"No market data for {yahoo_symbol}")
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = [str(column[0]).title() if isinstance(column, tuple) else str(column) for column in frame.columns]
    return frame.dropna(how="all")


def _quote_from_ticker(symbol: str) -> dict[str, Any]:
    yahoo_symbol = resolve_yahoo_symbol(symbol)
    frame = yf.download(yahoo_symbol, period="5d", interval="1d", auto_adjust=True, progress=False, threads=False, timeout=12)
    if frame is None or frame.empty:
        ticker = yf.Ticker(yahoo_symbol)
        frame = ticker.history(period="5d", interval="1d", auto_adjust=True, actions=False, timeout=12)
    if frame is None or frame.empty:
        raise LookupError(f"No market data for {yahoo_symbol}")
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = [str(column[0]).title() if isinstance(column, tuple) else str(column) for column in frame.columns]
    quote = _quote_from_frame(yahoo_symbol, frame)
    try:
        ticker = yf.Ticker(yahoo_symbol)
        fast = dict(ticker.fast_info or {})
        last_price = _safe_float(fast.get("lastPrice") or fast.get("last_price"), quote["price"])
        previous = _safe_float(fast.get("previousClose") or fast.get("previous_close"), quote["price"] - quote["change"])
        volume = _safe_int(fast.get("lastVolume") or fast.get("last_volume") or quote["volume"])
        market_cap = _safe_float(fast.get("marketCap") or fast.get("market_cap"), 0.0) or None
        currency = str(fast.get("currency") or quote["currency"])
        exchange = str(fast.get("exchange") or quote["exchange"])
        quote = _quote_payload(
            yahoo_symbol,
            price=last_price,
            previous_close=previous,
            volume=volume,
            name=quote["name"],
            exchange=exchange,
            market_cap=market_cap,
        )
        quote["currency"] = currency
        quote["tradingview_symbol"] = tradingview_symbol(yahoo_symbol, exchange)
    except Exception:
        pass
    return quote


def get_quote(symbol: str) -> dict[str, Any]:
    yahoo_symbol = resolve_yahoo_symbol(symbol)
    return _cached(f"quote:{yahoo_symbol}", 20, lambda: _quote_from_ticker(yahoo_symbol))


def list_quotes(symbols: list[str] | None = None) -> list[dict[str, Any]]:
    selected = [resolve_yahoo_symbol(symbol) for symbol in (symbols or DEFAULT_SYMBOLS)]

    def load() -> list[dict[str, Any]]:
        quotes: list[dict[str, Any]] = []
        joined = " ".join(selected)
        frame = yf.download(joined, period="5d", interval="1d", group_by="ticker", auto_adjust=True, threads=True, progress=False, timeout=18)
        for yahoo_symbol in selected:
            try:
                if frame is None or frame.empty:
                    quotes.append(get_quote(yahoo_symbol))
                    continue
                if len(selected) == 1:
                    subset = frame
                elif isinstance(frame.columns, pd.MultiIndex) and yahoo_symbol in frame.columns.get_level_values(0):
                    subset = frame[yahoo_symbol]
                elif yahoo_symbol in getattr(frame, "columns", []):
                    subset = frame
                else:
                    quotes.append(get_quote(yahoo_symbol))
                    continue
                quotes.append(_quote_from_frame(yahoo_symbol, subset))
            except Exception:
                continue
        return quotes

    return _cached(f"quotes:{','.join(selected)}", 20, load)


def search_quotes(query: str = "") -> list[dict[str, Any]]:
    normalized = (query or "").strip()
    if not normalized:
        return list_quotes()

    matches: list[dict[str, Any]] = []
    try:
        results = yf.Search(normalized, max_results=10).quotes or []
        for item in results:
            symbol = str(item.get("symbol") or "")
            if not symbol:
                continue
            yahoo_symbol = resolve_yahoo_symbol(symbol)
            exchange = str(item.get("exchDisp") or item.get("exchange") or _exchange_for(yahoo_symbol))
            matches.append(
                _quote_payload(
                    yahoo_symbol,
                    price=0.0,
                    previous_close=0.0,
                    volume=0,
                    name=str(item.get("shortname") or item.get("longname") or display_symbol(yahoo_symbol)),
                    exchange=exchange,
                )
            )
    except Exception:
        matches = []

    if matches:
        priced = list_quotes([item["yahoo_symbol"] for item in matches[:8]])
        by_symbol = {item["yahoo_symbol"]: item for item in priced}
        merged: list[dict[str, Any]] = []
        for item in matches:
            live = by_symbol.get(item["yahoo_symbol"])
            merged.append({**item, **live} if live else item)
        return merged

    universe = list_quotes()
    needle = normalized.lower()
    return [
        item
        for item in universe
        if needle in item["symbol"].lower() or needle in item["name"].lower() or needle in item["exchange"].lower()
    ]


def _candle_time(index: pd.Timestamp, timeframe: str) -> int | str:
    stamp = pd.Timestamp(index)
    if stamp.tzinfo is None:
        stamp = stamp.tz_localize("UTC")
    else:
        stamp = stamp.tz_convert("UTC")
    if timeframe in INTRADAY:
        return int(stamp.timestamp())
    return stamp.strftime("%Y-%m-%d")


def get_candles(symbol: str, timeframe: str = "1D") -> dict[str, Any]:
    selected = timeframe if timeframe in TIMEFRAMES else "1D"
    config = TIMEFRAMES[selected]
    yahoo_symbol = resolve_yahoo_symbol(symbol)

    def load() -> dict[str, Any]:
        frame = _history_frame(yahoo_symbol, config["period"], config["interval"])
        resample = config.get("resample")
        if resample:
            frame = (
                frame.resample(resample)
                .agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"})
                .dropna()
            )

        open_col = _column(frame, "Open")
        high_col = _column(frame, "High")
        low_col = _column(frame, "Low")
        close_col = _column(frame, "Close")
        volume_col = _column(frame, "Volume")
        if open_col is None or high_col is None or low_col is None or close_col is None:
            raise LookupError(f"Incomplete OHLC data for {yahoo_symbol}")

        candles: list[dict[str, Any]] = []
        seen: set[int | str] = set()
        for index, open_price, high, low, close, volume in zip(
            frame.index,
            open_col,
            high_col,
            low_col,
            close_col,
            volume_col if volume_col is not None else [0] * len(frame),
        ):
            if any(pd.isna(value) for value in (open_price, high, low, close)):
                continue
            candle_time = _candle_time(index, selected)
            if candle_time in seen:
                continue
            seen.add(candle_time)
            candles.append(
                {
                    "time": candle_time,
                    "open": round(_safe_float(open_price), 4),
                    "high": round(_safe_float(high), 4),
                    "low": round(_safe_float(low), 4),
                    "close": round(_safe_float(close), 4),
                    "volume": round(_safe_float(volume), 2),
                }
            )

        if not candles:
            raise LookupError(f"No candles for {yahoo_symbol}")

        last_close = candles[-1]["close"]
        previous = candles[-2]["close"] if len(candles) >= 2 else last_close
        quote = _quote_payload(yahoo_symbol, price=last_close, previous_close=previous, volume=_safe_int(candles[-1]["volume"]))
        return {
            **quote,
            "timeframe": selected,
            "last_price": last_close,
            "candles": candles,
        }

    return _cached(f"candles:{yahoo_symbol}:{selected}", 45, load)


def get_fundamentals(symbol: str) -> dict[str, Any]:
    yahoo_symbol = resolve_yahoo_symbol(symbol)

    def load() -> dict[str, Any]:
        ticker = yf.Ticker(yahoo_symbol)
        info: dict[str, Any] = {}
        try:
            info = ticker.info or {}
        except Exception:
            info = {}
        try:
            fast = dict(ticker.fast_info or {})
        except Exception:
            fast = {}
        pe = _safe_float(info.get("trailingPE") or info.get("forwardPE"), 0.0)
        market_cap = _safe_float(fast.get("marketCap") or info.get("marketCap"), 0.0)
        return {
            "symbol": display_symbol(yahoo_symbol),
            "yahoo_symbol": yahoo_symbol,
            "name": str(info.get("shortName") or info.get("longName") or KNOWN_NAMES.get(yahoo_symbol, display_symbol(yahoo_symbol))),
            "sector": str(info.get("sector") or "—"),
            "industry": str(info.get("industry") or "—"),
            "pe_ratio": round(pe, 2),
            "forward_pe": round(_safe_float(info.get("forwardPE"), 0.0), 2),
            "market_cap": market_cap,
            "revenue_growth": round(_safe_float(info.get("revenueGrowth"), 0.0), 4),
            "profit_margin": round(_safe_float(info.get("profitMargins"), 0.0), 4),
            "eps": round(_safe_float(info.get("trailingEps"), 0.0), 4),
            "dividend_yield": round(_safe_float(info.get("dividendYield"), 0.0), 4),
            "beta": round(_safe_float(info.get("beta"), 0.0), 4),
            "fifty_two_week_high": round(_safe_float(info.get("fiftyTwoWeekHigh") or fast.get("yearHigh"), 0.0), 4),
            "fifty_two_week_low": round(_safe_float(info.get("fiftyTwoWeekLow") or fast.get("yearLow"), 0.0), 4),
            "summary": str(info.get("longBusinessSummary") or "")[:600],
        }

    return _cached(f"fundamentals:{yahoo_symbol}", 300, load)


def get_technicals(symbol: str) -> dict[str, Any]:
    yahoo_symbol = resolve_yahoo_symbol(symbol)

    def load() -> dict[str, Any]:
        frame = _history_frame(yahoo_symbol, "6mo", "1d")
        close = _column(frame, "Close")
        if close is None or close.empty:
            raise LookupError(f"No technical data for {yahoo_symbol}")
        series = close.dropna()
        delta = series.diff()
        gain = delta.clip(lower=0).rolling(14).mean()
        loss = (-delta.clip(upper=0)).rolling(14).mean()
        rs = gain / loss.replace(0, pd.NA)
        rsi = float((100 - (100 / (1 + rs))).iloc[-1]) if not rs.empty else 50.0
        ema12 = series.ewm(span=12, adjust=False).mean()
        ema26 = series.ewm(span=26, adjust=False).mean()
        macd = float((ema12 - ema26).iloc[-1])
        sma20 = float(series.tail(20).mean())
        sma50 = float(series.tail(50).mean()) if len(series) >= 50 else float(series.mean())
        last = float(series.iloc[-1])
        trend = "Bullish" if last > sma20 > sma50 else "Bearish" if last < sma20 < sma50 else "Neutral"
        return {
            "symbol": display_symbol(yahoo_symbol),
            "rsi": round(_safe_float(rsi, 50), 2),
            "macd": round(macd, 4),
            "moving_average_20": round(sma20, 4),
            "moving_average_50": round(sma50, 4),
            "last_price": round(last, 4),
            "trend": trend,
        }

    return _cached(f"technicals:{yahoo_symbol}", 90, load)


def get_news(symbol: str, limit: int = 8) -> list[dict[str, Any]]:
    yahoo_symbol = resolve_yahoo_symbol(symbol)

    def load() -> list[dict[str, Any]]:
        ticker = yf.Ticker(yahoo_symbol)
        items: list[dict[str, Any]] = []
        try:
            raw = ticker.news or []
        except Exception:
            raw = []
        for article in raw[:limit]:
            content = article.get("content") if isinstance(article.get("content"), dict) else article
            title = str((content or {}).get("title") or article.get("title") or "")
            publisher = str(
                ((content or {}).get("provider") or {}).get("displayName")
                if isinstance((content or {}).get("provider"), dict)
                else article.get("publisher") or "Yahoo Finance"
            )
            link = ""
            click = (content or {}).get("clickThroughUrl") or (content or {}).get("canonicalUrl") or article.get("link")
            if isinstance(click, dict):
                link = str(click.get("url") or "")
            elif click:
                link = str(click)
            published = article.get("providerPublishTime") or (content or {}).get("pubDate") or ""
            if not title:
                continue
            items.append(
                {
                    "title": title,
                    "publisher": publisher,
                    "link": link,
                    "published": str(published),
                    "symbol": display_symbol(yahoo_symbol),
                }
            )
        return items

    return _cached(f"news:{yahoo_symbol}:{limit}", 120, load)


def get_sentiment(symbol: str) -> dict[str, Any]:
    quote = get_quote(symbol)
    news = get_news(symbol, 6)
    move = quote["percent_change"]
    score = max(-1.0, min(1.0, move / 8))
    if news:
        score = max(-1.0, min(1.0, score + min(0.15, len(news) * 0.02)))
    if score >= 0.35:
        label = "Bullish"
    elif score <= -0.35:
        label = "Bearish"
    else:
        label = "Neutral"
    return {
        "symbol": quote["symbol"],
        "score": round(score, 3),
        "label": label,
        "percent_change": quote["percent_change"],
        "headline_count": len(news),
    }


def market_overview() -> dict[str, Any]:
    quotes = list_quotes()
    advancers = sum(1 for item in quotes if item["percent_change"] > 0)
    decliners = sum(1 for item in quotes if item["percent_change"] < 0)
    return {
        "market_status": "open",
        "advancers": advancers,
        "decliners": decliners,
        "unchanged": max(0, len(quotes) - advancers - decliners),
        "volatility_index": round(sum(abs(item["percent_change"]) for item in quotes) / len(quotes), 2) if quotes else 0,
        "total_volume": sum(item["volume"] for item in quotes),
        "markets": sorted({item["exchange"] for item in quotes if item.get("exchange")}),
        "quotes": quotes,
    }
