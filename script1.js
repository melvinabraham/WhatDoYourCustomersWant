// var dataTime = d3.range(0, 12).map(function(d) {
//   return new Date(2003 + d, 10, 3);
// });
var ____year = 2003
// updateBars(____year)
let intervalID 
var brandData = null;



const yearwiseIcon = yearwiseRef.querySelector(".fas")

const toggleSelection = () => {
    overallRef.classList.toggle("is-link")
    yearwiseRef.classList.toggle("is-link")
}

overallRef.onclick = () => {
    ____year = "Overall";
    // yearRef.textContent = "Overall"
    toggleSelection()
    stopSlider()
    updateBars("__overall")
    updateRadar("__overall")
} 
yearwiseRef.onclick = () => {
    overallRef.classList.remove("is-link")
    yearwiseRef.classList.add("is-link")
    if (intervalID)
        stopSlider()
    else
        playSlider()
}

sliderTime = d3
  .sliderBottom()
  .min(2003)
  .max(2014)
  .step(1)
  .width(500)
  .tickFormat((d) => d)
  .on('onchange', cur => {
    //   console.log(cur);
    if (cur != ____year) {
        overallRef.classList.remove("is-link")
        yearwiseRef.classList.add("is-link")
        ____year = cur;
        // yearRef.textContent = "year "+cur
        updateBars(cur)
        updateRadar(cur)
    }
  });


const stopSlider = () => {
    yearwiseIcon.classList.remove("fa-pause")
    yearwiseIcon.classList.add("fa-play")
    clearInterval(intervalID);
    intervalID = null;
}
const playSlider = () => {
    if (intervalID) return
    yearwiseIcon.classList.remove("fa-play")
    yearwiseIcon.classList.add("fa-pause")
    if (sliderTime.value() < 2014)
        sliderTime.value(sliderTime.value()+1)
    intervalID = window.setInterval(() => {
        if (sliderTime.value() < 2014)
            sliderTime.value(sliderTime.value()+1)
        else
            stopSlider()
    }, 1500);
}

var gTime = d3
  .select('div#slider-time')
  .append('svg')
  .attr('width', 540)
  .attr('height', 50)
  .append('g')
  .attr('transform', 'translate(20,8)');

gTime.call(sliderTime);


function updateRadar(new_year) {
    var yD = brandData[new_year]
    if (new_year === "__overall") {
        yD = brandData[new_year]["brands"]
    }
    var w = 300,
		h = 300;
	var colorscale = d3.scaleOrdinal(d3.schemeCategory10);
	//Legend titles
	var LegendOptions = []//['Motorola', 'Sony Ericsson', 'Samsung', 'Lg', 'Nokia'];

	//Data

    var new_feat = {};
    var d = [];
		// console.log(data);
		// console.log(y);
        // yD = data[y];
    // console.log("yd", yD)
    var dataset = []
        let entries = new_year === "__overall" ? Object.entries(data["__overall"]["features"]) : Object.entries(data[""+new_year])
        for(let e of entries){
            if(["__overall", "phone"].includes(e[0]))
                continue
            else if (dataset.length === 8)
                break
            dataset.push({"feat": e[0], "count": e[1]["count"], "pcount": e[1]["positive_count"], "ncount": e[1]["count"]-e[1]["positive_count"]})
        }
        dataset.sort((a, b) => {
            return d3.descending(a.count, b.count);
        })
        features = []
        Object.keys(dataset).forEach((k) => {
            features.push(dataset[k].feat)
        })
        // yearFeatures = features

		// var cont = yD['__overall'];
		// var feat = cont['features'];
		const feat_keys = features//Object.keys(feat);
		// for (var i = 1; i < 9; i++) {
		// 	new_feat[feat_keys[i]] = feat[feat_keys[i]];
        // }

    var brands = Object.keys(yD);
    // console.log("brands", brands);
    brands.splice(brands.indexOf("__overall"), 1)
    if (brands.indexOf("UNKNOWN") >= 0)
        brands.splice(brands.indexOf("UNKNOWN"), 1)
    brands.sort((a, b) => {
        // console.log("brands.sort", yD[a], yD[b])
        return d3.descending(yD[a]["__overall"].count, yD[b]["__overall"].count);
    })

    
    
    
		// console.log("new_feat", new_feat);
		var list = [];
		var dict;
		for (j = 0; j < 5; j++) {
			list = [];
            var bf = yD[brands[j]];
            if (bf === undefined)
                continue
            LegendOptions.push(brands[j])
			for (var f of feat_keys) {
				dict = {};
				if (bf[f]) {
					dict['axis'] = f;
					dict['value'] = bf[f].positive_count / bf[f].count;
				} else {
					dict['axis'] = f;
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
			.attr("width", w + 300)
			.attr("height", h)

		//Create the title for the legend
		var text = svg.append("text")
			// .attr("class", "title")
			// .attr('transform', 'translate(90,0)')
			// .attr("x", w - 70)
			.attr("x", 434)
			.attr("y", 10)
			.attr("font-size", "12px")
			.attr("fill", "#404040")
			.text("Brands");

		//Initiate Legend	
		var legend = svg.append("g")
			.attr("class", "legend")
			.attr("height", 100)
			.attr("width", 200)
			.attr('transform', 'translate(200,20)');
		//Create colour squares
		legend.selectAll('rect')
			.data(LegendOptions)
			.enter()
			.append("rect")
			.attr("x", w - 65)
			.attr("y", function (d, i) {
				return i * 20;
			})
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function (d, i) {
				return colorscale(i);
			});
		//Create text next to squares
		legend.selectAll('text')
			.data(LegendOptions)
			.enter()
			.append("text")
			.attr("x", w - 52)
			.attr("y", function (d, i) {
				return i * 20 + 9;
			})
			.attr("font-size", "11px")
			.attr("fill", "#737373")
			.text(function (d) {
				return d;
			});
}

function constructRadar(y) {
    if (y === undefined) y = 2003;
	
    if (brandData === null) {
        fetch("brand_features.json")
            .then(res => res.json())
            .then((json) => {
                brandData = json
                updateRadar(y)
            })
    } else {
        updateRadar(y)
    }
}
constructRadar(____year) 