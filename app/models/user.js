// var bcrypt   = require('bcrypt-nodejs');
var users = global.nss.db.collection('users');
// var fs = require('fs');
// var _ = require('lodash');
// var path = require('path');
// var rimraf = require('rimraf');
var request = require('request');



class User {
  static create(obj,fn){
    users.findOne({email:obj.email}, (err,user)=>{
      if(user){
        fn(null);
      }
      else {
        user = new User ();
        user.name = '';
        user.email = obj.email;

        users.save(user, ()=>{
          sendVerificationEmail(user, fn);
        });
      }
    });
  }

  save(fn) {
    users.save(this, ()=>fn());
  }
}

function sendVerificationEmail(user, fn){
  'use strict';

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox7244.mailgun.org/messages';
  var post = request.post(url, function(err, response, body){
    console.log('SENDING MESSAGE***********');
    console.log(body);
    fn(user);
  });

  var form = post.form();
  form.append('from', 'admin@explore.com');
  form.append('to', user.email);
  form.append('subject', 'Please verify your email address on Expore');
  form.append('html', `<a href="http://localhost:3000/verify/${user._id}">Click to Verify</a>`);
}

module.exports = User;
