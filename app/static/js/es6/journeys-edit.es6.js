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
    initMap(36,-86,2);
    populateMap();
    populateStopDivs();
    addJourneyBadge();
    $('#add').click(addStop);
    $('#stops').on('click', '.delete-stop', deleteStop);
    $('#type').change(addJourneyBadge);
  }

  var map;
  var markers = [];

  //======================Map functions


  function addStop(event){
    let zip = $('#stop-location').val().trim();

    geocode(zip, (location,marker)=>{
      ajax(`/journeys/new/addstop`, 'POST', {location:location}, html=>{
        $('#stop-location').val('').trigger('focus');
        $('#stops').append(html);
      });
    });
    event.preventDefault();
  }

  function initMap(lat, lng, zoom){
    let styles = [{'featureType':'water','elementType':'geometry','stylers':[{'color':'#333739'}]},{'featureType':'landscape','elementType':'geometry','stylers':[{'color':'#2ecc71'}]},{'featureType':'poi','stylers':[{'color':'#2ecc71'},{'lightness':-7}]},{'featureType':'road.highway','elementType':'geometry','stylers':[{'color':'#2ecc71'},{'lightness':-28}]},{'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#2ecc71'},{'visibility':'on'},{'lightness':-15}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#2ecc71'},{'lightness':-18}]},{'elementType':'labels.text.fill','stylers':[{'color':'#ffffff'}]},{'elementType':'labels.text.stroke','stylers':[{'visibility':'off'}]},{'featureType':'transit','elementType':'geometry','stylers':[{'color':'#2ecc71'},{'lightness':-34}]},{'featureType':'administrative','elementType':'geometry','stylers':[{'visibility':'on'},{'color':'#333739'},{'weight':0.8}]},{'featureType':'poi.park','stylers':[{'color':'#2ecc71'}]},{'featureType':'road','elementType':'geometry.stroke','stylers':[{'color':'#333739'},{'weight':0.3},{'lightness':10}]}];
    let mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP, styles:styles};
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
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
      addMarker(stop.lat,stop.lng,stop.name);
    });
  }

  function populateStopDivs(){
    stops.forEach(stop=>{
      ajax(`/journeys/new/addstop`, 'POST', {location:stop}, html=>{
        $('#stops').append(html);
      });
    });
  }

  function deleteStop(event){
    var stop = $(this).closest('div').remove();
    var lat = $(this).closest('div').find('input.stop-lat').val() * 1;
    var lng = $(this).closest('div').find('input.stop-lng').val() * 1;
    event.preventDefault();
    removeMarker(lat,lng);
  }

  function removeMarker(lat,lng){
    markers.forEach(m=>{
      var mlat = m.position.k.toFixed(2) * 1;
      var mlng = m.position.A.toFixed(2) * 1;

      if(mlat === lat && mlng === lng){
        m.setMap(null);
        console.log('true');
      }
    });
  }





})();
