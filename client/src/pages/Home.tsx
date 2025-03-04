import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Creator {
  id: number;
  username: string;
  totalPicks?: number;
  wins?: number;
  winRate?: number;
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribedCreators = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${user?.id}/subscriptions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCreators(response.data);
      } 
      catch (error) 
      {
        console.error('Error fetching creators:', error);
      } 
      finally 
      {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubscribedCreators();
    }
  }, [user]);

  if (!user) {
    return (
      <Container>
        <Typography variant="h5" sx={{ mt: 4, textAlign: 'center' }}>
          Please sign in to view your subscribed creators
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Subscribed Creators
      </Typography>
      
      {creators.length === 0 ? (
        <Typography variant="body1">
          You haven't subscribed to any creators yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {creators.map((creator) => (
            <Grid item xs={12} md={6} key={creator.id}>
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
                  <Typography variant="h6" component="h2" gutterBottom>
                    {creator.username}
                  </Typography>
                  
                  {creator.totalPicks !== undefined && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Picks: {creator.totalPicks}
                    </Typography>
                  )}
                  
                  {creator.winRate !== undefined && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Win Rate: {(creator.winRate * 100).toFixed(1)}%
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      component={Link} 
                      to={`/creator/${creator.id}`} 
                      variant="contained" 
                      color="primary"
                      fullWidth
                    >
                      View Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home; 