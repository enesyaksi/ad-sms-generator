# 🔌 API Examples

This document provides examples for testing and interacting with the AI Ad Creative Generator API.

---

## Table of Contents

- [Base URL](#base-url)
- [Endpoints Overview](#endpoints-overview)
- [Health Check](#health-check)
- [Generate Image](#generate-image)
- [Error Responses](#error-responses)
- [Postman Collection](#postman-collection)
- [Testing Tips](#testing-tips)

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local Development | `http://localhost:8000` |
| API Documentation | `http://localhost:8000/docs` |

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info |
| `GET` | `/health` | Health check |
| `POST` | `/generate-image` | Generate ad image |

---

## Health Check

Check if the API is running and healthy.

### Endpoint

```
GET /health
```

### curl

```bash
curl -X GET http://localhost:8000/health
```

### Response

```json
{
  "status": "healthy"
}
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:8000/health');
const data = await response.json();
console.log(data);
// { status: "healthy" }
```

---

## Generate Image

Generate an AI-powered advertising image.

### Endpoint

```
POST /generate-image
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `headline` | string | ✅ Yes | Ad headline text |
| `description` | string | ✅ Yes | Visual description |
| `size` | string | ✅ Yes | Image dimensions |
| `model` | string | ✅ Yes | AI model to use |

### Available Sizes

| Size | Dimensions | Common Use |
|------|------------|------------|
| `300x250` | 300 × 250 px | Medium Rectangle |
| `320x480` | 320 × 480 px | Mobile Interstitial |
| `728x90` | 728 × 90 px | Leaderboard |
| `160x600` | 160 × 600 px | Wide Skyscraper |
| `300x600` | 300 × 600 px | Half Page |

### Available Models

| Value | Provider |
|-------|----------|
| `chatgpt` | OpenAI DALL-E |
| `gemini` | Google Gemini |

---

### Example 1: Basic Request

#### curl

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Summer Sale",
    "description": "Bright beach scene with sunglasses and tropical vibes",
    "size": "300x250",
    "model": "chatgpt"
  }'
```

#### Response

```json
{
  "image": "https://example.com/generated-image.png",
  "provider": "chatgpt",
  "size": "300x250"
}
```

---

### Example 2: Mobile Ad

#### curl

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Download Now",
    "description": "Modern app interface with gradient background, clean minimal design",
    "size": "320x480",
    "model": "gemini"
  }'
```

#### JavaScript (fetch)

```javascript
const generateImage = async () => {
  const response = await fetch('http://localhost:8000/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      headline: 'Download Now',
      description: 'Modern app interface with gradient background, clean minimal design',
      size: '320x480',
      model: 'gemini',
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  return data;
};
```

#### JavaScript (axios)

```javascript
import axios from 'axios';

const generateImage = async () => {
  try {
    const { data } = await axios.post('http://localhost:8000/generate-image', {
      headline: 'Download Now',
      description: 'Modern app interface with gradient background, clean minimal design',
      size: '320x480',
      model: 'gemini',
    });
    
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    throw error;
  }
};
```

---

### Example 3: Leaderboard Banner

#### curl

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Free Shipping on Orders $50+",
    "description": "E-commerce banner with shopping bags, gift boxes, and confetti on white background",
    "size": "728x90",
    "model": "chatgpt"
  }'
```

---

### Example 4: Product Ad

#### curl

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "New Collection 2025",
    "description": "Luxury fashion items on marble surface, elegant lighting, premium feel",
    "size": "300x600",
    "model": "chatgpt"
  }'
```

---

## Error Responses

### 400 Bad Request - Validation Error

```bash
# Missing required field
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "",
    "description": "Some description",
    "size": "300x250",
    "model": "chatgpt"
  }'
```

```json
{
  "detail": [
    {
      "loc": ["body", "headline"],
      "msg": "Headline cannot be empty",
      "type": "value_error"
    }
  ]
}
```

---

### 400 Bad Request - Invalid Size

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Summer Sale",
    "description": "Beach scene",
    "size": "999x999",
    "model": "chatgpt"
  }'
```

```json
{
  "detail": [
    {
      "loc": ["body", "size"],
      "msg": "Size must be one of ['300x250', '320x480', '728x90', '160x600', '300x600']",
      "type": "value_error"
    }
  ]
}
```

---

### 400 Bad Request - Invalid Model

```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Summer Sale",
    "description": "Beach scene",
    "size": "300x250",
    "model": "invalid-model"
  }'
```

```json
{
  "detail": [
    {
      "loc": ["body", "model"],
      "msg": "Model must be one of ['chatgpt', 'gemini']",
      "type": "value_error"
    }
  ]
}
```

---

### 500 Internal Server Error - AI Provider Error

```json
{
  "detail": "Failed to generate image. Please try again later."
}
```

---

### 503 Service Unavailable - Provider Timeout

```json
{
  "detail": "AI service is temporarily unavailable. Please try again."
}
```

---

## Postman Collection

### Import Instructions

1. Open Postman
2. Click **Import** button
3. Select **Raw text** tab
4. Paste the JSON below
5. Click **Import**

### Collection JSON

```json
{
  "info": {
    "name": "AI Ad Creative Generator",
    "description": "API collection for testing the AI Ad Creative Generator",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "API Info",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/"
      }
    },
    {
      "name": "Generate Image - ChatGPT",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/generate-image",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"headline\": \"Summer Sale\",\n  \"description\": \"Bright beach scene with sunglasses and tropical vibes\",\n  \"size\": \"300x250\",\n  \"model\": \"chatgpt\"\n}"
        }
      }
    },
    {
      "name": "Generate Image - Gemini",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/generate-image",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"headline\": \"Download Now\",\n  \"description\": \"Modern app interface with gradient background\",\n  \"size\": \"320x480\",\n  \"model\": \"gemini\"\n}"
        }
      }
    },
    {
      "name": "Generate Image - Validation Error",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/generate-image",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"headline\": \"\",\n  \"description\": \"Some description\",\n  \"size\": \"300x250\",\n  \"model\": \"chatgpt\"\n}"
        }
      }
    }
  ]
}
```

---

## Testing Tips

### 1. Use Verbose Mode in curl

```bash
# See full request/response headers
curl -v -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"headline": "Test", "description": "Test", "size": "300x250", "model": "chatgpt"}'
```

### 2. Pretty Print JSON Response

```bash
# Using jq
curl -s http://localhost:8000/health | jq .

# Using python
curl -s http://localhost:8000/health | python -m json.tool
```

### 3. Save Response to File

```bash
# Save response
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"headline": "Test", "description": "Test", "size": "300x250", "model": "chatgpt"}' \
  -o response.json

# View saved response
cat response.json | jq .
```

### 4. Measure Response Time

```bash
# Using curl timing
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"headline": "Test", "description": "Test", "size": "300x250", "model": "chatgpt"}' \
  -w "\n\nTime: %{time_total}s\n"
```

### 5. Test with Different Content Types

```bash
# ❌ Wrong - Missing Content-Type (will fail)
curl -X POST http://localhost:8000/generate-image \
  -d '{"headline": "Test"}'

# ✅ Correct - With Content-Type
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"headline": "Test", "description": "Test", "size": "300x250", "model": "chatgpt"}'
```

---

## Quick Reference

### Health Check
```bash
curl http://localhost:8000/health
```

### Generate Image (Minimal)
```bash
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"headline": "Sale", "description": "Product ad", "size": "300x250", "model": "chatgpt"}'
```

### Swagger UI
```
http://localhost:8000/docs
```

---

> 💡 **Tip:** Use Swagger UI at `/docs` for interactive API testing.  
> It's the fastest way to test endpoints without writing code!
