"""Performance metrics (Lessons 6, 13)."""

import random


def brier_score(probabilities, outcomes):
    if len(probabilities) != len(outcomes) or not probabilities:
        raise ValueError("Provide equally sized, non-empty lists.")

    scores = []
    for p, outcome in zip(probabilities, outcomes):
        if not 0 <= p <= 1:
            raise ValueError("Probability must be between 0 and 1.")
        if outcome not in (0, 1):
            raise ValueError("Outcome must be 0 or 1.")
        scores.append((p - outcome) ** 2)
    return sum(scores) / len(scores)


def compare_brier_scores(model_score, baseline_score):
    if model_score < 0 or baseline_score < 0:
        raise ValueError("Brier Scores cannot be negative.")
    if model_score < baseline_score:
        return "Model outperformed baseline on Brier Score."
    if model_score > baseline_score:
        return "Baseline outperformed model on Brier Score."
    return "Model matched baseline on Brier Score."


def base_rate_baseline(train_outcomes, n):
    """Constant forecast: the training-set event frequency."""
    if not train_outcomes:
        raise ValueError("Need training outcomes for the base-rate baseline.")
    rate = sum(train_outcomes) / len(train_outcomes)
    return [rate] * n


def market_baseline(prices, payout):
    """Forecast using the market-implied probability itself."""
    if payout <= 0:
        raise ValueError("Payout must be positive.")
    return [p / payout for p in prices]


def paired_bootstrap_brier_diff(model_probs, baseline_probs, outcomes,
                                samples=500, seed=0):
    """Uncertainty in (model Brier - baseline Brier) on the same observations.

    Negative mean difference means the model scored better. Returns the mean
    and a 95% percentile interval from resampling observations with replacement.
    This ignores time dependence, so treat it as a rough guide only.
    """
    n = len(outcomes)
    if n == 0 or not (len(model_probs) == len(baseline_probs) == n):
        raise ValueError("Provide equally sized, non-empty lists.")
    diffs_per_obs = [
        (pm - o) ** 2 - (pb - o) ** 2
        for pm, pb, o in zip(model_probs, baseline_probs, outcomes)
    ]
    rng = random.Random(seed)
    means = []
    for _ in range(samples):
        total = 0.0
        for _ in range(n):
            total += diffs_per_obs[rng.randrange(n)]
        means.append(total / n)
    means.sort()
    lo = means[int(0.025 * (samples - 1))]
    hi = means[int(0.975 * (samples - 1))]
    return {
        "mean_diff": sum(diffs_per_obs) / n,
        "ci_low": lo,
        "ci_high": hi,
        "significant": lo > 0 or hi < 0,
    }
