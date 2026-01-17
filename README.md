# Inventory and Fulfillment API

A RESTful API for managing inventory stock and order fulfillment. Built with NestJS, Prisma, and PostgreSQL.

## Features

- Inventory item management
- Stock tracking across multiple locations
- Order creation and fulfillment
- Low/critical stock quantity alerts

## Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 16+

## Setup

### Using Docker

1. Clone the repository

2. Start the services:
   ```bash
   docker-compose up -d
   ```

3. The API will be available at `http://localhost:3000`

### Local Development

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   DATABASE_URL=
   ```

4. Start PostgreSQL (using Docker):
   ```bash
   docker-compose up -d db
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

## API Documentation

Swagger documentation is available at `http://localhost:3000/api` when the server is running.

A Postman collection is also available for testing: [Api testing request.postman_collection.json](Api%20testing%20request.postman_collection.json)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:prod` | Start production server |
| `npm run build` | Build the application |
| `npm run test` | Run Jest tests |
