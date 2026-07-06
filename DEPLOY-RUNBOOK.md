# EXECUTION RUNBOOK (FINAL — 2026 SAFE)

## ▶️ 1. انتقال آرشیو (از ویندوز)

```powershell
scp C:\Users\moji\ayantaraz-prod-20260627.tar.gz root@202.133.91.13:/tmp/
ssh root@202.133.91.13
```

---

## ▶️ 2. استخراج (IDEMPOTENT SAFE)

```bash
mkdir -p /opt/ayan-taraz/releases

tar -xzf /tmp/ayantaraz-prod-20260627.tar.gz \
  -C /opt/ayan-taraz/releases/20260627

# اصلاح ساختار پوشه (فایل‌ها داخل havingaraz/ هستند)
shopt -s dotglob
mv /opt/ayan-taraz/releases/20260627/ayantaraz/* /opt/ayan-taraz/releases/20260627/
rm -rf /opt/ayan-taraz/releases/20260627/ayantaraz

ln -sfn /opt/ayan-taraz/releases/20260627 \
  /opt/ayan-taraz/current
```

---

## ▶️ 3. BOOTSTRAP (IDEMPOTENT + SAFE)

```bash
bash /opt/ayan-taraz/current/scripts/bootstrap.sh
```

> این اسکریپت همه چیز را انجام می‌دهد: Docker, کاربر, دایرکتوری‌ها, رمزها, .env, ayan-deploy

---

## ▶️ 4. SMS KEY (MANUAL ONLY — CONTROLLED MUTATION)

```bash
nano /opt/ayan-taraz/env/current.env
```

```text
SMS_API_KEY=REPLACE_WITH_REAL_VALUE
```

---

## ▶️ 5. DEPLOY FLOW (STRICT ORDER — NO SKIP)

```bash
ayan-deploy lock
ayan-deploy release 20260627
ayan-deploy gate 20260627
ayan-deploy activate 20260627
ayan-deploy pass
```

---

## ▶️ 6. HEALTH CHECK (FINAL VALIDATION)

```bash
ayan-deploy health
```

---

# CRITICAL RULES (NON-NEGOTIABLE)

- هیچ مرحله‌ای skip نشود
- release قبل از lock ممنوع
- activate قبل از gate ممنوع
- pass بدون activate ممنوع
- bootstrap فقط یکبار اجرا شود

---

# GUARANTEE MODEL

- no race condition
- no partial deploy ambiguity
- no orphan state
- no double activation
- deterministic final state
