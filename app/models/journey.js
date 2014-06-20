var journeys = global.nss.db.collection('journeys');
var traceur = require('traceur');
var Base = traceur.require(__dirname + '/base.js');
var _ = require('lodash');
var Mongo = require('mongodb');


class Journey {
  static create(creatorId,obj,fn){
    var journey = new Journey();
    journey.creatorId = creatorId;
    journey.name = obj.journeyName.toLowerCase();
    journey.location = obj.journeyLocation.toLowerCase();
    journey.type = obj.journeyType.toLowerCase();
    journey.desc = obj.journeyDesc;
    journey.badge = obj.journeyBadge.toLowerCase();
    journey.tags = obj.journeyTags.toLowerCase();
    journey.stops = [];

    for (var i=0; i<obj.stopName.length; i++) {
      var stop = {};
      stop.name = obj.stopName[i];
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
      this.type = obj.journeyType;
  }

  save(fn) {
    journeys.save(this, ()=>fn(this));
  }

  static filter(searchParams, fn) {
    searchParams.name = searchParams.name.toLowerCase();
    searchParams.location = searchParams.location.toLowerCase();
    searchParams.type = searchParams.type.toLowerCase();

    journeys.find({ $or: [ {location:searchParams.location },
                          { name:searchParams.name },
                        { type:searchParams.type}
                      ]
                    }).toArray((err, journeys)=>{
                        journeys = journeys.map(j=>_.create(Journey.prototype, j));
                        fn(journeys);
         });
  }

}

module.exports = Journey;
