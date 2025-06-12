
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Target, 
  Zap,
  CheckCircle,
  XCircle,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'opportunity' | 'live_entry' | 'odds_change' | 'match_start';
  title: string;
  message: string;
  match: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'live_entry',
      title: 'Entrada Recomendada - AGORA',
      message: 'EV de +18.5% detectado para Under 4.5 em Palmeiras vs Santos (23\')',
      match: 'Palmeiras vs Santos',
      timestamp: '14:23',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Nova Oportunidade Identificada',
      message: 'Jogo Real Madrid vs Barcelona atingiu probabilidade de 89% para Under 4.5',
      match: 'Real Madrid vs Barcelona',
      timestamp: '13:45',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'odds_change',
      title: 'Mudança de Odds Favorável',
      message: 'Odd Under 4.5 subiu para 1.85 em Manchester City vs Arsenal',
      match: 'Manchester City vs Arsenal',
      timestamp: '13:12',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'match_start',
      title: 'Jogo Iniciando',
      message: 'Bayern Munich vs Dortmund começou - monitoramento ativo',
      match: 'Bayern Munich vs Dortmund',
      timestamp: '12:30',
      isRead: true,
      priority: 'low'
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    browser: true,
    mobile: true,
    liveEntry: true,
    oddsChange: true,
    newOpportunities: true,
    matchStart: false
  });

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'live_entry':
        return <Zap className="h-4 w-4 text-success" />;
      case 'opportunity':
        return <Target className="h-4 w-4 text-primary" />;
      case 'odds_change':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'match_start':
        return <Bell className="h-4 w-4 text-info" />;
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive bg-destructive/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      case 'low':
        return 'border-l-muted bg-muted/5';
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Central de Alertas</h2>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {unreadCount} novos
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Marcar todos como lidos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alertas */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alertas Recentes</CardTitle>
              <CardDescription>
                Notificações sobre oportunidades e mudanças importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 rounded-lg transition-all duration-200 ${getPriorityColor(alert.priority)} ${
                    !alert.isRead ? 'shadow-sm' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${!alert.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {alert.title}
                          </h4>
                          {!alert.isRead && (
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{alert.match}</span>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {alert.priority === 'high' && alert.type === 'live_entry' && (
                        <Button size="sm" className="gradient-success text-white">
                          Ver Jogo
                        </Button>
                      )}
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Configurações de Notificação */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </CardTitle>
              <CardDescription>
                Personalize suas notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canais de Notificação */}
              <div className="space-y-3">
                <h4 className="font-medium">Canais de Notificação</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Navegador Web</span>
                  </div>
                  <Switch
                    checked={notificationSettings.browser}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, browser: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">App Mobile</span>
                  </div>
                  <Switch
                    checked={notificationSettings.mobile}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, mobile: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Tipos de Alerta */}
              <div className="space-y-3">
                <h4 className="font-medium">Tipos de Alerta</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-success" />
                    <span className="text-sm">Entradas ao Vivo</span>
                  </div>
                  <Switch
                    checked={notificationSettings.liveEntry}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, liveEntry: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="text-sm">Mudanças de Odds</span>
                  </div>
                  <Switch
                    checked={notificationSettings.oddsChange}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, oddsChange: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm">Novas Oportunidades</span>
                  </div>
                  <Switch
                    checked={notificationSettings.newOpportunities}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, newOpportunities: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-info" />
                    <span className="text-sm">Início de Jogos</span>
                  </div>
                  <Switch
                    checked={notificationSettings.matchStart}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, matchStart: checked }))
                    }
                  />
                </div>
              </div>

              <Button className="w-full gradient-success text-white">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-success">47</p>
                  <p className="text-xs text-muted-foreground">Alertas este mês</p>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">89%</p>
                  <p className="text-xs text-muted-foreground">Taxa de precisão</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-xl font-bold text-success">+R$ 1,847</p>
                <p className="text-xs text-muted-foreground">Lucro dos alertas seguidos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
