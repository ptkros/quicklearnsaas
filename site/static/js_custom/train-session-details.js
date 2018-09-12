$(document).ready(function() {

	var url = window.location.origin;
	var sName = location.search.split('session_name=')[1];
	$('#session_h1').text('Training Session '+sName+' Details');
	
		
	//SESSION DONUT CHART
	
	var donut;
	var hDonut;
	var sDonutChartUrl =  url+'/dv/training/sessions/'+sName+'/donut';
	
	$.getJSON(sDonutChartUrl, function(donutChart) {
     		
		donut = Morris.Donut({
		        element: 'morris-donut-chart',
		        data: donutChart.tasks_status,
		        colors: ['#109618', '#FF9900', '#990099'],
		        resize: true   
	    });
		
		hDonut = $('#morris-donut-chart').height() - 40;
	    $('#line_chart_div').css("height", hDonut);
	    $('#line_chart_div').resize();
		
	}); 
	
	
	$( document ).on( "click", "#session_donut", function() {
		
		$.getJSON(sDonutChartUrl, function(donutChart) {	
			donut.setData(donutChart.tasks_status);
	    });

	});
	
	
	//TASK LINE CHART
	
	var line;
	var lineOverview;
	var d1_1 = [];
	var d1_2 = [];
		
	function renderLineChart(tLineChartUrl) {
	
		$.getJSON(tLineChartUrl, function(lineChart) {
					
			for (var i in lineChart.score_values){
			
				d1_1.push([lineChart.score_values[i].iter,lineChart.score_values[i].training_score]);
				
				if(lineChart.score_values[i].validation_score != 0){
						d1_2.push([lineChart.score_values[i].iter,lineChart.score_values[i].validation_score]);
				}
				          
			}
			
			var lineData = [
				             {
				                 label: "Training Score",
				                 data: d1_1,
				                 lines: {
				 					show: true,
				 					lineWidth: 1
				 				 },
				                 color: "#3366CC"
				             },
				             {
				                 label: "Validation Score",
				                 data: d1_2,
				                 lines: {
				 					show: true,
				 					lineWidth: 1
				 				 },
				                 color: "#DC3912"
				             }   
			              ];
			
			
			line = $.plot("#task-line-chart", lineData, {
				xaxis: {
					axisLabel: "Iteration",
					tickDecimals: 0,
					tick: 100
				},
				yaxis: {
					axisLabel: "Score"
				},
				grid: {
		            hoverable: true,
		            clickable: false,
		            borderWidth: 1
		        },
				selection: {
					mode: "x"
				},
		        legend: {
		            labelBoxBorderColor: "none",
		            position: "se"
		        },
		        series: {
		            shadowSize: 0
		        },
		        tooltip: true,
		        tooltipOpts: {
		            content: "Iteration: %x, Score: %y"
		        }
			});
			
			
			lineOverview = $.plot("#task-lineOverview-chart", lineData, {
				selection: {
					mode: "x"
				},
				xaxis: {
					ticks: []		
				},
				yaxis: {
					ticks: []
				},
				legend: {
		            show: false
		        },
				series: {
					shadowSize: 0
				}
			});
			
		});
	
	}
	
	
	$("#task-line-chart").bind("plotselected", function (event, ranges) {
		$.each(line.getXAxes(), function(_, axis) {
			var opts = axis.options;
			opts.min = ranges.xaxis.from;
			opts.max = ranges.xaxis.to;
		});
		line.setupGrid();
		line.draw();
		line.clearSelection();
		lineOverview.setSelection(ranges, true);
	});

	
	$("#task-lineOverview-chart").bind("plotselected", function (event, ranges) {
		line.setSelection(ranges);
	});
	
	
	function firstRowLineChart(datatable){
		if ( $('#dataTables-session tbody tr:first').hasClass('info') ) {
			$('#dataTables-session tbody tr:first').removeClass('info');
        }
        else {
        	datatable.$('tr.info').removeClass('info');
            $('#dataTables-session tbody tr:first').addClass('info');
            var d0 = datatable.row('0').data();
    		var tName0 = d0.name;
    		var tStatus0 = d0.status;
    		var tTest0 = d0.testing_task;
    		tLineChartUrl = url+'/dv/training/sessions/'+sName+'/tasks/'+tName0+'/line';
    		renderLineChart(tLineChartUrl);
    		taskInfo(tName0,tStatus0,tTest0);
        }
	}
		
	
	function updateLineChart(tLineChartUrl) {  
		
		$.getJSON(tLineChartUrl, function(lineChart) {
			
			d1_1 = [];
			d1_2 = [];
			
			for (var i in lineChart.score_values){
						
				d1_1.push([lineChart.score_values[i].iter,lineChart.score_values[i].training_score]);
				
				if(lineChart.score_values[i].validation_score != 0){
						d1_2.push([lineChart.score_values[i].iter,lineChart.score_values[i].validation_score]);
				}
				          
			}
			
			var lineData = [
				             {
				                 label: "Training Score",
				                 data: d1_1,
				                 lines: {
				 					show: true,
				 					lineWidth: 1
				 				 },
				                 color: "#3366CC"
				             },
				             {
				                 label: "Validation Score",
				                 data: d1_2,
				                 lines: {
				 					show: true,
				 					lineWidth: 1
				 				 },
				                 color: "#DC3912"
				             }   
			              ];
			
			/*line.setData(lineData);
			line.draw();
			lineOverview.setData(lineData);
			lineOverview.draw();*/
			
			line = $.plot("#task-line-chart", lineData, {
				xaxis: {
					axisLabel: "Iteration",
					tickDecimals: 0,
					tick: 100
				},
				yaxis: {
					axisLabel: "Score"
				},
				grid: {
		            hoverable: true,
		            clickable: false,
		            borderWidth: 1
		        },
				selection: {
					mode: "x"
				},
		        legend: {
		            labelBoxBorderColor: "none",
		            position: "se"
		        },
		        series: {
		            shadowSize: 0
		        },
		        tooltip: true,
		        tooltipOpts: {
		            content: "Iteration: %x, Score: %y"
		        }
			});
			
			lineOverview = $.plot("#task-lineOverview-chart", lineData, {
				selection: {
					mode: "x"
				},
				xaxis: {
					ticks: []		
				},
				yaxis: {
					ticks: []
				},
				legend: {
		            show: false
		        },
				series: {
					shadowSize: 0
				}
			});
			
		});
		 	
	}
	
	
	$( document ).on( "click", "#session_line", function() {
		
		updateLineChart(tLineChartUrl);

	});	
	
	
	//TASK TABLE
	
	var hTable;

	function taskInfo(tName,tStatus,tTest){
		
		var tTableUrl = url+'/dv/training/sessions/'+sName+'/tasks/'+tName+'/detailstable';
		var output;
		var tDownloadModelUrl = url+'/dv/sessions/'+sName+'/tasks/'+tName+'/download';
		var buttonTable;
	
		$.getJSON(tTableUrl, function(taskTable) {
		 
			output+="<tr>" + "<td><strong>Algorithm</strong></td>" + "<td>" + taskTable.algorithm_string + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Train metric</strong></td>" + "<td>" + taskTable.train_metric + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Train cutoff</strong></td>" + "<td>" + taskTable.train_cutoff + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Partial save</strong></td>" + "<td>" + taskTable.partial_save + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Training filename</strong></td>" + "<td>" + taskTable.training_filename + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Validation filename</strong></td>" + "<td>" + taskTable.validation_filename + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Features filename</strong></td>" + "<td>" + taskTable.features_filename + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong># Trees</strong></td>" + "<td>" + taskTable.ntrees + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Shrinkage</strong></td>" + "<td>" + taskTable.shrinkage + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong># Thresholds</strong></td>" + "<td>" + taskTable.nthresholds + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Min leaf support</strong></td>" + "<td>" + taskTable.minleafsupport + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Esr</strong></td>" + "<td>" + taskTable.esr + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong># Tree leaves</strong></td>" + "<td>" + taskTable.ntreeleaves + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong># Tree depth</strong></td>" + "<td>" + taskTable.treedepth + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong># Points</strong></td>" + "<td>" + taskTable.num_points + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Max iterations</strong></td>" + "<td>" + taskTable.max_iterations + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Win size</strong></td>" + "<td>" + taskTable.window_size + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Reduction factor</strong></td>" + "<td>" + taskTable.reduction_factor + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Max failed vali</strong></td>" + "<td>" + taskTable.max_failed_vali + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Test metric</strong></td>" + "<td>" + taskTable.test_metric + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Test cutoff</strong></td>" + "<td>" + taskTable.test_cutoff + "</td>" + "</tr>";
			output+="<tr>" + "<td><strong>Test filename</strong></td>" + "<td>" + taskTable.test_filename + "</td>" + "</tr>";
			$("#table_task tbody").html(output);
			
			hTable = $('#dataTable_div').height() - 42;
		    $('.table_task_div').css("height", hTable);
		    $('.table_task_div').resize();
		   
		});
		
		if(tStatus == 'Completed'){
			
			if(tTest == 'no'){	
				 
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/xml" style="width:100%;">Download XML model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/cpp" style="width:100%;">Download C++ model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/java" style="width:100%;">Download Java model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/python2" style="width:100%;">Download Python2 model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/python3" style="width:100%;">Download Python3 model</a></td>' + '</tr>';
				
			}
			else {
					
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/xml" style="width:100%;">Download XML model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/cpp" style="width:100%;">Download C++ model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/java" style="width:100%;">Download Java model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/python2" style="width:100%;">Download Python2 model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/train/python3" style="width:100%;">Download Python3 model</a></td>' + '</tr>';
				buttonTable += '<tr>' + '<td><a class="btn btn-outline btn-default" href="'+tDownloadModelUrl+'/test/score" style="width:100%;">Download Test Scores</a></td>' + '</tr>';						
				
			}
				
		}
		else{
			
			buttonTable += '<tr>' + '<td>No model to download. Task in progress.</td>' + '</tr>';
			
		}
		
		$("#table_button tbody").html(buttonTable);
		
	}
	
	
	//SESSION DATATABLES
	
	var sDatatablesUrl = url+'/dv/training/sessions/'+sName+'/datatables';
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
		                      { "data": "training_score" },
		                      { "data": "training_time" },
		                      { "data": "validation_score" },  	
		                      { "data": "validation_task" },
		                      { "data": "testing_task" }
	                     ],
	           fnInitComplete: function(oSettings, json) {
	        	   firstRowLineChart(dt);	   
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
    		tLineChartUrl = url+'/dv/training/sessions/'+sName+'/tasks/'+tName+'/line';
    		updateLineChart(tLineChartUrl);
    		taskInfo(tName,tStatus,tTest);    		    		
        }
		
    });
	
	
	$( document ).on( "click", "#session_table", function() {
		
		dt.ajax.reload();

	});
	
	
	//FUNCTION TO RESIZE DIVs
	
	$(window).resize(function(){
	
		hDonut = $('#morris-donut-chart').height() - 50;
	    $('#line_chart_div').css("height", hDonut);
	    $('#line_chart_div').resize();
	    $('#lineOv_chart_div').resize();
		hTable = $('#dataTable_div').height() - 42;
	    $('.table_task_div').css("height", hTable);
	    $('.table_task_div').resize();

	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});
	
});	