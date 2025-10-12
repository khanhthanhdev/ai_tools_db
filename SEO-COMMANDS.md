# SEO Quick Commands Reference

## Development

```bash
# Start development server
npm run dev

# Generate sitemap
npm run generate:sitemap

# Build for production (automatically generates sitemap)
npm run build
```

## Testing

```bash
# Test robots.txt locally
curl http://localhost:5173/robots.txt

# Test sitemap locally
curl http://localhost:5173/sitemap.xml

# Test robots.txt in production
curl https://your-domain.com/robots.txt

# Test sitemap in production
curl https://your-domain.com/sitemap.xml

# Run Lighthouse audit (after deploying)
npx lighthouse https://your-domain.com --view

# Check specific page
npx lighthouse https://your-domain.com/about-us --view
```

## Update Domain URLs (Windows PowerShell)

```powershell
# Update index.html
(Get-Content index.html) -replace 'https://aiknowledgecloud.vercel.app', 'https://your-actual-domain.com' | Set-Content index.html

# Update sitemap generator
(Get-Content scripts/generate-sitemap.mjs) -replace 'https://aiknowledgecloud.vercel.app', 'https://your-actual-domain.com' | Set-Content scripts/generate-sitemap.mjs

# Update robots.txt
(Get-Content public/robots.txt) -replace 'https://aiknowledgecloud.vercel.app', 'https://your-actual-domain.com' | Set-Content public/robots.txt
```

## Validation

```bash
# Validate HTML
curl -s https://your-domain.com | grep -i "meta"

# Check Open Graph tags
curl -s https://your-domain.com | grep -i "og:"

# Check Twitter Card tags
curl -s https://your-domain.com | grep -i "twitter:"

# Check structured data
curl -s https://your-domain.com | grep -i "application/ld+json"
```

## Online Tools

### Google Tools
```
# Rich Results Test
https://search.google.com/test/rich-results?url=https://your-domain.com

# Mobile-Friendly Test
https://search.google.com/test/mobile-friendly?url=https://your-domain.com

# PageSpeed Insights
https://pagespeed.web.dev/?url=https://your-domain.com
```

### Social Media Validators
```
# Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/?q=https://your-domain.com

# Twitter Card Validator
https://cards-dev.twitter.com/validator

# LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/
```

### Schema Validators
```
# Schema.org Validator
https://validator.schema.org/#url=https://your-domain.com

# Google Structured Data Testing Tool (deprecated but still useful)
https://search.google.com/structured-data/testing-tool
```

## Monitoring

```bash
# Check if site is indexed
site:your-domain.com

# Check specific page
site:your-domain.com/about-us

# Check with specific keyword
site:your-domain.com "AI tools"
```

## Sitemap Submission

### Google Search Console
```
1. Go to: https://search.google.com/search-console
2. Add property: https://your-domain.com
3. Verify ownership
4. Sitemaps → Add new sitemap
5. Enter: sitemap.xml
6. Submit
```

### Bing Webmaster Tools
```
1. Go to: https://www.bing.com/webmasters
2. Add site: https://your-domain.com
3. Verify ownership
4. Sitemaps → Submit sitemap
5. Enter: https://your-domain.com/sitemap.xml
6. Submit
```

## Debugging

```bash
# Check if Convex is running
curl $VITE_CONVEX_URL

# Test Convex SEO query (requires Convex CLI)
npx convex run seo:getAllApprovedTools

# Check build output
npm run build 2>&1 | grep -i "sitemap"

# Verify meta tags in built files
cat dist/index.html | grep -i "meta"
```

## Performance

```bash
# Analyze bundle size
npm run build
ls -lh dist/assets/

# Check lighthouse scores
npx lighthouse https://your-domain.com --only-categories=performance,seo,accessibility,best-practices --output=json --output-path=./lighthouse-report.json

# View report
cat lighthouse-report.json | jq '.categories'
```

## Maintenance

```bash
# Regenerate sitemap monthly
npm run generate:sitemap

# Check for broken links (requires broken-link-checker)
npx broken-link-checker https://your-domain.com

# Audit SEO (requires lighthouse)
npx lighthouse https://your-domain.com --only-categories=seo --view
```

## Quick Checks After Deployment

```bash
# 1. Verify robots.txt
curl https://your-domain.com/robots.txt

# 2. Verify sitemap
curl https://your-domain.com/sitemap.xml

# 3. Check homepage meta tags
curl -s https://your-domain.com | grep -i '<title>'
curl -s https://your-domain.com | grep -i 'description'

# 4. Check structured data
curl -s https://your-domain.com | grep -i 'application/ld+json' -A 20

# 5. Run Lighthouse
npx lighthouse https://your-domain.com --view
```

## Environment Variables

```bash
# .env.local (create if doesn't exist)
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_SITE_URL=https://your-domain.com
VITE_SITE_NAME=AI Knowledge Cloud
```

## Git Commands (if needed)

```bash
# Stage SEO files
git add src/components/SEO.tsx
git add src/lib/structuredData.ts
git add convex/seo.ts
git add public/robots.txt
git add public/site.webmanifest
git add scripts/generate-sitemap.mjs
git add docs/
git add *.md

# Commit
git commit -m "feat: implement comprehensive SEO optimization"

# Push
git push origin main
```

## Troubleshooting Commands

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall react-helmet-async with legacy peer deps
npm install react-helmet-async --legacy-peer-deps

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

## Useful Aliases (add to your shell profile)

```bash
# Add to ~/.bashrc or ~/.zshrc
alias seo-test="npm run generate:sitemap && npm run dev"
alias seo-build="npm run build"
alias seo-check="curl http://localhost:5173/robots.txt && curl http://localhost:5173/sitemap.xml"
alias seo-lighthouse="npx lighthouse http://localhost:5173 --view"
```

## Quick Reference URLs

```
Documentation:
- Full Guide: docs/seo-implementation.md
- Quick Start: docs/seo-quick-start.md
- Summary: SEO-IMPLEMENTATION-SUMMARY.md
- Checklist: SEO-CHECKLIST.md

Testing:
- Google Rich Results: https://search.google.com/test/rich-results
- Schema Validator: https://validator.schema.org/
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Validator: https://cards-dev.twitter.com/validator

Tools:
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster: https://www.bing.com/webmasters
- Lighthouse: https://developers.google.com/web/tools/lighthouse
```

---

**Pro Tip**: Bookmark this file for quick access to all SEO-related commands!
