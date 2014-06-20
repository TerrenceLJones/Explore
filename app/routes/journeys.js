'use strict';

var traceur = require('traceur');
var Journey = traceur.require(__dirname + '/../models/journey.js');

exports.index = (req, res)=>{
  Journey.findAll(journeys=>{
    res.render('journeys/index', {journeys:journeys, title: 'Worldwide Journeys'});
  });
};

exports.new = (req, res)=>{
  res.render('journeys/new', {title: 'Create a Journey'});
};

exports.addStop = (req, res)=>{
  var location = req.body.location;
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
