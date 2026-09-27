# Layer — Backend

Backend service for Layer, a canvas-based diagram editor that allows users to create, persist, retrieve, and share interactive diagrams.

The backend provides the API layer responsible for authentication, user-related functionality, diagram persistence, and controlled access to shared diagrams.

## Responsibilities

The backend is responsible for:

* User authentication
* JWT-based authentication
* Access and refresh token handling
* Password hashing
* Google OAuth authentication
* Diagram persistence
* Diagram retrieval
* Read-only diagram sharing
* API routing
* Authentication middleware
* Request handling and service-layer logic
* MongoDB data persistence
* Rate limiting
* Cookie-based authentication support
* Email-related functionality

The frontend is responsible for the interactive canvas, rendering, editing operations, undo and redo, copy and paste, and other editor-specific interactions.

## Architecture

The backend follows a layered structure separating routing, controllers, services, models, and middleware.

```text
Client
  |
  v
Express Routes
  |
  v
Middleware
  |
  +-- Authentication
  +-- Request protection
  +-- Other middleware
  |
  v
Controllers
  |
  v
Services
  |
  v
Mongoose Models
  |
  v
MongoDB
```

### Routes

Routes define the HTTP API surface and connect incoming requests to the appropriate controller.

### Middleware

Middleware is used for concerns that need to be applied before requests reach the controller layer, including authentication-related checks and request protection.

### Controllers

Controllers handle HTTP-level concerns such as:

* Reading request data
* Calling application services
* Returning HTTP responses
* Handling request-specific errors

### Services

Services contain application-level operations and keep business logic separate from HTTP route handling.

### Models

Mongoose models define the structure used to persist application data in MongoDB.

## Authentication

Layer uses JWT-based authentication.

The backend supports authentication flows involving:

* User registration
* User login
* Password hashing
* JWT access tokens
* Refresh tokens
* Protected routes
* Authentication middleware
* Cookie handling

Passwords are processed using bcrypt rather than being stored directly.

### Authentication Flow

A simplified authentication flow is:

```text
User
  |
  v
Login / Register
  |
  v
Authentication Controller
  |
  v
User Service
  |
  +-- Verify / create user
  +-- Hash / verify password
  |
  v
JWT Tokens
  |
  v
Client
```

For protected requests:

```text
Client
  |
  v
Authenticated Request
  |
  v
Authentication Middleware
  |
  v
Controller
  |
  v
Service
  |
  v
Database
```

## Access and Refresh Tokens

Layer uses an access and refresh token model.

The access token is used for authenticated API access, while the refresh mechanism allows the application to obtain a new access token without requiring the user to log in again whenever the access credential expires.

Authentication-related cookies are supported through cookie-parser.

## Google OAuth

The backend includes Google OAuth integration using Passport and the Google OAuth 2.0 strategy.

Relevant dependencies include:

* passport
* passport-google-oauth20

This provides an alternative authentication flow alongside the application's regular authentication mechanism.

## Database

Layer uses MongoDB with Mongoose.

Mongoose provides the model layer used by the backend to interact with MongoDB.

The database is used for persistent application data, including information required for users and saved diagrams.

## Diagram Persistence

The frontend editor maintains temporary interaction state locally, while persisted diagram data is sent to the backend.

This creates a separation between:

```text
Temporary Editor State
        |
        v
Frontend
        |
        | REST API
        v
Backend
        |
        v
MongoDB
        |
        v
Persisted Diagram Data
```

This allows normal editing operations to remain responsive without requiring a database request for every interaction.

## Read-Only Sharing

Layer supports sharing diagrams through links intended for view-only access.

The backend provides the persistence and access-control layer required to retrieve shared diagram data without giving the recipient normal editing privileges.

## API Protection

The backend includes request-protection mechanisms such as:

* Authentication middleware
* Cookie parsing
* CORS configuration
* Express rate limiting
* Environment-based configuration

Rate limiting is implemented using express-rate-limit.

## Email

The backend includes Nodemailer for email-related functionality.

Email configuration is handled through environment variables rather than hard-coded credentials.

## Project Structure

```text
layers-backend/
│
├── config/
│   └── # Application/database configuration
│
├── controllers/
│   └── # HTTP request handlers
│
├── middlewares/
│   └── # Authentication and request middleware
│
├── models/
│   └── # Mongoose data models
│
├── routes/
│   └── # Express API routes
│
├── services/
│   └── # Application/business logic
│
├── utils/
│   └── # Shared backend utilities
│
├── index.js
├── package.json
├── pnpm-lock.yaml
└── .gitignore
```

## Tech Stack

### Runtime and Framework

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication and Security

* JSON Web Tokens
* bcrypt
* Passport
* Google OAuth 2.0
* Cookie Parser
* CORS
* Express Rate Limit

### Other

* Nodemailer
* Morgan
* dotenv
* pnpm

## Getting Started

### Prerequisites

Install:

* Node.js
* pnpm
* MongoDB or access to a MongoDB deployment
* Git

### Clone the Repository

```bash
git clone https://github.com/SujalKakatkar/layers-backend.git
cd layers-backend
```

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env` file containing the configuration required by the backend.

Example structure:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLIENT_URL=http://localhost:5173
```

The exact variable names must match the configuration used by the current source code.

Never commit `.env` files or real credentials to GitHub.

### Start the Development Server

```bash
pnpm dev
```

### Start the Production Server

```bash
pnpm start
```

The server will run on the configured port.

## Frontend Integration

The Layer frontend communicates with this backend through HTTP APIs.

Frontend repository:

https://github.com/SujalKakatkar/layers

The frontend is responsible for the editor experience, while this repository handles server-side functionality and persistence.

## Deployment

The backend can be deployed as a Node.js/Express service with environment variables configured in the deployment environment.

Production API:

Add your deployed backend URL here.

## API Testing

API endpoints can be tested using tools such as:

* Postman
* Insomnia
* REST Client
* Frontend application

When documenting individual endpoints, include:

```text
Method
Endpoint
Authentication requirement
Request body
Response
Possible errors
```

Example:

```text
POST /api/...
Authentication: Required

Request:
{
  ...
}

Response:
{
  ...
}
```

Replace the example endpoint with the actual endpoint paths from the current routes before adding endpoint-specific documentation.

## Engineering Decisions

### Why Separate Controllers and Services?

Controllers are responsible for HTTP-level request and response handling, while services provide a separate place for application logic.

This reduces the amount of business logic placed directly inside route handlers and makes the backend easier to organize as functionality grows.

### Why MongoDB?

Diagram data can contain flexible structures representing different types of canvas elements and their properties. MongoDB provides a document-oriented persistence model suitable for this type of application data.

### Why JWT?

JWT-based authentication allows the backend to authenticate API requests without maintaining a traditional server-side session for every request.

### Why Keep Editing State on the Frontend?

Canvas interactions such as dragging, resizing, selection, undo, and redo can occur frequently.

Keeping these high-frequency interactions in frontend state avoids unnecessary network requests and keeps the editor responsive. Persistence can happen through explicit API operations.

## Security Notes

* Store secrets in environment variables.
* Never commit `.env` files.
* Hash user passwords before persistence.
* Protect authenticated routes with authentication middleware.
* Use rate limiting on appropriate API routes.
* Configure CORS for the expected frontend origin.
* Keep OAuth credentials outside the source code.

## Future Improvements

Potential backend improvements include:

* More comprehensive automated tests
* API documentation using OpenAPI/Swagger
* More granular authorization rules
* Improved validation and error handling
* Request logging and monitoring
* Expanded sharing and access-control functionality
* Real-time collaboration support

## Related Repository

Layer Frontend:

https://github.com/SujalKakatkar/layers

## Author

Sujal Kakatkar

GitHub:

https://github.com/SujalKakatkar
