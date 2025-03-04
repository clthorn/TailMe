const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const subscriptionsRoutes = require('./routes/subscriptions');
const picksRoutes = require('./routes/picks');
const creatorsRoutes = require('./routes/creators');
const oddsRoutes = require('./routes/odds');
const usersRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/picks', picksRoutes);
app.use('/api/creators', creatorsRoutes);
app.use('/api/odds', oddsRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


