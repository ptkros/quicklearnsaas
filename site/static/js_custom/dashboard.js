$(document).ready(function() {
	
	var url = window.location.origin;
	
	//FUNCTION TO RETRIEVE DASHBOARD DATA FROM SERVER
	
	var dashUrl = url+'/dashboard';
	
	$.getJSON(dashUrl, function(dashboard) {
		$('#total_sessions').text(dashboard.sessions);
		$('#total_tasks').text(dashboard.tasks);
    });
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});

});