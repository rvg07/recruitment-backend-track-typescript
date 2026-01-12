# Instructions for Candidates

## Submission Process
Candidates must **fork** the repository (notice that this will make it public) and, once they have completed their work, submit the link to their forked repository via email to their recruitment contact.

## Questions and Clarifications
Any questions or clarifications must be submitted by opening an issue on this repository or with an email to desantis@multicerta.it.

## Scoring Criteria
Each feature and best practice contributes to a total score of **110 base points** (+15 bonus possible), allowing candidates to self-evaluate their implementation. The distribution is as follows:

- **Project Structure & MVC (25 points)**
  - Well-organized folder structure (10)
  - Use of an existing Node.js server framework (Fastify, Express, ...) (5)
  - Proper Typescript setup (5)
  - A complete Package-JSON with proper scripts and dependencies (5)

- **RESTful API (20 points)**
  - Complete CRUD endpoints for Users, Tax Profiles, Invoices (10)
  - Proper JSON responses & HTTP status codes (5)
  - Implemented pagination & filters (5)

- **Testing (15 points)**
  - Unit & integration tests (Jest, Vitest, ...) (10)
  - Coverage (3)
  - Use of test fixtures (2)

- **Docker Environment (15 points)**
  - Proper multistage Dockerfile (5)
  - Well-structured docker-compose setup (5)
  - Persistent database volume configuration (5)

- **Documentation (15 points)**
  - Well-written README with setup & usage instructions (5)
  - An **OpenAPI document** describing the API (5)
  - OpenAPI generated automatically from entities (or used to generate DTOs) (5)

- **Database & ORM (10 points)**
  - Correct use of migrations (5)
  - Proper ORM integration (Prisma, TypeORM, ...) (5)

- **Security (10 points)**
  - Secure password handling (5)
  - API authentication (JWT, API keys, etc.) (5)

- **Other Best Practices (15 points)**
  - Meaningful commit messages & clear history (5)
  - Code linting (Prettier, ESLint) (5)
  - Logging & error handling (3)
  - Proper database relationship handling (2)

---

# Invoice Management API

## Overview

This is a Dockerized Typescript-based Invoice Management API project. It provides endpoints to manage users, tax profiles, and invoices. The project is structured using the MVC architecture and includes automated tests, Docker support, and API documentation via OpenAPI/Swagger.

## 1. Docker Environment

### Multistage Dockerfile:
- Use **Node 20** (or the latest stable version) for the development stage.
- Production stage with **node:20-alpine** for a lightweight image.

### Docker Compose:
- Configure a `docker-compose.yml` file to orchestrate the following containers:
  - **Typescript server**.
  - **Database** (PostgreSQL or MySQL).
  - **Web Server** (Nginx).
- Ensure proper volumes are configured for persistent data (database).

## 2. Project Structure

### MVC Framework:
- Use a Node.js framework with MVC pattern of your choice (**Fastify**, **Express**, or **Koa**).

### Database and Migrations:
- Use migrations to create and manage the following tables:
  - **users**: Manage user information.
  - **tax_profiles**: Manage tax profiles associated with users.
  - **invoices**: Manage invoices associated with tax profiles.
- Use an ORM (e.g., **Prisma**).

### RESTful API:
- Create the following CRUD endpoints:
  - **Users**: Create, read, update, delete users.
  - **Tax Profiles**: Create, read, update, delete tax profiles.
  - **Invoices**: Create, read, update, delete invoices.
- Responses should be in **JSON** format with appropriate **HTTP status codes**.

### Pagination and Filters:
- Implement **pagination** for query results.
- Implement **filters** for various fields (e.g., filter by name, date, invoice status).
- Filters and pagination should be configurable via query strings.

### Tests:
- Write **unit** and **integration tests** for the APIs.
- Use **fixtures** to load test data into the database.
- Test proper handling of data, relationships, and errors.

## 3. Documentation

### README:
- Instructions for setting up the environment with Docker.
- Steps for running the project, running migrations, testing the APIs, and testing the code.
- Provide an overview of the project and its features.

## 4. OpenAPI Documentation

- Create an **OpenAPI document** to describe the APIs.
- Use existing tools (e.g., tsoa, zod-to-openapi, or fastify-swagger)
- The document will include the following endpoint groups:
  - **Authentication** (if applicable, e.g., JWT or API keys).
  - **Users**: Create, read, update, and delete users (personal info).
  - **Tax Profiles**: Create, read, update, and delete tax profiles (tax details) associated with users.
  - **Invoices**: Create, read, update, and delete invoices (with related details) associated with tax profiles.
  - **Pagination and Filters**: Examples to test pagination and filters in responses.
- Each endpoint should be well documented with clear descriptions of input parameters and response data.

## 5. Git and Meaningful Commits

- Use **Git** for version control throughout the project.
- Write **meaningful commits** to describe each change, for example:
  - "Added User model and migration for users table".
  - "Created API endpoint for managing tax profiles".
  - "Added unit tests for invoice creation".
- Commits should follow a clear convention (e.g., present tense verb).

## 6. Security

- Secure user password management with **bcrypt**.
- Secure the APIs with **JWT**, **API keys**, or other authentication methods.

## 7. Other Details

- **Logging**: Configure logging tools to track errors.
- **Data Tests**: Ensure that relationships are properly handled in the database (user -> tax profile -> invoice).

## Final Result

- A **Dockerized application** with a well-configured development environment.
- **RESTful APIs** for managing users, tax profiles, and invoices, with support for pagination and filters.
- **Automated tests** to ensure code quality.
- An **OpenAPI Document** to describe APIs (and maybe a Swagger to test them).

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/<Your-github-username>/recruitment-backend-track-typescript
   cd recruitment-backend-track
   ```

2. Build and start the Docker containers:
   ```
   docker-compose up --build
   ```

3. Run migrations (e.g., with Prisma it would be something like):
   ```
    docker-compose exec backend npx prisma migrate deploy
   ```
   
4. Run tests with coverage (it is strongly suggested to run tests in a completely fresh and different environment before submitting the code)

5. Use the Swagger UI or other OpenAPI-compatible client to test the APIs.
