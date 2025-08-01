-- Inserir as mensalidades de Junho 2024 também em Maio 2024
INSERT INTO flut_subscriptions (client_name, monthly_value, month_year)
SELECT client_name, monthly_value, '2024-05-01'
FROM flut_subscriptions 
WHERE month_year = '2024-06-01' 
AND (client_name = 'e-cat' OR client_name = 'Rainha Decor');