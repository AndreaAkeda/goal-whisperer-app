
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell,
  X,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useUnreadAlerts, useMarkAlertAsRead } from '@/hooks/useAlerts';
import type { Alert as AlertType } from '@/hooks/useAlerts';

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'high_ev':
    case 'ev_improvement':
      return <TrendingUp className="h-4 w-4" />;
    case 'entry_opportunity':
      return <Target className="h-4 w-4" />;
    case 'odds_change':
      return <AlertTriangle className="h-4 w-4" />;
    case 'high_probability':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-destructive bg-destructive/5';
    case 'medium':
      return 'border-l-warning bg-warning/5';
    case 'low':
      return 'border-l-info bg-info/5';
    default:
      return 'border-l-muted bg-muted/5';
  }
};

const AlertCard = ({ alert, onDismiss }: { alert: AlertType; onDismiss: (id: string) => void }) => {
  const markAsRead = useMarkAlertAsRead();

  const handleDismiss = () => {
    markAsRead.mutate(alert.id);
    onDismiss(alert.id);
  };

  return (
    <Alert className={`border-l-4 ${getPriorityColor(alert.priority)} relative`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getAlertIcon(alert.alert_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <Badge 
              variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {alert.priority === 'high' ? 'Alta' : 
               alert.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
          <AlertDescription className="text-sm">
            {alert.message}
          </AlertDescription>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(alert.created_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
};

export const AlertsBanner = () => {
  const { data: alerts = [] } = useUnreadAlerts();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          Alertas Automáticos ({visibleAlerts.length})
        </h3>
      </div>
      
      <div className="space-y-2">
        {visibleAlerts.slice(0, 5).map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onDismiss={handleDismiss}
          />
        ))}
        
        {visibleAlerts.length > 5 && (
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-sm text-muted-foreground">
                +{visibleAlerts.length - 5} outros alertas...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
