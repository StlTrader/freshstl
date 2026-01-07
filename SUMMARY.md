# freshstl.com - Project Summary

## Project Overview
**freshstl.com** is a modern, single-page React application (SPA) designed as a marketplace for digital 3D printable assets (STL/GLB files). It features a "dark-mode first" aesthetic, 3D model visualization, and a complete e-commerce lifecycle from browsing to instant digital delivery.

## Technical Stack
*   **Frontend:** React 19 (Hooks-based), Tailwind CSS (Responsive, Dark Mode).
*   **3D Engine:** Three.js (OrbitControls, STLLoader) for interactive product previews.
*   **Backend (Hybrid):**
    *   **Primary:** Google Firebase (Firestore, Auth, Analytics).
    *   **Fallback:** A robust **Local Storage / Mock Mode** layer. If Firebase credentials are missing or permissions are denied, the app automatically switches to a fully functional offline state, persisting data to the browser.
*   **Icons:** Lucide-React.
*   **Build/Environment:** Single-file logic structure (imports via Import Map).

## Data Architecture (Schema)
The application uses a NoSQL document structure (simulated in local mode, enforced in Firestore).

1.  **`artifacts/{appId}/public/data/products`**:
    *   Stores public product info (`name`, `price`, `imageUrl`, `modelUrl`, `category`, `tags`, `rating`, `reviewCount`).
2.  **`artifacts/{appId}/users/{userId}/purchases`**:
    *   Private sub-collection for purchased items (`transactionId`, `downloadLink`).
3.  **`artifacts/{appId}/users/{userId}/wishlist`**:
    *   Private sub-collection for saved item IDs.
4.  **`reviews`**:
    *   Global collection linking `userId` + `productId` with comments and ratings.
5.  **`artifacts/{appId}/admin/data/orders`**:
    *   Global transactional ledger for Admin Analytics (`amount`, `status`, `items`).

## Feature Modules

### 1. Storefront & Discovery
*   **Hero Section:** Modern gradient aesthetics with dynamic stats.
*   **Product Grid:** Pinterest-style Masonry layout.
*   **Filtering:** Real-time search by name/tag, Category filtering, and Sorting (Price/Name/Relevance).
*   **Visual Indicators:** Dynamic icons on product cards indicating asset type (e.g., "Tabletop Ready", "Pre-supported") based on tags.

### 2. Product Detail & Visualization
*   **Dual View:** Users can toggle between the 2D Marketing Image and a real-time **3D Preview** (Three.js).
*   **3D Viewer:** Renders actual STL files or falls back to a procedural mesh if the file is missing. Includes grid, lighting, and orbit controls.
*   **Reviews:** Tabbed interface to read and submit user reviews.

### 3. Cart & Checkout
*   **Persistence:** Cart contents survive page reloads.
*   **Coupons:** Logic to validate codes (e.g., `FRESH10`) and apply percentage discounts.
*   **Simulated Payment:** A Mock Payment Service simulates Stripe latency and failure rates (configurable via Admin). Handles exponential backoff.

### 4. User Dashboard
*   **Library:** Grid of purchased items with download buttons.
*   **Wishlist:** Management of saved products.
*   **Analytics:** User-specific stats (Total items, Account status).
*   **Settings:** Profile management (Display Name updates).

### 5. Admin Panel (Protected)
*   **Dashboard:** High-level analytics (Revenue, Sales, Top Products).
*   **Product CRUD:** Full form to add/edit products, including a **Tag Manager** and 3D Model URL input.
*   **User/Order Management:** Searchable table of all global transactions.
*   **System Settings:**
    *   **Database Status:** Visual indicator of Online vs. Local mode.
    *   **Gateway Config:** Controls for simulated payment failure rates and delays.

## Implementation Status
*   **Database:** **Complete.** The `firebaseService.ts` handles complex logic to write to Firestore or fall back to LocalStorage transparently.
*   **Auth:** **Complete.** Supports Email/Password, Anonymous login, and Profile updates.
*   **UI/UX:** **Complete.** Fully responsive, themed, and animated.
*   **Logic:** **Complete.** All CRUD operations, cart calculations, and relationship management are implemented.

## Missing / Next Steps (For Production)
1.  **Storage Buckets:** Currently uses placeholder images/URLs. Needs integration with Firebase Storage for actual file uploading in the Admin panel.
2.  **Cloud Functions:** Rating aggregation (averaging stars) is currently done client-side. This should move to a Firestore Trigger.
3.  **Real Stripe:** The `paymentService.ts` simulation needs to be swapped for `stripe-js` and a backend API endpoint.
4.  **Security Rules:** `firestore.rules` need to be deployed to strictly enforce admin privileges.