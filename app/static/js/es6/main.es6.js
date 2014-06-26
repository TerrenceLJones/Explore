/* jshint unused: false */
// global functions
/* exported ajax */
function ajax(url, type, data={}, success=r=>console.log(r), dataType='html'){
  'use strict';
  $.ajax({url:url, type:type, dataType:dataType, data:data, success:success});
}


(function(){
  'use strict';

  $(document).ready(init);

  function init(){
    $('#filter-users').click(filterUsers);
    $('#filter-journeys').click(filterJourneys);
  }

  function filterUsers(){
    var searchParams = $('#search-input').val();

    ajax(`/users`, 'get', {searchParams:searchParams}, html=>{
      $('#users').empty();
      $('#users').append(html);
    });

  }

  function filterJourneys(){
    var searchParams= $('#search-input').val();
    console.log(searchParams);

    ajax(`/journeys/search`, 'get', {searchParams:searchParams}, html=>{
      $('#journeys').empty();
      $('#journeys').append(html);
    });

  }


})();
