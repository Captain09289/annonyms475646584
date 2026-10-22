"""Data preparation: synthetic data, CSV loading, chronological split.

A row is a dict:
    {"timestamp": ..., "features": [floats], "price": float, "outcome": 0 or 1}
"""

import csv
import math
import random


def _sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


FEATURE_NAMES = ["x1", "x2"]


def generate_synthetic(n=3000, scenario="edge", seed=42, payout=100.0):
    """Create simulated binary-contract data, already in chronological order.

    scenario="edge":    the market only partly reflects feature x2, so a model
                        that uses x2 has genuine information the price lacks.
    scenario="no_edge": the market price equals the true probability, so any
                        apparent gap is just estimation noise.
    """
    if scenario not in ("edge", "no_edge"):
        raise ValueError("scenario must be 'edge' or 'no_edge'.")
    if n < 1:
        raise ValueError("n must be positive.")

    rng = random.Random(seed)
    rows = []
    for t in range(n):
        x1 = rng.gauss(0, 1)
        x2 = rng.gauss(0, 1)
        true_logit = 0.9 * x1 + 0.7 * x2 - 0.1
        p_true = _sigmoid(true_logit)

        if scenario == "edge":
            market_logit = 0.9 * x1 + 0.2 * x2 - 0.1 + rng.gauss(0, 0.25)
        else:
            market_logit = true_logit

        price = round(_sigmoid(market_logit) * payout)
        price = min(max(price, 1), int(payout) - 1)
        outcome = 1 if rng.random() < p_true else 0
        rows.append({
            "timestamp": t,
            "features": [x1, x2],
            "price": float(price),
            "outcome": outcome,
        })
    return rows, list(FEATURE_NAMES)


def _parse_timestamp(value):
    try:
        return (0, float(value))
    except (TypeError, ValueError):
        return (1, str(value))


def load_csv(path, payout=100.0):
    """Load rows from a CSV with columns: timestamp, price, outcome, <features...>.

    Every column other than timestamp/price/outcome is treated as a numeric
    feature. Rows are sorted chronologically by timestamp.
    """
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("CSV has no header row.")
        required = {"timestamp", "price", "outcome"}
        missing = required - set(reader.fieldnames)
        if missing:
            raise ValueError(f"CSV is missing columns: {sorted(missing)}")
        feature_names = [c for c in reader.fieldnames if c not in required]
        if not feature_names:
            raise ValueError("CSV needs at least one feature column.")

        rows = []
        for line_no, record in enumerate(reader, start=2):
            try:
                price = float(record["price"])
                outcome = int(float(record["outcome"]))
                features = [float(record[name]) for name in feature_names]
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Bad value on CSV line {line_no}: {exc}") from exc
            if not 0 <= price <= payout:
                raise ValueError(f"Price out of range on CSV line {line_no}.")
            if outcome not in (0, 1):
                raise ValueError(f"Outcome must be 0 or 1 on CSV line {line_no}.")
            rows.append({
                "timestamp": record["timestamp"],
                "features": features,
                "price": price,
                "outcome": outcome,
            })

    rows.sort(key=lambda r: _parse_timestamp(r["timestamp"]))
    return rows, feature_names


def chronological_split(data, train_ratio=0.70, validation_ratio=0.15):
    """Lesson 5. Assumes `data` is already sorted chronologically."""
    if not 0 < train_ratio < 1:
        raise ValueError("Invalid training ratio.")
    if not 0 < validation_ratio < 1:
        raise ValueError("Invalid validation ratio.")
    if train_ratio + validation_ratio >= 1:
        raise ValueError("Leave some data for final testing.")

    n = len(data)
    train_end = int(n * train_ratio)
    validation_end = int(n * (train_ratio + validation_ratio))
    return data[:train_end], data[train_end:validation_end], data[validation_end:]


def to_matrix(rows):
    """Return (X, y, prices) lists from rows."""
    X = [r["features"] for r in rows]
    y = [r["outcome"] for r in rows]
    prices = [r["price"] for r in rows]
    return X, y, prices
