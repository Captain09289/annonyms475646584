"""Markdown report generation (Lessons 19, 20)."""

from .metrics import compare_brier_scores


def build_report(metrics, details=None):
    """Constructs a comprehensive research report from metrics and pipeline details."""
    required = {"number_of_predictions", "brier_score", "baseline_brier_score", "total_simulated_pnl"}
    missing = required - set(metrics.keys())
    if missing:
        raise ValueError(f"Missing required metrics for report: {sorted(missing)}")

    details = details or {}
    cfg = details.get("config")
    split = details.get("split_sizes", {})
    period = details.get("test_period", {})
    calib = details.get("calibration_table", [])
    weights = details.get("weights", {})
    l2 = details.get("selected_l2", 0.0)
    leakage = details.get("leakage_controls", [])

    lines = [
        "# Mispricing Engine Performance Report",
        "",
        "## Executive summary",
    ]

    base_cmp = compare_brier_scores(metrics["brier_score"], metrics["baseline_brier_score"])
    lines.append(
        f"- Versus the base-rate baseline: {base_cmp} (model {metrics['brier_score']:.4f} vs base-rate {metrics['baseline_brier_score']:.4f})."
    )

    if "market_brier_score" in metrics:
        mkt_cmp = compare_brier_scores(metrics["brier_score"], metrics["market_brier_score"])
        lines.append(
            f"- Against the market-implied probabilities: {mkt_cmp} (model {metrics['brier_score']:.4f} vs market {metrics['market_brier_score']:.4f})."
        )

    num_trades = metrics.get("number_of_trades", 0)
    total_pnl = metrics.get("total_simulated_pnl", 0.0)
    lines.append(f"- {num_trades} simulated trades; total simulated P&L ₹{total_pnl:.2f}.")
    lines.append("- These are historical simulated results, not evidence of future performance.")
    lines.append("")

    lines.append("## Evaluation period and sample size")
    lines.append(f"- Test predictions evaluated: {metrics['number_of_predictions']}")
    if split:
        lines.append(f"- Split sizes (train / validation / test): {split.get('train', 0)} / {split.get('validation', 0)} / {split.get('test', 0)}")
    if period:
        lines.append(f"- Test period (timestamps): {period.get('start', 'n/a')} to {period.get('end', 'n/a')}")
    lines.append("")

    lines.append("## Probability accuracy (Brier Score, lower is better)")
    lines.append(f"- Model Brier Score: {metrics['brier_score']:.4f}")
    lines.append(f"- Baseline (training base rate) Brier Score: {metrics['baseline_brier_score']:.4f}")
    if "market_brier_score" in metrics:
        lines.append(f"- Market-implied Brier Score: {metrics['market_brier_score']:.4f}")
    if "raw_brier_score" in metrics:
        lines.append(f"- Model before calibration: {metrics['raw_brier_score']:.4f}; after calibration: {metrics['brier_score']:.4f}")
    lines.append("")

    lines.append(base_cmp)
    if "bootstrap_base_rate" in metrics:
        bs = metrics["bootstrap_base_rate"]
        sig_str = "difference is outside the resampling interval (still not proof)" if bs["significant"] else "difference is not significant"
        lines.append(f"- Model vs base rate: mean diff {bs['mean_diff']:+.4f} (95% interval {bs['ci_low']:+.4f} to {bs['ci_high']:+.4f}; {sig_str})")
    if "bootstrap_market" in metrics:
        bm = metrics["bootstrap_market"]
        sig_str = "difference is outside the resampling interval (still not proof)" if bm["significant"] else "difference is not significant"
        lines.append(f"- Model vs market: mean diff {bm['mean_diff']:+.4f} (95% interval {bm['ci_low']:+.4f} to {bm['ci_high']:+.4f}; {sig_str})")
    lines.append("")

    lines.append("## Calibration (test set)")
    if calib:
        lines.append("| Bucket | Count | Avg predicted | Observed | Gap |")
        lines.append("|---:|---:|---:|---:|---:|")
        total_count = sum(b["count"] for b in calib)
        weighted_abs_gap = sum(b["count"] * abs(b["calibration_gap"]) for b in calib) / total_count if total_count > 0 else 0.0
        for b in calib:
            lines.append(f"| {b['bucket']} | {b['count']} | {b['avg_predicted']:.3f} | {b['observed']:.3f} | {b['calibration_gap']:+.3f} |")
        lines.append("")
        lines.append(f"Count-weighted mean absolute calibration gap: {weighted_abs_gap:.3f}")
        lines.append("")
        lines.append("Buckets with few observations are unstable.")
    else:
        lines.append("No calibration table available.")
    lines.append("")

    lines.append("## Simulated results (estimated EV and realized P&L are separate)")
    avg_ev_all = metrics.get("avg_net_ev_all")
    avg_ev_traded = metrics.get("avg_net_ev_traded")
    win_rate = metrics.get("win_rate")
    avg_pnl = metrics.get("avg_realized_pnl_traded")

    lines.append(f"- Average estimated net EV, all predictions: ₹{avg_ev_all:.2f}" if avg_ev_all is not None else "- Average estimated net EV, all predictions: n/a")
    lines.append(f"- Average estimated net EV, traded only: ₹{avg_ev_traded:.2f}" if avg_ev_traded is not None else "- Average estimated net EV, traded only: n/a")
    lines.append(f"- Number of simulated trades: {num_trades}")
    lines.append(f"- Win rate on trades: {win_rate:.1%}" if win_rate is not None else "- Win rate on trades: n/a")
    lines.append(f"- Average realized P&L per trade: ₹{avg_pnl:.2f}" if avg_pnl is not None else "- Average realized P&L per trade: n/a")
    lines.append(f"- Total simulated P&L: ₹{total_pnl:.2f}")
    lines.append("")

    lines.append("## Cost and backtest assumptions")
    if cfg:
        lines.append(f"- Payout per contract: ₹{cfg.payout:.0f}")
        lines.append(f"- Transaction cost per contract: ₹{cfg.transaction_cost:.0f}")
        lines.append(f"- Gap threshold: {cfg.gap_threshold:.0%}; minimum net EV: ₹{cfg.min_net_ev:.0f}")
        lines.append(f"- Illustrative uncertainty margin: {cfg.uncertainty_margin:.0%} (arbitrary, not a statistical confidence interval)")
    else:
        lines.append("- Payout per contract: ₹100")
        lines.append("- Transaction cost per contract: ₹3")
        lines.append("- Gap threshold: 5%; minimum net EV: ₹2")
        lines.append("- Illustrative uncertainty margin: 8% (arbitrary, not a statistical confidence interval)")
    lines.append("- One YES contract bought per actionable signal, at the observed price; no liquidity, spread or slippage modelling.")
    lines.append("")

    lines.append("## Data-leakage controls")
    if leakage:
        for item in leakage:
            lines.append(f"- {item}")
    else:
        lines.append("- Observations were split chronologically (train, then validation, then test); no shuffling.")
        lines.append("- Feature scaling and model weights were learned from training data only.")
        lines.append("- Regularisation strength was chosen using validation data only.")
        lines.append("- The probability calibrator was fitted on validation data, never on test outcomes.")
        lines.append("- The test set was evaluated once, after the pipeline was finalised.")
    lines.append("")

    lines.append("## Model")
    lines.append(f"- Selected L2 strength (by validation Brier): {l2}")
    if weights:
        for fname, w in weights.items():
            lines.append(f"- Standardised weight for `{fname}`: {w:+.3f}")
    lines.append("")

    lines.append("## Limitations and next steps")
    lines.append("Results depend on data quality, evaluation design, cost assumptions, and the representativeness of the test set. Simulated results do not guarantee future performance. A probability gap is a lead to investigate, not proof of mispricing.")
    lines.append("")
    lines.append("- Next: test on real historical market data, add liquidity/spread modelling, stress-test assumptions, and add more features and model types.")
    lines.append("")

    return "\n".join(lines)
