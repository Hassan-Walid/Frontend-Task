# Bookstore Admin Dashboard
## Overview

- This project is a frontend bookstore admin interface that allows managing stores, books, and authors.
- It provides functionalities for viewing store inventories, editing book prices, adding new books, and handling user authentication.

## Features

### Inventory Management

- View books in a store with details: Book Id, Name, Pages, Author, Price.

- Inline edit book prices.

- Delete books from the store.

- Add new books to store inventory.

- Search books within a store.

### Authentication

- Sign In / Sign Out functionality.

- Only signed-in users can add, edit, or delete inventory.

- User authentication is validated against mock user data.

- User session persists on refresh using localStorage.

- Allowed Users:
 - email: admin@test.com
 - password: 123456

### Mock Server

- The app can run with either the mock server or the real backend.

- Switch between servers using an environment variable: `VITE_USE_MOCK=true`

## Installation

- Clone the repository: `git clone https://github.com/Hassan-Walid/Frontend-Task`

- Install dependencies: `npm install`

- Run the app: `npm run dev`

- Mock server (if using): `npm run mock`