var margin = {top: 30, right: 50, bottom: 40, left:80};
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
        // var width = window.innerWidth, height = window.innerHeight;
        var ___svg = d3.select("#bubble-chart").append("svg").attr("width", width).attr("height", height);


function updateBubble(y) {
    var dataset = yearData
    var svg = ___svg


    // console.log(year)
    // console.log(feat)
    // var margin = {top: 30, right: 50, bottom: 40, left:80};
    // var width = 600 - margin.left - margin.right;
    // var height = 600 - margin.top - margin.bottom;
    //     // var width = window.innerWidth, height = window.innerHeight;
    //     var svg = d3.select("#bubble-chart").append("svg").attr("width", width).attr("height", height);

        var pack = d3.pack()
            .size([width, height])
            .padding(1.5);

        // Build a dictionary of sentiments
        // const opinion_sentiments = dataset["__overall"]["opinion_sentiments"]

        // Build a dictionary for opinionwords
    opinions = createOpinionDict(dataset);
    // console.log("opinions", opinions)


    classes = drawchart(dataset, y)
    // console.log(classes)
        redraw(classes, y)

        function redraw(classes, curyear) {

            // transition
            var t = d3.transition()
                .duration(750);

            // hierarchy
            var h = d3.hierarchy({ children: classes })
                .sum(function (d) { return d.size; })
            // console.log(h)

            //JOIN
            var circle = svg.selectAll("circle")
                .data(pack(h).leaves(), function (d) { return d.data.name; });

            var text = svg.selectAll("text")
                .data(pack(h).leaves(), function (d) { return d.data.name; });

            //EXIT
            circle.exit()
            .attr("fill", "none")
                .transition(t)
                .attr("r", 1e-6)
                .remove();

            text.exit()
                .transition(t)
                // .attr("opacity", 1e-6)
                .attr("opacity", 0)
                .remove();

            //UPDATE
            circle
                .transition(t)
                .style("fill", function (d) {
                    circle_name = d.data.name;
                    hslvalue = 0.0;
                    val = opinions[d.data.name];

                    if(curyear in val) {
                        hslvalue = scaleBetween(val[curyear], -0.8, 0.4, 1, 10);
                        // console.log("data " + d.data.name + "Sentiment: "+ opinion_sentiments[circle_name] + "Year:  " + val[curyear] + "HSL: " +  hslvalue); 
                    }

                    if (opinion_sentiments[circle_name] > 0.0) {
                        return ColorLuminance("#00FF7F", -hslvalue);;
                    }
                    else if (opinion_sentiments[circle_name] < 0) {
                        return ColorLuminance("#fb8072", -hslvalue)
                    }
                    else {
                        return "#33C3FF";
                    }
                })
                .attr("r", function (d) { return d.r })
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })

            text
                .transition(t)
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; })
                .style("font-size", function (d) {
                    v2 = d.r / 3;
                    return Math.max(11, v2) + "px";
                })

            //ENTER
            circle.enter().append("circle")
                .attr("r", 1e-6)
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                // .style("fill", "#fff")
                .style("fill", "none")
                .transition(t)
                .style("fill", function (d) {
                    circle_name = d.data.name;
                    hslvalue = 0.0;
                    val = opinions[d.data.name];
                    if(curyear in val) {
                        hslvalue = scaleBetween(val[curyear], -0.6, 0.4, 1, 10);
                    }

                    if (opinion_sentiments[circle_name] > 0) {
                        return ColorLuminance("#00FF7F", -hslvalue);;
                    }
                    else if (opinion_sentiments[circle_name] < 0) {
                        return ColorLuminance("#fb8072", -hslvalue)
                    }
                    else {
                        return "#33C3FF";
                    }
                })
                .attr("r", function (d) { return d.r });

            text.enter().append("text")
                .attr("opacity", 1e-6)
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; })
                .style("font-size", function (d) {
                    v2 = d.r / 3;
                    return Math.max(11, v2) + "px";
                })
                .style("text-anchor", "middle")
                .text(function (d) { return d.data.name; })
                .transition(t)
                .attr("opacity", 1);
        }


        function drawchart(dataset, year) {
            var data = []
            // console.log(year, feat, dataset[year][feat])
            var d = year === "__overall" ? dataset["__overall"]["features"][feat]["opinions"] : dataset[year][feat]["opinions"]
            // var d = dataset[year][feat]["opinions"];

            for (var ele in d) {
                data.push({ "name": ele, "size": d[ele] });
            }
            data.sort((a, b) => {
                return d3.descending(a.size, b.size);
            })
            dataset = data.slice(0, 20)
            return dataset
        }
}


function ColorLuminance(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}



function createOpinionDict(dataset) {


    // var count = 0;
    var opinionwords = {}
    var yearwiseopinions


    for (var year = 2003; year <= 2014; ++year) {
        // console.log(year, feat, dataset[year][feat])
        if (!dataset[year][feat])
            continue
        yearwiseopinions = dataset[year][feat]["opinions"];

        for (word in yearwiseopinions) {

            if (!(word in opinionwords)) {
                opinionwords[word] = {};
                opinionwords[word][year] = 1;
                opinionwords[word]["max"] = 1;
            }

            else {
                opinionwords[word][year] = opinionwords[word]["max"] + 1;
                opinionwords[word]["max"] = opinionwords[word][year];
            }
        }
    }

    yearwiseopinions = dataset["__overall"]["features"][feat]["opinions"];

    for (word in yearwiseopinions) {

        if (!(word in opinionwords)) {
            opinionwords[word] = {};
            opinionwords[word][year] = 1;
            opinionwords[word]["max"] = 1;
        }

        else {
            opinionwords[word][year] = opinionwords[word]["max"] + 1;
            opinionwords[word]["max"] = opinionwords[word][year];
        }
    }

    return opinionwords;

}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}