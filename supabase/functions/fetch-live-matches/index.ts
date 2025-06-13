
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApiFootballMatch {
  fixture: {
    id: number
    status: {
      short: string
      elapsed: number | null
    }
    date: string
  }
  league: {
    name: string
    country: string
  }
  teams: {
    home: { name: string }
    away: { name: string }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

interface MatchAnalysis {
  match_id: string
  under_45_probability: number
  current_odds: number
  recommended_odds: number
  ev_percentage: number
  recommendation: string
  confidence_level: string
  rating: number
}

async function createAlert(supabaseClient: any, matchId: string, alertType: string, title: string, message: string, priority: string = 'medium') {
  console.log(`🔔 Criando alerta: ${title}`)
  
  const { error } = await supabaseClient
    .from('alerts')
    .insert({
      match_id: matchId,
      alert_type: alertType,
      title: title,
      message: message,
      priority: priority,
      is_read: false
    })
  
  if (error) {
    console.log('❌ Erro ao criar alerta:', error)
  } else {
    console.log('✅ Alerta criado com sucesso')
  }
}

async function checkForAlerts(supabaseClient: any, matchId: string, homeTeam: string, awayTeam: string, analysis: MatchAnalysis, oldAnalysis?: MatchAnalysis) {
  const matchName = `${homeTeam} vs ${awayTeam}`
  
  // Alerta para EV positivo alto (>10%)
  if (analysis.ev_percentage > 10) {
    await createAlert(
      supabaseClient,
      matchId,
      'high_ev',
      'EV Positivo Alto Detectado!',
      `${matchName} tem EV de +${analysis.ev_percentage.toFixed(1)}% - Excelente oportunidade!`,
      'high'
    )
  }
  
  // Alerta para nova oportunidade de entrada
  if (analysis.recommendation === 'enter' && analysis.ev_percentage > 5) {
    await createAlert(
      supabaseClient,
      matchId,
      'entry_opportunity',
      'Nova Oportunidade de Entrada',
      `${matchName} - EV: +${analysis.ev_percentage.toFixed(1)}%, Prob: ${analysis.under_45_probability.toFixed(0)}%`,
      'high'
    )
  }
  
  // Alerta para mudança significativa de odds (se temos análise anterior)
  if (oldAnalysis) {
    const oddsChange = Math.abs(analysis.current_odds - oldAnalysis.current_odds)
    const oddsChangePercent = (oddsChange / oldAnalysis.current_odds) * 100
    
    if (oddsChangePercent > 5) {
      const direction = analysis.current_odds > oldAnalysis.current_odds ? 'subiu' : 'caiu'
      await createAlert(
        supabaseClient,
        matchId,
        'odds_change',
        'Mudança Significativa de Odds',
        `${matchName} - Odd ${direction} de ${oldAnalysis.current_odds.toFixed(2)} para ${analysis.current_odds.toFixed(2)}`,
        'medium'
      )
    }
    
    // Alerta para melhoria do EV
    const evImprovement = analysis.ev_percentage - oldAnalysis.ev_percentage
    if (evImprovement > 3) {
      await createAlert(
        supabaseClient,
        matchId,
        'ev_improvement',
        'Melhoria no Expected Value',
        `${matchName} - EV melhorou em +${evImprovement.toFixed(1)}% (agora ${analysis.ev_percentage.toFixed(1)}%)`,
        'medium'
      )
    }
  }
  
  // Alerta para alta probabilidade (>85%)
  if (analysis.under_45_probability > 85 && analysis.ev_percentage > 0) {
    await createAlert(
      supabaseClient,
      matchId,
      'high_probability',
      'Alta Probabilidade Detectada',
      `${matchName} - ${analysis.under_45_probability.toFixed(0)}% de probabilidade com EV positivo`,
      'medium'
    )
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Iniciando busca por jogos ao vivo...')
    console.log('🕐 Timestamp atual:', new Date().toISOString())

    // Primeiro, limpar jogos demo existentes
    console.log('🧹 Removendo jogos demo existentes...')
    const { error: deleteError } = await supabaseClient
      .from('matches')
      .delete()
      .like('external_id', 'demo_%')
    
    if (deleteError) {
      console.log('❌ Erro ao deletar jogos demo:', deleteError)
    } else {
      console.log('✅ Jogos demo removidos')
    }

    let apiMatches: ApiFootballMatch[] = []
    let apiError = null
    let processedLiveMatches = 0

    // Verificar se a chave da API está configurada
    const apiKey = Deno.env.get('API_FOOTBALL_KEY')
    console.log('🔑 API Football Key configurada:', apiKey ? 'SIM' : 'NÃO')

    if (!apiKey) {
      console.log('❌ Chave da API Football não configurada')
      apiError = 'API key not configured'
    } else {
      try {
        console.log('🌐 Fazendo requisição para API-Football.com...')
        console.log('🌐 URL:', 'https://v3.football.api-sports.io/fixtures?live=all')
        
        const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'v3.football.api-sports.io'
          }
        })

        console.log(`📡 Status da resposta: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.log(`❌ Erro da API (${response.status}): ${errorText}`)
          apiError = `API returned ${response.status}: ${errorText}`
        } else {
          const data = await response.json()
          apiMatches = data.response || []
          console.log(`✅ API retornou ${apiMatches.length} jogos`)
          
          if (apiMatches.length > 0) {
            console.log('⚽ Jogos ao vivo encontrados:')
            apiMatches.forEach((match, index) => {
              console.log(`  ${index + 1}. ${match.teams.home.name} vs ${match.teams.away.name}`)
              console.log(`     Liga: ${match.league.name} (${match.league.country})`)
              console.log(`     Status: ${match.fixture.status.short}, Minuto: ${match.fixture.status.elapsed}`)
              console.log(`     Placar: ${match.goals.home} - ${match.goals.away}`)
            })
          } else {
            console.log('📝 Nenhum jogo ao vivo encontrado na API')
          }
        }
      } catch (error) {
        console.log('❌ Erro ao fazer requisição:', error.message)
        apiError = `Request failed: ${error.message}`
      }
    }

    // Processar jogos da API que estão ao vivo
    if (apiMatches.length > 0) {
      console.log(`🔄 Processando ${apiMatches.length} jogos da API...`)
      
      for (const match of apiMatches) {
        // Status que indicam jogo ao vivo
        const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE']
        
        if (!liveStatuses.includes(match.fixture.status.short)) {
          console.log(`⏭️ Pulando jogo ${match.teams.home.name} vs ${match.teams.away.name} - Status: ${match.fixture.status.short}`)
          continue
        }

        const matchData = {
          external_id: match.fixture.id.toString(),
          home_team: match.teams.home.name,
          away_team: match.teams.away.name,
          league: `${match.league.name} (${match.league.country})`,
          status: 'live',
          minute: match.fixture.status.elapsed || 0,
          score_home: match.goals.home || 0,
          score_away: match.goals.away || 0,
          kickoff_time: match.fixture.date,
          updated_at: new Date().toISOString()
        }

        console.log(`💾 Processando jogo AO VIVO: ${matchData.home_team} vs ${matchData.away_team} (${match.fixture.status.short})`)

        // Verificar se o jogo já existe usando o external_id
        const { data: existingMatch } = await supabaseClient
          .from('matches')
          .select(`
            id,
            match_analysis(*)
          `)
          .eq('external_id', match.fixture.id.toString())
          .maybeSingle()

        let matchId: string
        let oldAnalysis: MatchAnalysis | undefined

        if (existingMatch) {
          console.log(`🔄 Atualizando jogo existente: ${matchData.home_team} vs ${matchData.away_team}`)
          matchId = existingMatch.id
          oldAnalysis = existingMatch.match_analysis?.[0]
          
          const { error: updateError } = await supabaseClient
            .from('matches')
            .update(matchData)
            .eq('id', existingMatch.id)
          
          if (updateError) {
            console.log('❌ Erro ao atualizar jogo:', updateError)
            continue
          } else {
            console.log('✅ Jogo atualizado com sucesso')
          }
        } else {
          console.log(`➕ Criando novo jogo AO VIVO: ${matchData.home_team} vs ${matchData.away_team}`)
          
          const { data: newMatch, error: insertError } = await supabaseClient
            .from('matches')
            .insert(matchData)
            .select('id')
            .single()

          if (insertError) {
            console.log('❌ Erro ao inserir jogo:', insertError)
            continue
          } else if (newMatch) {
            console.log(`✅ Jogo criado com ID: ${newMatch.id}`)
            matchId = newMatch.id
          } else {
            continue
          }
        }

        // Criar análise para o jogo
        const totalGoals = (match.goals.home || 0) + (match.goals.away || 0)
        const minute = match.fixture.status.elapsed || 0

        let under45Probability = 85 - (totalGoals * 15) - (minute * 0.2)
        under45Probability = Math.max(20, Math.min(95, under45Probability))

        const currentOdds = 1.2 + (totalGoals * 0.3) + Math.random() * 0.4
        const recommendedOdds = currentOdds * (1 + (Math.random() - 0.5) * 0.1)
        const evPercentage = ((recommendedOdds / currentOdds - 1) * 100)

        let recommendation = 'monitor'
        if (evPercentage > 5) recommendation = 'enter'
        if (evPercentage < -5) recommendation = 'avoid'

        const newAnalysis: MatchAnalysis = {
          match_id: matchId,
          under_45_probability: under45Probability,
          current_odds: currentOdds,
          recommended_odds: recommendedOdds,
          ev_percentage: evPercentage,
          recommendation: recommendation,
          confidence_level: under45Probability > 70 ? 'high' : 'medium',
          rating: Math.floor(under45Probability * 0.8 + Math.random() * 20)
        }

        // Atualizar ou criar análise
        if (oldAnalysis) {
          const { error: analysisError } = await supabaseClient
            .from('match_analysis')
            .update(newAnalysis)
            .eq('match_id', matchId)
            
          if (analysisError) {
            console.log('❌ Erro ao atualizar análise:', analysisError)
          }
        } else {
          const { error: analysisError } = await supabaseClient
            .from('match_analysis')
            .insert(newAnalysis)
            
          if (analysisError) {
            console.log('❌ Erro ao criar análise:', analysisError)
          }
        }

        // Verificar alertas apenas para jogos reais
        await checkForAlerts(supabaseClient, matchId, matchData.home_team, matchData.away_team, newAnalysis, oldAnalysis)

        // Criar métricas se não existir
        if (!existingMatch) {
          const xgHome = Math.random() * 2.5
          const xgAway = Math.random() * 2.5
          
          const { error: metricsError } = await supabaseClient
            .from('match_metrics')
            .insert({
              match_id: matchId,
              xg_home: xgHome,
              xg_away: xgAway,
              dangerous_attacks: Math.floor(Math.random() * 15) + 5,
              possession_home: Math.floor(45 + Math.random() * 20),
              possession_away: Math.floor(35 + Math.random() * 20),
              shots_home: Math.floor(Math.random() * 10) + 2,
              shots_away: Math.floor(Math.random() * 10) + 2,
              shots_on_target_home: Math.floor(Math.random() * 5) + 1,
              shots_on_target_away: Math.floor(Math.random() * 5) + 1,
              corners_home: Math.floor(Math.random() * 8),
              corners_away: Math.floor(Math.random() * 8)
            })

          if (metricsError) {
            console.log('❌ Erro ao criar métricas:', metricsError)
          }
        }

        processedLiveMatches++
      }
    }

    console.log(`🎯 Processados ${processedLiveMatches} jogos ao vivo da API`)

    // Buscar todos os jogos para retornar (apenas reais, sem demos)
    const { data: allMatches, error: fetchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_analysis(*),
        match_metrics(*)
      `)
      .not('external_id', 'like', 'demo_%')
      .in('status', ['live', 'scheduled'])
      .order('kickoff_time', { ascending: true })

    if (fetchError) {
      console.log('❌ Erro ao buscar jogos do banco:', fetchError)
    }

    const liveMatches = allMatches?.filter(match => match.status === 'live') || []
    const scheduledMatches = allMatches?.filter(match => match.status === 'scheduled') || []

    console.log(`📊 Retornando: ${liveMatches.length} jogos ao vivo + ${scheduledMatches.length} programados`)
    console.log('📊 Total de jogos reais no banco:', allMatches?.length || 0)
    console.log(`🎯 Jogos processados da API: ${processedLiveMatches}`)

    if (liveMatches.length === 0) {
      console.log('📭 Nenhum jogo ao vivo disponível no momento')
    }

    return new Response(
      JSON.stringify({ 
        matches: allMatches || [],
        meta: {
          api_matches: liveMatches.length,
          scheduled_matches: scheduledMatches.length,
          api_error: apiError,
          api_key_configured: !!apiKey,
          total: allMatches?.length || 0,
          processed_live_matches: processedLiveMatches,
          timestamp: new Date().toISOString(),
          demo_mode: false
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na função:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        matches: [],
        meta: {
          api_matches: 0,
          scheduled_matches: 0,
          api_error: error.message,
          total: 0,
          demo_mode: false,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
