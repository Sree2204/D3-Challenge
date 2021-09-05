// Step 1: Set up our chart
//= ================================

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 80,
    bottom: 100,
    left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis  = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2 ])
        .range([0, width]);
    // console.log("X:",d3.min(data, d => d[chosenXAxis]));

    return xLinearScale;
  
}
// function used for updating y-scale var upon click on axis label

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2 ])
        .range([height, 0]);
    // console.log("Y:",d3.min(data, d => d[chosenYAxis]));
    return yLinearScale;
  
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis  = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to new circles

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}
// function used for updating the State labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}

// function used for styling XAxis
function styleXAxis(value, chosenXAxis) {

    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
// updating XAxis labels
     // poverty
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty :";
    }
    // age
    else if (chosenXAxis === "age") {
        var xLabel = "Age (Median):";
    }
    //Income
    else {
        var xLabel = "Income (Median):";
    }
// updating YAxis labels

     // Healthcare
    if (chosenYAxis === "healthcare") {
    var yLabel = "No Healthcare:";
    }
    // age
    else if (chosenYAxis === "obesity") {
    var yLabel = "Obesity";
    }
    //Income
    else {
    var yLabel = "Smokers";
}

    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${styleXAxis(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  
    });

  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", toolTip.show)
    // onmouseout event
        .on("mouseout",toolTip.hide)
        
        return circlesGroup;
}

  // Retrieve data from the CSV file and execute everything below

  d3.csv("data.csv").then(function (data, err) {
     if (err) throw err;

    // parse data
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });
    // console.log(data)
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);
    // console.log("1")
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // console.log("2")
   
    

    // Step 7: Append the axes to the chartGroup
   // ==============================================
    // Add bottomAxis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    // console.log("3")
    // Add leftAxis to the left side of the display
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
        .call(leftAxis);
    //  console.log("4")
       
    // Step 8: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .classed("stateCircle", true)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "14")
            
           
    
    var textGroup = chartGroup.selectAll('.stateText')
        .data(data)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 4)
        .attr('dx', -1)
        .attr('font-size', '10px')
        .text(function(d){return d.abbr})

     // Create group for the Xaxis labels
    
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 })`);
        

    var povertyLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        
        // .classed('aText', true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("inactive", true)  
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .text("Household Income (Median)");

    // Create group for the Y axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr('transform', `translate(${0 - margin.left/2}, ${height/2})`);


 // append Y axis

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("active", true) 
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("value", "healthcare") // value to grab for event listener
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Lacks Healthcare (%)");
    
    var smokesLabel  = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 -40)
        .attr("value", "smokes") // value to grab for event listener
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Smokes (%)");

        var obesityLabel   = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y",0 - 60)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Obese (%)");

// updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    // console.log("5")
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

             // updates circles with new  values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);

            //update text 
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }

    else if (chosenXAxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
      }
      else {
        povertyLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", true)
        .classed("inactive", false)
        }
     }
    
    });

    // Y axis labels event listener

    yLabelsGroup.selectAll("text")
        .on("click", function() {
       
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;
            
            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(data, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

             // updates circles with new  values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update text 
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

             // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
    }

             else if (chosenYAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
      }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
        }
     }
    
    });

    })