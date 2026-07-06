# Quick Deploy Guide — IP-based (no domain)

## Prerequisites
- Server: `202.133.91.13`
- SSH access as root
- Archive: `ayantaraz-prod-20260627.tar.gz`

---

## Step 1: Transfer (from Windows)

```powershell
scp C:\Users\moji\ayantaraz-prod-20260627.tar.gz root@202.133.91.13:/tmp/
```

## Step 2: SSH + Extract

```bash
ssh root@202.133.91.13

mkdir -p /opt/ayan-taraz/releases
tar -xzf /tmp/ayantaraz-prod-20260627.tar.gz -C /opt/ayan-taraz/releases/20260627

# Fix nested directory
shopt -s dotglob
mv /opt/ayan-taraz/releases/20260627/ayantaraz/* /opt/ayan-taraz/releases/20260627/
rm -rf /opt/ayan-taraz/releases/20260627/ayantaraz

ln -sfn /opt/ayan-taraz/releases/20260627 /opt/ayan-taraz/current
```

## Step 3: Bootstrap (first time only)

```bash
bash /opt/ayan-taraz/current/scripts/bootstrap.sh
```

## Step 4: Set SMS Key

```bash
nano /opt/ayan-taraz/env/current.env
# Replace: SMS_API_KEY=CHANGE_ME_TO_REAL_S_API_IR_KEY
```

## Step 5: Deploy

```bash
ayan-deploy lock
ayan-deploy release 20260627
ayan-deploy gate 20260627
ayan-deploy activate 20260627
ayan-deploy pass
```

## Step 6: Verify

```bash
ayan-deploy health
```

---

## Access
- Frontend: `http://202.133.91.13`
- API: `http://202.133.91.13:3001`

## Troubleshooting

```bash
ayan-deploy health
ayan-deploy events 20
ayan-deploy consistency
docker logs havingaraz-api --tail 50
```
