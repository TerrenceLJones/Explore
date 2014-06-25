var users = global.nss.db.collection('users');
var sessions = global.nss.db.collection('sessions');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/base.js');
var bcrypt   = require('bcrypt');
var Mongo = require('mongodb');
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var request = require('request');
var rimraf = require('rimraf');

class User {
  static localCreate(obj,fn){
    users.findOne({email:obj.email}, (e,u)=>{
        if(u){
          fn(null);
        }
        else{
          var user = new User();
          user.email = obj.email;
          user.username = '';
          user.password = '';
          user.name = '';
          user.joinDate = new Date();
          user.location = '';
          user.tagLine = '';
          user.photo = '';
          user.badges = [];
          user.sessions = [];
          user.createdJournies = [];
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

  static findByUsername(username, fn){
    users.findOne({username:username}, (e,u)=>{
      if(u){
        u = _.create(User.prototype, u);
        fn(u);
      }
      else{
        fn(null);
      }
    });
  }

    static findAll(fn) {
    Base.findAll(users, User, fn);
  }

  static login(obj, fn){
    users.findOne({$or :[{email:obj.username}, {username:obj.username}]}, (e,u)=>{
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

  static destroyById(userId, fn) {
    userId = Mongo.ObjectID(userId);
    users.findAndRemove({_id:userId}, (e,u)=>{
      rimraf(u.photoDir, ()=> {
        fn(true);
      });
    });
  }

  filter(searchParams, fn) {
    searchParams = searchParams.toLowerCase().replace(/,/g,' ').split(' ').filter(Boolean);
    users.find({ $or: [ { location: { $in: searchParams} },
                        { name:     { $in: searchParams } },
                        { username: { $in: searchParams } }
                      ]
                    }).toArray((err, users)=>{
                        users = users.map(u=>_.create(User.prototype, u));
                        // users = users.filter(u=>this._id.toString()!==u._id.toString());
                        fn(users);
         });
  }

  save(fn) {
    users.save(this, ()=>fn(this));
  }

  makeValid(password,fn){
    this.isValid = true;
    this.password = bcrypt.hashSync(password.password, 8);
    users.save(this, ()=>fn(this));
  }

  update(fields, files){
    if(fields && typeof(fields.name) !== 'undefined') {
      if(!this.isCreated) {
        this.isCreated = true;
      }
      this.name = fields.name[0].toLowerCase();
      this.email= fields.email[0];
      this.username= fields.username[0];
      this.location = fields.location[0].toString();
      this.tagLine = fields.tagLine[0];
      this.isProfileInitialized = true;

      if(files.photo[0].size !== 0){
        this.photo = `/img/${this._id.toString()}/${files.photo[0].originalFilename}`;
        var userDir = `${__dirname}/../static/img/${this._id.toString()}`;
        userDir = path.normalize(userDir);
        this.photoPath = `${userDir}/${files.photo[0].originalFilename}`;
        this.photoDir = userDir;
        if(!fs.existsSync(userDir)){
          fs.mkdirSync(userDir);
        }
        fs.renameSync(files.photo[0].path, this.photoPath);
      }
    }
  }

  newPassword(password,fn){
    this.password = bcrypt.hashSync(password, 8);
    // user.password = password;
    users.save(this, ()=>fn());
  }

  addSessionToUser(session, fn){
    this.sessions.push(session._id);
    users.save(this, ()=>fn());
  }

  findAllSessions(fn){
    this._id = Mongo.ObjectID(this._id);
    sessions.find({userId:this._id}).toArray((e,sessions)=>{
      fn(sessions);
    });
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
