//var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];
// Time
var dataTime = d3.range(0, 12).map(function(d) {

  return new Date(2003 + d, 10, 3);
});

var value = "2006"
stackedBar(value);
GetData(value);
var sliderTime = d3
  .sliderBottom()
  .min(d3.min(dataTime))
  .max(d3.max(dataTime))
  .step(1000 * 60 * 60 * 24 * 365)
  .width(500)
  .tickFormat(d3.timeFormat('%Y'))
  .tickValues(dataTime)
  .default(new Date(2006, 10, 3))
  .on('onchange', val => {
    cur = d3.timeFormat('%Y')(val)
    d3.select('p#value-time').text(value);
    if(cur != value) {
      value = cur
      console.log(cur)
      stackedBar(cur)
	  GetData(cur);
	  
    }

  });

var gTime = d3
  .select('div#slider-time')
  .append('svg')
  .attr('width', 1000)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)');

gTime.call(sliderTime);

d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
