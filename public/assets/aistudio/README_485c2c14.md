# Mispricing Detector

A prediction-market mispricing engine built from Lessons 1-20. Educational quantitative research:
a probability gap does not prove a market is mispriced, and positive estimated EV does not guarantee profit.

No third-party packages needed (Python 3.9+).

## What the agent does

Market price -> model probability -> compare -> EV -> uncertainty check -> backtest -> report

1. Splits data chronologically (70% train / 15% validation / 15% test).
2. Trains a logistic-regression model on training data; picks regularisation on validation data.
3. Fits a Platt calibrator on validation data (never on test).
4. Evaluates once on the untouched test set: Brier Score vs a base-rate baseline AND vs the market itself, calibration table, bootstrap uncertainty on the score difference.
5. Flags a trade only if: gap > threshold, net EV >= minimum, gap exceeds the uncertainty allowance, and conservative EV > 0.
6. Ranks signals by conservative EV and writes a markdown report (estimated EV and realized P&L kept separate).

## Run it (from this folder)

    python -m unittest discover -s tests -v
    python -m mispricing check --price 40 --model-p 0.60
    python -m mispricing demo --scenario edge --report report.md
    python -m mispricing demo --scenario no_edge --report report.md
    python -m mispricing run --csv your_data.csv --report report.md

Your CSV needs columns `timestamp,price,outcome` plus one or more numeric feature columns.
`price` is the YES contract price (0-100), `outcome` is 0 or 1.

Adjust assumptions with flags: `--payout --transaction-cost --gap-threshold --min-net-ev --uncertainty-margin`.

## Layout

| File | Role |
|---|---|
| `data.py` | synthetic data, CSV loading, chronological split |
| `model.py` | logistic regression probability model |
| `calibration.py` | calibration table + Platt calibrator |
| `metrics.py` | Brier Score, baselines, bootstrap comparison |
| `signals.py` | gap, EV, uncertainty, ranking, combined decision |
| `backtest.py` | realized P&L and backtest summary |
| `pipeline.py` | end-to-end agent (`run_pipeline`, `MispricingAgent.scan`) |
| `report.py` | markdown performance report |
| `config.py` | all thresholds and assumptions |
| `cli.py`, `__main__.py` | command line |

## Honest limitations

- The demo data is simulated; results on it say nothing about real markets.
- Thresholds and the 8-point uncertainty margin are teaching assumptions, not validated values.
- The backtest assumes one contract at the observed price: no liquidity, spread or slippage modelling.
- The bootstrap ignores time dependence, so treat its interval as a rough guide.
