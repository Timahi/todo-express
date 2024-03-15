# ToDo app

## Usage

### Installation

```sh
npm install
```

Set environment variables in `.env` file.

```sh
mv .env.example .env
```

### Database

You must use a **MariaDB** database. Create a database and set the environment variables in the `.env` file.

_A `docker-compose.yml` file is provided to run a MariaDB container._

```sh
docker compose up -d
```

A `sql/tables.sql` file is provided to create the tables.

### Run

**In development mode**

```sh
npm run dev
```

**In production mode**

```sh
npm run start
```

## Endpoints

### `POST /auth/register`

```json
{
  "username": "username",
  "password": "password"
}
```

#### `201 Created`

```json
{
  "id": 1,
  "username": "username"
}
```

### `POST /auth/login`

```json
{
  "username": "username",
  "password": "password"
}
```

#### `200 OK`

```json
{
  "user": {
    "id": 1,
    "username": "username"
  },
  "access_token": "<jwt-bearer-token>"
}
```

### `GET /api/todos` (protected)

#### `200 OK`

```json
[
  {
    "id": 1,
    "title": "Todo 1",
    "done": false
  },
  {
    "id": 2,
    "title": "Todo 2",
    "done": true
  }
]
```

### `POST /api/todos` (protected)

```json
{
  "title": "Todo 3"
}
```

#### `201 Created`

```json
{
  "id": 3,
  "title": "Todo 3",
  "done": false
}
```

### `PUT /api/todos/:id` (protected)

```json
{
  "title": "<new-title>",
  "done": true
}
```

#### `200 OK`

```json
{
  "id": 3,
  "title": "Todo 3",
  "done": true
}
```

### `DELETE /api/todos/:id` (protected)

#### `204 No Content`

## Authentication

The API uses **JWT** for authentication. You must include the `Authorization` header with the `Bearer` token.

```http
GET /api/todos HTTP/1.1
Authorization: Bearer <jwt-bearer-token>
```

## Error handling

The API returns standard HTTP status codes and error messages in JSON format.

```json
{
  "error": {
    "status": 404,
    "message": "Not found"
  }
}
```
