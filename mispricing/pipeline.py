"""End-to-end mispricing pipeline and agent (Lessons 5, 12, 18, 20)."""

from .backtest import realized_pnl, summarize_backtest
from .calibration import PlattCalibrator, calibration_table
from .config import Config
from .data import chronological_split, to_matrix
from .metrics import (base_rate_baseline, brier_score,
                      market_baseline, paired_bootstrap_brier_diff)
from .model import LogisticModel
from .signals import evaluate_opportunity, rank_signals


class MispricingAgent:
    """Production scanning agent for prediction markets."""

    def __init__(self, model, calibrator, config, feature_names):
        self.model = model
        self.calibrator = calibrator
        self.config = config
        self.feature_names = feature_names

    def scan(self, rows):
        """Scans candidate market rows and returns only actionable signals with conservative_ev > 0."""
        if not rows:
            return []
        X = [r["features"] for r in rows]
        raw_probs = self.model.predict_proba(X)
        if self.calibrator is not None:
            probs = self.calibrator.transform(raw_probs)
        else:
            probs = raw_probs

        signals = []
        for r, p_mod in zip(rows, probs):
            ev_res = evaluate_opportunity(r["price"], p_mod, self.config)
            if ev_res["actionable"] and ev_res["conservative_ev"] > 0:
                sig = {
                    "timestamp": r["timestamp"],
                    "market_price": r["price"],
                    "model_probability": p_mod,
                    "features": r["features"],
                    **ev_res,
                }
                signals.append(sig)
        return rank_signals(signals)


def run_pipeline(rows, feature_names, config=None):
    """Executes the full pipeline: split -> train/tune -> calibrate -> test eval -> backtest -> report."""
    if config is None:
        config = Config()
    config.validate()

    if len(rows) < config.min_total_rows:
        raise ValueError(
            f"Dataset has {len(rows)} rows, but at least {config.min_total_rows} are required."
        )

    train_rows, val_rows, test_rows = chronological_split(
        rows, train_ratio=config.train_ratio, validation_ratio=config.validation_ratio
    )

    if len(test_rows) < config.min_test_rows:
        raise ValueError(
            f"Test set has {len(test_rows)} rows, but at least {config.min_test_rows} are required."
        )

    X_train, y_train, p_train = to_matrix(train_rows)
    X_val, y_val, p_val = to_matrix(val_rows)
    X_test, y_test, p_test = to_matrix(test_rows)

    # 1. Hyperparameter tuning: select L2 on validation data
    best_l2 = config.l2_candidates[0]
    best_val_brier = float("inf")

    for l2 in config.l2_candidates:
        candidate_model = LogisticModel(
            l2=l2, learning_rate=config.learning_rate, epochs=config.epochs
        ).fit(X_train, y_train)
        val_probs = candidate_model.predict_proba(X_val)
        score = brier_score(val_probs, y_val)
        if score < best_val_brier:
            best_val_brier = score
            best_l2 = l2

    # 2. Fit final model on training set with selected L2
    final_model = LogisticModel(
        l2=best_l2, learning_rate=config.learning_rate, epochs=config.epochs
    ).fit(X_train, y_train)

    # 3. Fit probability calibrator on validation predictions
    val_preds = final_model.predict_proba(X_val)
    if config.use_calibration:
        calibrator = PlattCalibrator(
            learning_rate=config.learning_rate, epochs=config.epochs
        ).fit(val_preds, y_val)
    else:
        calibrator = None

    # 4. Out-of-sample evaluation on test set
    raw_test_preds = final_model.predict_proba(X_test)
    if calibrator is not None:
        test_preds = calibrator.transform(raw_test_preds)
    else:
        test_preds = raw_test_preds

    model_brier = brier_score(test_preds, y_test)
    raw_brier = brier_score(raw_test_preds, y_test)
    base_rate_preds = base_rate_baseline(y_train, len(y_test))
    base_brier = brier_score(base_rate_preds, y_test)
    mkt_preds = market_baseline(p_test, config.payout)
    mkt_brier = brier_score(mkt_preds, y_test)

    bootstrap_base = paired_bootstrap_brier_diff(
        test_preds, base_rate_preds, y_test,
        samples=config.bootstrap_samples, seed=config.seed
    )
    bootstrap_mkt = paired_bootstrap_brier_diff(
        test_preds, mkt_preds, y_test,
        samples=config.bootstrap_samples, seed=config.seed
    )

    calib_table = calibration_table(test_preds, y_test, bucket_count=config.bucket_count)

    # 5. Backtest simulation on test set
    results = []
    for r, p_mod in zip(test_rows, test_preds):
        eval_res = evaluate_opportunity(r["price"], p_mod, config)
        traded = eval_res["actionable"]
        if traded:
            pnl = realized_pnl(r["price"], config.payout, r["outcome"], config.transaction_cost)
        else:
            pnl = 0.0

        results.append({
            "timestamp": r["timestamp"],
            "market_price": r["price"],
            "model_probability": p_mod,
            "outcome": r["outcome"],
            "probability_gap": eval_res["probability_gap"],
            "gross_ev": eval_res["gross_ev"],
            "net_ev": eval_res["net_ev"],
            "conservative_ev": eval_res["conservative_ev"],
            "gap_check": eval_res["gap_check"],
            "possible_signal": eval_res["possible_signal"],
            "actionable": eval_res["actionable"],
            "reason": eval_res["reason"],
            "traded": traded,
            "realized_pnl": pnl,
        })

    summary = summarize_backtest(results)
    metrics = {
        **summary,
        "brier_score": model_brier,
        "raw_brier_score": raw_brier,
        "baseline_brier_score": base_brier,
        "market_brier_score": mkt_brier,
        "bootstrap_base_rate": bootstrap_base,
        "bootstrap_market": bootstrap_mkt,
    }

    actionable_signals = [r for r in results if r["actionable"]]
    top_signals = rank_signals(actionable_signals)

    test_period = {
        "start": test_rows[0]["timestamp"],
        "end": test_rows[-1]["timestamp"],
    }
    split_sizes = {
        "train": len(train_rows),
        "validation": len(val_rows),
        "test": len(test_rows),
    }

    weights_dict = {name: w for name, w in zip(feature_names, final_model.weights)}

    leakage_controls = [
        "Observations were split chronologically (train, then validation, then test); no shuffling.",
        "Feature scaling and model weights were learned from training data only.",
        "Regularisation strength was chosen using validation data only.",
        "The probability calibrator was fitted on validation data, never on test outcomes.",
        "The test set was evaluated once, after the pipeline was finalised.",
    ]

    agent = MispricingAgent(final_model, calibrator, config, feature_names)

    return {
        "agent": agent,
        "metrics": metrics,
        "results": results,
        "top_signals": top_signals,
        "split_sizes": split_sizes,
        "test_period": test_period,
        "calibration_table": calib_table,
        "config": config,
        "leakage_controls": leakage_controls,
        "weights": weights_dict,
        "selected_l2": best_l2,
    }
