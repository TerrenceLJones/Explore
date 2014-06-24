'use strict';

var traceur = require('traceur');
var User = traceur.require(__dirname + '/../models/user.js');
// var passport = require('passport');
var multiparty = require('multiparty');


exports.lookup = (req, res, next)=>{
  User.findById(req.session.userId, user=>{
    if(user){
      res.locals.user = user;
    }else{
      res.locals.user = null;
    }
    next();
  });
};

exports.bounce = (req, res, next)=>{
  if(res.locals.user){
    next();
  }else{
    res.redirect('/');
  }
};

exports.createUserLocal = (req, res)=>{
  User.localCreate(req.body, user=>{
    if(user){
      res.redirect('/verifyemail');
    }
    else{
      res.redirect('/');
    }
  });
};

exports.verifyEmail = (req,res)=>{
  res.render('users/email',{title:'Check Email'});
};

exports.verifyLocal = (req, res)=>{
  User.findById(req.params.id, u=>{
    res.render('users/verify', {u:u, title: 'User Verification'});
  });
};

exports.completeLocal = (req, res)=>{
    User.findById(req.params.id, user=>{
      user.makeValid(req.body, u=>{
        if(u){
          res.redirect('/login');
        }
        else{
          res.redirect('/register');
        }
      });
    });
};

exports.loginPage = (req,res)=>{
  res.render('users/login', {title: 'User Login'});
};

exports.loginLocal = (req, res)=>{
  User.login(req.body, user=>{
    if(user){
      req.session.userId = user._id;
      if(!user.isProfileInitialized){
        res.redirect(`/${user.username}/edit`);
      }
      else{
        res.redirect(`/${user.username}`);
      }
    }
    else {
      req.session.userId = null;
      res.redirect('/');
    }
  });
};

exports.logout = (req, res)=>{
  req.session = null;
  res.redirect('/');
};

exports.profile = (req, res)=>{
  var username;

  if(req.params.username === undefined){
    username = res.locals.user.username;
  }
  else{
    username = req.params.username;
  }

  User.findByUsername(username, user=>{
    res.render('users/profile', {loggedInUser:res.locals.user, profileOwner:user, title: 'Dashboard'});
  });
};

exports.edit = (req, res)=>{
  res.render('users/edit', {user:res.locals.user, title: 'Edit Profile'});
};

exports.update = (req, res)=>{
  var form = new multiparty.Form();
  var user = res.locals.user;

  form.parse(req, (err, fields, files)=>{
    user.update(fields, files);
      user.save((user)=>{
        res.redirect(`/${user.username}`);
      });
    });
};

exports.newPassword = (req,res)=>{
  User.findById(res.locals.user._id, user=>{
    user.newPassword(req.body.password, ()=>{
      user.save((user)=>{
        res.redirect(`/${user.username}`);
      });
    });
  });
};

exports.destroy = (req,res)=>{
  User.destroyById(res.locals.user._id, ()=>{
    if(true){
      res.redirect('/');
    }
  });
};

exports.findAll = (req,res)=>{
  User.findAll(users=>{
    res.render('users/index',{users:users, title:'Explorer\'s Search Page'});
  });
};

exports.filter = (req,res)=>{
  User.findById(res.locals.user._id, u=>{
    u.filter(req.query.search, users=>{
        res.render('users/users-filter-partial',{users:users}, (e,html)=>{
          res.send(html);
        });
    });
  });
};
