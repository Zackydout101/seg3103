"""Automated pytest suite for the Python bank backend."""

import pytest

from src.bank import Account, InsufficientFundsError, apply_interest


def test_new_account_defaults():
    acc = Account("Alice")
    assert acc.owner == "Alice"
    assert acc.balance == 0.0
    assert acc.history == []


@pytest.mark.parametrize("bad_owner", ["", "   ", None])
def test_invalid_owner_rejected(bad_owner):
    with pytest.raises(ValueError):
        Account(bad_owner)


def test_negative_starting_balance_rejected():
    with pytest.raises(ValueError):
        Account("Bob", -10)


def test_deposit_increases_balance():
    acc = Account("Alice", 100)
    assert acc.deposit(50) == 150
    assert "deposit 50.00" in acc.history


@pytest.mark.parametrize("bad_amount", [0, -5])
def test_deposit_must_be_positive(bad_amount):
    acc = Account("Alice")
    with pytest.raises(ValueError):
        acc.deposit(bad_amount)


def test_withdraw_decreases_balance():
    acc = Account("Alice", 100)
    assert acc.withdraw(40) == 60


def test_withdraw_too_much_raises():
    acc = Account("Alice", 30)
    with pytest.raises(InsufficientFundsError):
        acc.withdraw(100)


def test_withdraw_must_be_positive():
    acc = Account("Alice", 30)
    with pytest.raises(ValueError):
        acc.withdraw(-1)


@pytest.mark.parametrize(
    "amount,expected",
    [(50, True), (100, True), (150, False), (0, False), (-10, False)],
)
def test_can_afford(amount, expected):
    acc = Account("Alice", 100)
    assert acc.can_afford(amount) is expected


def test_transfer_between_accounts():
    a = Account("Alice", 100)
    b = Account("Bob", 0)
    a.transfer(b, 60)
    assert a.balance == 40
    assert b.balance == 60
    assert "transfer 60.00 to Bob" in a.history


def test_transfer_to_non_account_raises():
    a = Account("Alice", 100)
    with pytest.raises(TypeError):
        a.transfer("not-an-account", 10)


@pytest.mark.parametrize(
    "balance,rate,years,expected",
    [
        (1000, 0.05, 0, 1000.0),
        (1000, 0.05, 1, 1050.0),
        (1000, 0.10, 2, 1210.0),
    ],
)
def test_apply_interest(balance, rate, years, expected):
    assert apply_interest(balance, rate, years) == expected


@pytest.mark.parametrize("rate,years", [(-0.1, 1), (0.1, -1)])
def test_apply_interest_invalid_args(rate, years):
    with pytest.raises(ValueError):
        apply_interest(1000, rate, years)
