/* Javascript to handle the login form submitting */
$("#login_form").on('submit', function(event) {

  /* stop form from submitting normally */
  event.preventDefault();

  var input_code = {
    "user_id" : $('#id_code').val()
  };

  console.log("ID code: ")
  console.log($('#id_code').val());

  $.ajax({
    type : 'POST',
    url : "/read_id",
    data : JSON.stringify(input_code),
    contentType: "application/json",
    dataType: 'json',
    success: function(result) {
      console.log(result.id_code);
      $.ajax({
        type : 'GET',
        url : "/play"})
    }
  });

});
