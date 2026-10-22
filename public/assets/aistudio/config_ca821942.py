"""Central configuration. All thresholds are teaching assumptions, not
statistically proven values (Lessons 7 and 14)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    # Contract and cost assumptions (Lessons 1, 4)
    payout: float = 100.0
    transaction_cost: float = 3.0

    # Signal thresholds (Lesson 7)
    gap_threshold: float = 0.05
    min_net_ev: float = 2.0

    # Illustrative uncertainty margin (Lesson 14) - arbitrary, NOT a confidence interval
    uncertainty_margin: float = 0.08

    # Chronological split (Lesson 5)
    train_ratio: float = 0.70
    validation_ratio: float = 0.15

    # Calibration (Lesson 9)
    bucket_count: int = 5
    use_calibration: bool = True

    # Model training
    l2_candidates: tuple = (0.0, 0.01, 0.1, 1.0)
    learning_rate: float = 0.5
    epochs: int = 300

    # Evaluation
    bootstrap_samples: int = 500
    min_total_rows: int = 200
    min_test_rows: int = 30
    seed: int = 42

    def validate(self):
        if self.payout <= 0:
            raise ValueError("Payout must be positive.")
        if self.transaction_cost < 0:
            raise ValueError("Cost cannot be negative.")
        if self.gap_threshold < 0:
            raise ValueError("Gap threshold cannot be negative.")
        if self.uncertainty_margin < 0:
            raise ValueError("Uncertainty margin cannot be negative.")
        if not 0 < self.train_ratio < 1 or not 0 < self.validation_ratio < 1:
            raise ValueError("Invalid split ratios.")
        if self.train_ratio + self.validation_ratio >= 1:
            raise ValueError("Leave some data for final testing.")
        if self.bucket_count < 1:
            raise ValueError("Bucket count must be positive.")
        return self
