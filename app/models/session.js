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
    // session.lastUncompletedStop = [];
    session.stops = [];
    journey.stops.forEach(s=>{
      s.isComplete = false;
      session.stops.push(s);
      });
    session.isJourneyComplete = false;
    sessions.save(session, (err,session)=>fn(session));
  }
  static doesSessionExist(uId, jId, fn){
    uId = Mongo.ObjectID(uId);
    jId = Mongo.ObjectID(jId);
    sessions.findOne({ $and: [ {userId:uId}, {journeyId:jId} ] }, (err,session)=>{
      if(session !== null){
        if(session._id instanceof ObjectID){
          fn(session);
        }
        else{
          fn(null);
        }
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

  completeStop(stop, fn){
    this._id = Mongo.ObjectID(this._id);
    this.userId = Mongo.ObjectID(this.userId);
    this.journeyId = Mongo.ObjectID(this.journeyId);

    this.stops.forEach(s=>{
      if(s._id === stop._id){
        s._id = Mongo.ObjectID(s._id);
        s.isComplete = true;
      }
    });
    sessions.save(this, (err,session)=>fn());
  }

  findAllUncompleteStops(session, fn){
    var uncompleted = [];
    session.stops.forEach(s=>{
      if(s.isComplete === false){
        console.log(s);
        uncompleted.push(s);
      }
    });
    fn(uncompleted);
  }


//   static findAll(fn) {
//   Base.findAll(users, User, fn);
//   }
//



}

module.exports = Session;
