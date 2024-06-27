#!/bin/sh

# 等待数据库准备就绪
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database started"

# 运行数据库迁移
python manage.py makemigrations resume
python manage.py migrate resume

# 启动Gunicorn
exec gunicorn resume_advisor.wsgi:application --bind 0.0.0.0:8000