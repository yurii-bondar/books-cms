# Books CMS

## Table of Contents
1. [Getting Started](#getting-started)
   - [Clone Repository](#clone-repository)
   - [Run Services](#run-services)
   - [Install Dependencies](#install-dependencies)
   - [Build TypeScript](#build-typescript)
   - [Start the Application](#start-the-application)
   - [Database Migration](#database-migration)
2. [Testing](#testing)
3. [API Requests](#api-requests)
   - [REST Requests](#rest-requests)
     - [Register User](#register-user)
     - [Login User](#login-user)
     - [Refresh Tokens](#refresh-tokens)
     - [Logout](#logout)
     - [Set User Role](#set-user-role)
   - [GraphQL Requests](#graphql-requests)
     - [Create Book](#create-book)
     - [Create Multiple Books](#create-multiple-books)
     - [Update Book](#update-book)
     - [Delete Book](#delete-book)
     - [Get Books](#get-books)
4. [Data Storage](#data-storage)
   - [Main Data Storage](#main-data-storage)
   - [Application Logs](#application-logs)

## Getting Started

### Clone Repository
```bash
git clone git@github.com:yurii-bondar/books-cms.git
```

### Run Services
Run Redis, PostgreSQL, DynamoDB, and DynamoDB GUI with Docker:
```bash
npm run start:maintanance:services
```

To run the app through Docker (instead of 'start:dev' or 'start:prod'):
```bash
# set envFilePath: 'env/docker.env' in src/app.module.ts
npm run start:app:docker
```

### Install Dependencies
Due to dependency conflicts, we use 'legacy-peer-deps':
```bash
npm i --legacy-peer-deps
```

### Build TypeScript
```bash
npm run build
```

### Start the Application
Set `envFilePath: 'env/dev.env'` in `src/app.module.ts`, then run:

For development:
```bash
npm run start:dev
```

For production:
```bash
npm run start:prod
```

### Database Migration
Choose the appropriate option:
```bash
# For Docker
npm run migration:docker

# For development
npm run migration

# For testing
npm run migration:test
```

## Testing
```bash
# Run tests (note: 'role' and 'permissions' tables might be empty)
npm run test

# Fill 'role' and 'permissions' tables with data
npm run migration:test

# Run tests again
npm run test
```

Test results:
![Test Results](./imgs/testsResult.png)

## API Requests

### REST Requests

#### Register User
Request:
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "firstName": "Yurii",
    "secondName": "Bondar",
    "nickName": "avenger",
    "email": "marvel@gmail.com",
    "password": "difficult_password"
}' 'http://localhost:3000/auth/sign-up'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
Request:
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "nickName": "avenger",
    "password": "difficult_password"
}' 'http://localhost:3000/auth/sign-in'
```

Response:
```json
{
  "name": "avenger",
  "role": "trainee",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Refresh Tokens
Request:
```curl
curl -XPOST -H "Content-type: application/json" -d '{
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}' 'http://localhost:3000/auth/refresh'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
Request:
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "userId": 4
}' 'http://localhost:3000/auth/logout'
```

Response:
```json
{"message":"Successfully logged out"}
```

#### Set User Role
Request:
```curl
curl -XPUT -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 'http://localhost:3000/users/4/role/2'
```

Response:
```json
{
  "message":"Set up role 2 for user 4",
  "status":true
}
```

### GraphQL Requests
Path to GraphQL playground: '/graphql'

Headers for all GraphQL requests:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Create Book
```graphql
mutation {
    createBook(
        input: {
            name: "DynamoDB Book 123"
            author: "John Doe"
            publication_date: "2025-03-15T00:00:00Z"
            hard_cover: true
            newsprint: false
        }
    ) {
        id
        name
        author
        publication_date
        hard_cover
        newsprint
    }
}
```
![Create Book Result](./imgs/createBook.png)

#### Create Multiple Books
```graphql
mutation {
    createBooks(input: {
        books: [
            {
                name: "GraphQL Book 12345"
                author: "John Doe"
                publication_date: "2025-03-15T00:00:00Z"
                hard_cover: true
                newsprint: false
            },
            {
                name: "GraphQL Book 4567"
                author: "Jane Doe"
                publication_date: "2024-05-10T00:00:00Z"
                hard_cover: false
                newsprint: true
            }
        ]
    }) {
        id
        name
        author
        publication_date
        hard_cover
        newsprint
    }
}
```
![Create Multiple Books Result](./imgs/createBooks.png)

#### Update Book
```graphql
mutation {
    updateBook(
        id: 9
        input: {
            name: "Dev Horror"
            author: "Yurii Bondar"
        }
    ) {
        id
        name
        author
        publication_date
        hard_cover
        newsprint
        add_date
    }
}
```
![Update Book Result](./imgs/updateBook.png)

#### Delete Book
```graphql
mutation {
    deleteBook(id: 6, reason: "Test DynamoDB books logs")
}
```
![Delete Book Result](./imgs/deleteBook.png)

#### Get Books
```graphql
query {
    getBooks(
        page:2
        limit: 2
        sortBy: "publication_date"
        publicationYear: 2025
        sortOrder: "ASC"
    ) {
        currentPage
        totalPages
        page {
            id
            name
            author
            publication_date
            hard_cover
            newsprint
            add_date
        }
    }
}
```
![Get Books Result](./imgs/getBooks.png)

## Data Storage

### Main Data Storage
The main data is stored in PostgreSQL:
- Registered users: *users*
- Books: *books*
- User roles: *roles*
- Permissions: *permissions*

### Application Logs
DynamoDB is used to log user sessions and actions with books:

#### Users Logs
![Users Logs](./imgs/usersLogs.png)

#### Books Logs
![Books Logs](./imgs/booksLogs.png)