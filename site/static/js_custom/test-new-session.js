$(document).ready(function() {
	
	var url = window.location.origin; 
	

	//FUNCTION TO HANDLE RESET TASK
	
	$( document ).on( "click", ".resetting", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("reset");
	    var id_number=id_number_array[1];
	    var resetTask_class='.resetTask'+id_number;
	    var obj_resetTask_class=$(resetTask_class);
		obj_resetTask_class.prop('checked',false);
		obj_resetTask_class.val("");
		$('.spanRemFile').text(' No file chosen');
	});
	
	
	//FUNCTION TO HANDLE REMOVE TASK
	//TODO: remove any task
	
	$( document ).on( "click", ".removing", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remove");
	    var id_number=id_number_array[1];
	    if(id_number == numTask){
	    	numTask=numTask-1;
	    	var taskPanel_id="#taskPanel"+id_number;
		    var obj_taskPanel_id=$(taskPanel_id);
		    obj_taskPanel_id.remove();
	    }else alert('YOU CAN REMOVE FROM THE LAST ONE TASK');	
	});
	
	
	//FUNCTION TO ACTIVATE/DEACTIVATE CHECKBOX LOAD FILE ON S3
	
	$( document ).on( "change", ".localTestFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("test_file");
	    var id_number=id_number_array[1];
	    var localTestFile_id = "#test_file"+id_number;
	    var obj_localTestFile_id = $(localTestFile_id);
	    var loadTestFile_id="#load_test_checkbox"+id_number;
	    var obj_loadTestFile_id=$(loadTestFile_id);
	    if(obj_localTestFile_id.val() != ""){
	    	obj_loadTestFile_id.prop('disabled', '');
	    }
	    else{
	    	obj_localTestFile_id.val() == "";
	    	obj_loadTestFile_id.prop('checked', false);
	    	obj_loadTestFile_id.prop('disabled', 'disabled');
	    }
	});
	
	
	$( document ).on( "change", ".localModelFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("model_file");
	    var id_number=id_number_array[1];
	    var localModelFile_id = "#model_file"+id_number;
	    var obj_localModelFile_id = $(localModelFile_id);
	    var loadModelFile_id="#load_model_checkbox"+id_number;
	    var obj_loadModelFile_id=$(loadModelFile_id);
	    if(obj_localModelFile_id.val() != ""){
	    	obj_loadModelFile_id.prop('disabled', '');
	    }
	    else{
	    	obj_localModelFile_id.val() == "";
	    	obj_loadModelFile_id.prop('checked', false);
	    	obj_loadModelFile_id.prop('disabled', 'disabled');
	    }
	});
	
	
	//FUNCTION TO SET INPUT FIELD FOR LOAD FILE ON S3
		
	$( document ).on( "change", ".loadTestFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_test_checkbox");
	    var id_number=id_number_array[1];
	    var loadTestFile_id="#load_testFile_remote"+id_number;
	    var obj_loadTestFile_id=$(loadTestFile_id);
	    obj_loadTestFile_id.val("true");
	});
	
	
	$( document ).on( "change", ".loadModelFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_model_checkbox");
	    var id_number=id_number_array[1];
	    var loadModelFile_id="#load_modelFile_remote"+id_number;
	    var obj_loadModelFile_id=$(loadModelFile_id);
	    obj_loadModelFile_id.val("true");
	});
	
		
	//FUNCTION TO RETRIEVE FILE LIST FROM S3
		
	$( document ).on( "click", ".remoteTestFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("testing_file_remote");
	    var id_number=id_number_array[1];
	    var testFileTable_id="#test_remoteFileTable"+id_number;
	    var obj_testFileTable_id=$(testFileTable_id);
	    var output1="<tr><th>Name</th><th>Size (Byte)</th></tr>";
	    var output2;
	    var testUrl = url+'/s3/testing';
	    $.getJSON(testUrl, function(s3) {
	    	for (var i in s3.files_list) {
	    	    output2+="<tr class="+"select"+ ">" + "<td>" + s3.files_list[i].file_name + "</td>" + "<td>" + s3.files_list[i].file_length + "</td>" + "</tr>";
	    	}
	    	final_output=output1+output2;
	    	obj_testFileTable_id.html(final_output);
	    });
	    
	});
	
	
	$( document ).on( "click", ".remoteModelFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("model_file_remote");
	    var id_number=id_number_array[1];
	    var modelFileTable_id="#model_remoteFileTable"+id_number;
	    var obj_modelFileTable_id=$(modelFileTable_id);
	    var output1="<tr><th>Name</th><th>Size (Byte)</th></tr>";
	    var output2;
	    var modelUrl = url+'/s3/model';
	    $.getJSON(modelUrl, function(s3) {
	    	for (var i in s3.files_list) {
	    	    output2+="<tr class="+"select"+ ">" + "<td>" + s3.files_list[i].file_name + "</td>" + "<td>" + s3.files_list[i].file_length + "</td>" + "</tr>";
	    	}
	    	final_output=output1+output2;
	    	obj_modelFileTable_id.html(final_output);
	    });
	    
	});
	
	
	//FUNCTION TO SHOW A SELECTED FILE FROM S3
	
	$( document ).on( "click", ".select", function() {
		$(this).addClass('selected').siblings().removeClass('selected');
	});
	
	
	//FUNCTION TO SELECT FILE FROM S3
		
	$( document ).on( "click", ".remoteTestSelection", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteTestSel");
	    var id_number=id_number_array[1];
	    var testFileRemoteSel_id="#test_remoteFileTable"+id_number+" "+"tr.selected"+" "+"td:first";
	    var obj_testFileRemoteSel_id=$(testFileRemoteSel_id);
	    var testFileRemBut_id="#testing_file_remote"+id_number;
	    var obj_testFileRemBut_id=$(testFileRemBut_id);
	    var selTestFileRem_id="#selected_testFile_remote"+id_number;
	    var obj_selTestFileRem_id=$(selTestFileRem_id);
	    obj_selTestFileRem_id.val(obj_testFileRemoteSel_id.html());
	    obj_testFileRemBut_id.next().text(" "+obj_testFileRemoteSel_id.html());
	});
	
	
	$( document ).on( "click", ".remoteModelSelection", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteModelSel");
	    var id_number=id_number_array[1];
	    var modelFileRemoteSel_id="#model_remoteFileTable"+id_number+" "+"tr.selected"+" "+"td:first";
	    var obj_modelFileRemoteSel_id=$(modelFileRemoteSel_id);
	    var modelFileRemBut_id="#model_file_remote"+id_number;
	    var obj_modelFileRemBut_id=$(modelFileRemBut_id);
	    var selModelFileRem_id="#selected_modelFile_remote"+id_number;
	    var obj_selModelFileRem_id=$(selModelFileRem_id);
	    obj_selModelFileRem_id.val(obj_modelFileRemoteSel_id.html());
	    obj_modelFileRemBut_id.next().text(" "+obj_modelFileRemoteSel_id.html());
	});
	
	
	//FUNCTION TO UNSELECT FILE FROM S3
	

	$( document ).on( "click", ".removeTestSel", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteTestUnsel");
	    var id_number=id_number_array[1];
	    var selFeatFileRem_id="#selected_featFile_remote"+id_number;
	    var obj_selFeatFileRem_id=$(selFeatFileRem_id);
	    var spanTestFileRem_id="#spanRemTestFile"+id_number;
	    var obj_spanTestFileRem_id=$(spanTestFileRem_id);
	    obj_selFeatFileRem_id.val("");
	    obj_spanTestFileRem_id.text(' No file chosen');
	});
	
	
	$( document ).on( "click", ".removeModelSel", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteModelUnsel");
	    var id_number=id_number_array[1];
	    var selFeatFileRem_id="#selected_featFile_remote"+id_number;
	    var obj_selFeatFileRem_id=$(selFeatFileRem_id);
	    var spanModelFileRem_id="#spanRemModelFile"+id_number;
	    var obj_spanModelFileRem_id=$(spanModelFileRem_id);
	    obj_selModelFileRem_id.val("");
	    obj_spanModelFileRem_id.text(' No file chosen');
	});
	
	
	//SUBMIT FUNCTION WITH FORM CONTROLS
	
	$('#submitTask').click(function() {
		for(i = 1; i <= numTask; i++ ){
			
			var id='#testMetric'+i+' '+'option:selected';
		    var obj_id=$(id);
		    if(obj_id.val() == '') {
				alert('Select Test metric in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#testCutoff'+i;
		    obj_id=$(id);
		    var number_reg_exp = /^([0-9]+)?$/;
		    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 0 ) {
				alert('Insert integer value (>= 0) for Test metric cutoff in Learning Task '+i);
				obj_id.focus();
				return;
			}
			id='#test_file'+i;
			obj_id=$(id);
			var id2='#selected_testFile_remote'+i;
			var obj_id2=$(id2);
			if(obj_id.val() == "" && obj_id2.val() == "") {
				alert('Select Testing file in Testing Task '+i);
				obj_id.focus();
				return;
			}
			if(obj_id.val() != "" && obj_id2.val() != "") {
				alert('Select local or remote Testing file in Testing Task '+i);
				obj_id.focus();
				return;
			}
			id='#model_file'+i;
			obj_id=$(id);
			var id2='#selected_modelFile_remote'+i;
			var obj_id2=$(id2);
			if(obj_id.val() == "" && obj_id2.val() == "") {
				alert('Select Model file in Testing Task '+i);
				obj_id.focus();
				return;
			}
			if(obj_id.val() != "" && obj_id2.val() != "") {
				alert('Select local or remote Model file in Testing Task '+i);
				obj_id.focus();
				return;
			}
				
		}
			
		$('.workaround').prop('disabled', '');
		
		var numTaskInput='<div class="form-group">'
							+'<input name="ntasks" value="'+numTask+'" type="hidden">'
						+'</div>';
		$('#form').append(numTaskInput);
		$('#form').attr('action', url+"/testing/quicklearn").submit();
		
	});
	
	//FUNCTION TO ADD TASK
	
	var numTask = 1;
	$('#addTask').click(function() {
		numTask=numTask+1;
		var taskForm='<div id="taskPanel'+numTask+'" class="panel panel-default">'
					+'<div class="panel-heading">Testing Task '+numTask+'</div>'
					+'<div class="panel-body">'
						+'<div class="row">'
							+'<div class="col-lg-4" id="test_div'+numTask+'">'
								+'<div class="form-group">'
									+'<label>Test metric</label>' 
									+'<select class="form-control resetTask'+numTask+' resetTest'+numTask+'" id="testMetric'+numTask+'" name="test_metric_string'+numTask+'">'
										+'<option value="" style="display:none">Test metric</option>'
										+'<option>NDCG</option>'
										+'<option>DCG</option>'
										+'<option>TNDCG</option>'
										+'<option>MAP</option>'
										+'</select>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Test metric cutoff</label>'
									+'<input class="form-control resetTask'+numTask+' resetTest'+numTask+'" placeholder="Cutoff (default: 10)" id="testCutoff'+numTask+'" name="test_cutoff'+numTask+'">'
								+'</div>'
							+'</div>'
							+'<div class="col-lg-4" id="test2_div'+numTask+'">'
								+'<div class="form-group">'
									+'<label>Testing file</label>' 
									+'<input class="resetTask'+numTask+' resetTest'+numTask+' localTestFile" id="test_file'+numTask+'" type="file" name="test_filename'+numTask+'">'
									+'<input class="workaround resetTask'+numTask+' resetTest'+numTask+' loadTestFile" id="load_test_checkbox'+numTask+'" type="checkbox" disabled> Upload testing file on S3</input>'
									+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="load_testFile_remote'+numTask+'" name="load_testfile'+numTask+'" type="hidden">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Testing remote file</label>' 
									+'<button class="btn btn-default btn-xs resetTask'+numTask+' resetTest'+numTask+' remoteTestFile" data-toggle="modal" data-target="#myModalTest'+numTask+'" id="testing_file_remote'+numTask+'" type="button" style="margin-left:3px">Choose File</button><span class="spanRemFile" id="spanRemTestFile'+numTask+'"> No file chosen</span>'
									+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="selected_testFile_remote'+numTask+'" name="testing_file_remote'+numTask+'" type="hidden">'
								+'</div>'
								+'<div class="modal fade" id="myModalTest'+numTask+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabelTest'+numTask+'" aria-hidden="true">'
	                            	+'<div class="modal-dialog">'
	                                    +'<div class="modal-content">'
	                                        +'<div class="modal-header">'
	                                            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
	                                            +'<h4 class="modal-title" id="myModalLabelTest'+numTask+'">Remote Testing Files List</h4>'
	                                        +'</div>'
	                                        +'<div class="modal-body">'
	                                        	+'<table id="test_remoteFileTable'+numTask+'" style="width:100%">'  
												+'</table>'
	                                        +'</div>'
	                                        +'<div class="modal-footer">'
	                                            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
	                                            +'<button type="button" class="btn btn-default removeTestSel" data-dismiss="modal" id="remoteTestUnsel'+numTask+'">Cancel file</button>'
	                                            +'<button type="button" class="btn btn-primary remoteTestSelection" data-dismiss="modal" id="remoteTestSel'+numTask+'">Select file</button>'
	                                        +'</div>'
	                                    +'</div>'
	                                +'</div>'
                                +'</div>'
                            +'</div>'
                            +'<div class="col-lg-4" id="test3_div'+numTask+'">'
								+'<div id="model_file_div'+numTask+'">'
									+'<div class="form-group">'
										+'<label>Model file</label>'
										+'<input class="resetTask'+numTask+' resetTest'+numTask+' localModelFile" id="model_file'+numTask+'" type="file" name="model_filename'+numTask+'">'
										+'<input class="workaround resetTask'+numTask+' resetTest'+numTask+' loadModelFile" id="load_model_checkbox'+numTask+'" type="checkbox" disabled> Upload model file on S3</input>'
										+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="load_modelFile_remote'+numTask+'" name="load_modelfile'+numTask+'" type="hidden">'
									+'</div>'
									+'<div class="form-group">'
										+'<label>Model remote file</label>' 
										+'<button class="btn btn-default btn-xs resetTask'+numTask+' resetTest'+numTask+' remoteModelFile" data-toggle="modal" data-target="#myModalModel'+numTask+'" id="model_file_remote'+numTask+'" type="button" style="margin-left:3px">Choose File</button><span class="spanRemFile" id="spanRemModelFile'+numTask+'"> No file chosen</span>'
										+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="selected_modelFile_remote'+numTask+'" name="model_file_remote'+numTask+'" type="hidden">'
									+'</div>'
									+'<div class="modal fade" id="myModalModel'+numTask+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabelModel'+numTask+'" aria-hidden="true">'
		                                +'<div class="modal-dialog">'
		                                    +'<div class="modal-content">'
		                                        +'<div class="modal-header">'
		                                            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
		                                            +'<h4 class="modal-title" id="myModalLabelModel'+numTask+'">Remote Model Files List</h4>'
		                                        +'</div>'
		                                        +'<div class="modal-body">'
		                                        	+'<table id="model_remoteFileTable'+numTask+'" style="width:100%">'   
													+'</table>'
		                                        +'</div>'
		                                        +'<div class="modal-footer">'
		                                            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
		                                            +'<button type="button" class="btn btn-default removeModelSel" data-dismiss="modal" id="remoteModelUnsel'+numTask+'">Cancel file</button>'
		                                            +'<button type="button" class="btn btn-primary remoteModelSelection" data-dismiss="modal" id="remoteModelSel'+numTask+'">Select file</button>'
		                                        +'</div>'
		                                    +'</div>'
		                                +'</div>'
	                                +'</div>'
                                +'</div>'
							+'</div>'
						+'</div>'
					+'</div>'
					+'<div class="panel-footer">'
						+'<button type="button" class="btn btn-default resetting" id="reset'+numTask+'">Reset Task</button>'
						+'<button type="button" class="btn btn-default removing" id="remove'+numTask+'" style="margin-left:5px">Remove Task</button>'
					+'</div>'
				+'</div>';
		$("#form").append(taskForm);
	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});
	
});