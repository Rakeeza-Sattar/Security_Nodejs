# SecureHome Audit Platform - Testing Guide

## 🧪 Complete Testing Documentation

### Admin Panel Access
**Quick Setup:**
1. **Admin Registration:** Go to `http://localhost:5000/admin-register`
   - Admin Key: `SECURE_ADMIN_KEY_2024`
   - Create admin credentials
2. **Admin Login:** Go to `http://localhost:5000/auth`
   - Login with admin credentials
   - Redirects to `/admin` dashboard

---

## 🎯 Testing Scenarios

### 1. Customer Journey Testing

#### **Landing Page Tests**
- **URL:** `http://localhost:5000/`
- ✅ Verify headline: "We send a licensed security officer to your home to document your valuables and receipts."
- ✅ Check 3 key benefits:
  - Fast insurance claim approval with proof
  - Licensed, background-checked officers at your home
  - Peace of mind + title fraud protection add-on
- ✅ Test CTA button: "📅 Schedule Your Free Audit Now"
- ✅ Verify phone number: (555) 123-SECURE

#### **Appointment Booking Tests**
- **URL:** `http://localhost:5000/signup`
- ✅ Fill form with test data:
  ```
  Name: John Test Doe
  Email: test@example.com  
  Phone: (555) 123-4567
  Address: 123 Test Street, Dallas, TX 75201
  Date: Tomorrow (within 7 days)
  Time: 2:00 PM
  ✅ Check receipts ready checkbox
  ```
- ✅ Test date picker (only next 7 days should be available)
- ✅ Optional: Test Title Protection ($50/month checkbox)
- ✅ Submit and verify confirmation email sent

#### **Confirmation Page Tests**
- **URL:** After successful booking
- ✅ Verify message: "Thank you, [Name]. Your free home audit is booked for [Date/Time]."
- ✅ Check preparation checklist items
- ✅ Test Title Protection upsell: "Want to protect your home deed from fraud? Add Title Protection today for just $50/month."

### 2. Email Testing

#### **Confirmation Email**
- ✅ Subject: "Your Free Home Audit is Scheduled — Please Prepare Your Valuables"
- ✅ Contains appointment details
- ✅ Includes preparation checklist
- ✅ Professional formatting

#### **24-Hour Reminder**
- ✅ Subject: "Reminder: Your Home Audit is Tomorrow — Please Prepare Your Valuables"
- ✅ Final preparation checklist
- ✅ Officer arrival information

### 3. Payment Integration Testing

#### **Square Payment Tests**
- ✅ Test card: `4111 1111 1111 1111`
- ✅ Expiry: Any future date
- ✅ CVV: Any 3 digits
- ✅ Test Title Protection payment ($50)
- ✅ Verify payment success/failure handling

### 4. Admin Dashboard Testing

#### **Admin Login Tests**
- **Admin Credentials:**
  ```
  Username: admin (create your own)
  Password: admin123 (set your own)
  Admin Key: SECURE_ADMIN_KEY_2024
  ```

#### **Admin Functions**
- ✅ View all appointments
- ✅ Create officer accounts
- ✅ Assign officers to appointments
- ✅ View payment reports
- ✅ Monitor appointment statuses
- ✅ Access audit reports

### 5. Officer Dashboard Testing

#### **Officer Account Creation**
- ✅ Admin creates officer account
- ✅ Officer login at `/auth`
- ✅ Redirects to `/officer` dashboard

#### **Officer Functions**
- ✅ View assigned appointments
- ✅ Add audit items (category, description, value, photos)
- ✅ Upload receipts
- ✅ Mark audit complete
- ✅ Generate PDF reports

### 6. DocuSign Integration Testing

#### **Service Agreement Flow**
- ✅ Auto-triggered after appointment booking
- ✅ Customer receives DocuSign email
- ✅ Digital signature collection
- ✅ Completed agreement tracking
- ✅ PDF download functionality

### 7. Database Testing

#### **Data Verification**
- ✅ Appointments stored correctly
- ✅ Payment records created
- ✅ User roles working (homeowner, officer, admin)
- ✅ Audit items and photos saved
- ✅ Report generation data

---

## 🔧 Test Data

### **Sample Customer Data**
```json
{
  "fullName": "John Test Customer",
  "email": "customer@test.com",
  "phone": "(555) 123-4567",
  "address": "123 Test Street, Dallas, TX 75201"
}
```

### **Sample Officer Data**
```json
{
  "username": "officer1",
  "password": "officer123",
  "fullName": "Officer Jane Smith",
  "email": "officer@test.com",
  "role": "officer"
}
```

### **Test Credit Card (Square Sandbox)**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
ZIP: 12345
```

---

## 🚀 Quick Test Workflow

### **Complete Flow Test (15 minutes)**
1. **Landing Page** → Check content and CTA
2. **Book Appointment** → Fill form, submit
3. **Check Email** → Verify confirmation sent
4. **Admin Login** → View appointment in admin panel
5. **Create Officer** → Add officer account
6. **Assign Officer** → Assign to appointment
7. **Officer Login** → Complete audit
8. **Generate Report** → PDF creation
9. **Payment Test** → Test Title Protection

### **Critical Path Test (5 minutes)**
1. Landing page loads correctly
2. Appointment booking works
3. Email confirmation sent
4. Admin can view appointments
5. Payment processing works

---

## 📋 Test Checklist

### **Functionality Testing**
- [ ] Landing page displays correct content
- [ ] Appointment booking form works
- [ ] Date picker restricts to 7 days
- [ ] Email confirmations sent
- [ ] Square payments process
- [ ] Admin dashboard accessible
- [ ] Officer workflow complete
- [ ] DocuSign integration works
- [ ] PDF reports generate

### **UI/UX Testing**
- [ ] Mobile responsive design
- [ ] Navigation works smoothly
- [ ] Forms validate properly
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Success confirmations shown

### **Security Testing**
- [ ] Admin access restricted
- [ ] Role-based permissions work
- [ ] Payment data encrypted
- [ ] Session management secure
- [ ] File uploads validated

---

## 🐛 Common Issues & Solutions

### **Email Not Receiving**
- Check email secrets are configured
- Verify SMTP settings
- Check spam/junk folder

### **Payment Failing**
- Ensure Square sandbox credentials correct
- Test with valid card numbers only
- Check browser console for errors

### **Admin Access Issues**
- Verify admin key: `SECURE_ADMIN_KEY_2024`
- Check role assignment in database
- Clear browser cache/cookies

### **Database Errors**
- Restart application workflow
- Check PostgreSQL connection
- Verify schema migrations ran

---

## 📞 Support Information

**Development Server:** `http://localhost:5000`
**Admin Registration:** `/admin-register`
**Admin Key:** `SECURE_ADMIN_KEY_2024`
**Support Phone:** (555) 123-SECURE
**Test Email Domain:** Use any valid email for testing

---

*Last Updated: August 22, 2025*
*Platform: SecureHome Audit Platform v1.0*