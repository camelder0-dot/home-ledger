# Home Ledger

A free, private, offline checkbook and personal-finance ledger — the parts of Quicken most people actually use, without the subscription.

You type your transactions in yourself. Nothing connects to your bank, nothing is sent over the internet, and there is no account to sign up for. It's a regular desktop program for Windows, Mac and Linux, and your data is a file on your own computer.

## Download

Get the latest version from the [Releases page](https://github.com/camelder0-dot/home-ledger/releases/latest):

| Computer | Download | Notes |
|---|---|---|
| Windows | `Home-Ledger-…-windows-setup.exe` | Installs with a Start menu and desktop shortcut. |
| Windows (no install) | `Home-Ledger-…-windows-portable.exe` | Runs from anywhere, e.g. a USB stick. |
| Mac (Intel or Apple silicon) | `Home-Ledger-…-mac.dmg` | Open it and drag Home Ledger to Applications. |
| Linux | `Home-Ledger-…-linux.AppImage` or `.deb` | AppImage: make it executable and run it. |

**First launch warnings.** The app isn't code-signed (that costs a yearly fee), so your computer may warn you the first time:

- **Windows:** "Windows protected your PC" → click **More info** → **Run anyway**.
- **Mac:** "can't be opened because Apple cannot check it" → open **System Settings → Privacy & Security**, scroll down, click **Open Anyway**. (Or right-click the app → **Open**.)

You only have to do this once.

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
- **Bigger text** from the View menu, and light/dark mode that follows your system.

## Your data and privacy

- Everything saves automatically to **Documents → Home Ledger → My Finances.json** on your computer. Click **Show my data folder** in the app to find it.
- Once a day the app also keeps a copy in **Documents → Home Ledger → Backups** (the last 30 days).
- **File → Save a Backup Copy…** saves a copy wherever you like, such as a USB drive.
- **File → Open a Ledger File…** switches to another file, or restores a backup, e.g. when moving to a new computer.
- The app **cannot reach the internet**: every web request is refused, both by the desktop program and by the page itself. It has no accounts, analytics, ads or updates that phone home.
- The file is plain JSON, so your data is never locked in.

> Tip: put the Documents folder (or at least the Home Ledger folder) somewhere that's backed up: an external drive, or a cloud folder you trust.

## Building it yourself

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm start            # run the app
npm run dist:win     # build Windows installer + portable .exe into dist/
npm run dist:mac     # build the Mac .dmg (on a Mac)
npm run dist:linux   # build AppImage + .deb (on Linux)
```

The whole interface is one self-contained file, [`app/index.html`](app/index.html): plain HTML, CSS and JavaScript with no dependencies. `desktop/` is the small Electron wrapper that gives it a window and saves the file. Pushing a tag like `v1.2.0` makes GitHub Actions build all three platforms and attach them to a Release.

You can also open `app/index.html` directly in a browser to try it. In that case data is kept in the browser instead of a file.

## Contributing

Issues and pull requests are welcome. Ideas that would fit well: split transactions, scheduled/recurring bills, CSV import from bank downloads, budgets, and investment holdings.

## License

[MIT](LICENSE)
