# Home Ledger

A free, private, offline checkbook and personal-finance ledger — the parts of Quicken most people actually use, without the subscription.

You type your transactions in yourself. Nothing connects to your bank, nothing is sent over the internet, and there is no account to sign up for. It's one HTML file: download it, double-click it, and it opens in your browser.

## Features

- **Multiple accounts** — checking, savings, cash, credit cards, loans/mortgages, investments and other assets, grouped in a sidebar with live balances and net worth.
- **Check register** — date, check number, payee, category, memo, payment/deposit, cleared status and a running balance, just like a paper checkbook.
- **Quick entry** — press Enter to record. Type a payee you've used before and the category and amount fill in automatically. In the date box, `+` / `-` move a day and `t` jumps to today.
- **Transfers** — pick another account as the category (e.g. `[Savings]`) and the matching entry is created on the other side. Edit or delete one and the other follows.
- **Reconcile** — enter your statement's ending balance, check off what cleared, and finish when the difference is $0.00.
- **Reports** — spending and income by category, and month-by-month in/out/net, for this month, last month, this year, last 12 months, last year, all time or custom dates. Printable.
- **Categories** — sensible defaults you can rename, add, delete or switch between income and expense.
- **Search and filter** the register by text, amount or date range.
- **Export to CSV** for Excel or your accountant, per account or everything.
- **Light and dark mode** follows your system setting.

## Getting started

1. Download [`Home Ledger.html`](Home%20Ledger.html) (or clone this repo).
2. Double-click it. It opens in your web browser — Microsoft Edge or Google Chrome recommended.
3. Click **Add your first account**, or **Try it with made-up data** to look around first.

## Where your data is saved

Everything you enter is saved automatically in your browser on that computer.

For a real copy you can back up, click **Save to a file…** (Edge and Chrome) and choose where to keep it — for example `Documents\My Finances.ledger.json`. From then on every change is saved to that file automatically. When you reopen the app, the browser may ask you to click **Reconnect** once to allow it to keep writing to the file.

- **Download backup copy** saves a dated snapshot whenever you like.
- **Open a file…** loads a ledger file (or a backup) — handy for moving to a new computer.
- Firefox and Safari can use the app too; use **Download backup copy** to save and **Open a file…** to restore.

The file is plain JSON, so your data is never locked in.

> Tip: keep your ledger file in a folder that's backed up (OneDrive, Dropbox, an external drive). Clearing your browser's site data erases the in-browser copy, but not your saved file.

## Contributing

Issues and pull requests are welcome. The whole app is a single self-contained file (`Home Ledger.html`) with plain HTML, CSS and JavaScript — no build step, no dependencies. To work on it, open the file in a browser, edit, and refresh.

Ideas that would fit well: split transactions, scheduled/recurring bills, CSV import from bank downloads, budgets, and investment holdings.

## License

[MIT](LICENSE)
