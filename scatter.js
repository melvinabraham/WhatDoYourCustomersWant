// const urlParams = new URLSearchParams(window.location.search);
// 	let year = urlParams.get('year');
// 	let feat = urlParams.get('feat');
	// let data;
	// const yearLabel = document.getElementById("year")

    // fetch("year_features.json")
    // .then(res => res.json())
    // .then((json) => {
    //     data = json;
    //     update(year)
    // })
    
	var _margin = {top: 30, right: 50, bottom: 40, left:70};
	var _width = 430 - _margin.left - _margin.right;
    var _height = 300 - _margin.top - _margin.bottom;

    var __colors = ["rgb(255, 191, 170)", "rgb(51, 195, 255)","rgb(0, 255, 189)"]

	var __svg = d3.select('#scatter-chart')
		.append('svg')
		.attr('width', _width + _margin.left + _margin.right)
		// .attr('height', _height + _margin.top + _margin.bottom)
		.attr('height', 350)
        .attr('transform', "translate(0,0)")
    
    var _svg = __svg.append('g')
		.attr('transform', 'translate(' + _margin.left + ',' + (_margin.top+50) + ')');


	// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
    var yScale = d3.scalePoint()
        .domain(["Negative", "Neutral", "Positive"])
		.range([_height, 0])
        .padding(0.35);

	var xScale = d3.scalePoint()
        // .domain(["1","2","3","4","5"])
        .domain([1,2,3,4,5])
        .padding(0.5)
		.range([0, _width])

	// square root scale.
	var radius = d3.scaleLinear()
		// .exponent(2)
		.range([0, 20]).clamp(true);

	// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
	var xAxis = d3.axisBottom()
		.scale(xScale);

	var yAxis = d3.axisLeft()
		.scale(yScale);

	// adding axes is also simpler now, just translate x-axis to (0,_height) and it's alread defined to be a bottom axis. 
	_svg.append('g')
			.attr('transform', 'translate(0,' + _height + ')')
			.attr('class', 'x axis')
			.call(xAxis);

		// y-axis is translated to (0,0)
		_svg.append('g')
			.attr('transform', 'translate(0,0)')
			.attr('class', 'y axis')
            .call(yAxis);

        _svg.append('text')
			.attr('x', -_height/2-45)
			.attr('y', -60)
            .attr("transform", "rotate(-90)")
            .style('font-size', '12px')
			// .attr('class', 'label')
			.text('Feature Sentiment');

		_svg.append('text')
			.attr('x', _width/2)
			.attr('y', _height + 35)
			.attr('text-anchor', 'middle')
            .style('font-size', '12px')
			// .attr('class', 'label')
            .text('Review Rating');
        
        

	

function updateScatter(new_year) {
        // var svg = _svg, width = _width, height = _height
		if (new_year === undefined) {
            new_year = ++year
        }
        // yearLabel.textContent = new_year
		let ratingData = []
        // console.log(data)
        var __ratings = new_year === "__overall" ? yearData["__overall"]["features"][feat]["ratings"] : yearData[new_year][feat]["ratings"]
        Object.entries(__ratings).forEach(entry => {
            ratingData.push(Object.assign({"rating": +entry[0]}, entry[1]))
        });
        // console.log(ratingData)
		// xScale.domain(["Positive", "Neutral", "Negative"]);

        // yScale.domain([1,5]);
        var min = d3.min(ratingData, function(d) { return Math.min(d.positive_count, d.negative_count, d.neutral_count); })
        var max = d3.max(ratingData, function(d) { return Math.max(d.positive_count, d.negative_count, d.neutral_count); })
        
		// radius.domain(d3.extent(ratingData, function(d){
        //     return d.positive_count;
        // }));
        radius.domain([min, max]);
        
        // let maxCount = radius.domain()[1];
        // console.log(ratingData)

        // var positiveColor = d3.scaleSequential(d3.interpolateGreens).domain([-10, maxCount]);
        // // var positiveColor = d3.scaleOrdinal(d3.schemeGreens[9].slice(3))
        // // var positiveColor = d3.scalePoint(d3.schemeGreens[9].slice(3))
        // var neutralColor = d3.scaleSequential(d3.interpolateBlues).domain([-10, maxCount]);
        // // var neutralColor = d3.scaleOrdinal(d3.schemeBlues[9].slice(3))
        // var negativeColor = d3.scaleSequential(d3.interpolateReds).domain([-10, maxCount]);
        // var negativeColor = d3.scaleOrdinal(d3.schemeReds[9].slice(3))

		
        _svg.selectAll('.bubble').remove();
        _svg.selectAll('.bubble').remove();
		var bubbles = _svg.selectAll('.bubble')
			.data(ratingData)
            .enter()
        var positiveBubble = bubbles
            .append('circle')
			.attr('class', 'bubble')
			.attr('cy', function(d){return yScale("Positive");})
			.attr('cx', function(d){ return xScale(d.rating); })
			.attr('r', function(d){ return radius(d.positive_count); })
            // .style('fill', function(d){ return positiveColor(d.positive_count); })
			// .style('fill', "#b3de69")
			.style('fill', __colors[2])
        var neutralBubble = bubbles
            .append('circle')
			.attr('class', 'bubble')
			.attr('cy', function(d){return yScale("Neutral");})
			.attr('cx', function(d){ return xScale(d.rating); })
			.attr('r', function(d){ return radius(d.neutral_count); })
            // .style('fill', function(d){ return neutralColor(d.neutral_count); })
			// .style('fill', "#80b1d3")
			.style('fill', __colors[1])
        var negativeBubble = bubbles
            .append('circle')
			.attr('class', 'bubble')
			.attr('cy', function(d){return yScale("Negative");})
			.attr('cx', function(d){ return xScale(d.rating); })
			.attr('r', function(d){ return radius(d.negative_count); })
			// .style('fill', function(d){ return negativeColor(d.negative_count); })
			// .style('fill', "#fb8072")
			.style('fill', __colors[0])

		// bubble.append('title')
		// 	.attr('x', function(d){ return radius(d.PetalLength); })
		// 	.text(function(d){
		// 		return d.Species;
		// 	});

		// adding label. For x-axis, it's at (10, 10), and for y-axis at (_width, _height-10).
		// _svg.append('text')
		// 	.attr('x', 10)
		// 	.attr('y', 10)
		// 	.attr('class', 'label')
		// 	.text('Ratings');

		// _svg.append('text')
		// 	.attr('x', _width)
		// 	.attr('y', _height - 10)
		// 	.attr('text-anchor', 'end')
		// 	.attr('class', 'label')
		// 	.text('Ratings');
	}