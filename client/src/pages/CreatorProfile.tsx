import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  Box,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Pick {
  id: number;
  sport: string;
  pick: string;
  odds: string;
  result: string;
  created_at: string;
  game_time: string;
}

interface CreatorStats {
  totalPicks: number;
  wins: number;
  losses: number;
  winRate: number;
}

const CreatorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [stats, setStats] = useState<CreatorStats>({
    totalPicks: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const creatorResponse = await axios.get(`http://localhost:5001/api/creators/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const creator = creatorResponse.data;
        setCreatorName(creator.username);
        setIsSubscribed(creator.isSubscribed);
        setStats({
          totalPicks: creator.totalPicks,
          wins: creator.wins,
          losses: creator.totalPicks - creator.wins,
          winRate: creator.totalPicks > 0 ? creator.wins / creator.totalPicks : 0
        });

        const picksResponse = await axios.get(`http://localhost:5001/api/picks/creator/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setPicks(picksResponse.data);
      } catch (error) {
        console.error('Error fetching creator data:', error);
      }
    };

    fetchCreatorData();
  }, [id]);

  const handleSportChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSport: string,
  ) => {
    if (newSport !== null) {
      setSelectedSport(newSport);
    }
  };

  // Filter picks based on selected sport
  const filteredPicks = selectedSport === 'ALL' 
    ? picks 
    : picks.filter(pick => {
        const sportFromPick = pick.sport.toUpperCase();
        return sportFromPick === selectedSport;
      });

  // Calculate filtered stats
  const filteredStats = {
    totalPicks: filteredPicks.length,
    wins: filteredPicks.filter(pick => pick.result === 'Win').length,
    losses: filteredPicks.filter(pick => pick.result === 'Loss').length,
    winRate: filteredPicks.length > 0 
      ? filteredPicks.filter(pick => pick.result === 'Win').length / filteredPicks.length 
      : 0
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await axios.delete(`http://localhost:5001/api/subscriptions/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post(`http://localhost:5001/api/subscriptions/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {creatorName}
        </Typography>
        {user && !user.isCreator && (
          <Button 
            variant="contained" 
            onClick={handleSubscribe}
            color={isSubscribed ? "error" : "primary"}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ToggleButtonGroup
            color="primary"
            value={selectedSport}
            exclusive
            onChange={handleSportChange}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="ALL">ALL</ToggleButton>
            <ToggleButton value="NFL">NFL</ToggleButton>
            <ToggleButton value="NBA">NBA</ToggleButton>
            <ToggleButton value="MLB">MLB</ToggleButton>
            <ToggleButton value="CFB">CFB</ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSport === 'ALL' ? 'Overall Stats' : `${selectedSport} Stats`}
              </Typography>
              <Typography>
                Total Picks: {filteredStats.totalPicks}
              </Typography>
              <Typography>
                Wins: {filteredStats.wins}
              </Typography>
              <Typography>
                Losses: {filteredStats.losses}
              </Typography>
              <Typography>
                Win Rate: {(filteredStats.winRate * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {selectedSport === 'ALL' ? 'All Picks' : `${selectedSport} Picks`}
          </Typography>
          
          {/* Header row */}
          <Grid container spacing={2} sx={{ px: 2, mb: 1 }}>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">League</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">Pick</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">Odds</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">Result</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">Pick Added</Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="subtitle1" fontWeight="bold">Game Time</Typography>
            </Grid>
          </Grid>

          {filteredPicks.length > 0 ? (
            <Grid container spacing={2}>
              {filteredPicks.map((pick) => (
                <Grid item xs={12} key={pick.id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                          <Typography>{pick.sport}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography>{pick.pick}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography>{pick.odds}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography 
                            color={
                                pick.result === "Win" ? "success.main" : 
                                pick.result === "Loss" ? "error.main" : 
                                "text.secondary"
                              }
                          >
                            {pick.result}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography color="textSecondary">
                            {new Date(pick.created_at).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography color="textSecondary">
                            {new Date(pick.game_time).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="textSecondary" sx={{ mt: 2 }}>
              No picks available for {selectedSport === 'ALL' ? 'any sport' : selectedSport}.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CreatorProfile; 