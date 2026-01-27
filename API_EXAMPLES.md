# 🔌 API Examples

API documentation for the AI SMS Ad Generator with Firebase authentication.

---

## Table of Contents

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Customer Endpoints](#customer-endpoints)
- [SMS Generation](#sms-generation)
- [Health Check](#health-check)
- [Error Responses](#error-responses)

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:8000` |
| API Documentation | `http://localhost:8000/docs` |

---

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header.

### Header Format
```
Authorization: Bearer <firebase_id_token>
```

### Verify Token

**Endpoint:** `POST /auth/verify-token`

Verifies a Firebase ID token and returns user information.

#### curl
```bash
curl -X POST http://localhost:8000/auth/verify-token \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

#### Response
```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "email_verified": true
}
```

---

### Get Current User

**Endpoint:** `GET /auth/user`

Returns the current authenticated user's profile.

#### curl
```bash
curl -X GET http://localhost:8000/auth/user \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

#### Response
```json
{
  "uid": "abc123xyz",
  "email": "user@example.com",
  "display_name": "John Doe"
}
```

---

## Customer Endpoints

All customer endpoints require authentication.

### List All Customers

**Endpoint:** `GET /customers`

Returns all customers for the authenticated user.

#### curl
```bash
curl -X GET http://localhost:8000/customers \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

#### Response
```json
{
  "customers": [
    {
      "id": "customer_123",
      "name": "Acme Corp",
      "website_url": "https://acme.com",
      "phone_number": "+90 555 123 4567",
      "logo_url": "https://acme.com/logo.png",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Customer

**Endpoint:** `POST /customers`

Creates a new customer with automatic logo extraction.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Company name |
| `website_url` | string | ✅ | Company website URL |
| `phone_number` | string | ❌ | Contact phone number |

#### curl
```bash
curl -X POST http://localhost:8000/customers \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "website_url": "https://acme.com",
    "phone_number": "+90 555 123 4567"
  }'
```

#### Response
```json
{
  "id": "customer_123",
  "name": "Acme Corp",
  "website_url": "https://acme.com",
  "phone_number": "+90 555 123 4567",
  "logo_url": "https://extracted-logo.png",
  "created_at": "2026-01-27T10:30:00Z"
}
```

---

### Get Single Customer

**Endpoint:** `GET /customers/{id}`

#### curl
```bash
curl -X GET http://localhost:8000/customers/customer_123 \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

### Update Customer

**Endpoint:** `PUT /customers/{id}`

#### curl
```bash
curl -X PUT http://localhost:8000/customers/customer_123 \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "phone_number": "+90 555 999 8888"
  }'
```

---

### Delete Customer

**Endpoint:** `DELETE /customers/{id}`

#### curl
```bash
curl -X DELETE http://localhost:8000/customers/customer_123 \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

#### Response
```json
{
  "message": "Customer deleted successfully"
}
```

---

## SMS Generation

### Generate SMS Drafts

**Endpoint:** `POST /generate-sms`

Generates AI-powered SMS ad drafts based on campaign parameters.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `website_url` | string | ✅ | Target website URL |
| `products` | string[] | ✅ | List of products to promote |
| `discount_rate` | number | ✅ | Discount percentage (0-100) |
| `message_count` | number | ✅ | Number of drafts (1-10) |
| `target_audience` | string | ❌ | Target audience description |
| `start_date` | string | ❌ | Campaign start date (YYYY-MM-DD) |
| `end_date` | string | ❌ | Campaign end date (YYYY-MM-DD) |
| `phone_number` | string | ❌ | Contact phone to include in SMS |

#### curl
```bash
curl -X POST http://localhost:8000/generate-sms \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://example.com",
    "products": ["Laptop", "Tablet"],
    "discount_rate": 25,
    "message_count": 3,
    "target_audience": "Öğrenciler",
    "start_date": "2026-02-01",
    "end_date": "2026-02-15",
    "phone_number": "+90 555 123 4567"
  }'
```

#### Response
```json
{
  "drafts": [
    {
      "type": "Klasik",
      "content": "Öğrencilere özel! Laptop ve Tablet ürünlerimizde %25 indirim fırsatı! 01.02.2026 - 15.02.2026 tarihleri arasında geçerli. Bilgi için: 0555 123 4567"
    },
    {
      "type": "Acil",
      "content": "SON ŞANS! %25 indirimli Laptop fırsatını kaçırma! Kampanya 15.02.2026'da bitiyor. Hemen ara: 0555 123 4567"
    },
    {
      "type": "Dostça",
      "content": "Hey! Laptop ve Tablet almak için harika bir zaman 🎉 %25 indirimle seni bekliyoruz! Detaylar: 0555 123 4567"
    }
  ]
}
```

---

## Health Check

**Endpoint:** `GET /health`

#### curl
```bash
curl http://localhost:8000/health
```

#### Response
```json
{
  "status": "healthy"
}
```

---

## Error Responses

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "detail": "Invalid or expired token"
}
```

### 403 Forbidden

User doesn't have permission to access this resource.

```json
{
  "detail": "Not authorized to access this customer"
}
```

### 404 Not Found

Resource doesn't exist.

```json
{
  "detail": "Customer not found"
}
```

### 422 Validation Error

Request body validation failed.

```json
{
  "detail": [
    {
      "loc": ["body", "website_url"],
      "msg": "Invalid URL format",
      "type": "value_error"
    }
  ]
}
```

### 429 Too Many Requests

Gemini API rate limit exceeded.

```json
{
  "detail": "Rate limit exceeded. Please try again in a few seconds."
}
```

### 500 Internal Server Error

Server-side error (details hidden for security).

```json
{
  "detail": "An unexpected error occurred"
}
```

---

## Testing Tips

### Get Firebase ID Token (for testing)

In browser console after logging in:

```javascript
// Get current user's ID token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log(token);
```

### Use Swagger UI

The easiest way to test endpoints is via Swagger UI at:
```
http://localhost:8000/docs
```

---

> 💡 **Tip:** Use Swagger UI for interactive testing without writing curl commands!
