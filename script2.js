// var dataTime = d3.range(0, 12).map(function(d) {
//   return new Date(2003 + d, 10, 3);
// });
const urlParams = new URLSearchParams(window.location.search);
var ____year = +urlParams.get('year') || 2003;
var feat = urlParams.get('feat')
// updateBars(____year)
let intervalID
var yearData = null;
var opinion_sentiments

fetch("year_features.json")
.then(res => res.json())
.then((json) => {
    yearData = json
    fetch("opinion_sentiments.json")
    .then(res => res.json())
    .then((j) => {
        opinion_sentiments = j
        updateBubble(____year)
        updateScatter(____year)
    })
})

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
    updateBubble("__overall")
    updateScatter("__overall")
} 
yearwiseRef.onclick = () => {
    overallRef.classList.remove("is-link")
    yearwiseRef.classList.add("is-link")
    if (intervalID)
        stopSlider()
    else
        playSlider()
}

var sliderTime = d3
  .sliderBottom()
  .min(2003)
  .max(2014)
  .step(1)
    .width(500)
    .default(____year)
  .tickFormat((d) => d)
  .on('onchange', cur => {
    //   console.log(cur);
    if (cur != ____year) {
        overallRef.classList.remove("is-link")
        yearwiseRef.classList.add("is-link")
        ____year = cur;
        // yearRef.textContent = "year "+cur
        updateBubble(cur)
        updateScatter(cur)
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

function addLegend() {
    var __colors = ["rgb(255, 191, 170)", "rgb(51, 195, 255)","rgb(0, 255, 189)"]
    var __svg = d3.select('#legend')
		.append('svg')
		.attr('width', 300)
		// .attr('height', _height + _margin.top + _margin.bottom)
		.attr('height', 50)
        .attr('transform', "translate(0,0)")
    
    var legend = __svg.append('g')
          .attr('class', 'legend')
          .attr('transform', 'translate(0,0)');
        var nm = legend
          .append('g')
          .attr('transform', `translate(0, 20)`)
        nm
          .append('text')
          .style('font-size', '14px')
          .attr('x', 0)
          .attr('y', 9)
          .text("Sentiment:");
        nm.append('rect')
        //   .style('fill', "#fb8072")
          .style('fill', __colors[0])
          .attr('x', 75)
          .attr('y', 0)
          .attr('width', 10)
          .attr('height', 10);
        nm.append('text')
        .style('font-size', '14px')
        .attr('x', 90)
        .attr('y', 10)
            .text("Negative");
         nm.append('rect')
            // .style('fill', "#80b1d3")
            .style('fill', __colors[1])
            .attr('x', 155)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10);
          nm.append('text')
          .style('font-size', '14px')
          .attr('x', 170)
          .attr('y', 10)
          .text("Neutral");
        
          nm.append('rect')
            // .style('fill', "#b3de69")
            .style('fill', __colors[2])
            .attr('x', 225)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10);
          nm.append('text')
          .style('font-size', '14px')
          .attr('x', 240)
          .attr('y', 10)
          .text("Positive");
}
addLegend()