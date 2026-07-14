# SEG3103 – Test Automation & Continuous Integration Project

This project evaluates **four tools** across two complementary layers of automation:
**test execution frameworks** and **continuous-integration platforms**. A small
banking application is implemented twice — in **Python** and **JavaScript** — so
that both test frameworks can be exercised against the same logic, and both CI
platforms can orchestrate the same test suites.

## The four tools

| Tool                   | Category       | Ecosystem               | Role                                                       |
| ---------------------- | -------------- | ----------------------- | ---------------------------------------------------------- |
| **pytest** + pytest-cov | Test framework | Python                  | Discovers and executes Python tests, measures coverage     |
| **Jest**               | Test framework | JavaScript / Node.js    | Discovers and executes JavaScript tests, measures coverage |
| **Jenkins**            | CI platform    | Self-hosted             | Runs both test suites through a customizable pipeline      |
| **CircleCI**           | CI platform    | Managed cloud CI        | Runs both test suites through GitHub-integrated cloud jobs |

### How the layers fit together

```
                         ┌───────────────┐
Python application ────▶│ pytest         │
                         └───────┬───────┘
                                 │
                                 ├──▶ Jenkins (self-hosted pipeline)
                                 ├──▶ CircleCI (cloud workflow)
                                 └──▶ GitHub Actions (reference CI)
                                 │
                         ┌───────┴───────┐
JavaScript application ▶│ Jest           │
                         └───────────────┘
```

- **pytest** and **Jest** discover tests, run them, report pass/fail, and
  generate coverage. They are not CI platforms — they do not decide when or
  where tests execute.
- **Jenkins** and **CircleCI** automate *when, where, and under what conditions*
  those tests run. They invoke the same pytest and Jest commands that can be
  run locally.
- **GitHub Actions** remains in the repository as the original reference CI
  implementation (see below). It is supporting infrastructure rather than one
  of the four evaluation tools.

## 1. pytest (with pytest-cov)

- **Automation focus:** auto-discovers `test_*.py` files, parametrizes cases
  with `@pytest.mark.parametrize`, and asserts on exceptions with
  `pytest.raises`.
- **CI focus:** exit code signals success/failure; `pytest-cov` emits
  `coverage.xml` that CI platforms archive as a build artifact.
- Configured in [`python-backend/pytest.ini`](python-backend/pytest.ini).

## 2. Jest

- **Automation focus:** auto-discovers `*.test.js` files, uses `test.each` for
  data-driven cases, and `expect(...).toThrow()` for error paths.
- **CI focus:** `jest --coverage` produces an `lcov` report and returns a
  non-zero exit code on failure so CI can gate the build.
- Configured via the `test` script in
  [`js-backend/package.json`](js-backend/package.json).

## 3. Jenkins

The [`Jenkinsfile`](Jenkinsfile) at the repository root defines a declarative
pipeline that:
1. Checks out the repository.
2. Runs Python and JavaScript test stages **in parallel**.
3. Archives `coverage.xml` and the JS `coverage/` directory on every build.

### Running with Jenkins

1. Install Jenkins (Docker is the quickest path).
2. Create a new **Pipeline** item and point it at this repository.
3. Jenkins will automatically read the `Jenkinsfile`.
4. The pipeline runs both test suites in parallel on the same agent.

**Agent requirements:** Git, Python 3, pip, Node.js, npm.

## 4. CircleCI

The [`.circleci/config.yml`](.circleci/config.yml) defines two independent
jobs that execute **concurrently** in a single workflow:

| Job             | Image             | Purpose                      |
| --------------- | ----------------- | ---------------------------- |
| `python-tests`  | `cimg/python:3.12`| Install deps → run pytest    |
| `javascript-tests` | `cimg/node:20.0` | `npm ci` → `npm test`     |

Artifacts (`coverage.xml`, `htmlcov/`, `coverage/`) are stored for each job.

### Connecting to CircleCI

1. Push this repository to GitHub.
2. Go to [app.circleci.com](https://app.circleci.com) and add your GitHub
   repository.
3. CircleCI automatically detects `.circleci/config.yml` and runs the workflow
   on every push.

## GitHub Actions (reference pipeline)

The existing [`.github/workflows/ci.yml`](.github/workflows/ci.yml) is the
repository’s **original CI implementation**. It:

- runs on every push and pull request;
- uses separate jobs for Python (pytest) and JavaScript (Jest);
- runs those jobs in parallel on `ubuntu-latest` GitHub-hosted runners;
- uploads coverage as build artifacts.

GitHub Actions is **not** one of the four evaluation tools because it was
already substantially implemented by the teammate who contributed pytest and
Jest. It is preserved here as a reference example of repository-integrated CI
and as a fallback quality gate.

## Reusable test scripts

The [`scripts/`](scripts/) directory contains two shell scripts that each CI
platform calls:

- [`scripts/test-python.sh`](scripts/test-python.sh) — enters `python-backend/`,
  installs dependencies, runs pytest.
- [`scripts/test-javascript.sh`](scripts/test-javascript.sh) — enters
  `js-backend/`, runs `npm ci` (or `npm install`), runs `npm test`.

These scripts ensure that every CI platform executes the **same** commands,
reducing configuration drift and keeping the comparison fair.

## Project structure

```
seg3103/
├── .circleci/
│   └── config.yml              # CircleCI workflow
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions (reference CI)
├── Jenkinsfile                  # Jenkins declarative pipeline
├── scripts/
│   ├── test-python.sh           # Reusable test script (Python)
│   └── test-javascript.sh       # Reusable test script (JavaScript)
├── python-backend/
│   ├── src/bank.py              # Python backend logic
│   ├── tests/test_bank.py       # pytest suite
│   ├── pytest.ini               # pytest + coverage config
│   └── requirements.txt
├── js-backend/
│   ├── src/bank.js              # JavaScript backend logic
│   ├── tests/bank.test.js       # Jest suite
│   ├── package.json             # Jest config + scripts
│   └── package-lock.json
└── README.md
```

## Running locally

### Python (pytest)
```bash
cd python-backend
pip install -r requirements.txt
pytest
```

### JavaScript (Jest)
```bash
cd js-backend
npm install
npm test
```

### Using the reusable scripts (from repository root)
```bash
./scripts/test-python.sh
./scripts/test-javascript.sh
```

## What the backend does

Both modules implement the same small banking domain — an `Account` supporting
`deposit`, `withdraw`, `transfer`, and a compound-interest helper — with
validation and error handling. The identical behavior in two languages makes it
easy to compare how each tool automates the same set of test scenarios.

### Python coverage (18 tests, 100%)
```text
Name              Stmts   Miss  Cover
-------------------------------------
src/__init__.py       0      0   100%
src/bank.py          37      0   100%
-------------------------------------
TOTAL                37      0   100%
```

### JavaScript coverage (17 tests, 100%)
```text
File       | % Stmts | % Branch | % Funcs | % Lines
-----------|---------|----------|---------|---------
bank.js    |     100 |      100 |     100 |     100
```
