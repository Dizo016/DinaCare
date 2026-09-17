# DinaCare

Web-based appointment management system designed for beauty professionals. The project brings together scheduling, clients, services, authentication, professional profiles, and financial indicators into a single application with a React frontend and a Spring Boot REST API.

## ✨ Features

* JWT-based user authentication
* Professional management
* Client management
* Service management
* Appointment scheduling
* Appointment conflict validation
* Public appointment scheduling without an account
* Available time slot calculation
* Availability calculation based on working days, working hours, and lunch breaks
* Appointment status management
* Payment status management
* Custom charged price for appointments
* Dashboard with scheduling and revenue indicators
* Revenue reports
* Average ticket calculation
* Daily revenue
* Professional profile management
* New appointment notifications through polling
* PostgreSQL persistence
* Database versioning with Flyway
* Docker environment

## 🧱 Project Structure

```text
DinaCare/
├── backend/
├── frontend/
└── docker-compose.yml
```

## 🛠️ Technologies

### Backend

* Java 17
* Spring Boot 4
* Spring Web
* Spring Data JPA
* Hibernate
* Spring Security
* Auth0 Java JWT
* Bean Validation
* PostgreSQL
* Flyway
* Lombok
* Maven
* JUnit
* Spring Boot Test
* H2

### Frontend

* React 19
* Vite
* React Router
* Axios
* Recharts
* React Icons
* ESLint

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL 17

## 🏗️ Architecture

The project is divided into a REST API responsible for business rules and a React application responsible for the user interface.

### Backend

```text
backend/src/main/java/br/com/dinacare/
├── controller/
├── domain/
│   ├── appointment/
│   ├── client/
│   ├── procedure/
│   └── user/
├── infra/
│   ├── exception/
│   └── security/
├── repository/
└── service/
    ├── appointment/
    ├── client/
    ├── procedure/
    └── user/
```

The backend uses DTOs for request and response data, mappers, validation, global exception handling, and stateless JWT authentication.

### Frontend

```text
frontend/src/
├── api/
├── components/
│   ├── Agendamento/
│   ├── Agendamentos/
│   ├── Cadastro/
│   ├── Clientes/
│   ├── Dashboard/
│   ├── HomeLayout/
│   ├── Login/
│   ├── Navbar/
│   ├── Perfil/
│   ├── Procedimentos/
│   ├── Renda/
│   └── Sidebar/
├── contexts/
├── App.jsx
└── main.jsx
```

The frontend uses React Router for navigation, Axios for API communication, and Recharts for data visualization.

## 🔐 Authentication

Authentication is implemented using JWT with stateless sessions.

```text
Login
  ↓
POST /auth/login
  ↓
JWT
  ↓
Frontend stores the token
  ↓
Axios sends Authorization: Bearer <token>
  ↓
JwtAuthFilter validates the token
  ↓
Protected endpoints
```

User passwords are protected using `BCryptPasswordEncoder`.

Public endpoints do not require authentication, while protected endpoints require a valid JWT token.

Some administrative operations are restricted based on user roles.

## 📅 Appointments

The system includes rules for managing and validating appointment schedules.

When creating an appointment, the backend:

1. Locates the professional.
2. Locates the client.
3. Locates the service.
4. Retrieves the service duration.
5. Calculates the appointment end time.
6. Checks for scheduling conflicts.
7. Creates the appointment if the time slot is available.

### Conflict Validation

A new appointment cannot occupy a time interval that conflicts with an existing appointment.

Canceled appointments do not block the time slot.

## 🌐 Public Scheduling

The system allows clients to book appointments without creating an account.

The public page uses the following route:

```text
/agendar/:profissionalId
```

The flow is:

```text
Professional
    ↓
Service
    ↓
Date
    ↓
Available time
    ↓
Client information
    ↓
Confirmation
```

The client can view the professional's available services, select a date and time, provide their information, and confirm the appointment.

Endpoints:

```http
GET /appointments/public/{userId}/available-slots
```

```http
POST /appointments/public
```

## ⏰ Availability

Available time slots are calculated based on:

* Professional working days
* Start time
* End time
* Lunch break
* Service duration
* Existing appointments
* Canceled appointments

This prevents the system from displaying time slots that are incompatible with the professional's working schedule or existing appointments.

## 👥 Clients

The system provides client management features, including:

* Client registration
* Client listing
* Client search by name
* Client updates
* Client deactivation

Deactivated clients remain stored in the database in order to preserve appointment history.

## 💇 Services

Services contain information such as:

* Name
* Description
* Duration
* Price
* Status

They can be used both for appointments created inside the application and for the public scheduling flow.

## 👤 Professional Profile

Professionals can manage profile information such as:

* Name
* Specialty
* Biography
* Address

These details can also be displayed as part of the public scheduling experience.

## 📊 Dashboard

The dashboard provides operational and financial indicators.

Available indicators include:

* Daily appointments
* Monthly revenue
* Number of clients
* Completion rate
* Revenue from the last six months
* Most performed service
* Client with the highest number of appointments
* Best revenue day
* Upcoming appointments

Charts are rendered using Recharts.

## 💰 Revenue Report

The revenue section provides financial information about completed appointments.

Available data includes:

* Total revenue
* Number of paid and completed appointments
* Average ticket
* Daily revenue

Revenue only considers appointments that have both statuses:

```text
appointmentStatus = COMPLETED
paymentStatus     = PAID
```

## 🗄️ Database

PostgreSQL is used as the main database.

The database schema is versioned using Flyway.

Migrations are organized as follows:

```text
db/migration/
├── V1__initial_schema.sql
├── V2__add_active_to_clients.sql
├── V3__add_user_id_to_procedures.sql
└── V4__add_profile_fields_to_users.sql
```

Hibernate uses:

```text
ddl-auto: validate
```

This allows Hibernate to validate the existing schema while Flyway is responsible for database versioning and schema evolution.

### Main Relationships

```text
users
  │
  ├── user_work_days
  │
  └── procedures
         │
         └── appointments
                ├── clients
                └── users
```

## 🐳 Docker

The project includes Docker and Docker Compose configuration for running the application and PostgreSQL database.

The main environment can be represented as:

```text
Backend
   │
   ▼
Spring Boot
   │
   ▼
PostgreSQL
```

### Environment Variables

Example root `.env` configuration:

```env
DB_NAME=dinacare
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Backend configuration:

```env
DB_URL=jdbc:postgresql://postgres:5432/dinacare
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

## 🚀 Running with Docker

From the project root:

```bash
docker compose up --build
```

To run in detached mode:

```bash
docker compose up --build -d
```

To stop the containers:

```bash
docker compose down
```

To remove the volumes:

```bash
docker compose down -v
```

> **Warning:** `docker compose down -v` removes the associated volumes and may delete persisted database data.

## 💻 Running Without Docker

To run the project without Docker, PostgreSQL must be installed locally.

Create a database named:

```text
dinacare
```

Configure the backend environment variables:

```env
DB_URL=jdbc:postgresql://localhost:5432/dinacare
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
```

### Backend

Linux/macOS:

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

The API will be available at:

```text
http://localhost:8080
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

Configure the API URL in `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

## 🔌 Endpoints

### Authentication

| Method | Endpoint      | Access        |
| ------ | ------------- | ------------- |
| POST   | `/auth/login` | Public        |
| GET    | `/auth/me`    | Authenticated |

### Users

| Method | Endpoint                   | Access        |
| ------ | -------------------------- | ------------- |
| POST   | `/users`                   | Public        |
| GET    | `/users/{id}`              | Public        |
| GET    | `/users`                   | Admin         |
| GET    | `/users/role/{role}`       | Admin         |
| GET    | `/users/workday/{workDay}` | Admin         |
| PUT    | `/users/{id}`              | Admin         |
| PATCH  | `/users/{id}/profile`      | Authenticated |
| DELETE | `/users/{id}`              | Admin         |

### Clients

| Method | Endpoint                      | Access        |
| ------ | ----------------------------- | ------------- |
| POST   | `/clients`                    | Authenticated |
| GET    | `/clients`                    | Authenticated |
| GET    | `/clients/{id}`               | Authenticated |
| GET    | `/clients/search?name={name}` | Authenticated |
| PUT    | `/clients/{id}`               | Authenticated |
| DELETE | `/clients/{id}`               | Authenticated |

### Services

| Method | Endpoint                      | Access        |
| ------ | ----------------------------- | ------------- |
| GET    | `/procedures/public/{userId}` | Public        |
| POST   | `/procedures`                 | Authenticated |
| GET    | `/procedures`                 | Authenticated |
| GET    | `/procedures/{id}`            | Authenticated |
| PUT    | `/procedures/{id}`            | Authenticated |
| DELETE | `/procedures/{id}`            | Authenticated |

### Appointments

| Method | Endpoint                                        | Access        |
| ------ | ----------------------------------------------- | ------------- |
| POST   | `/appointments`                                 | Authenticated |
| GET    | `/appointments/user/{userId}?date={date}`       | Authenticated |
| GET    | `/appointments/user/{userId}/all`               | Authenticated |
| GET    | `/appointments/user/{userId}/clients`           | Authenticated |
| GET    | `/appointments/user/{userId}/pending-count`     | Authenticated |
| GET    | `/appointments/client/{clientId}`               | Authenticated |
| PATCH  | `/appointments/{id}/status`                     | Authenticated |
| PATCH  | `/appointments/{id}/payment`                    | Authenticated |
| PATCH  | `/appointments/{id}/charged-price`              | Authenticated |
| PATCH  | `/appointments/{id}/cancel`                     | Authenticated |
| GET    | `/appointments/user/{userId}/revenue`           | Authenticated |
| GET    | `/appointments/user/{userId}/dashboard`         | Authenticated |
| POST   | `/appointments/public`                          | Public        |
| GET    | `/appointments/public/{userId}/available-slots` | Public        |

## 🧪 Tests

The backend uses:

* JUnit
* Spring Boot Test
* H2

Run the tests with:

```bash
cd backend
./mvnw test
```

On Windows:

```bash
cd backend
mvnw.cmd test
```

The test suite covers different parts of the application, including controllers and services related to clients, services, and appointments.

## 🔔 Notifications

The frontend uses polling to check for new appointments.

This allows new appointments to be detected by the interface without requiring the user to manually refresh the page.

## 🧩 Layer Responsibilities

### Controller

Responsible for:

* Receiving HTTP requests
* Validating input
* Delegating operations to services
* Returning API responses

### Service

Responsible for business rules, including:

* Appointment creation
* Conflict validation
* Client management
* Service management
* Availability calculation
* Financial indicators

### Repository

Responsible for data access through Spring Data JPA.

### Domain

Contains entities and structures related to the application's domain.

### DTO

Defines the input and output data of the API, avoiding direct exposure of domain entities.

### Security

Responsible for:

* Authentication
* Authorization
* JWT generation
* Token validation
* Endpoint protection
* Role-based access control

### Exception

Responsible for handling and standardizing API exceptions.

### Migration

Responsible for database schema versioning through Flyway.

## 📐 Practices

The project applies concepts and practices such as:

* Layered architecture
* Separation of responsibilities
* DTOs
* Entity mapping
* Data validation
* Global exception handling
* Stateless authentication
* Role-based authorization
* Versioned database migrations
* Automated testing
* Containerization
* Environment-based configuration
* REST API integration between frontend and backend

## 🔄 Application Flow

```text
                         DinaCare
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
         Frontend                       Backend
          React                       Spring Boot
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                         REST API
                            │
                            ▼
                       PostgreSQL
```

### Authenticated Flow

```text
User
 ↓
Login
 ↓
JWT
 ↓
Authenticated area
 ↓
Clients / Services / Appointments
 ↓
Dashboard / Reports
```

### Public Flow

```text
Client
 ↓
Public page
 ↓
Professional
 ↓
Service
 ↓
Date
 ↓
Available time
 ↓
Client information
 ↓
Confirmation
 ↓
Appointment
```

## 📌 Status

Project under development, with authentication, client and service management, appointment scheduling, availability calculation, public scheduling, dashboard, and financial reporting implemented.

## 📄 License

This project was developed for study and portfolio purposes.
