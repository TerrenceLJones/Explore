var journeys = global.nss.db.collection('journeys');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/base.js');
var _ = require('lodash');
var Mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

class Journey {
  static create(creatorId,obj,fn){
    var journey = new Journey();
    journey.creatorId = creatorId;
    journey.name = obj.journeyName.toLowerCase();
    journey.location = obj.journeyLocation.toLowerCase();
    journey.type = obj.journeyType.toLowerCase();
    journey.desc = obj.journeyDesc;
    journey.badge = obj.journeyBadge.toLowerCase();
    journey.badgeImg = badgeImage(obj.journeyBadge.toLowerCase());
    journey.tags = obj.journeyTags.toLowerCase();
    journey.stops = [];

    function badgeImage(badgeName){
     var badge;
     switch(badgeName) {
     case 'food':
       badge = '/img/badges/food.png';
       break;
     case 'arts':
       badge = '/img/badges/art.png';
       break;
     case 'sightseeing':
       badge = '/img/badges/sightseeing.png';
       break;
     case 'music':
       badge = '/img/badges/music.png';
       break;
     case 'outdoors':
       badge = '/img/badges/outdoor.png';
       break;
     case 'other':
       badge = '/img/badges/default.png';
       break;
     default:
       badge = '/img/badges/default.png';
     }
     return badge;
   }

    for (var i=0; i<obj.stopName.length; i++) {
      var stop = {};
      stop.name = obj.stopName[i];
      stop._id = new ObjectID();
      stop.desc = obj.stopDesc[i];
      stop.lat = obj.stopLat[i];
      stop.lng = obj.stopLng[i];
      journey.stops.push(stop);
    }
    journeys.save(journey, ()=>{fn();});
  }

  static findAll(fn) {
  Base.findAll(journeys, Journey, fn);
  }

  static findById(id, fn){
    id = Mongo.ObjectID(id);
    journeys.findOne({_id:id}, (e,j)=>{
      if(j){
        j = _.create(Journey.prototype, j);
        fn(j);
      }
      else{
        fn(null);
      }
    });
  }

  static destroyById(journeyId, fn) {
    journeyId = Mongo.ObjectID(journeyId);
    journeys.findAndRemove({_id:journeyId}, ()=>{
        fn(true);
      });
  }

  update(obj){
    this.name = obj.journeyName;
    this.location = obj.journeyLocation;
    this.type = obj.journeyType.toLowerCase();
    var stop = {};
    this.stops = [];

    if(obj.stopName instanceof Array){
      for(var i = 0; i < obj.stopName.length; i ++) {
        stop = {};
        stop.name = obj.stopName[i];
        stop._id = new ObjectID();
        stop.desc = obj.stopDesc[i];
        stop.lat = obj.stopLat[i];
        stop.lng = obj.stopLng[i];
        this.stops.push(stop);
      }
    }
    else{
      stop = {};
      stop.name = obj.stopName;
      stop.id = new ObjectID();
      stop.desc = obj.stopDesc;
      stop.lat = obj.stopLat;
      stop.lng = obj.stopLng;
      this.stops.push(stop);
    }

    this.stops = _.uniq(this.stops, 'name');
  }

  save(fn) {
    journeys.save(this, ()=>fn(this));
  }

  static filter(searchParams, fn) {
    searchParams = searchParams.toLowerCase().trim();

    journeys.find({ $or: [ {location:searchParams},
                           {name:searchParams},
                           {type:searchParams}
                          ]
                    }).toArray((err, journeys)=>{
                        journeys = journeys.map(j=>_.create(Journey.prototype, j));
                        fn(journeys);
         });
  }
}

module.exports = Journey;

// journeys.update(_id: obj._id}, { $push: { scores: { $each: [ 90, 92, 85 ] } } })
