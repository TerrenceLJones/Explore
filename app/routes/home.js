'use strict';

exports.index = (req, res)=>{
  var user = res.locals.user;
  if(!user){
    res.render('home/index', {title: 'Expore.'});
  }
  else{
    res.redirect(`/${user.username}`);
  }
};
exports.favicon = (req, res)=>{
  console.log('im ignoring');
};
