var sessions = global.nss.db.collection('sessions');
// var traceur = require('traceur');
// var Base = traceur.require(__dirname + '/base.js');
var Mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');

class Session {
  static create(user, journey,fn){
    var session = new Session();
    session.userId = user._id;
    session.journeyId = journey._id;
    session.lastUncompletedStop = [];
    session.completedStops =[];
    session.uncompletedStop = [];
    journey.stops.forEach(s=>{
      session.uncompletedStop.push(s._id);});
    session.isJourneyComplete = false;
    sessions.save(session, (err,session)=>fn(session));
  }
  static doesSessionExist(uId, jId, fn){
    uId = Mongo.ObjectID(uId);
    jId = Mongo.ObjectID(jId);
    sessions.findOne({ $and: [ {userId:uId}, {journeyId:jId} ] }, (err,session)=>{
      if(session._id instanceof ObjectID){
        fn(session);
      }
      else{
        fn(null);
      }
    });
  }

  static findById(id, fn){
    id = Mongo.ObjectID(id);
    sessions.findOne({_id:id}, (e,s)=>{
      if(s){
        s = _.create(Session.prototype, s);
        fn(s);
      }
      else{
        fn(null);
      }
    });
  }
//
//   static findAll(fn) {
//   Base.findAll(users, User, fn);
//   }
//



}

module.exports = Session;
