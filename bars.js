const yearLabel = document.getElementById("year")
    const urlParams = new URLSearchParams(window.location.search);
    let year = +urlParams.get('year') || 2003;
let data, featData = [];
    let yearData, yearFeatures

    // var margin = {top: (parseInt(d3.select('body').style('height'), 10)/20), right: (parseInt(d3.select('body').style('width'), 10)/20), bottom: (parseInt(d3.select('body').style('height'), 10)/20), left: (parseInt(d3.select('body').style('width'), 10)/5)},
    //         width = parseInt(d3.select('body').style('width'), 10) - margin.left - margin.right,
    //         height = parseInt(d3.select('body').style('height'), 10) - margin.top - margin.bottom;

var margin = {top: 30, right: 50, bottom: 40, left:80};
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
            
    var div = d3.select("body").append("div").attr("class", "toolTip");

    var formatPercent = d3.format("");

    var y = d3.scaleBand()
            .range([height-30, 60])
            .paddingInner(0.2)
            .paddingOuter(0.5)

    var x = d3.scaleLinear()
            .range([0, width]);

   
    var xAxis = d3.axisBottom()
		.scale(x);

	var yAxis = d3.axisLeft()
		.scale(y);

    var svg = d3.select("#bar-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(-1," + (height-30) + ")")
                .call(xAxis);


        svg.append("g")
                .attr("class", "y axis")
        .attr('transform', 'translate(-1,0)')
                .call(yAxis)
    
    var color = d3.scaleOrdinal(["#8dd3c7", "#bebada", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]); // colour scheme

    var countKeys = ["pcount", "ncount"];
    var duration = 500;
    var stack = d3.stack()
			.keys(countKeys)
            .offset(d3.stackOffsetNone);


    var layer = svg.selectAll(".layer")
            .data(countKeys)
            .enter().append("g")
            .attr("class", "layer")
            .attr("data-layer", function(d) { return d; } )

    fetch("year_features.json")
    .then(res => res.json())
    .then((json) => {
        data = json
        yearData = json
        updateBars(year)
    })
    var legend  
    legend = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', 'translate(0,0)');
        
        legend
          .append('g')
          .attr('transform', `translate(-70, 10)`)
          .append('text')
          .style('font-size', '10px')
          .attr('x', 0)
          .attr('y', 9)
          .text("Positive mentions:");
        var nm = legend
          .append('g')
          .attr('transform', `translate(-70, 30)`)
        nm
          .append('text')
          .style('font-size', '10px')
          .attr('x', 0)
          .attr('y', 9)
          .text("Negative mentions:");
        nm.append('rect')
          .style('fill', "#fb8072")
          .attr('x', 90)
          .attr('y', 0)
          .attr('width', 10)
            .attr('height', 10);
        nm.append('text')
        .style('font-size', '10px')
        .attr('x', 104)
        .attr('y', 9)
        .text("of the feature");
        

		svg.append('text')
			.attr('x', -height/2-30)
			.attr('y', -65)
            .attr("transform", "rotate(-90)")
            .style('font-size', '12px')
			// .attr('class', 'label')
			.text('Features');

		svg.append('text')
			.attr('x', width/2)
			.attr('y', height + 10)
			.attr('text-anchor', 'middle')
            .style('font-size', '12px')
			// .attr('class', 'label')
			.text('Number of Mentions');


    function updateBars(new_year) {
        if (new_year === undefined) {
            new_year = ++year
        }
        // yearRef.textContent = new_year
        let dataset = []
        let entries = new_year === "__overall" ? Object.entries(data["__overall"]["features"]) : Object.entries(data[""+new_year])
        for(let e of entries){
            if(["__overall", "phone"].includes(e[0]))
                continue
            else if (dataset.length === 8)
                break
            dataset.push({"feat": e[0], "count": e[1]["count"], "pcount": e[1]["positive_count"], "ncount": e[1]["count"]-e[1]["positive_count"]})
        }
        dataset.sort((a, b) => {
            return d3.ascending(a.count, b.count);
        })
        features = []
        Object.keys(dataset).forEach((k) => {
            features.push(dataset[k].feat)
        })
        yearFeatures = features

        y.domain(dataset.map(function(d) { return d.feat; }));
        x.domain([0, d3.max(dataset, function(d) { return d.count; })]);
       
        var counts = stack(dataset);
        countKeys.forEach(function(key, key_index) {
            var bars = svg.selectAll(".bar-" + key)
            .data(counts[key_index], function(d){ return d.data.feat + "-" + key; });

        bars
        .enter()
        .append('rect')
        .on("click", function(d){
            window.location.href = "feature.html?year="+sliderTime.value()+"&feat="+d.data.feat;
            // console.log(d.data.feature);
            })
        .attr('class', "bar bar-" + key)
		.attr("fill", function(d) {  return key == "ncount" ? "#fb8072" : color(d.data.feat); })
        .attr('width', 0)
        .attr('height', y.bandwidth())
        .attr('y', height-40)
        .attr('x', function(d) {return 1})
        .merge(bars)
        .transition()
        .duration(duration)
        .attr("height", y.bandwidth())
        .attr("y", function(d, i) {
            return y(d.data.feat);
        })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("x", function(d, i) {
            return x(d[0])
        })


    bars
        .exit()
        .transition()
        .duration(duration)
        .attr('width', 0)
        .attr('x', 1)
        .remove();
})

svg.select('.x.axis')
        .transition()
        .duration(duration)
        .call(xAxis);

    svg.select('.y.axis')
        .transition()
        .duration(duration)
        .call(yAxis);
    
        legend.selectAll('g.legend-label')
        .remove();
        const lg = legend.selectAll('g.legend-label')
          .data(features)
        var new_lg = lg
          .enter()
        .append('g')
        .attr('class', 'legend-label')
        .attr('opacity', 0)


        new_lg.append('rect')
          .style('fill', d => color(d))
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 10)
          .attr('height', 10);

          new_lg.append('text')
          .style('font-size', '10px')
          .attr('x', 13)
          .attr('y', 9)
          .text(d => d);
        
        new_lg.transition()
        .duration(duration)
        .attr('opacity', 1)

        
        let offset = 90;
        new_lg.attr('transform', function(d, i) {
            let x = offset;
            offset += 60;
            return `translate(${x-70}, 10)`;
        });

        legend.attr('transform', function() {
          return `translate(0,0)`
        });
    };