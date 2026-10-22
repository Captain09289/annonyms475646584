import csv
import os
import tempfile
import unittest

from mispricing.backtest import realized_pnl, summarize_backtest
from mispricing.calibration import PlattCalibrator, calibration_table
from mispricing.cli import main
from mispricing.config import Config
from mispricing.data import chronological_split, generate_synthetic, load_csv
from mispricing.metrics import brier_score, compare_brier_scores
from mispricing.pipeline import run_pipeline
from mispricing.report import build_report
from mispricing.signals import (assess_mispricing, check_probability_gap,
                                detect_signal, evaluate_opportunity, rank_signals)


class LessonExamples(unittest.TestCase):
    def test_lesson_2_gap_and_ev(self):
        r = detect_signal(30, 0.50, transaction_cost=0)
        self.assertAlmostEqual(r["market_probability"], 0.30)
        self.assertAlmostEqual(r["probability_gap"], 0.20)
        self.assertAlmostEqual(r["gross_ev"], 20.0)

    def test_lesson_4_and_7_net_ev(self):
        r = detect_signal(40, 0.60)
        self.assertAlmostEqual(r["net_ev"], 17.0)
        self.assertTrue(r["possible_signal"])

    def test_lesson_6_brier(self):
        self.assertAlmostEqual(brier_score([0.8], [1]), 0.04)

    def test_lesson_8_pnl(self):
        self.assertEqual(realized_pnl(40, 100, 1, 3), 57)
        self.assertEqual(realized_pnl(40, 100, 0, 3), -43)

    def test_lesson_9_calibration_gap(self):
        t = calibration_table([0.7, 0.7], [1, 0], bucket_count=10)
        self.assertAlmostEqual(t[0]["calibration_gap"], -0.2)

    def test_lesson_13_compare(self):
        self.assertIn("Baseline outperformed", compare_brier_scores(0.18, 0.14))

    def test_lesson_14_conservative_ev(self):
        r = assess_mispricing(0.55, 50)
        self.assertAlmostEqual(r["net_ev"], 2.0)
        self.assertAlmostEqual(r["conservative_ev"], -6.0)

    def test_lesson_16_gap_check(self):
        r = check_probability_gap(0.64, 0.55, 0.04)
        self.assertEqual(r["result"], "Gap exceeds uncertainty allowance")

    def test_lesson_17_ranking(self):
        sigs = [{"probability_gap": 0.1, "conservative_ev": v, "name": n}
                for n, v in (("A", 6), ("B", 9), ("C", -2))]
        self.assertEqual([s["name"] for s in rank_signals(sigs)], ["B", "A"])

    def test_lesson_19_report_requires_metrics(self):
        with self.assertRaises(ValueError):
            build_report({"brier_score": 0.2})
        text = build_report({"number_of_predictions": 10, "brier_score": 0.2,
                             "baseline_brier_score": 0.25, "total_simulated_pnl": 5.0})
        self.assertIn("Model outperformed baseline on Brier Score.", text)


class Validation(unittest.TestCase):
    def test_bad_inputs_rejected(self):
        with self.assertRaises(ValueError):
            detect_signal(120, 0.5)
        with self.assertRaises(ValueError):
            detect_signal(40, 1.5)
        with self.assertRaises(ValueError):
            brier_score([0.5], [2])
        with self.assertRaises(ValueError):
            Config(train_ratio=0.9, validation_ratio=0.2).validate()

    def test_split_is_chronological_and_disjoint(self):
        data = list(range(100))
        tr, va, te = chronological_split(data)
        self.assertEqual((len(tr), len(va), len(te)), (70, 15, 15))
        self.assertLess(max(tr), min(va))
        self.assertLess(max(va), min(te))


class Pipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cfg = Config(l2_candidates=(0.0, 0.1), bootstrap_samples=100)
        rows, names = generate_synthetic(900, "edge", seed=7)
        cls.edge = run_pipeline(rows, names, cfg)
        rows, names = generate_synthetic(900, "no_edge", seed=7)
        cls.no_edge = run_pipeline(rows, names, cfg)

    def test_model_beats_base_rate_when_features_informative(self):
        m = self.edge["metrics"]
        self.assertLess(m["brier_score"], m["baseline_brier_score"])

    def test_deterministic(self):
        cfg = Config(l2_candidates=(0.0, 0.1), bootstrap_samples=100)
        rows, names = generate_synthetic(900, "edge", seed=7)
        again = run_pipeline(rows, names, cfg)
        self.assertEqual(again["metrics"]["brier_score"], self.edge["metrics"]["brier_score"])

    def test_split_sizes_sum(self):
        s = self.edge["split_sizes"]
        self.assertEqual(sum(s.values()), 900)

    def test_summary_consistent(self):
        s = summarize_backtest(self.edge["results"])
        self.assertEqual(s["number_of_predictions"], self.edge["split_sizes"]["test"])
        self.assertAlmostEqual(
            s["total_simulated_pnl"],
            sum(r["realized_pnl"] for r in self.edge["results"]))

    def test_untraded_rows_have_zero_pnl(self):
        for r in self.no_edge["results"]:
            if not r["traded"]:
                self.assertEqual(r["realized_pnl"], 0.0)

    def test_agent_scan_returns_only_actionable(self):
        rows, _ = generate_synthetic(200, "edge", seed=99)
        for sig in self.edge["agent"].scan(rows):
            self.assertTrue(sig["actionable"])
            self.assertGreater(sig["conservative_ev"], 0)

    def test_too_little_data_rejected(self):
        rows, names = generate_synthetic(50, "edge")
        with self.assertRaises(ValueError):
            run_pipeline(rows, names)

    def test_full_report_builds(self):
        r = self.edge
        text = build_report(r["metrics"], {
            "split_sizes": r["split_sizes"], "test_period": r["test_period"],
            "calibration_table": r["calibration_table"], "config": r["config"],
            "leakage_controls": r["leakage_controls"], "weights": r["weights"],
            "selected_l2": r["selected_l2"]})
        for heading in ("Executive summary", "Calibration", "Data-leakage controls",
                        "Limitations"):
            self.assertIn(heading, text)

    def test_platt_requires_fit(self):
        with self.assertRaises(RuntimeError):
            PlattCalibrator().transform([0.5])


class CsvAndCli(unittest.TestCase):
    def test_csv_roundtrip_and_sort(self):
        rows, names = generate_synthetic(300, "edge", seed=3)
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "d.csv")
            with open(path, "w", newline="", encoding="utf-8") as fh:
                w = csv.writer(fh)
                w.writerow(["timestamp", "price", "outcome"] + names)
                for r in reversed(rows):  # shuffled order on disk
                    w.writerow([r["timestamp"], r["price"], r["outcome"]] + r["features"])
            loaded, loaded_names = load_csv(path)
            self.assertEqual(loaded_names, names)
            self.assertEqual([r["timestamp"] for r in loaded], [str(i) for i in range(300)])
            self.assertEqual(main(["run", "--csv", path]), 0)

    def test_cli_check(self):
        self.assertEqual(main(["check", "--price", "40", "--model-p", "0.60"]), 0)

    def test_cli_error_code(self):
        self.assertEqual(main(["check", "--price", "400", "--model-p", "0.6"]), 1)

    def test_evaluate_opportunity_lesson_14_not_actionable(self):
        d = evaluate_opportunity(50, 0.55)
        self.assertFalse(d["actionable"])


if __name__ == "__main__":
    unittest.main()
