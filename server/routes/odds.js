const express = require('express');
const router = express.Router();
const axios = require('axios');
const authenticateToken = require('../middleware/auth');

let cachedOdds = {
  timestamp: 0,
  data: {},
};

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const API_KEY = process.env.ODDS_API_KEY || '92b0a12efb6201183a678c0d9d720808';

async function fetchOddsData() {
  if (Date.now() - cachedOdds.timestamp < CACHE_DURATION) {
    return cachedOdds.data;
  }

  try {
    const sports = [
      'americanfootball_nfl',
      'basketball_nba',
      'baseball_mlb',
      'americanfootball_ncaaf',
      'basketball_ncaab',
      'icehockey_nhl'
    ];
    const oddsData = {};

    for (const sport of sports) {
      try {
        const response = await axios.get(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds`,
          {
            params: {
              apiKey: API_KEY,
              regions: 'us',
              markets: 'spreads,h2h,totals',
              oddsFormat: 'american'
            }
          }
        );

        const transformedGames = response.data.map(game => ({
          id: game.id,
          sport: sport.includes('nfl') ? 'NFL' :
                sport.includes('nba') ? 'NBA' :
                sport.includes('mlb') ? 'MLB' :
                sport.includes('ncaaf') ? 'CFB' :
                sport.includes('ncaab') ? 'CBB' :
                sport.includes('nhl') ? 'NHL' : 'OTHER',
          commence_time: game.commence_time,
          home_team: game.home_team,
          away_team: game.away_team,
          betting_options: {
            spreads: game.bookmakers[0]?.markets.find(m => m.key === 'spreads')?.outcomes || [],
            moneyline: game.bookmakers[0]?.markets.find(m => m.key === 'h2h')?.outcomes || [],
            totals: game.bookmakers[0]?.markets.find(m => m.key === 'totals')?.outcomes || []
          }
        }));

        oddsData[sport] = transformedGames;
      } catch (sportError) {
        console.error(`Error fetching odds for ${sport}:`, sportError.message);
        oddsData[sport] = { error: `Failed to fetch odds for ${sport}` };
      }
    }

    cachedOdds = {
      timestamp: Date.now(),
      data: oddsData
    };

    return oddsData;
  } catch (error) {
    console.error('Error fetching odds:', error.message);
    throw error;
  }
}

// Get all odds data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const oddsData = await fetchOddsData();
    res.json(oddsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds data' });
  }
});

// Get odds for a specific sport
router.get('/:sport', authenticateToken, async (req, res) => {
  try {
    const oddsData = await fetchOddsData();
    const sportKey = Object.keys(oddsData).find(key => 
      key.includes(req.params.sport.toLowerCase())
    );
    
    if (!sportKey || !oddsData[sportKey]) {
      return res.status(404).json({ error: 'Sport not found' });
    }
    
    res.json(oddsData[sportKey]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds data for this sport' });
  }
});

// Force refresh the odds cache
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Reset the timestamp to force a refresh
    cachedOdds.timestamp = 0;
    const oddsData = await fetchOddsData();
    res.json({ message: 'Odds data refreshed successfully', sports: Object.keys(oddsData) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh odds data' });
  }
});

module.exports = router; 