# Firebase Security Rules Deployment Guide

## Overview

This project now includes comprehensive security rules for both **Firestore Database** and **Firebase Storage**.

## Files Created/Updated

- `firestore.rules` - Database security rules (updated)
- `storage.rules` - Storage security rules (new)

## Deploying Rules to Firebase

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not done):
   ```bash
   firebase init
   ```
   - Select "Firestore" and "Storage"
   - Choose your existing project
   - Accept default file names (firestore.rules and storage.rules)

4. **Deploy Rules**:
   ```bash
   # Deploy both Firestore and Storage rules
   firebase deploy --only firestore:rules,storage:rules
   ```
   
   Or deploy individually:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

### Option 2: Firebase Console (Manual)

#### Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy contents of `firestore.rules` and paste
5. Click **Publish**

#### Storage Rules:
1. In Firebase Console, navigate to **Storage** → **Rules** tab
2. Copy contents of `storage.rules` and paste
3. Click **Publish**

## Security Rules Breakdown

### Firestore Rules

**Public Access:**
- ✅ Products (read-only)
- ✅ Reviews (read-only)
- ✅ Coupons (read-only for validation)

**Authenticated Users:**
- ✅ Create orders and payments
- ✅ Add/edit products
- ✅ Submit reviews
- ✅ Manage their own wishlist
- ✅ View their purchases

**Admin Only:**
- ✅ Delete products
- ✅ Manage coupons
- ✅ Modify orders and payments
- ✅ Update any user data

### Storage Rules

**Product Images & Models:**
- ✅ Public read access
- ✅ Authenticated users can upload
- ✅ Max 10MB for images
- ✅ Max 100MB for 3D models (.stl files)
- ✅ Type validation (images and models only)

**User Downloads:**
- ✅ Users can only access their own purchases
- ✅ Private storage per user

**Admin Uploads:**
- ✅ Special admin folder with restricted access

## File Size Limits

- **Product Images**: 10 MB max
- **3D Models (.stl)**: 100 MB max
- **Profile Images**: 5 MB max

## Testing Rules

After deploying, test that:

1. ✅ Anonymous users can browse products
2. ✅ Logged-in users can add products to cart
3. ✅ Logged-in users can complete checkout (creates order/payment)
4. ✅ Admin can upload product images
5. ✅ Admin can upload STL files
6. ✅ Users can only see their own purchases

## Troubleshooting

**"Permission Denied" errors:**
- Ensure you're logged in (`firebase login`)
- Check that rules are deployed successfully
- Verify admin email matches in rules (`stltraderltd@gmail.com`)
- Clear browser cache and re-authenticate

**Upload fails:**
- Check file size limits
- Verify file type is allowed
- Ensure user is authenticated
- Check Storage is enabled in Firebase Console

## Admin Email

Current admin email configured: `stltraderltd@gmail.com`

To change the admin email, update both rule files:
- `firestore.rules` - line with `isAdmin()` function
- `storage.rules` - admin section

Then redeploy the rules.
