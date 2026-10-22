"""Command-line interface.

    python -m mispricing check --price 40 --model-p 0.60
    python -m mispricing demo --scenario edge --report report.md
    python -m mispricing run --csv my_data.csv --report report.md
"""

import argparse
import sys

from .config import Config
from .data import generate_synthetic, load_csv
from .pipeline import run_pipeline
from .report import build_report
from .signals import evaluate_opportunity


def _config_from_args(args):
    kwargs = {}
    for name in ("payout", "transaction_cost", "gap_threshold",
                 "min_net_ev", "uncertainty_margin"):
        value = getattr(args, name, None)
        if value is not None:
            kwargs[name] = value
    return Config(**kwargs).validate()


def _add_assumption_flags(p):
    p.add_argument("--payout", type=float)
    p.add_argument("--transaction-cost", dest="transaction_cost", type=float)
    p.add_argument("--gap-threshold", dest="gap_threshold", type=float)
    p.add_argument("--min-net-ev", dest="min_net_ev", type=float)
    p.add_argument("--uncertainty-margin", dest="uncertainty_margin", type=float)


def _print_run(result, report_path):
    m = result["metrics"]
    s = result["split_sizes"]
    print(f"Split (train/validation/test): {s['train']}/{s['validation']}/{s['test']}")
    print(f"Selected L2: {result['selected_l2']}")
    print(f"Brier  model={m['brier_score']:.4f}  base-rate={m['baseline_brier_score']:.4f}  "
          f"market={m['market_brier_score']:.4f}")
    print(f"Trades: {m['number_of_trades']}   Total simulated P&L: {m['total_simulated_pnl']:.2f}")
    if result["top_signals"]:
        print("\nTop ranked signals (test set, by conservative EV):")
        for sig in result["top_signals"][:5]:
            print(f"  t={sig['timestamp']}  price={sig['market_price']:.0f}  "
                  f"model_p={sig['model_probability']:.3f}  "
                  f"gap={sig['probability_gap']:+.3f}  cons_EV={sig['conservative_ev']:+.2f}")
    else:
        print("\nNo actionable signals survived all checks.")

    details = {
        "split_sizes": result["split_sizes"],
        "test_period": result["test_period"],
        "calibration_table": result["calibration_table"],
        "config": result["config"],
        "leakage_controls": result["leakage_controls"],
        "weights": result["weights"],
        "selected_l2": result["selected_l2"],
    }
    report = build_report(m, details)
    if report_path:
        with open(report_path, "w", encoding="utf-8") as handle:
            handle.write(report)
        print(f"\nReport written to {report_path}")
    return report


def cmd_check(args):
    cfg = _config_from_args(args)
    d = evaluate_opportunity(args.price, args.model_p, cfg)
    print(f"Market probability:     {d['market_probability']:.2%}")
    print(f"Model probability:      {d['model_probability']:.2%}")
    print(f"Probability gap:        {d['probability_gap']:+.2%}")
    print(f"Gross EV:               {d['gross_ev']:+.2f}")
    print(f"Net EV:                 {d['net_ev']:+.2f}")
    print(f"Conservative EV:        {d['conservative_ev']:+.2f}")
    print(f"Gap vs uncertainty:     {d['gap_check']}")
    print(f"Possible signal:        {d['possible_signal']}")
    print(f"Actionable:             {d['actionable']}  ({d['reason']})")
    print("\nA signal is a lead to investigate, not proof of mispricing.")
    return 0


def cmd_demo(args):
    cfg = _config_from_args(args)
    rows, names = generate_synthetic(args.n, args.scenario, args.seed, cfg.payout)
    print(f"Scenario: {args.scenario} (simulated data, n={args.n}, seed={args.seed})")
    result = run_pipeline(rows, names, cfg)
    _print_run(result, args.report)
    return 0


def cmd_run(args):
    cfg = _config_from_args(args)
    rows, names = load_csv(args.csv, cfg.payout)
    print(f"Loaded {len(rows)} rows with features: {', '.join(names)}")
    result = run_pipeline(rows, names, cfg)
    _print_run(result, args.report)
    return 0


def build_parser():
    parser = argparse.ArgumentParser(
        prog="mispricing", description="Prediction market mispricing engine (educational).")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("check", help="Evaluate one market price against one model probability.")
    p.add_argument("--price", type=float, required=True)
    p.add_argument("--model-p", dest="model_p", type=float, required=True)
    _add_assumption_flags(p)
    p.set_defaults(func=cmd_check)

    p = sub.add_parser("demo", help="Run the full pipeline on simulated data.")
    p.add_argument("--scenario", choices=["edge", "no_edge"], default="edge")
    p.add_argument("--n", type=int, default=2000)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--report", help="Write a markdown report to this path.")
    _add_assumption_flags(p)
    p.set_defaults(func=cmd_demo)

    p = sub.add_parser("run", help="Run the full pipeline on your own CSV.")
    p.add_argument("--csv", required=True,
                   help="Columns: timestamp, price, outcome, then numeric feature columns.")
    p.add_argument("--report", help="Write a markdown report to this path.")
    _add_assumption_flags(p)
    p.set_defaults(func=cmd_run)
    return parser


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (ValueError, OSError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
