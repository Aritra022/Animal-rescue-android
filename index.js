require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})
const app = express();

app.use(express.json());

app.get('/', function (req, res) {
    res.send("This is Home Page of Pet REscue Department....!!!")
});

// To serve uploaded files
app.use('/Uploads', express.static('uploads'));

const  petscontroller = require('./controller/UserController')
app.use('/pets', petscontroller)

app.listen(4000, () => {
    console.log(`Server Started at ${4000}`)
})