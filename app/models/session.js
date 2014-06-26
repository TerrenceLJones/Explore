var sessions = global.nss.db.collection('sessions');
// var journeys = global.nss.db.collection('journeys');
var users = global.nss.db.collection('users');
// var traceur = require('traceur');
// var Base = traceur.require(__dirname + '/base.js');
var Mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
// var async = require('async');


class Session {
  static create(user, journey,fn){
    var session = new Session();
    session.userId = user._id;
    session.journeyId = journey._id;
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
    var session = {};
    session._id = Mongo.ObjectID(this._id);
    session.userId = Mongo.ObjectID(this.userId);
    session.journeyId = Mongo.ObjectID(this.journeyId);
    session.isJourneyComplete = false;
    session.stops = [];

    this.stops.forEach(s=>{
      s._id = s._id.toString();
      var newStop = {};
      if(s._id === stop._id){
        newStop.name = s.name;
        newStop._id = Mongo.ObjectID(s._id);
        newStop.desc = s.desc;
        newStop.lat = s.lat;
        newStop.lng = s.lng;
        newStop.isComplete = true;
      }
      else if(s._id !== stop._id) {
        newStop.name = s.name;
        newStop._id = Mongo.ObjectID(s._id);
        newStop.desc = s.desc;
        newStop.lat = s.lat;
        newStop.lng = s.lng;
        newStop.isComplete = s.isComplete;
      }
      session.stops.push(newStop);

    });
    sessions.save(session, ()=>fn(session));
  }

  findAllUncompleteStops(session, fn){
    var uncompleted = [];
    session.stops.forEach(s=>{
      if(s.isComplete === false){
        uncompleted.push(s);
      }
    });
    fn(uncompleted);
  }

  static journeyStatus(session,user,journey,fn){
    user._id = Mongo.ObjectID(user._id);
    
    var stopsRemain = _.some(session.stops, {'isComplete': 'false'});
    console.log('stopsRemail');
    console.log(stopsRemain);
    if (stopsRemain === false){
      session._id = Mongo.ObjectID(session._id);
      sessions.update({_id:session._id}, {$set:{isJourneyComplete: true}}, ()=>{});
      users.update({_id:user._id},{$push: {badges:journey.badgeImg}},()=>fn(true));
    }
    else {
      fn(false);
    }
  }

//   static findJourneysBySessionId(sesses, fn){
//     async.map(sesses, function(id, callback) {
//     getFromStorage(id, function (err, res) {
//         if (err) return callback(err);
//         callback(null, res.name);
//     })
// }, function(err, results) {
//     // results is an array of names
//
//
//     async.map(sesses, (s,fn)=>journeys.findOne({_id:s.journeyId}, (e,journey)=>fn(null,journey)), (e,journ)=>j.push(journ));
//
//
//     async.
//     if(sesses.length<=1){
//       var j  = [];
//
//     }
//     else{
//       var j  = [];
//       sesses.forEach(s=>{
//         journeys.find({_id:s.journeyId}, (err,journ)=>{
//           j.push(journ);
//         });
//       });
//     }
//   }
}

module.exports = Session;
