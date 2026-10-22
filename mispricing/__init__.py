"""Prediction Market Mispricing Engine (educational quantitative-research project).

A detected probability gap does not prove a market is mispriced, and positive
estimated expected value does not guarantee a profit.
"""

__version__ = "0.1.0"
from .config import Config
from .data import generate_synthetic, load_csv, chronological_split
from .model import LogisticModel
from .calibration import PlattCalibrator, calibration_table
from .metrics import brier_score, compare_brier_scores, base_rate_baseline, market_baseline, paired_bootstrap_brier_diff
from .signals import detect_signal, check_probability_gap, assess_mispricing, evaluate_opportunity, rank_signals
from .backtest import realized_pnl, summarize_backtest
from .pipeline import run_pipeline, MispricingAgent
from .report import build_report

__all__ = [
    "Config",
    "generate_synthetic",
    "load_csv",
    "chronological_split",
    "LogisticModel",
    "PlattCalibrator",
    "calibration_table",
    "brier_score",
    "compare_brier_scores",
    "base_rate_baseline",
    "market_baseline",
    "paired_bootstrap_brier_diff",
    "detect_signal",
    "check_probability_gap",
    "assess_mispricing",
    "evaluate_opportunity",
    "rank_signals",
    "realized_pnl",
    "summarize_backtest",
    "run_pipeline",
    "MispricingAgent",
    "build_report",
]
