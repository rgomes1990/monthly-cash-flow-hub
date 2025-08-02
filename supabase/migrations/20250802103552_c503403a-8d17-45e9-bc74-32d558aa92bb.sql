-- Create flix_subscriptions table (clone of flut_subscriptions)
CREATE TABLE public.flix_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  monthly_value NUMERIC NOT NULL,
  month_year DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flix_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (same as flut_subscriptions)
CREATE POLICY "Allow all operations on flix_subscriptions" 
ON public.flix_subscriptions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_flix_subscriptions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_flix_subscriptions_updated_at
BEFORE UPDATE ON public.flix_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_flix_subscriptions_updated_at_column();