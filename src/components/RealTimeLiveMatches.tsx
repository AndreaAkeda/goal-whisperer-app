
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealTimeMatches } from '@/hooks/useRealTimeMatches';
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

const MatchCard = ({ match }: { match: MatchWithAnalysis }) => {
  const analysis = match.match_analysis?.[0];
  const metrics = match.match_metrics?.[0];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-info" />
            <Badge variant="secondary" className="bg-info/10 text-info">
              {match.minute}'
            </Badge>
            <span className="text-sm text-muted-foreground">{match.league}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {match.score_home} - {match.score_away}
            </div>
            <div className="text-xs text-muted-foreground">
              Total: {match.total_goals} gols
            </div>
          </div>
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
                <p className="text-sm font-medium">Expected Value</p>
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
                <p className="text-xs text-muted-foreground">Rating</p>
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

export const RealTimeLiveMatches = () => {
  const { data: liveMatches = [], isLoading, error, isError, refreshMatches, isRefreshing } = useRealTimeMatches();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <WifiOff className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-destructive font-medium">Erro ao carregar jogos ao vivo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Verifique sua conexão ou tente novamente
              </p>
            </div>
            <Button onClick={refreshMatches} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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

  if (liveMatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum jogo ao vivo</CardTitle>
          <p className="text-muted-foreground mb-4">
            Não há jogos das principais ligas europeias acontecendo no momento.
          </p>
          <Button onClick={refreshMatches} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Verificar Jogos'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-success" />
            Jogos ao Vivo (Dados Reais)
          </h3>
          <p className="text-sm text-muted-foreground">
            {liveMatches.length} jogo(s) em andamento • Atualização automática
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshMatches}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};
