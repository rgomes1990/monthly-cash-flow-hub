-- Create table for FLUT subscription management
CREATE TABLE public.flut_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  monthly_value NUMERIC NOT NULL,
  month_year DATE NOT NULL, -- Format: YYYY-MM-01 (first day of month)
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flut_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on flut_subscriptions" 
ON public.flut_subscriptions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_flut_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_flut_subscriptions_updated_at
BEFORE UPDATE ON public.flut_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_flut_subscriptions_updated_at();