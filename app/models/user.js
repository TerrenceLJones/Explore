var bcrypt   = require('bcrypt');
var users = global.nss.db.collection('users');
var Mongo = require('mongodb');
// var fs = require('fs');
var _ = require('lodash');
// var path = require('path');
// var rimraf = require('rimraf');
var request = require('request');

class User {
  static localCreate(obj,fn){
    users.findOne({email:obj.email}, (e,u)=>{
        if(u){
          fn(null);
        }
        else{
          var user = new User();
          user.password = '';
          user.email = obj.email;
          user.isValid = false;
          user.isProfileInitialized = false;
          users.save(user, ()=>{
            sendVerificationEmail(user,fn);
          });
        }
      });
  }

  static findById(id, fn){
    id = Mongo.ObjectID(id);
    users.findOne({_id:id}, (e,u)=>{
      if(u){
        u = _.create(User.prototype, u);
        fn(u);
      }
      else{
        fn(null);
      }
    });
  }

  static login(obj, fn){
    users.findOne({email:obj.email}, (e,u)=>{
      if(u){
        var isMatch = bcrypt.compareSync(obj.password, u.password);
        if(isMatch){
          fn(u);
        }else{
          fn(null);
        }
      }else{
        fn(null);
      }
    });
  }


  save(fn) {
    users.save(this, ()=>fn());
  }

  makeValid(password,fn){
    this.isValid = true;
    this.password = bcrypt.hashSync(password.password, 8);
    users.save(this, ()=>fn(this));
  }

}


function sendVerificationEmail(user, fn){
  'use strict';

  var key = process.env.MAILGUN;
  var url = 'https://api:' + key + '@api.mailgun.net/v2/sandbox3bdc41df5efa46f0bdd1b697b000734f.mailgun.org/messages';
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
