$(document).ready(function() {
	
	var url = window.location.origin; 
	
	
	//FUNCTIONS TO HANDLE CHECKBOX EVENT
	
	$( document ).on( "change", ".validation_checkbox", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("validation_checkbox");
	    var id_number=id_number_array[1];
	    var id='#validation_checkbox'+id_number;
	    var obj_id=$(id);
	    var val_class=".validation"+id_number;
	    var obj_val_class=$(val_class);
	    var spanValiFileRem_id="#spanRemValiFile"+id_number;
	    var obj_spanValiFileRem_id=$(spanValiFileRem_id);
	    var vali_chkbox_id="#vali_chkbox"+id_number;
	    var obj_vali_chkbox_id=$(vali_chkbox_id);
		if (obj_id.is(":checked")) {
			obj_val_class.prop('disabled', '');
			obj_vali_chkbox_id.val('true');
		} else {
			if(confirm('Are you sure to reset the Validation field?') == true){
				var resetVali_class='.resetVali'+id_number;
			    var obj_resetVali_class=$(resetVali_class);
			    obj_resetVali_class.val("");
			    obj_id.prop('checked',false);
				obj_val_class.prop('disabled', 'disabled');
				obj_spanValiFileRem_id.text(' No file chosen');
			}else{
				obj_id.prop('checked',true);
			}
		}
	});
	
	
	$( document ).on( "change", ".testing_checkbox", function(e) {
		var id=$(this).attr('id');
	    var id_number_array=id.split("testing_checkbox");
	    var id_number=id_number_array[1];
	    var id='#testing_checkbox'+id_number;
	    var obj_id=$(id);
	    var test_class=".testing"+id_number;
	    var obj_test_class=$(test_class);
	    var spanTestFileRem_id="#spanRemTestFile"+id_number;
	    var obj_spanTestFileRem_id=$(spanTestFileRem_id);
	    var test_chkbox_id="#test_chkbox"+id_number;
	    var obj_test_chkbox_id=$(test_chkbox_id);
		if (obj_id.is(":checked")) {
			obj_test_class.prop('disabled', '');
			obj_test_chkbox_id.val('true');
		} else {
			if(confirm('Are you sure to reset the Testing field?') == true){
				var resetTest_class='.resetTest'+id_number;
			    var obj_resetTest_class=$(resetTest_class);
			    obj_resetTest_class.val("");
			    obj_id.prop('checked',false);
				obj_test_class.prop('disabled', 'disabled');
				obj_spanTestFileRem_id.text(' No file chosen');
				obj_test_chkbox_id.val('');
			}else {
				obj_id.prop('checked',true);
			}
		}
	});
		
	
	//FUNCTION TO ENABLE/DISABLE TESTING
	
	/*$( document ).on( "change", ".rankingAlg", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("rankAlg");
	    var id_number=id_number_array[1];
	    var id='#rankAlg'+id_number;
	    var obj_id=$(id);
	    var test_id='#testing_checkbox'+id_number;
	    var obj_test_id=$(test_id);
	    var test_class=".testing"+id_number;
	    var obj_test_class=$(test_class);
	    if (obj_id.val() != 'LtR algorithm') {
	    	obj_test_id.prop('disabled', '');
	    }	
	});*/
	
	
	//FUNCTION TO SHOW/HIDE SETTINGS
	
	$('.coordAsc, .treeDepth_div').hide();
	$( document ).on( "change", ".rankingAlg", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("rankAlg");
	    var id_number=id_number_array[1];
	    var id='#rankAlg'+id_number+' '+'option:selected';
	    var obj_id=$(id);
	    var forest_id="#forest"+id_number;
	    var obj_forest_id=$(forest_id);
	    var coordAsc_id="#coordAsc"+id_number;
	    var obj_coordAsc_id=$(coordAsc_id);
		if(obj_id.val() == 'CoordAsc') {
			obj_forest_id.hide();
			obj_coordAsc_id.show();
		}
		else{
			var treeDepth_div_id="#treeDepth_div"+id_number;
			var obj_treeDepth_div_id=$(treeDepth_div_id);
			var numberTrLeaves_div_id="#numberTrLeaves_div"+id_number;
		    var obj_numberTrLeaves_div_id=$(numberTrLeaves_div_id);
			obj_coordAsc_id.hide();
			obj_forest_id.show();
			if(obj_id.val() == 'Mart' || obj_id.val() == 'LambdaMart'){
				obj_numberTrLeaves_div_id.show()
				obj_treeDepth_div_id.hide();		
			}
			if(obj_id.val() == 'ObvMart' || obj_id.val() == 'ObvLambdaMart'){
				obj_treeDepth_div_id.show();
				obj_numberTrLeaves_div_id.hide();
			}
		}
	});
	

	//FUNCTION TO HANDLE RESET TASK
	
	$( document ).on( "click", ".resetting", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("reset");
	    var id_number=id_number_array[1];
	    var resetTask_class='.resetTask'+id_number;
	    var obj_resetTask_class=$(resetTask_class);
	    var train_class=".training"+id_number;
	    var obj_train_class=$(train_class);
	    var model_file_div="#model_file_div"+id_number;
	    var obj_model_file_div=$(model_file_div);
	    var forest_id="#forest"+id_number;
	    var obj_forest_id=$(forest_id);
	    var coordAsc_id="#coordAsc"+id_number;
	    var obj_coordAsc_id=$(coordAsc_id);
		obj_coordAsc_id.hide();
		obj_forest_id.show();
		obj_resetTask_class.prop('checked',false);
		obj_resetTask_class.val("");
		obj_train_class.prop('disabled', 'disabled');
		$('.spanRemFile').text(' No file chosen');
		obj_model_file_div.show();
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
	
	$( document ).on( "change", ".localTrainFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("training_file");
	    var id_number=id_number_array[1];
	    var localTrainFile_id = "#training_file"+id_number;
	    var obj_localTrainFile_id = $(localTrainFile_id);
	    var loadTrainFile_id="#load_train_checkbox"+id_number;
	    var obj_loadTrainFile_id=$(loadTrainFile_id);
	    if(obj_localTrainFile_id.val() != ""){
	    	obj_loadTrainFile_id.prop('disabled', '');
	    }
	    else{
	    	obj_localTrainFile_id.val() == "";
	    	obj_loadTrainFile_id.prop('checked', false);
	    	obj_loadTrainFile_id.prop('disabled', 'disabled');
	    }
	});
	
	
	$( document ).on( "change", ".localValiFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("validation_file");
	    var id_number=id_number_array[1];
	    var localValiFile_id = "#validation_file"+id_number;
	    var obj_localValiFile_id = $(localValiFile_id);
	    var loadValiFile_id="#load_vali_checkbox"+id_number;
	    var obj_loadValiFile_id=$(loadValiFile_id);
	    if(obj_localValiFile_id.val() != ""){
	    	obj_loadValiFile_id.prop('disabled', '');
	    }
	    else{
	    	obj_localValiFile_id.val() == "";
	    	obj_loadValiFile_id.prop('checked', false);
	    	obj_loadValiFile_id.prop('disabled', 'disabled');
	    }
	});
	
	
	$( document ).on( "change", ".localFeatFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("features_file");
	    var id_number=id_number_array[1];
	    var localFeatFile_id = "#features_file"+id_number;
	    var obj_localFeatFile_id = $(localFeatFile_id);
	    var loadFeatFile_id="#load_feat_checkbox"+id_number;
	    var obj_loadFeatFile_id=$(loadFeatFile_id);
	    if(obj_localFeatFile_id.val() != ""){
	    	obj_loadFeatFile_id.prop('disabled', '');
	    }
	    else{
	    	obj_localFeatFile_id.val() == "";
	    	obj_loadFeatFile_id.prop('checked', false);
	    	obj_loadFeatFile_id.prop('disabled', 'disabled');
	    }
	});
	
	
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
	
	
	//FUNCTION TO SET INPUT FIELD FOR LOAD FILE ON S3
	
	$( document ).on( "change", ".loadTrainFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_train_checkbox");
	    var id_number=id_number_array[1];
	    var loadTrainFile_id="#load_trainFile_remote"+id_number;
	    var obj_loadTrainFile_id=$(loadTrainFile_id);
	    obj_loadTrainFile_id.val("true");
	});
	
	
	$( document ).on( "change", ".loadValiFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_vali_checkbox");
	    var id_number=id_number_array[1];
	    var loadValiFile_id="#load_valiFile_remote"+id_number;
	    var obj_loadValiFile_id=$(loadValiFile_id);
	    obj_loadValiFile_id.val("true");
	});
	
	
	$( document ).on( "change", ".loadFeatFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_feat_checkbox");
	    var id_number=id_number_array[1];
	    var loadFeatFile_id="#load_featFile_remote"+id_number;
	    var obj_loadFeatFile_id=$(loadFeatFile_id);
	    obj_loadFeatFile_id.val("true");
	});
	
	
	$( document ).on( "change", ".loadTestFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("load_test_checkbox");
	    var id_number=id_number_array[1];
	    var loadTestFile_id="#load_testFile_remote"+id_number;
	    var obj_loadTestFile_id=$(loadTestFile_id);
	    obj_loadTestFile_id.val("true");
	});
	
	
	//FUNCTION TO RETRIEVE FILE LIST FROM S3
	
	$( document ).on( "click", ".remoteTrainFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("training_file_remote");
	    var id_number=id_number_array[1];
	    var trainFileTable_id="#train_remoteFileTable"+id_number;
	    var obj_trainFileTable_id=$(trainFileTable_id);
	    var output1="<tr><th>Name</th><th>Size (Byte)</th></tr>";
	    var output2;
	    var trainUrl = url+'/s3/training';
	    $.getJSON(trainUrl, function(s3) {
	    	for (var i in s3.files_list) {
	    	    output2+="<tr class="+"select"+ ">" + "<td>" + s3.files_list[i].file_name + "</td>" + "<td>" + s3.files_list[i].file_length + "</td>" + "</tr>";
	    	}
	    	final_output=output1+output2;
	    	obj_trainFileTable_id.html(final_output);
	    });
	    
	});
	
	
	$( document ).on( "click", ".remoteValiFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("validation_file_remote");
	    var id_number=id_number_array[1];
	    var valiFileTable_id="#vali_remoteFileTable"+id_number;
	    var obj_valiFileTable_id=$(valiFileTable_id);
	    var output1="<tr><th>Name</th><th>Size (Byte)</th></tr>";
	    var output2;
	    var valiUrl = url+'/s3/validation';
	    $.getJSON(valiUrl, function(s3) {
	    	for (var i in s3.files_list) {
	    	    output2+="<tr class="+"select"+ ">" + "<td>" + s3.files_list[i].file_name + "</td>" + "<td>" + s3.files_list[i].file_length + "</td>" + "</tr>";
	    	}
	    	final_output=output1+output2;
	    	obj_valiFileTable_id.html(final_output);
	    });
	    
	});
	
	
	$( document ).on( "click", ".remoteFeatFile", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("features_file_remote");
	    var id_number=id_number_array[1];
	    var featFileTable_id="#feat_remoteFileTable"+id_number;
	    var obj_featFileTable_id=$(featFileTable_id);
	    var output1="<tr><th>Name</th><th>Size (Byte)</th></tr>";
	    var output2;
	    var featUrl = url+'/s3/features';
	    $.getJSON(featUrl, function(s3) {
	    	for (var i in s3.files_list) {
	    	    output2+="<tr class="+"select"+ ">" + "<td>" + s3.files_list[i].file_name + "</td>" + "<td>" + s3.files_list[i].file_length + "</td>" + "</tr>";
	    	}
	    	final_output=output1+output2;
	    	obj_featFileTable_id.html(final_output);
	    });
	    
	});
	
	
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
			
	
	//FUNCTION TO SHOW A SELECTED FILE FROM S3
	
	$( document ).on( "click", ".select", function() {
		$(this).addClass('selected').siblings().removeClass('selected');
	});
	
	
	//FUNCTION TO SELECT FILE FROM S3
	
	$( document ).on( "click", ".remoteTrainSelection", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteTrainSel");
	    var id_number=id_number_array[1];
	    var trainFileRemoteSel_id="#train_remoteFileTable"+id_number+" "+"tr.selected"+" "+"td:first";
	    var obj_trainFileRemoteSel_id=$(trainFileRemoteSel_id);
	    var trainFileRemBut_id="#training_file_remote"+id_number;
	    var obj_trainFileRemBut_id=$(trainFileRemBut_id);
	    var selTrainFileRem_id="#selected_trainFile_remote"+id_number;
	    var obj_selTrainFileRem_id=$(selTrainFileRem_id);
	    obj_selTrainFileRem_id.val(obj_trainFileRemoteSel_id.html());
	    obj_trainFileRemBut_id.next().text(" "+obj_trainFileRemoteSel_id.html());
	});
	
	
	$( document ).on( "click", ".remoteValiSelection", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteValiSel");
	    var id_number=id_number_array[1];
	    var valiFileRemoteSel_id="#vali_remoteFileTable"+id_number+" "+"tr.selected"+" "+"td:first";
	    var obj_valiFileRemoteSel_id=$(valiFileRemoteSel_id);
	    var valiFileRemBut_id="#validation_file_remote"+id_number;
	    var obj_valiFileRemBut_id=$(valiFileRemBut_id);
	    var selValiFileRem_id="#selected_valiFile_remote"+id_number;
	    var obj_selValiFileRem_id=$(selValiFileRem_id);
	    obj_selValiFileRem_id.val(obj_valiFileRemoteSel_id.html());
	    obj_valiFileRemBut_id.next().text(" "+obj_valiFileRemoteSel_id.html());
	});
	
	
	$( document ).on( "click", ".remoteFeatSelection", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteFeatSel");
	    var id_number=id_number_array[1];
	    var featFileRemoteSel_id="#feat_remoteFileTable"+id_number+" "+"tr.selected"+" "+"td:first";
	    var obj_featFileRemoteSel_id=$(featFileRemoteSel_id);
	    var featFileRemBut_id="#features_file_remote"+id_number;
	    var obj_featFileRemBut_id=$(featFileRemBut_id);
	    var selFeatFileRem_id="#selected_featFile_remote"+id_number;
	    var obj_selFeatFileRem_id=$(selFeatFileRem_id);
	    obj_selFeatFileRem_id.val(obj_featFileRemoteSel_id.html());
	    obj_featFileRemBut_id.next().text(" "+obj_featFileRemoteSel_id.html());
	});
	
	
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
	
	
	//FUNCTION TO UNSELECT FILE FROM S3
	
	$( document ).on( "click", ".removeTrainSel", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteTrainUnsel");
	    var id_number=id_number_array[1];
	    var selTrainFileRem_id="#selected_trainFile_remote"+id_number;
	    var obj_selTrainFileRem_id=$(selTrainFileRem_id);
	    var spanTrainFileRem_id="#spanRemTrainFile"+id_number;
	    var obj_spanTrainFileRem_id=$(spanTrainFileRem_id);
	    obj_selTrainFileRem_id.val("");
	    obj_spanTrainFileRem_id.text(' No file chosen');
	});
	
	
	$( document ).on( "click", ".removeValiSel", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteValiUnsel");
	    var id_number=id_number_array[1];
	    var selValiFileRem_id="#selected_valiFile_remote"+id_number;
	    var obj_selValiFileRem_id=$(selValiFileRem_id);
	    var spanValiFileRem_id="#spanRemValiFile"+id_number;
	    var obj_spanValiFileRem_id=$(spanValiFileRem_id);
	    obj_selTrainFileRem_id.val("");
	    obj_spanValiFileRem_id.text(' No file chosen');
	});
	
	
	$( document ).on( "click", ".removeFeatSel", function() {
		var id=$(this).attr('id');
	    var id_number_array=id.split("remoteFeatUnsel");
	    var id_number=id_number_array[1];
	    var selFeatFileRem_id="#selected_featFile_remote"+id_number;
	    var obj_selFeatFileRem_id=$(selFeatFileRem_id);
	    var spanFeatFileRem_id="#spanRemFeatFile"+id_number;
	    var obj_spanFeatFileRem_id=$(spanFeatFileRem_id);
	    obj_selFeatFileRem_id.val("");
	    obj_spanFeatFileRem_id.text(' No file chosen');
	});
	
	
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
	
	
	//FUNCTION TO CHECK FOREST SETTINGS
	
	function checkForestSettings(currNumTask) {
		var id='#numbTrees'+currNumTask;
	    var obj_id=$(id);
	    var number_reg_exp = /^([0-9]+)?$/;
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Number of trees in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#shrink'+currNumTask;
	    obj_id=$(id);
	    var decimal_number_reg_exp = /^([0-9](\.[0-9]{1,9})?)?$/;
	    if(!decimal_number_reg_exp.test(obj_id.val()) || parseFloat(obj_id.val()) == 0) {
			alert('Insert decimal value (10,9 and > 0) for Shrinkage in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#numberThHold'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 0 ) {
			alert('Insert integer value (>= 0) for Number of thresholds in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#minLeafSup'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Minimum number of leaf support in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#esrNumber'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 0 ) {
			alert('Insert integer value (>= 0) for Number rounds with no boost validation before ending in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#rankAlg'+currNumTask+' '+'option:selected';
	    obj_id=$(id);
	    var treeDepth_div_id="#treeDepth_div"+currNumTask;
		var obj_treeDepth_div_id=$(treeDepth_div_id);
		var numberTrLeaves_div_id="#numberTrLeaves_div"+currNumTask;
	    var obj_numberTrLeaves_div_id=$(numberTrLeaves_div_id);
	    if(obj_id.val() == 'Mart' || obj_id.val() == 'LambdaMart'){
	    	id='#numberTrLeaves'+currNumTask;
		    obj_id=$(id);
		    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
				alert('Insert integer value (>= 1) for Number of leaves in Learning Task '+currNumTask);
				obj_id.focus();
				return false;
			}	    	
	    }
	    if(obj_id.val() == 'Oblivious Mart' || obj_id.val() == 'Oblivious LambdaMart'){
	    	id='#treeDepth'+currNumTask;
		    obj_id=$(id);
		    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
	 			alert('Insert integer value (>= 1) for Tree depth in Learning Task '+currNumTask);
				obj_id.focus();
				return false;
			}
	    }
	    
	    return true;
	}
	
	
	//FUNCTION TO CHECK COORDINATE ASCENT SETTINGS
	
	function checkCoordAscSettings(currNumTask) {
		var id='#numberPoints'+currNumTask;
	    var obj_id=$(id);
	    var number_reg_exp = /^([0-9]+)?$/;
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Number of samples in search window in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#winSize'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Search window size in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#redFactor'+currNumTask;
	    obj_id=$(id);
	    var decimal_number_reg_exp = /^([0-9](\.[0-9]{1,9})?)?$/;
	    if(!decimal_number_reg_exp.test(obj_id.val()) || parseFloat(obj_id.val()) == 0) {
			alert('Insert decimal value (10,9 and > 0) for Window reduction factor in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#numberMaxIte'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Number of maximum iterations in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    id='#numberMaxFail'+currNumTask;
	    obj_id=$(id);
	    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 1 ) {
			alert('Insert integer value (>= 1) for Number of fails on validation before ending in Learning Task '+currNumTask);
			obj_id.focus();
			return false;
		}
	    
	    return true;
	    
	}
	
	
	//SUBMIT FUNCTION WITH FORM CONTROLS
	
	$('#submitTask').click(function() {
		for(i = 1; i <= numTask; i++ ){

		    var valChk_id='#validation_checkbox'+i;
		    var obj_valChk_id=$(valChk_id);
			var testChk_id='#testing_checkbox'+i;
		    var obj_testChk_id=$(testChk_id);
			var valCheckBox = obj_valChk_id.is(":checked");
			var testCheckBox = obj_testChk_id.is(":checked");
	
			var id='#rankAlg'+i+' '+'option:selected';
		    var obj_id=$(id);
		    if(obj_id.val() == '') {
				alert('Select Learning to Rank Algorithm in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#trainMetric'+i+' '+'option:selected';
		    obj_id=$(id);
		    if(obj_id.text() == 'Train metric') {
				alert('Select Train metric in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#trainCutoff'+i;
		    obj_id=$(id);
		    var number_reg_exp = /^([0-9]+)?$/;
		    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 0 ) {
				alert('Insert integer value (>= 0) for Train metric cutoff in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#parSave'+i;
		    obj_id=$(id);
		    if(!number_reg_exp.test(obj_id.val()) || parseInt(obj_id.val()) < 0 ) {
				alert('Insert integer value (>= 0) for Partial file save frequency in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#training_file'+i;
		    obj_id=$(id);
		    var id2='#selected_trainFile_remote'+i;
		    var obj_id2=$(id2);
		    if(obj_id.val() == "" && obj_id2.val() == "") {
		    
				alert('Select Training file in Learning Task '+i);
				obj_id.focus();
				return;
		    	
		    }	
		    if(obj_id.val() != "" && obj_id2.val() != "") {
				alert('Select local or remote Training file in Learning Task '+i);
				obj_id.focus();
				return;
			}
		    id='#features_file'+i;
            obj_id=$(id);
            var id2='#selected_featFile_remote'+i;
            var obj_id2=$(id2);
            if(obj_id.val() == "" && obj_id2.val() == "") {
                alert('Select Features file in Learning Task '+i);
                obj_id.focus();
                return;
            }
            if(obj_id.val() != "" && obj_id2.val() != "") {
                alert('Select local or remote Features file in Learning Task '+i);
                obj_id.focus();
                return;
            }
		    id='#rankAlg'+i+' '+'option:selected';
		    obj_id=$(id);
		    if(obj_id.val() != 'CoordAsc') {
		    	if(!checkForestSettings(i)){
		    		return;
		    	}
			}
		    else if(!checkCoordAscSettings(i)){
		    	return;
		    }	    

			if(valCheckBox){
				 var id='#validation_file'+i;
				 var obj_id=$(id);
				 var id2='#selected_valiFile_remote'+i;
				 var obj_id2=$(id2);
				 if(obj_id.val() == "" && obj_id2.val() == "") {
					alert('Select Validation file in Learning Task '+i);
					obj_id.focus();
					return;
				 }
				 if(obj_id.val() != "" && obj_id2.val() != "") {
					alert('Select local or remote Validation file in Learning Task '+i);
					obj_id.focus();
					return;
				 }
				 
			}
			
			if(testCheckBox){
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
					alert('Select Testing file in Learning Task '+i);
					obj_id.focus();
					return;
				}
				if(obj_id.val() != "" && obj_id2.val() != "") {
					alert('Select local or remote Testing file in Learning Task '+i);
					obj_id.focus();
					return;
				}
			}	
		
		}
			
		$('.workaround').prop('disabled', '');
		
		var numTaskInput='<div class="form-group">'
							+'<input name="ntasks" value="'+numTask+'" type="hidden">'
						+'</div>';
		$('#form').append(numTaskInput);
		$('#form').attr('action', url+"/training/quicklearn").submit();
				
	});

	
	//FUNCTION TO ADD TASK
	
	var numTask = 1;
	$('#addTask').click(function() {
		numTask=numTask+1;
		var taskForm='<div id="taskPanel'+numTask+'" class="panel panel-default">'
					+'<div class="panel-heading">Training Task '+numTask+'</div>'
					+'<div class="panel-body">'
						+'<div class="row">'
							+'<div class="col-lg-4" id="trainVali_div'+numTask+'">'
								+'<div class="form-group">'
									+'<label>Learning to Rank Algorithm</label>'
									+'<select class="form-control rankingAlg training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" id="rankAlg'+numTask+'" name="algorithm_string'+numTask+'">'
										+'<option value="" selected style="display:none">LtR algorithm</option>'
										+'<option value="Mart">Mart</option>'
										+'<option value="LambdaMart">LambdaMart</option>'
										+'<option value="ObvMart">Oblivious Mart</option>'
										+'<option value="ObvLambdaMart">Oblivious LambdaMart</option>'
										+'<option value="CoordAsc">Coordinate Ascent</option>'
									+'</select>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Train metric</label>'
									+'<select class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" id="trainMetric'+numTask+'" name="train_metric_string'+numTask+'">'
										+'<option value="" selected style="display:none">Train metric</option>'
										+'<option value="NDCG">NDCG</option>'
										+'<option value="DCG">DCG</option>'
										+'<option value="TNDCG">TNDCG</option>'
										+'<option value="MAP">MAP</option>'
									+'</select>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Train metric cutoff</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Cutoff (default: 10)" id="trainCutoff'+numTask+'" name="train_cutoff'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Partial file save frequency</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Frequency (default: 100)" id="parSave'+numTask+'" name="partial_save'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Training file</label>' 
									+'<input class="training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+' localTrainFile" id="training_file'+numTask+'" type="file" name="training_filename'+numTask+'">'
									+'<input class="workaround resetTask'+numTask+' resetTrain'+numTask+' loadTrainFile" id="load_train_checkbox'+numTask+'" type="checkbox" disabled> Upload training file on S3</input>'
									+'<input class="resetTask'+numTask+' resetTrain'+numTask+'" id="load_trainFile_remote'+numTask+'" name="load_trainfile'+numTask+'" type="hidden">'
								+'</div>'
								+'<div class="form-group" id="remoteFileTrainDiv'+numTask+'">'
									+'<label>Training remote file</label>' 
									+'<button class="btn btn-default btn-xs training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+' remoteTrainFile" data-toggle="modal" data-target="#myModalTrain'+numTask+'" id="training_file_remote'+numTask+'" type="button" style="margin-left:3px">Choose File</button><span class="spanRemFile" id="spanRemTrainFile'+numTask+'"> No file chosen</span>'
									+'<input class="resetTask'+numTask+' resetTrain'+numTask+'" id="selected_trainFile_remote'+numTask+'" name="training_file_remote'+numTask+'" type="hidden">'
								+'</div>'
	                            +'<div class="modal fade" id="myModalTrain'+numTask+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabelTrain'+numTask+'" aria-hidden="true">'
	                                +'<div class="modal-dialog">'
	                                    +'<div class="modal-content">'
	                                       +'<div class="modal-header">'
	                                            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
	                                            +'<h4 class="modal-title" id="myModalLabelTrain'+numTask+'">Remote Training Files List</h4>'
	                                        +'</div>'
	                                        +'<div class="modal-body">'
	                                        	+'<table id="train_remoteFileTable'+numTask+'" style="width:100%">'   
												+'</table>'
	                                        +'</div>'
	                                        +'<div class="modal-footer">'
	                                            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
	                                            +'<button type="button" class="btn btn-default removeTrainSel" data-dismiss="modal" id="remoteTrainUnsel'+numTask+'">Cancel file</button>'
	                                            +'<button type="button" class="btn btn-primary remoteTrainSelection" data-dismiss="modal" id="remoteTrainSel'+numTask+'">Select file</button>'
	                                        +'</div>'
	                                    +'</div>'
	                                +'</div>'
	                            +'</div>'
								+'<div id="vali_div'+numTask+'">'
									+'<div class="form-group">'
										+'<div class="checkbox">'
											+'<label><input class="validation_checkbox training'+numTask+' resetTask'+numTask+'" id="validation_checkbox'+numTask+'" type="checkbox">Validation</label>'
											+'<input class="resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+'" id="vali_chkbox'+numTask+'" name="vali_chkboxVal'+numTask+'" type="hidden">'
								    	+'</div>'
								    +'</div>'
								    +'<div class="form-group">'
										+'<label>Validation file</label>' 
										+'<input class="validation'+numTask+' workaround resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+' localValiFile" id="validation_file'+numTask+'" type="file" name="validation_filename'+numTask+'" disabled>'
										+'<input class="workaround resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+' loadValiFile" id="load_vali_checkbox'+numTask+'" type="checkbox" disabled> Upload validation file on S3</input>'
										+'<input class="resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+'" id="load_valiFile_remote'+numTask+'" name="load_valifile'+numTask+'" type="hidden">'
									+'</div>'
									+'<div class="form-group">'
										+'<label>Validation remote file</label>' 
										+'<button class="btn btn-default btn-xs validation'+numTask+' workaround resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+' remoteValiFile" data-toggle="modal" data-target="#myModalVali'+numTask+'" id="validation_file_remote'+numTask+'" type="button" style="margin-left:3px" disabled>Choose File</button><span class="spanRemFile" id="spanRemValiFile'+numTask+'"> No file chosen</span>'
										+'<input class="resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+'" id="selected_valiFile_remote'+numTask+'" name="validation_file_remote'+numTask+'" type="hidden">'
									+'</div>'
		                            +'<div class="modal fade" id="myModalVali'+numTask+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabelVali'+numTask+'" aria-hidden="true">'
		                                +'<div class="modal-dialog">'
		                                    +'<div class="modal-content">'
		                                        +'<div class="modal-header">'
		                                            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
		                                            +'<h4 class="modal-title" id="myModalLabelVali'+numTask+'">Remote Validation Files List</h4>'
		                                        +'</div>'
		                                        +'<div class="modal-body">'
		                                        	+'<table id="vali_remoteFileTable'+numTask+'" style="width:100%">'   
													+'</table>'
		                                        +'</div>'
		                                        +'<div class="modal-footer">'
		                                            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
		                                            +'<button type="button" class="btn btn-default removeValiSel" data-dismiss="modal" id="remoteValiUnsel'+numTask+'">Cancel file</button>'
		                                            +'<button type="button" class="btn btn-primary remoteValiSelection" data-dismiss="modal" id="remoteValiSel'+numTask+'">Select file</button>'
		                                        +'</div>'
		                                    +'</div>'
		                                +'</div>'
		                            +'</div>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Features file</label>' 
									+'<input class="training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+' localFeatFile" id="features_file'+numTask+'" type="file" name="features_filename'+numTask+'">'
									+'<input class="workaround resetTask'+numTask+' resetTrain'+numTask+' loadFeatFile" id="load_feat_checkbox'+numTask+'" type="checkbox" disabled> Upload features file on S3</input>'
									+'<input class="resetTask'+numTask+' resetTrain'+numTask+'" id="load_featFile_remote'+numTask+'" name="load_featfile'+numTask+'" type="hidden">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Features remote file</label>' 
									+'<button class="btn btn-default btn-xs training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+' remoteFeatFile" data-toggle="modal" data-target="#myModalFeat'+numTask+'" id="features_file_remote'+numTask+'" type="button" style="margin-left:3px">Choose File</button><span class="spanRemFile" id="spanRemFeatFile'+numTask+'"> No file chosen</span>'
									+'<input class="resetTask'+numTask+' resetTrain'+numTask+'" id="selected_featFile_remote'+numTask+'" name="features_file_remote'+numTask+'" type="hidden">'
								+'</div>'
	                            +'<div class="modal fade" id="myModalFeat'+numTask+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabelFeat'+numTask+'" aria-hidden="true">'
	                                +'<div class="modal-dialog">'
	                                    +'<div class="modal-content">'
	                                        +'<div class="modal-header">'
	                                            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
	                                            +'<h4 class="modal-title" id="myModalLabelFeat'+numTask+'">Remote Feautures Files List</h4>'
	                                        +'</div>'
	                                        +'<div class="modal-body">'
	                                        	+'<table id="feat_remoteFileTable'+numTask+'" style="width:100%">'   
												+'</table>'
	                                        +'</div>'
	                                        +'<div class="modal-footer">'
	                                            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
	                                            +'<button type="button" class="btn btn-default removeFeatSel" data-dismiss="modal" id="remoteFeatUnsel'+numTask+'">Cancel file</button>'
	                                            +'<button type="button" class="btn btn-primary remoteFeatSelection" data-dismiss="modal" id="remoteFeatSel'+numTask+'">Select file</button>'
	                                        +'</div>'
	                                    +'</div>'
	                                +'</div>'
	                            +'</div>'
							+'</div>'
							+'<div class="col-lg-4" id="forest'+numTask+'">'
								+'<h4>Forest Settings</h4>'
								+'<div class="form-group">'
									+'<label>Number of trees</label><input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# trees (default: 1000)" id="numbTrees'+numTask+'" name="ntrees'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Shrinkage</label>'
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Shrinkage (default: 0.100000001)" id="shrink'+numTask+'" name="shrinkage'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Number of thresholds</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# thresholds (default: 0)" id="numberThHold'+numTask+'" name="nthresholds'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Minimum number of leaf support</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Min. leaf support (default: 1)" id="minLeafSup'+numTask+'" name="minleafsupport'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Num. rounds with no boost in validation before ending</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# rounds (default: 100, if 0 disabled)" id="esrNumber'+numTask+'" name="esr'+numTask+'">'
								+'</div>'
								+'<div class="form-group" id="numberTrLeaves_div'+numTask+'">'
									+'<label>Number of leaves</label>'
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# leaves (default: 10, applied only to Mart/LambdaMart)" id="numberTrLeaves'+numTask+'" name="ntreeleaves'+numTask+'">'
								+'</div>'
								+'<div class="form-group treeDepth_div" id="treeDepth_div'+numTask+'">'
									+'<label>Tree depth</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Depth (default: 3, applied only to Oblivious Mart/LambdaMart)" id="treeDepth'+numTask+'" name="treedepth'+numTask+'">'
								+'</div>'
							+'</div>'
							+'<div class="col-lg-4 coordAsc" id="coordAsc'+numTask+'">'
								+'<h4>Coordinate Ascent Settings</h4>'
								+'<div class="form-group">'
									+'<label>Number of samples in search window</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# samples (default: 21)" id="numberPoints'+numTask+'" name="num_points'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Search window size</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Window size (default: 10)" id="winSize'+numTask+'" name="window_size'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Window reduction factor</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="Factor (default: 0.949999988)" id="redFactor'+numTask+'" name="reduction_factor'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Number of maximum iterations</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# max iterations (default: 100)" id="numberMaxIte'+numTask+'" name="max_iterations'+numTask+'">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Number of fails on validation before ending</label>' 
									+'<input class="form-control training'+numTask+' resetTask'+numTask+' resetTrain'+numTask+'" placeholder="# max failed validations (default: 20)" id="numberMaxFail'+numTask+'" name="max_failed_vali'+numTask+'">'
								+'</div>'
							+'</div>'
							+'<div class="col-lg-4" id="test_div'+numTask+'">'
								+'<div class="form-group">'
									+'<div class="checkbox">'
										+'<label><input class="testing_checkbox resetTask'+numTask+' resetTrain'+numTask+' resetVali'+numTask+'" id="testing_checkbox'+numTask+'" type="checkbox">Testing</label>'
										+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="test_chkbox'+numTask+'" name="test_chkboxVal'+numTask+'" type="hidden">'
									+'</div>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Test metric</label>' 
									+'<select class="form-control testing'+numTask+' workaround resetTask'+numTask+' resetTest'+numTask+'" id="testMetric'+numTask+'" name="test_metric_string'+numTask+'" disabled>'
										+'<option value="" style="display:none">Test metric</option>'
										+'<option value="NDCG">NDCG</option>'
										+'<option value="DCG">DCG</option>'
										+'<option value="TNDCG">TNDCG</option>'
										+'<option value="MAP">MAP</option>'
										+'</select>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Test metric cutoff</label>'
									+'<input class="form-control testing'+numTask+' workaround resetTask'+numTask+' resetTest'+numTask+'" placeholder="Cutoff (default: 10)" id="testCutoff'+numTask+'" name="test_cutoff'+numTask+'" disabled>'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Testing file</label>' 
									+'<input class="testing'+numTask+' workaround resetTask'+numTask+' resetTest'+numTask+' localTestFile" id="test_file'+numTask+'" type="file" name="test_filename'+numTask+'" disabled>'
									+'<input class="workaround resetTask'+numTask+' resetTest'+numTask+' loadTestFile" id="load_test_checkbox'+numTask+'" type="checkbox" disabled> Upload testing file on S3</input>'
									+'<input class="resetTask'+numTask+' resetTest'+numTask+'" id="load_testFile_remote'+numTask+'" name="load_testfile'+numTask+'" type="hidden">'
								+'</div>'
								+'<div class="form-group">'
									+'<label>Testing remote file</label>' 
									+'<button class="btn btn-default btn-xs testing'+numTask+' workaround resetTask'+numTask+' resetTest'+numTask+' remoteTestFile" data-toggle="modal" data-target="#myModalTest'+numTask+'" id="testing_file_remote'+numTask+'" type="button" style="margin-left:3px" disabled>Choose File</button><span class="spanRemFile" id="spanRemTestFile'+numTask+'"> No file chosen</span>'
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
						+'</div>'
					+'</div>'
					+'<div class="panel-footer">'
						+'<button type="button" class="btn btn-default resetting" id="reset'+numTask+'">Reset Task</button>'
						+'<button type="button" class="btn btn-default removing" id="remove'+numTask+'" style="margin-left:5px">Remove Task</button>'
					+'</div>'
				+'</div>';
		$("#form").append(taskForm);
		$('.coordAsc, .treeDepth_div').hide();
	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});
	
});