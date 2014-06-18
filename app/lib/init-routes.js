'use strict';

var traceur = require('traceur');
var dbg = traceur.require(__dirname + '/route-debugger.js');
// var passport = require('passport');
// var passConfig = require(__dirname + '/../../config/passport.js');
//
// passConfig(passport);

var initialized = false;

module.exports = (req, res, next)=>{
  if(!initialized){
    initialized = true;
    load(req.app, next);
  }else{
    next();
  }
};

function load(app, fn){
  var home = traceur.require(__dirname + '/../routes/home.js');
  var users = traceur.require(__dirname + '/../routes/users.js');
  var journeys = traceur.require(__dirname + '/../routes/journeys.js');


  // app.use(passport.initialize());
  // app.use(passport.session());

  app.all('*', users.lookup);

  app.get('/', dbg, home.index);

  app.post('/signup', dbg, users.createUserLocal);
  app.post('/signup/complete/:id', dbg, users.completeLocal);

  app.get('/verifyemail', dbg, users.verifyEmail);
  app.get('/verify/:id', dbg, users.verifyLocal);

  app.get('/login', dbg, users.loginPage);
  app.post('/login', dbg, users.loginLocal);


  app.all('*', users.bounce);

  app.get('/:username', dbg, users.profile);
  app.get('/:username/edit', dbg, users.edit);
  app.post('/:username/edit',dbg, users.update);
  app.post('/:username/password/new', dbg, users.newPassword);
  app.post('/:username/delete/:id', dbg, users.destroyUserAccount);
  app.get('/users/all', dbg, users.findAll);
  app.get('/users', dbg, users.filter);



  app.get('/journeys', dbg, journeys.index);
  app.get('/journeys/new', dbg, journeys.new);

  fn();
}
