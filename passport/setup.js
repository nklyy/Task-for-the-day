const bcrypt = require('bcrypt')
const User = require('../models/User')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = await User.findOne({ email: email })

  if (!user) {
    return done(null, false, {message: 'Пользоввателя с таким email не существует'})
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user)
    } else {
      return done(null, false, {message: 'Не правильный пароль'})
    }
  } catch (e) {
    return done(e)
  }
}))

module.exports = passport