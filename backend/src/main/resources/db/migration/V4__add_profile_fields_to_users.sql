-- =========================================
-- ADD PROFILE FIELDS TO USERS
-- =========================================
ALTER TABLE users
    ADD COLUMN especialidade VARCHAR(255),
    ADD COLUMN bio TEXT,
    ADD COLUMN endereco VARCHAR(255);