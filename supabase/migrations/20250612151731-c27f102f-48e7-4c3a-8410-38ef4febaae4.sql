
-- Criar tabela para armazenar jogos e suas análises
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  league TEXT NOT NULL,
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, live, finished
  minute INTEGER DEFAULT 0,
  score_home INTEGER DEFAULT 0,
  score_away INTEGER DEFAULT 0,
  total_goals INTEGER GENERATED ALWAYS AS (score_home + score_away) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para métricas dos jogos
CREATE TABLE public.match_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  xg_home DECIMAL(3,2) DEFAULT 0,
  xg_away DECIMAL(3,2) DEFAULT 0,
  xg_total DECIMAL(3,2) GENERATED ALWAYS AS (xg_home + xg_away) STORED,
  dangerous_attacks INTEGER DEFAULT 0,
  possession_home INTEGER DEFAULT 50,
  possession_away INTEGER DEFAULT 50,
  shots_home INTEGER DEFAULT 0,
  shots_away INTEGER DEFAULT 0,
  shots_on_target_home INTEGER DEFAULT 0,
  shots_on_target_away INTEGER DEFAULT 0,
  corners_home INTEGER DEFAULT 0,
  corners_away INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para odds e análises
CREATE TABLE public.match_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  under_45_probability DECIMAL(5,2) NOT NULL, -- Probabilidade em %
  current_odds DECIMAL(4,2) NOT NULL,
  recommended_odds DECIMAL(4,2) NOT NULL,
  ev_percentage DECIMAL(5,2) NOT NULL, -- Expected Value em %
  confidence_level TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  recommendation TEXT NOT NULL DEFAULT 'monitor', -- enter, monitor, avoid
  home_form_score INTEGER DEFAULT 50,
  away_form_score INTEGER DEFAULT 50,
  head_to_head_score INTEGER DEFAULT 50,
  injury_impact_score INTEGER DEFAULT 100,
  weather_condition TEXT DEFAULT 'good',
  rating INTEGER DEFAULT 50, -- Rating geral de 0 a 100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para alertas
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- live_entry, opportunity, odds_change, match_start
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_kickoff ON public.matches(kickoff_time);
CREATE INDEX idx_alerts_unread ON public.alerts(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_match_analysis_ev ON public.match_analysis(ev_percentage DESC);

-- Habilitar Row Level Security (mas permitir acesso total já que não há autenticação)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Criar políticas que permitem acesso total (sem autenticação)
CREATE POLICY "Allow all access to matches" ON public.matches FOR ALL USING (true);
CREATE POLICY "Allow all access to match_metrics" ON public.match_metrics FOR ALL USING (true);
CREATE POLICY "Allow all access to match_analysis" ON public.match_analysis FOR ALL USING (true);
CREATE POLICY "Allow all access to alerts" ON public.alerts FOR ALL USING (true);

-- Inserir alguns dados de exemplo
INSERT INTO public.matches (home_team, away_team, league, kickoff_time, status, minute, score_home, score_away) VALUES
('Palmeiras', 'Santos', 'Brasileirão', NOW() + INTERVAL '30 minutes', 'live', 23, 0, 0),
('Flamengo', 'Vasco', 'Brasileirão', NOW() + INTERVAL '2 hours', 'live', 67, 1, 1),
('Corinthians', 'São Paulo', 'Brasileirão', NOW() + INTERVAL '3 hours', 'live', 89, 2, 1),
('Real Madrid', 'Barcelona', 'La Liga', NOW() + INTERVAL '5 hours', 'scheduled', 0, 0, 0),
('Manchester City', 'Arsenal', 'Premier League', NOW() + INTERVAL '6 hours', 'scheduled', 0, 0, 0);

-- Inserir métricas de exemplo
INSERT INTO public.match_metrics (match_id, xg_home, xg_away, dangerous_attacks, possession_home, possession_away) 
SELECT id, 0.8, 0.3, 4, 62, 38 FROM public.matches WHERE home_team = 'Palmeiras';

INSERT INTO public.match_metrics (match_id, xg_home, xg_away, dangerous_attacks, possession_home, possession_away) 
SELECT id, 1.9, 1.4, 12, 58, 42 FROM public.matches WHERE home_team = 'Flamengo';

INSERT INTO public.match_metrics (match_id, xg_home, xg_away, dangerous_attacks, possession_home, possession_away) 
SELECT id, 2.3, 1.8, 18, 55, 45 FROM public.matches WHERE home_team = 'Corinthians';

-- Inserir análises de exemplo
INSERT INTO public.match_analysis (match_id, under_45_probability, current_odds, recommended_odds, ev_percentage, confidence_level, recommendation, rating)
SELECT id, 82.0, 1.85, 1.80, 15.2, 'high', 'enter', 95 FROM public.matches WHERE home_team = 'Palmeiras';

INSERT INTO public.match_analysis (match_id, under_45_probability, current_odds, recommended_odds, ev_percentage, confidence_level, recommendation, rating)
SELECT id, 76.0, 2.10, 1.95, 8.7, 'medium', 'monitor', 78 FROM public.matches WHERE home_team = 'Flamengo';

INSERT INTO public.match_analysis (match_id, under_45_probability, current_odds, recommended_odds, ev_percentage, confidence_level, recommendation, rating)
SELECT id, 45.0, 1.25, 1.40, -12.3, 'low', 'avoid', 45 FROM public.matches WHERE home_team = 'Corinthians';
