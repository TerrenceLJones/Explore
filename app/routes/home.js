'use strict';

exports.index = (req, res)=>{
  res.render('home/index', {title: 'Expore.'});
};
exports.favicon = (req, res)=>{
  console.log('im ignoring');
};
