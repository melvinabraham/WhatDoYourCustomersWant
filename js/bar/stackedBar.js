function stackedBar(curr_year){
//d3.selectAll("#stacked-bar").remove();
var initStackedBarChart = {
	
	draw: function(config) {
	
//		d3.selectAll(".layer").remove();
	//	d3.selectAll(".axis--x").remove();
		//d3.selectAll(".axis--y").remove();

		me = this,
		//domEle = config.element,
		stackKey = config.key,
		data = config.data,
		
		margin = {top: 20, right: 80, bottom: 30, left: 50},
		//parseDate = d3.timeParse("%m/%Y"),
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom,
		xScale = d3.scaleLinear().rangeRound([0, width]),
		yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1),
		color = d3.scaleOrdinal().range(["#a7cc74", "#f46842"]),
		xAxis = d3.axisBottom(xScale),
		yAxis =  d3.axisLeft(yScale),	//.tickFormat(,
		
		svg = d3.select("#stacked-bar").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.attr('class','bar');

		var stack = d3.stack()
			.keys(stackKey)
			/*.order(d3.stackOrder)*/
			.offset(d3.stackOffsetNone);
		
		console.log(data)
		var layers= stack(data);
			data.sort(function(a, b) { return a.count - b.count; });
			yScale.domain(data.map(function(d) { return d.feature; }));
			xScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[0]+d[1]; }) ]).nice();

		var layer = svg.selectAll(".layer")
			.data(layers)
			.enter().append("g")
			.attr("class", "layer")
			.style("fill", function(d, i) { return color(i); });
		
		
		var duration = 1000
		 layer.selectAll("rect")
			  .data(function(d) {
				console.log(d)
			  return d; })
			.enter().append("rect")
			.transition()
			.duration(duration)
			.attr("y", function(d) { return yScale(d.data.feature); })
			.attr("x", function(d) { return xScale(d[0]); })
			.attr("height", yScale.bandwidth())
			.attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });

			
			svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + (height+5) + ")")
			.call(xAxis);

			svg.append("g")
			.attr("class", "axis axis--y")
			.attr("transform", "translate(0,0)")
			.call(yAxis);							
	}
}



// load the data for given year
function GetYearData(featureData,year){
	console.log("GetYearData Function");
	console.log(year);
	year_data = [];
	yD = featureData[year];
	console.log(yD);
	const keys = Object.keys(yD)
	
	for (i = 1; i < keys.length; i++) {
		//console.log("Inside Loop");
		item = {}
		console.log(yD[keys[i]]);
		item["feature"] = keys[i];
		item["count"] = yD[keys[i]].count;
		item["positive_count"] = yD[keys[i]].positive_count;
		item["negative_count"] = item["count"] - item["positive_count"];
		console.log(item);
		year_data.push(item);
		if (i == 10){
			break;
		}
	}
	
	return year_data
	
}

var feature_data = d3.json("data/year_feature_data.json").then(function(data) {
	
	res_data = GetYearData(data,curr_year);
	
	initStackedBarChart.draw({
	data: res_data,
	key: key,
	element: 'stacked-bar'
	});
	return data
	});

var key = ["positive_count","negative_count"];


//console.log(feature_data)


/*var data = [{"year":2000,"feature":"Screen","count":100,"positive_count":40,"negative_count":60},
			{"year":2000,"feature":"Camera","count":200,"positive_count":120,"negative_count":80},
			{"year":2001,"feature":"feature3","count":150,"positive_count":100,"negative_count":50},
			{"year":2001,"feature":"App","count":50,"positive_count":10,"negative_count":40},
			{"year":2002,"feature":"feature4","count":1000,"positive_count":800,"negative_count":200},
			{"year":2003,"feature":"Battery","count":120,"positive_count":100,"negative_count":20}];

//var key = ["Screen", "Camera", "App","Battery"];
var key = ["positive_count","negative_count"];

initStackedBarChart.draw({
	data: data,
	key: key,
	element: 'stacked-bar'
});
*/

}