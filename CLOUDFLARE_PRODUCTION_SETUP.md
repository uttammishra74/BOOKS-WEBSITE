# Cloudflare Pages Production-Only Configuration Setup

## ⚠️ CRITICAL: Manual Steps Required

While we have updated the configuration files, **manual configuration in the Cloudflare Pages dashboard is required** to fully disable preview deployments. The deployment commands and config files alone cannot completely prevent Cloudflare Pages from generating preview URLs.

## ✅ Configuration Changes Applied

### 1. **_redirects** - Force Production Redirect
```toml
# Force redirect from preview domains to production domain
https://*.pages.dev/* https://freebookleaf.online/:splat 301
```
**Effect**: Any traffic hitting `.pages.dev` URLs will be redirected to `freebookleaf.online`

### 2. **_headers** - Prevent Indexing
```toml
# Prevent indexing on preview domains
https://*.pages.dev/*
  X-Robots-Tag: noindex, nofollow
```
**Effect**: Search engines will not index preview URLs

### 3. **wrangler.toml** - Production Configuration
```toml
name = "freebookleaf"
pages_build_output_dir = "."
```
**Effect**: Minimal configuration for production deployment

### 4. **package.json** - Production Branch Only
```json
"deploy": "wrangler pages deploy . --project-name freebookleaf --branch main"
```
**Effect**: Deployment script explicitly uses main branch

## 🔧 REQUIRED MANUAL STEPS

### Step 1: Disable Preview Deployments in Cloudflare Dashboard

1. **Log in to Cloudflare Dashboard**
   - Go to: https://dash.cloudflare.com/
   - Navigate to: **Workers & Pages** → **Pages**

2. **Select Your Project**
   - Click on `freebookleaf` project

3. **Access Deployment Control Settings**
   - Go to **Settings** → **Builds & deployments**
   - Find **Deployment control** section

4. **Disable Preview Deployments**
   - Set **Preview deployments** to **None**
   - This completely prevents automatic preview deployments
   - Only production deployments will be created

### Step 2: Configure Branch Protection

1. **In Cloudflare Pages Settings**
   - Go to **Settings** → **Builds & deployments**
   - Find **Branch protection** section

2. **Set Main Branch as Production**
   - Add `main` as production branch
   - Ensure only `main` branch triggers production deployments
   - Remove any other branches from production settings

### Step 3: Configure Custom Domain

1. **Add Custom Domain**
   - Go to **Custom domains** section
   - Add `freebookleaf.online`
   - Add `www.freebookleaf.online` as alias

2. **Update DNS Settings**
   - Cloudflare will provide DNS records
   - Update your domain's DNS to point to Cloudflare
   - Wait for DNS propagation (usually 5-15 minutes)

3. **Set as Production Domain**
   - Make `freebookleaf.online` the primary domain
   - Ensure SSL certificate is automatically provisioned

### Step 4: Update Google Cloud Console API Restrictions

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Navigate to: **APIs & Services → Credentials**

2. **Edit Your Google Books API Key**
   - Find your Google Books API key
   - Click to edit

3. **Set HTTP Referrer Restrictions**
   - Add: `https://freebookleaf.online/*`
   - Add: `https://www.freebookleaf.online/*`
   - Add: `http://localhost:*` (for development)
   - Remove any `.pages.dev` references

## 🚫 What We Cannot Control via Configuration Files

The following Cloudflare Pages settings **require manual dashboard configuration**:

1. **Preview Deployment Settings** - Cannot be disabled via config files
2. **Branch Protection Rules** - Must be set in dashboard
3. **Automatic Deployment Triggers** - Controlled in dashboard
4. **Custom Domain Assignment** - Must be configured in dashboard
5. **SSL Certificate Management** - Automatic but requires domain setup

## 📋 Verification Checklist

After completing the manual steps, verify:

- [ ] Preview deployments are set to "None" in dashboard
- [ ] Only `main` branch is configured as production
- [ ] Custom domain `freebookleaf.online` is added
- [ ] DNS records are properly configured
- [ ] SSL certificate is active
- [ ] Google Cloud Console API referrer restrictions are set
- [ ] Test访问 to `.pages.dev` URLs redirects to production
- [ ] Search engines cannot access preview URLs

## 🎯 Current Status

### ✅ Configured via Files:
- ✅ `_redirects` - 301 redirect to production
- ✅ `_headers` - Noindex for preview domains
- ✅ `wrangler.toml` - Production configuration
- ✅ `package.json` - Main branch deployment

### ⚠️ Requires Manual Dashboard Setup:
- ⚠️ Preview deployments set to "None"
- ⚠️ Branch protection configuration
- ⚠️ Custom domain setup
- ⚠️ DNS configuration
- ⚠️ Google Cloud Console API restrictions

## 📝 Important Notes

1. **Preview URLs Still Generated**: Until you manually disable preview deployments in the dashboard, Cloudflare Pages will continue to generate `.pages.dev` preview URLs. Our `_redirects` configuration will redirect them, but they will still be created.

2. **Production Domain Required**: The redirect will only work properly once `freebookleaf.online` is configured as a custom domain in Cloudflare Pages.

3. **API Key Security**: Ensure Google Cloud Console referrer restrictions are updated before using the production domain.

4. **Testing**: After manual configuration, test that:
   - `.pages.dev` URLs redirect to `freebookleaf.online`
   - Production domain works correctly
   - API key restrictions are functioning

## 🆘 Troubleshooting

**Preview URLs Still Generated**:
- Must manually disable in Cloudflare Pages dashboard
- Config files alone cannot prevent this

**Redirect Not Working**:
- Ensure custom domain is configured
- Check DNS propagation
- Verify `_redirects` file is deployed

**API Key Errors**:
- Update Google Cloud Console referrer restrictions
- Ensure production domain is added to allowed referrers

**Manual Setup Guide**: Complete the steps in "REQUIRED MANUAL STEPS" section above to fully disable preview deployments and enforce production-only configuration.