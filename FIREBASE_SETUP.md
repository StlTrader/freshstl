# Firebase Security Rules Setup

## Step 1: Find Your Admin User ID

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `freshstl-store`
3. Navigate to **Authentication** → **Users**
4. Find your admin account and copy the **User UID**

## Step 2: Update Security Rules Files

1. Open `firebase-storage.rules` and `firestore.rules`
2. Replace `REPLACE_WITH_YOUR_ADMIN_UID` with your actual UID
3. Example: `'abc123xyz789'`

## Step 3: Apply Storage Rules

1. In Firebase Console, go to **Storage** → **Rules**
2. Copy the entire content from `firebase-storage.rules`
3. Paste into the Firebase Console editor
4. Click **Publish**

## Step 4: Apply Firestore Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Copy the entire content from `firestore.rules`
3. Paste into the Firebase Console editor
4. Click **Publish**

## What These Rules Do

### Storage Rules:
- ✅ Anyone can read/download files
- ✅ Only admins can upload to `blog/`, `public/`, and `models/` directories
- ✅ Users can upload to their own `protected/{userId}/` directory

### Firestore Rules:
- ✅ Anyone can read blog posts, products, categories
- ✅ Only admins can create/edit/delete blog posts
- ✅ Only admins can manage products, categories, payments
- ✅ Users can create orders and view their own orders
- ✅ Users can read/write their own profile

## Testing

After applying the rules:
1. Try uploading a blog image in the Admin Panel (should work)
2. Try creating a blog post (should work)
3. Log out and verify public users cannot write to the blog
