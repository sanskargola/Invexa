from __future__ import annotations

import hashlib
import random
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.market_data import display_symbol, get_quote

router = APIRouter()


class Prediction(BaseModel):
    symbol: str
    sentiment: float
    expected_return: float
    confidence: float
    horizon: str
    target_price: float
    current_price: float
    direction: str
    model: str = "TFT-Transformer"


class ModelInfo(BaseModel):
    id: str
    name: str
    architecture: str
    accuracy: float
    sharpe: float
    status: str
    last_trained: str
    features_count: int


class PredictionHistoryItem(BaseModel):
    id: str
    date: str
    symbol: str
    predicted_direction: str
    predicted_return: float
    actual_return: float
    success: bool
    confidence: float


@router.get("", response_model=list[Prediction])
def list_predictions() -> list[Prediction]:
    symbols = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META"]
    predictions: list[Prediction] = []
    for s in symbols:
        predictions.append(get_prediction_for_symbol(s))
    return predictions


@router.get("/models", response_model=list[ModelInfo])
def list_models() -> list[ModelInfo]:
    return [
        ModelInfo(
            id="mod-1",
            name="Temporal Fusion Transformer",
            architecture="Multi-head Attention + LSTM Encoder",
            accuracy=0.742,
            sharpe=2.15,
            status="Production Active",
            last_trained="2026-10-01",
            features_count=48,
        ),
        ModelInfo(
            id="mod-2",
            name="XGBoost Quant Regressor",
            architecture="Gradient Boosted Decision Trees",
            accuracy=0.698,
            sharpe=1.82,
            status="Production Active",
            last_trained="2026-10-03",
            features_count=36,
        ),
        ModelInfo(
            id="mod-3",
            name="Deep Residual Bi-LSTM",
            architecture="Bidirectional Recurrent Neural Network",
            accuracy=0.718,
            sharpe=1.94,
            status="Validation",
            last_trained="2026-09-28",
            features_count=52,
        ),
        ModelInfo(
            id="mod-4",
            name="Graph Convolutional Market Net",
            architecture="Spatial-Temporal Graph Attention",
            accuracy=0.765,
            sharpe=2.38,
            status="Staging",
            last_trained="2026-10-04",
            features_count=64,
        ),
    ]


@router.get("/history", response_model=list[PredictionHistoryItem])
def get_prediction_history() -> list[PredictionHistoryItem]:
    return [
        PredictionHistoryItem(
            id="pred-h-1",
            date="2026-10-02",
            symbol="NVDA",
            predicted_direction="Bullish",
            predicted_return=0.038,
            actual_return=0.041,
            success=True,
            confidence=0.86,
        ),
        PredictionHistoryItem(
            id="pred-h-2",
            date="2026-10-01",
            symbol="AAPL",
            predicted_direction="Bullish",
            predicted_return=0.015,
            actual_return=0.012,
            success=True,
            confidence=0.78,
        ),
        PredictionHistoryItem(
            id="pred-h-3",
            date="2026-09-28",
            symbol="TSLA",
            predicted_direction="Bearish",
            predicted_return=-0.024,
            actual_return=-0.027,
            success=True,
            confidence=0.82,
        ),
        PredictionHistoryItem(
            id="pred-h-4",
            date="2026-09-25",
            symbol="MSFT",
            predicted_direction="Bullish",
            predicted_return=0.020,
            actual_return=-0.004,
            success=False,
            confidence=0.68,
        ),
        PredictionHistoryItem(
            id="pred-h-5",
            date="2026-09-20",
            symbol="AMZN",
            predicted_direction="Bullish",
            predicted_return=0.018,
            actual_return=0.022,
            success=True,
            confidence=0.81,
        ),
    ]


@router.get("/{symbol}", response_model=Prediction)
def get_prediction_for_symbol(symbol: str) -> Prediction:
    clean = display_symbol(symbol).upper()
    quote = get_quote(clean)
    curr_price = float(quote["price"])

    seed = int(hashlib.md5(f"pred:{clean}".encode()).hexdigest()[:8], 16)
    rng = random.Random(seed)

    exp_ret = round(rng.uniform(-0.025, 0.085), 4)
    target = round(curr_price * (1 + exp_ret), 2)
    conf = round(rng.uniform(0.72, 0.89), 2)
    direction = "Bullish" if exp_ret >= 0 else "Bearish"

    return Prediction(
        symbol=clean,
        sentiment=round(rng.uniform(0.55, 0.92) if exp_ret >= 0 else rng.uniform(0.18, 0.45), 2),
        expected_return=exp_ret,
        confidence=conf,
        horizon="7d",
        target_price=target,
        current_price=curr_price,
        direction=direction,
        model="TFT-Transformer Ensemble",
    )
