# Frontend Environment Variables for Production (Netlify)

## Required Environment Variables

### API Configuration
```env
VITE_API_URL=https://your-render-app.onrender.com
```
**Replace `your-render-app` with your actual Render service name**

### Authentication (Clerk)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_key
```
**Get this from your Clerk production app dashboard**

### File Storage (Cloudinary)
```env
VITE_CLOUDINARY_CLOUD_NAME=your_production_cloud_name
```
**Get this from your Cloudinary production environment**

## Environment Variable Setup in Netlify

### Steps to Configure:
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add each variable with its production value
4. Save and redeploy your site

### Example Values:
```env
# Replace with your actual values
VITE_API_URL=https://sasakawa-restaurant-api.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_abcd1234567890
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

## Development vs Production

### Development (.env.local in client folder):
```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_dev_key
VITE_CLOUDINARY_CLOUD_NAME=your_dev_cloud_name
```

### Production (Netlify Environment Variables):
```env
VITE_API_URL=https://your-render-app.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_prod_key
VITE_CLOUDINARY_CLOUD_NAME=your_prod_cloud_name
```

## Important Notes:

1. **VITE_API_URL**: Must match your Render backend URL exactly
2. **Clerk Keys**: Use `pk_live_` for production, `pk_test_` for development
3. **Cloudinary**: Can use same account but different folder organization
4. **No Secrets**: Never put secret keys in frontend environment variables
5. **Redeploy**: After changing env vars in Netlify, trigger a redeploy

## Testing Configuration:

After setting up environment variables:
1. Check browser console for API connection errors
2. Test user login/registration
3. Test file uploads
4. Verify API calls are going to correct Render URL
