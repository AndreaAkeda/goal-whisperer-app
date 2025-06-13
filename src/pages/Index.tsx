
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Calendar, 
  Calculator,
  Bell,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Search
} from 'lucide-react';
import { RealTimeLiveMatches } from '@/components/RealTimeLiveMatches';
import { PreLiveMatches } from '@/components/PreLiveMatches';
import { EVCalculator } from '@/components/EVCalculator';
import { AlertsList } from '@/components/AlertsList';
import { AlertsBanner } from '@/components/AlertsBanner';
import { ManualMatchSearch } from '@/components/ManualMatchSearch';
import { useUnreadAlerts } from '@/hooks/useAlerts';

const Index = () => {
  const [activeTab, setActiveTab] = useState('live');
  const { data: unreadAlerts = [] } = useUnreadAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
            FutDea Under 3,5 Pro
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema avançado de análise para apostas Under 3.5 gols com dados em tempo real e alertas automáticos
          </p>
        </div>

        {/* Alertas Banner */}
        <AlertsBanner />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ao Vivo
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="pre-live" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pré-Live
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora EV
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas
              {unreadAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <RealTimeLiveMatches />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <ManualMatchSearch />
          </TabsContent>

          <TabsContent value="pre-live" className="space-y-6">
            <PreLiveMatches />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <EVCalculator />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsList />
          </TabsContent>
        </Tabs>

        {/* Sistema de Alertas Info */}
        <Card className="mt-8 border-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-info" />
              Sistema de Alertas Automáticos
            </CardTitle>
            <CardDescription>
              Como funcionam os alertas automáticos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Alertas de Oportunidade
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• EV positivo alto (&gt;10%)</li>
                  <li>• Novas oportunidades de entrada</li>
                  <li>• Melhoria significativa no EV</li>
                  <li>• Alta probabilidade com EV positivo</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-warning" />
                  Alertas de Mudança
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mudanças significativas de odds (&gt;5%)</li>
                  <li>• Alterações na recomendação</li>
                  <li>• Mudanças na probabilidade</li>
                  <li>• Novos jogos detectados</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">
                <strong>📡 Atualização Automática:</strong> Os alertas são gerados automaticamente a cada minuto 
                quando a função detecta mudanças nos jogos ao vivo. Você será notificado em tempo real sobre 
                as melhores oportunidades!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
