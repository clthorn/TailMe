import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GameCard from '../components/GameCard';

interface Game {
  id: string;
  sport: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  betting_options: {
    spreads: any[];
    moneyline: any[];
    totals: any[];
  };
}

interface Pick {
  id: string;
  type: 'spread' | 'moneyline' | 'total';
  team: string;
  odds: string;
  point?: string;
  gameId: string;
  matchup?: string;
}

const AddPick: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('NFL');
  const [selectedPicks, setSelectedPicks] = useState<Pick[]>([]);

  useEffect(() => {
    const fetchOdds = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/odds', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const allGames: Game[] = [];
        Object.values(response.data).forEach((sportGames: any) => {
          allGames.push(...sportGames);
        });
        
        setGames(allGames);
      } catch (error) {
        console.error('Error fetching odds:', error);
        setError('Failed to fetch available games');
      }
    };

    fetchOdds();
  }, []);

  const handleSportChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSport: string,
  ) => {
    if (newSport !== null) {
      setSelectedSport(newSport);
    }
  };

  const handlePickSelect = (pick: Pick) => {
    setSelectedPicks(prevPicks => {
      const existingPickIndex = prevPicks.findIndex(p => p.id === pick.id);
      if (existingPickIndex > -1) {
        // Remove pick if already selected
        return prevPicks.filter(p => p.id !== pick.id);
      } else {
        // Add new pick
        return [...prevPicks, pick];
      }
    });
  };

  const handleRemovePick = (pickId: string) => {
    setSelectedPicks(prevPicks => prevPicks.filter(p => p.id !== pickId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPicks.length === 0) return;

    try {
      for (const pick of selectedPicks) {
        const game = games.find(g => g.id === pick.gameId);
        
        const pickData = {
          sport: selectedSport,
          pick: pick.type === 'total'
            ? `${pick.matchup} ${pick.team} ${pick.point}`
            : `${pick.team} ${pick.point || ''} ${pick.type}`,
          odds: pick.odds,
          result: 'Pending',
          game_time: game?.commence_time
        };

        await axios.post('http://localhost:5001/api/picks', pickData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      navigate('/creator-dashboard');
    } catch (error) {
      setError('Failed to create picks');
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Picks
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ToggleButtonGroup
          color="primary"
          value={selectedSport}
          exclusive
          onChange={handleSportChange}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="NFL">NFL</ToggleButton>
          <ToggleButton value="NBA">NBA</ToggleButton>
          <ToggleButton value="MLB">MLB</ToggleButton>
          <ToggleButton value="CFB">CFB</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ mb: 3 }}>
          {games
            .filter(game => game.sport === selectedSport)
            .map(game => (
              <GameCard
                key={game.id}
                {...game}
                homeTeam={game.home_team}
                awayTeam={game.away_team}
                selectedPicks={selectedPicks}
                onPickSelect={handlePickSelect}
              />
            ))}
        </Box>

        {selectedPicks.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected Picks:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedPicks.map((pick) => (
                <Chip
                  key={pick.id}
                  label={
                    pick.type === 'total' 
                      ? `${pick.matchup} ${pick.team} ${pick.point} (${pick.odds})`
                      : `${pick.team} ${pick.point || ''} (${pick.odds})`
                  }
                  onDelete={() => handleRemovePick(pick.id)}
                  color="primary"
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={selectedPicks.length === 0}
          >
            Submit Picks ({selectedPicks.length})
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/creator-dashboard')}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddPick; 