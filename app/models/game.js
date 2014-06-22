// var journeySessions = global.nss.db.collection('journeySessions');
// var traceur = require('traceur');
// var Base = traceur.require(__dirname + '/base.js');
// var Mongo = require('mongodb');

class Session {
  static create(user,obj,fn){
    var session = new Session();
    session.journeyId = obj._id;
    session.lastUncompletedStop = [];
    session.completedStops =[];
    session.uncompletedStop = [];
    obj.stops.forEach(s=>{
      console.log(s);
      session.uncompletedStop.push(s._id);});
    session.isJourneyComplete = false;
    fn(session);
  }
//
//   static findById(id, fn){
//     id = Mongo.ObjectID(id);
//     users.findOne({_id:id}, (e,u)=>{
//       if(u){
//         u = _.create(User.prototype, u);
//         fn(u);
//       }
//       else{
//         fn(null);
//       }
//     });
//   }
//
//   static findAll(fn) {
//   Base.findAll(users, User, fn);
//   }
//
//
//   save(fn) {
//     users.save(this, ()=>fn(this));
//   }
}

module.exports = Session;
