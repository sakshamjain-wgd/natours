const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')

const Tour = require('./../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({path: './.env'})

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
)
// .connect(process.env.DATABASE_LOCAL)
mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async() => {
    try {
        await Tour.create(tours);
        // await User.create(users, { validateBeforeSave: false });
        // await Review.create(reviews);
        console.log('Data succesfully loaded');
        
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

const deleteData = async() => {
    try {
        await Tour.deleteMany();
        // await User.deleteMany();
        // await Review.deleteMany();
        console.log('Data succesfully deleted');
        
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    importData();
}
else if(process.argv[2] === '--delete'){
    deleteData();
}