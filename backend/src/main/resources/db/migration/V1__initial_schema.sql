-- =========================================
-- EXTENSIONS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    entry_time TIME NOT NULL,
    exit_time TIME NOT NULL,
    lunch_start_time TIME,
    lunch_end_time TIME,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================================
-- USER WORK DAYS
-- =========================================
CREATE TABLE user_work_days (
    user_id UUID NOT NULL,
    work_days VARCHAR(20) NOT NULL,

    CONSTRAINT fk_user_work_days_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================
-- CLIENTS
-- =========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    notes TEXT
);

-- =========================================
-- PROCEDURES
-- =========================================
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================================
-- APPOINTMENTS
-- =========================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL,
    client_id UUID NOT NULL,
    procedure_id UUID NOT NULL,

    duration INTEGER NOT NULL,
    appointment_status VARCHAR(50),
    payment_status VARCHAR(50),
    notes TEXT,
    charged_price NUMERIC(10,2) NOT NULL,

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_appointments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_appointments_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id),

    CONSTRAINT fk_appointments_procedure
        FOREIGN KEY (procedure_id)
        REFERENCES procedures(id)
);
