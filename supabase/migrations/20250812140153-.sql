-- Add active status field to players table
ALTER TABLE public.players 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;