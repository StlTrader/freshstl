---
description: Troubleshooting Image Generation and Upload Issues
---

# Troubleshooting Image Generation

If you are experiencing issues with "Failed to upload collage" or other image generation errors, follow these steps.

## 1. Check the Error Message
The application now provides detailed error messages.
- **Code: storage/unauthorized**: 
  - Ensure you are logged in.
  - Try logging out and logging back in to refresh your authentication token.
  - Check if your account has the necessary permissions (though any logged-in user should be able to upload to `collections/`).

- **Code: storage/canceled**:
  - The upload was canceled by the user or the browser.

- **Code: storage/unknown**:
  - This often indicates a CORS issue or a network error.

## 2. Verify CORS Configuration
Cross-Origin Resource Sharing (CORS) must be enabled on your Firebase Storage bucket for the collage generator to work.
1. Open the browser console (F12).
2. Look for errors like `Access to image at ... has been blocked by CORS policy`.
3. If you see this, the CORS configuration might not have propagated yet. It can take up to 10 minutes.
4. You can re-run the CORS setup script:
   ```bash
   node scripts/set_cors.mjs
   ```

## 3. Clear Browser Cache
Sometimes the browser caches images without CORS headers.
- We have added a timestamp to image URLs to force a fresh fetch, but clearing your cache can still help.
- Disable cache in Network tab of DevTools while testing.

## 4. Check Console Logs
Open the browser console (F12) and look for logs starting with:
- "Collage Blob created..."
- "Current User: ..."
- "Upload failed: ..."

These logs will provide the exact point of failure.
