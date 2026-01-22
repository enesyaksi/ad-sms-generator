# ⚠️ Common Mistakes

This document lists the most common mistakes made by interns and how to avoid them.
Learn from others' mistakes before making your own!

---

## Table of Contents

- [Git & PR Mistakes](#git--pr-mistakes)
- [Architecture Mistakes](#architecture-mistakes)
- [Python (Backend) Mistakes](#python-backend-mistakes)
- [React (Frontend) Mistakes](#react-frontend-mistakes)
- [Code Quality Mistakes](#code-quality-mistakes)
- [Security Mistakes](#security-mistakes)

---

## Git & PR Mistakes

### ❌ Vague Commit Messages

```bash
# ❌ Bad
git commit -m "fix"
git commit -m "update"
git commit -m "wip"
git commit -m "asdf"
git commit -m "final"
git commit -m "final final"
git commit -m "now it works"

# ✅ Good
git commit -m "feat(backend): add image generation endpoint"
git commit -m "fix(frontend): resolve form submission error"
git commit -m "docs: update API documentation"
```

---

### ❌ Giant Commits

```bash
# ❌ Bad - Everything in one commit
git add .
git commit -m "add backend and frontend and tests and docs"

# ✅ Good - Logical, atomic commits
git add app/models/
git commit -m "feat(backend): add request/response models"

git add app/services/
git commit -m "feat(backend): implement image generation service"

git add app/controllers/
git commit -m "feat(backend): add image controller endpoint"
```

---

### ❌ Committing Directly to Main

```bash
# ❌ Bad
git checkout main
git add .
git commit -m "add feature"
git push origin main

# ✅ Good
git checkout develop
git pull origin develop
git checkout -b feature/backend-image-endpoint
# ... make changes ...
git push -u origin feature/backend-image-endpoint
# → Create PR on GitHub
```

---

### ❌ Empty or Lazy PR Descriptions

```markdown
# ❌ Bad PR Description
Title: Update
Description: (empty)

# ❌ Also Bad
Title: Fix bug
Description: Fixed the bug

# ✅ Good PR Description
Title: feat(backend): Add image generation endpoint

## What does this PR do?
Adds the `/generate-image` endpoint that accepts ad parameters
and returns an AI-generated image using OpenAI.

## Related Issue
Closes #12

## Changes Made
- Added `ImageController` with POST endpoint
- Created `ImageService` for business logic
- Implemented `OpenAIClient` for API calls
- Added request/response models

## How to Test
1. Start the backend server
2. Send POST request to `/generate-image`
3. Verify image is returned in response

## Checklist
- [x] Code follows project standards
- [x] Self-reviewed my code
- [x] Tested manually
```

---

### ❌ Not Linking Issues

```markdown
# ❌ Bad - No issue reference
Description: Added new feature

# ✅ Good - Links and closes issue
Description: Implements the image generation endpoint

Closes #12
```

---

## Architecture Mistakes

### ❌ Business Logic in Controller

```python
# ❌ Bad - Controller doing too much
class ImageController:
    @router.post("/generate-image")
    async def generate(self, request: ImageRequest):
        # ❌ Business logic in controller!
        prompt = f"Create an ad for: {request.headline}. Style: {request.description}"
        
        if request.model == "chatgpt":
            response = openai.Image.create(prompt=prompt, size=request.size)
            image_url = response['data'][0]['url']
        else:
            response = genai.generate_image(prompt=prompt)
            image_url = response.url
            
        return {"image": image_url}


# ✅ Good - Controller only handles HTTP
class ImageController:
    def __init__(self, image_service: ImageService):
        self.image_service = image_service
    
    @router.post("/generate-image")
    async def generate(self, request: ImageRequest):
        result = await self.image_service.generate(request)
        return result
```

---

### ❌ HTTP Logic in Service

```python
# ❌ Bad - Service knows about HTTP
class ImageService:
    def generate(self, request):
        if not request.headline:
            raise HTTPException(status_code=400, detail="Headline required")  # ❌
        
        image = self.client.generate(request)
        return JSONResponse(content={"image": image})  # ❌


# ✅ Good - Service handles business logic only
class ImageService:
    def generate(self, request: ImageRequest) -> ImageResponse:
        if not request.headline:
            raise ValidationError("Headline is required")  # Custom exception
        
        prompt = self.prompt_builder.build(request)
        image = self.client.generate(prompt)
        return ImageResponse(image=image, provider=request.model)
```

---

### ❌ API Calls in Frontend Components

```jsx
// ❌ Bad - API call directly in component
const AdForm = () => {
  const handleSubmit = async () => {
    const response = await fetch('http://localhost:8000/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline, description, size, model })
    });
    const data = await response.json();
    setImage(data.image);
  };
};


// ✅ Good - API calls in service layer
// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const generateImage = async (params) => {
  const response = await fetch(`${API_BASE_URL}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate image');
  }
  
  return response.json();
};

// components/Form/AdForm.jsx
import { generateImage } from '../../services/api';

const AdForm = () => {
  const handleSubmit = async () => {
    const result = await generateImage({ headline, description, size, model });
    setImage(result.image);
  };
};
```

---

### ❌ Wrong File Placement

```
# ❌ Bad - Files in wrong locations
backend/
├── app/
│   ├── main.py
│   ├── generate_image.py      # ❌ What layer is this?
│   ├── openai.py              # ❌ Should be in clients/
│   ├── helpers.py             # ❌ Should be in utils/
│   └── prompt.py              # ❌ Should be in utils/

# ✅ Good - Clear organization
backend/
├── app/
│   ├── main.py
│   ├── controllers/
│   │   └── image_controller.py
│   ├── services/
│   │   └── image_generation_service.py
│   ├── clients/
│   │   ├── openai_client.py
│   │   └── gemini_client.py
│   └── utils/
│       └── prompt_builder.py
```

---

## Python (Backend) Mistakes

### ❌ No Type Hints

```python
# ❌ Bad - No types
def build_prompt(headline, description, size):
    return f"Create ad: {headline}"


# ✅ Good - With type hints
def build_prompt(headline: str, description: str, size: str) -> str:
    return f"Create ad: {headline}"
```

---

### ❌ Generic Exception Handling

```python
# ❌ Bad - Catching everything, hiding errors
def generate_image(prompt):
    try:
        return client.generate(prompt)
    except Exception as e:
        print(e)
        return None  # ❌ Silent failure!


# ✅ Good - Specific exceptions, proper handling
def generate_image(prompt: str) -> str:
    try:
        return client.generate(prompt)
    except ConnectionError as e:
        logger.error(f"Failed to connect to AI provider: {e}")
        raise AIProviderError("Could not connect to AI service")
    except TimeoutError as e:
        logger.error(f"AI provider timeout: {e}")
        raise AIProviderError("AI service timed out")
```

---

### ❌ Hardcoded Values

```python
# ❌ Bad - Hardcoded configuration
class OpenAIClient:
    def __init__(self):
        self.api_key = "sk-abc123..."  # ❌ Never do this!
        self.base_url = "https://api.openai.com"  # ❌ Should be config
        self.timeout = 30  # ❌ Should be config


# ✅ Good - Configuration from environment
from app.config.settings import settings

class OpenAIClient:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL
        self.timeout = settings.API_TIMEOUT
```

---

### ❌ Print Statements Instead of Logging

```python
# ❌ Bad - Using print
def generate_image(prompt):
    print(f"Generating image with prompt: {prompt}")  # ❌
    result = client.generate(prompt)
    print(f"Got result: {result}")  # ❌
    return result


# ✅ Good - Using proper logging
import logging

logger = logging.getLogger(__name__)

def generate_image(prompt: str) -> str:
    logger.info(f"Generating image with prompt: {prompt[:50]}...")
    result = client.generate(prompt)
    logger.debug(f"Generation successful")
    return result
```

---

## React (Frontend) Mistakes

### ❌ Not Handling Loading States

```jsx
// ❌ Bad - No loading indicator
const AdForm = () => {
  const handleSubmit = async () => {
    const result = await generateImage(formData);  // User sees nothing!
    setImage(result.image);
  };

  return <button onClick={handleSubmit}>Generate</button>;
};


// ✅ Good - Proper loading state
const AdForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await generateImage(formData);
      setImage(result.image);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Generating...' : 'Generate'}
    </button>
  );
};
```

---

### ❌ Not Handling Errors

```jsx
// ❌ Bad - Errors disappear silently
const handleSubmit = async () => {
  try {
    const result = await generateImage(formData);
    setImage(result.image);
  } catch (error) {
    // Nothing happens, user confused
  }
};


// ✅ Good - Show error to user
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setError(null);
  setIsLoading(true);
  
  try {
    const result = await generateImage(formData);
    setImage(result.image);
  } catch (error) {
    setError('Failed to generate image. Please try again.');
    console.error('Generation failed:', error);
  } finally {
    setIsLoading(false);
  }
};

return (
  <>
    {error && <div className="error-message">{error}</div>}
    <button onClick={handleSubmit}>Generate</button>
  </>
);
```

---

### ❌ Inline Styles Everywhere

```jsx
// ❌ Bad - Inline styles
const Button = () => (
  <button style={{
    backgroundColor: 'blue',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer'
  }}>
    Click me
  </button>
);


// ✅ Good - CSS classes
// Button.css
.submit-button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

// Button.jsx
import './Button.css';

const Button = () => (
  <button className="submit-button">
    Click me
  </button>
);
```

---

### ❌ God Components

```jsx
// ❌ Bad - One component doing everything (200+ lines)
const Home = () => {
  // 20 useState hooks
  // 10 useEffect hooks
  // 15 handler functions
  // 200 lines of JSX
  // Form, preview, header, footer all in one file
};


// ✅ Good - Split into focused components
// pages/Home.jsx
const Home = () => (
  <div className="home">
    <Header />
    <AdForm onSubmit={handleGenerate} />
    <ImagePreview image={image} />
    <Footer />
  </div>
);

// components/Form/AdForm.jsx - Handles form only
// components/Preview/ImagePreview.jsx - Handles preview only
// components/common/Header.jsx - Handles header only
```

---

## Code Quality Mistakes

### ❌ Commented-Out Code

```python
# ❌ Bad - Dead code left in
def generate_image(prompt):
    # old_prompt = build_old_prompt(prompt)
    # result = old_client.generate(old_prompt)
    # if result.status == "error":
    #     return None
    
    new_prompt = build_prompt(prompt)
    return client.generate(new_prompt)


# ✅ Good - Clean code, use git for history
def generate_image(prompt: str) -> str:
    formatted_prompt = build_prompt(prompt)
    return client.generate(formatted_prompt)
```

---

### ❌ Magic Numbers

```python
# ❌ Bad - What do these numbers mean?
def validate_size(width, height):
    if width > 1024 or height > 1024:
        return False
    if width < 100 or height < 100:
        return False
    return True


# ✅ Good - Named constants
MAX_IMAGE_DIMENSION = 1024
MIN_IMAGE_DIMENSION = 100

def validate_size(width: int, height: int) -> bool:
    if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
        return False
    if width < MIN_IMAGE_DIMENSION or height < MIN_IMAGE_DIMENSION:
        return False
    return True
```

---

### ❌ Inconsistent Naming

```python
# ❌ Bad - Mixed conventions
def getUserData():      # camelCase
    user_name = "John"  # snake_case
    UserAge = 25        # PascalCase
    USERMAIL = "a@b.c"  # UPPER_CASE
    return user_name


# ✅ Good - Consistent snake_case for Python
def get_user_data():
    user_name = "John"
    user_age = 25
    user_email = "a@b.com"
    return user_name
```

---

## Security Mistakes

### ❌ API Keys in Code

```python
# ❌ NEVER DO THIS
OPENAI_API_KEY = "sk-abc123xyz..."

# ❌ Also bad - in frontend
const API_KEY = "sk-abc123xyz...";


# ✅ Good - Environment variables
# .env (never commit this!)
OPENAI_API_KEY=sk-abc123xyz...

# Python
import os
api_key = os.getenv("OPENAI_API_KEY")
```

---

### ❌ Committing .env Files

```bash
# ❌ Bad - .env in repository
git add .env
git commit -m "add config"

# ✅ Good - .env in .gitignore
# .gitignore
.env
.env.local
.env.*.local
```

---

### ❌ API Keys in Frontend

```jsx
// ❌ NEVER DO THIS - Anyone can see this!
const response = await fetch('https://api.openai.com/v1/images', {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}`  // ❌
  }
});


// ✅ Good - Call your backend instead
const response = await fetch('/api/generate-image', {
  method: 'POST',
  body: JSON.stringify({ headline, description })
});
// Backend handles the API key securely
```

---

### ❌ No Input Validation

```python
# ❌ Bad - Trusting user input
@router.post("/generate")
async def generate(request: dict):
    prompt = request["headline"]  # ❌ Could crash
    image = client.generate(prompt)  # ❌ No validation
    return {"image": image}


# ✅ Good - Validate everything
from pydantic import BaseModel, validator

class ImageRequest(BaseModel):
    headline: str
    description: str
    size: str
    model: str
    
    @validator('headline')
    def headline_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Headline cannot be empty')
        return v.strip()
    
    @validator('size')
    def valid_size(cls, v):
        allowed = ['300x250', '320x480', '728x90']
        if v not in allowed:
            raise ValueError(f'Size must be one of {allowed}')
        return v

@router.post("/generate")
async def generate(request: ImageRequest):  # ✅ Validated automatically
    image = service.generate(request)
    return {"image": image}
```

---

## Quick Checklist Before PR

```
Before submitting your PR, check:

□ No hardcoded values or API keys
□ No console.log / print statements left
□ No commented-out code
□ All files in correct folders
□ Proper error handling
□ Loading states in UI
□ Type hints in Python
□ Meaningful variable names
□ Small, focused commits
□ PR description filled out
```

---

> 💡 **Remember:** Making mistakes is part of learning.  
> The goal is to **recognize** and **fix** them before they reach `main`.
