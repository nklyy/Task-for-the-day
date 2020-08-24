module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Пожалуйста, авторизуйтесь для просмотра этого ресурса.')
    res.redirect('/login')
  },

  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next()
    }

    res.redirect('/')
  }
};
