'use strict';

exports.index = (req, res)=>{
  res.render('journeys/index', {title: 'Worldwide Journeys'});
};

exports.new = (req, res)=>{
  res.render('journeys/new', {title: 'Create a Journey'});
};
