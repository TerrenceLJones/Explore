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

  app.get('/verify/:id', dbg, users.verifyLocal);

  app.post('/login', dbg, users.loginLocal);

  app.all('*', users.bounce);

  app.get('/users/dash', dbg, users.dash);
  app.get('/users/edit', dbg, users.edit);
  app.post('/users/edit',dbg, users.update);
  app.post('/users/password/new', dbg, users.newPassword);
  app.post('/users/delete/:id', dbg, users.destroyUserAccount);

  app.get('/journeys', dbg, journeys.index);
  app.get('/journeys/new', dbg, journeys.new);

  fn();
}
