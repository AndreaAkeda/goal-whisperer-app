
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Target, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MatchWithAnalysis } from '@/hooks/useMatches';

const getRecommendationBadge = (recommendation: string) => {
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
          <AlertTriangle className="h-3 w-3 mr-1" />
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

const ScheduledMatchCard = ({ match }: { match: MatchWithAnalysis }) => {
  const analysis = match.match_analysis?.[0];
  const kickoffTime = new Date(match.kickoff_time);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-muted">
            {match.league}
          </Badge>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {format(kickoffTime, 'HH:mm', { locale: ptBR })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(kickoffTime, 'dd/MM', { locale: ptBR })}
            </div>
          </div>
        </div>
        <CardTitle className="text-center text-lg">
          {match.home_team} vs {match.away_team}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {analysis ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Valor Esperado</p>
                <p className={`text-lg font-bold ${getEVColor(Number(analysis.ev_percentage))}`}>
                  {Number(analysis.ev_percentage) > 0 ? '+' : ''}{Number(analysis.ev_percentage).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Prob. Under 4.5</p>
                <p className="text-lg font-bold">{Number(analysis.under_45_probability).toFixed(0)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Odd</p>
                <p className="font-bold">{Number(analysis.current_odds).toFixed(2)}</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Nota</p>
                <p className="font-bold">{analysis.rating}/100</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <p className="text-xs text-muted-foreground">Conf.</p>
                <p className="font-bold capitalize">{analysis.confidence_level === 'high' ? 'Alta' : analysis.confidence_level === 'medium' ? 'Média' : 'Baixa'}</p>
              </div>
            </div>

            <div className="flex justify-center">
              {getRecommendationBadge(analysis.recommendation)}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Análise não disponível</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-3 w-3 mr-1" />
              Adicionar Análise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PreLiveMatches = () => {
  const { data: matches = [], isLoading, error } = useMatches();

  // Filtrar jogos programados (não ao vivo)
  const scheduledMatches = matches.filter(match => 
    match.status === 'scheduled' || 
    (match.status !== 'live' && new Date(match.kickoff_time) > new Date())
  );

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-destructive">Erro ao carregar jogos programados</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (scheduledMatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum jogo programado</CardTitle>
          <p className="text-muted-foreground">
            Não há jogos programados para análise no momento.
          </p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Jogo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Jogos Programados</h3>
          <p className="text-sm text-muted-foreground">
            {scheduledMatches.length} jogo(s) para análise
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Jogo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduledMatches.map((match) => (
          <ScheduledMatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
