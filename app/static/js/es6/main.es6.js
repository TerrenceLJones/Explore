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
    var search = $('#search').val();

    ajax(`/users`, 'get', {search:search}, html=>{
      $('#users').empty();
      $('#users').append(html);
    });

  }

  function filterJourneys(){
    var searchParams={};
      searchParams.name = $('#search-name').val();
      searchParams.location = $('#search-location').val();
      searchParams.type = $('#search-type option:selected').text();

    ajax(`/journeys/search`, 'get', {searchParams:searchParams}, html=>{
      $('#journeys').empty();
      $('#journeys').append(html);
    });

  }


})();
