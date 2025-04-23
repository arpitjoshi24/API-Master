#  API-Master – Offline API Testing Tool

##  Overview

Welcome to the "API-Master" project! This repository documents the development of a lightweight, offline-friendly API testing tool built using "React" and "Express". It allows users to test RESTful APIs, manage requests, and view responses — all in a smooth, intuitive interface.

Our goal is to create a simplified version of Postman that can work offline and be extended with advanced features like automated test assertions, token-based authentication, and customizable request options.

---

##  Project Goals

- "Request Builder": Allow users to make various HTTP requests (GET, POST, PUT, DELETE).
- "Header & Body Support": Include customizable headers and JSON payloads.
- "Auth Handling": Add bearer tokens or custom headers for secure endpoints.
- "Test Tab": Evaluate response data against expected results.
- "Offline Friendly": Optionally run as a desktop app using Electron.
- "Frontend-Backend Isolation": React for UI, Express for backend simulations.

---

##  Core Modules

### React (Frontend)
- Dynamic input fields for headers, parameters, and body
- Request/Response display panels
- Test tab with custom assertions
- JSON formatting and pretty printing

### Express (Backend)
- Dummy API endpoints for testing
- Middleware for logging and CORS
- Token-based authentication example routes

---

##  Advantages

- Offline testing capability
- No need for third-party tools
- Minimal system requirements
- Highly extensible and beginner-friendly

##  Limitations

- Manual data entry for request setup
- Requires knowledge of HTTP/JSON basics
- Currently supports only basic assertions
- Not a replacement for full-featured tools like Postman (yet)

---

##  Applications

This clone can be used for:

- API Development and Testing
- Learning HTTP request/response cycles
- Teaching RESTful APIs to students
- Simulating server-client interaction offline

---

##  Features in Action

### Request Builder
- Select method (GET/POST/etc)
- Enter URL and headers
- Write JSON body

### Test Tab
- Add test cases like: `Status = 200`, `response.body.success == true`

### Response Panel
- Shows status, time, size, and JSON response

---

##  Fitness-Like Function (Test Tab Logic)

While not a genetic algorithm, the "Test Tab" includes a logic engine to simulate assertions:

- "Validations"
  - Status code match
  - Presence of keys
  - Value checks (equal, contains, etc.)

Each passed test adds to the visual "score" of a request success rate. This encourages building better APIs.

---

##  Installation & Setup

To run this project, clone the repository, install dependencies, and run the servers:

```bash

# Clone the repository
git clone https://github.com/arpitjoshi24/API-Master.git
cd API-Master
cd PostWomen

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup
cd backend
npm install
node server.js
