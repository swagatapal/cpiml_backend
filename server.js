require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const firebaseAdmin = require('./firebase'); // Require the firebase initialization

const app = express();

// Initialize Firebase Admin SDK (moved to firebase.js)
// if (config.firebase.serviceAccount && config.firebase.serviceAccount !== '') {
//   admin.initializeApp({
//     credential: admin.credential.cert(JSON.parse(config.firebase.serviceAccount))
//   });
//   console.log('Firebase Admin SDK initialized');
// } else {
//   console.warn('Firebase service account not provided or is empty. Push notifications will not be enabled.');
// }

// Middleware
app.use(express.json());
app.use(cors({
  origin: [

    'https://cpiml-frontend.onrender.com', // production domain
    'https://cpiml-frontend.onrender.com/api/auth',
    'https://cpiml-frontend.onrender.com/api/news',
    'https://cpiml-frontend.onrender.com/api/upload',
    'https://cpiml-frontend.onrender.com/api/location'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

app.use((req, res, next) => {
  console.log(`[IN] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
}); 

// Basic route
app.get('/', (req, res) => {
  console.log('API is running...');
  res.send('API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/location', require('./routes/location'));

// Generic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console
  res.status(500).send('Something broke on the server!');
});

const PORT = config.port;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
