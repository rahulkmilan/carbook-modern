#!/usr/bin/env bash
# Render.com build script — runs before server starts
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
