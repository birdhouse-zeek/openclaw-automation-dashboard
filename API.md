# OpenClaw API Integration

This document outlines the expected API endpoints for integrating the dashboard with OpenClaw.

## Base URL

The dashboard automatically detects the environment:
- **Local**: `http://localhost:3000`
- **Production**: `https://api.openclaw.dev`

## Endpoints

### Gateway Status

```http
GET /api/gateway/status
```

**Response:**
```json
{
  "status": "online|offline",
  "version": "1.0.0",
  "uptime": 86400,
  "lastPing": "2024-01-15T14:30:00Z"
}
```

### Cron Jobs

#### List All Jobs
```http
GET /api/cron/jobs
```

**Response:**
```json
[
  {
    "id": "job-123",
    "name": "Daily Backup",
    "schedule": "0 2 * * *",
    "command": "openclaw backup --daily",
    "description": "Performs daily system backup",
    "enabled": true,
    "lastRun": "2024-01-15T02:00:00Z",
    "nextRun": "2024-01-16T02:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Create Job
```http
POST /api/cron/jobs
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Job",
  "schedule": "0 9 * * *",
  "command": "openclaw command",
  "description": "Optional description",
  "enabled": true
}
```

**Response:**
```json
{
  "id": "job-124",
  "name": "New Job",
  "schedule": "0 9 * * *",
  "command": "openclaw command",
  "description": "Optional description",
  "enabled": true,
  "lastRun": null,
  "nextRun": "2024-01-16T09:00:00Z",
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

#### Update Job
```http
PUT /api/cron/jobs/{id}
Content-Type: application/json
```

**Request:** Same as create job

**Response:** Updated job object

#### Delete Job
```http
DELETE /api/cron/jobs/{id}
```

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

#### Toggle Job
```http
POST /api/cron/jobs/{id}/toggle
```

**Response:**
```json
{
  "id": "job-123",
  "enabled": false,
  "message": "Job disabled successfully"
}
```

### Job Execution

#### Manual Trigger
```http
POST /api/cron/jobs/{id}/run
```

**Response:**
```json
{
  "executionId": "exec-456",
  "status": "running",
  "startedAt": "2024-01-15T14:30:00Z"
}
```

#### Execution History
```http
GET /api/cron/jobs/{id}/executions?limit=10&offset=0
```

**Response:**
```json
[
  {
    "id": "exec-456",
    "jobId": "job-123",
    "status": "completed|running|failed",
    "startedAt": "2024-01-15T02:00:00Z",
    "completedAt": "2024-01-15T02:05:00Z",
    "output": "Command output...",
    "error": null,
    "exitCode": 0
  }
]
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_SCHEDULE",
    "message": "Cron expression is invalid",
    "details": "Expected format: minute hour day month weekday"
  }
}
```

## Authentication

If authentication is required, the API expects a bearer token:

```http
Authorization: Bearer your-api-token-here
```

## Rate Limiting

The API may implement rate limiting:
- 100 requests per minute per IP
- Headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Implementation Notes

1. **Cron Schedule Format**: Standard cron format (minute hour day month weekday)
2. **Timezone**: All timestamps are in UTC
3. **Job Names**: Must be unique within the system
4. **Command Execution**: Commands are executed in the OpenClaw environment
5. **Status Updates**: Real-time updates via WebSocket (optional) at `/api/ws`

## Testing

Use these curl examples to test the API:

```bash
# Get gateway status
curl -X GET http://localhost:3000/api/gateway/status

# List jobs
curl -X GET http://localhost:3000/api/cron/jobs

# Create job
curl -X POST http://localhost:3000/api/cron/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "schedule": "*/5 * * * *",
    "command": "echo Hello World",
    "description": "Test every 5 minutes"
  }'
```