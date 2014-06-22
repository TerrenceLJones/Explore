'use strict';

var traceur = require('traceur');
var Journey = traceur.require(__dirname + '/../models/journey.js');
var Session = traceur.require(__dirname + '/../models/session.js');
var User = traceur.require(__dirname + '/../models/user.js');


exports.index = (req, res)=>{
  Journey.findAll(journeys=>{
    res.render('journeys/index', {journeys:journeys, title: 'Worldwide Journeys'});
  });
};

exports.new = (req, res)=>{
  res.render('journeys/new', {title: 'Create a Journey'});
};

exports.addStop = (req, res)=>{
  console.log(req.body.location);
  var location = req.body.location;
  // console.log(req.body.location);
  res.render('journeys/addStop', {location:location}, (err,html)=>{
    res.send(html);
  });
};

exports.create = (req, res)=>{
  Journey.create(res.locals.user._id, req.body, ()=>{
    res.redirect('/journeys');
  });
};

exports.show = (req, res)=>{
  Journey.findById(req.params.id, journey=>{
    res.render('journeys/show', {loggedInUser:res.locals.user, journey:journey, title:journey.name});
  });
};

exports.edit = (req, res)=>{
  Journey.findById(req.params.id, journey=>{
    res.render('journeys/edit', {journey:journey, title: `Edit ${journey.name}`});
  });
};

exports.update = (req, res)=>{
  Journey.findById(req.params.id, journey=>{
    journey.update(req.body);
      journey.save((journey)=>{
        res.redirect('/journeys');
      });
    });
};

exports.destroy = (req,res)=>{
  Journey.destroyById(req.params.id, ()=>{
    if(true){
      res.redirect('/journeys');
    }
  });
};

exports.filter = (req,res)=>{
  Journey.filter(req.query.searchParams, journeys=>{
        res.render('journeys/journeys-filter-partial',{journeys:journeys}, (e,html)=>{
          res.send(html);
        });
  });
};

exports.begin = (req, res)=>{
  User.findById(res.locals.user._id, user=>{
    Journey.findById(req.params.id, journey=>{
      Session.doesSessionExist(user._id, journey._id, session=>{
        if(session){
          Session.findById(session._id, session=>{
            res.render('journeys/begin', {session:session, journey:journey, title:'Begin Your Journey'});
          });
        }
        else{
          Session.create(journey, session=>{
            user.addSessionToUser(session, ()=>{
              res.render('journeys/begin', {session:session, journey:journey, title:'Begin Your Journey'});
            });
          });
        }
      });
    });
  });
};
