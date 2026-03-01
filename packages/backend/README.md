# Showme Backend


## Using
- Node.js 20+
- npm
- MongoDB 

csc-307-group/
├── .github/workflows/ci.yml    ← Backend CI (lint + test on push/PR)
├── .gitignore
├── .prettierrc.json
├── CONTRIBUTING.md
├── package.json                 ← Monorepo root (workspaces)
│
└── packages/
    ├── backend/
    │   ├── src/
    │   │   ├── app.js / server.js
    │   │   ├── config/       (db, env validation, passport)
    │   │   ├── controllers/  (auth, tmdb)
    │   │   ├── middleware/    (errorHandler, notFound, requireAuth)
    │   │   ├── models/       (9 Mongoose models)
    │   │   ├── routes/       (auth, tmdb)
    │   │   ├── services/     (authService, tmdbClient)
    │   │   ├── utils/        (apiError, asyncHandler)
    │   │   └── scripts/      (seedGenres)
    │   ├── tests/            (3 test files + setup)
    │   ├── .env.example
    │   ├── docker-compose.yml
    │   └── package.json
    │
    └── frontend/
        ├── src/
        │   ├── App.jsx       (default Vite template)
        │   └── main.jsx
        ├── vite.config.js
        └── index.html
