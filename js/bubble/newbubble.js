
const urlParams = new URLSearchParams(window.location.search);
const year = urlParams.get('year');
const feat = urlParams.get('feat');

function bubble() {


    console.log(year)
    console.log(feat)
    file = "data\\year_features_5.json";
    d3.json(file).then(function (dataset) {

        slide();
        var width = window.innerWidth, height = window.innerHeight;
        var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

        var pack = d3.pack()
            .size([width, height])
            .padding(1.5);

        // Build a dictionary of sentiments
        const sentimentdata = dataset["__overall"]["opinion_sentiments"]

        // Build a dictionary for opinionwords
        opinions = createOpinionDict(dataset);


        classes = drawchart(dataset, 2004)
        redraw(classes, year)

        function redraw(classes, curyear) {

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
            .attr("fill", "white")
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
                .style("fill", function (d) {
                    circle_name = d.data.name;
                    hslvalue = 0.0;
                    val = opinions[d.data.name];

                    if(curyear in val) {
                        hslvalue = scaleBetween(val[curyear], -0.8, 0.8, 1, 10);
                        // console.log("data " + d.data.name + "Sentiment: "+ sentimentdata[circle_name] + "Year:  " + val[curyear] + "HSL: " +  hslvalue); 
                    }

                    if (sentimentdata[circle_name] > 0.0) {
                        return ColorLuminance("#00FF7F", -hslvalue);;
                    }
                    else if (sentimentdata[circle_name] < 0) {
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
                .attr("y", function (d) { return d.y; });

            //ENTER
            circle.enter().append("circle")
                .attr("r", 1e-6)
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; })
                .style("fill", "#fff")
                .transition(t)
                .style("fill", function (d) {
                    circle_name = d.data.name;
                    hslvalue = 0.0;
                    val = opinions[d.data.name];

                    if(curyear in val) {
                        hslvalue = scaleBetween(val[curyear], -0.6, 0.6, 1, 10);
                    }

                    if (sentimentdata[circle_name] > 0) {
                        return ColorLuminance("#00FF7F", -hslvalue);;
                    }
                    else if (sentimentdata[circle_name] < 0) {
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
                    v1 = d.r;
                    v2 = d.r / 3;
                    return Math.min(v1, v2) + "px";
                })
                .style("text-anchor", "middle")
                .text(function (d) { return d.data.name; })
                .transition(t)
                .attr("opacity", 1);
        }


        function drawchart(dataset, year) {
            data = []
            d = dataset[year][feat]["opinions"];
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

                return new Date(2003 + d, 10, 3);
            });

            var value = parseInt(year);

            var sliderTime = d3
                .sliderBottom()
                .min(d3.min(dataTime))
                .max(d3.max(dataTime))
                .step(1000 * 60 * 60 * 24 * 365)
                .width(300)
                .tickFormat(d3.timeFormat('%Y'))
                .tickValues(dataTime)
                .default(new Date(value, 10, 3))
                .on('onchange', val => {
                    cur = d3.timeFormat('%Y')(val)
                    d3.select('p#value-time').text(feat.charAt(0).toUpperCase() + feat.slice(1) + " in " + value);
                    if (cur != value) {
                        value = cur
                        classes = drawchart(dataset, cur);
                        redraw(classes, value)
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

            d3.select('p#value-time').text(feat.charAt(0).toUpperCase() + feat.slice(1) + " in " + d3.timeFormat('%Y')(sliderTime.value()));

        }

    });


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


    count = 0;
    opinionwords = {}


    for (var year = 2004; year <= 2014; ++year) {

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

    return opinionwords;

}

function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
}