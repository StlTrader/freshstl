#!/bin/bash

echo "========================================"
echo "Firebase Data Seeding - Quick Start"
echo "========================================"
echo ""

# Check if service account key exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "[ERROR] serviceAccountKey.json not found!"
    echo ""
    echo "Please download your Firebase service account key:"
    echo "  1. Go to: https://console.firebase.google.com/"
    echo "  2. Select project: freshstlstore-99511217-ca510"
    echo "  3. Click gear icon > Project Settings > Service Accounts"
    echo "  4. Click 'Generate New Private Key'"
    echo "  5. Save as serviceAccountKey.json in this folder"
    echo ""
    exit 1
fi

echo "[OK] Service account key found!"
echo ""
echo "Starting Firebase data seeding..."
echo ""

node scripts/seedFirebase.js

echo ""
echo "========================================"
echo "Seeding Complete!"
echo "========================================"
echo ""
echo "Test user credentials:"
echo "  Email: john.doe@example.com"
echo "  Password: password123"
echo ""
echo "(Same password for all test users)"
echo ""
