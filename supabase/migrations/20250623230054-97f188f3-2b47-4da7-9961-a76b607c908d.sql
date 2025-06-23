
-- Create expenses table to store all expense data
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'installment', 'casual')),
  expense_category TEXT NOT NULL CHECK (expense_category IN ('personal', 'company')),
  date DATE NOT NULL,
  description TEXT,
  paid BOOLEAN DEFAULT false,
  installment_total INTEGER,
  installment_current INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_expenses_type ON public.expenses(type);
CREATE INDEX idx_expenses_category ON public.expenses(expense_category);
CREATE INDEX idx_expenses_date ON public.expenses(date);

-- Enable Row Level Security (making it public for now since no authentication is implemented)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations (since no auth is implemented yet)
CREATE POLICY "Allow all operations on expenses" 
  ON public.expenses 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
