-- Make user.data_nascimento optional (nullable)
-- This aligns DB with Prisma schema (DateTime?) and mobile flow (dataNascimento opcional).

ALTER TABLE "users"
  ALTER COLUMN "data_nascimento" DROP NOT NULL;
