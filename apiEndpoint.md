# Backend API — Design specification & endpoint reference

**Version:** 1.1  
**Audience:** Frontend (React + TanStack Query), mobile clients, integrators  

This document merges a **consistent API contract** (envelopes, errors, shared schemas) with the **endpoint catalog** extracted from backend services (`auth-service`, `blog-service`, `file-service`, `notification-service`, `version-control-service`).  

`config-service` and `eurak-service` host no application REST controllers in source; Eureka/Config may expose framework endpoints at runtime that are **not** listed here.

---

## Table of contents

| Section | Description |
| --- | --- |
| [§ Conventions](#conventions) | Base URL, auth, headers, versioning |
| [§ Errors](#errors) | Status codes & error payloads |
| [§ Pagination & filtering](#pagination--filtering) | List endpoints query params |
| [§ Shared schemas](#shared-schemas) | Reusable JSON types (auth, articles, …) |
| [§ Frontend integration notes](#frontend-integration-notes) | TanStack Query & keys |
| [§ 1 Auth Service](#1-auth-service) | Authentication & IAM |
| [§ 2 Blog Service](#2-blog-service) | Articles, comments, engagement |
| [§ 3 File Service](#3-file-service) | Uploads & file access |
| [§ 4 Notification Service](#4-notification-service) | Notifications |
| [§ 5 Version Control Service](#5-version-control-service) | Repos, PRs, tasks |
| [§ 6 Config Service](#6-config-service) | — |
| [§ 7 Eurak Service](#7-eurak-service) | — |

---

## Conventions

### Base URL & versioning

- **API base:** `{main-url}/api/v1` for most resources (unless a legacy path omits `/api/v1`, as noted per endpoint).
- **`{main-url}`:** scheme + host + optional port (e.g. `https://api.university.example`).
- **Trailing slashes:** not significant; clients should use **no** trailing slash on collection URLs unless the server defines otherwise.

### Content type

- **JSON** requests/responses: `Content-Type: application/json; charset=utf-8`.
- **Multipart** (uploads): `Content-Type: multipart/form-data` with field names as documented per endpoint.
- **UTF-8** for all text.

### Authentication

- After login/refresh, clients send:  
  `Authorization: Bearer <access_token>`
- **Optional** service-specific headers (if enabled by gateway):  
  `X-Request-Id: <uuid>` (correlation), `X-Client-Id: <string>`.

### Dates & IDs

- **Timestamps:** ISO-8601 in **UTC**, e.g. `2026-05-01T14:30:00Z` (either `Z` or explicit offset).
- **IDs:** opaque strings (`article-id`, `user-id`); do not assume numeric-only.

### Success semantics

- **200 OK** — successful GET/PATCH/PUT with body.
- **201 Created** — successful POST that creates a resource; **`Location`** header may point to the new resource.
- **204 No Content** — successful DELETE or action with no body.

---

## Errors

### HTTP status usage (recommended contract)

| Status | When |
| --- | --- |
| `400` | Malformed JSON, invalid query, business validation failure |
| `401` | Missing or invalid token |
| `403` | Authenticated but not allowed |
| `404` | Resource or route not found |
| `409` | Conflict (duplicate slug, version mismatch, state conflict) |
| `422` | Semantic validation (field-level); see `errors` array below |
| `429` | Rate limited |
| `500` | Unexpected server error |

### Error response body (canonical)

All error responses SHOULD use a single shape so clients can parse consistently (align with **RFC 7807 Problem Details** where possible):

```json
{
  "type": "https://api.example/problems/validation-error",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/articles",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "title",
      "message": "must not be blank",
      "rejectedValue": ""
    }
  ],
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Fields:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | string (URI) | optional | Problem type URI |
| `title` | string | recommended | Short human-readable summary |
| `status` | integer | recommended | HTTP status |
| `detail` | string | optional | Longer explanation |
| `instance` | string | optional | Path that failed |
| `code` | string | optional | Stable machine code (`UNAUTHORIZED`, `ARTICLE_NOT_FOUND`, …) |
| `errors` | array | optional | Field-level issues |
| `traceId` | string | optional | Correlation id for support |

**Legacy / simple errors** (still allowed for older endpoints):

```json
{
  "message": "Password changed successfully",
  "status": "success"
}
```

Clients should treat **HTTP status** as the source of truth; treat `status: "success"` in body only when HTTP is 2xx.

### Success message wrapper (optional)

Some endpoints return `{ "message": "...", "status": "success" }` with **200**; that is **not** an error.

---

## Pagination & filtering

### Standard query parameters (list endpoints)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer ≥ 0 | `0` | Zero-based page index |
| `pageSize` | integer | `20` | Items per page (server may cap, e.g. max 100) |
| `sort` | string | service-specific | e.g. `publishedAt,desc` |
| `q` | string | — | Free-text search (when supported) |

### Response envelope: `PaginatedResponse<T>`

```json
{
  "data": [],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false,
    "nextCursor": null,
    "previousCursor": null
  }
}
```

| Field | Type | Description |
| --- | --- | --- |
| `data` | `T[]` | Page of items |
| `pagination.page` | number | Current page |
| `pagination.pageSize` | number | Page size |
| `pagination.totalCount` | number | Total items (if known) |
| `pagination.totalPages` | number | Total pages |
| `pagination.hasNext` | boolean | More pages after |
| `pagination.hasPrevious` | boolean | Pages before |
| `pagination.nextCursor` | string \| null | Cursor if cursor-based |
| `pagination.previousCursor` | string \| null | Previous cursor |

---

## Shared schemas

### `UserPublic` (embedded author on articles, comments)

```json
{
  "id": "user-id",
  "userName": "john.doe",
  "displayName": "John Doe",
  "email": "john.doe@example.com",
  "profileImageUrl": "https://cdn.example/avatars/john.png",
  "userType": "TEACHER",
  "entityId": "teacher-1"
}
```

*Field names may be `camelCase` or `snake_case` depending on service serialization; frontend should normalize in one mapper layer.*

### `AuthResponse` (login, signup, refresh, Google)

Returned on successful authentication:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-id",
    "user_name": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "status": "ACTIVE",
    "profile": "profile-url",
    "entity_id": "teacher-1",
    "user_type": "TEACHER",
    "roles": ["FACULTY_USER"]
  },
  "message": "Login successful"
}
```

### `ArticleBlockRequest` / block `data`

**Block:**

```json
{
  "type": "TEXT",
  "order": 0,
  "data": { "text": "Paragraph text." }
}
```

**Allowed `type`:** `TEXT` | `HEADING` | `IMAGE` | `VIDEO` | `CODE` | `QUOTE` | `EMBED` | `DIVIDER`

**`data` by type:**

| `type` | Required `data` fields |
| --- | --- |
| `TEXT` | `text` |
| `HEADING` | `text`, `level` (integer, e.g. 1–6) |
| `IMAGE` | `fileId` and/or `url`, `alt` |
| `VIDEO` | `fileId` and/or `url` |
| `CODE` | `code`, `language` |
| `QUOTE` | `text` |
| `EMBED` | `provider`, `url` |
| `DIVIDER` | (none) |

### `CreateArticleRequest`

```json
{
  "title": "How to use microservices in university systems",
  "description": "A practical article about Spring Boot microservices.",
  "subtitle": "Optional kicker under the title",
  "blocks": [
    {
      "type": "TEXT",
      "order": 0,
      "data": { "text": "Article content" }
    }
  ],
  "tags": ["spring", "microservices"],
  "keywords": ["spring", "api"],
  "visibility": "PUBLIC",
  "contentType": "WEBLOG",
  "coverImageFileId": "file-id",
  "coverImageUrl": "https://cdn.example.com/cover.jpg"
}
```

**`visibility` (enum):** `PUBLIC` | `UNLISTED` | `MEMBERS_ONLY` | (server-specific literals; align with PATCH publish body.)

**`contentType` (enum, recommended for Campus Medium UX):**

| Value | Meaning |
| --- | --- |
| `MONOGRAPH` | Long-form / formal published work |
| `WEBLOG` | Blog post / short article |

If omitted, servers may default to `WEBLOG`.

### `UpdateArticleRequest`

Same fields as create where applicable (partial updates MAY be supported per endpoint contract; if not documented, send full payload).

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "subtitle": "Updated subtitle",
  "blocks": [],
  "tags": ["tag1"],
  "keywords": [],
  "visibility": "PUBLIC",
  "contentType": "MONOGRAPH",
  "coverImageFileId": "file-id",
  "coverImageUrl": "https://cdn.example.com/cover.jpg"
}
```

### `ArticleStats`

```json
{
  "likes": 42,
  "comments": 7,
  "shares": 3,
  "views": 1200
}
```

Exact keys may vary (`totalLikes` vs `likes`); frontend should coerce in a single adapter.

### `ArticlePreviewResponse` (lists, cards)

```json
{
  "id": "article-id",
  "slug": "my-first-blog-post",
  "title": "My First Blog Post",
  "subtitle": "An exciting journey",
  "description": "Short description or excerpt",
  "coverImageUrl": "https://cdn.example.com/cover.jpg",
  "visibility": "PUBLIC",
  "contentType": "WEBLOG",
  "status": "PUBLISHED",
  "stats": {
    "likes": 15,
    "comments": 2,
    "shares": 1,
    "views": 340
  },
  "author": {
    "id": "user-id",
    "userName": "john.doe",
    "displayName": "John Doe",
    "profileImageUrl": "https://cdn.example/avatars/john.png"
  },
  "publishedAt": "2026-04-29T10:00:00Z",
  "createdAt": "2026-04-28T09:00:00Z",
  "updatedAt": "2026-04-29T10:00:00Z",
  "estimatedReadTimeMinutes": 5
}
```

**`status` (enum typical):** `DRAFT` | `PUBLISHED` | `ARCHIVED` | …

### `ArticleResponse` (detail)

```json
{
  "id": "article-id",
  "slug": "my-first-blog-post",
  "title": "My First Blog Post",
  "subtitle": "An exciting journey into blogging",
  "description": "Short teaser",
  "content": {},
  "blocks": [],
  "metadata": {
    "wordCount": 1200,
    "readingTimeMinutes": 6
  },
  "tags": ["spring"],
  "keywords": ["api"],
  "visibility": "PUBLIC",
  "contentType": "WEBLOG",
  "status": "DRAFT",
  "coverImageUrl": "https://cdn.example.com/cover.jpg",
  "coverImageFileId": "file-id",
  "stats": {},
  "author": {},
  "publishedAt": "2026-04-29T10:00:00Z",
  "createdAt": "2026-04-29T08:00:00Z",
  "updatedAt": "2026-04-29T10:05:00Z"
}
```

- **`content`:** may be structured JSON, HTML string, or block array depending on backend; **`blocks`** is the canonical source when present for rich rendering.
- **Rendering:** map `blocks` → React tree or HTML pipeline on the client.

### `CommentResponse`

```json
{
  "id": "comment-id",
  "articleId": "article-id",
  "parentCommentId": null,
  "body": "Great article!",
  "author": {},
  "engagement": {
    "likes": 0
  },
  "createdAt": "2026-04-29T10:00:00Z",
  "editedAt": null
}
```

### `CommentThreadResponse`

```json
{
  "comment": {},
  "replies": []
}
```

### `LikeResponse` / `ShareResponse` (illustrative)

```json
{
  "articleId": "article-id",
  "userId": "user-id",
  "liked": true,
  "totalLikes": 15
}
```

```json
{
  "articleId": "article-id",
  "userId": "user-id",
  "platform": "LINKEDIN",
  "totalShares": 4
}
```

**`platform` (enum example):** `LINKEDIN` | `TWITTER` | `COPY_LINK` | …

---

## Frontend integration notes

### TanStack Query — suggested `queryKey` roots

| Domain | Example keys |
| --- | --- |
| Session | `['auth', 'me']` |
| Articles list | `['articles', 'list', { page, pageSize, contentType, q }]` |
| Article detail | `['articles', 'detail', articleId]` |
| By author | `['articles', 'author', authorId, { page, pageSize }]` |
| Comments | `['articles', articleId, 'comments', { page, pageSize }]` |

### Mutations

- On successful **create/update/publish article**, invalidate:  
  `queryKey: ['articles']` (or narrower `['articles', 'list']` / `['articles', 'detail', id]`).
- **Optimistic UI** optional for likes; use **`onError` rollback** pattern.

### `multipart` create

`POST .../articles/with-files/author/{author}` expects **`blocks`** as a **JSON string** in form data; stringify on the client before append.

---

## 1. Auth Service

Base paths:

- `{main-url}/api/v1/auth`
- `{main-url}/api/v1/users`
- `{main-url}/api/v1/roles`
- `{main-url}/api/v1/permissions`

### 1.1 Authentication Endpoints

#### POST `{main-url}/api/v1/auth/login`

Description: Login with username or email and password.

Request body:

```json
{
  "username_or_email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "remember_me": false
}
```

Response body:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-id",
    "user_name": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "status": "ACTIVE",
    "profile": "profile-url",
    "entity_id": "teacher-1",
    "user_type": "TEACHER",
    "roles": ["FACULTY_USER"]
  },
  "message": "Login successful"
}
```

#### POST `{main-url}/api/v1/auth/signup`

Description: Create a new user account.

Request body:

```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "terms_agreed": true,
  "privacy_agreed": true
}
```

Response body: same `AuthResponse` structure as login.

#### POST `{main-url}/api/v1/auth/google`

Description: Sign in with Google OAuth2 token.

Request body:

```json
{
  "id_token": "google-id-token",
  "access_token": "google-access-token",
  "device_id": "device-123"
}
```

Response body: same `AuthResponse` structure as login.

#### POST `{main-url}/api/v1/auth/refresh-token`

Description: Refresh access token.

Request body:

```json
{
  "refresh_token": "refresh-token"
}
```

Response body: same `AuthResponse` structure as login.

#### POST `{main-url}/api/v1/auth/change-password/{userId}`

Path params:

- `userId`: target user id

Request body:

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

Response body:

```json
{
  "message": "Password changed successfully",
  "status": "success"
}
```

#### POST `{main-url}/api/v1/auth/forgot-password`

Request body:

```json
{
  "email": "john.doe@example.com"
}
```

Response body:

```json
{
  "message": "Password reset email sent. Check your email for instructions",
  "status": "success"
}
```

#### POST `{main-url}/api/v1/auth/reset-password`

Request body:

```json
{
  "reset_token": "reset-token",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

Response body:

```json
{
  "message": "Password reset successfully",
  "status": "success"
}
```

#### POST `{main-url}/api/v1/auth/verify-email`

Request body:

```json
{
  "verification_token": "verification-token"
}
```

Response body:

```json
{
  "message": "Email verified successfully",
  "status": "success"
}
```

#### POST `{main-url}/api/v1/auth/resend-verification-email`

Request body:

```json
{
  "email": "john.doe@example.com"
}
```

Response body:

```json
{
  "message": "Verification email sent. Check your email",
  "status": "success"
}
```

#### POST `{main-url}/api/v1/auth/logout`

Request body: none

Response body:

```json
{
  "message": "Logout successful. Please clear the token on client side",
  "status": "success"
}
```

#### GET `{main-url}/api/v1/auth/me`

Description: Returns the currently authenticated user from JWT claims.

Response body:

```json
{
  "authenticated": true,
  "sub": "user-id",
  "username": "john.doe",
  "email": "john.doe@example.com",
  "emailVerified": true,
  "realmRoles": ["FACULTY_USER"],
  "resourceAccess": {},
  "status": "authenticated"
}
```

### 1.2 User Endpoints

#### POST `{main-url}/api/v1/users`

Request body:

```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "role_names": ["FACULTY_USER"],
  "user_type": "TEACHER",
  "entity_id": "teacher-1",
  "profile": "profile-url",
  "password": "SecurePass123!"
}
```

Response body: `UserDTO`

```json
{
  "id": "user-id",
  "user_name": "john.doe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "status": "ACTIVE",
  "profile": "profile-url",
  "entity_id": "teacher-1",
  "user_type": "TEACHER",
  "roles": ["FACULTY_USER"]
}
```

#### GET `{main-url}/api/v1/users/author/{id}`

Response body:

```json
{
  "id": "user-id",
  "userName": "john.doe",
  "email": "john.doe@example.com",
  "profile": "profile-url",
  "entityId": "teacher-1",
  "userType": "TEACHER"
}
```

#### GET `{main-url}/api/v1/users/{id}`

Path params:

- `id`: user id

Response body: `UserDTO`

#### GET `{main-url}/api/v1/users/contributor/{id}`

Response body:

```json
{
  "id": "user-id",
  "user_name": "john.doe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "status": "ACTIVE",
  "roles": ["FACULTY_USER"],
  "profile": "profile-url"
}
```

#### GET `{main-url}/api/v1/users/by-username/{username}`

Response body: `UserDTO`

#### GET `{main-url}/api/v1/users/by-email/{email}`

Response body: `UserDTO`

#### PUT `{main-url}/api/v1/users/{id}`

Request body:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "status": "ACTIVE",
  "emailVerified": true,
  "twoFactorEnabled": false,
  "roles": ["FACULTY_USER"],
  "email": "john.doe@example.com",
  "enabled": true,
  "profile": "profile-url",
  "entity_id": "teacher-1",
  "user_type": "TEACHER"
}
```

Response body: `UserDTO`

#### DELETE `{main-url}/api/v1/users/{id}`

Response: `204 No Content`

#### GET `{main-url}/api/v1/users/search?search=value`

Query params:

- `search`: optional search string

Response body: array of `UserDTO`

#### GET `{main-url}/api/v1/users`

Description: Returns all active users.

Response body: array of `UserDTO`

#### POST `{main-url}/api/v1/users/{id}/suspend`

Response: `204 No Content`

#### POST `{main-url}/api/v1/users/{id}/activate`

Response: `204 No Content`

#### POST `{main-url}/api/v1/users/{id}/lock?durationMinutes=30`

Query params:

- `durationMinutes`: optional, default `30`

Response: `204 No Content`

#### POST `{main-url}/api/v1/users/{id}/verify-email`

Response: `204 No Content`

#### GET `{main-url}/api/v1/users/{id}/{roleName}`

Description: Returns a user only if user matches the requested role.

Response body: `UserDTO`

#### POST `{main-url}/api/v1/users/stats/count`

Request body: none

Response body:

```json
{
  "total": 100,
  "active": 90,
  "suspended": 5,
  "inactive": 5
}
```

The exact keys depend on `userService.getUserStatistics()`.

### 1.3 Role Endpoints

#### POST `{main-url}/api/v1/roles`

Request body:

```json
{
  "name": "ADMIN",
  "description": "Administrator with full access"
}
```

Response body:

```json
{
  "id": "role-id",
  "name": "ADMIN",
  "description": "Administrator with full access",
  "roleKey": "ADMIN",
  "isSystemRole": false,
  "isActive": true,
  "permissionIds": [],
  "createdAt": "2026-04-29T10:00:00",
  "updatedAt": "2026-04-29T10:00:00",
  "permissions": []
}
```

#### GET `{main-url}/api/v1/roles`

Response body:

```json
{
  "total": 2,
  "roles": [
    {
      "id": "role-id",
      "name": "ADMIN",
      "description": "Administrator with full access"
    }
  ]
}
```

#### PUT `{main-url}/api/v1/roles/{roleName}`

Request body:

```json
{
  "name": "ADMIN",
  "description": "Updated role description"
}
```

Response body: `RoleDTO`

#### DELETE `{main-url}/api/v1/roles/{roleName}`

Response: `204 No Content`

#### POST `{main-url}/api/v1/roles/{roleName}/assign-to-user/{userId}`

Response body:

```json
{
  "message": "Role assigned successfully",
  "status": "success"
}
```

#### DELETE `{main-url}/api/v1/roles/{roleName}/remove-from-user/{userId}`

Response body:

```json
{
  "message": "Role removed successfully",
  "status": "success"
}
```

#### GET `{main-url}/api/v1/roles/stats/count`

Response body: object returned by `roleService.getRoleStatistics()`.

### 1.4 Permission Endpoints

#### POST `{main-url}/api/v1/permissions`

Request body:

```json
{
  "name": "USER_READ",
  "description": "Permission to read user information",
  "client_id": "file-service",
  "resource": "USER",
  "action": "READ",
  "is_system_permission": false
}
```

Response body:

```json
{
  "id": "permission-id",
  "name": "USER_READ",
  "description": "Permission to read user information",
  "clientId": "file-service",
  "resource": "USER",
  "action": "READ"
}
```

#### GET `{main-url}/api/v1/permissions/client/{clientId}`

Response body:

```json
{
  "clientId": "file-service",
  "total": 3,
  "permissions": [
    {
      "id": "permission-id",
      "name": "USER_READ",
      "description": "Permission to read user information"
    }
  ]
}
```

#### POST `{main-url}/api/v1/permissions/client/{clientId}/role/{roleName}/assign-to-user/{userId}`

Response body:

```json
{
  "message": "Permission assigned successfully",
  "status": "success"
}
```

#### DELETE `{main-url}/api/v1/permissions/client/{clientId}/role/{roleName}/remove-from-user/{userId}`

Response body:

```json
{
  "message": "Permission removed successfully",
  "status": "success"
}
```

#### DELETE `{main-url}/api/v1/permissions/client/{clientId}/role/{roleName}`

Response: `204 No Content`

#### GET `{main-url}/api/v1/permissions/client/{clientId}/stats/count`

Response body: object returned by `permissionService.getPermissionStatistics(clientId)`.

---

## 2. Blog Service

Base paths:

- `{main-url}/api/v1/articles`
- `{main-url}/api/v1/files`

### Shared Blog Shapes

#### `ArticleBlockRequest`

```json
{
  "type": "TEXT",
  "order": 0,
  "data": {
    "text": "Paragraph text"
  }
}
```

Allowed `type` values:

- `TEXT`
- `HEADING`
- `IMAGE`
- `VIDEO`
- `CODE`
- `QUOTE`
- `EMBED`
- `DIVIDER`

Important `data` rules from validator:

- `TEXT`: `text`
- `HEADING`: `text`, `level`
- `IMAGE`: `fileId`, `url`, `alt`
- `VIDEO`: `fileId`, `url`
- `CODE`: `code`, `language`
- `QUOTE`: `text`
- `EMBED`: `provider`, `url`
- `DIVIDER`: no required fields

#### `CreateArticleRequest`

```json
{
  "title": "How to use microservices in university systems",
  "description": "A practical article about Spring Boot microservices.",
  "blocks": [
    {
      "type": "TEXT",
      "order": 0,
      "data": {
        "text": "Article content"
      }
    }
  ],
  "tags": ["spring", "microservices"],
  "visibility": "PUBLIC",
  "coverImageFileId": "file-id",
  "coverImageUrl": "https://cdn.example.com/cover.jpg",
  "keywords": ["spring", "api"]
}
```

#### `PaginatedResponse<T>`

```json
{
  "data": [],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false,
    "nextCursor": null,
    "previousCursor": null
  }
}
```

### 2.1 Article Endpoints

#### POST `{main-url}/api/v1/articles/with-files/author/{author}`

Content type: `multipart/form-data`

Path params:

- `author`: author user id

Form fields:

- `title`: string
- `description`: optional string
- `blocks`: JSON string representing `ArticleBlockRequest[]`
- `coverImage`: optional file
- `inlineFiles`: optional repeated files
- `tags`: string value passed to service

Response body: `ArticleResponse`

Main response shape:

```json
{
  "id": "article-id",
  "slug": "my-first-blog-post",
  "title": "My First Blog Post",
  "subtitle": "An exciting journey into blogging",
  "content": {},
  "metadata": {},
  "status": "DRAFT",
  "visibility": "PUBLIC",
  "author": {},
  "stats": {},
  "publishedAt": "2026-04-29T10:00:00",
  "createdAt": "2026-04-29T10:00:00",
  "updatedAt": "2026-04-29T10:00:00"
}
```

#### POST `{main-url}/api/v1/articles/{userId}`

Request body: `CreateArticleRequest`

Response body: `ArticleResponse`

#### POST `{main-url}/api/v1/articles/drafts/users/{userId}`

Request body: `CreateArticleRequest`

Response body: `ArticleResponse`

#### GET `{main-url}/api/v1/articles?page=0&pageSize=20`

Response body: `PaginatedResponse<ArticlePreviewResponse>`

`ArticlePreviewResponse` includes:

```json
{
  "id": "article-id",
  "slug": "my-first-blog-post",
  "title": "My First Blog Post",
  "subtitle": "An exciting journey",
  "coverImageUrl": "https://cdn.example.com/cover.jpg",
  "description": "Short description",
  "stats": {},
  "author": {},
  "publishedAt": "2026-04-29T10:00:00",
  "estimatedReadTime": 5
}
```

#### GET `{main-url}/api/v1/articles/{articleId}`

Response body: `ArticleResponse`

#### PUT `{main-url}/api/v1/articles/with-file/{articleId}/author/{authorId}`

Content type: `multipart/form-data`

Form fields:

- `article`: JSON string of `UpdateArticleRequest`

`UpdateArticleRequest` shape:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "blocks": [],
  "tags": ["tag1"],
  "visibility": "PUBLIC",
  "coverImageFileId": "file-id",
  "coverImageUrl": "https://cdn.example.com/cover.jpg"
}
```

Response body: `ArticleResponse`

#### PUT `{main-url}/api/v1/articles/{articleId}/author/{authorId}`

Request body: `UpdateArticleRequest`

Response body: `ArticleResponse`

#### PATCH `{main-url}/api/v1/articles/publish/{articleId}/author/{authorId}`

Request body:

```json
{
  "visibility": "PUBLIC"
}
```

Response body: `ArticleResponse`

#### DELETE `{main-url}/api/v1/articles/{articleId}/author/{authorId}`

Response: `204 No Content`

#### GET `{main-url}/api/v1/articles/authors/{authorId}?page=0&pageSize=20`

Response body: `PaginatedResponse<ArticlePreviewResponse>`

#### GET `{main-url}/api/v1/articles/authors/{authorId}/published?page=0&pageSize=20`

Response body: `PaginatedResponse<ArticlePreviewResponse>`

#### GET `{main-url}/api/v1/articles/authors/{authorId}/articles/{articleId}`

Response body: `ArticleResponse`

### 2.2 Comment and Engagement Endpoints

#### POST `{main-url}/api/v1/articles/{articleId}/comments`

Request body:

```json
{
  "body": "Great article! Very informative."
}
```

Response body:

```json
{
  "id": "comment-id",
  "articleId": "article-id",
  "parentCommentId": null,
  "body": "Great article!",
  "author": {},
  "engagement": {},
  "createdAt": "2026-04-29T10:00:00",
  "editedAt": null
}
```

#### GET `{main-url}/api/v1/articles/{articleId}/comments?page=0&pageSize=10`

Response body: `PaginatedResponse<CommentThreadResponse>`

`CommentThreadResponse` shape:

```json
{
  "comment": {},
  "replies": []
}
```

#### POST `{main-url}/api/v1/articles/{articleId}/comments/{parentCommentId}/replies`

Request body:

```json
{
  "body": "Reply text"
}
```

Response body: `CommentResponse`

#### DELETE `{main-url}/api/v1/articles/comments/{commentId}`

Response: `204 No Content`

#### POST `{main-url}/api/v1/articles/{articleId}/likes`

Request body: none

Response body:

```json
{
  "articleId": "article-id",
  "userId": "user-id",
  "liked": true,
  "totalLikes": 15
}
```

The exact keys depend on `LikeResponse`.

#### DELETE `{main-url}/api/v1/articles/{articleId}/likes`

Response: `204 No Content`

#### POST `{main-url}/api/v1/articles/{articleId}/shares`

Request body:

```json
{
  "platform": "LINKEDIN"
}
```

Response body:

```json
{
  "articleId": "article-id",
  "userId": "user-id",
  "platform": "LINKEDIN",
  "totalShares": 4
}
```

The exact keys depend on `ShareResponse`.

### 2.3 Blog File Upload Endpoints

#### POST `{main-url}/api/v1/files/upload/image/{userId}/article/{articleId}`

Content type: `multipart/form-data`

Form fields:

- `file`: image file

Response body:

```json
{
  "fileId": "file-id",
  "originalFilename": "cover.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "cdnUrl": "https://cdn.example.com/files/file_12345.jpg",
  "fileType": "image",
  "uploadedAt": "2026-04-29T10:00:00",
  "imageWidth": 1200,
  "imageHeight": 630,
  "thumbnailUrl": "https://cdn.example.com/files/thumb_12345.jpg",
  "videoDurationSeconds": null,
  "processingStatus": "COMPLETED"
}
```

#### POST `{main-url}/api/v1/files/upload/video/{userId}/article/{articleId}`

Content type: `multipart/form-data`

Form fields:

- `file`: video file

Response body: same `FileUploadResponse` shape, usually with `fileType = "video"` and `videoDurationSeconds`.

#### DELETE `{main-url}/api/v1/files/{fileId}/author/{articleId}`

Response: `204 No Content`

---

## 3. File Service

Base path:

- `{main-url}/file`

### 3.1 University Files

#### POST `{main-url}/file/university/logo/{id}`

Content type: `multipart/form-data`

Form fields:

- `file`: file upload

Response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/university/logo/{id}`

Response body:

```json
"https://presigned-url"
```

#### DELETE `{main-url}/file/university/logo/{id}`

Response: `204 No Content`

#### GET `{main-url}/file/university/logo/{id}/download`

Response body: raw file bytes with `Content-Disposition` attachment header.

### 3.2 Faculty Files

#### POST `{main-url}/file/faculty/logo/{id}`

Request: multipart form field `file`

Response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/faculty/logo/{id}`

Response body:

```json
"https://presigned-url"
```

### 3.3 Department Files

#### POST `{main-url}/file/department/logo/{id}`

Request: multipart form field `file`

Response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/department/logo/{id}`

Response body:

```json
"https://presigned-url"
```

### 3.4 Student Files

#### POST `{main-url}/file/student/profile/{id}`

Request: multipart form field `file`

Response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/student/profile/{id}`

Response body:

```json
"https://presigned-url"
```

### 3.5 Teacher Files

#### POST `{main-url}/file/teacher/profile/{id}`

Request: multipart form field `file`

Response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/teacher/profile/{id}`

Response body:

```json
"https://presigned-url"
```

### 3.6 Employee Files

#### POST `{main-url}/file/employee/profile`

Observed source code note: method expects a path variable `id`, but the route does not define `{id}`. The implementation currently looks inconsistent.

Request: multipart form field `file`

Expected/intended response body:

```json
"https://presigned-url"
```

#### GET `{main-url}/file/employee/profile/{id}`

Response body:

```json
"https://presigned-url"
```

### 3.7 Blog Files

#### POST `{main-url}/file/blog/upload`

Content type: `multipart/form-data`

Form fields:

- `file`: uploaded file
- `ownerId`: blog owner user id
- `article`: article id or subfolder

Response body:

```json
{
  "fileId": "file-id",
  "originalFilename": "cover.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "cdnUrl": "https://presigned-url",
  "fileType": "image",
  "uploadedAt": "2026-04-29T10:00:00",
  "imageWidth": null,
  "imageHeight": null,
  "thumbnailUrl": null,
  "videoDurationSeconds": null,
  "processingStatus": null
}
```

#### GET `{main-url}/file/blog/{fileId}/owner/{ownerId}`

Response body:

```json
{
  "fileId": "file-id",
  "originalFilename": "cover.jpg",
  "fileSize": null,
  "mimeType": null,
  "cdnUrl": "https://presigned-url",
  "thumbnailUrl": null,
  "uploadedAt": null,
  "imageWidth": null,
  "imageHeight": null,
  "videoDurationSeconds": null
}
```

#### GET `{main-url}/file/blog/{articleId}/user/{userId}`

Response body:

```json
[
  "https://presigned-url-1",
  "https://presigned-url-2"
]
```

---

## 4. Notification Service

Base path:

- `{main-url}/api/v1/notifications`

Common response envelope:

```json
{
  "success": true,
  "message": "optional human message",
  "data": {},
  "error": null,
  "timestamp": "2026-04-29T10:00:00"
}
```

`NotificationResponse` shape:

```json
{
  "id": "uuid",
  "recipientUserId": "usr_abc123",
  "recipientEmail": "john@example.com",
  "recipientName": "John Doe",
  "type": "USER_REGISTERED",
  "channel": "EMAIL",
  "status": "SENT",
  "subject": "Welcome",
  "body": "Email body",
  "referenceId": "post_xyz",
  "referenceType": "BLOG_POST",
  "retryCount": 0,
  "maxRetries": 3,
  "failureReason": null,
  "sentAt": "2026-04-29T10:00:00",
  "createdAt": "2026-04-29T10:00:00",
  "updatedAt": "2026-04-29T10:00:00"
}
```

### 4.1 Notification Operations

#### POST `{main-url}/api/v1/notifications`

Request body:

```json
{
  "recipientUserId": "usr_abc123",
  "recipientEmail": "john@example.com",
  "recipientName": "John Doe",
  "type": "USER_REGISTERED",
  "channel": "EMAIL",
  "subject": "Welcome to our platform!",
  "body": "HTML or text body",
  "referenceId": "post_xyz",
  "referenceType": "BLOG_POST",
  "idempotencyKey": "dedupe-key-1"
}
```

Response body:

```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "id": "uuid"
  },
  "timestamp": "2026-04-29T10:00:00"
}
```

#### POST `{main-url}/api/v1/notifications/{id}/resend`

Request body:

```json
{
  "notificationId": "uuid",
  "overrideEmail": "new@example.com"
}
```

Note: controller sets `notificationId` from path variable.

Response body: `ApiResponse<NotificationResponse>`

#### GET `{main-url}/api/v1/notifications/{id}`

Response body: `ApiResponse<NotificationResponse>`

#### GET `{main-url}/api/v1/notifications/user/{userId}?page=0&size=20`

Response body:

```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false,
    "first": true
  }
}
```

#### GET `{main-url}/api/v1/notifications/user/{userId}/type/{type}?page=0&size=20`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### GET `{main-url}/api/v1/notifications/user/{userId}/status/{status}?page=0&size=20`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### GET `{main-url}/api/v1/notifications/user/{userId}/unread-count`

Response body:

```json
{
  "success": true,
  "message": "Unread count: 5",
  "data": 5,
  "timestamp": "2026-04-29T10:00:00"
}
```

### 4.2 Admin and Query Endpoints

#### GET `{main-url}/api/v1/notifications?page=0&size=20`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### GET `{main-url}/api/v1/notifications/status/{status}?page=0&size=20`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### GET `{main-url}/api/v1/notifications/type/{type}?page=0&size=20`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### GET `{main-url}/api/v1/notifications/reference?referenceId=...&referenceType=...&page=0&size=20`

Query params:

- `referenceId`
- `referenceType`
- `page`
- `size`

Response body: `ApiResponse<PagedResponse<NotificationResponse>>`

#### POST `{main-url}/api/v1/notifications/admin/retry-failed`

Response body:

```json
{
  "success": true,
  "data": "Retry job triggered",
  "timestamp": "2026-04-29T10:00:00"
}
```

#### DELETE `{main-url}/api/v1/notifications/admin/cleanup?daysOld=30`

Response body:

```json
{
  "success": true,
  "data": "Cleanup completed",
  "timestamp": "2026-04-29T10:00:00"
}
```

#### GET `{main-url}/api/v1/notifications/admin/stats?from=...&to=...`

Response body:

```json
{
  "success": true,
  "data": {
    "total": 100,
    "byStatus": {
      "SENT": 90,
      "FAILED": 10
    },
    "byType": {
      "USER_REGISTERED": 30
    },
    "successRate": 90.0,
    "averageRetries": 0.4
  },
  "timestamp": "2026-04-29T10:00:00"
}
```

---

## 5. Version Control Service

Base paths:

- `{main-url}/auth`
- `{main-url}/api/v1/repos`
- `{main-url}/api/v1/milestone`
- `{main-url}/api/v1/task`
- `{main-url}/repos/{owner}/{repo}`

### 5.1 Version Control Auth

#### POST `{main-url}/auth/register`

Request body:

```json
{
  "username": "john.doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "terms_agreed": true,
  "privacy_agreed": true
}
```

Response body:

```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {},
  "message": "success"
}
```

#### POST `{main-url}/auth/login`

Request body:

```json
{
  "username_or_email": "john.doe@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

Response body: same `AuthResponse` structure as register.

#### POST `{main-url}/auth/refresh`

Request body:

```json
{
  "refresh_token": "refresh-token"
}
```

Response body: same `AuthResponse` structure as register.

### 5.2 Repository Endpoints

#### POST `{main-url}/api/v1/repos`

Request body:

```json
{
  "user_name": "john.doe",
  "repository_name": "final-project",
  "description": "Repository description",
  "repository_visibility": "PUBLIC"
}
```

Response body:

```json
{
  "id": "repo-id",
  "owner": {},
  "repositoryName": "final-project",
  "description": "Repository description",
  "visibility": "PUBLIC",
  "collaborators": [],
  "branchHeads": {
    "main": "commit-sha"
  },
  "cloneUrl": "{main-url}/...",
  "createdAt": "2026-04-29T10:00:00",
  "updatedAt": "2026-04-29T10:00:00"
}
```

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/info/refs`

Response body:

```json
{
  "heads": {},
  "tags": {}
}
```

The exact map structure depends on `repositoryService.listRefs(meta)`.

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/objects/{hash}`

Response body: raw object bytes, `application/octet-stream`.

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/objects/{hash}`

Content type: `application/octet-stream`

Request body: raw git-like object bytes

Response body:

```json
{
  "status": "stored"
}
```

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/refs/heads/{branch}`

Request body:

```json
{
  "hash": "new-commit-sha"
}
```

Response body:

```json
{
  "status": "updated",
  "hash": "branch-name"
}
```

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/invitations/{guest}`

Response body:

```json
{
  "id": "invitation-id",
  "repo_owner": "owner",
  "repo_name": "repo",
  "invited_user": "guest",
  "role": "CONTRIBUTOR",
  "status": "PENDING",
  "created_at": "2026-04-29T10:00:00"
}
```

#### GET `{main-url}/api/v1/repos/invitations/{user}`

Response body: array of `InvitationResponse`

#### POST `{main-url}/api/v1/repos/invitations/{invitationId}/accept/{userId}`

Response body: `InvitationResponse`

#### POST `{main-url}/api/v1/repos/guest/{guestId}/owner/{ownerId}/repository/{repoName}`

Description: Remove or block contributor from repository.

Response body:

```json
{
  "id": "repo-id",
  "owner": "ownerId",
  "repositoryName": "repoName",
  "description": "Repository description",
  "visibility": "PUBLIC",
  "collaborators": [],
  "cloneUrl": "{main-url}/..."
}
```

#### POST `{main-url}/api/v1/repos/invitations/{invitationId}/reject/{userId}`

Response body: `InvitationResponse`

### 5.3 Pull Request Endpoints

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/pulls`

Request body:

```json
{
  "title": "Add new feature",
  "description": "This PR adds a new feature",
  "sourceBranch": "feature-branch",
  "targetBranch": "main",
  "author": "john.doe"
}
```

Response body:

```json
{
  "id": "pr-id",
  "repo_owner": {},
  "repo_name": "repo",
  "author": {},
  "source_branch": "feature-branch",
  "source_hash": "sha",
  "target_branch": "main",
  "target_hash": "sha",
  "title": "Add new feature",
  "description": "This PR adds a new feature",
  "status": "OPEN",
  "created_at": "2026-04-29T10:00:00",
  "merged_at": null
}
```

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/pulls`

Response body: array of `PullRequestResponse`

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/pulls/{id}`

Response body: `PullRequestResponse`

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/pulls/{id}/merge`

Response body:

```json
{
  "pullRequestId": "pr-id",
  "status": "MERGED",
  "sourceBranch": "feature-branch",
  "targetBranch": "main",
  "newHead": "new-commit-sha",
  "mergedAt": "2026-04-29T10:00:00",
  "message": "Merge completed"
}
```

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/pulls/{id}/conflicts`

Response body:

```json
{
  "pullRequestId": "pr-id",
  "status": "CONFLICT",
  "conflicts": [
    {
      "path": "src/App.java",
      "baseContent": "base",
      "sourceContent": "source",
      "targetContent": "target",
      "binary": false
    }
  ]
}
```

#### POST `{main-url}/api/v1/repos/{owner}/{repo}/pulls/{id}/conflicts/resolve`

Request body:

```json
{
  "files": [
    {
      "path": "src/App.java",
      "resolution": "CUSTOM",
      "customContent": "resolved content"
    }
  ]
}
```

Response body: `MergeResponse`

### 5.4 Milestone Endpoints

#### POST `{main-url}/api/v1/milestone/repos/{owner}/{repo}/milestones/{writer}`

Request body:

```json
{
  "title": "Milestone 1",
  "description": "Milestone description",
  "dueDate": "2026-05-30T00:00:00Z",
  "maxScore": 100,
  "passingScore": 60,
  "rubric": "Rubric text",
  "requiredTasks": 3
}
```

Response body:

```json
{
  "id": "milestone-id",
  "number": 1,
  "title": "Milestone 1",
  "description": "Milestone description",
  "dueDate": "2026-05-30T00:00:00Z",
  "createdAt": "2026-04-29T10:00:00Z",
  "updatedAt": "2026-04-29T10:00:00Z",
  "closedAt": null,
  "createdBy": "john.doe",
  "status": "open",
  "maxScore": 100,
  "passingScore": 60,
  "rubric": "Rubric text",
  "requiredTasks": 3,
  "completionPercentage": 0.0,
  "totalTasks": 0,
  "openTasks": 0,
  "completedTasks": 0,
  "inProgressTasks": 0,
  "tasks": []
}
```

#### GET `{main-url}/api/v1/milestone/repos/{owner}/{repo}/milestones?state=open`

Response body: array of `MilestoneResponse`

#### GET `{main-url}/api/v1/milestone/repos/{owner}/{repo}/milestones/{number}`

Response body: `MilestoneResponse`

#### PATCH `{main-url}/api/v1/milestone/repos/{owner}/{repo}/milestones/{number}`

Request body: same `MilestoneRequest` shape as create.

Response body: `MilestoneResponse`

### 5.5 Task Endpoints

#### POST `{main-url}/api/v1/task/repos/{owner}/{repo}/tasks/{username}`

Request body:

```json
{
  "title": "Implement login",
  "description": "Task description",
  "milestoneNumber": 1,
  "priority": "HIGH",
  "labels": [],
  "dueDate": "2026-05-10T00:00:00Z",
  "estimatedHours": 8,
  "maxScore": 20,
  "requirements": ["Requirement 1", "Requirement 2"]
}
```

Response body: `TaskResponse`

Main shape:

```json
{
  "id": "task-id",
  "number": 1,
  "title": "Implement login",
  "description": "Task description",
  "assignedTo": {},
  "status": "OPEN",
  "priority": "HIGH",
  "labels": [],
  "dueDate": "2026-05-10T00:00:00Z",
  "maxScore": 20,
  "earnedScore": null,
  "milestoneNumber": 1,
  "completedAt": null,
  "reviewedBy": null,
  "reviewComments": null,
  "submissionUrl": null,
  "submissionBranch": null,
  "requirementsChecklist": [],
  "commentsCount": 0
}
```

#### POST `{main-url}/api/v1/task/repos/{owner}/{repo}/tasks/{number}/assign/{user}/{assignee}`

Response body: `TaskResponse`

#### POST `{main-url}/api/v1/task/repos/{owner}/{repo}/tasks/{number}/submit`

Request body:

```json
{
  "description": "Submission details",
  "branchName": "feature-task-1",
  "commitHash": "commit-sha",
  "pullRequestUrl": "{main-url}/...",
  "files": ["src/App.java"]
}
```

Response body: `SubmissionResponse`

#### POST `{main-url}/api/v1/task/repos/{owner}/{repo}/tasks/{number}/review`

Request body:

```json
{
  "feedback": "Good work",
  "score": 18,
  "approved": true,
  "checkedRequirements": ["Requirement 1"]
}
```

Response body: `TaskResponse`

#### GET `{main-url}/api/v1/task/repos/{owner}/{repo}/dashboard`

Response body:

```json
{
  "username": "john.doe",
  "totalTasks": 10,
  "completedTasks": 4,
  "inProgressTasks": 2,
  "inReviewTasks": 1,
  "openTasks": 3,
  "totalEarnedScore": 70,
  "totalPossibleScore": 100,
  "scorePercentage": 70.0,
  "tasks": []
}
```

### 5.6 Repository File Browsing Endpoints

#### GET `{main-url}/repos/{owner}/{repo}/contents/{path}?ref=main`

Response body:

```json
{
  "name": "App.java",
  "path": "src/App.java",
  "sha": "blob-sha",
  "content": "file text content",
  "size": 1024,
  "language": "java",
  "commitSha": "commit-sha"
}
```

#### GET `{main-url}/repos/{owner}/{repo}/blame/{path}?ref=main`

Response body:

```json
[
  {
    "commitSha": "abcd1234",
    "author": "john.doe",
    "lineNumber": 1,
    "content": "public class App {"
  }
]
```

#### GET `{main-url}/repos/{owner}/{repo}/commits?path=src/App.java&ref=main&limit=20`

Response body:

```json
[
  {
    "sha": "full-commit-sha",
    "shortSha": "abcd1234",
    "author": "john.doe <john@example.com>",
    "committer": "john.doe <john@example.com>",
    "message": "Commit message",
    "parents": ["parent-sha"]
  }
]
```

#### GET `{main-url}/repos/{owner}/{repo}/tree?ref=main&path=src`

Response body:

```json
[
  {
    "name": "App.java",
    "type": "blob",
    "mode": "100644",
    "sha": "blob-sha",
    "path": "src/App.java"
  }
]
```

#### GET `{main-url}/repos/{owner}/{repo}/compare/{base}...{head}`

Response body:

```json
{
  "baseCommit": "base-sha",
  "headCommit": "head-sha",
  "files": [
    {
      "path": "src/App.java",
      "status": "modified",
      "baseSha": "old-blob-sha",
      "headSha": "new-blob-sha"
    }
  ]
}
```

### 5.7 Web File Editing Endpoints

#### PUT `{main-url}/repos/{owner}/{repo}/contents/{path}`

Request body:

```json
{
  "content": "new file content",
  "message": "Update file",
  "branch": "main",
  "sha": "existing-file-sha"
}
```

Response body:

```json
{
  "commit_sha": "commit-sha",
  "short_sha": "abcd1234",
  "path": "src/App.java",
  "status": "created/updated"
}
```

#### DELETE `{main-url}/repos/{owner}/{repo}/contents/{path}`

Request body:

```json
{
  "message": "Delete file",
  "branch": "main",
  "sha": "existing-file-sha"
}
```

Response body:

```json
{
  "commit_sha": "commit-sha",
  "short_sha": "abcd1234",
  "path": "src/App.java",
  "status": "deleted"
}
```

### 5.8 Contribution Endpoints

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/contributors/{user}`

Response body:

```json
{
  "contributors": [
    {
      "username": "john.doe",
      "totalPRs": 4,
      "totalCommits": 10,
      "additions": 200,
      "deletions": 50,
      "additionPercentage": 80.0,
      "deletionPercentage": 20.0
    }
  ],
  "totalCommits": 10,
  "totalAdditions": 200,
  "totalDeletions": 50,
  "totalPRs": 4
}
```

#### GET `{main-url}/api/v1/repos/{owner}/{repo}/contributors/{username}/graph`

Response body:

```json
{
  "username": "john.doe",
  "contributions": [
    {
      "date": "2026-04-29",
      "count": 3
    }
  ]
}
```

#### GET `{main-url}/api/v1/repos/{username}/activity?limit=20`

Response body:

```json
[
  {
    "id": "event-id",
    "type": "PULL_REQUEST",
    "action": "OPENED",
    "title": "Opened PR #1",
    "repo": "owner/repo",
    "timestamp": "2026-04-29T10:00:00Z"
  }
]
```

---

## 6. Config Service

No project-defined REST controllers were found in `config-service/src/main/java`.

Extracted result from source:

- No custom endpoints declared in application code.

---

## 7. Eurak Service

No project-defined REST controllers were found in `eurak-service`.

Extracted result from source:

- No custom endpoints declared in application code.

---

## 8. Faculty registry service (`{main-url}/api/...`)

**Base:** same gateway as students (`VITE_API_BASE_URL`). Paths below are prefixed with **`/api`**. Responses may be **JSON arrays** or **Spring `Page`** envelopes (`content` / `data`); the client unwraps lists in `apiRoute.facultyListItems`.

Pagination (when supported by the service):

```
?page=0&size=10&sort=name,asc
```

### Academic year (`/api/academic-year`)

| Method | Path |
| --- | --- |
| GET | `/api/academic-year` |
| POST | `/api/academic-year` |
| GET | `/api/academic-year/{id}` |
| PUT | `/api/academic-year/{id}` |
| DELETE | `/api/academic-year/{id}` |

**POST/PUT JSON body (typical)**

```json
{
  "name": "2025-2026",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01",
  "calendarType": "SOLAR"
}
```

### Department (`/api/department`)

Documented and used in admin settings; see existing `DEPARTMENT` routes in `RouteConfig.js`.

### Semester (`/api/semester`)

| Method | Path |
| --- | --- |
| GET | `/api/semester` |
| POST | `/api/semester` |
| GET | `/api/semester/{id}` |
| PUT | `/api/semester/{id}` |
| DELETE | `/api/semester/{id}` |

**POST/PUT JSON (typical)**

```json
{
  "academicYear": "academicYearId",
  "type": "SPRING",
  "name": "Semester 1",
  "startDate": "2026-03-01",
  "endDate": "2026-08-30"
}
```

### Batch (`/api/batch`)

| Method | Path |
| --- | --- |
| GET | `/api/batch` |
| POST | `/api/batch` |
| GET | `/api/batch/{id}` |
| PUT | `/api/batch/{id}` |
| DELETE | `/api/batch/{id}` |

**POST/PUT JSON (typical)**

```json
{
  "name": "Batch 2025",
  "year": 2025,
  "type": "UNDERGRAD",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30",
  "description": "optional",
  "isActive": true,
  "academicYear": "academicYearId"
}
```

### Project (`/api/project`)

| Method | Path |
| --- | --- |
| GET | `/api/project` |
| POST | `/api/project` |
| GET | `/api/project/{id}` |
| PUT | `/api/project/{id}` |
| DELETE | `/api/project/{id}` |

**POST JSON (typical)**

```json
{
  "projectName": "Project Name",
  "group": "groupId",
  "teacher": "teacherId",
  "projectRepository": "repositoryId"
}
```

### Group (`/api/group`)

| Method | Path |
| --- | --- |
| GET | `/api/group` |
| POST | `/api/group` |
| GET | `/api/group/{id}` |
| PUT | `/api/group/{id}` |
| DELETE | `/api/group/{id}` |

**POST JSON (typical)**

```json
{
  "name": "Group A",
  "groupMembers": ["studentId1", "studentId2"],
  "groupLeader": "studentId1",
  "academicYear": "academicYearId"
}
```

`academicYear` is optional; omit or send `null` when not tied to a specific academic year.

**Response (typical)**

Nested `academicYearResponse` (or equivalent) may echo the selected year (`id`, `name`, `startDate`, `endDate`, `calendarType`) alongside `groupMembers`, `groupLeader`, and `name`.

Frontend integration (`RouteConfig.ACADEMIC_YEAR`, `SEMESTER`, `BATCH.*`, `FACULTY_PROJECT`, `FACULTY_GROUP`), Axios helpers and TanStack hooks live in **`apiRoute.js`** / **`useApi.js`**. **GET hooks** disable `gooeyToast` by default (`notifyOnError: false`); **create / update / delete** mutations keep success/error toasts via `useApiMutation`.

