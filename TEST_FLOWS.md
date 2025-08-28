# ToolHub Test Flows

## User Flow Testing Checklist

### 1. Landing Page (/) - Anonymous User
- [ ] Page loads correctly
- [ ] Shows ToolHub branding and description
- [ ] Has "Get Started" and "Sign In" buttons
- [ ] Navigation shows only branding (no Dashboard/Admin links)

### 2. Authentication Flow
- [ ] Sign up process works with Google OAuth
- [ ] Sign up process works with magic link
- [ ] Sign in process works with Google OAuth  
- [ ] Sign in process works with magic link
- [ ] User profile is created in database after signup
- [ ] Redirect to dashboard after successful auth

### 3. User Dashboard (/dashboard) - Authenticated User
- [ ] Shows "No tools unlocked" message for new users
- [ ] Navigation shows Dashboard link
- [ ] User email displayed in auth button
- [ ] Logout functionality works

### 4. Tool Unlock Flow (/unlock/[slug])
- [ ] `/unlock/calculator` requires authentication (redirects if not logged in)
- [ ] Shows unlock success page for first unlock
- [ ] Grants access in database (user_tool_access table)
- [ ] Shows "already unlocked" for subsequent visits
- [ ] Redirects to tool page after unlock
- [ ] Invalid slugs show error page

### 5. Tool Access (/tool/[slug])
- [ ] `/tool/calculator` shows access denied if not unlocked
- [ ] Shows tool interface if user has access
- [ ] All three sample tools (calculator, review-link-generator, text-analyzer) work
- [ ] Navigation breadcrumbs work

### 6. Admin Dashboard (/admin) - Admin User
- [ ] Only accessible to admin users
- [ ] Shows user table with search functionality
- [ ] User management modal opens correctly
- [ ] Can grant/revoke tool access
- [ ] Changes persist in database
- [ ] Toast notifications work

## Test URLs
- Landing: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Sign Up: http://localhost:3000/auth/sign-up
- Sign In: http://localhost:3000/auth/login
- Unlock Calculator: http://localhost:3000/unlock/calculator
- Unlock Review Link Gen: http://localhost:3000/unlock/review-link-generator
- Unlock Text Analyzer: http://localhost:3000/unlock/text-analyzer
- Calculator Tool: http://localhost:3000/tool/calculator
- Admin: http://localhost:3000/admin

## Database Verification
Check these tables after testing:
```sql
SELECT * FROM users;
SELECT * FROM tools;
SELECT * FROM user_tool_access;
SELECT * FROM review_links; -- New table for review link data
```

## Review Link Generator Specific Tests
- [ ] Google Places API business search works (requires API key)
- [ ] Facebook page name input generates correct review link
- [ ] Completion badges appear when links are generated
- [ ] Copy-paste functionality works for generated links
- [ ] User data persists across sessions
- [ ] External link buttons open review pages in new tabs

## Expected Behavior Summary
1. Anonymous users see landing page and can sign up
2. New authenticated users see empty dashboard
3. Unlock URLs grant access and show success
4. Tool pages work only with proper access
5. Admin can manage all user permissions
6. All navigation and redirects work correctly