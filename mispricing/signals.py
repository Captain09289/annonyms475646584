"""Signal detection, mispricing evaluation, and signal ranking (Lessons 2, 4, 7, 14, 16, 17)."""

from .config import Config


def detect_signal(price, model_p, transaction_cost=3.0, payout=100.0,
                  gap_threshold=0.05, min_net_ev=2.0):
    """Evaluate raw signal based on price and model probability."""
    if not (0 <= price <= payout):
        raise ValueError(f"Price must be between 0 and {payout}.")
    if not (0.0 <= model_p <= 1.0):
        raise ValueError("Model probability must be between 0 and 1.")
    if payout <= 0:
        raise ValueError("Payout must be positive.")
    if transaction_cost < 0:
        raise ValueError("Transaction cost cannot be negative.")

    market_probability = price / payout
    probability_gap = model_p - market_probability
    gross_ev = model_p * payout - price
    net_ev = gross_ev - transaction_cost
    possible_signal = bool(probability_gap >= gap_threshold and net_ev >= min_net_ev)

    return {
        "market_probability": market_probability,
        "model_probability": model_p,
        "probability_gap": probability_gap,
        "gross_ev": gross_ev,
        "net_ev": net_ev,
        "possible_signal": possible_signal,
    }


def check_probability_gap(model_p, market_p, uncertainty_margin=0.08):
    """Compares probability gap against uncertainty margin (Lesson 16)."""
    gap = model_p - market_p
    if gap > uncertainty_margin:
        result = "Gap exceeds uncertainty allowance"
    else:
        result = "Gap within uncertainty allowance"
    return {"result": result, "margin": uncertainty_margin, "gap": gap}


def assess_mispricing(model_p, price, payout=100.0, transaction_cost=3.0,
                      uncertainty_margin=0.08):
    """Computes net EV and conservative EV after uncertainty discount (Lesson 14)."""
    if not (0 <= price <= payout):
        raise ValueError(f"Price must be between 0 and {payout}.")
    if not (0.0 <= model_p <= 1.0):
        raise ValueError("Model probability must be between 0 and 1.")

    market_p = price / payout
    gross_ev = model_p * payout - price
    net_ev = gross_ev - transaction_cost

    conservative_p = model_p - uncertainty_margin
    conservative_gross_ev = conservative_p * payout - price
    conservative_ev = conservative_gross_ev - transaction_cost

    return {
        "market_probability": market_p,
        "model_probability": model_p,
        "gross_ev": gross_ev,
        "net_ev": net_ev,
        "conservative_p": conservative_p,
        "conservative_ev": conservative_ev,
    }


def evaluate_opportunity(price, model_p, config=None):
    """Comprehensive evaluation combining EV, gap checks, and conservative margin."""
    if config is None:
        config = Config()

    if not (0 <= price <= config.payout):
        raise ValueError(f"Price must be between 0 and {config.payout}.")
    if not (0.0 <= model_p <= 1.0):
        raise ValueError("Model probability must be between 0 and 1.")

    base_sig = detect_signal(
        price, model_p,
        transaction_cost=config.transaction_cost,
        payout=config.payout,
        gap_threshold=config.gap_threshold,
        min_net_ev=config.min_net_ev
    )

    gap_res = check_probability_gap(model_p, base_sig["market_probability"], config.uncertainty_margin)
    assessment = assess_mispricing(
        model_p, price,
        payout=config.payout,
        transaction_cost=config.transaction_cost,
        uncertainty_margin=config.uncertainty_margin
    )

    conservative_ev = assessment["conservative_ev"]
    gap_check_passed = (gap_res["result"] == "Gap exceeds uncertainty allowance")
    possible_signal = base_sig["possible_signal"]

    # Actionable requires all filters to pass
    if not possible_signal:
        actionable = False
        if base_sig["probability_gap"] < config.gap_threshold:
            reason = f"Probability gap ({base_sig['probability_gap']:+.1%}) below threshold ({config.gap_threshold:.1%})"
        else:
            reason = f"Net EV ({base_sig['net_ev']:+.2f}) below minimum ({config.min_net_ev:.2f})"
    elif not gap_check_passed:
        actionable = False
        reason = f"Gap does not exceed uncertainty allowance ({config.uncertainty_margin:.1%})"
    elif conservative_ev <= 0:
        actionable = False
        reason = f"Conservative EV ({conservative_ev:+.2f}) is non-positive"
    else:
        actionable = True
        reason = "All checks passed: actionable signal"

    return {
        "market_probability": base_sig["market_probability"],
        "model_probability": model_p,
        "probability_gap": base_sig["probability_gap"],
        "gross_ev": base_sig["gross_ev"],
        "net_ev": base_sig["net_ev"],
        "conservative_ev": conservative_ev,
        "gap_check": gap_res["result"],
        "possible_signal": possible_signal,
        "actionable": actionable,
        "reason": reason,
    }


def rank_signals(signals):
    """Filters signals with conservative_ev > 0 and ranks them descending by conservative_ev."""
    viable = [s for s in signals if s.get("conservative_ev", 0) > 0]
    return sorted(viable, key=lambda s: s["conservative_ev"], reverse=True)
