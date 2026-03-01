# Showme Backend
## Using
- Node.js 20+
- npm
- MongoDB 

For now: 
- config/ : App-level setup database connection (db.js), environment variable validation with Zod (env.js), and Google OAuth
- controllers/ : takes incoming requests, calls services/models, and sends responses. auth.controller.js handles register/login/OAuth, tmdb.controller.js handles movie/TV search & details

- middleware/: requireAuth.js protects routes with JWT verification, errorHandler.js catches errors and sends formatted responses, notFound.js handles 404s
- models/: Mongoose schemas
- routes/: connects HTTP methods + paths to the right controller function. index.js combines all route files under /api
- services/:  handles password hashing and JWT token creation, tmdbClient.js makes API calls to TMDB for movie/TV data
