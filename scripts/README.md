# Firebase Data Seeding

This directory contains scripts to seed fake data into your Firebase Firestore database.

## Prerequisites

1. **Firebase Admin SDK Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `freshstlstore-99511217-ca510`
   - Navigate to: **Project Settings** > **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the downloaded JSON file as `serviceAccountKey.json` in the **project root** (not in the scripts folder)

2. **Install Dependencies**
   ```bash
   npm install firebase-admin --save-dev
   ```

## What Gets Seeded

The script will create:

- **10 Users** with authentication accounts
  - Email: john.doe@example.com, jane.smith@example.com, etc.
  - Password: `password123` (for all test users)
  
- **12 Products** (3D printing models)
  - Various categories: Cosplay, Miniatures, Home Decor, Tech, Toys, Art
  
- **6 Coupons**
  - FRESH10 (10% off)
  - MAKER20 (20% off)
  - WELCOME15 (15% off)
  - ADMIN100 (100% off)
  - SUMMER25 (25% off)
  - EXPIRED50 (50% off, inactive)

- **~60 Reviews** (3-8 per product)
  - Random ratings and comments
  - Distributed across all products

- **~50 Orders** (3-7 per user)
  - Various statuses: completed, pending, failed
  - Random items and amounts

- **~50 Payments** (one per order)
  - Linked to orders
  - Various payment methods and statuses

- **~30 Wishlist Items** (2-5 per user)
  - Random products saved by users

## How to Run

1. Make sure you have the service account key in the project root:
   ```
   freshstl.com/
   ├── serviceAccountKey.json  ← Must be here
   ├── scripts/
   │   └── seedFirebase.js
   └── ...
   ```

2. Run the seeding script:
   ```bash
   node scripts/seedFirebase.js
   ```

3. The script will output progress as it seeds each collection.

## Firestore Structure

Data will be organized as:

```
artifacts/
  freshstl-com/
    ├── public/
    │   └── data/
    │       ├── products/
    │       ├── reviews/
    │       └── coupons/
    ├── users/
    │   └── {userId}/
    │       └── wishlist/
    ├── orders/
    └── payments/
```

## Notes

- The script is **idempotent** for users (won't create duplicates)
- Products, orders, and other data will be added each time you run it
- To reset, manually delete collections from Firebase Console
- All timestamps are randomized within the last 120 days

## Troubleshooting

**Error: serviceAccountKey.json not found**
- Download the service account key from Firebase Console
- Place it in the project root directory

**Error: Permission denied**
- Make sure your service account has the necessary permissions
- Check Firebase Console > IAM & Admin

**Error: Cannot find module 'firebase-admin'**
- Run: `npm install firebase-admin --save-dev`
