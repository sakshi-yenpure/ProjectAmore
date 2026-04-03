# Amore Project Automation

# Local Windows Development
cleanup-ports:
	-powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force -ErrorAction SilentlyContinue"
	-powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess -Force -ErrorAction SilentlyContinue"

start-dev: cleanup-ports
	pm2 start ecosystem.config.js

stop-dev:
	pm2 stop all

restart-dev:
	pm2 restart all

logs-back:
	pm2 logs amore-backend

logs-front:
	pm2 logs amore-frontend

status:
	pm2 status

# Azure Ubuntu Production
start-prod:
	pm2 start ecosystem.production.js

deploy:
	git pull
	cd backend && ./venv/bin/pip install -r requirements.txt
	cd backend && ./venv/bin/python manage.py migrate
	cd frontend && npm install && npm run build
	pm2 restart all
	pm2 save
	pm2 logs

# Housekeeping
clean-logs:
	pm2 flush
	rm -rf logs/*.log

monit:
	pm2 monit
