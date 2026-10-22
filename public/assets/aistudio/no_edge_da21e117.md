# Mispricing Engine Performance Report

## Executive summary
- Versus the base-rate baseline: Model outperformed baseline on Brier Score. (model 0.2182 vs base-rate 0.2470).
- Against the market-implied probabilities: Baseline outperformed model on Brier Score. (model 0.2182 vs market 0.2130).
- 0 simulated trades; total simulated P&L ₹0.00.
- These are historical simulated results, not evidence of future performance.

## Evaluation period and sample size
- Test predictions evaluated: 300
- Split sizes (train / validation / test): 1400 / 300 / 300
- Test period (timestamps): 1700 to 1999

## Probability accuracy (Brier Score, lower is better)
- Model Brier Score: 0.2182
- Baseline (training base rate) Brier Score: 0.2470
- Market-implied Brier Score: 0.2130
- Model before calibration: 0.2123; after calibration: 0.2182

Model outperformed baseline on Brier Score.
- Model vs base rate: mean diff -0.0288 (95% interval -0.0517 to -0.0048; difference is outside the resampling interval (still not proof))
- Model vs market: mean diff +0.0052 (95% interval +0.0005 to +0.0098; difference is outside the resampling interval (still not proof))

## Calibration (test set)
| Bucket | Count | Avg predicted | Observed | Gap |
|---:|---:|---:|---:|---:|
| 0 | 41 | 0.124 | 0.122 | -0.002 |
| 1 | 85 | 0.302 | 0.341 | +0.039 |
| 2 | 73 | 0.493 | 0.452 | -0.041 |
| 3 | 57 | 0.685 | 0.491 | -0.194 |
| 4 | 44 | 0.889 | 0.773 | -0.116 |

Count-weighted mean absolute calibration gap: 0.075

Buckets with few observations are unstable.

## Simulated results (estimated EV and realized P&L are separate)
- Average estimated net EV, all predictions: ₹0.35
- Average estimated net EV, traded only: n/a
- Number of simulated trades: 0
- Win rate on trades: n/a
- Average realized P&L per trade: n/a
- Total simulated P&L: ₹0.00

## Cost and backtest assumptions
- Payout per contract: ₹100
- Transaction cost per contract: ₹3
- Gap threshold: 5%; minimum net EV: ₹2
- Illustrative uncertainty margin: 8% (arbitrary, not a statistical confidence interval)
- One YES contract bought per actionable signal, at the observed price; no liquidity, spread or slippage modelling.

## Data-leakage controls
- Observations were split chronologically (train, then validation, then test); no shuffling.
- Feature scaling and model weights were learned from training data only.
- Regularisation strength was chosen using validation data only.
- The probability calibrator was fitted on validation data, never on test outcomes.
- The test set was evaluated once, after the pipeline was finalised.

## Model
- Selected L2 strength (by validation Brier): 0.0
- Standardised weight for `x1`: +0.896
- Standardised weight for `x2`: +0.683

## Limitations and next steps
Results depend on data quality, evaluation design, cost assumptions, and the representativeness of the test set. Simulated results do not guarantee future performance. A probability gap is a lead to investigate, not proof of mispricing.

- Next: test on real historical market data, add liquidity/spread modelling, stress-test assumptions, and add more features and model types.
