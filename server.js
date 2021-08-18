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
const FBeamer = require("./fbeamer");
const { Telegraf } = require('telegraf')

// load env variable
dotenv.config({ path: './configs/dev.env' });

connectMongoDb();

const authRoutes = require('./routes/auth_router');
const categoriesRoutes = require('./routes/categories_router');
const coursesRoutes = require('./routes/course_router');
const administratorGroupRouter = require('./routes/administrator_router');
const teacherGroupRouter = require('./routes/teacher_group_router');
const { findAllCategories } = require('./controllers/categories_controller');
const { getNestedChildren } = require('./utils/buildTree');
const Categories = require('./models/Categories');
const Courses = require('./models/Courses');
const { SearchCoursesChatBot } = require('./services/courses_service');

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

// var whitelist = ['http://localhost', 'http://localhost:5000', 'http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001']
// var corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             console.log(origin);
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

app.use(cors());

app.use(CookieParser());

app.use(logger);

app.use(fileUpload());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/teacher', teacherGroupRouter);
app.use('/api/admin', administratorGroupRouter);

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log('Response time: %sms', ms)
})

bot.command('start', ctx => {
    console.log(ctx.from)
    let animalMessage = `Chào mừng bạn tới acedemy online. Bạn có thể tìm kiếm khoá học bằng các lựa chọn dưới đây !`;
    ctx.deleteMessage();
    bot.telegram.sendMessage(ctx.chat.id, animalMessage, {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "Từ khoá",
                    callback_data: 'keyword'
                },
                {
                    text: "Danh mục",
                    callback_data: 'categories'
                }
                ],
            ]
        }
    })
});

bot.action("categories", async (ctx) => {
    const result = await Categories.find({ "ancestors._id": "60d85940ef2cf51421b2f839" })
        .select({ "_id": true, "name": true })
        .exec();
    const buttons = result.map((item, index) => {
        return {
            text: item.name,
            callback_data: "categoryID-" + item._id
        }
    });
    bot.telegram.sendMessage(ctx.chat.id, "Danh mục", {
        reply_markup: {
            inline_keyboard: [buttons]
        }
    })
});

bot.action("keyword", async (ctx) => {
    let animalMessage = `Để tìm kiếm khoá học vui lòng nhập theo cú pháp /search-keyword`;
    ctx.deleteMessage();
    bot.telegram.sendMessage(ctx.chat.id, animalMessage)
});

bot.action(/categoryID+/, async (ctx) => {
    try {
        let category_id = ctx.match.input.substring(11);
        const result = await Categories.find({ "ancestors._id": category_id })
            .select({ "_id": true })
            .exec();
        let categories = [];
        JSON.parse(JSON.stringify(result)).map(item => {
            return categories.push({ categories_id: item._id })
        });
        categories.push({ categories_id: category_id });
        const courses = await Courses.find({ $or: categories, is_published: true });
        if (courses.length > 0) {
            courses.map(async (item, index) => {
                const avatar = process.env.URL_IMAGE + item.avatar;
                console.log(avatar);
                return await bot.telegram.sendPhoto(ctx.chat.id, avatar, {
                    caption: item.title,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Xem chi tiết khoá học",
                                    url: "https://hatto.com/"
                                }
                            ]
                        ]
                    }
                });
            })
        } else {
            bot.telegram.sendMessage(ctx.chat.id, "Không tìm thấy khoá học trong danh mục này !")
        }
    } catch (error) {
        console.log(error);
    }
});

bot.action(/courseID+/, (ctx) => {
    let course_id = ctx.match.input.substring(9);

});

bot.command('/search', async (ctx) => {
    try {
        console.log(ctx.match)
        let query = ctx.match.input.substring(7);
        console.log(query);
        const result = await SearchCoursesChatBot(query);
        if (result.length > 0) {
            result.map(async (item, index) => {
                const avatar = process.env.URL_IMAGE + item.avatar;
                console.log(avatar);
                return await bot.telegram.sendPhoto(ctx.chat.id, avatar, {
                    caption: item.title,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Xem chi tiết khoá học",
                                    url: "https://hatto.com/"
                                }
                            ]
                        ]
                    }
                });
            })
        } else {
            bot.telegram.sendMessage(ctx.chat.id, "Không tìm thấy khoá học !")
        }
    } catch (error) {
        console.log(error);
    }
});

bot.launch();

app.use(errorHandle);

const port = process.env.PORT || 5000

const server = app.listen(port, console.log(`server is running in ${process.env.NODE_ENV} mode on port ${port}`));

process.on('unhandledRejection', (err, promise) => {
    console.log(`ERROR: ${err.message}`);
    server.close(() => process.exit(1));
});