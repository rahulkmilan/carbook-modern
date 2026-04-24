"""
Management command to create an admin user.
Usage:
    python manage.py create_admin --username admin --email admin@carbook.com --password yourpassword
"""
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Create a Carbook admin user'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='admin', help='Admin username')
        parser.add_argument('--email', type=str, default='admin@carbook.com', help='Admin email')
        parser.add_argument('--password', type=str, default='Admin@1234', help='Admin password')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists.'))
            return

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(
            f'Success! Admin user "{user.username}" created successfully!\n'
            f'   Login at http://localhost:5173/login\n'
            f'   Username: {username}\n'
            f'   Password: {password}'
        ))
