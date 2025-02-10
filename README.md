### Clone repository
```bash
git clone git@github.com:yurii-bondar/books-cms.git
```

### Run redis, postgres, dynamodb, dynamodb-gui with docker
```bash
npm run start:maintanance:services
```

### Run app (if you want to work through a docker instead of 'start:dev' or 'start:prod')
```bash
# set envFilePath: 'env/docker.env' in src/app.module.ts
npm run start:app:docker
```

### Install dependencies (due to dependency conflicts, we use 'legacy-peer-deps')
```bash
npm i --legacy-peer-deps
```

### Build TS
```bash
npm run build
```

### App start
```bash
# set envFilePath: 'env/dev.env' in src/app.module.ts

# dev
start:dev

# prod
npm run start:prod
```

### DB migration (choose the option you need)
```bash
# docker
npm run migration:docker

# dev
npm run migration

# test
npm run migration:test
```

### For tests
```bash
# There is likely to be an error here because the 'role' and 'permissions' tables are empty
npm run test

# Fill in the above tables with data
npm run migration:test

# Run the tests again
npm run test
```
### And enjoy this beauty
![alt text](./imgs/testsResult.png)

### REST requests:

##### Register user:
###### request
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "firstName": "Yurii",
    "secondName": "Bondar",
    "nickName": "avenger",
    "email": "marvel@gmail.com",
    "password": "difficult_password"
}' 'http://localhost:3000/auth/sign-up'
```
###### response
```bash
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDkzNjY0LCJleHAiOjE3MzkwOTQ1NjR9.Um46-FS9uZmsFEELDE9UB68Z_UngVGApZsqdbFVCdXU",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDkzNjY0LCJleHAiOjE3Mzk2OTg0NjR9.dIe71cBRS5BtVLMHhGHu0oNGD7SDa6RjvOjwO7zeP98"
}
```

##### Login user:
###### request
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "nickName": "avenger",
    "password": "difficult_password"
}' 'http://localhost:3000/auth/sign-in'
```
###### response
```bash
{
  "name": "avenger",
  "role": "trainee",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDkzOTI2LCJleHAiOjE3MzkwOTQ4MjZ9.vNCDVjoGRB6Fg-n314q64HrKu1upotdQ4ZEDYAXigq4",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDkzOTI2LCJleHAiOjE3Mzk2OTg3MjZ9.jKZD_FsDIsi-4GtQnMjMCnz2Qc2LHqs3IxTT_8T0OZk"
}
```

##### Updating access and refresh tokens:
###### request
```curl
curl -XPOST -H "Content-type: application/json" -d '{
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDkzOTI2LCJleHAiOjE3Mzk2OTg3MjZ9.jKZD_FsDIsi-4GtQnMjMCnz2Qc2LHqs3IxTT_8T0OZk"
}' 'http://localhost:3000/auth/refresh'
```
###### response
```bash
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDk0MDM1LCJleHAiOjE3MzkwOTQ5MzV9.8ModPdv7VvfK5j7j1xSbCcLJilXIFYG5CeRiYBR4yiw",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImF2ZW5nZXIiLCJyb2xlSWQiOjQsInN1YiI6NCwiaWF0IjoxNzM5MDk0MDM1LCJleHAiOjE3Mzk2OTg4MzV9.Od25Z6XgRXtREj6U2U4PTgdm67hcp7DUzW0E41KCGQU"
}
```

##### Logout:
###### request
```curl
curl -XPOST -H "Content-type: application/json" -d '{
    "userId": 4
}' 'http://localhost:3000/auth/logout'
```
###### response
```bash
{"message":"Successfully logged out"}
```

##### Set-up role for user:
###### request
```curl
curl -XPUT -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imdob3N0Iiwicm9sZUlkIjoxLCJzdWIiOjEsImlhdCI6MTczOTA5NzkxMSwiZXhwIjoxNzM5MDk4ODExfQ.KIwuohmOx65Y3XGr89eQusUKqap98I3xHAEeznY6ULQ' 'http://localhost:3000/users/4/role/2'
```
###### response
```bash
{
  "message":"Set up role 2 for user 4",
  "status":true
}
```

#### GraphqQL requests:
###### Carry out with the specified headers:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imdob3N0Iiwicm9sZUlkIjoxLCJzdWIiOjEsImlhdCI6MTczOTE3ODkxOCwiZXhwIjoxNzM5MTc5ODE4fQ.iQ1I-zylDAiPpn_UZXbeJlmzsqSVcLidZm5ingwHPcI"
}
```

###### Path to GraphQL playground: '/graphql'

```graphql
# createBook
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
### 
![alt text](./imgs/createBook.png)

```graphql
# createBooks
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
![alt text](./imgs/createBooks.png)

```graphql
# updateBook
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
![alt text](./imgs/updateBook.png)

```graphql
# delete
mutation {
    deleteBook(id: 6, reason: "Test DynamoDB books logs")
}
```
![alt text](./imgs/deleteBook.png)

```graphql
# getBooks
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
![alt text](./imgs/getBooks.png)

### Main data storage
##### The main data is stored in PostgreSQL
- Registered users: *users*
- Books: *books*
- User roles: *roles*
- Permissions: *permissions*

### App logs
##### DynamoDB is used to log user sessions and actions with books
###### users_logs
![alt text](./imgs/usersLogs.png)
###### books_logs
![alt text](./imgs/booksLogs.png)