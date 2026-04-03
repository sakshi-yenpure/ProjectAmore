# PM2 Setup & Operations Guide

This guide describes how to manage the **Amore** platform using PM2 for process management in both local development (Windows) and production (Azure Ubuntu).

---

## 💻 WINDOWS LOCAL DEVELOPMENT

### 1. Installation
Ensure Node.js is installed, then run the following in **PowerShell as Administrator**:
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
pm2-windows-startup install
```

### 2. Launching the App
Make sure your Python virtual environment is ready at `backend/venv/`. Then, from the project root:
```powershell
# Create logs directory if it doesn't exist
mkdir logs

# Start the dev stack
pm2 start ecosystem.config.js

# Save process list to auto-start on boot
pm2 save
```

### 3. Maintenance Commands
- **Check Status**: `pm2 status`
- **View Logs (Backend)**: `pm2 logs amore-backend`
- **View Logs (Frontend)**: `pm2 logs amore-frontend`
- **Restart All**: `pm2 restart all`
- **Stop All**: `pm2 stop all`
- **Monitor**: `pm2 monit`

---

## 🌩️ AZURE UBUNTU VM (PRODUCTION)

### 1. Install Node.js & PM2
Run these commands on your Ubuntu VM:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 2. Backend & Frontend Preparation
```bash
# Backend Setup
cd /home/azureuser/amore/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
deactivate

# Frontend Setup
cd /home/azureuser/amore/frontend
npm install
npm run build
```

### 3. Startup Configuration
Set up PM2 to launch on system boot:
```bash
pm2 startup systemd
# !!! IMPORTANT !!! 
# Copy and run the specific command returned by the previous line.
# It will look like: sudo env PATH=$PATH:/usr/bin ...
```

### 4. Launching Production
```bash
# Ensure log directory exists
sudo mkdir -p /var/log/amore
sudo chown -R azureuser:azureuser /var/log/amore

# Start everything
cd /home/azureuser/amore
pm2 start ecosystem.production.js
pm2 save
```

### 5. Check Status
- **Check Status**: `pm2 status`
- **Logs**: `pm2 logs`
- **Monitoring**: `pm2 monit`

---

## 🛠️ Update & Restart Workflow
If you pull new code changes (`git pull`):
```bash
# From project root
pm2 restart all
```
For production build updates:
```bash
cd frontend && npm run build
pm2 restart amore-frontend
```
