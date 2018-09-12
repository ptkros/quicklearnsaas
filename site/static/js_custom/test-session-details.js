$(document).ready(function() {

	var url = window.location.origin;
	var sName = location.search.split('session_name=')[1];
	$('#session_h1').text('Testing Session '+sName+' Details');
	
		
	//SESSION DONUT CHART
	
	var donut;
	var hDonut;
	var sDonutChartUrl =  url+'/dv/testing/sessions/'+sName+'/donut';
	
	$.getJSON(sDonutChartUrl, function(donutChart) {
     		
		donut = Morris.Donut({
		        element: 'morris-donut-chart',
		        data: donutChart.tasks_status,
		        colors: ['#109618', '#FF9900', '#990099'],
		        resize: true   
	    });
		
		hDonut = $('#morris-donut-chart').height();
		$('.table_task_div').css("height", hDonut);
	    $('.table_task_div').resize();
		
	}); 
	
	
	$( document ).on( "click", "#session_donut", function() {
		
		$.getJSON(sDonutChartUrl, function(donutChart) {	
			donut.setData(donutChart.tasks_status);
	    });

	});
	
	
	//TASK TABLE

	function taskInfo(tName,tStatus){
		
		var tTableUrl = url+'/dv/testing/sessions/'+sName+'/tasks/'+tName+'/detailstable';
		var output;
		var tDownloadModelUrl = url+'/dv/sessions/'+sName+'/tasks/'+tName+'/download';
		var button;
	
		$.getJSON(tTableUrl, function(taskTable) {
		 
			output+="<tr>" + "<td><strong>Test metric</strong></td>" + "<td>" + taskTable.test_metric + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Test cutoff</strong></td>" + "<td>" + taskTable.test_cutoff + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Testing filename</strong></td>" + "<td>" + taskTable.test_filename + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Model filename</strong></td>" + "<td>" + taskTable.model_filename + "</td>" + "</tr>";
			
			if(tStatus == 'Completed'){
				 
				button = '<a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/test/score" style="width:100%;">Download Test Scores</a>';
				
			}
			else{
				
				button = '<a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/test/score" style="width:100%;" disabled>Download Test Scores</a>';
				
			}
			
			$("#table_task tbody").html(output);
			$(button).insertAfter("#table_task");
			
			hDonut = $('#morris-donut-chart').height();
		    $('.table_task_div').css("height", hDonut);
		    $('.table_task_div').resize();
		   
		});
			
	}
	
	
	function firstRowtaskInfo(datatable){
		if ( $('#dataTables-session tbody tr:first').hasClass('info') ) {
			$('#dataTables-session tbody tr:first').removeClass('info');
        }
        else {
        	datatable.$('tr.info').removeClass('info');
            $('#dataTables-session tbody tr:first').addClass('info');
            var d0 = datatable.row('0').data();
    		var tName0 = d0.name;
    		var tStatus0 = d0.status;
    		tLineChartUrl = url+'/dv/testing/sessions/'+sName+'/tasks/'+tName0+'/line';
    		taskInfo(tName0,tStatus0);
        }
	}
	
	
	//SESSION DATATABLES
	
	var sDatatablesUrl = url+'/dv/testing/sessions/'+sName+'/datatables';
	var tLineChartUrl;
		
	var	dt = $('#dataTables-session').DataTable({
				scrollX: true,
	            processing: true,
	            serverSide: true,
	            order: [[ 1, "asc" ]],
	            ajax: sDatatablesUrl,
	            columns: [
							  { "data": "name" },
		                      { "data": "status" },
		                      { "data": "testing_score" },
		    
	                     ],
	           fnInitComplete: function(oSettings, json) {
	        	   firstRowtaskInfo(dt);	   
        	    }
		});
	
    
	$('#dataTables-session tbody').on( 'click', 'tr', function () {
		
		var tr = $(this).closest('tr');
		
		if ( tr.hasClass('info') ) {
            tr.removeClass('info');
        }
        else {
            dt.$('tr.info').removeClass('info');
            tr.addClass('info');
    		var row = dt.row(tr);
    		var d = row.data();
    		var tName = d.name;
    		var tStatus = d.status;
    		var tTest = d.testing_task;
    		taskInfo(tName,tStatus,tTest);    		    		
        }
		
    });
	
	
	$( document ).on( "click", "#session_table", function() {
		
		dt.ajax.reload();

	});
	
	
	//FUNCTION TO RESIZE DIVs
	
	$(window).resize(function(){
	
		hDonut = $('#morris-donut-chart').height();
	    $('.table_task_div').css("height", hDonut);
	    $('.table_task_div').resize();

	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});
	
});	