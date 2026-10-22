"""Backtesting and P&L accounting (Lessons 8, 11)."""


def realized_pnl(price, payout, outcome, transaction_cost=3.0):
    """Calculates realized profit and loss for buying one YES contract.

    Untraded decisions do not call this function (their P&L is 0).
    """
    if outcome not in (0, 1):
        raise ValueError("Outcome must be 0 or 1.")
    if outcome == 1:
        return (payout - price) - transaction_cost
    else:
        return -price - transaction_cost


def summarize_backtest(results):
    """Aggregates simulated trade execution and estimates vs real results."""
    n = len(results)
    if n == 0:
        return {
            "number_of_predictions": 0,
            "number_of_trades": 0,
            "total_simulated_pnl": 0.0,
            "win_rate": None,
            "avg_net_ev_all": 0.0,
            "avg_net_ev_traded": None,
            "avg_realized_pnl_traded": None,
        }

    traded_rows = [r for r in results if r.get("traded", False)]
    num_trades = len(traded_rows)
    total_pnl = sum(r.get("realized_pnl", 0.0) for r in results)
    avg_ev_all = sum(r.get("net_ev", 0.0) for r in results) / n

    if num_trades > 0:
        win_count = sum(1 for r in traded_rows if r.get("outcome") == 1)
        win_rate = win_count / num_trades
        avg_ev_traded = sum(r.get("net_ev", 0.0) for r in traded_rows) / num_trades
        avg_pnl_traded = total_pnl / num_trades
    else:
        win_rate = None
        avg_ev_traded = None
        avg_pnl_traded = None

    return {
        "number_of_predictions": n,
        "number_of_trades": num_trades,
        "total_simulated_pnl": total_pnl,
        "win_rate": win_rate,
        "avg_net_ev_all": avg_ev_all,
        "avg_net_ev_traded": avg_ev_traded,
        "avg_realized_pnl_traded": avg_pnl_traded,
    }
