const express = require('express');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session'); // Import express-session
const nocache = require('nocache');
const customConfig = require('./config/config');
const app = express();

// Apply nocache middleware globally
app.use(nocache());

// Session configuration
app.use(session({
    secret: customConfig.sessionSecret, // Replace with your secret
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 60000 }
}));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/user_management_system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set view engine and layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayout);
app.set('layout', 'layouts/layout');

app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin', adminRoute);

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
