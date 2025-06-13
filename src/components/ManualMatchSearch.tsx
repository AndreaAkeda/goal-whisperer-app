
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { MatchWithAnalysis } from '@/hooks/useMatches';

const getRecommendationBadge = (recommendation: string, evPercentage: number) => {
  switch (recommendation) {
    case 'enter':
      return (
        <Badge className="bg-success text-success-foreground">
          <CheckCircle className="h-3 w-3 mr-1" />
          APOSTAR
        </Badge>
      );
    case 'avoid':
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          EVITAR
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Target className="h-3 w-3 mr-1" />
          MONITORAR
        </Badge>
      );
  }
};

const getEVColor = (evPercentage: number) => {
  if (evPercentage > 5) return 'text-success';
  if (evPercentage < -5) return 'text-destructive';
  return 'text-warning';
};

const MatchCard = ({ match }: { match: MatchWithAnalysis }) => {
  const analysis = match.match_analysis?.[0];
  const metrics = match.match_metrics?.[0];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {match.status === 'live' ? `${match.minute}'` : 'Agendado'}
            </Badge>
            <span className="text-sm text-muted-foreground">{match.league}</span>
          </div>
          {match.status === 'live' && (
            <div className="text-right">
              <div className="text-lg font-bold">
                {match.score_home} - {match.score_away}
              </div>
              <div className="text-xs text-muted-foreground">
                Total: {match.total_goals} gols
              </div>
            </div>
          )}
        </div>
        <div className="text-center">
          <CardTitle className="text-lg">
            {match.home_team} vs {match.away_team}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {analysis && (
          <>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Valor Esperado</p>
                <p className={`text-xl font-bold ${getEVColor(Number(analysis.ev_percentage))}`}>
                  {Number(analysis.ev_percentage) > 0 ? '+' : ''}{Number(analysis.ev_percentage).toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Prob. Under 4.5</p>
                <p className="text-lg font-bold">{Number(analysis.under_45_probability).toFixed(0)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Odd Atual</p>
                <p className="font-bold">{Number(analysis.current_odds).toFixed(2)}</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Nota</p>
                <p className="font-bold">{analysis.rating}/100</p>
              </div>
            </div>

            <div className="flex justify-center">
              {getRecommendationBadge(analysis.recommendation, Number(analysis.ev_percentage))}
            </div>
          </>
        )}

        {metrics && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>xG: {Number(metrics.xg_home).toFixed(1)} - {Number(metrics.xg_away).toFixed(1)}</span>
              <span className="font-mono">Total: {Number(metrics.xg_total).toFixed(1)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Posse: {metrics.possession_home}% - {metrics.possession_away}%</span>
              <span>Ataques: {metrics.dangerous_attacks}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ManualMatchSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<MatchWithAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMatches = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      console.log('🔍 Buscando jogos com termo:', searchTerm);
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_analysis(*),
          match_metrics(*)
        `)
        .or(`home_team.ilike.%${searchTerm}%,away_team.ilike.%${searchTerm}%,league.ilike.%${searchTerm}%`)
        .order('kickoff_time', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Erro ao buscar jogos:', error);
        throw error;
      }

      console.log('✅ Jogos encontrados:', data?.length || 0);
      setMatches(data as MatchWithAnalysis[] || []);
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMatches();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Manual de Jogos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome de um time, liga ou país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={searchMatches} 
              disabled={isLoading || !searchTerm.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>💡 <strong>Dicas de busca:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Digite o nome de qualquer time (ex: "Barcelona", "Real Madrid")</li>
              <li>Busque por liga (ex: "Premier League", "La Liga")</li>
              <li>Procure por país (ex: "England", "Spain")</li>
              <li>Use termos parciais (ex: "Real" encontrará "Real Madrid")</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Resultados da Busca
            </h3>
            <Badge variant="secondary">
              {matches.length} jogo(s) encontrado(s)
            </Badge>
          </div>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum jogo encontrado</h3>
                <p className="text-muted-foreground">
                  Tente buscar com outros termos ou verifique se digitou corretamente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
