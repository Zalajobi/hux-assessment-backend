# Hux Assessment Backend

This Express application serves as the backend for a contact management system, designed to handle various endpoints for managing user contacts effectively.

## Getting Started

These instructions will get your copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

#### Node.js and npm

Ensure you have the following installed:

- Node.js (>= 14.x)
- npm (>= 6.x)

You can verify your Node and npm versions with:

```bash
node --version
npm --version
```

#### PostgresSQL

Ensure you have PostgresSQL installed on your local machine. You can download the installer from the [official website](https://www.postgresql.org/download/).
create a database and user for the application.

#### Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```bash
PROJECT_PORT=3000
ACCOUNT_BASE_URL=http://localhost:3000/api/v1 # Base URL for all request, this is a sample URL
DATABASE_NAME="database name"
DATABASE_PASSWORD="database password"
DATABASE_USERNAME="database username"
DATABASE_HOST="database host url"
DATABASE_PORT="database port"
PASSWORD_HASH_SECRET="password hash secret"
JWT_SECRET_KEY="jwt secret"
```

### Installing

- git clone https://github.com/Zalajobi/hux-assessment-backend.git
- cd hux-assessment-backend
- npm install
- npm run start:dev # To start the application in development mode
- npm run start # To start the application in production mode

## Running the tests

To run the tests, run the following command:

```bash
npm run test
```
