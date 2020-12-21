const {Router} = require('express');
const Todo = require('../models/Todo')
const User = require('../models/User')
const bcryp = require('bcrypt')
const {check, validationResult} = require('express-validator')
const passport = require('passport')
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth')
router = Router();
const csrf = require('csurf')

const csrfProtection = csrf()
//router.use(csrfProtection) //-- Что бы защитить все роуты

router.get('/', csrfProtection, ensureAuthenticated, async (req, res) => {
  const todos = await Todo.find({owner: req.user.id}).lean();
  res.render('index', {
    title: 'Todos List',
    isIndex: true,
    todos,
    csrfToken: req.csrfToken()
  });
});

router.get('/create', csrfProtection, ensureAuthenticated ,(req, res) => {
  res.render('create', {
    title: 'Create Todo',
    isCreate: true,
    csrfToken: req.csrfToken()
  });
});

router.post('/create', csrfProtection,async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    date: Date(),
    owner: req.user.id
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

router.get('/login', csrfProtection, forwardAuthenticated, (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken()
  })
})

router.post('/login',csrfProtection, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/register', csrfProtection,forwardAuthenticated, (req, res) => {
  res.render('register', {
    csrfToken: req.csrfToken()
  })
})

router.post('/register' , csrfProtection,[
  check('email', 'Некоректный email.').isEmail(),
  check('password', 'Минимальная длинна пароля 6 символов.').isLength({min: 6})
  ],async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return  res.render('register', {
        errors: errors.array()
      })
    }

    const {name, email, password} = req.body
    const person = await User.findOne({email})

    if (person) {
      let errorsPerson = [];
      errorsPerson.push({msg: 'Такой пользователь уже существует.'})
      return res.render('register', {
        errorsPerson
      })
    }

    const hashPassword = await bcryp.hash(password, 12)
    const user = new User({
      name: name,
      email: email,
      password: hashPassword
    })
    await user.save()

    req.flash('success_msg', 'Пользователь успешно создан.')

    res.redirect('/login')
  } catch (e) {
    res.redirect('/register')
  }
})

router.get('/logout', csrfProtection,(req, res) => {
  req.logout();
  res.redirect('/login')
})

router.get('/:id', csrfProtection, ensureAuthenticated, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    res.render('update', {
      idUp: todo._id,
      csrfToken: req.csrfToken()
    })
  } catch (e) {
    res.render('404')
  }
})

router.post('/update', csrfProtection, async (req, res) => {
  const todo = await Todo.findById(req.body.id)
  todo.title = req.body.title
  await todo.save()
  res.redirect('/')
})

router.get('*', (req, res) => {
  res.render('404', {
  })
})

module.exports = router;
