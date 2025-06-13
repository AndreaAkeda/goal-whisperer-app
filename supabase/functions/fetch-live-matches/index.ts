
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

    // PRIMEIRO: Limpar jogos antigos que não estão mais ao vivo
    console.log('🧹 Limpando jogos antigos marcados como "live"...')
    const { error: cleanupError } = await supabaseClient
      .from('matches')
      .update({ status: 'finished' })
      .eq('status', 'live')
    
    if (cleanupError) {
      console.log('❌ Erro ao limpar jogos antigos:', cleanupError)
    } else {
      console.log('✅ Jogos antigos limpos com sucesso')
    }

    let apiMatches: ApiFootballMatch[] = []
    let apiError = null

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
            console.log('⚽ Primeiros 5 jogos encontrados:')
            apiMatches.slice(0, 5).forEach((match, index) => {
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

    // Processar jogos da API que estão realmente ao vivo
    let processedLiveMatches = 0
    if (apiMatches.length > 0) {
      console.log(`🔄 Processando todos os ${apiMatches.length} jogos da API...`)
      
      for (const match of apiMatches) {
        // Aceitar todos os status que indicam jogo ao vivo ou em andamento
        const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT']
        
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
          .single()

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

        // Criar nova análise para o jogo
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

        // Verificar se já existe análise para atualizar ou criar nova
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

        // Verificar alertas após criar/atualizar a análise
        await checkForAlerts(supabaseClient, matchId, matchData.home_team, matchData.away_team, newAnalysis, oldAnalysis)

        // Criar métricas para o jogo se não existir
        if (!existingMatch) {
          const xgHome = Math.random() * 2.5
          const xgAway = Math.random() * 2.5
          
          const { error: metricsError } = await supabaseClient
            .from('match_metrics')
            .insert({
              match_id: matchId,
              xg_home: xgHome,
              xg_away: xgAway,
              xg_total: xgHome + xgAway,
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

    // Se não há jogos reais da API, criar alguns jogos de demonstração APENAS se não houver nenhum jogo
    if (processedLiveMatches === 0) {
      console.log('🎯 Nenhum jogo ao vivo da API encontrado. Criando jogos de demonstração...')
      
      const demoMatches = [
        {
          external_id: 'demo_1',
          home_team: 'Real Madrid',
          away_team: 'Barcelona',
          league: 'La Liga (Espanha)',
          status: 'live',
          minute: 23,
          score_home: 0,
          score_away: 1,
          kickoff_time: new Date().toISOString()
        },
        {
          external_id: 'demo_2',
          home_team: 'Manchester City',
          away_team: 'Arsenal',
          league: 'Premier League (Inglaterra)',
          status: 'live',
          minute: 67,
          score_home: 2,
          score_away: 1,
          kickoff_time: new Date().toISOString()
        },
        {
          external_id: 'demo_3',
          home_team: 'PSG',
          away_team: 'Olympique de Marseille',
          league: 'Ligue 1 (França)',
          status: 'live',
          minute: 89,
          score_home: 1,
          score_away: 2,
          kickoff_time: new Date().toISOString()
        }
      ]

      for (const demoMatch of demoMatches) {
        // Verificar se já existe um jogo demo com esse ID
        const { data: existingDemo } = await supabaseClient
          .from('matches')
          .select('id')
          .eq('external_id', demoMatch.external_id)
          .single()

        if (!existingDemo) {
          console.log(`🎮 Criando jogo de demonstração: ${demoMatch.home_team} vs ${demoMatch.away_team}`)
          
          const { data: newMatch, error: insertError } = await supabaseClient
            .from('matches')
            .insert(demoMatch)
            .select('id')
            .single()

          if (newMatch && !insertError) {
            // Criar análise para o jogo de demonstração
            const totalGoals = demoMatch.score_home + demoMatch.score_away
            let under45Probability = 85 - (totalGoals * 15) - (demoMatch.minute * 0.2)
            under45Probability = Math.max(20, Math.min(95, under45Probability))

            const currentOdds = 1.2 + (totalGoals * 0.3) + Math.random() * 0.4
            const recommendedOdds = currentOdds * (1 + (Math.random() - 0.5) * 0.1)
            const evPercentage = ((recommendedOdds / currentOdds - 1) * 100)

            let recommendation = 'monitor'
            if (evPercentage > 5) recommendation = 'enter'
            if (evPercentage < -5) recommendation = 'avoid'

            await supabaseClient
              .from('match_analysis')
              .insert({
                match_id: newMatch.id,
                under_45_probability: under45Probability,
                current_odds: currentOdds,
                recommended_odds: recommendedOdds,
                ev_percentage: evPercentage,
                recommendation: recommendation,
                confidence_level: under45Probability > 70 ? 'high' : 'medium',
                rating: Math.floor(under45Probability * 0.8 + Math.random() * 20)
              })

            // Criar métricas para o jogo
            const xgHome = Math.random() * 2.5
            const xgAway = Math.random() * 2.5
            
            await supabaseClient
              .from('match_metrics')
              .insert({
                match_id: newMatch.id,
                xg_home: xgHome,
                xg_away: xgAway,
                xg_total: xgHome + xgAway,
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

            processedLiveMatches++
            console.log(`✅ Jogo de demonstração criado: ${demoMatch.home_team} vs ${demoMatch.away_team}`)
          }
        } else {
          processedLiveMatches++
        }
      }
    }

    // Criar alguns jogos programados para a demonstração da aba Pré-Live
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(20, 0, 0, 0)

    const scheduledGames = [
      {
        external_id: 'scheduled_1',
        home_team: 'Liverpool',
        away_team: 'Chelsea',
        league: 'Premier League (Inglaterra)',
        status: 'scheduled',
        kickoff_time: tomorrow.toISOString(),
        minute: 0,
        score_home: 0,
        score_away: 0
      },
      {
        external_id: 'scheduled_2',
        home_team: 'Bayern München',
        away_team: 'Borussia Dortmund',
        league: 'Bundesliga (Alemanha)',
        status: 'scheduled',
        kickoff_time: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        minute: 0,
        score_home: 0,
        score_away: 0
      },
      {
        external_id: 'scheduled_3',
        home_team: 'AC Milan',
        away_team: 'Inter Milan',
        league: 'Serie A (Itália)',
        status: 'scheduled',
        kickoff_time: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000).toISOString(),
        minute: 0,
        score_home: 0,
        score_away: 0
      }
    ]

    // Verificar e inserir jogos programados se não existirem
    for (const game of scheduledGames) {
      const { data: existingGame } = await supabaseClient
        .from('matches')
        .select('id')
        .eq('external_id', game.external_id)
        .single()

      if (!existingGame) {
        console.log(`➕ Criando jogo programado: ${game.home_team} vs ${game.away_team}`)
        
        const { data: newGame, error: insertError } = await supabaseClient
          .from('matches')
          .insert(game)
          .select('id')
          .single()

        if (newGame && !insertError) {
          // Criar análise para o jogo programado
          const under45Probability = 70 + Math.random() * 25
          const currentOdds = 1.5 + Math.random() * 0.8
          const recommendedOdds = currentOdds * (0.9 + Math.random() * 0.2)
          const evPercentage = ((recommendedOdds / currentOdds - 1) * 100)

          let recommendation = 'monitor'
          if (evPercentage > 5) recommendation = 'enter'
          if (evPercentage < -5) recommendation = 'avoid'

          await supabaseClient
            .from('match_analysis')
            .insert({
              match_id: newGame.id,
              under_45_probability: under45Probability,
              current_odds: currentOdds,
              recommended_odds: recommendedOdds,
              ev_percentage: evPercentage,
              recommendation: recommendation,
              confidence_level: under45Probability > 80 ? 'high' : 'medium',
              rating: Math.floor(under45Probability * 0.9 + Math.random() * 10)
            })
        }
      }
    }

    // Buscar APENAS jogos realmente ao vivo e programados
    const { data: updatedMatches, error: fetchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_analysis(*),
        match_metrics(*)
      `)
      .in('status', ['live', 'scheduled'])
      .order('kickoff_time', { ascending: true })

    if (fetchError) {
      console.log('❌ Erro ao buscar jogos do banco:', fetchError)
    }

    const liveMatches = updatedMatches?.filter(match => match.status === 'live') || []
    const scheduledMatches = updatedMatches?.filter(match => match.status === 'scheduled') || []

    console.log(`📊 Retornando: ${liveMatches.length} jogos ao vivo + ${scheduledMatches.length} programados`)
    console.log('📊 Total de jogos no banco:', updatedMatches?.length || 0)
    console.log(`🎯 Jogos processados: ${processedLiveMatches}`)

    return new Response(
      JSON.stringify({ 
        matches: updatedMatches || [],
        meta: {
          api_matches: liveMatches.length,
          scheduled_matches: scheduledMatches.length,
          api_error: apiError,
          api_key_configured: !!apiKey,
          total: updatedMatches?.length || 0,
          processed_live_matches: processedLiveMatches,
          timestamp: new Date().toISOString()
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
