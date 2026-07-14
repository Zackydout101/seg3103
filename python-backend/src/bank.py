"""A tiny bank-account backend used to demonstrate automated testing with pytest.

The logic here is intentionally small but non-trivial (branches, validation,
and error handling) so that the automated test suite and coverage reporting
have something meaningful to exercise.
"""

from __future__ import annotations


class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the available balance."""


class Account:
    """A minimal bank account supporting deposits, withdrawals and transfers."""

    def __init__(self, owner: str, balance: float = 0.0) -> None:
        if not owner or not owner.strip():
            raise ValueError("owner must be a non-empty string")
        if balance < 0:
            raise ValueError("balance cannot be negative")
        self.owner = owner.strip()
        self.balance = float(balance)
        self.history: list[str] = []

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("deposit amount must be positive")
        self.balance += amount
        self.history.append(f"deposit {amount:.2f}")
        return self.balance

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise InsufficientFundsError(
                f"cannot withdraw {amount:.2f}; balance is {self.balance:.2f}"
            )
        self.balance -= amount
        self.history.append(f"withdraw {amount:.2f}")
        return self.balance

    def transfer(self, other: "Account", amount: float) -> None:
        if not isinstance(other, Account):
            raise TypeError("can only transfer to another Account")
        self.withdraw(amount)
        other.deposit(amount)
        self.history.append(f"transfer {amount:.2f} to {other.owner}")


def apply_interest(balance: float, rate: float, years: int) -> float:
    """Return the balance after compounding ``rate`` annually for ``years``."""
    if rate < 0:
        raise ValueError("rate cannot be negative")
    if years < 0:
        raise ValueError("years cannot be negative")
    return round(balance * (1 + rate) ** years, 2)
