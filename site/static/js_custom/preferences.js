$(document).ready(function() {
	
	var url = window.location.origin;
	
	
	//SUBMIT FUNCTION WITH FORM CONTROLS
	
	$('#savePref').click(function() {
		var id='#numInst';
	    var obj_id=$(id);
		var number_reg_exp = /^([0-9]+)?$/;
		if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (> 0) for Number of instances');
			obj_id.focus();
			return;
		}
		id='#mailAddr';
	    obj_id=$(id);
	    var email_reg_exp = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-]{2,})+\.)+([a-zA-Z0-9]{2,})+$/;
		if(!email_reg_exp.test(obj_id.val()) || obj_id.val() == "" || obj_id.val() == "undefined" ) {
			alert('Insert valid e-mail address');
			obj_id.focus();
			return;
		}
		
		$('#form').attr('action', url+"/preferences").submit();
		
	});
	
	
	//FUNCTION TO RETRIEVE PREFERECES DATA FROM SERVER
	
	var prefUrl = url+'/preferences';
	
	$.getJSON(prefUrl, function(pref) {
		$('#numInst').val(pref.ninst);
		$('#mailAddr').val(pref.mail);
    });
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});

});