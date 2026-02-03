# Invoice Management API
This is a Dockerized Typescript-based Invoice Management API project. It provides endpoints to manage users, tax profiles, and invoices. The project is structured using the MVC architecture, uses nginx as a reverse proxy includes automated tests, Docker support and API documentation via OpenAPI/Swagger.

## Getting started

### Prerequisites

*   [Docker](https://www.docker.com/get-started/)
*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/en/download) (v20+ is recommended)

### Installation

#### Development environment
It is configured via the .env.development file. It supports hot reloading thanks to nodemon, allowing changes to the code to be reflected instantly without restarting the docker container. In development environment, **nginx** serves the application on port **80**.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rvg07/recruitment-backend-track-typescript.git
    ```
    ```bash
    cd recruitment-backend-track-typescript
    ```

2.  **Configure environment variables** 
    
    - Copy the example environment file `.env.development.example` in the root project:
      ```bash
      cp .env.development.example .env.development
      ```

      Open `.env.development` and make sure the variables are set correctly.

    | Variable | Description | Default value |
    | :--- | :--- | :--- |
    | `BACKEND_HOST_PORT` | Port accessible on host machine | `3000` |
    | `DB_HOST` | Service name for Docker networking | `db` |
    | `MYSQL_HOST_PORT` | Port for direct DB connection | `3306` |
    | `MYSQL_DATABASE` | Database name | `invoice_db` |
    | `MYSQL_USER` | Database user | `dev_invoice_user` |
    | `MYSQL_PASSWORD` | Database password | `dev_invoice_password!` |
    | `MYSQL_ROOT_PASSWORD` | Root password | `root_password` |
    | `DATABASE_URL` | Prisma connection string | `mysql://dev_invoice_user:dev_invoice_password!@db:3306/invoice_db_dev` |
    | `JWT_SECRET` | Secret key for JWT signing | `jwt_secret_dev` |
    | `NODE_ENV` | Environment mode | `development` |

3.  **Run with Docker Compose**
    - Build and start the application:
        ```bash
        docker-compose --env-file .env.development up --build
        ```
    - The API will be available at: `http://localhost:80` (or `http://localhost`)
    - Swagger documentation: `http://localhost:80/api-docs`
 
#### Production environment
For production deployment use the `docker-compose.prod.yml`. Here no hot reloading is enabled. **nginx** is configured to serve the application on port **8080**.

1.  **Configure production environment variables** 
    
    - Copy the example environment file `.env.production.example` in the root project:
      ```bash
      cp .env.production.example .env.production
      ```

      Open `.env.production` and make sure the variables are set correctly.

2.  **Clean up previous containers**
    ```bash
    docker-compose -f docker-compose.prod.yml down -v
    ```

3.  **Start production build**
    ```bash
    docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
    ```
    - The API will be available at: `http://localhost:8080`
    - Swagger documentation: `http://localhost:8080/api-docs`

####  Running tests

Tests run against a separate `invoice_db_test` db which operates in tmpfs. <br>
These are steps in order to run the tests inside the Docker environment:

1.  **Clean up previous containers**
    ```bash
    docker-compose -f docker-compose.test.yml down -v
    ```
2.  **Start test build**
    ```bash
    docker-compose -f docker-compose.test.yml up --build --force-recreate --abort-on-container-exit
    ```

3.  **Run test coverage with Vitest**
    - To generate a test coverage report with Vitest:
    ```bash
    docker-compose -f docker-compose.test.yml run --rm tests npm run test:coverage
    ```

### Database migrations

In this project Prisma is used for schema management.

#### Development
Migrations are created when the schema changes. 
`CREATE` permission alone is not sufficient because Prisma requires rights to create a database during migration. Thus, we must grant the correct privileges to the dev user `dev_invoice_user`:

1. **Enter the MySQL container:**
   ```bash
   docker exec -it invoice_management_db_dev_mysql mysql -u root -proot_password
   ```

2. **Grant privileges inside MySQL:**
   ```sql
   GRANT ALL PRIVILEGES ON *.* TO 'dev_invoice_user'@'%' WITH GRANT OPTION;
   FLUSH PRIVILEGES;

   SHOW GRANTS FOR 'dev_invoice_user'@'%';

   EXIT;
   ```

3. **Run the migration:**
   ```bash
   docker exec -it invoice_management_dev_backend npx prisma migrate dev --name <migrationName>
   ```

### Production
Migrations are applied automatically when the container starts using `prisma migrate deploy`.

## Data constraints
In order to comply with fiscal regulations, the API implements soft and hard delete methods.

| Entity | Action `DELETE /:id` | Action `DELETE /:id/permanent` |
| :--- | :--- | :--- |
| **User** | Sets `deletedAt` | **Irreversible**. Deletes the User, their TaxProfiles and all Invoices. |
| **TaxProfile** | Sets `deletedAt` | **Irreversible**. Deletes the TaxProfile and all linked Invoices. |
| **Invoice** | Sets `deletedAt` | **Conditional**. Allowed **only** if status is `DRAFT` or `CANCELLED`. <br> Blocked for `PENDING`, `PAID` or `OVERDUE` invoices to ensure fiscal compliance. |