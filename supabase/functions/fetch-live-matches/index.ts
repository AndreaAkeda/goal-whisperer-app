
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FootballMatch {
  id: number
  homeTeam: { name: string }
  awayTeam: { name: string }
  score: { fullTime: { home: number | null, away: number | null } }
  status: string
  minute: number | null
  competition: { name: string }
  utcDate: string
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

    let apiMatches: FootballMatch[] = []
    let apiError = null
    let apiResponse = null

    // Verificar se a chave da API está configurada
    const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')
    console.log('🔑 API Key configurada:', apiKey ? 'SIM' : 'NÃO')
    console.log('🔑 Primeiros 10 caracteres da key:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A')

    if (!apiKey) {
      console.log('❌ Chave da API Football-Data não configurada')
      apiError = 'API key not configured'
    } else {
      try {
        console.log('🌐 Fazendo requisição para Football-Data.org...')
        console.log('🌐 URL:', 'https://api.football-data.org/v4/matches?status=LIVE')
        
        const response = await fetch('https://api.football-data.org/v4/matches?status=LIVE', {
          headers: {
            'X-Auth-Token': apiKey,
            'User-Agent': 'Packball-Analytics/1.0'
          }
        })

        console.log(`📡 Status da resposta: ${response.status}`)
        console.log(`📡 Status text: ${response.statusText}`)
        console.log(`📡 Headers da resposta:`, Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.log(`❌ Erro da API (${response.status}): ${errorText}`)
          apiError = `API returned ${response.status}: ${errorText}`
          apiResponse = { status: response.status, error: errorText }
        } else {
          const data = await response.json()
          console.log('📊 Estrutura da resposta da API:', JSON.stringify(data, null, 2))
          
          apiMatches = data.matches || []
          console.log(`✅ API retornou ${apiMatches.length} jogos`)
          
          if (apiMatches.length > 0) {
            console.log('⚽ Jogos encontrados:')
            apiMatches.forEach((match, index) => {
              console.log(`  ${index + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`)
              console.log(`     Liga: ${match.competition.name}`)
              console.log(`     Status: ${match.status}`)
              console.log(`     Minuto: ${match.minute}`)
              console.log(`     Placar: ${match.score.fullTime.home} - ${match.score.fullTime.away}`)
              console.log(`     Data: ${match.utcDate}`)
              console.log('     ---')
            })
          } else {
            console.log('📝 Nenhum jogo ao vivo encontrado na API')
          }
          
          apiResponse = { 
            status: response.status, 
            matchCount: apiMatches.length,
            data: data 
          }
        }
      } catch (error) {
        console.log('❌ Erro ao fazer requisição:', error.message)
        console.log('❌ Stack trace:', error.stack)
        apiError = `Request failed: ${error.message}`
        apiResponse = { error: error.message, stack: error.stack }
      }
    }

    // Processar jogos da API se houver
    if (apiMatches.length > 0) {
      console.log(`🔄 Processando ${apiMatches.length} jogos da API...`)
      
      for (const match of apiMatches.slice(0, 10)) {
        const matchData = {
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          league: match.competition.name,
          status: 'live',
          minute: match.minute || 0,
          score_home: match.score.fullTime.home || 0,
          score_away: match.score.fullTime.away || 0,
          total_goals: (match.score.fullTime.home || 0) + (match.score.fullTime.away || 0),
          kickoff_time: match.utcDate,
          updated_at: new Date().toISOString()
        }

        console.log(`💾 Salvando jogo: ${matchData.home_team} vs ${matchData.away_team}`)

        // Verificar se o jogo já existe
        const { data: existingMatch } = await supabaseClient
          .from('matches')
          .select('id')
          .eq('home_team', match.homeTeam.name)
          .eq('away_team', match.awayTeam.name)
          .eq('kickoff_time', match.utcDate)
          .single()

        if (existingMatch) {
          console.log(`🔄 Atualizando jogo existente: ${matchData.home_team} vs ${matchData.away_team}`)
          await supabaseClient
            .from('matches')
            .update(matchData)
            .eq('id', existingMatch.id)
        } else {
          console.log(`➕ Criando novo jogo: ${matchData.home_team} vs ${matchData.away_team}`)
          
          const { data: newMatch, error: insertError } = await supabaseClient
            .from('matches')
            .insert(matchData)
            .select('id')
            .single()

          if (insertError) {
            console.log('❌ Erro ao inserir jogo:', insertError)
          } else if (newMatch) {
            console.log(`✅ Jogo criado com ID: ${newMatch.id}`)
            
            const totalGoals = matchData.total_goals
            const minute = matchData.minute

            let under45Probability = 85 - (totalGoals * 15) - (minute * 0.2)
            under45Probability = Math.max(20, Math.min(95, under45Probability))

            const currentOdds = 1.2 + (totalGoals * 0.3) + Math.random() * 0.4
            const recommendedOdds = currentOdds * (1 + (Math.random() - 0.5) * 0.1)
            const evPercentage = ((recommendedOdds / currentOdds - 1) * 100)

            let recommendation = 'monitor'
            if (evPercentage > 5) recommendation = 'enter'
            if (evPercentage < -5) recommendation = 'avoid'

            console.log(`📊 Criando análise para jogo ${newMatch.id}`)
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

            const xgHome = Math.random() * 2.5
            const xgAway = Math.random() * 2.5
            
            console.log(`📈 Criando métricas para jogo ${newMatch.id}`)
            await supabaseClient
              .from('match_metrics')
              .insert({
                match_id: newMatch.id,
                xg_home: xgHome,
                xg_away: xgAway,
                xg_total: xgHome + xgAway,
                possession_home: 45 + Math.random() * 20,
                possession_away: 45 + Math.random() * 20,
                dangerous_attacks: Math.floor(Math.random() * 15) + 5,
                shots_home: Math.floor(Math.random() * 10) + 2,
                shots_away: Math.floor(Math.random() * 10) + 2,
                shots_on_target_home: Math.floor(Math.random() * 5) + 1,
                shots_on_target_away: Math.floor(Math.random() * 5) + 1,
                corners_home: Math.floor(Math.random() * 8),
                corners_away: Math.floor(Math.random() * 8)
              })
          }
        }
      }
    } else {
      console.log('📝 Nenhum jogo da API, mantendo dados de demonstração existentes')
    }

    // Buscar todos os jogos ao vivo (API + demonstração)
    const { data: updatedMatches, error: fetchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_analysis(*),
        match_metrics(*)
      `)
      .eq('status', 'live')
      .order('minute', { ascending: false })

    if (fetchError) {
      console.log('❌ Erro ao buscar jogos do banco:', fetchError)
    }

    const apiMatchesCount = updatedMatches?.filter(match => 
      !['Brasileirão', 'Copa do Brasil', 'Libertadores'].includes(match.league)
    ).length || 0

    const demoMatchesCount = updatedMatches?.filter(match => 
      ['Brasileirão', 'Copa do Brasil', 'Libertadores'].includes(match.league)
    ).length || 0

    console.log(`📊 Retornando: ${apiMatchesCount} jogos da API + ${demoMatchesCount} de demonstração`)
    console.log('📊 Total de jogos no banco:', updatedMatches?.length || 0)

    return new Response(
      JSON.stringify({ 
        matches: updatedMatches || [],
        meta: {
          api_matches: apiMatchesCount,
          demo_matches: demoMatchesCount,
          api_error: apiError,
          api_response: apiResponse,
          api_key_configured: !!apiKey,
          total: updatedMatches?.length || 0,
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
    console.error('❌ Stack trace completo:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message,
        stack: error.stack,
        matches: [],
        meta: {
          api_matches: 0,
          demo_matches: 0,
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
