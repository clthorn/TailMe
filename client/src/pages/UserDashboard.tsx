import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CardActions,
  Box,
  CircularProgress,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PercentIcon from '@mui/icons-material/Percent';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';

interface Creator {
  id: number;
  username: string;
  totalPicks: number;
  wins: number;
  winRate: number;
  isSubscribed: boolean;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5001/api/creators', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // Filter out the current user if they're a creator
        const filteredCreators = response.data.filter((creator: Creator) => 
          creator.id !== user?.id
        );
        setCreators(filteredCreators);
      } catch (error) {
        console.error('Error fetching creators:', error);
        setError('Failed to fetch creators');
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [user?.id]);

  const handleSubscription = async (creatorId: number, isCurrentlySubscribed: boolean) => {
    try {
      if (isCurrentlySubscribed) {
        await axios.delete(`http://localhost:5001/api/subscriptions/${creatorId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post(`http://localhost:5001/api/subscriptions/${creatorId}`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }

      // Update the creators list to reflect the new subscription status
      setCreators(prevCreators =>
        prevCreators.map(creator =>
          creator.id === creatorId
            ? { ...creator, isSubscribed: !isCurrentlySubscribed }
            : creator
        )
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Failed to update subscription');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Creators
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        {creators.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No creators available at this time.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {creators.map((creator) => (
              <Grid item xs={12} sm={6} md={4} key={creator.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {creator.username}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SportsFootballIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Total Picks: {creator.totalPicks}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Wins: {creator.wins}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PercentIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Win Rate: 
                          <Chip 
                            size="small" 
                            label={`${(creator.winRate * 100).toFixed(1)}%`}
                            color={creator.winRate >= 0.6 ? "success" : creator.winRate >= 0.5 ? "primary" : "default"}
                            sx={{ ml: 1, height: 20 }}
                          />
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    {creator.isSubscribed && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate(`/creator/${creator.id}`)}
                      >
                        View Picks
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant={creator.isSubscribed ? "contained" : "outlined"}
                      color={creator.isSubscribed ? "error" : "primary"}
                      onClick={() => handleSubscription(creator.id, creator.isSubscribed)}
                      sx={{ marginLeft: creator.isSubscribed ? '0px' : 'auto' }}
                    >
                      {creator.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default UserDashboard; 