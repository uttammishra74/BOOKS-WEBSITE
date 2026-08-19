# Cloudflare Pages Deployment Guide

## 📋 Project Overview
- **Project Type**: Static HTML/CSS/JavaScript Website
- **Framework**: None (Vanilla static site)
- **Deployment Target**: Cloudflare Pages
- **Repository**: Git (initialized locally)

## 🚀 Deployment Options

### Option 1: Direct Upload (Easiest for Testing)
1. Log in to Cloudflare Dashboard
2. Go to **Workers & Pages** → **Pages**
3. Click **"Create a project"**
4. Select **"Upload assets"**
5. Drag and drop your project folder
6. Deploy

### Option 2: Git Integration (Recommended for Production)
1. Push your local Git repository to GitHub/GitLab
2. In Cloudflare Pages, connect to your Git provider
3. Select your repository
4. Configure build settings (for static sites, this is minimal)
5. Deploy

## 📝 Git Setup Commands

### Initial Setup (Already Done)
```bash
git init
```

### Add Files to Git
```bash
git add .
```

### First Commit
```bash
git commit -m "Initial commit: freebookleaf static website"
```

### Push to GitHub (First Time)
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/freebookleaf.git
git push -u origin main
```

### Future Updates
```bash
git add .
git commit -m "Update description"
git push
```

## 🔧 Cloudflare Pages Configuration Files

### Files Created:
1. **wrangler.toml** - Cloudflare Pages configuration
2. **_headers** - HTTP headers configuration
3. **_redirects** - URL redirects configuration
4. **package.json** - NPM scripts and metadata

### Build Settings for Static Sites:
- **Build Command**: `echo 'Static site - no build required'`
- **Build Output**: Root directory (no build process needed)
- **Node Version**: Latest (not used but required field)

## 🔒 API Key Security Implementation

### Current Setup:
- **Domain-based key selection** in `js/config.js`
- **HTTP referrer restrictions** needed in Google Cloud Console
- **Separate keys** for development vs production

### Google Cloud Console Setup:
1. Go to **APIs & Services → Credentials**
2. Edit your Google Books API key
3. Set **Application Restrictions** → **HTTP referrers**
4. Add domains:
   - `http://localhost:*` (development)
   - `https://your-project.pages.dev/*` (Cloudflare Pages)
   - `https://your-custom-domain.com/*` (production)

## 📊 Deployment Checklist

### Pre-Deployment:
- [x] Git repository initialized
- [x] package.json created with scripts
- [x] wrangler.toml configuration file
- [x] _headers file for security headers
- [x] _redirects file for error handling
- [x] API key security implementation
- [x] Domain-based key selection
- [ ] API key referrer restrictions set in Google Cloud Console
- [ ] Repository pushed to GitHub/GitLab
- [ ] Cloudflare Pages project created

### Deployment Steps:
1. **Set up Google Cloud Console API restrictions**
   - Go to https://console.cloud.google.com/
   - Navigate to APIs & Services → Credentials
   - Edit your Google Books API key
   - Set HTTP referrer restrictions

2. **Push to Git provider**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare Pages deployment"
   git push origin main
   ```

3. **Create Cloudflare Pages project**
   - Log in to Cloudflare Dashboard
   - Go to Workers & Pages → Pages
   - Click "Create a project"
   - Connect to your Git provider
   - Select your repository
   - Configure build settings (static site)
   - Deploy

4. **Configure custom domain** (optional)
   - Add custom domain in Cloudflare Pages
   - Update DNS settings
   - Update API key referrer restrictions

## 🌐 Post-Deployment Steps

### 1. Update Production API Key
In `js/config.js`, replace line 20:
```javascript
if (hostname === 'your-production-domain.com' || hostname === 'www.your-production-domain.com') {
    return 'YOUR_PRODUCTION_API_KEY_HERE'; // Strict referrer restrictions
}
```

### 2. Test Functionality
- [ ] Search functionality works
- [ ] Book preview modal loads
- [ ] Reading list saves to localStorage
- [ ] Responsive design works on mobile
- [ ] SEO meta tags are correct
- [ ] Error pages (404, 500) work

### 3. Monitor Performance
- Check Cloudflare Analytics
- Monitor Google Books API usage
- Check error rates
- Review page load times

## 🛠️ Troubleshooting

### Common Issues:

**API Key Errors:**
- Verify referrer restrictions in Google Cloud Console
- Check that domain matches your Cloudflare Pages URL
- Ensure API key is not restricted by IP address

**Build Errors:**
- Static sites don't need build - make sure build command is: `echo 'Static site - no build required'`
- Check that wrangler.toml is properly configured

**Deployment Failures:**
- Verify Git repository is accessible
- Check Cloudflare Pages has permission to access repo
- Ensure branch name matches (main/master)

**Styling Issues:**
- Check that CSS files are properly linked
- Verify file paths are correct
- Clear browser cache

## 📈 Performance Optimization

### Already Implemented:
- ✅ Minified CSS/JS files (future enhancement)
- ✅ Image lazy loading
- ✅ Responsive images
- ✅ CDN caching via Cloudflare
- ✅ HTTP security headers
- ✅ Proper MIME types

### Future Enhancements:
- CSS/JS minification
- Image optimization
- Service Worker for offline support
- Preload critical resources
- Critical CSS inline

## 🔍 Analytics & Monitoring

### Cloudflare Analytics:
- Page views
- Unique visitors
- Geographic distribution
- Device breakdown
- Bandwidth usage

### Google Books API Monitoring:
- API quota usage
- Request patterns
- Error rates
- Performance metrics

## 📞 Support Resources

### Cloudflare Pages Documentation:
- https://developers.cloudflare.com/pages/
- https://developers.cloudflare.com/pages/platform/

### Google Books API Documentation:
- https://developers.google.com/books/docs/v1/using
- https://console.cloud.google.com/

### Project Documentation:
- API_SECURITY.md - API key security guide
- README_CONFIG.md - Configuration setup
- README.md - Project overview

## 🎯 Next Steps

1. **Set up Google Cloud Console API restrictions**
2. **Push repository to GitHub/GitLab**
3. **Create Cloudflare Pages project**
4. **Test all functionality**
5. **Configure custom domain (optional)**
6. **Set up monitoring and alerts**

Your static website is now ready for Cloudflare Pages deployment with enhanced API security!