const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const errorHandle = require('./middlewares/errorHandle');
const logger = require('./middlewares/logger');
const connectMongoDb = require('./configs/db');
const CookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean')
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const cors = require('cors');

// load env variable
dotenv.config({ path: './configs/dev.env' });

connectMongoDb();

const authRoutes = require('./routes/auth_router');
const categoriesRoutes = require('./routes/categories_router');
const coursesRoutes = require('./routes/course_router');
const administratorGroupRouter = require('./routes/administrator_router');
const teacherGroupRouter = require('./routes/teacher_group_router');

const app = express();

// body parse
app.use(express.json());

app.use(mongoSanitize());

app.use(helmet());

app.use(xss());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.use(hpp()); // <- THIS IS THE NEW LINE

var whitelist = ['http://localhost', 'http://localhost:5000', 'http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            console.log(origin);
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));

app.use(CookieParser());

app.use(logger);

app.use(fileUpload());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/teacher', teacherGroupRouter);
app.use('/api/admin', administratorGroupRouter);

app.use(errorHandle);


const port = process.env.PORT || 5000

const server = app.listen(port, console.log(`server is running in ${process.env.NODE_ENV} mode on port ${port}`));

process.on('unhandledRejection', (err, promise) => {
    console.log(`ERROR: ${err.message}`);
    server.close(() => process.exit(1));
});