// A tiny bank-account backend used to demonstrate automated testing with Jest.
// The logic mirrors the Python module so the project can showcase two separate
// test-automation tools (pytest and Jest) under one CI pipeline.

class InsufficientFundsError extends Error {
  constructor(message) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

class Account {
  constructor(owner, balance = 0) {
    if (!owner || !owner.trim()) {
      throw new Error("owner must be a non-empty string");
    }
    if (balance < 0) {
      throw new Error("balance cannot be negative");
    }
    this.owner = owner.trim();
    this.balance = Number(balance);
    this.history = [];
  }

  deposit(amount) {
    if (amount <= 0) {
      throw new Error("deposit amount must be positive");
    }
    this.balance += amount;
    this.history.push(`deposit ${amount.toFixed(2)}`);
    return this.balance;
  }

  withdraw(amount) {
    if (amount <= 0) {
      throw new Error("withdrawal amount must be positive");
    }
    if (amount > this.balance) {
      throw new InsufficientFundsError(
        `cannot withdraw ${amount.toFixed(2)}; balance is ${this.balance.toFixed(2)}`
      );
    }
    this.balance -= amount;
    this.history.push(`withdraw ${amount.toFixed(2)}`);
    return this.balance;
  }

  canAfford(amount) {
    return amount > 0 && amount <= this.balance;
  }

  transfer(other, amount) {
    if (!(other instanceof Account)) {
      throw new TypeError("can only transfer to another Account");
    }
    this.withdraw(amount);
    other.deposit(amount);
    this.history.push(`transfer ${amount.toFixed(2)} to ${other.owner}`);
  }
}

function applyInterest(balance, rate, years) {
  if (rate < 0) {
    throw new Error("rate cannot be negative");
  }
  if (years < 0) {
    throw new Error("years cannot be negative");
  }
  return Math.round(balance * (1 + rate) ** years * 100) / 100;
}

module.exports = { Account, InsufficientFundsError, applyInterest };
