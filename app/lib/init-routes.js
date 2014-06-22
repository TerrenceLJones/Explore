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
  app.get('/logout', dbg, users.logout);


  app.all('*', users.bounce);


  app.get('/journeys', dbg, journeys.index);
  app.get('/journeys/search', dbg, journeys.filter);
  app.post('/journeys', dbg, journeys.create);
  app.get('/journeys/new', dbg, journeys.new);
  app.post('/journeys/new/addstop', dbg, journeys.addStop);
  app.get('/journeys/play/:id', journeys.begin);
  app.get('/journeys/:id', dbg, journeys.show);
  app.get('/journeys/:id/edit', dbg, journeys.edit);
  app.post('/journeys/:id/delete', dbg, journeys.destroy);
  app.post('/journeys/:id', dbg, journeys.update);




  // app.get('/journeys/:journeyname', dbg, journeys.show);

  app.get('/dash', dbg, users.profile);

  app.get('/favicon.ico', dbg, home.favicon);
  app.get('/:username', dbg, users.profile);
  app.get('/:username/edit', dbg, users.edit);
  app.post('/:username',dbg, users.update);
  app.post('/:username/password/new', dbg, users.newPassword);
  app.post('/:username/delete/:id', dbg, users.destroy);

  app.get('/users/all', dbg, users.findAll);
  app.get('/users', dbg, users.filter);


  fn();
}
