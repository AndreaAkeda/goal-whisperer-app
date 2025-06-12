
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check,
  AlertTriangle,
  Info,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAlerts, useMarkAlertAsRead } from '@/hooks/useAlerts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Alert } from '@/hooks/useAlerts';

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'live_entry':
      return <TrendingUp className="h-4 w-4 text-success" />;
    case 'opportunity':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'odds_change':
      return <Info className="h-4 w-4 text-info" />;
    case 'match_start':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">Alta</Badge>;
    case 'medium':
      return <Badge variant="outline">Média</Badge>;
    case 'low':
      return <Badge variant="secondary">Baixa</Badge>;
    default:
      return <Badge variant="outline">Média</Badge>;
  }
};

const AlertCard = ({ alert }: { alert: Alert }) => {
  const markAsRead = useMarkAlertAsRead();

  const handleMarkAsRead = () => {
    if (!alert.is_read) {
      markAsRead.mutate(alert.id);
    }
  };

  return (
    <Card className={`${!alert.is_read ? 'border-primary/50 bg-primary/5' : 'opacity-75'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.alert_type)}
            <div>
              <CardTitle className="text-base">{alert.title}</CardTitle>
              <CardDescription className="mt-1">
                {alert.message}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(alert.priority)}
            {!alert.is_read && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsRead}
                disabled={markAsRead.isPending}
              >
                <Check className="h-3 w-3 mr-1" />
                Marcar como lido
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </span>
          {alert.is_read && (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Lido
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const AlertsList = () => {
  const { data: alerts = [], isLoading, error } = useAlerts();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive mb-2" />
          <p className="text-destructive">Erro ao carregar alertas</p>
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
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Nenhum alerta</CardTitle>
          <p className="text-muted-foreground">
            Você não possui alertas no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.is_read);
  const readAlerts = alerts.filter(alert => alert.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Central de Alertas</h3>
          <p className="text-sm text-muted-foreground">
            {unreadAlerts.length} não lido(s) • {alerts.length} total
          </p>
        </div>
      </div>

      {unreadAlerts.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-primary">Não Lidos</h4>
          {unreadAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {readAlerts.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-muted-foreground">Lidos</h4>
          {readAlerts.slice(0, 10).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
          {readAlerts.length > 10 && (
            <p className="text-center text-sm text-muted-foreground">
              E mais {readAlerts.length - 10} alertas...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
