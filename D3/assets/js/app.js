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

var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis  = "healthcare";

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2 ])
        .range([0, width]);

    return xLinearScale;
  
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2 ])
        .range([height, 0]);
    return yLinearScale;
  
}
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis  = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}


function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}

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

function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty :";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age (Median):";
    }
    else {
        var xLabel = "Income (Median):";
    }

    if (chosenYAxis === "healthcare") {
    var yLabel = "No Healthcare:";
    }

    else if (chosenYAxis === "obesity") {
    var yLabel = "Obesity";
    }
   
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
    
        .on("mouseout",toolTip.hide)
        
        return circlesGroup;
}


  d3.csv("assets/data/data.csv").then(function (data, err) {
     if (err) throw err;

    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
 
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
        .call(leftAxis);

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


    
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 })`);
        

    var povertyLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        
        
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .classed('aText', true)
        .classed("inactive", true)  
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .text("Household Income (Median)");

    
    var yLabelsGroup = chartGroup.append("g")
        .attr('transform', `translate(${0 - margin.left/2}, ${height/2})`);


 

    var healthcareLabel = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("active", true) 
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("value", "healthcare") 
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Lacks Healthcare (%)");
    
    var smokesLabel  = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 -40)
        .attr("value", "smokes") 
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Smokes (%)");

        var obesityLabel   = yLabelsGroup.append('text')
        .classed('aText', true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y",0 - 60)
        .attr("value", "obesity") 
        .classed("inactive", true)
        .attr('dy', '1em')
        .attr('transform', 'rotate(-90)')
        .text("Obese (%)");


    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    xLabelsGroup.selectAll("text")
        .on("click", function() {
  
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

         
            chosenXAxis = value;

            
            xLinearScale = xScale(data, chosenXAxis);

            xAxis = renderXAxes(xLinearScale, xAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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


    yLabelsGroup.selectAll("text")
        .on("click", function() {
       
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            chosenYAxis = value;
            

            yLinearScale = yScale(data, chosenYAxis);

            yAxis = renderYAxes(yLinearScale, yAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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