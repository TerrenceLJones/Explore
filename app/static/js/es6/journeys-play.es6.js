/* jshint unused: false */
/* exported ajax */
/* global _:true */
/* global google:true*/
/* global stops */
/* jshint camelcase:false */

function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
  'use strict';
  $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
}


(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    initMap(36.50,-98.35,2);
    geoLocation();
    geolocationTimer();
    populateMap();
    populateStops();
    addJourneyBadge();
    $('#type').change(addJourneyBadge);
  }

  var map;
  var markers = [];
  var directionsDisplay;
  var directionsService;
  var timer;
  var loc = {};
  var waypoints =[];
  var stops = [];

  //======================Map functions

  var x = document.getElementById('location');


  function geoLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p=>{
        loc.lat = p.coords.latitude * 1;
        loc.lng = p.coords.longitude * 1;
        showUserPosition(p);
        });
    }
    else {
        alert('Geolocation is not supported by this browser.');
    }
  }

  function showUserPosition(position) {
      var icon = '/../img/journeyor.png';
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      addMarker(position.coords.latitude,position.coords.longitude, 'User', icon);
      map.setCenter(latLng);
      map.setZoom(8);
  }

  function geolocationTimer(){
    timer = setInterval(geoLocation,5000);
    setTimeout(getDirections, 7000);
  }

  function getDirections(){
    var origin = new google.maps.LatLng(loc.lat * 1, loc.lng * 1);
    var destination = new google.maps.LatLng(stops[0].lat, stops[0].lng);
    var tmppoints = _(waypoints).clone();
    console.log(origin);
    console.log(stops);

  //   var destination = _(waypoints).last().location;
  //
    var travelMode = google.maps.TravelMode.DRIVING;
  //
    var request = {
      origin: origin,
      destination: destination,
  //     waypoints: tmppoints,
  //     optimizeWaypoints: false,
  //     travelMode: travelMode
  //   };
  //
  // directionsService.route(request, (response, status)=>{
  //   if(status === google.maps.DirectionsStatus.OK){
  //     directionsDisplay.setDirections(response);
  //   }
  // });
  }
  //
  // function getDistance(lat1, lon1, lat2, lon2) {
  // 'use strict';
  // var R = 6371; // Radius of the earth in km
  // var dLat = deg2rad(lat2-lat1);
  // var dLon = deg2rad(lon2-lon1);
  // var a =
  //   Math.sin(dLat/2) * Math.sin(dLat/2) +
  //   Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
  //   Math.sin(dLon/2) * Math.sin(dLon/2)
  //   ;
  // var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  // var d = R * c; // Distance in km
  // return d;
  // }

  function initMap(lat, lng, zoom){
    var styles = [{'featureType':'administrative','stylers':[{'visibility':'off'}]},{'featureType':'poi','stylers':[{'visibility':'simplified'}]},{'featureType':'road','elementType':'labels','stylers':[{'visibility':'simplified'}]},{'featureType':'water','stylers':[{'visibility':'simplified'}]},{'featureType':'transit','stylers':[{'visibility':'simplified'}]},{'featureType':'landscape','stylers':[{'visibility':'simplified'}]},{'featureType':'road.highway','stylers':[{'visibility':'off'}]},{'featureType':'road.local','stylers':[{'visibility':'on'}]},{'featureType':'road.highway','elementType':'geometry','stylers':[{'visibility':'on'}]},{'featureType':'water','stylers':[{'color':'#84afa3'},{'lightness':52}]},{'stylers':[{'saturation':-17},{'gamma':0.36}]},{'featureType':'transit.line','elementType':'geometry','stylers':[{'color':'#3f518c'}]}];

    let mapOptions = {scrollwheel:false, center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles:styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    let cloudLayer = new google.maps.weather.CloudLayer();
    cloudLayer.setMap(map);

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));

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

  function addJourneyBadge(){
    var type = $('#type option:selected').text().toLowerCase();

    switch(type) {
    case 'food':
      $('#badge').css('background-image','url("/img/badges/food.png")');
      $('#badge-type').val('food');
      break;
    case 'arts':
      $('#badge').css('background-image','url("/img/badges/art.png")');
      $('#badge-type').val('arts');
      break;
    case 'sightseeing':
      $('#badge').css('background-image','url("/img/badges/sightseeing.png")');
      $('#badge-type').val('sightseeing');
      break;
    case 'music':
      $('#badge').css('background-image','url("/img/badges/music.png")');
      $('#badge-type').val('music');
      break;
    case 'outdoors':
      $('#badge').css('background-image','url("/img/badges/outdoor.png")');
      $('#badge-type').val('outdoors');
      break;
    case 'other':
      $('#badge').css('background-image','url("/img/badges/default.png")');
      $('#badge-type').val('other');
      break;
    default:
      $('#badge').css('background-image','url("/img/badges/default.png")');
    }
  }
  function populateMap(){
    stops.forEach(stop=>{
      stops.push(stop);
      addMarker(stop.lat,stop.lng,stop.name);
    });
  }

  function populateStops(){
    stops.forEach(stop=>{
      ajax(`/journeys/new/addstop`, 'POST', {location:stop}, html=>{
        $('#stops').append(html);
      });
    });
  }







})();
