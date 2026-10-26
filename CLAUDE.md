# CreadivSol Backend

## Project kahan hai
- **Path:** `F:\Backends\CreadivSolBackend`
- **Git branch:** `main`
- **Run:** `npm run dev` (nodemon) ya `node index.js`
- **Port:** `5000` (`.env` se `PORT`)
- **Entry:** `index.js` (ESM, `"type": "module"`)

## Stack
- **Runtime:** Node.js (ES modules)
- **Framework:** Express 4
- **Database:** MongoDB Atlas via Mongoose 8 (`config/DB.js`)
- **Auth:** JWT (`jsonwebtoken`, `bcrypt`)
- **Uploads:** Cloudinary + `multer` / `express-fileupload`
- **Email:** Nodemailer (Hostinger SMTP, `utils/NodeMailerConfig.js`) + SendGrid
- **Validation:** Joi
- **Security:** Helmet, `express-rate-limit`, CORS (`utils/AllowedOrigins.js`)
- **Cache:** Redis (`utils/RedisClient.js`, `utils/RedisCache.js`)
- **Dev:** nodemon

## Structure
```
index.js                  # app setup, middleware, server start
config/DB.js              # mongoose connect (custom DNS patch for Atlas SRV)
routes/                   # PortfolioRoutes, ContactRoutes, BlogRoutes
controllers/              # PortfolioController, ContactController, BlogController
models/                   # PortfolioSchema, ContactUsSchema, BlogSchema
middlewares/              # ErrorHandler, ErrorLogger, RateLimiter, Helmet, Auth, Cache, Upload
utils/                    # mailers, cloudinary, redis, tokens, search
validations/              # Joi schemas
emails/                   # email templates
```

## Abhi kya kaam ho raha hai / Completed Tasks
- **Blog feature** successfully implemented:
  - `models/BlogSchema.js` (slug auto-generation, status enum, author, SEO, timestamps, toJSON transform)
  - `controllers/BlogController.js` (`createBlog`, `getAllBlogs`, `getBlogBySlug`, `getBlogCategories`, `updateBlog`, `deleteBlog`)
  - `routes/BlogRoutes.js` (Endpoints registered under `/api`)
  - Registered in `index.js`

## Known issues
- Server start pe `EADDRINUSE :::5000` aata hai agar purani process port 5000 pe ho. Fix: purani process kill karo ya `.env` mein `PORT` badlo.

## Update log
- **2026-10-25:** Created `CLAUDE.md`, implemented complete **Blog Feature** (`BlogSchema`, `BlogController`, `BlogRoutes`, and integrated into `index.js`).
