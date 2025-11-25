# Testing Guide - TOPTHAI TRAVEL COMPANY Website

This document provides comprehensive testing procedures to verify all functionality.

## 🧪 Test Checklist

### ✅ 1. Installation Test

#### Docker Installation
- [ ] `.env` file created and configured
- [ ] Docker Desktop is running
- [ ] `docker compose up -d` executes without errors
- [ ] Container shows as "running" in `docker compose ps`
- [ ] Health check shows as "healthy" after ~40 seconds

#### Local Installation
- [ ] Node.js 18+ is installed
- [ ] Dependencies installed successfully (`npm install`)
- [ ] `data` directory created
- [ ] Server starts without errors

### ✅ 2. Health Check Test

**Test:** Verify the health endpoint is working

**Steps:**
1. Open browser or use curl:
   ```bash
   curl http://localhost:3000/healthz
   ```
2. Expected response:
   ```json
   {"status":"ok","timestamp":"2025-11-25T..."}
   ```

**Result:** [ ] Pass [ ] Fail

---

### ✅ 3. Frontend Tests

#### 3.1 Page Load Test

**Test:** Verify the landing page loads correctly

**Steps:**
1. Open http://localhost:3000
2. Check that all sections are visible:
   - [ ] Header with navigation
   - [ ] Hero section with call-to-action
   - [ ] About section with company info
   - [ ] Thailand tours section (2 packages)
   - [ ] Vietnam tours section (3 packages)
   - [ ] Testimonials section
   - [ ] Contact form section
   - [ ] Footer

**Result:** [ ] Pass [ ] Fail

#### 3.2 Company Information Display Test

**Test:** Verify all company information is correctly displayed

**Check the following appears on the page:**
- [ ] Company name: "TOPTHAI TRAVEL COMPANY"
- [ ] Thailand hotline: (+66) 98-246-8010
- [ ] Vietnam hotline: (+84) 944-36-21-39
- [ ] Email: topthaiasia@gmail.com
- [ ] Address: 32 Lat Krabang 20, Lat Krabang, Bangkok 10520, Thailand

**Result:** [ ] Pass [ ] Fail

#### 3.3 Navigation Test

**Test:** Verify navigation links work correctly

**Steps:**
1. Click each navigation link:
   - [ ] "Home" scrolls to top
   - [ ] "About" scrolls to about section
   - [ ] "Thailand Tours" scrolls to Thailand tours
   - [ ] "Vietnam Tours" scrolls to Vietnam tours
   - [ ] "Contact" scrolls to contact form
2. Verify smooth scrolling animation

**Result:** [ ] Pass [ ] Fail

#### 3.4 Responsive Design Test

**Test:** Verify the site is mobile-friendly

**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - [ ] Mobile (375px)
   - [ ] Tablet (768px)
   - [ ] Desktop (1200px)
4. Verify:
   - [ ] Content adapts to screen size
   - [ ] Navigation becomes mobile-friendly
   - [ ] Images scale properly
   - [ ] Text is readable
   - [ ] No horizontal scrolling

**Result:** [ ] Pass [ ] Fail

---

### ✅ 4. Contact Form Tests

#### 4.1 Frontend Validation - Empty Fields

**Test:** Verify required field validation

**Steps:**
1. Scroll to contact form
2. Click "Send Message" without filling anything
3. Expected behavior:
   - [ ] Error messages appear for all required fields
   - [ ] Fields are highlighted in red
   - [ ] Form is NOT submitted

**Result:** [ ] Pass [ ] Fail

#### 4.2 Frontend Validation - Invalid Email

**Test:** Verify email format validation

**Steps:**
1. Fill form with:
   - Name: "Test User"
   - Email: "invalid-email"
   - Phone: "1234567890"
2. Click "Send Message"
3. Expected behavior:
   - [ ] Error message: "Please enter a valid email address"
   - [ ] Email field highlighted in red
   - [ ] Form is NOT submitted

**Result:** [ ] Pass [ ] Fail

#### 4.3 Frontend Validation - Invalid Phone

**Test:** Verify phone number validation

**Steps:**
1. Fill form with:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "abc123"
2. Click "Send Message"
3. Expected behavior:
   - [ ] Error message: "Phone number must contain only numbers"
   - [ ] Phone field highlighted in red
   - [ ] Form is NOT submitted

**Result:** [ ] Pass [ ] Fail

#### 4.4 Successful Submission

**Test:** Verify successful form submission

**Steps:**
1. Fill form with valid data:
   - Name: "John Doe"
   - Email: "johndoe@example.com"
   - Phone: "+66982468010"
   - Message: "Interested in 5-day Thailand tour"
2. Click "Send Message"
3. Expected behavior:
   - [ ] Button shows "Sending..." and is disabled
   - [ ] Success message appears after submission
   - [ ] Form fields are cleared
   - [ ] Button returns to "Send Message" and is enabled

**Result:** [ ] Pass [ ] Fail

#### 4.5 Form Submission While Loading

**Test:** Verify button cannot be clicked twice

**Steps:**
1. Fill form with valid data
2. Click "Send Message"
3. Try clicking again immediately
4. Expected behavior:
   - [ ] Button is disabled during submission
   - [ ] Only one request is sent

**Result:** [ ] Pass [ ] Fail

---

### ✅ 5. Backend API Tests

#### 5.1 Health Check Endpoint

**Test:** GET /healthz

```bash
curl http://localhost:3000/healthz
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-25T..."
}
```

**Result:** [ ] Pass [ ] Fail

#### 5.2 Contact Form - Valid Submission

**Test:** POST /api/contact with valid data

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "message": "Test message"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Contact form submitted successfully",
  "id": 1
}
```

**Result:** [ ] Pass [ ] Fail

#### 5.3 Contact Form - Missing Required Fields

**Test:** POST /api/contact without required fields

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "test@example.com",
    "phone": "1234567890"
  }'
```

**Expected Response:** 400 Bad Request
```json
{
  "ok": false,
  "error": "Name is required"
}
```

**Result:** [ ] Pass [ ] Fail

#### 5.4 Contact Form - Invalid Email Format

**Test:** POST /api/contact with invalid email

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "phone": "1234567890"
  }'
```

**Expected Response:** 400 Bad Request
```json
{
  "ok": false,
  "error": "Invalid email format"
}
```

**Result:** [ ] Pass [ ] Fail

#### 5.5 Rate Limiting Test

**Test:** Verify rate limiting (10 requests/minute)

**Steps:**
1. Send 11 requests quickly:
   ```bash
   for i in {1..11}; do
     curl -X POST http://localhost:3000/api/contact \
       -H "Content-Type: application/json" \
       -d '{"name":"Test","email":"test@test.com","phone":"1234567890"}'
     echo ""
   done
   ```
2. Expected behavior:
   - [ ] First 10 requests succeed
   - [ ] 11th request returns 429 Too Many Requests
   - [ ] Error message: "Too many requests, please try again later."

**Result:** [ ] Pass [ ] Fail

---

### ✅ 6. Database Tests

#### 6.1 Database Initialization

**Test:** Verify database is created and initialized

**Docker:**
```bash
docker exec topthai-travel-web ls -la /app/data
```

**Local:**
```bash
ls -la data/
```

**Expected:**
- [ ] File `topthai.db` exists

**Result:** [ ] Pass [ ] Fail

#### 6.2 Contact Data Storage

**Test:** Verify contact submissions are saved to database

**Steps:**
1. Submit a contact form (use unique test data)
2. Check logs for confirmation:
   ```bash
   docker compose logs web | grep -i "Contact saved"
   ```
3. Expected:
   - [ ] Log message: "Contact saved to database: ID X, Name: [name]"

**Result:** [ ] Pass [ ] Fail

---

### ✅ 7. Email Tests

#### 7.1 Email Configuration

**Test:** Verify email settings are configured

**Check `.env` file contains:**
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] FROM_EMAIL
- [ ] TO_EMAIL

**Result:** [ ] Pass [ ] Fail

#### 7.2 Email Delivery

**Test:** Verify email is sent on form submission

**Steps:**
1. Ensure email is properly configured in `.env`
2. Submit contact form with test data
3. Check email inbox (TO_EMAIL address)
4. Verify email received with:
   - [ ] Subject: "New Contact Form Submission from [name]"
   - [ ] Contains all form data (name, email, phone, message)
   - [ ] Contains submission timestamp
   - [ ] HTML formatting is correct

**Result:** [ ] Pass [ ] Fail

#### 7.3 Email Retry Mechanism

**Test:** Verify email retry works

**Steps:**
1. Configure invalid SMTP credentials in `.env`
2. Submit contact form
3. Check logs:
   ```bash
   docker compose logs web | grep -i "email"
   ```
4. Expected:
   - [ ] Log shows "Email sending attempt 1 failed"
   - [ ] Log shows "Email sending attempt 2 failed"
   - [ ] Form submission still succeeds (email failure doesn't block)

**Result:** [ ] Pass [ ] Fail

---

### ✅ 8. Docker Tests

#### 8.1 Container Health Check

**Test:** Verify health check is working

**Steps:**
1. Wait 40 seconds after starting container
2. Check health status:
   ```bash
   docker compose ps
   ```
3. Expected:
   - [ ] Status shows as "healthy"

**Result:** [ ] Pass [ ] Fail

#### 8.2 Auto-restart on Crash

**Test:** Verify container restarts automatically

**Steps:**
1. Find container ID:
   ```bash
   docker compose ps
   ```
2. Kill the process inside container:
   ```bash
   docker exec topthai-travel-web kill 1
   ```
3. Wait 10 seconds
4. Check container status:
   ```bash
   docker compose ps
   ```
5. Expected:
   - [ ] Container automatically restarts
   - [ ] Status returns to "running" then "healthy"

**Result:** [ ] Pass [ ] Fail

#### 8.3 Volume Persistence

**Test:** Verify data persists after container restart

**Steps:**
1. Submit a contact form
2. Note the ID from response
3. Restart container:
   ```bash
   docker compose restart
   ```
4. Check database file still exists:
   ```bash
   ls -la data/topthai.db
   ```
5. Expected:
   - [ ] Database file still exists
   - [ ] Data is not lost

**Result:** [ ] Pass [ ] Fail

---

### ✅ 9. Logging Tests

#### 9.1 Request Logging

**Test:** Verify all requests are logged

**Steps:**
1. Make a request to the homepage
2. Check logs:
   ```bash
   docker compose logs web | tail -20
   ```
3. Expected format:
   ```
   [2025-11-25T...] GET /
   ```
4. Verify:
   - [ ] Timestamp is present
   - [ ] HTTP method is logged
   - [ ] Path is logged

**Result:** [ ] Pass [ ] Fail

#### 9.2 Error Logging

**Test:** Verify errors are logged

**Steps:**
1. Send invalid request:
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d 'invalid json'
   ```
2. Check logs for error message
3. Expected:
   - [ ] Error is logged with details

**Result:** [ ] Pass [ ] Fail

---

### ✅ 10. Security Tests

#### 10.1 Input Sanitization

**Test:** Verify HTML tags are removed from inputs

**Steps:**
1. Submit contact form with:
   - Name: "Test <script>alert('xss')</script>"
   - Email: "test@example.com"
   - Phone: "1234567890"
2. Check logs/database
3. Expected:
   - [ ] Script tags are removed/sanitized
   - [ ] Name saved as: "Test scriptalert('xss')/script"

**Result:** [ ] Pass [ ] Fail

#### 10.2 CORS Headers

**Test:** Verify CORS is properly configured

**Steps:**
1. Check response headers:
   ```bash
   curl -I http://localhost:3000
   ```
2. Expected:
   - [ ] `Access-Control-Allow-Origin` header is present

**Result:** [ ] Pass [ ] Fail

---

## 📊 Test Summary

| Category | Tests Passed | Tests Failed | Total Tests |
|----------|--------------|--------------|-------------|
| Installation | __ / __ | __ / __ | __ |
| Health Check | __ / __ | __ / __ | __ |
| Frontend | __ / __ | __ / __ | __ |
| Contact Form | __ / __ | __ / __ | __ |
| Backend API | __ / __ | __ / __ | __ |
| Database | __ / __ | __ / __ | __ |
| Email | __ / __ | __ / __ | __ |
| Docker | __ / __ | __ / __ | __ |
| Logging | __ / __ | __ / __ | __ |
| Security | __ / __ | __ / __ | __ |
| **TOTAL** | **__ / __** | **__ / __** | **__** |

---

## 🐛 Common Issues and Solutions

### Issue: Form submission fails with network error

**Solution:**
- Check if server is running: `docker compose ps`
- Check logs: `docker compose logs web`
- Verify port 3000 is not blocked by firewall

### Issue: Email not received

**Solution:**
- Verify SMTP credentials in `.env`
- Check spam/junk folder
- Review email logs: `docker compose logs web | grep -i email`
- Test SMTP settings with online tools

### Issue: Database errors

**Solution:**
- Ensure `data` directory has proper permissions
- Check disk space
- Verify database file is not corrupted

---

**Test Date:** _____________

**Tester Name:** _____________

**Environment:** [ ] Docker [ ] Local [ ] Production

**Overall Result:** [ ] Pass [ ] Fail

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

