/* HINT 1

 When importing json, try using metadata

 d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    console.log(result);

 });

HINT 2

 Event Listener is different in this html, review id="selDataset" in index.html
 <select id="selDataset" onchange="optionChanged(this.value)"></select> 
 */

 
//Get Data
var data = jsonData;
console.log(data);

// Populate Drop Down Menu
var dropMenu = d3.select("#selDataset");
let sampleIds = data.names;
sampleIds.forEach((id) => {
   dropMenu.append("option").text(id).property("value",id);
});

// Initialize page
popDemographic(sampleIds[0],data.metadata);
buildBar(sampleIds[0], data.samples);
buildGauge(sampleIds[0], data.metadata);
buildBubble(sampleIds[0], data.samples);

// Update page when Test Subject is changed
function optionChanged(sample_id) {
   popDemographic(sample_id,data.metadata);
   buildBar(sample_id, data.samples);
   buildBubble(sample_id, data.samples);
};

// Add Demographic Info for Test Subject
function popDemographic(selectedSample, metadata) {
   // Retrieve selected metadata
   var meta = metadata.filter(metaObj => metaObj.id == selectedSample);
   // console.log(meta[0]);
   var demoPanel = d3.select("#sample-metadata");
   demoPanel.selectAll("p").remove();
   Object.entries(meta[0]).forEach(([key, value]) => {
      console.log(`Metadata [Key: ${key}, Value: ${value}]`);
      demoPanel.append('p').text(`${key}: ${value}`);
   });
};

// Create bar chart in "bar" section
function buildBar(selectedSample, samples) {
   // Retrieve selected sample data
   var sampleData = samples.filter(sampleObj => sampleObj.id == selectedSample);
   sampleData = sampleData[0];

   // console.log("------samples-------");
   // console.log(samples);
   console.log(`------Retrieve samples for sample_id=${selectedSample}-------`);
   console.log(sampleData);

   // Reorganize data into array of objects
   barData = [];
   for (i=0; i < sampleData.sample_values.length; i++) {
      barData.push({
         "sample_id":sampleData.id,
         "otu_id":sampleData.otu_ids[i],
         "sample_value":sampleData.sample_values[i],
         "otu_label":sampleData.otu_labels[i]
      });
   };
   
   // Sort the samplesResultArray by sample_values
   barData.sort((a,b) => b.sample_value - a.sample_value);

   // Slice the top 10 objects
   barData = barData.slice(0,10);

   // Reverse the array due to Plotly's defaults
   barData = barData.reverse();

   // Define data trace
   var barTrace = [{
      x: barData.map(row => row.sample_value),
      y: barData.map(row => `OTU ${row.otu_id}`),
      text: barData.map(row => row.otu_label),
      type: "bar",
      orientation: "h"
   }];

   // Define layout
   var barLayout = {
      title: `OTUs present in patient ${selectedSample}`
   };

   // Define configuration
   var barConfig = {
      responsive: true,
      displayModeBar: false
   };

   // Render Plot
   Plotly.newPlot("bar", barTrace, barLayout, barConfig);
};

function buildGauge(selectedSample, metadata) {
   // Retrieve selected metadata
   var meta = metadata.filter(metaObj => metaObj.id == selectedSample);
   // console.log(meta[0]);
   meta = meta[0];
   washFreq = meta.wfreq;
   console.log(washFreq);

   // var gaugeTrace = [{
   //    domain: {x:[0,1], y:[0,1]},
   //    value: washFreq,
   //    type: "indicator",
   //    mode: "gauge+number",
   //    gauge: {
   //       axis: { range: [null, 9] },
   //       steps: [
   //          { range: [0-1], color: "rgba(236, 249, 236)"},
   //          { range: [1-2], color: "#ecf9ec" },
   //          { range: [2-3], color: "#ecf9ec" },
   //          { range: [3-4], color: "#ecf9ec" },
   //          { range: [4-5], color: "#ecf9ec" },
   //          { range: [5-6], color: "#ecf9ec" },
   //          { range: [6-7], color: "#ecf9ec" },
   //          { range: [7-8], color: "#ecf9ec" },
   //          { range: [8-9], color: "#ecf9ec" }
   //       ]
   //    },
   // }];

   var gaugeTrace = [{
      type: "pie",
      hole: 0.5,
      rotation: 90,
      direction: "clockwise",
      values: [1,1,1,1,1,1,1,1,1,9],
      text: ["0-1","1-2","2-3","3-4","4-5","5-6","6-7","7-8","8-9",""],
      textinfo: 'text',
      textposition: "inside",
      marker: {
         colors: ['','','','','','','','','','white'],
         labels: ["0-1","1-2","2-3","3-4","4-5","5-6","6-7","7-8","8-9",""],
         hoverinfo: 'label'
      },
      showlegend: false
   }];

   // Calculate arrow tip
   var degrees = 0, radius = 0.6;
   var radians = degrees * Math.PI / 180;
   var x = -1 * radius * Math.cos(radians);
   var y = radius * Math.sin(radians);
   
   // Define layout
   var gaugeLayout = {
      shapes:[{
         type: 'line',
         x0: 0.5,
         y0: 0.5,
         x1: x,
         y1: y,
         line: {
            color: 'black',
            width: 10
         }
      }],
      title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
      xaxis: {visible: false, range: [-1,1]},
      yaxis: {visible: false, range: [0,1]},
   };
   
   // Define configuration
   var gaugeConfig = {
      responsive: true,
      displayModeBar: false
   };

   // Render Plot
   Plotly.newPlot("gauge", gaugeTrace, gaugeLayout, gaugeConfig);
};

function buildBubble(selectedSample, samples) {
   // Retrieve selected sample data
   var sampleData = samples.filter(sampleObj => sampleObj.id == selectedSample);
   sampleData = sampleData[0];

   // Define data trace
   var bubbleTrace = [{
      x: sampleData.otu_ids,
      y: sampleData.sample_values,
      text: sampleData.otu_labels,
      mode: 'markers',
      marker: {
         color: sampleData.otu_ids,
         size: sampleData.sample_values
      }
   }];
   console.log(bubbleTrace);

   // Define layout
   var bubbleLayout = {
      title: `All OTUs present in Test Subject ${selectedSample}`,
      xaxis: {title: 'OTU ID'},
      yaxis: {title: 'OTU Abundance'}
   };

   // Define configuration
   var bubbleConfig = {
      responsive: true,
      displayModeBar: false
   };

   // Render Plot
   Plotly.newPlot("bubble", bubbleTrace, bubbleLayout, bubbleConfig);
};
