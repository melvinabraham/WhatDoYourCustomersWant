dataset = {
    "children":
        [
            { "Count": 268, "Name": "USA" },
            { "Count": 4, "Name": "LUX" },
            { "Count": 6, "Name": "ISR" },
            { "Count": 13, "Name": "NED" },
            { "Count": 38, "Name": "SWE" },
            { "Count": 10, "Name": "TPE" },
            { "Count": 402, "Name": "SUI" },
            { "Count": 3, "Name": "PER" },
            { "Count": 192, "Name": "GBR" },
            { "Count": 26, "Name": "CAN" },
            { "Count": 1, "Name": "KOR" },
            { "Count": 105, "Name": "CRO" },
            { "Count": 118, "Name": "GER" },
            { "Count": 75, "Name": "CYP" },
            { "Count": 22, "Name": "BEL" },
            { "Count": 9, "Name": "BIH" },
            { "Count": 5, "Name": "POR" },
            { "Count": 2, "Name": "ECU" },
            { "Count": 9, "Name": "UZB" },
            { "Count": 12, "Name": "COL" },
            { "Count": 11, "Name": "POL" },
            { "Count": 17, "Name": "BUL" },
            { "Count": 13, "Name": "ROU" },
            { "Count": 267, "Name": "SRB" },
            { "Count": 366, "Name": "FRA" },
            { "Count": 42, "Name": "SVK" },
            { "Count": 6, "Name": "LTU" },
            { "Count": 521, "Name": "ESP" },
            { "Count": 70, "Name": "CHI" },
            { "Count": 26, "Name": "UKR" },
            { "Count": 1, "Name": "IND" },
            { "Count": 127, "Name": "AUS" },
            { "Count": 7, "Name": "SLO" },
            { "Count": 1, "Name": "IRL" },
            { "Count": 29, "Name": "AUT" },
            { "Count": 14, "Name": "KAZ" },
            { "Count": 4, "Name": "BLR" },
            { "Count": 26, "Name": "FIN" },
            { "Count": 11, "Name": "THA" },
            { "Count": 15, "Name": "MAR" },
            { "Count": 36, "Name": "JPN" },
            { "Count": 1, "Name": "TUR" },
            { "Count": 21, "Name": "RSA" },
            { "Count": 27, "Name": "ITA" },
            { "Count": 3, "Name": "MON" },
            { "Count": 168, "Name": "ARG" },
            { "Count": 2, "Name": "LAT" },
            { "Count": 224, "Name": "RUS" },
            { "Count": 2, "Name": "ARM" },
            { "Count": 9, "Name": "BRA" },
            { "Count": 115, "Name": "CZE" }
        ]
};

var diameter = 650;
var color = d3.scaleOrdinal(d3.schemeCategory20);


var bubble = d3.pack(dataset)
    .size([diameter, diameter])
    .padding(1.5)

// d3.select("body")
//     .append("h2")
//     .text("Points assigned per country")
//     .attr("align", "center");

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

var node = svg.selectAll(".node")
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