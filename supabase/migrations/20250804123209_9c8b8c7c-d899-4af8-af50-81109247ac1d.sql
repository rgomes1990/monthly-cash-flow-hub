-- Make description column nullable in cash_flow table
ALTER TABLE public.cash_flow 
ALTER COLUMN description DROP NOT NULL;