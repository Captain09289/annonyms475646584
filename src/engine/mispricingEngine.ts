import {
  EngineConfig,
  EvaluationResult,
  CalibrationBucket,
  PipelineResult,
  HistoricalDataRow
} from '../types/mispricing';

export const DEFAULT_CONFIG: EngineConfig = {
  payout: 100.0,
  transactionCost: 3.0,
  gapThreshold: 0.05,
  minNetEv: 2.0,
  uncertaintyMargin: 0.08,
  trainRatio: 0.70,
  validationRatio: 0.15,
  bucketCount: 5,
  useCalibration: true,
  l2Candidates: [0.0, 0.01, 0.1, 1.0],
  learningRate: 0.5,
  epochs: 300,
  bootstrapSamples: 500,
  seed: 42,
  currencySymbol: '$'
};

export function sigmoid(z: number): number {
  if (z >= 0) {
    return 1.0 / (1.0 + Math.exp(-z));
  }
  const e = Math.exp(z);
  return e / (1.0 + e);
}

export function logit(p: number, eps = 1e-6): number {
  const clamped = Math.min(Math.max(p, eps), 1.0 - eps);
  return Math.log(clamped / (1.0 - clamped));
}

// L2 Regularized Logistic Regression
export class LogisticModel {
  l2: number;
  learningRate: number;
  epochs: number;
  weights: number[] | null = null;
  bias = 0.0;
  means: number[] | null = null;
  stds: number[] | null = null;

  constructor(l2 = 0.0, learningRate = 0.5, epochs = 300) {
    this.l2 = l2;
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  fit(X: number[][], y: number[]): this {
    const n = X.length;
    if (n === 0 || n !== y.length) {
      throw new Error('Provide non-empty equally sized X and y.');
    }
    const d = X[0].length;

    // Feature standardization
    this.means = new Array(d).fill(0);
    for (let j = 0; j < d; j++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += X[i][j];
      this.means[j] = sum / n;
    }

    this.stds = new Array(d).fill(1);
    for (let j = 0; j < d; j++) {
      let variance = 0;
      for (let i = 0; i < n; i++) {
        const diff = X[i][j] - this.means[j];
        variance += diff * diff;
      }
      const std = Math.sqrt(variance / n);
      this.stds[j] = std > 1e-12 ? std : 1.0;
    }

    const Z = X.map(row => this.standardise(row));
    const w = new Array(d).fill(0.0);
    let b = 0.0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const gw = new Array(d).fill(0.0);
      let gb = 0.0;

      for (let i = 0; i < n; i++) {
        const zi = Z[i];
        let z = b;
        for (let j = 0; j < d; j++) z += w[j] * zi[j];
        const p = sigmoid(z);
        const err = p - y[i];
        gb += err;
        for (let j = 0; j < d; j++) gw[j] += err * zi[j];
      }

      b -= (this.learningRate * gb) / n;
      for (let j = 0; j < d; j++) {
        w[j] -= this.learningRate * (gw[j] / n + this.l2 * w[j]);
      }
    }

    this.weights = w;
    this.bias = b;
    return this;
  }

  standardise(row: number[]): number[] {
    if (!this.means || !this.stds) return row;
    return row.map((val, j) => (val - this.means![j]) / this.stds![j]);
  }

  predictProba(X: number[][]): number[] {
    if (!this.weights || !this.means || !this.stds) {
      throw new Error('Model has not been fitted.');
    }
    const w = this.weights;
    const b = this.bias;
    return X.map(row => {
      const zRow = this.standardise(row);
      let dot = b;
      for (let j = 0; j < w.length; j++) dot += w[j] * zRow[j];
      return sigmoid(dot);
    });
  }
}

// Platt Scaling Calibrator
export class PlattCalibrator {
  learningRate: number;
  epochs: number;
  a: number | null = null;
  b: number | null = null;

  constructor(learningRate = 0.5, epochs = 300) {
    this.learningRate = learningRate;
    this.epochs = epochs;
  }

  fit(probs: number[], outcomes: number[]): this {
    const n = probs.length;
    if (n === 0 || n !== outcomes.length) {
      throw new Error('Provide non-empty equally sized probs and outcomes.');
    }

    const zList = probs.map(p => logit(p));
    let a = 1.0;
    let b = 0.0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let ga = 0.0;
      let gb = 0.0;

      for (let i = 0; i < n; i++) {
        const p = sigmoid(b + a * zList[i]);
        const err = p - outcomes[i];
        gb += err;
        ga += err * zList[i];
      }

      b -= (this.learningRate * gb) / n;
      a -= (this.learningRate * ga) / n;
    }

    this.a = a;
    this.b = b;
    return this;
  }

  transform(probs: number[]): number[] {
    if (this.a === null || this.b === null) {
      throw new Error('Calibrator has not been fitted.');
    }
    return probs.map(p => sigmoid(this.b! + this.a! * logit(p)));
  }
}

// Calibration Table
export function calibrationTable(probabilities: number[], outcomes: number[], bucketCount = 5): CalibrationBucket[] {
  if (probabilities.length !== outcomes.length || probabilities.length === 0) {
    throw new Error('Provide equally sized non-empty arrays.');
  }

  const buckets: { p: number; y: number }[][] = Array.from({ length: bucketCount }, () => []);
  for (let i = 0; i < probabilities.length; i++) {
    const p = probabilities[i];
    const y = outcomes[i];
    let idx = Math.floor(p * bucketCount);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].push({ p, y });
  }

  const table: CalibrationBucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const items = buckets[i];
    if (items.length === 0) continue;
    const count = items.length;
    const avgPred = items.reduce((acc, curr) => acc + curr.p, 0) / count;
    const observed = items.reduce((acc, curr) => acc + curr.y, 0) / count;
    table.push({
      bucket: i,
      count,
      avg_predicted: avgPred,
      observed,
      calibration_gap: observed - avgPred
    });
  }

  return table;
}

// Brier Score
export function brierScore(probabilities: number[], outcomes: number[]): number {
  if (probabilities.length !== outcomes.length || probabilities.length === 0) {
    throw new Error('Provide equally sized non-empty arrays.');
  }
  let sum = 0;
  for (let i = 0; i < probabilities.length; i++) {
    const diff = probabilities[i] - outcomes[i];
    sum += diff * diff;
  }
  return sum / probabilities.length;
}

export function compareBrierScores(modelScore: number, baselineScore: number): string {
  if (modelScore < baselineScore) {
    return 'Model outperformed baseline on Brier Score.';
  } else if (modelScore > baselineScore) {
    return 'Baseline outperformed model on Brier Score.';
  }
  return 'Model matched baseline on Brier Score.';
}

// Paired Bootstrap Resampling
export function pairedBootstrapBrierDiff(
  modelProbs: number[],
  baselineProbs: number[],
  outcomes: number[],
  samples = 500,
  seed = 0
) {
  const n = outcomes.length;
  const diffsPerObs: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const pm = modelProbs[i];
    const pb = baselineProbs[i];
    const o = outcomes[i];
    diffsPerObs[i] = (pm - o) * (pm - o) - (pb - o) * (pb - o);
  }

  // Linear congruential generator for reproducible bootstrap
  let s = seed + 101;
  const randInt = (max: number) => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return Math.floor((s / 4294967296) * max);
  };

  const means: number[] = [];
  for (let iter = 0; iter < samples; iter++) {
    let total = 0;
    for (let i = 0; i < n; i++) {
      total += diffsPerObs[randInt(n)];
    }
    means.push(total / n);
  }

  means.sort((a, b) => a - b);
  const lo = means[Math.floor(0.025 * (samples - 1))];
  const hi = means[Math.floor(0.975 * (samples - 1))];
  const meanDiff = diffsPerObs.reduce((a, b) => a + b, 0) / n;

  return {
    mean_diff: meanDiff,
    ci_low: lo,
    ci_high: hi,
    significant: lo > 0 || hi < 0
  };
}

// Signal Detection & EV Assessment
export function detectSignal(
  price: number,
  modelP: number,
  transactionCost = 3.0,
  payout = 100.0,
  gapThreshold = 0.05,
  minNetEv = 2.0
) {
  const marketProbability = price / payout;
  const probabilityGap = modelP - marketProbability;
  const grossEv = modelP * payout - price;
  const netEv = grossEv - transactionCost;
  const possibleSignal = probabilityGap >= gapThreshold && netEv >= minNetEv;

  return {
    market_probability: marketProbability,
    model_probability: modelP,
    probability_gap: probabilityGap,
    gross_ev: grossEv,
    net_ev: netEv,
    possible_signal: possibleSignal
  };
}

export function checkProbabilityGap(modelP: number, marketP: number, uncertaintyMargin = 0.08) {
  const gap = modelP - marketP;
  const result = gap > uncertaintyMargin ? 'Gap exceeds uncertainty allowance' : 'Gap within uncertainty allowance';
  return { result, margin: uncertaintyMargin, gap };
}

export function assessMispricing(
  modelP: number,
  price: number,
  payout = 100.0,
  transactionCost = 3.0,
  uncertaintyMargin = 0.08
) {
  const marketP = price / payout;
  const grossEv = modelP * payout - price;
  const netEv = grossEv - transactionCost;

  const conservativeP = modelP - uncertaintyMargin;
  const conservativeGrossEv = conservativeP * payout - price;
  const conservativeEv = conservativeGrossEv - transactionCost;

  return {
    market_probability: marketP,
    model_probability: modelP,
    gross_ev: grossEv,
    net_ev: netEv,
    conservative_p: conservativeP,
    conservative_ev: conservativeEv
  };
}

export function evaluateOpportunity(
  price: number,
  modelP: number,
  config: EngineConfig = DEFAULT_CONFIG
): EvaluationResult {
  const baseSig = detectSignal(
    price,
    modelP,
    config.transactionCost,
    config.payout,
    config.gapThreshold,
    config.minNetEv
  );

  const gapRes = checkProbabilityGap(modelP, baseSig.market_probability, config.uncertaintyMargin);
  const assessment = assessMispricing(
    modelP,
    price,
    config.payout,
    config.transactionCost,
    config.uncertaintyMargin
  );

  const conservativeEv = assessment.conservative_ev;
  const gapCheckPassed = gapRes.result === 'Gap exceeds uncertainty allowance';
  const possibleSignal = baseSig.possible_signal;

  let actionable = false;
  let reason = '';

  if (!possibleSignal) {
    if (baseSig.probability_gap < config.gapThreshold) {
      reason = `Probability gap (${(baseSig.probability_gap * 100).toFixed(1)}%) below threshold (${(config.gapThreshold * 100).toFixed(1)}%)`;
    } else {
      reason = `Net EV (${baseSig.net_ev.toFixed(2)}) below minimum (${config.minNetEv.toFixed(2)})`;
    }
  } else if (!gapCheckPassed) {
    reason = `Gap does not exceed uncertainty allowance (${(config.uncertaintyMargin * 100).toFixed(1)}%)`;
  } else if (conservativeEv <= 0) {
    reason = `Conservative EV (${conservativeEv.toFixed(2)}) is non-positive`;
  } else {
    actionable = true;
    reason = 'All checks passed: actionable signal';
  }

  return {
    market_probability: baseSig.market_probability,
    model_probability: modelP,
    probability_gap: baseSig.probability_gap,
    gross_ev: baseSig.gross_ev,
    net_ev: baseSig.net_ev,
    conservative_ev: conservativeEv,
    gap_check: gapRes.result,
    possible_signal: possibleSignal,
    actionable,
    reason
  };
}

export function realizedPnl(price: number, payout: number, outcome: number, transactionCost = 3.0): number {
  if (outcome === 1) {
    return payout - price - transactionCost;
  }
  return -price - transactionCost;
}

// Kelly Criterion Position Sizing
export function calculateKellyFraction(modelP: number, marketPrice: number, payout = 100.0): {
  fullKelly: number;
  halfKelly: number;
  quarterKelly: number;
} {
  const b = (payout - marketPrice) / Math.max(1, marketPrice); // net fractional odds
  const q = 1 - modelP;
  const full = (modelP * b - q) / b;
  const clampedFull = Math.max(0, Math.min(full, 0.5)); // max 50% bankroll cap
  return {
    fullKelly: clampedFull,
    halfKelly: clampedFull * 0.5,
    quarterKelly: clampedFull * 0.25
  };
}

// Full Pipeline Runner
export function runPipeline(
  rows: HistoricalDataRow[],
  featureNames: string[],
  config: EngineConfig = DEFAULT_CONFIG
): PipelineResult {
  const n = rows.length;
  if (n < 200) {
    throw new Error(`Dataset has ${n} rows, but at least 200 are required.`);
  }

  const trainEnd = Math.floor(n * config.trainRatio);
  const valEnd = Math.floor(n * (config.trainRatio + config.validationRatio));

  const trainRows = rows.slice(0, trainEnd);
  const valRows = rows.slice(trainEnd, valEnd);
  const testRows = rows.slice(valEnd);

  const XTrain = trainRows.map(r => r.features);
  const yTrain = trainRows.map(r => r.outcome);

  const XVal = valRows.map(r => r.features);
  const yVal = valRows.map(r => r.outcome);

  const XTest = testRows.map(r => r.features);
  const yTest = testRows.map(r => r.outcome);
  const pTest = testRows.map(r => r.price);

  // 1. Hyperparameter tuning: select L2 on validation data
  let bestL2 = config.l2Candidates[0];
  let bestValBrier = Infinity;

  for (const l2 of config.l2Candidates) {
    const candidate = new LogisticModel(l2, config.learningRate, config.epochs).fit(XTrain, yTrain);
    const valProbs = candidate.predictProba(XVal);
    const score = brierScore(valProbs, yVal);
    if (score < bestValBrier) {
      bestValBrier = score;
      bestL2 = l2;
    }
  }

  // 2. Train model with selected L2
  const finalModel = new LogisticModel(bestL2, config.learningRate, config.epochs).fit(XTrain, yTrain);

  // 3. Platt Calibrator fitted on validation predictions
  const valPreds = finalModel.predictProba(XVal);
  let calibrator: PlattCalibrator | null = null;
  if (config.useCalibration) {
    calibrator = new PlattCalibrator(config.learningRate, config.epochs).fit(valPreds, yVal);
  }

  // 4. Test evaluation
  const rawTestPreds = finalModel.predictProba(XTest);
  const testPreds = calibrator ? calibrator.transform(rawTestPreds) : rawTestPreds;

  const modelBrier = brierScore(testPreds, yTest);
  const rawModelBrier = brierScore(rawTestPreds, yTest);

  // Base rate baseline: train frequency
  const trainRate = yTrain.reduce((a, b) => a + b, 0) / yTrain.length;
  const baseRatePreds = new Array(testRows.length).fill(trainRate);
  const baseRateBrier = brierScore(baseRatePreds, yTest);

  // Market baseline: market price / payout
  const marketPreds = pTest.map(p => p / config.payout);
  const marketBrier = brierScore(marketPreds, yTest);

  const bootstrapBase = pairedBootstrapBrierDiff(testPreds, baseRatePreds, yTest, config.bootstrapSamples, config.seed);
  const bootstrapMarket = pairedBootstrapBrierDiff(testPreds, marketPreds, yTest, config.bootstrapSamples, config.seed);

  const calibTable = calibrationTable(testPreds, yTest, config.bucketCount);

  // 5. Backtest Simulation
  let cumulativePnl = 0;
  const results = testRows.map((r, i) => {
    const pMod = testPreds[i];
    const evalRes = evaluateOpportunity(r.price, pMod, config);
    const traded = evalRes.actionable;
    const pnl = traded ? realizedPnl(r.price, config.payout, r.outcome, config.transactionCost) : 0.0;
    cumulativePnl += pnl;

    return {
      timestamp: r.timestamp,
      market_price: r.price,
      model_probability: pMod,
      outcome: r.outcome,
      probability_gap: evalRes.probability_gap,
      gross_ev: evalRes.gross_ev,
      net_ev: evalRes.net_ev,
      conservative_ev: evalRes.conservative_ev,
      gap_check: evalRes.gap_check,
      possible_signal: evalRes.possible_signal,
      actionable: evalRes.actionable,
      reason: evalRes.reason,
      traded,
      realized_pnl: pnl,
      cumulative_pnl: cumulativePnl
    };
  });

  const tradedRows = results.filter(r => r.traded);
  const numTrades = tradedRows.length;
  const totalPnl = results.reduce((acc, curr) => acc + curr.realized_pnl, 0);
  const avgEvAll = results.reduce((acc, curr) => acc + curr.net_ev, 0) / results.length;
  const winCount = tradedRows.filter(r => r.outcome === 1).length;

  const weights: Record<string, number> = {};
  if (finalModel.weights) {
    featureNames.forEach((name, idx) => {
      weights[name] = finalModel.weights![idx];
    });
  }

  const topSignals = results.filter(r => r.actionable).sort((a, b) => b.conservative_ev - a.conservative_ev);

  return {
    metrics: {
      number_of_predictions: results.length,
      number_of_trades: numTrades,
      total_simulated_pnl: totalPnl,
      win_rate: numTrades > 0 ? winCount / numTrades : null,
      avg_net_ev_all: avgEvAll,
      avg_net_ev_traded: numTrades > 0 ? tradedRows.reduce((a, b) => a + b.net_ev, 0) / numTrades : null,
      avg_realized_pnl_traded: numTrades > 0 ? totalPnl / numTrades : null,
      brier_score: modelBrier,
      raw_brier_score: rawModelBrier,
      baseline_brier_score: baseRateBrier,
      market_brier_score: marketBrier,
      bootstrap_base_rate: bootstrapBase,
      bootstrap_market: bootstrapMarket
    },
    results,
    top_signals: topSignals,
    split_sizes: {
      train: trainRows.length,
      validation: valRows.length,
      test: testRows.length
    },
    test_period: {
      start: testRows[0].timestamp,
      end: testRows[testRows.length - 1].timestamp
    },
    calibration_table: calibTable,
    weights,
    selected_l2: bestL2,
    leakage_controls: [
      'Observations were split chronologically (train, then validation, then test); no shuffling.',
      'Feature scaling and model weights were learned from training data only.',
      'Regularisation strength was chosen using validation data only.',
      'The probability calibrator was fitted on validation data, never on test outcomes.',
      'The test set was evaluated once, after the pipeline was finalised.'
    ]
  };
}
