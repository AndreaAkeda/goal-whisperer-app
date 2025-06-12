
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  minute: number;
  score: string;
  xG: {
    home: number;
    away: number;
  };
  dangerousAttacks: number;
  possession: {
    home: number;
    away: number;
  };
  currentOdds: number;
  recommendedOdds: number;
  ev: number;
  status: 'monitor' | 'enter' | 'avoid' | 'entered';
  probability: number;
}

export const LiveMonitoring = () => {
  const [matches, setMatches] = useState<LiveMatch[]>([
    {
      id: '1',
      homeTeam: 'Palmeiras',
      awayTeam: 'Santos',
      minute: 23,
      score: '0-0',
      xG: { home: 0.8, away: 0.3 },
      dangerousAttacks: 4,
      possession: { home: 62, away: 38 },
      currentOdds: 1.85,
      recommendedOdds: 1.80,
      ev: 15.2,
      status: 'enter',
      probability: 82
    },
    {
      id: '2',
      homeTeam: 'Flamengo',
      awayTeam: 'Vasco',
      minute: 67,
      score: '1-1',
      xG: { home: 1.9, away: 1.4 },
      dangerousAttacks: 12,
      possession: { home: 58, away: 42 },
      currentOdds: 2.10,
      recommendedOdds: 1.95,
      ev: 8.7,
      status: 'monitor',
      probability: 76
    },
    {
      id: '3',
      homeTeam: 'Corinthians',
      awayTeam: 'São Paulo',
      minute: 89,
      score: '2-1',
      xG: { home: 2.3, away: 1.8 },
      dangerousAttacks: 18,
      possession: { home: 55, away: 45 },
      currentOdds: 1.25,
      recommendedOdds: 1.40,
      ev: -12.3,
      status: 'avoid',
      probability: 45
    }
  ]);

  const getStatusBadge = (status: LiveMatch['status']) => {
    switch (status) {
      case 'enter':
        return (
          <Badge className="bg-success text-success-foreground">
            <Zap className="h-3 w-3 mr-1" />
            ENTRAR AGORA
          </Badge>
        );
      case 'monitor':
        return (
          <Badge variant="outline" className="border-warning text-warning">
            <Clock className="h-3 w-3 mr-1" />
            Monitorar
          </Badge>
        );
      case 'avoid':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Evitar
          </Badge>
        );
      case 'entered':
        return (
          <Badge className="bg-info text-info-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Posição Ativa
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEVColor = (ev: number) => {
    if (ev > 10) return 'text-success';
    if (ev > 0) return 'text-warning';
    return 'text-destructive';
  };

  useEffect(() => {
    // Simula atualizações em tempo real
    const interval = setInterval(() => {
      setMatches(prev => prev.map(match => ({
        ...match,
        minute: match.minute < 90 ? match.minute + 1 : match.minute,
        xG: {
          home: Math.max(0, match.xG.home + (Math.random() - 0.5) * 0.1),
          away: Math.max(0, match.xG.away + (Math.random() - 0.5) * 0.1)
        },
        currentOdds: match.currentOdds + (Math.random() - 0.5) * 0.05,
        ev: match.ev + (Math.random() - 0.5) * 2
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monitoramento Ao Vivo</h2>
        <Badge variant="outline" className="animate-pulse-slow">
          <Play className="h-3 w-3 mr-1" />
          {matches.length} jogos ativos
        </Badge>
      </div>

      <div className="grid gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="bg-gradient-to-r from-card to-card/50 border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {match.homeTeam} vs {match.awayTeam}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{match.minute}'</Badge>
                    <span className="font-bold text-lg">{match.score}</span>
                  </CardDescription>
                </div>
                {getStatusBadge(match.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Métricas principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">xG Total</p>
                  <p className="text-xl font-bold">
                    {(match.xG.home + match.xG.away).toFixed(1)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ataques Perigosos</p>
                  <p className="text-xl font-bold">{match.dangerousAttacks}</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Odd Atual</p>
                  <p className="text-xl font-bold">{match.currentOdds.toFixed(2)}</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">EV</p>
                  <p className={`text-xl font-bold ${getEVColor(match.ev)}`}>
                    {match.ev > 0 ? '+' : ''}{match.ev.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Probabilidade */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Probabilidade Under 4.5</span>
                  <span className="font-medium">{match.probability}%</span>
                </div>
                <Progress value={match.probability} className="h-2" />
              </div>

              {/* Posse de bola */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Posse de Bola</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs w-16">{match.homeTeam.slice(0, 3)}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${match.possession.home}%` }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right">{match.possession.home}%</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                {match.status === 'enter' && (
                  <Button className="gradient-success text-white flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Entrar na Aposta
                  </Button>
                )}
                
                {match.status === 'monitor' && (
                  <Button variant="outline" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Continuar Monitorando
                  </Button>
                )}
                
                {match.status === 'avoid' && (
                  <Button variant="outline" className="flex-1" disabled>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    EV Negativo - Evitar
                  </Button>
                )}

                <Button variant="ghost" size="sm">
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
