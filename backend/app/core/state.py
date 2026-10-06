"""Synchronized trading state for Invexa backend.

Connects orders, positions, transactions, and portfolio balances.
"""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import Any, Optional


class TradingState:
    def __init__(self) -> None:
        self.cash: float = 45020.18
        self.initial_capital: float = 100000.00
        self.positions: dict[str, dict[str, Any]] = {
            "NVDA": {
                "symbol": "NVDA",
                "quantity": 42,
                "avg_cost": 128.50,
                "current_price": 142.87,
                "market_value": 6000.54,
                "unrealized_pnl": 603.54,
                "pnl_percent": 11.18,
            },
            "AAPL": {
                "symbol": "AAPL",
                "quantity": 18,
                "avg_cost": 218.40,
                "current_price": 232.61,
                "market_value": 4186.98,
                "unrealized_pnl": 255.78,
                "pnl_percent": 6.51,
            },
            "MSFT": {
                "symbol": "MSFT",
                "quantity": 9,
                "avg_cost": 412.00,
                "current_price": 428.76,
                "market_value": 3858.84,
                "unrealized_pnl": 150.84,
                "pnl_percent": 4.07,
            },
            "AMZN": {
                "symbol": "AMZN",
                "quantity": 21,
                "avg_cost": 210.50,
                "current_price": 225.94,
                "market_value": 4744.74,
                "unrealized_pnl": 324.24,
                "pnl_percent": 7.33,
            },
        }

        self.orders: list[dict[str, Any]] = [
            {
                "id": "ORD-109281",
                "symbol": "NVDA",
                "side": "Buy",
                "quantity": 15,
                "type": "Market",
                "price": 142.87,
                "status": "Filled",
                "created_at": "2026-10-06T14:30:00Z",
                "filled_at": "2026-10-06T14:30:02Z",
            },
            {
                "id": "ORD-108742",
                "symbol": "AAPL",
                "side": "Buy",
                "quantity": 10,
                "type": "Limit",
                "price": 230.00,
                "status": "Filled",
                "created_at": "2026-10-05T11:15:00Z",
                "filled_at": "2026-10-05T11:22:15Z",
            },
            {
                "id": "ORD-107650",
                "symbol": "TSLA",
                "side": "Sell",
                "quantity": 8,
                "type": "Market",
                "price": 355.20,
                "status": "Filled",
                "created_at": "2026-10-04T16:45:00Z",
                "filled_at": "2026-10-04T16:45:01Z",
            },
        ]

        self.transactions: list[dict[str, Any]] = [
            {
                "id": "TX-901",
                "date": "2026-10-06T14:30:02Z",
                "type": "BUY",
                "symbol": "NVDA",
                "amount": -2143.05,
                "shares": 15,
                "price": 142.87,
                "fee": 1.00,
            },
            {
                "id": "TX-900",
                "date": "2026-10-05T11:22:15Z",
                "type": "BUY",
                "symbol": "AAPL",
                "amount": -2300.00,
                "shares": 10,
                "price": 230.00,
                "fee": 1.00,
            },
            {
                "id": "TX-899",
                "date": "2026-10-04T16:45:01Z",
                "type": "SELL",
                "symbol": "TSLA",
                "amount": 2841.60,
                "shares": 8,
                "price": 355.20,
                "fee": 1.50,
            },
            {
                "id": "TX-898",
                "date": "2026-10-01T09:00:00Z",
                "type": "DEPOSIT",
                "symbol": "USD",
                "amount": 10000.00,
                "shares": 0,
                "price": 1.00,
                "fee": 0.00,
            },
        ]

        self.strategies: list[dict[str, Any]] = [
            {
                "id": "strat-1",
                "name": "Momentum Breakout Pro",
                "status": "active",
                "type": "Trend Following",
                "symbols": ["NVDA", "AAPL", "MSFT"],
                "annual_return": 0.284,
                "win_rate": 0.68,
                "max_drawdown": 0.12,
                "trades_count": 142,
                "created_at": "2026-08-15T10:00:00Z",
                "description": "Multi-timeframe RSI + Volume breakout algorithm targeting high-beta momentum leaders.",
            },
            {
                "id": "strat-2",
                "name": "Statistical Mean Reversion",
                "status": "paused",
                "type": "Mean Reversion",
                "symbols": ["TSLA", "AMZN"],
                "annual_return": 0.162,
                "win_rate": 0.61,
                "max_drawdown": 0.09,
                "trades_count": 89,
                "created_at": "2026-09-01T12:00:00Z",
                "description": "Bollinger Bands 2.5 SD mean reversion with ATR-based dynamic stop-loss trailing.",
            },
            {
                "id": "strat-3",
                "name": "Adaptive VWAP Scalper",
                "status": "active",
                "type": "Intraday",
                "symbols": ["AAPL", "NVDA"],
                "annual_return": 0.221,
                "win_rate": 0.72,
                "max_drawdown": 0.07,
                "trades_count": 312,
                "created_at": "2026-09-20T08:30:00Z",
                "description": "Intraday high-frequency VWAP slope cross with order flow imbalance confirmation.",
            },
        ]

        self.user_profile: dict[str, Any] = {
            "id": "user-1001",
            "name": "Sanskar Gola",
            "email": "sanskar@invexia.trade",
            "timezone": "Asia/Kolkata",
            "currency": "USD",
            "role": "admin",
            "created_at": "2026-01-10T00:00:00Z",
            "bio": "Quantitative portfolio manager & algorithmic trading developer.",
            "two_factor_enabled": True,
            "notifications_email": True,
            "notifications_push": True,
            "risk_profile": "Growth / Aggressive",
        }

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: int,
        order_type: str = "Market",
        price: Optional[float] = None,
    ) -> dict[str, Any]:
        from app.services.market_data import get_quote

        symbol = symbol.upper()
        quote = get_quote(symbol)
        exec_price = float(price) if price and price > 0 else float(quote["price"])
        order_id = f"ORD-{int(time.time() * 1000) % 1000000:06d}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # For market orders, fill immediately
        status = "Filled" if order_type.lower() == "market" else "Open"

        order = {
            "id": order_id,
            "symbol": symbol,
            "side": side.capitalize(),
            "quantity": quantity,
            "type": order_type.capitalize(),
            "price": round(exec_price, 2),
            "status": status,
            "created_at": now_iso,
            "filled_at": now_iso if status == "Filled" else None,
        }
        self.orders.insert(0, order)

        if status == "Filled":
            self._execute_fill(symbol, side.capitalize(), quantity, exec_price, order_id)

        return order

    def _execute_fill(self, symbol: str, side: str, quantity: int, price: float, order_id: str) -> None:
        total_cost = price * quantity
        now_iso = datetime.now(timezone.utc).isoformat()

        if side == "Buy":
            self.cash -= total_cost
            if symbol in self.positions:
                pos = self.positions[symbol]
                total_shares = pos["quantity"] + quantity
                total_spent = (pos["quantity"] * pos["avg_cost"]) + total_cost
                pos["quantity"] = total_shares
                pos["avg_cost"] = round(total_spent / total_shares, 2)
            else:
                self.positions[symbol] = {
                    "symbol": symbol,
                    "quantity": quantity,
                    "avg_cost": round(price, 2),
                    "current_price": round(price, 2),
                    "market_value": round(total_cost, 2),
                    "unrealized_pnl": 0.0,
                    "pnl_percent": 0.0,
                }
            self.transactions.insert(
                0,
                {
                    "id": f"TX-{uuid.uuid4().hex[:6].upper()}",
                    "date": now_iso,
                    "type": "BUY",
                    "symbol": symbol,
                    "amount": round(-total_cost, 2),
                    "shares": quantity,
                    "price": round(price, 2),
                    "fee": 1.00,
                },
            )
        elif side == "Sell":
            self.cash += total_cost
            if symbol in self.positions:
                pos = self.positions[symbol]
                new_qty = pos["quantity"] - quantity
                if new_qty <= 0:
                    del self.positions[symbol]
                else:
                    pos["quantity"] = new_qty
            self.transactions.insert(
                0,
                {
                    "id": f"TX-{uuid.uuid4().hex[:6].upper()}",
                    "date": now_iso,
                    "type": "SELL",
                    "symbol": symbol,
                    "amount": round(total_cost, 2),
                    "shares": quantity,
                    "price": round(price, 2),
                    "fee": 1.00,
                },
            )

    def cancel_order(self, order_id: str) -> bool:
        for order in self.orders:
            if order["id"] == order_id:
                if order["status"] == "Open":
                    order["status"] = "Cancelled"
                    return True
                return False
        return False

    def close_position(self, symbol: str) -> Optional[dict[str, Any]]:
        from app.services.market_data import get_quote

        symbol = symbol.upper()
        if symbol not in self.positions:
            return None
        pos = self.positions[symbol]
        quote = get_quote(symbol)
        curr_price = float(quote["price"])
        order = self.place_order(symbol, "Sell", pos["quantity"], "Market", curr_price)
        return order

    def get_summary(self) -> dict[str, Any]:
        from app.services.market_data import get_quote

        invested = 0.0
        total_pnl = 0.0
        daily_pnl = 0.0

        for symbol, pos in list(self.positions.items()):
            try:
                quote = get_quote(symbol)
                price = float(quote["price"])
                chg = float(quote["change"])
            except Exception:
                price = pos.get("avg_cost", 100.0)
                chg = 0.0

            pos["current_price"] = round(price, 2)
            m_val = round(pos["quantity"] * price, 2)
            pos["market_value"] = m_val
            cost_basis = pos["quantity"] * pos["avg_cost"]
            unrealized = round(m_val - cost_basis, 2)
            pos["unrealized_pnl"] = unrealized
            pos["pnl_percent"] = round((unrealized / cost_basis * 100), 2) if cost_basis else 0.0

            invested += m_val
            total_pnl += unrealized
            daily_pnl += chg * pos["quantity"]

        account_value = round(self.cash + invested, 2)
        daily_return = round((daily_pnl / account_value), 4) if account_value else 0.0

        equity_ratio = round(invested / account_value, 2) if account_value else 0.0
        cash_ratio = round(self.cash / account_value, 2) if account_value else 0.0

        return {
            "account_value": account_value,
            "cash": round(self.cash, 2),
            "invested": round(invested, 2),
            "pnl": round(total_pnl, 2),
            "daily_return": daily_return,
            "allocation": {
                "equity": equity_ratio,
                "cash": cash_ratio,
                "options": 0.05,
                "crypto": 0.05,
            },
        }


# Singleton trading state instance
state = TradingState()
