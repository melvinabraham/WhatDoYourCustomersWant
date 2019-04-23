function stackedBar(curr_year){
//d3.selectAll("#stacked-bar").remove();
	
	function draw(config) {

		me = this,
		stackKey = config.key,
		data = config.data,
		
		/*margin = {top: 20, right: 80, bottom: 30, left: 50},
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
		*/
		
		color = d3.scaleOrdinal().range(["#a7cc74", "#f46842"]);
		
		svg = d3.select("#stacked-bar").select("svg");
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

			
			
			svg.select('.axis axis--x')
			.transition()
			.duration(duration)
			.call(xAxis);

			svg.select('.axis axis--y')
			.transition()
			.duration(duration)
			.call(yAxis);
		
			/*svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + (height+5) + ")")
			.call(xAxis);

			svg.append("g")
			.attr("class", "axis axis--y")
			.attr("transform", "translate(0,0)")
			.call(yAxis);
			*/			
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
	
	draw({	data: res_data,	key: key,	element: 'stacked-bar'	});
	return data
	});

var key = ["positive_count","negative_count"];

}