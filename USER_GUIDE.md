# 📖 User Guide

AI SMS Ad Generator - Turkish UI User Guide

---

## Table of Contents

- [Getting Started](#getting-started)
- [Creating an Account](#creating-an-account)
- [Email Verification](#email-verification)
- [Logging In](#logging-in)
- [Overview Dashboard](#overview-dashboard)
- [Customer Management](#customer-management)
- [Campaign Management](#campaign-management)
- [Generating SMS Campaigns](#generating-sms-campaigns)
- [User Settings](#user-settings)
- [FAQ](#faq)

---

## Getting Started

The AI SMS Ad Generator helps you create professional SMS marketing campaigns using artificial intelligence. The system analyzes your customer's website to generate context-aware, engaging SMS drafts in Turkish.

### Main Features
- 📊 **Overview Dashboard**: Quick stats and recent activities
- 🏢 **Customer Management**: Save and organize your clients with sorting and filtering
- 📋 **Campaign Management**: Create, track, and manage marketing campaigns
- 📱 **AI SMS Generation**: Create multiple SMS draft variations
- 🔒 **Secure Login**: Firebase authentication with email verification
- ⚙️ **User Settings**: Customize your profile

---

## Creating an Account

1. Open the application at `http://localhost:5173`
2. On the login page, click **"Kayıt Ol"** (Sign Up)
3. Fill in the registration form:
   - **Ad Soyad**: Your full name
   - **E-posta**: Your email address
   - **Şifre**: Password (minimum 8 characters, must include uppercase, lowercase, and special character)
   - **Şifre Tekrar**: Confirm your password
4. Click **"Kayıt Ol"** button
5. You'll be redirected to the Email Verification page

> **Password Requirements:**
> - Minimum 8 characters
> - At least 1 uppercase letter (A-Z)
> - At least 1 lowercase letter (a-z)
> - At least 1 special character (!@#$%^&*)

---

## Email Verification

After registration, you must verify your email address before accessing the dashboard.

### Verification Steps
1. Check your email inbox for a verification link
2. Also check your Spam/Junk folder
3. Click the verification link in the email
4. Return to the application - it will automatically detect verification
5. You'll be redirected to the Overview Dashboard

### Resend Verification Email
If you didn't receive the email:
1. Click **"Tekrar Gönder"** button on the verification page
2. Wait 60 seconds before resending again
3. Check your email (including spam folder)

### Switch Account
If you registered with the wrong email:
1. Click **"Farklı bir hesapla giriş yap"**
2. You'll be logged out and can register again

---

## Logging In

### Email/Password Login
1. Enter your **E-posta** (email)
2. Enter your **Şifre** (password)
3. Click **"Giriş Yap"** (Login)

> **Note**: You must have a verified email to access the dashboard.

### Google Login
1. Click **"Google ile Giriş Yap"** button
2. Select your Google account
3. Authorize the application

### Forgot Password
1. Click **"Şifremi Unuttum"**
2. Enter your email address in the modal
3. Click **"Bağlantı Gönder"**
4. Check your email for reset instructions
5. Click the reset link and create a new password

---

## Overview Dashboard

The Overview page is your home screen, showing a summary of all activities.

### Quick Stats Cards
| Card | Description |
|------|-------------|
| **Aktif Kampanyalar** | Number of currently active campaigns |
| **Toplam Müşteriler** | Total registered customers |
| **Toplam Kampanyalar** | All campaigns (any status) |
| **SMS Oluşturuldu** | Total SMS drafts generated |

### Analytics Trend
- Shows campaign growth trend compared to last period
- **Green arrow**: Positive growth
- **Red arrow**: Negative growth

### Recent Campaign Activities
- Lists the 5 most recently operated campaigns
- Shows campaign name, customer, status, and dates
- Click any campaign to view details

### Quick Actions
- **Yeni Kampanya Oluştur**: Start creating a new campaign
- **Müşteri Ekle**: Add a new customer

---

## Customer Management

### Customer List (Müşteriler)

Navigate to **Müşteriler** page from the sidebar.

#### Sorting Options
| Option | Description |
|--------|-------------|
| **Alfabetik** | Sort by name A-Z (default) |
| **En Son Eklenen** | Most recently added first |
| **İlk Eklenen** | Oldest first |
| **Son İşlem Yapılan** | Most recently operated |

#### Filtering Options
| Option | Description |
|--------|-------------|
| **Tüm Müşteriler** | Show all customers |
| **Kampanyalı** | Customers with any campaign |
| **Kampanyasız** | Customers without campaigns |
| **Aktif Kampanyalı** | Customers with active campaigns |
| **Planlanmış Kampanyalı** | Customers with planned campaigns |
| **Taslak Kampanyalı** | Customers with draft campaigns |
| **Tamamlanmış Kampanyalı** | Customers with completed campaigns |

### Creating a Customer
1. Click **"+ Yeni Müşteri Ekle"** button
2. Fill in the form:
   - **Şirket Adı**: Company name (required)
   - **Web Sitesi**: Company website URL (required)
   - **Telefon Numarası**: Contact phone (optional)
3. Click **"Kaydet"** (Save)

The system will automatically extract the company logo from the website.

### Customer Details
Click on a customer card to view:
- All campaigns associated with this customer
- Customer information (name, website, phone)
- Edit or delete options

---

## Campaign Management

### Campaign List (Kampanyalar)

Navigate to **Kampanyalar** page from the sidebar.

#### Campaign Status Types
| Status | Description | Badge Color |
|--------|-------------|-------------|
| **Taslak** | Draft campaign, not started | Gray |
| **Planlandı** | Scheduled to start in future | Blue |
| **Aktif** | Currently running campaign | Green |
| **Tamamlandı** | Campaign has ended | Purple |

> **Note**: Status updates automatically based on start/end dates!

#### Sorting Options
| Option | Description |
|--------|-------------|
| **En Son Eklenen** | Most recently added (default) |
| **İlk Eklenen** | Oldest first |
| **Alfabetik** | Sort by name A-Z |
| **Son İşlem Yapılan** | Most recently modified |
| **Başlangıç Tarihi** | By start date |
| **Bitiş Tarihi** | By end date |

### Creating a Campaign
1. Click **"+ Yeni Kampanya"** button
2. Fill in the form:
   - **Müşteri**: Select a customer from dropdown
   - **Kampanya Adı**: Name your campaign
   - **Ürünler**: Add products (comma-separated or press Enter)
   - **İndirim Oranı**: Discount percentage
   - **Başlangıç Tarihi**: Campaign start date
   - **Bitiş Tarihi**: Campaign end date
3. Click **"Oluştur"** (Create)

#### Date Validation Rules
- End date must be after start date
- Cannot set end date before today
- Dates should be in reasonable range (not too far in future)

### Campaign Details Page
Click on any campaign to see:
- **Müşteri Bilgisi**: Customer info card
- **Kampanya Ürünleri**: Products being promoted (as tags)
- **İndirim Oranı**: Discount rate in styled box
- **Kampanya Tarihleri**: Start/end dates with countdown
- **Generated SMS**: Previously created SMS drafts

---

## Generating SMS Campaigns

### From Campaign Details
1. Open a campaign detail page
2. Scroll to SMS section
3. Set **Mesaj Sayısı** (1-10 drafts)
4. Click **"SMS Oluştur"** (Generate SMS)
5. Wait for AI to generate drafts

### SMS Draft Types
| Type | Description |
|------|-------------|
| **Klasik** | Standard promotional message |
| **Acil** | Urgency-focused (e.g., "Son şans!") |
| **Dostça** | Friendly, casual tone with emojis |
| **Bilgilendirici** | Informative, detailed message |

### Copying SMS Drafts
Click on any generated draft to copy it to your clipboard.

---

## User Settings

Access settings by clicking your profile icon → **"Ayarlar"**

### Profile Settings

**Changing Display Name:**
1. Edit the **"Görünen Ad"** field
2. Click **"Kaydet"** (Save)
3. Your new name appears immediately in the navigation

**Changing Password:**
1. Enter your **Mevcut Şifre** (current password)
2. Enter your **Yeni Şifre** (new password)
3. Confirm with **Yeni Şifre Tekrar**
4. Click **"Şifreyi Değiştir"**

> **Note**: Password change requires re-authentication if you've been logged in for a while.

---

## FAQ

### General Questions

**Q: How does the AI generate SMS messages?**
A: The system uses Google Gemini AI to analyze your customer's website and generate contextually relevant SMS drafts in Turkish.

**Q: How many SMS can I generate at once?**
A: You can generate between 1-10 SMS drafts per request.

**Q: Are the SMS drafts in Turkish?**
A: Yes, all generated content is in Turkish with proper date formatting.

### Email Verification

**Q: I didn't receive the verification email**
A: Check your spam/junk folder. You can also click "Tekrar Gönder" to resend (wait 60 seconds between attempts).

**Q: Can I use the app without verifying email?**
A: No, email verification is required for security. You'll be redirected to verify-email page until verified.

### Customer Management

**Q: Why doesn't my customer's logo appear?**
A: Some websites have bot protection (Cloudflare) that prevents logo extraction. The customer will still be saved with a placeholder image.

**Q: Can I edit a customer after creating?**
A: Yes, go to customer details and click the edit icon.

### Campaign Management

**Q: How does automatic status work?**
A: Campaigns automatically update:
- **Taslak** → Initial draft status
- **Planlandı** → When start date is in the future
- **Aktif** → When current date is between start and end
- **Tamamlandı** → When end date has passed

**Q: Can I change campaign dates after creation?**
A: Yes, edit the campaign and update the dates. Status will adjust automatically.

### Technical Issues

**Q: I'm getting "429 Too Many Requests" error**
A: This means the AI service rate limit was exceeded. Wait a few seconds and try again.

**Q: The website scraping failed**
A: Some websites block automated access. Try entering product information manually.

**Q: I forgot my password**
A: Click "Şifremi Unuttum" on the login page to receive a password reset email.

---

## Need Help?

If you encounter issues not covered in this guide, please check:
- [README.md](./README.md) - Project overview and setup
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Technical setup instructions
- [API_EXAMPLES.md](./API_EXAMPLES.md) - API documentation

---

> 💡 **Tip:** The AI works best when you provide detailed product names and specific target audience descriptions!
