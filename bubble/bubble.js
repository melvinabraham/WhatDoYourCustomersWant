function bubble(value) {

    var t = d3.transition()
        .duration(300);

    var circlexit = d3.selectAll("circle")

    circlexit.style("fill", "#b26745")
        .transition(t)
        .attr("r", 1e-6)
        .on("end", function () {
            console.log(circlexit)
            d3.select(this.parentNode).remove()
        });

    window.setTimeout(function () { buildbubble() }, 350)

    function buildbubble() {

        d3.selectAll(".bubble").remove();
        
        file = "/bubble/" + value + ".json";
        console.log('opening: ' + file)
        d3.json(file).then(function (dataset) {
            console.log(dataset.children[0])
            var diameter = 650;
            var color = d3.scaleOrdinal(d3.schemeCategory20);

            var bubble = d3.pack(dataset)
                .size([diameter, diameter])
                .padding(1.5)


            var svg = d3.select("body")
                .append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");



            var radius = function (r) {
                return r + 30;
            }

            var nodes = d3.hierarchy(dataset)
                .sum(function (d) { return radius(d.Count); });


            var node = svg.selectAll("circle")
                .data(bubble(nodes).descendants())
                .enter()
                .filter(function (d) {
                    return !d.children
                })
                .append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            node.append("title")
                .text(function (d) {
                    return d.Name + ": " + d.Count;
                });



            node.append("circle")
                .attr("r", function (d) {
                    return d.r;
                })
                .style("fill", function (d, i) {
                    cur_color = color(i);
                    return color(i);
                })
                .on("click", function (d) {
                    buildpiechart(d.data.Name);
                })
                .on("mouseover", function (d) {
                    // var rad = d.data.Count + 30;
                    // console.log(rad);
                    // rad = Math.min(rad, 83);
                    d3.select(this)
                        .attr('opacity', 0.5)
                        .attr('r', d.r * 1.2)
                        .style('opacity', 1)
                    // .style("fill", "#000000");
                })
                .on("mouseout", function (d, i) { mouseOff(d, i) }).on("mouseout", function (d, i) {
                    d3.select(this).style("fill", color(i))
                        .attr('r', d => d.r)
                        .attr('opacity', 1);;
                });


            node.append("text")
                .attr("dy", ".2em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.Name.substring(0, d.r / 3);
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function (d) {
                    return d.r / 3;
                })
                .attr("fill", "white");

            node.append("text")
                .attr("dy", "1.3em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.Count;
                })
                .attr("font-family", "Gill Sans", "Gill Sans MT")
                .attr("font-size", function (d) {
                    return d.r / 3;
                })
                .attr("fill", "white");


            d3.select(self.frameElement)
                .style("height", diameter + "px");



        });

    }

}

