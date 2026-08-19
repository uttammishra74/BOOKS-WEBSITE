# API Key Security Guide for freebookleaf

## Current Security Setup

### ⚠️ Current Configuration
Your Google Books API key is currently exposed in client-side code (`js/config.js`). This is a common pattern for static sites but has security implications.

### 🔒 Recommended Security Measures

## 1. Google Cloud Console API Key Restrictions

### Step-by-Step Setup:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Navigate to APIs & Services > Credentials**
   - Find your Google Books API key
   - Click on the API key to edit

3. **Set Application Restrictions**
   
   **Option A: HTTP Referrer (Recommended for static sites)**
   - Select "HTTP referrers"
   - Add your production domain: `https://freebookleaf.online/*`
   - Add your production domain with www: `https://www.freebookleaf.online/*`
   - Add your development domain: `http://localhost:*`
   
   **Option B: IP Address (If you have static IP)**
   - Select "IP addresses"
   - Add your server IP addresses

4. **Set API Restrictions**
   - Select "Books API" only
   - This prevents the key from being used for other Google services

5. **Set Quotas**
   - Set daily request limits
   - Monitor usage patterns
   - Set alerts for unusual activity

## 2. Environment-Specific Configuration

### Development vs Production Keys

**Create separate API keys:**
- **Development Key**: For localhost testing with relaxed restrictions
- **Production Key**: For live deployment with strict referrer restrictions

### Implementation Approach:

#### Option 1: Build-Time Replacement (Recommended)
```javascript
// In config.js
const CONFIG = {
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY || "DEV_KEY_HERE"
};
```

Use a build tool to replace `process.env.GOOGLE_BOOKS_API_KEY` during deployment.

#### Option 2: Domain-Based Key Selection
```javascript
// In config.js
const getApiKey = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'DEV_API_KEY'; // Less restricted
  } else if (hostname === 'freebookleaf.online' || hostname === 'www.freebookleaf.online') {
    return 'PRODUCTION_API_KEY'; // Strict restrictions
  } else {
    return 'DEFAULT_API_KEY'; // Fallback
  }
};

const CONFIG = {
  GOOGLE_BOOKS_API_KEY: getApiKey()
};
```

## 3. Additional Security Best Practices

### Never:
- ❌ Commit real API keys to version control
- ❌ Hardcode production keys in code
- ❌ Share API keys in public repositories
- ❌ Use keys with unlimited quotas in production

### Always:
- ✅ Use referrer restrictions
- ✅ Monitor API usage regularly
- ✅ Rotate keys periodically
- ✅ Use separate keys for different environments
- ✅ Set reasonable quotas
- ✅ Implement error handling for API failures

## 4. Monitoring and Alerts

### Google Cloud Console Monitoring:
- Set up usage alerts
- Monitor request patterns
- Check for suspicious activity
- Review API key usage statistics

### Recommended Alerts:
- Daily quota exceeded
- Unusual request patterns
- Requests from unknown referrers
- Spike in error rates

## 5. Alternative Architectures (Advanced)

### For Enhanced Security:

#### Option A: Server-Side Proxy
- Create a Cloudflare Worker as an API proxy
- Hide the real API key server-side
- Rate limit and monitor requests

#### Option B: Edge Functions
- Use Cloudflare Pages Functions
- Make API calls server-side
- Return results to client

#### Option C: Backend Service
- Deploy a small backend service
- Handle API calls server-side
- Cache responses to reduce API usage

## 6. Current Project Recommendations

### Immediate Actions:
1. ✅ Set up referrer restrictions in Google Cloud Console
2. ✅ Create separate development and production keys
3. ✅ Implement domain-based key selection in config.js
4. ✅ Add usage monitoring and alerts
5. ✅ Document key rotation procedures

### For Production Deployment:
1. Use strict referrer restrictions
2. Implement error handling for API failures
3. Add loading states for API calls
4. Consider implementing a proxy for enhanced security
5. Set up regular security audits

## 7. Cloudflare Pages Specific Security

### Environment Variables in Cloudflare Pages:
Cloudflare Pages supports environment variables for Functions, but for static sites, you'll need to use build-time replacement or client-side logic.

### Recommended Approach:
1. Use the domain-based key selection method
2. Set appropriate referrer restrictions for each domain
3. Monitor API usage through Google Cloud Console

## 8. API Key Rotation Plan

### Schedule:
- **Development Keys**: Rotate monthly
- **Production Keys**: Rotate quarterly or if compromised
- **Emergency Rotation**: Immediately if suspected compromise

### Rotation Process:
1. Create new API key in Google Cloud Console
2. Update restrictions on new key
3. Update configuration files
4. Deploy to production
5. Monitor old key usage
6. Deactivate old key after 7 days

## 9. Current Configuration Review

### Your Current Setup:
- **File**: `js/config.js`
- **Current Key**: `AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y`
- **Exposure**: Client-side (visible in browser)
- **Risk Level**: Medium (common for static sites)

### Immediate Improvements:
1. Apply referrer restrictions in Google Cloud Console
2. Implement domain-based key selection
3. Add usage monitoring
4. Create backup key for emergencies

## 10. Security Checklist

- [ ] Set up HTTP referrer restrictions
- [ ] Create separate dev/prod API keys
- [ ] Implement domain-based key selection
- [ ] Set up usage monitoring and alerts
- [ ] Document key rotation procedures
- [ ] Add error handling for API failures
- [ ] Test API key restrictions
- [ ] Review Google Cloud Console regularly
- [ ] Set up security alerts
- [ ] Document emergency procedures

## Summary

Your current setup is functional but not optimal for production security. Implementing the recommended referrer restrictions and domain-based key selection will significantly improve security without requiring major architectural changes.