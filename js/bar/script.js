function radar(y){
	
	var w = 300,
		h = 300;
	var colorscale = d3.scaleOrdinal(d3.schemeCategory10);
	//Legend titles
	var LegendOptions = ['Motorola','Sony Ericsson','Samsung','Lg','Nokia'];

	//Data
	
	var new_feat = {};
	d3.json("data/brand_features_5.json").then(function(data) {
		var d = [];
		console.log(data);
		console.log(y);
		yD = data[y];
		
		cont = yD['__overall'];
		feat = cont['features'];
		const feat_keys = Object.keys(feat);
		for (var i = 0; i < 10; i++) {
		new_feat[feat_keys[i]] = feat[feat_keys[i]]; 
		}
		//console.log(new_feat);
		var list = [];
		var dict;
		for (j = 0; j < 5; j++) {
			list = [];
			console.log(LegendOptions[j]);
			var feature = yD[LegendOptions[j]];
			for(var p in new_feat){
			dict = {};
			if(feature[p]){
			dict['axis'] = p;
			dict['value'] = feature[p].positive_count/feature[p].count;
			}
			else  {
			dict['axis'] = feat_keys[p];
			dict['value'] = 0;
			}
			list.push(dict);
			}
			d.push(list);
		}
	//console.log(d);


	//Options for the Radar chart, other than default
	var mycfg = {
	  w: w,
	  h: h,
	  maxValue: 0.5,
	  levels: 5,
	  ExtraWidthX: 300
	}

	//Call function to draw the Radar chart
	//Will expect that data is in %'s
	
	RadarChart.draw("#chart", d, mycfg);

	////////////////////////////////////////////
	/////////// Initiate legend ////////////////
	////////////////////////////////////////////

	
	
	

	
	
	
	var svg = d3.select('#body')
		.selectAll('svg')
		.append('svg')
		.attr("width", w+300)
		.attr("height", h)

	//Create the title for the legend
	var text = svg.append("text")
		.attr("class", "title")
		.attr('transform', 'translate(90,0)') 
		.attr("x", w - 70)
		.attr("y", 10)
		.attr("font-size", "12px")
		.attr("fill", "#404040")
		.text("Brands");
			
	//Initiate Legend	
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("height", 100)
		.attr("width", 200)
		.attr('transform', 'translate(90,20)') 
		;
		//Create colour squares
		legend.selectAll('rect')
		  .data(LegendOptions)
		  .enter()
		  .append("rect")
		  .attr("x", w - 65)
		  .attr("y", function(d, i){ return i * 20;})
		  .attr("width", 10)
		  .attr("height", 10)
		  .style("fill", function(d, i){ return colorscale(i);})
		  ;
		//Create text next to squares
		legend.selectAll('text')
		  .data(LegendOptions)
		  .enter()
		  .append("text")
		  .attr("x", w - 52)
		  .attr("y", function(d, i){ return i * 20 + 9;})
		  .attr("font-size", "11px")
		  .attr("fill", "#737373")
		  .text(function(d) { return d; })
		  ;
		});  
}