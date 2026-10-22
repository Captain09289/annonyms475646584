"""The probability model: L2-regularised logistic regression in pure Python.

Standardisation parameters and weights are learned from training data only.
"""

import math


def sigmoid(z):
    if z >= 0:
        return 1.0 / (1.0 + math.exp(-z))
    e = math.exp(z)
    return e / (1.0 + e)


def logit(p, eps=1e-6):
    p = min(max(p, eps), 1.0 - eps)
    return math.log(p / (1.0 - p))


class LogisticModel:
    def __init__(self, l2=0.0, learning_rate=0.5, epochs=300):
        if l2 < 0:
            raise ValueError("l2 cannot be negative.")
        if learning_rate <= 0 or epochs < 1:
            raise ValueError("Invalid learning rate or epochs.")
        self.l2 = l2
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.weights = None
        self.bias = 0.0
        self.means = None
        self.stds = None

    def fit(self, X, y):
        if not X or len(X) != len(y):
            raise ValueError("Provide equally sized, non-empty X and y.")
        d = len(X[0])
        if d == 0 or any(len(row) != d for row in X):
            raise ValueError("All rows must have the same, non-zero feature count.")
        if any(o not in (0, 1) for o in y):
            raise ValueError("Outcomes must be 0 or 1.")
        if len(set(y)) < 2:
            raise ValueError("Training data needs both outcomes (0 and 1).")

        n = len(X)
        self.means = [sum(row[j] for row in X) / n for j in range(d)]
        self.stds = []
        for j in range(d):
            var = sum((row[j] - self.means[j]) ** 2 for row in X) / n
            std = math.sqrt(var)
            self.stds.append(std if std > 1e-12 else 1.0)

        Z = [self._standardise(row) for row in X]
        w = [0.0] * d
        b = 0.0
        for _ in range(self.epochs):
            gw = [0.0] * d
            gb = 0.0
            for zi, yi in zip(Z, y):
                p = sigmoid(b + sum(w[j] * zi[j] for j in range(d)))
                err = p - yi
                gb += err
                for j in range(d):
                    gw[j] += err * zi[j]
            b -= self.learning_rate * gb / n
            for j in range(d):
                w[j] -= self.learning_rate * (gw[j] / n + self.l2 * w[j])

        self.weights = w
        self.bias = b
        return self

    def _standardise(self, row):
        return [(row[j] - self.means[j]) / self.stds[j] for j in range(len(row))]

    def predict_proba(self, X):
        if self.weights is None:
            raise RuntimeError("Model has not been fitted.")
        out = []
        for row in X:
            if len(row) != len(self.weights):
                raise ValueError("Feature count does not match the fitted model.")
            z = self.bias + sum(w * v for w, v in zip(self.weights, self._standardise(row)))
            out.append(sigmoid(z))
        return out
