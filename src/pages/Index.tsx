
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Bell, 
  Activity,
  BarChart3,
  Calculator,
  Zap
} from 'lucide-react';
import { LiveMatches } from '@/components/LiveMatches';
import { PreLiveMatches } from '@/components/PreLiveMatches';
import { EVCalculator } from '@/components/EVCalculator';
import { AlertsList } from '@/components/AlertsList';
import { useUnreadAlerts } from '@/hooks/useAlerts';
import { useLiveMatches } from '@/hooks/useMatches';

const Index = () => {
  const [totalProfit, setTotalProfit] = useState(2847.50);
  
  const { data: unreadAlerts = [] } = useUnreadAlerts();
  const { data: liveMatches = [] } = useLiveMatches();

  // Calcular estatísticas das análises
  const todayPredictions = liveMatches.length + 7; // Simulado
  const activeMatches = liveMatches.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Packball Analytics
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Análise inteligente para apostas Under 4.5 Gols
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4 mr-2" />
              Alertas
              {unreadAlerts.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive">
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Lucro Total</p>
              <p className="text-xl font-bold text-success">
                R$ {totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Previsões Hoje</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayPredictions}</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 vs ontem
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-info/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogos Ativos</CardTitle>
              <Activity className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMatches}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Monitorando agora
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
              <BarChart3 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.5%</div>
              <p className="text-xs text-success flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.2% este mês
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EV Médio</CardTitle>
              <Calculator className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.3%</div>
              <p className="text-xs text-warning flex items-center mt-1">
                <Zap className="h-3 w-3 mr-1" />
                Valor positivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Ao Vivo</span>
            </TabsTrigger>
            <TabsTrigger value="prelive" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Pré-Live</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
              {unreadAlerts.length > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <LiveMatches />
          </TabsContent>

          <TabsContent value="prelive" className="space-y-6">
            <PreLiveMatches />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <EVCalculator />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
