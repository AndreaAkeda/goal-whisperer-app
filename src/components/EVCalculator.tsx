
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const EVCalculator = () => {
  const [probability, setProbability] = useState<string>('75');
  const [odds, setOdds] = useState<string>('1.80');
  const [stake, setStake] = useState<string>('100');
  const [results, setResults] = useState<{
    ev: number;
    evPercentage: number;
    profit: number;
    loss: number;
    recommendation: 'bet' | 'avoid' | 'neutral';
  } | null>(null);

  const calculateEV = () => {
    const prob = parseFloat(probability) / 100;
    const oddsValue = parseFloat(odds);
    const stakeValue = parseFloat(stake);

    if (isNaN(prob) || isNaN(oddsValue) || isNaN(stakeValue)) {
      return;
    }

    const winAmount = stakeValue * (oddsValue - 1);
    const lossAmount = -stakeValue;
    
    const ev = (prob * winAmount) + ((1 - prob) * lossAmount);
    const evPercentage = (ev / stakeValue) * 100;
    
    let recommendation: 'bet' | 'avoid' | 'neutral' = 'neutral';
    if (evPercentage > 5) recommendation = 'bet';
    else if (evPercentage < -5) recommendation = 'avoid';

    setResults({
      ev,
      evPercentage,
      profit: winAmount,
      loss: Math.abs(lossAmount),
      recommendation
    });
  };

  const getRecommendationBadge = () => {
    if (!results) return null;

    switch (results.recommendation) {
      case 'bet':
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
      case 'neutral':
        return (
          <Badge variant="outline">
            <Target className="h-3 w-3 mr-1" />
            NEUTRO
          </Badge>
        );
    }
  };

  const getEVColor = () => {
    if (!results) return 'text-muted-foreground';
    if (results.evPercentage > 5) return 'text-success';
    if (results.evPercentage < -5) return 'text-destructive';
    return 'text-warning';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Calculadora de Expected Value</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Aposta</CardTitle>
            <CardDescription>
              Insira os dados para calcular o Expected Value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade de Sucesso (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                placeholder="Ex: 75"
              />
              <p className="text-xs text-muted-foreground">
                Probabilidade estimada de o jogo terminar com Under 4.5 gols
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="odds">Odd Oferecida</Label>
              <Input
                id="odds"
                type="number"
                step="0.01"
                min="1"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                placeholder="Ex: 1.80"
              />
              <p className="text-xs text-muted-foreground">
                Odd decimal oferecida pela casa de apostas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stake">Valor da Aposta (R$)</Label>
              <Input
                id="stake"
                type="number"
                min="0"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Ex: 100"
              />
              <p className="text-xs text-muted-foreground">
                Valor que pretende apostar
              </p>
            </div>

            <Button onClick={calculateEV} className="w-full gradient-success text-white">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Expected Value
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
            <CardDescription>
              {results ? 'Análise de valor esperado' : 'Aguardando cálculo...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-6">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Expected Value</p>
                  <p className={`text-4xl font-bold ${getEVColor()}`}>
                    {results.evPercentage > 0 ? '+' : ''}{results.evPercentage.toFixed(2)}%
                  </p>
                  <p className={`text-lg ${getEVColor()}`}>
                    R$ {results.ev > 0 ? '+' : ''}{results.ev.toFixed(2)}
                  </p>
                  <div className="mt-3">
                    {getRecommendationBadge()}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm">Lucro se ganhar</span>
                    </div>
                    <span className="font-bold text-success">
                      +R$ {results.profit.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Perda se perder</span>
                    </div>
                    <span className="font-bold text-destructive">
                      -R$ {results.loss.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Interpretação:</h4>
                  {results.evPercentage > 10 && (
                    <p className="text-sm text-success bg-success/10 p-3 rounded-lg">
                      <strong>Excelente oportunidade!</strong> EV muito positivo indica alta lucratividade a longo prazo.
                    </p>
                  )}
                  {results.evPercentage > 0 && results.evPercentage <= 10 && (
                    <p className="text-sm text-warning bg-warning/10 p-3 rounded-lg">
                      <strong>Oportunidade moderada.</strong> EV positivo, mas com margem menor.
                    </p>
                  )}
                  {results.evPercentage <= 0 && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <strong>EV negativo.</strong> A longo prazo, esta aposta gerará perdas. Considere evitar.
                    </p>
                  )}
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs font-mono text-muted-foreground text-center">
                    EV = (P × Lucro) + ((1-P) × Perda)
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Preencha os campos ao lado para calcular o Expected Value
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas para Usar a Calculadora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Probabilidade:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use dados da Packball para estimar</li>
                <li>• Considere xG, histórico e forma dos times</li>
                <li>• Seja conservador em suas estimativas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Expected Value:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• EV &gt; 5%: Apostar com confiança</li>
                <li>• EV 0-5%: Avaliar outros fatores</li>
                <li>• EV &lt; 0%: Evitar a aposta</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
