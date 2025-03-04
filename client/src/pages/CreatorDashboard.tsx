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
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Pick {
  id: string;
  sport: string;
  pick: string;
  odds: string;
  result: string;
  created_at: string;
  game_time: string;
  week?: number;
}

const CreatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [picks, setPicks] = useState<Pick[]>([]);
  const navigate = useNavigate();
  const [view, setView] = useState<'picks' | 'creators'>('picks');
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/picks/creator/${user?.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Fetched picks:', response.data);
        setPicks(response.data);
      } catch (error) {
        console.error('Error fetching picks:', error);
      }
    };

    if (user?.id) {
      fetchPicks();
    }
  }, [user?.id]);

  const getWeekNumber = (dateString: string) => {
    const date = new Date(dateString);
    const startDate = new Date('2023-09-07'); // NFL season start
    return Math.ceil((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
  };

  const availableWeeks = [...new Set(
    picks.map(pick => getWeekNumber(pick.created_at))
  )].sort((a, b) => a - b);

  const filteredPicks = picks.filter(pick => 
    selectedWeek === 0 || getWeekNumber(pick.created_at) === selectedWeek
  );

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {view === 'picks' ? 'My Picks' : 'Available Creators'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => {
              if (newView !== null) {
                setView(newView);
                if (newView === 'creators') {
                  navigate('/dashboard');
                }
              }
            }}
          >
            <ToggleButton value="picks">My Picks</ToggleButton>
            <ToggleButton value="creators">Find Creators</ToggleButton>
          </ToggleButtonGroup>
          {view === 'picks' && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/add-pick')}
            >
              Add New Pick
            </Button>
          )}
        </Box>
      </Box>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">My Picks</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Week</InputLabel>
          <Select
            value={selectedWeek}
            label="Week"
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
          >
            <MenuItem value={0}>All Weeks</MenuItem>
            {availableWeeks.map((week) => (
              <MenuItem key={week} value={week}>
                Week {week}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pick Added</TableCell>
              <TableCell>Game Time</TableCell>
              <TableCell>Sport</TableCell>
              <TableCell>Pick</TableCell>
              <TableCell>Odds</TableCell>
              <TableCell>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPicks.map((pick) => (
              <TableRow key={pick.id}>
                <TableCell>{formatDate(pick.created_at)}</TableCell>
                <TableCell>{formatDate(pick.game_time)}</TableCell>
                <TableCell>{pick.sport}</TableCell>
                <TableCell>{pick.pick}</TableCell>
                <TableCell>{pick.odds}</TableCell>
                <TableCell 
                  color={
                    pick.result === "Win" ? "success.main" : 
                    pick.result === "Loss" ? "error.main" : 
                    "text.secondary"
                  }
                >
                  {pick.result}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CreatorDashboard; 