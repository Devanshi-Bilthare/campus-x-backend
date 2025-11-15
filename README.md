# CampusX Backend

A Node.js backend API built with TypeScript, Express, and MongoDB.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js web framework
- ✅ MongoDB with Mongoose ODM
- ✅ Environment variable configuration
- ✅ CORS and security headers (Helmet)
- ✅ Error handling middleware
- ✅ Health check endpoint

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and other configuration.

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Project Structure

```
campusx-backend/
├── src/
│   ├── config/
│   │   └── database.ts      # MongoDB connection
│   ├── controllers/
│   │   └── index.ts         # Route controllers
│   ├── models/
│   │   └── index.ts         # Mongoose models
│   ├── routes/
│   │   └── index.ts         # API routes
│   └── index.ts             # Application entry point
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/hello` - Example endpoint

## Environment Variables

See `.env.example` for all available environment variables.

## License

ISC

