const {Router} = require('express');
const Todo = require('../models/Todo')
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
      date: Date()
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

module.exports = router;