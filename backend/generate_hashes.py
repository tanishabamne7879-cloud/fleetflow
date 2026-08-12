import bcrypt

def generate_hash(password):
    """Generate bcrypt hash"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password, hashed):
    """Verify password"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

print("=" * 60)
print("BCRYPT HASH GENERATOR")
print("=" * 60)

users = [
    ("admin@fleetflow.com", "admin123", "Admin User", "9876543210", "Admin"),
    ("driver@fleetflow.com", "driver123", "Driver User", "9876543211", "Driver"),
    ("test@fleetflow.com", "test123", "Test User", "9876543212", "Driver"),
    ("manager@fleetflow.com", "manager123", "Fleet Manager", "9876543213", "FleetManager"),
    ("dispatcher@fleetflow.com", "dispatcher123", "Dispatcher", "9876543214", "Dispatcher"),
]

for email, password, name, phone, role in users:
    hashed = generate_hash(password)
    print(f"\n{role}: {name}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"Hash: {hashed}")
    # Test verification
    verified = verify_password(password, hashed)
    print(f"Test: {'✅ Verified' if verified else '❌ Failed'}")
    print("-" * 40)