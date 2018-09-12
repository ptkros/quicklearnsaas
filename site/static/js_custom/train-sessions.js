$(document).ready(function() {

	var url = window.location.origin;
	
	
	//SESSIONS PIE CHART
	
	var pie;
	var sPieChartUrl = url+'/dv/training/sessions/pie';
	var sPieChartData;
	
	
	$.getJSON(sPieChartUrl, function(pieChart) {
				
		sPieChartData = [{
	        label: pieChart.sessions_data[0].label,
	        data: pieChart.sessions_data[0].data,
	        color: "#109618"
	    }, {
	        label: pieChart.sessions_data[1].label,
	        data: pieChart.sessions_data[1].data,
	        color: "#FF9900" 
	    }];
				
		pie = $.plot($("#sessions-pie-chart"), sPieChartData, {
		        series: {
		            pie: {
		                show: true
		            },
		        },
		        grid: {
		            hoverable: true
		        },
		        tooltip: true,
		        tooltipOpts: {
		            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
		            shifts: {
		                x: 20,
		                y: 0
		            },
		            defaultTheme: false
		        }
		    });
		
    });
	
	
	$( document ).on( "click", "#sessions_pie", function() {
		
		$.getJSON(sPieChartUrl, function(pieChart) {
			
			sPieChartData = [{
		        label: pieChart.sessions_data[0].label,
		        data: pieChart.sessions_data[0].data
		    }, {
		        label: pieChart.sessions_data[1].label,
		        data: pieChart.sessions_data[1].data
		    }];
			
			pie.setData(sPieChartData);
			pie.draw();	
			
		});

	});
	
	
	//SESSION BAR CHART
	
	var bar;
	var d1_1;
	var d1_2;
	var sBarsChartUrl = url+'/dv/training/sessions/bars';
	
	$.getJSON(sBarsChartUrl, function(barsChart) {
		
		d1_1 = [
		            [barsChart.sessions_completed[0].date, barsChart.sessions_completed[0].sessions],
		            [barsChart.sessions_completed[1].date, barsChart.sessions_completed[1].sessions],
		            [barsChart.sessions_completed[2].date, barsChart.sessions_completed[2].sessions],
		            [barsChart.sessions_completed[3].date, barsChart.sessions_completed[3].sessions],
		            [barsChart.sessions_completed[4].date, barsChart.sessions_completed[4].sessions],
		            [barsChart.sessions_completed[5].date, barsChart.sessions_completed[5].sessions],
		            [barsChart.sessions_completed[6].date, barsChart.sessions_completed[6].sessions]
		        ];
		     
		d1_2 = [
		            [barsChart.sessions_inprogress[0].date, barsChart.sessions_inprogress[0].sessions],
		            [barsChart.sessions_inprogress[1].date, barsChart.sessions_inprogress[1].sessions],
		            [barsChart.sessions_inprogress[2].date, barsChart.sessions_inprogress[2].sessions],
		            [barsChart.sessions_inprogress[3].date, barsChart.sessions_inprogress[3].sessions],
		            [barsChart.sessions_inprogress[4].date, barsChart.sessions_inprogress[4].sessions],
		            [barsChart.sessions_inprogress[5].date, barsChart.sessions_inprogress[5].sessions],
		            [barsChart.sessions_inprogress[6].date, barsChart.sessions_inprogress[6].sessions]
		        ];
		
		var barData = [
			             {
			                 label: "completed",
			                 data: d1_1,
			                 bars: {
			                     show: true,
			                     barWidth: 24*60*60*300,
			                     fill: true,
			                     lineWidth: 0.2,
			                     order: 1,
			                     fillColor: "#109618"
			                 },
			                 color: "#109618"
			             },
			             {
			                 label: "in progress",
			                 data: d1_2,
			                 bars: {
			                     show: true,
			                     barWidth: 24*60*60*300,
			                     fill: true,
			                     lineWidth: 0.2,
			                     order: 2,
			                     fillColor: "#FF9900"
			                 },
			                 color: "#FF9900"
			             }
			            
		             ];
		
		var y = new Date();
		var m = new Date();
		var d = new Date();
		
		bar = $.plot("#sessions-bar-chart",barData, {
				xaxis: {
					min: (new Date(y.getFullYear(), m.getMonth(), d.getDate()-7)).getTime(), 
					max: (new Date(y.getFullYear(), m.getMonth(), d.getDate()+1)).getTime(),
		            mode: "time",
		            timezone: "browser",
		            timeformat: "%d/%m/%y",
		            tickSize: [1, "day"],
		            dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		            tickLength: 0 // hide gridlines
		        },
		        yaxis: {
		        	tickDecimals: 0
		        },
		        grid: {
		            hoverable: true,
		            clickable: false,
		            borderWidth: 1
		        },
		        legend: {
		            labelBoxBorderColor: "none"
		        },
		        series: {
		            shadowSize: 0
		        },
		        tooltip: true,
		        tooltipOpts: {
		            content: "Date: %x, Sessions: %y"
		        }
			});
	
	});	

	
	$( document ).on( "click", "#sessions_bar", function() {
		
		$.getJSON(sBarsChartUrl, function(barsChart) {
				
			d1_1 = [
			            [barsChart.sessions_completed[0].date, barsChart.sessions_completed[0].sessions],
			            [barsChart.sessions_completed[1].date, barsChart.sessions_completed[1].sessions],
			            [barsChart.sessions_completed[2].date, barsChart.sessions_completed[2].sessions],
			            [barsChart.sessions_completed[3].date, barsChart.sessions_completed[3].sessions],
			            [barsChart.sessions_completed[4].date, barsChart.sessions_completed[4].sessions],
			            [barsChart.sessions_completed[5].date, barsChart.sessions_completed[5].sessions],
			            [barsChart.sessions_completed[6].date, barsChart.sessions_completed[6].sessions]
			        ];
			     
			d1_2 = [
			            [barsChart.sessions_inprogress[0].date, barsChart.sessions_inprogress[0].sessions],
			            [barsChart.sessions_inprogress[1].date, barsChart.sessions_inprogress[1].sessions],
			            [barsChart.sessions_inprogress[2].date, barsChart.sessions_inprogress[2].sessions],
			            [barsChart.sessions_inprogress[3].date, barsChart.sessions_inprogress[3].sessions],
			            [barsChart.sessions_inprogress[4].date, barsChart.sessions_inprogress[4].sessions],
			            [barsChart.sessions_inprogress[5].date, barsChart.sessions_inprogress[5].sessions],
			            [barsChart.sessions_inprogress[6].date, barsChart.sessions_inprogress[6].sessions]
			        ];
					
			var barData = [
				             {
				                 label: "completed",
				                 data: d1_1,
				                 bars: {
				                     show: true,
				                     barWidth: 24*60*60*300,
				                     fill: true,
				                     lineWidth: 0.2,
				                     order: 1,
				                     fillColor: "#109618"
				                 },
				                 color: "#109618"
				             },
				             {
				                 label: "in progress",
				                 data: d1_2,
				                 bars: {
				                     show: true,
				                     barWidth: 24*60*60*300,
				                     fill: true,
				                     lineWidth: 0.2,
				                     order: 2,
				                     fillColor: "#FF9900"
				                 },
				                 color: "#FF9900"
				             }
				            
			             ];
			
			bar.setData(barData);
			bar.draw();	
			
		});

	});
	
	
	//SESSIONS DATATABLES
	
	var sDatatablesUrl = url+'/dv/training/sessions/datatables';  
	var dt = $('#dataTables-sessions').DataTable({
		scrollX: true,
        processing: true,
        serverSide: true,
        order: [[ 1, "desc" ]],
        ajax: sDatatablesUrl,
        columns: [
                    { "data": "name" },
                    { "data": "start_time" },
                    { "data": "end_time" },
                    { "data": "status" }
                 ]
    });
	
	
	$('#dataTables-sessions tbody').on( 'click', 'tr', function () {
		
		var tr = $(this).closest('tr');
		
		if ( tr.hasClass('info') ) {
            tr.removeClass('info');
        }
        else {
            dt.$('tr.info').removeClass('info');
            tr.addClass('info');
    		var row = dt.row(tr);
    		var d = row.data();
    		var sName = d.name;
    		var urlSession = url+'/static/pages/train-session-details.html?session_name='+sName;
    		window.open(urlSession,"_self");
        }
		
    });
	
	
	$( document ).on( "click", "#sessions_table", function() {
		
		dt.ajax.reload();

	});
	
	
	//FUNCTION TO CATCH AJAX ERROR
	
	$( document ).ajaxError(function( event, request, settings ) {
		  alert( "Error requesting page " + settings.url );
		  return;
	});
	
});
