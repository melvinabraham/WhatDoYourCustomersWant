
file = "/data/unfiltered/year_features_5" + ".json";
d3.json(file).then(function (dataset) {

    console.log("here")
    slide();
    var width = window.innerWidth, height = window.innerHeight;
    var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

    var pack = d3.pack()
        .size([width, height])
        .padding(1.5);

    console.log("redrawing chart with data: ");
    classes = drawchart(dataset, 2004)
    console.log(classes)
    redraw(classes)

    function redraw(classes) {

        // transition
        var t = d3.transition()
            .duration(750);

        // hierarchy
        var h = d3.hierarchy({ children: classes })
            .sum(function (d) { return d.size; })

        //JOIN
        var circle = svg.selectAll("circle")
            .data(pack(h).leaves(), function (d) { return d.data.name; });

        var text = svg.selectAll("text")
            .data(pack(h).leaves(), function (d) { return d.data.name; });

        //EXIT
        circle.exit()
            .style("fill", "#b26745")
            .transition(t)
            .attr("r", 1e-6)
            .remove();

        text.exit()
            .transition(t)
            .attr("opacity", 1e-6)
            .remove();

        //UPDATE
        circle
            .transition(t)
            .style("fill", "#add8e6")
            .attr("r", function (d) { return d.r })
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })

        text
            .transition(t)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; });

        //ENTER
        circle.enter().append("circle")
            .attr("r", 1e-6)
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; })
            .style("fill", "#fff")
            .transition(t)
            .style("fill", "#45b29d")
            .attr("r", function (d) { return d.r });

        text.enter().append("text")
            .attr("opacity", 1e-6)
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            // .attr("font-size", function (d) { return d.r; })
            .style("text-anchor", "middle")
            .text(function (d) { return d.data.name; })
            .transition(t)
            .attr("opacity", 1);
    }


    function drawchart(dataset, year) {
        data = []
        console.log("Drawchart, year: " + year)
        d = dataset[year]["__overall"]["opinions"]
        for (var ele in d) {
            data.push({ "name": ele, "size": d[ele] });
        }
        dataset = data
        return dataset
    }


    function slide() {

        var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];
        // Time
        var dataTime = d3.range(0, 10).map(function (d) {

            return new Date(2004 + d, 10, 3);
        });

        var value = 2004
        // bubble(value);

        var sliderTime = d3
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(1998, 10, 3))
            .on('onchange', val => {
                cur = d3.timeFormat('%Y')(val)
                d3.select('p#value-time').text(value);
                if (cur != value) {
                    value = cur
                    console.log("Slide: " + cur)
                    classes = drawchart(dataset, cur);
                    redraw(classes)
                    // bubble(cur);
                }

            });

        var gTime = d3
            .select('div#slider-time')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));

    }

});


