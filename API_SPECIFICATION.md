# 🔌 Signhify AI API Specification v1.0

**Base URL (Production):** `https://api.signhify-ai.vercel.app`  
**Base URL (Development):** `http://localhost:3001`  
**WebSocket:** `wss://api.signhify-ai.vercel.app/ws` (Production)  
**Authentication:** Bearer token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Commands](#commands)
3. [User Profile](#user-profile)
4. [Files](#files)
5. [Agents](#agents)
6. [WebSocket Real-Time](#websocket-real-time)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Examples](#examples)

---

## Authentication

### Google OAuth Login

**Flow:**
1. Frontend redirects user to Google OAuth
2. User authorizes
3. Google redirects to `/api/auth/callback/google?code=...&state=...`
4. Backend exchanges code for token
5. Backend creates/updates user
6. Backend returns JWT token
7. Frontend stores JWT in localStorage

### POST /api/auth/callback/google

Exchange Google authorization code for JWT token.

**Request:**
```http
POST /api/auth/callback/google
Content-Type: application/json

{
  "code": "4/0Aax8V...",
  "state": "randomstate123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Rahul Kumar",
    "avatar_url": "https://...",
    "tier": "free",
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Invalid authorization code"
}
```

---

### GET /api/auth/user

Get current authenticated user.

**Request:**
```http
GET /api/auth/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Rahul Kumar",
  "avatar_url": "https://...",
  "tier": "free",
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized - invalid or expired token"
}
```

---

### POST /api/auth/logout

Invalidate current session (client-side only in MVP).

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Commands

### POST /api/commands

Create and execute a command.

**Request:**
```http
POST /api/commands
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "content": "Create a Next.js app in ~/projects",
  "input_type": "text"
}
```

**Parameters:**
- `content` (string, required): User's command (1-5000 characters)
- `input_type` (string, optional): "text" or "voice" (default: "text")

**Response (200):**
```json
{
  "command_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "user_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Note:** Response returns immediately. Real-time updates via WebSocket at `WS /ws/commands/{command_id}`.

**Error (400):**
```json
{
  "error": "Command content is required"
}
```

**Error (429):**
```json
{
  "error": "Rate limit exceeded. Max 100 commands per minute (free tier)."
}
```

---

### GET /api/commands

List user's commands with pagination.

**Request:**
```http
GET /api/commands?limit=20&offset=0&status=completed
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Query Parameters:**
- `limit` (integer, optional, default: 20): Results per page
- `offset` (integer, optional, default: 0): Pagination offset
- `status` (string, optional): Filter by status (pending, running, completed, failed)

**Response (200):**
```json
{
  "commands": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "input": "List files in ~/projects",
      "status": "completed",
      "result": {
        "agents_used": ["master", "file"],
        "summary": "Found 3 projects in ~/projects: project-a, project-b, project-c",
        "results": {
          "file": {
            "success": true,
            "files": ["project-a", "project-b", "project-c"]
          }
        }
      },
      "execution_time_ms": 1250,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/commands/:id

Get detailed command information with execution trace.

**Request:**
```http
GET /api/commands/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "input": "Create a React component",
  "status": "completed",
  "result": {
    "agents_used": ["master", "coder"],
    "summary": "Created a basic React button component with TypeScript and Tailwind CSS.",
    "results": {
      "coder": {
        "success": true,
        "code": "...",
        "language": "typescript"
      }
    }
  },
  "execution_time_ms": 3200,
  "trace": {
    "steps": [
      {
        "agent": "master",
        "tool": "intent_parser",
        "input": "Create a React component",
        "output": {
          "intent": "Create React component",
          "agents_needed": ["coder"],
          "parameters": {}
        },
        "duration_ms": 500
      },
      {
        "agent": "coder",
        "tool": "generate_code",
        "input": "Create a React component",
        "output": {
          "code": "...",
          "language": "typescript"
        },
        "duration_ms": 2700
      }
    ]
  },
  "created_at": "2026-01-15T10:30:00Z",
  "completed_at": "2026-01-15T10:30:03Z"
}
```

---

### DELETE /api/commands/:id

Delete (soft-delete) a command.

**Request:**
```http
DELETE /api/commands/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true
}
```

**Error (404):**
```json
{
  "error": "Command not found"
}
```

---

## User Profile

### GET /api/user/profile

Get current user's profile and statistics.

**Request:**
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Rahul Kumar",
  "avatar_url": "https://...",
  "tier": "free",
  "preferences": {
    "language": "en",
    "timezone": "Asia/Kolkata",
    "theme": "dark",
    "voice_enabled": false
  },
  "statistics": {
    "total_commands": 45,
    "successful_commands": 43,
    "failed_commands": 2,
    "commands_this_month": 12,
    "avg_execution_time_ms": 2100
  },
  "quota": {
    "tier": "free",
    "commands_per_month": 100,
    "commands_used_this_month": 12,
    "commands_remaining": 88
  },
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-20T15:45:00Z"
}
```

---

### PATCH /api/user/profile

Update user preferences.

**Request:**
```http
PATCH /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Rahul Kumar Singh",
  "preferences": {
    "language": "hi",
    "timezone": "Asia/Kolkata",
    "theme": "light",
    "voice_enabled": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Rahul Kumar Singh",
    "preferences": {
      "language": "hi",
      "timezone": "Asia/Kolkata",
      "theme": "light",
      "voice_enabled": true
    }
  }
}
```

---

### GET /api/user/preferences

Get user preferences (for faster loading).

**Request:**
```http
GET /api/user/preferences
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "language": "en",
  "timezone": "Asia/Kolkata",
  "theme": "dark",
  "voice_enabled": false
}
```

---

## Files

### GET /api/files/search

Search user's files (full-text or semantic).

**Request:**
```http
GET /api/files/search?query=TODO&limit=10&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Query Parameters:**
- `query` (string, required): Search term
- `limit` (integer, optional, default: 10): Max results
- `offset` (integer, optional, default: 0): Pagination offset
- `type` (string, optional): Filter by file type (code, document, image)

**Response (200):**
```json
{
  "results": [
    {
      "file_path": "/home/user/project/src/main.ts",
      "file_type": "code",
      "match_context": "// TODO: implement error handling",
      "relevance_score": 0.95
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0
}
```

---

### POST /api/files/upload

Upload a file to user's workspace.

**Request:**
```http
POST /api/files/upload
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

file: [binary data]
path: /my-files/document.pdf
```

**Response (200):**
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_path": "/my-files/document.pdf",
  "size_bytes": 5242880,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

### GET /api/files/:id/content

Get file content.

**Request:**
```http
GET /api/files/550e8400-e29b-41d4-a716-446655440000/content
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```
[Binary file content or text]
```

---

### DELETE /api/files/:id

Delete a file.

**Request:**
```http
DELETE /api/files/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Agents

### POST /api/agents/execute (Internal Only)

**Note:** This endpoint is for internal use only and is not exposed to the public API. Called by backend when processing commands.

**Internal Request:**
```http
POST /api/agents/execute
Content-Type: application/json

{
  "agent_type": "file",
  "command": "List files in ~/projects",
  "parameters": {
    "path": "~/projects"
  }
}
```

**Response (200):**
```json
{
  "agent": "file",
  "success": true,
  "result": {
    "files": ["project-a", "project-b", "project-c"]
  },
  "duration_ms": 125
}
```

---

### GET /api/agents/status

Get status of all available agents.

**Request:**
```http
GET /api/agents/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "agents": {
    "master": {
      "status": "ready",
      "model": "gemini-1.5-pro",
      "last_used": "2026-01-15T10:30:00Z"
    },
    "file": {
      "status": "ready",
      "last_used": "2026-01-15T10:29:45Z"
    },
    "terminal": {
      "status": "ready",
      "last_used": "2026-01-15T10:25:00Z"
    },
    "search": {
      "status": "ready",
      "last_used": "2026-01-15T10:20:00Z"
    }
  }
}
```

---

## WebSocket Real-Time

### WS /ws/commands/:id

Subscribe to real-time updates for a command execution.

**Connection:**
```javascript
const ws = new WebSocket('wss://api.signhify-ai.vercel.app/ws/commands/550e8400-e29b-41d4-a716-446655440000');

ws.onopen = () => {
  console.log('Connected to command updates');
};

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Update:', update);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Connection closed');
};
```

**Message Format (from server):**
```json
{
  "status": "running",
  "current_agent": "file",
  "agents_completed": ["master"],
  "agents_remaining": ["coder", "search"],
  "execution_progress": 33
}
```

**Final Message (when complete):**
```json
{
  "status": "completed",
  "result": {
    "agents_used": ["master", "file"],
    "summary": "Found 3 projects...",
    "results": {
      "file": { "success": true, "files": [...] }
    }
  },
  "execution_time_ms": 1250
}
```

**Final Message (if error):**
```json
{
  "status": "failed",
  "error": "File Agent: permission denied",
  "agents_completed": ["master"],
  "agents_failed": ["file"]
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "error_code": "INVALID_INPUT",
  "status_code": 400,
  "timestamp": "2026-01-15T10:30:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
| --- | --- | --- |
| INVALID_INPUT | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., user exists) |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily down |

---

## Rate Limiting

### Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642253400
```

### Tier-based Limits

| Tier | Limit | Window |
| --- | --- | --- |
| Free | 100 requests | 1 minute |
| Supporter | 500 requests | 1 minute |
| Pro | 2000 requests | 1 minute |

### Quota Limits

| Tier | Commands/Month | Storage | Notes |
| --- | --- | --- | --- |
| Free | 100 | 100MB | Reset monthly |
| Supporter | Unlimited | 1GB | Per user |
| Pro | Unlimited | 10GB | Per user |

---

## Examples

### Example 1: Complete OAuth Login Flow

```javascript
// Step 1: Redirect to Google OAuth
function loginWithGoogle() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
  window.location.href = authUrl;
}

// Step 2: Handle OAuth callback
async function handleOAuthCallback() {
  const code = new URLSearchParams(window.location.search).get('code');
  
  const response = await fetch('/api/auth/callback/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  const { token, user } = await response.json();
  localStorage.setItem('auth_token', token);
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

---

### Example 2: Execute Command with Real-Time Updates

```javascript
async function executeCommand(content) {
  // 1. Create command
  const response = await fetch('/api/commands', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify({ content, input_type: 'text' })
  });
  
  const { command_id } = await response.json();
  
  // 2. Subscribe to real-time updates
  const ws = new WebSocket(`wss://api.signhify-ai.vercel.app/ws/commands/${command_id}`);
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    if (update.status === 'running') {
      console.log(`Executing: ${update.current_agent}`);
    } else if (update.status === 'completed') {
      console.log('Result:', update.result);
    } else if (update.status === 'failed') {
      console.error('Error:', update.error);
    }
  };
}
```

---

### Example 3: List Commands with Pagination

```javascript
async function listCommands(limit = 20, offset = 0) {
  const response = await fetch(
    `/api/commands?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    }
  );
  
  const { commands, total } = await response.json();
  console.log(`Showing ${commands.length} of ${total} commands`);
  
  return commands;
}
```

---

## Changelog

### v1.0 (Jan 2026)
- Initial API specification
- Core endpoints: Auth, Commands, User, Files
- WebSocket for real-time updates
- Rate limiting & quota system

---

**Last Updated:** Jan 15, 2026  
**API Status:** ✅ Production Ready
