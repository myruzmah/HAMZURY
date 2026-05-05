# Credentials to rotate — do this today

**Why this exists:** the `.env` file in this repo currently contains live
production credentials. `.gitignore` keeps it out of git, but anyone with
filesystem access (laptop, backup drive, shared dev machine) can read
them. The fix is to rotate the keys at each provider, then move the new
values into Railway's environment-variable settings instead of `.env`.

## Step 1 — rotate at each provider

Tick each one off as you go.

### Anthropic API key

- **Current value in `.env`:** `ANTHROPIC_API_KEY` (key starting with `sk-ant-api03-…`)
- **Where to rotate:** [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys
- **Steps:** create a new key called `hamzury-prod-2026-04` (or similar with rotation date), copy the value, then delete or disable the old one in the same panel.

### Qwen / Alibaba Cloud API key

- **Current value in `.env`:** `QWEN_API_KEY` (key starting with `sk-…`)
- **Where to rotate:** the Alibaba Cloud / Qwen console where the key was generated.
- **Steps:** revoke the old key, create a fresh one, label it with today's date.

### Zoho SMTP password

- **Current value in `.env`:** `SMTP_PASS` (12-character app password)
- **Where to rotate:** [zoho.com](https://accounts.zoho.com) → My Account → Security → App Passwords
- **Steps:** revoke the existing app password named for HAMZURY mail. Generate a new one. The Zoho account itself can keep the same login password — you only rotate the *app* password used by SMTP.

### JWT secret

- **Current value in `.env`:** `JWT_SECRET=hamzury-prod-jwt-secret-change-this-before-deploy-2026`
- **Where to rotate:** generate a new random 32+ char string. Easiest: `openssl rand -hex 32`
- **Side effect:** rotating this invalidates **every staff session cookie**. All staff will need to log in again. Coordinate the rollout (after hours, or with a heads-up message).

### Vault encryption key

- **Current value in `.env`:** `VAULT_ENCRYPTION_KEY`
- **What it does:** encrypts values stored in `clientCredentials` (the password vault for client-side accounts).
- **Important:** if you rotate this **without re-encrypting existing rows**, every stored credential becomes unreadable. Steps:
  1. Generate a new 32-byte hex key: `openssl rand -hex 32`
  2. Read every row in `client_credentials`, decrypt with the OLD key, re-encrypt with the NEW key.
  3. Only then swap the value in Railway env.
- **If no critical credentials are stored yet:** you can rotate immediately and accept that any existing rows become unreadable (only matters if you've stored real client passwords already).

### CHAT_EVENTS_TOKEN, CREDENTIALS_KEY, AGENT_SCHEDULER_ENABLED

- These are minor / optional — rotate if you want clean baseline, but they're not exposed externally the same way.

## Step 2 — kill the legacy `*_PW` placeholders

The following entries are left over from a deprecated login path and **should be deleted from `.env`**:

```
FOUNDER_PW=ChangeThisFounderPassword2026!
CEO_PW=ChangeThisCEOPassword2026!
CSO_PW=ChangeThisCSOPassword2026!
FINANCE_PW=ChangeThisFinancePassword2026!
HR_PW=ChangeThisHRPassword2026!
BIZDEV_PW=ChangeThisBizDevPassword2026!
```

The current login path uses the `staffUsers` table with hashed passwords. Those env vars aren't read by the production code anymore. Just delete the whole block.

## Step 3 — move the new values to Railway

For each key you rotated:

1. Open Railway dashboard → your HAMZURY service → Variables tab.
2. Add (or update) the variable with the new value.
3. Don't put the new value back into the local `.env` — leave that file with placeholders only. Use a `.env.local` if you need different values for local dev.

## Step 4 — confirm staff `Hamzury@2026` is no longer accepted

Today's deploy includes a fix that forces every staff member to change their seeded `Hamzury@2026` default on first login. After they change it once, the default is dead.

You can also run `pnpm seed:staff` to re-seed. Or, for a hard rotation, run a one-off SQL:

```sql
UPDATE staff_users SET firstLogin = TRUE, passwordChanged = FALSE;
```

That marks every existing staff account as "must change on next login" — same effect, applied across the whole roster.

## Step 5 — confirm the dev-login backdoor is gated

The previous `/api/dev-login` route only checked `NODE_ENV !== "production"`. As of today, it requires THREE conditions: `NODE_ENV !== "production"` AND `ALLOW_DEV_LOGIN === "true"` AND localhost-only request. So even if `NODE_ENV` is wrong on Railway, the route is still gated by `ALLOW_DEV_LOGIN` (which you should never set in production).

Verify on Railway: confirm `ALLOW_DEV_LOGIN` is **not** set, and `NODE_ENV=production` is set.

---

## Quick checklist

- [ ] Anthropic API key rotated
- [ ] Qwen / Alibaba key rotated
- [ ] Zoho SMTP app password rotated
- [ ] JWT_SECRET rotated (warn staff about sign-out)
- [ ] VAULT_ENCRYPTION_KEY plan made (rotate or accept existing rows lost)
- [ ] `*_PW` env vars deleted from `.env`
- [ ] All new values in Railway variables, not `.env`
- [ ] `ALLOW_DEV_LOGIN` is unset on Railway
- [ ] `NODE_ENV=production` confirmed on Railway

When this list is complete, the credential surface is closed. Until then, treat every backup of this machine as a leak.
