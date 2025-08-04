-- Add title column to cash_flow table
ALTER TABLE public.cash_flow 
ADD COLUMN title TEXT NOT NULL DEFAULT '';