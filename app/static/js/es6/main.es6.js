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
    $('#filter').click(filter);
  }

  function filter(){
    var search = $('#search').val();

    ajax(`/users`, 'get', {search:search}, html=>{
      $('#users').empty();
      $('#users').append(html);
    });

  }


})();
