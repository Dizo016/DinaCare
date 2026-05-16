-- Passo 1: adiciona a coluna sem NOT NULL para não quebrar com dados existentes
ALTER TABLE procedures
    ADD COLUMN user_id UUID REFERENCES users(id);

-- Passo 2: popula os registros existentes com o primeiro usuário encontrado
UPDATE procedures
SET user_id = (SELECT id FROM users LIMIT 1)
WHERE user_id IS NULL;

-- Passo 3: agora que não há nulos, aplica a restrição NOT NULL
ALTER TABLE procedures
    ALTER COLUMN user_id SET NOT NULL;