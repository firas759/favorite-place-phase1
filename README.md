# Favorite Places - Phase 2

Phase 2 builds on Phase 1 and adds:

- Register and Login
- Server-side form validation
- Password hashing with bcryptjs
- Sessions with express-session
- Protected dashboard and submission pages
- Submit Place form
- My Submissions page
- Search / Filter using GET and req.query
- Cookie-based theme preference
- Bootstrap responsive navigation

## Run

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set a session secret.

3. Start the server:

```bash
npm run dev
```

The app runs on http://localhost:3000.

> Phase 2 uses temporary in-memory users and submissions. MongoDB persistence and full CRUD are part of Phase 3.
