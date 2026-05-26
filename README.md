# Kotak CC → Odoo Journal Entry Generator

A desktop app to parse Kotak Corporate Credit Card statements and push journal entries directly to Odoo.

## Features
- 📋 Drop any Kotak CC PDF → auto-extracts all transactions (works offline)
- 🔍 650 accounts + 24,000 partners in searchable dropdowns
- ⬆️ Push journal entries directly into Odoo (draft state, ready to review)
- ⬇️ Export to Odoo-ready XLSX as fallback
- 💾 Saves your Odoo credentials locally

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)

### Run
```bash
npm install
npm start
```

### Build (optional — creates .exe / .dmg)
```bash
npm run build-win    # Windows .exe
npm run build-mac    # Mac .dmg
```

## How to Use

### 1. Connect to Odoo
1. Click **🔗 Odoo Connection** tab
2. Enter your Odoo URL (e.g. `https://yourcompany.odoo.com`)
3. Enter **Database name** — usually visible in Settings → Technical → Databases
4. Enter your email and password
5. Click **🔌 Test Connection**
6. Once connected (green pill in header), click **💾 Save**

### 2. Parse Statement
1. Click **📋 CC Statement** tab
2. Drop your Kotak CC Statement PDF onto the upload zone
3. Transactions are extracted automatically (~5 seconds)

### 3. Review & Edit
- Edit Date, Narration, Partner, Debit/Credit accounts, Journal per row
- Use ↑↓ arrow keys to navigate narration fields
- Type to search in partner/account dropdowns
- Click **↓ Apply to All** to set one journal for all rows

### 4. Push to Odoo
- Click **⬆ Push to Odoo**
- Entries are created in Odoo as **draft Journal Entries**
- Review them in Odoo → Accounting → Journal Entries before posting

### 4b. Export XLSX (alternative)
- Click **⬇ Export XLSX** for the Odoo-ready spreadsheet to import manually

## Default Accounts
| | Account |
|---|---|
| Debit | 130001 Creditors |
| Credit | 124104 Kotak Corporate Credit Card KOL (RBR) |

Both are editable per row.

## Odoo API Notes
- Entries are created via Odoo's **JSON-RPC API** (`account.move` model)
- Created in **draft** state — you must post them manually in Odoo
- Journal and account names are resolved automatically by code lookup
- Partner is matched via Odoo External ID

## GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create kotak-cc-odoo --private
git push -u origin main
```

## Security
- Credentials stored in OS app data folder (not in the repo)
- Never commit `settings.json`
- For production use, consider using an Odoo API key instead of password
