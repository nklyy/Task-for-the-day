const {Router} = require('express');
const Todo = require('../models/Todo')
const User = require('../models/User')
const bcryp = require('bcrypt')
const {check, validationResult} = require('express-validator')
const passport = require('passport')
router = Router();

router.get('/', async (req, res) => {
  // попробуй await Todo.find({}).lean()
  // запросы mongoose возвращают свои объекты mongoose с кучей дополнительных свойств, .lean() вернет тупо json из базы монго
  const todos = await Todo.find({}).lean();

  res.render('index', {
    title: 'Todos List',
    isIndex: true,
    todos
  });
});

router.get('/create', (req, res) => {
  res.render('create', {
    title: 'Create Todo',
    isCreate: true
  });
});

router.post('/create', async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    date: Date(),
  })

  await todo.save().catch(err => console.log(err));

  res.redirect('/')
});

router.post('/complete', async (req, res) => {
  const todo = await Todo.findById(req.body.id);

  todo.completed = !!req.body.completed;
  await todo.save();

  res.redirect('/');
})

router.post('/delete', async (req, res) => {
  const todo = await Todo.findByIdAndDelete(req.body.id);

  res.redirect('/')
})

router.get('/login' , (req, res) => {
  res.render('login')
})

router.post('/login' , (req, res, next) => {
  passport.authenticate('local',function (err, user, info) {

    if (err) {
      return res.status(400).json({ message: `Error1 ${err}`})
    }

    if (!user) {
      return res.status(400).json({ message: 'No user found'})
    }

    req.logIn(user, function (err) {
      if (err) {
        return res.status(400).json({ message: `Error2 ${err}`})
      }
      // res.redirect('/')
      return res.status(200).json({success: `logged in ${user.id}`})
    });
  })(req, res, next);
})

router.get('/register' , (req, res) => {
  res.render('register')
})

router.post('/register' ,[
  check('email', 'Некоректный email.').isEmail(),
  check('password', 'Минимальная длинна пароля 6 символов.').isLength({min: 6})
  ],async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Некоректные данные при регестрации.'
      })
    }

    const {name, email, password} = req.body

    const person = await User.findOne({email})

    if (person) {
      return res.status(400).json({message:'Такой пользователь уже существует.'})
    }

    const hashPassword = await bcryp.hash(password, 12)
    const user = new User({
      name: name,
      email: email,
      password: hashPassword
    })
    await user.save()


    // res.status(201).json({message: 'Пользователь успешно создан.'})
    res.redirect('/login')
  } catch (e) {
    res.redirect('/register')
    // res.status(500).json({message: 'Ошибка попробуйте снова!'})
  }

  // res.redirect('/login')
})





module.exports = router;