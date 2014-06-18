'use strict';

exports.index = (req, res)=>{
  res.render('journeys/index', {title: 'Worldwide Journeys'});
};
