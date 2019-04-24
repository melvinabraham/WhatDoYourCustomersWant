var width ;
var height;
var xScale;
var yScale ;
var color;
var xaxis;
var yaxis ;

var svg;

function stackedBar(curr_year) {

margin = {top: 20, right: 20, bottom: 30, left: 50};
//parseDate = d3.timeParse("%m/%Y"),
width = 600 - margin.left - margin.right;
height = 500 - margin.top - margin.bottom;
xScale = d3.scaleLinear().rangeRound([0, width]);
yScale = d3.scaleBand().rangeRound([height, 0]).padding(0.1);
color = d3.scaleOrdinal().range(["#a7cc74", "#f46842"]);

xaxis = d3.axisBottom(xScale);
yaxis =  d3.axisLeft(yScale);

svg = d3.select("#stacked-bar").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		
svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + (height+5) + ")");

svg.append("g")
.attr("class", "y axis")
.attr("transform", "translate(0,0)");

stackedBarUpdate(curr_year);

}

function stackedBarUpdate(curr_year){

	function draw(config) {
		console.log("Inside Draw");
		
		var duration = 1000;
		var stackKey = config.key;
		var data = config.data;
		
		var stack = d3.stack()
			.keys(stackKey)
			/*.order(d3.stackOrder)*/
			.offset(d3.stackOffsetNone);
		
		//console.log(data);
		var layers= stack(data);
			data.sort(function(a, b) { return a.count - b.count; });
			yScale.domain(data.map(function(d) { return d.feature; }));
			xScale.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[1]; }) ]).nice();

		
		d3.selectAll(".layer").remove();
		
		//d3.selectAll(".rect").remove();
		var layer = svg.selectAll(".layer")
			.data(layers)
			.enter().append("g")
			.attr("class", "layer")
			.style("fill", function(d, i) { return color(i); });
		
		//console.log("Here2");
		
		
		
		var bars = layer.selectAll(".rect").data(function(d) {
			console.log("Here3");
			console.log(d)
			return d; });
			
		bars.enter()
			.append("rect")
			.on("click", function(d){
				window.location.href = "bubbleindex.html?year="+curr_year+"&feat="+d.data.feature;
				console.log(d.data.feature);
				console.log(curr_year);})
			.merge(bars)
			.transition()
			.duration(duration)
			.attr("y", function(d) { return yScale(d.data.feature); })
			.attr("x", function(d) { return xScale(d[0]); })
			.attr("height", yScale.bandwidth())
			.attr("width", function(d) { return xScale(d[1]) - xScale(d[0]) });
		
			
		bars.exit()
        .transition()
        .duration(duration)
        .attr('width', 0)
        .attr('y', yScale.bandwidth())
        .remove();
		
		
		
		svg.select('.x.axis')
			.transition()
			.duration(10)
			.call(xaxis);

		svg.select('.y.axis')
			.transition()
			.duration(10)
			.call(yaxis);
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
			item["feature"] = keys[i];
			item["count"] = yD[keys[i]].count;
			item["positive_count"] = yD[keys[i]].positive_count;
			item["negative_count"] = item["count"] - item["positive_count"];
			//console.log(item);
			year_data.push(item);
			if (i == 10){
				break;
			}
		}
		
		return year_data
	
	}

	var key = ["positive_count","negative_count"];
	
	d3.json("data/year_feature_data.json").then(function(data) {
	res_data = GetYearData(data,curr_year);
	draw({	data: res_data,	key: key,	element: 'stacked-bar'	});
	});

	


}
