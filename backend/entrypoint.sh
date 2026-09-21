#!/bin/sh
set -e

echo "Waiting for PostgreSQL database at ${DB_HOST:-db}:${DB_PORT:-5432}..."

# Wait for database port to open
while ! nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  sleep 1
done

echo "PostgreSQL is available. Running migrations..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Starting Gunicorn WSGI server..."
exec gunicorn config.wsgi:application \
    --name kanban_backend \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
