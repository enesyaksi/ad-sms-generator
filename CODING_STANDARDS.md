# 📐 Coding Standards

This document defines the coding conventions and standards for the AI Ad Creative Generator project.
All contributors must follow these guidelines to maintain code consistency and quality.

---

## Table of Contents

- [General Principles](#general-principles)
- [Python (Backend)](#python-backend)
- [JavaScript/React (Frontend)](#javascriptreact-frontend)
- [File & Folder Organization](#file--folder-organization)
- [Comments & Documentation](#comments--documentation)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)

---

## General Principles

### Code Readability

- Write code for humans first, computers second
- Keep functions small and focused (max 20-30 lines)
- One function = one responsibility
- Avoid deep nesting (max 3 levels)

### DRY (Don't Repeat Yourself)

- Extract repeated logic into reusable functions
- Use constants for repeated values
- Share common utilities across modules

### KISS (Keep It Simple, Stupid)

- Prefer simple solutions over clever ones
- If code needs extensive comments to explain, simplify it
- Avoid premature optimization

---

## Python (Backend)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | `snake_case` | `user_name`, `image_size` |
| Functions | `snake_case` | `generate_image()`, `build_prompt()` |
| Classes | `PascalCase` | `ImageService`, `OpenAIClient` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_SIZE` |
| Files | `snake_case` | `image_controller.py`, `prompt_builder.py` |
| Private | `_leading_underscore` | `_validate_input()`, `_api_key` |

### Code Style

```python
# ✅ Good
def generate_ad_image(headline: str, description: str, size: str) -> dict:
    """Generate an ad image using AI provider."""
    prompt = build_prompt(headline, description)
    image = ai_client.generate(prompt, size)
    return {"image": image, "size": size}


# ❌ Bad
def genImg(h, d, s):
    p = buildP(h, d)
    i = client.gen(p, s)
    return {"image": i, "size": s}
```

### Imports

```python
# ✅ Correct order
# 1. Standard library
import os
import json
from datetime import datetime

# 2. Third-party packages
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# 3. Local imports
from app.services.image_service import ImageService
from app.utils.prompt_builder import build_prompt
```

### Type Hints

```python
# ✅ Always use type hints
def calculate_dimensions(size: str) -> tuple[int, int]:
    width, height = size.split("x")
    return int(width), int(height)


# ❌ Avoid untyped functions
def calculate_dimensions(size):
    width, height = size.split("x")
    return int(width), int(height)
```

### Docstrings

```python
def build_prompt(headline: str, description: str, size: str) -> str:
    """
    Build an optimized prompt for AI image generation.

    Args:
        headline: The ad headline text
        description: Visual description of the desired image
        size: Image dimensions (e.g., "300x250")

    Returns:
        Formatted prompt string for the AI provider

    Raises:
        ValueError: If size format is invalid
    """
    # Implementation here
```

---

## JavaScript/React (Frontend)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | `camelCase` | `userName`, `imageSize` |
| Functions | `camelCase` | `generateImage()`, `handleSubmit()` |
| Components | `PascalCase` | `AdForm`, `ImagePreview` |
| Constants | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_FILE_SIZE` |
| Files (components) | `PascalCase.jsx` | `AdForm.jsx`, `Button.jsx` |
| Files (utilities) | `camelCase.js` | `api.js`, `helpers.js` |
| CSS classes | `kebab-case` | `form-container`, `submit-button` |

### Component Structure

```jsx
// ✅ Good - Clear and organized
import { useState } from 'react';
import Button from '../common/Button';
import { generateImage } from '../../services/api';

const AdForm = () => {
  const [headline, setHeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await generateImage({ headline });
      // Handle result
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Enter headline"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </Button>
    </form>
  );
};

export default AdForm;
```

### Imports

```jsx
// ✅ Correct order
// 1. React and hooks
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import axios from 'axios';

// 3. Components
import Button from '../common/Button';
import ImagePreview from '../Preview/ImagePreview';

// 4. Services and utilities
import { generateImage } from '../../services/api';
import { formatSize } from '../../utils/helpers';

// 5. Styles
import './AdForm.css';
```

### Props

```jsx
// ✅ Good - Destructured props with defaults
const Button = ({ 
  children, 
  type = 'button', 
  disabled = false, 
  onClick 
}) => {
  return (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};


// ❌ Bad - Unclear props usage
const Button = (props) => {
  return (
    <button type={props.type} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  );
};
```

---

## File & Folder Organization

### Backend

```
✅ Correct placement:
- HTTP logic → controllers/
- Business logic → services/
- External API calls → clients/
- Helper functions → utils/
- Data structures → models/

❌ Wrong:
- API calls in controllers
- HTTP responses in services
- Business logic in clients
```

### Frontend

```
✅ Correct placement:
- Reusable UI elements → components/common/
- Feature components → components/[Feature]/
- Page layouts → pages/
- API calls → services/
- Helper functions → utils/

❌ Wrong:
- API calls directly in components
- Business logic in UI components
- Styles mixed with logic
```

---

## Comments & Documentation

### When to Comment

```python
# ✅ Good - Explains WHY, not WHAT
# Using retry logic because OpenAI API occasionally times out under heavy load
for attempt in range(MAX_RETRIES):
    try:
        return client.generate(prompt)
    except TimeoutError:
        continue


# ❌ Bad - Obvious comment
# Loop through retries
for attempt in range(MAX_RETRIES):
    ...
```

### When NOT to Comment

```python
# ❌ Bad - Code should be self-explanatory
# Set the user name
user_name = "John"

# ✅ Good - No comment needed
user_name = "John"
```

### TODO Comments

```python
# ✅ Good - Actionable TODO with context
# TODO(mbilgil): Add rate limiting after v1 launch - Issue #45

# ❌ Bad - Vague TODO
# TODO: fix this later
```

---

## Error Handling

### Python

```python
# ✅ Good - Specific exceptions with context
from app.exceptions.api_exceptions import AIProviderError, ValidationError

def generate_image(request: ImageRequest) -> ImageResponse:
    if not request.headline:
        raise ValidationError("Headline is required")
    
    try:
        result = ai_client.generate(request.prompt)
    except ConnectionError as e:
        raise AIProviderError(f"Failed to connect to AI provider: {e}")
    
    return ImageResponse(image=result)


# ❌ Bad - Generic exception handling
def generate_image(request):
    try:
        result = ai_client.generate(request.prompt)
    except Exception as e:
        print(e)  # Never do this
        return None
```

### JavaScript

```jsx
// ✅ Good - Proper error handling with user feedback
const handleSubmit = async () => {
  setError(null);
  setIsLoading(true);
  
  try {
    const result = await generateImage(formData);
    setImage(result.image);
  } catch (error) {
    if (error.response?.status === 400) {
      setError('Please check your input and try again.');
    } else if (error.response?.status === 500) {
      setError('Server error. Please try again later.');
    } else {
      setError('An unexpected error occurred.');
    }
    console.error('Image generation failed:', error);
  } finally {
    setIsLoading(false);
  }
};


// ❌ Bad - Silent failure
const handleSubmit = async () => {
  try {
    const result = await generateImage(formData);
    setImage(result.image);
  } catch (error) {
    // Do nothing
  }
};
```

---

## Environment Variables

### Naming

```bash
# ✅ Good - Clear and prefixed
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx
APP_DEBUG=false
APP_PORT=8000

# ❌ Bad - Unclear names
KEY1=sk-xxx
DEBUG=false
PORT=8000
```

### Usage in Python

```python
# ✅ Good - Centralized config with validation
# config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    DEBUG: bool = os.getenv("APP_DEBUG", "false").lower() == "true"
    
    def validate(self):
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required")

settings = Settings()


# ❌ Bad - Direct access everywhere
api_key = os.getenv("OPENAI_API_KEY")  # Scattered across files
```

### Usage in JavaScript

```javascript
// ✅ Good - Centralized and validated
// config.js
const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
};

if (!config.apiBaseUrl) {
  console.warn('API base URL not configured');
}

export default config;


// ❌ Bad - Hardcoded values
const API_URL = 'http://localhost:8000';  // Never hardcode
```

---

## Quick Reference

### Do's ✅

- Use meaningful, descriptive names
- Keep functions small and focused
- Handle errors explicitly
- Use type hints (Python) / PropTypes or TypeScript (JS)
- Follow the layer architecture
- Write self-documenting code

### Don'ts ❌

- Don't use single-letter variables (except loop counters)
- Don't leave commented-out code
- Don't hardcode configuration values
- Don't catch generic exceptions silently
- Don't mix responsibilities across layers
- Don't skip error handling

---

## Linting & Formatting

### Python

```bash
# Install tools
pip install black flake8 isort

# Format code
black .
isort .

# Check for issues
flake8 .
```

### JavaScript

```bash
# Install tools
npm install -D eslint prettier

# Format code
npx prettier --write .

# Check for issues
npx eslint .
```

---

> 💡 **Remember:** Clean code is not about being perfect.  
> It's about being **consistent**, **readable**, and **maintainable**.
