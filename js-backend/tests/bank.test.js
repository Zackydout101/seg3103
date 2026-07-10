const { Account, InsufficientFundsError, applyInterest } = require("../src/bank");

describe("Account creation", () => {
  test("new account has sensible defaults", () => {
    const acc = new Account("Alice");
    expect(acc.owner).toBe("Alice");
    expect(acc.balance).toBe(0);
    expect(acc.history).toEqual([]);
  });

  test.each(["", "   "])("rejects invalid owner %p", (badOwner) => {
    expect(() => new Account(badOwner)).toThrow("owner must be a non-empty string");
  });

  test("rejects negative starting balance", () => {
    expect(() => new Account("Bob", -10)).toThrow("balance cannot be negative");
  });
});

describe("deposit", () => {
  test("increases balance and records history", () => {
    const acc = new Account("Alice", 100);
    expect(acc.deposit(50)).toBe(150);
    expect(acc.history).toContain("deposit 50.00");
  });

  test.each([0, -5])("rejects non-positive amount %p", (bad) => {
    const acc = new Account("Alice");
    expect(() => acc.deposit(bad)).toThrow("deposit amount must be positive");
  });
});

describe("withdraw", () => {
  test("decreases balance", () => {
    const acc = new Account("Alice", 100);
    expect(acc.withdraw(40)).toBe(60);
  });

  test("throws when insufficient funds", () => {
    const acc = new Account("Alice", 30);
    expect(() => acc.withdraw(100)).toThrow(InsufficientFundsError);
  });

  test("rejects non-positive amount", () => {
    const acc = new Account("Alice", 30);
    expect(() => acc.withdraw(-1)).toThrow("withdrawal amount must be positive");
  });
});

describe("canAfford", () => {
  test.each([
    [50, true],
    [100, true],
    [150, false],
    [0, false],
    [-10, false],
  ])("amount %p -> %p", (amount, expected) => {
    const acc = new Account("Alice", 100);
    expect(acc.canAfford(amount)).toBe(expected);
  });
});

describe("transfer", () => {
  test("moves funds between accounts", () => {
    const a = new Account("Alice", 100);
    const b = new Account("Bob", 0);
    a.transfer(b, 60);
    expect(a.balance).toBe(40);
    expect(b.balance).toBe(60);
    expect(a.history).toContain("transfer 60.00 to Bob");
  });

  test("rejects transfer to non-account", () => {
    const a = new Account("Alice", 100);
    expect(() => a.transfer("nope", 10)).toThrow(TypeError);
  });
});

describe("applyInterest", () => {
  test.each([
    [1000, 0.05, 0, 1000],
    [1000, 0.05, 1, 1050],
    [1000, 0.1, 2, 1210],
  ])("compounds %p at %p for %p years", (balance, rate, years, expected) => {
    expect(applyInterest(balance, rate, years)).toBe(expected);
  });

  test.each([
    [-0.1, 1],
    [0.1, -1],
  ])("rejects invalid args rate=%p years=%p", (rate, years) => {
    expect(() => applyInterest(1000, rate, years)).toThrow();
  });
});
