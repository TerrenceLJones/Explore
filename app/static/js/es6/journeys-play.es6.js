/* jshint unused: false */
/* global ajax:true */
/* global _:true */
/* global google, locations:true*/
/* global stops, session*/
/* jshint camelcase:false */

(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36.50,-98.35,4);
    geoLocation();
    populateMap();
    $('#find').click(geoLocation);
    $('#reroute').click(getDirections);
    $('#stop-task').on('click', '#complete', completeTask);
    $('#play-mode').on('click',playMode);
  }

  var map;
  var markers = [];
  var directionsDisplay;
  var directionsService;
  var loc = {};
  var userTempPos;
  var waypoints = [];
  var journeyStops = [];
  var currSess = session;
  var currStop;
  var currStopMarker;
  var simulatorTimer;


  //======================Map functions

  function geoLocationTimer(){
    setInterval(geoLocation,4000);
    setTimeout(showUserPosition,5000);
    setTimeout(getDirections, 5000);
    simulatorTimer = setInterval(getNewSessionData, 5000);
  }

  function playMode(){
    var mode = $('#mode option:selected').text().toLowerCase();
    if(mode === 'demo'){
      geoLocationSimulator();
    }
    else{
      geoLocationTimer();
    }
  }
  function geoLocation() {
    if (navigator.geolocation) {
      var options = {enableHighAccuracy: true, timeout: 60000, maximumAge: 0};
      navigator.geolocation.getCurrentPosition(p=>{
        loc.lat = p.coords.latitude * 1;
        loc.lng = p.coords.longitude * 1;
        userTempPos = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        showUserPosition();
      },e=>console.log(e), options);
    }
    else {
        alert('Geolocation is not supported by this browser.');
    }

  }
  function geoLocationSimulator(event){
    getDirections();
    simulatorTimer = setInterval(getNewSessionData, 5000);
    console.log('inside simulator');
    getDirections();
    
    var keys = Object.keys(locations);
    var next=0;

    keys.forEach(k=>{
      k = k *1;
      if(k === 0) {
        removeUserMarker(userTempPos.k,userTempPos.A);
        loc.lat = locations[k].coords.latitude * 1;
        loc.lng = locations[k].coords.longitude * 1;
        userTempPos = new google.maps.LatLng(locations[k].coords.latitude, locations[k].coords.longitude);
        showUserPosition();
      }
      else {
        setTimeout((function(pos){
            return function() {
              removeUserMarker(userTempPos.k,userTempPos.A);
              loc.lat = pos.coords.latitude * 1;
              loc.lng = pos.coords.longitude * 1;
              userTempPos = new google.maps.LatLng(locations[k].coords.latitude, locations[k].coords.longitude);
              showUserPosition();
            };
        })(locations[k]),next);
      }
      next+=locations[k].duration;
    });

    event.preventDefault();
  }

  function showUserPosition() {
    var icon = '/../img/journeyor.png';
    addMarker(loc.lat,loc.lng, `${user.username}`, icon);
    isUserAtStop();
  }

  function removeUserMarker(userPrevLat,userPrevLng){
    userPrevLat = userPrevLat.toFixed(2) * 1;
    userPrevLng = userPrevLng.toFixed(2) * 1;

    markers.forEach(m=>{
      var mlat = m.position.k.toFixed(2) *1;
      var mlng = m.position.A.toFixed(2) *1;

      if(mlat === userPrevLat && mlng === userPrevLng){
        m.setMap(null);
      }
    });
  }

  function isUserAtStop(){
    let currLat = loc.lat *1;
    let currLng = loc.lng * 1;

    markers.forEach(m=>{
      var mlat = m.position.k * 1;
      var mlng = m.position.A * 1;

      if(mlat === currLat && mlng === currLng){
        stops.forEach(s=>{
          s.lat = s.lat * 1;
          s.lng = s.lng * 1;
          if(currLat === s.lat && currLng === s.lng){
            currStop = s;
            currStopMarker = m;

            ajax(`/journeys/play/stop/task`, 'POST', {stop:s}, html=>{
              $('#stop-task').empty();
              $('#stop-task').append(html);
            });
          }
        });

      }
    });
  }

  function getDirections(){
    var origin = new google.maps.LatLng(loc.lat * 1, loc.lng * 1);
    var destination = _(journeyStops).last().location;
    var tmppoints = _(journeyStops).clone();

    tmppoints.pop();

    var travelMode = google.maps.TravelMode.DRIVING;

    var request = {
      origin: origin,
      destination: destination,
      waypoints: tmppoints,
      optimizeWaypoints: true,
      travelMode: travelMode
    };
    directionsService.route(request, (response, status)=>{
      if(status === google.maps.DirectionsStatus.OK){
        directionsDisplay.setDirections(response);
      }
    });
  }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'administrative','stylers':[{'visibility':'off'}]},{'featureType':'poi','stylers':[{'visibility':'simplified'}]},{'featureType':'road','elementType':'labels','stylers':[{'visibility':'simplified'}]},{'featureType':'water','stylers':[{'visibility':'simplified'}]},{'featureType':'transit','stylers':[{'visibility':'simplified'}]},{'featureType':'landscape','stylers':[{'visibility':'simplified'}]},{'featureType':'road.highway','stylers':[{'visibility':'off'}]},{'featureType':'road.local','stylers':[{'visibility':'on'}]},{'featureType':'road.highway','elementType':'geometry','stylers':[{'visibility':'on'}]},{'featureType':'water','stylers':[{'color':'#84afa3'},{'lightness':52}]},{'stylers':[{'saturation':-17},{'gamma':0.36}]},{'featureType':'transit.line','elementType':'geometry','stylers':[{'color':'#3f518c'}]}];
    let mapOptions = {
      scrollwheel:false,
      center: new google.maps.LatLng(lat, lng),
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles:styles
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));

    let cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);
  }

  function geocode(zip, fn){
    let geocoder = new google.maps.Geocoder();

    geocoder.geocode({address: zip}, (results, status)=>{
      let name= results[0].formatted_address.split(',')[0];
      // `${results[0].address_components[1].short_name} ${results[0].address_components[2].short_name} ${results[0].address_components[5].short_name}, ${results[0].address_components[7].short_name} ${results[0].address_components[9].short_name}, ${results[0].address_components[8].short_name}`;
      let lat = results[0].geometry.location.lat();
      let lng = results[0].geometry.location.lng();
      let latLng = new google.maps.LatLng(lat, lng);

      addMarker(lat,lng,name);
      map.setCenter(latLng);
      map.setZoom(10);
      var location = {name:name,lat:lat,lng:lng};
      fn(location);
    });
  }

  function addMarker(lat,lng,name,icon){
    if(icon === undefined){icon = '/../img/flag.png';}
    let latLng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({map: map, position: latLng, title: name, icon: icon});
    markers.push(marker);
  }

  function populateMap(){
    var latLng;
    stops.forEach(stop=>{
      if(stop.isComplete===false){
        latLng = new google.maps.LatLng(stop.lat,stop.lng);
        journeyStops.push({location:latLng, stopover:true});
        addMarker(stop.lat,stop.lng,stop.name);
      }
      if(stop.isComplete===true){
        var icon = '/../img/flag.png';
        latLng = new google.maps.LatLng(stop.lat,stop.lng);
        addMarker(stop.lat,stop.lng,stop.name,icon);
      }
    });
  }

  function completeTask(){
    ajax(`/journeys/play/stop/task/complete`, 'POST', {stop:currStop, session:currSess}, html=>{
        $('#completed-stops').append(html);
        // _.pull(journeyStops, );
    });
  }
  function checkJourneyStatus(){
    ajax(`/journeys/play/status`, 'POST', {session:currSess}, html=>{
      console.log(html);
      if(typeof html === 'string'){
        console.log('in here');
        $('.journey-game-controls').empty();
        $('.journey-game-data').empty();
        $('#journey-complete-container').append(html);
        clearInterval(simulatorTimer);

      }

    });
  }
  function getNewSessionData(){
    ajax(`/journeys/play/sessiondata`, 'POST', {session:currSess}, newSessionData=>{
      newSessionData = JSON.parse(newSessionData);
      currSess = newSessionData;
      checkJourneyStatus();
        // currStopMarker.setMap(null);
        // _.pull(journeyStops, );
        // getDirections();
    });
  }

})();
