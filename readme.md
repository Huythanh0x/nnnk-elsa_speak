# ELSA Study Set Seeder

Seed study sets into ELSA via the same API used by the app (e.g. from MITM/captured requests).

---

## 1. Dev: Python script

**Use when:** You develop locally and want to run from the terminal (no CORS issues).

- **Setup:** `python3 -m venv .venv && source .venv/bin/activate` (or `\.venv\Scripts\activate` on Windows), then `pip install -r requirements.txt`.
- **Run:** One study set per run; pass title and phrases (inline or from a file).

```bash
cd /path/to/elsa_speak
source .venv/bin/activate

# One study set from a phrases file
python3 elsa_study_set.py \
  --login-url "https://pool.elsanow.io/user/api/v2/account/login?verify=1772121893-h6CRzRqIP%2Fq1rTrkj9X7o5dFALReze460drbbRXsDb0%3D" \
  --email "YOUR_EMAIL" \
  --password "YOUR_PASSWORD" \
  --set-name "1- :p:" \
  --phrases-file "42 days/1- :p:.txt"
```

**Example – multiple sets (paste and run in terminal):**

```bash
LOGIN="--login-url https://pool.elsanow.io/user/api/v2/account/login?verify=1772121893-h6CRzRqIP%2Fq1rTrkj9X7o5dFALReze460drbbRXsDb0%3D --email YOUR_EMAIL --password YOUR_PASSWORD"
python3 elsa_study_set.py $LOGIN --set-name "1- :p:"    --phrases-file "42 days/1- :p:.txt"
python3 elsa_study_set.py $LOGIN --set-name "2- :b:"    --phrases-file "42 days/2- :b:.txt"
# ... repeat for other files. See `command.input` for a full list of phrase files.
```

---

## 2. Ordinary user: Web app

**Use when:** You just open the site in a browser (no install). If the API blocks the browser (CORS), use the Python script instead.

- **Open:** Go to the deployed URL (e.g. `https://<user>.github.io/<repo>/`).
- **First time:** Enter **access secret** (if the deployer set one), **email**, and **password**; they’re stored in the browser (localStorage).
- **Then:** Your profile loads; enter **study set title** and **content** (one phrase per line), use the preview on the right, then **Submit** or **Cancel**.

**Deploy to GitHub Pages (for maintainers):**

1. **Settings → Pages → Source:** **GitHub Actions**.
2. **Settings → Secrets and variables → Actions:** add secret **`ELSA_ACCESS_SECRET`** (the value users enter as “access secret”).
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow). The `web/` folder is deployed as the site.

---

## Example API (study_sets)

POST `https://pool.elsanow.io/clubs-server/v2/study_sets`  
Headers: `user-agent: elsa-google-play/7.2.9`, `x-access-token`, `x-session-token`, `content-type: application/json`.

Body shape: `author_id`, `is_public`, `name`, `phrases` (each phrase: `name`, `transcript` array with `text`, `trans`, `transcript_ipa`), `tag_id: "other"`.
