-- Criar tabela para controle de fluxo de caixa
CREATE TABLE public.cash_flow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_year DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações
CREATE POLICY "Allow all operations on cash_flow" 
ON public.cash_flow 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_cash_flow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_cash_flow_updated_at
  BEFORE UPDATE ON public.cash_flow
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_flow_updated_at();