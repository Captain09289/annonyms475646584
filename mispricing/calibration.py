"""Calibration: Platt scaling and calibration table (Lessons 9, 10)."""

import math
from .model import logit, sigmoid


class PlattCalibrator:
    """1D Platt calibrator: logistic regression on log-odds of model predictions."""

    def __init__(self, learning_rate=0.5, epochs=300):
        if learning_rate <= 0 or epochs < 1:
            raise ValueError("Invalid learning rate or epochs.")
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.a = None
        self.b = None

    def fit(self, probs, outcomes):
        if not probs or len(probs) != len(outcomes):
            raise ValueError("Provide non-empty equally sized probs and outcomes.")
        if any(o not in (0, 1) for o in outcomes):
            raise ValueError("Outcomes must be 0 or 1.")
        if len(set(outcomes)) < 2:
            raise ValueError("Calibration requires both positive and negative outcomes.")

        n = len(probs)
        z_list = [logit(p) for p in probs]

        # Standard Platt scaling starts with a=1.0 (identity slope), b=0.0
        a = 1.0
        b = 0.0

        for _ in range(self.epochs):
            ga = 0.0
            gb = 0.0
            for z, y in zip(z_list, outcomes):
                p = sigmoid(b + a * z)
                err = p - y
                gb += err
                ga += err * z
            b -= self.learning_rate * gb / n
            a -= self.learning_rate * ga / n

        self.a = a
        self.b = b
        return self

    def transform(self, probs):
        if self.a is None or self.b is None:
            raise RuntimeError("Calibrator has not been fitted.")
        return [sigmoid(self.b + self.a * logit(p)) for p in probs]


def calibration_table(probabilities, outcomes, bucket_count=5):
    """Bins predictions into buckets and computes observed frequency vs avg predicted.

    Returns non-empty buckets sorted by bucket index.
    """
    if len(probabilities) != len(outcomes) or not probabilities:
        raise ValueError("Provide equally sized, non-empty lists.")
    if bucket_count < 1:
        raise ValueError("Bucket count must be at least 1.")

    buckets = [[] for _ in range(bucket_count)]
    for p, y in zip(probabilities, outcomes):
        if not 0.0 <= p <= 1.0:
            raise ValueError("Probabilities must be between 0 and 1.")
        if y not in (0, 1):
            raise ValueError("Outcomes must be 0 or 1.")
        idx = int(p * bucket_count)
        if idx >= bucket_count:
            idx = bucket_count - 1
        buckets[idx].append((p, y))

    table = []
    for i, items in enumerate(buckets):
        if not items:
            continue
        count = len(items)
        avg_pred = sum(p for p, _ in items) / count
        observed = sum(y for _, y in items) / count
        gap = observed - avg_pred
        table.append({
            "bucket": i,
            "count": count,
            "avg_predicted": avg_pred,
            "observed": observed,
            "calibration_gap": gap,
        })
    return table
