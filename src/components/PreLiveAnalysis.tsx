
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Star,
  Calendar,
  BarChart3,
  Filter
} from 'lucide-react';

interface PreLiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  prediction: {
    probability: number;
    confidence: 'high' | 'medium' | 'low';
    expectedGoals: number;
  };
  odds: {
    current: number;
    recommended: number;
    ev: number;
  };
  factors: {
    homeForm: number;
    awayForm: number;
    headToHead: number;
    injuries: number;
    weather: string;
  };
  rating: number;
}

export const PreLiveAnalysis = () => {
  const [selectedTab, setSelectedTab] = useState('today');
  const [matches] = useState<PreLiveMatch[]>([
    {
      id: '1',
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      league: 'La Liga',
      kickoff: '16:00',
      prediction: {
        probability: 89,
        confidence: 'high',
        expectedGoals: 2.3
      },
      odds: {
        current: 1.75,
        recommended: 1.70,
        ev: 18.5
      },
      factors: {
        homeForm: 85,
        awayForm: 72,
        headToHead: 78,
        injuries: 90,
        weather: 'Bom'
      },
      rating: 95
    },
    {
      id: '2',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      kickoff: '14:30',
      prediction: {
        probability: 76,
        confidence: 'medium',
        expectedGoals: 2.8
      },
      odds: {
        current: 1.95,
        recommended: 1.85,
        ev: 12.3
      },
      factors: {
        homeForm: 92,
        awayForm: 88,
        headToHead: 65,
        injuries: 75,
        weather: 'Chuva leve'
      },
      rating: 78
    },
    {
      id: '3',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Dortmund',
      league: 'Bundesliga',
      kickoff: '18:30',
      prediction: {
        probability: 83,
        confidence: 'high',
        expectedGoals: 2.1
      },
      odds: {
        current: 1.68,
        recommended: 1.75,
        ev: 15.7
      },
      factors: {
        homeForm: 94,
        awayForm: 79,
        headToHead: 85,
        injuries: 88,
        weather: 'Ensolarado'
      },
      rating: 87
    }
  ]);

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-success text-success-foreground">Alta Confiança</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Média Confiança</Badge>;
      case 'low':
        return <Badge variant="outline">Baixa Confiança</Badge>;
      default:
        return null;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-success';
    if (rating >= 70) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getEVColor = (ev: number) => {
    if (ev > 15) return 'text-success';
    if (ev > 5) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análise Pré-Live</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Badge variant="outline">
            {matches.length} jogos analisados
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="tomorrow">Amanhã</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="bg-gradient-to-r from-card to-card/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {match.homeTeam} vs {match.awayTeam}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{match.league}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {match.kickoff}
                      </span>
                    </CardDescription>
                  </div>
                  
                  <div className="text-right space-y-2">
                    {getConfidenceBadge(match.prediction.confidence)}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning" />
                      <span className={`font-bold ${getRatingColor(match.rating)}`}>
                        {match.rating}/100
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Predição Principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Probabilidade Under 4.5</p>
                    <p className="text-2xl font-bold text-primary">
                      {match.prediction.probability}%
                    </p>
                    <Progress value={match.prediction.probability} className="mt-2 h-2" />
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Gols Esperados</p>
                    <p className="text-2xl font-bold">
                      {match.prediction.expectedGoals.toFixed(1)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Expected Value</p>
                    <p className={`text-2xl font-bold ${getEVColor(match.odds.ev)}`}>
                      +{match.odds.ev.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Fatores de Análise */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Fatores de Análise
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Forma Casa</span>
                        <span>{match.factors.homeForm}%</span>
                      </div>
                      <Progress value={match.factors.homeForm} className="h-1" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Forma Visitante</span>
                        <span>{match.factors.awayForm}%</span>
                      </div>
                      <Progress value={match.factors.awayForm} className="h-1" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Histórico H2H</span>
                        <span>{match.factors.headToHead}%</span>
                      </div>
                      <Progress value={match.factors.headToHead} className="h-1" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Condição Elenco</span>
                        <span>{match.factors.injuries}%</span>
                      </div>
                      <Progress value={match.factors.injuries} className="h-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Condições Climáticas:</span>
                    <Badge variant="outline">{match.factors.weather}</Badge>
                  </div>
                </div>

                {/* Odds e Recomendação */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Recomendação de Entrada</p>
                    <p className="font-medium">
                      Apostar quando odd ≥ {match.odds.recommended.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Odd atual: {match.odds.current.toFixed(2)}
                    </p>
                  </div>
                  
                  <Button className="gradient-success text-white">
                    <Target className="h-4 w-4 mr-2" />
                    Criar Alerta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tomorrow" className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Análises para amanhã serão disponibilizadas às 20h</p>
        </TabsContent>

        <TabsContent value="week" className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Visão semanal em desenvolvimento</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};
