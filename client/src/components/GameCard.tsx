import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Divider
} from '@mui/material';

interface BettingOption {
  name: string;
  price: number;
  point?: number;
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

interface GameCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commence_time: string;
  betting_options: {
    spreads: BettingOption[];
    moneyline: BettingOption[];
    totals: BettingOption[];
  };
  selectedPicks: Pick[];
  onPickSelect: (pick: Pick) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  id,
  homeTeam,
  awayTeam,
  commence_time,
  betting_options,
  selectedPicks,
  onPickSelect
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const isPickSelected = (type: string, team: string, point?: string) => {
    return selectedPicks.some(pick => 
      pick.gameId === id && 
      pick.type === type && 
      pick.team === team && 
      pick.point === point
    );
  };

  const matchup = `${awayTeam} @ ${homeTeam}`;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {matchup}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {formatDate(commence_time)}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Spreads */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Spread</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {betting_options.spreads.map((spread) => (
                <Button
                  key={`${spread.name}-spread`}
                  variant={isPickSelected('spread', spread.name, spread.point?.toString()) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => onPickSelect({
                    id: `${id}-${spread.name}-spread`,
                    type: 'spread',
                    team: spread.name,
                    odds: spread.price.toString(),
                    point: spread.point?.toString(),
                    gameId: id
                  })}
                >
                  {spread.name} {spread.point} ({spread.price})
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Moneyline */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Moneyline</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {betting_options.moneyline.map((ml) => (
                <Button
                  key={`${ml.name}-ml`}
                  variant={isPickSelected('moneyline', ml.name) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => onPickSelect({
                    id: `${id}-${ml.name}-ml`,
                    type: 'moneyline',
                    team: ml.name,
                    odds: ml.price.toString(),
                    gameId: id
                  })}
                >
                  {ml.name} ({ml.price})
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Totals */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Total</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {betting_options.totals.map((total) => (
                <Button
                  key={`${total.name}-total`}
                  variant={isPickSelected('total', total.name, total.point?.toString()) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => onPickSelect({
                    id: `${id}-${total.name}-total`,
                    type: 'total',
                    team: total.name,
                    odds: total.price.toString(),
                    point: total.point?.toString(),
                    gameId: id,
                    matchup: matchup
                  })}
                >
                  {total.name} {total.point} ({total.price})
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GameCard; 