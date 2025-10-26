# Frontend App

A simple Next.js frontend that communicates with the FastAPI backend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure backend connection:
   - Backend URL is configured in variable `NEXT_PUBLIC_BACKEND_URL` in `.env`

3. Run the development server:
```bash
npm run dev
```

## Testing Backend Connection

Visit `/test` page to check if the frontend can connect to the backend.

## Features

- Minimal UI showing "Hi"
- Backend connection test page at `/test`