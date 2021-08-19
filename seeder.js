const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load all env 
dotenv.config({ path: './configs/dev.env' });

// load model
const Categories = require('./models/Categories');
const Course_Favorite = require('./models/Course_Favorite');
const Course_Register = require('./models/Course_Register');
const Course_Review = require('./models/Course_Review');
const Courses = require('./models/Courses');
const Lessons = require('./models/Lessons');
const Students = require('./models/Students');
const Tutors = require('./models/Tutors');
const User = require('./models/User');


mongoose.connect(process.env.MONGODB_URL, {
    auth: {
        user: 'root',
        password: '123123'
    },
    authSource: "admin",
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})


// Read Json file

const categories = JSON.parse(fs.readFileSync(`${__dirname}/_data/categories.json`), 'utf-8');
const coursefavorites = JSON.parse(fs.readFileSync(`${__dirname}/_data/coursefavorites.json`), 'utf-8');
const courseregisters = JSON.parse(fs.readFileSync(`${__dirname}/_data/courseregisters.json`), 'utf-8');
const coursereviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/coursereviews.json`), 'utf-8');
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`), 'utf-8');
const lessons = JSON.parse(fs.readFileSync(`${__dirname}/_data/lessons.json`), 'utf-8');
const students = JSON.parse(fs.readFileSync(`${__dirname}/_data/students.json`), 'utf-8');
const tutors = JSON.parse(fs.readFileSync(`${__dirname}/_data/tutors.json`), 'utf-8');
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`), 'utf-8');


const importData = async () => {
    try {
        // await Categories.create(categories);
        // await Course_Favorite.create(coursefavorites);
        // await Course_Register.create(courseregisters);
        // await Course_Review.create(coursereviews);
        // await Courses.create(courses);
        // await Lessons.create(lessons);
        // await Students.create(students);
        // await Tutors.create(tutors);
        await User.create(users);

        console.log('Data imported ...'.green.inverse);
        process.exit(1);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const deleteData = async () => {
    try {
        await Categories.deleteMany();
        await Course_Favorite.deleteMany();
        await Course_Register.deleteMany();
        await Course_Review.deleteMany();
        await Courses.deleteMany();
        await Lessons.deleteMany();
        await Students.deleteMany();
        await Tutors.deleteMany();
        await User.deleteMany();
        console.log('Data destroyed ...'.red.inverse);
        process.exit(1);

    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}


if (process.argv[2] === '-i') {
    console.log('Import Data');
    importData();
} else if (process.argv[2] === '-d') {
    console.log('Delete Data');
    deleteData();
}
