const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const authtRoutes = require('./routes/authRoutes');
require('dotenv').config;

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authtRoutes);
app.use('/api/products', productRoutes);

mongoose.connect(process.env.MONGODB)
    .then(()=> {
        console.log("MongoDB connected successfully")
        app.listen(PORT, () => {
            console.log(`Server is running on Port - ${PORT}`)
        })
    })
    .catch( (error) => {
        console.log(`Error while connecting to MongoDB - ${error}`)
    });