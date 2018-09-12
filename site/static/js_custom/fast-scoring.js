$(document).ready(function() {
	
	var url = window.location.origin;
	
	
	//SUBMIT FUNCTION WITH FORM CONTROLS
	
	$('#convertModel').click(function() {
		var id='#xml_model_file';
	    var obj_id=$(id);
		if(obj_id.val() == "") {
			alert('Select XML Model file');
			obj_id.focus();
			return;
		}
		
		$('#form').attr('action', url+"/fastscoring/quicklearn").submit();
		
	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});

});