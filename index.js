const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const todoRoutes = require('./routes/todos');
const path = require('path');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('./passport/setup')

const PORT = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(
  session({
    secret: 'very secret this is',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.use(express.urlencoded({ extended:true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

app.use(todoRoutes);

async function start() {
    try {
        await mongoose.connect("mongodb+srv://nkly:Maximum78952@cluster0.7j7rj.mongodb.net/todos", {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => {
            console.log(`Server has been started... ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start().catch(err => console.log(err));