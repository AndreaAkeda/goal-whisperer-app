
-- Adicionar coluna external_id na tabela matches para armazenar o ID da API
ALTER TABLE public.matches 
ADD COLUMN external_id text;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX idx_matches_external_id ON public.matches(external_id);
