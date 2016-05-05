var width = 1200,
			height = 500;
		var color = d3.scale.category20();	
		var t_data;
		var tournaments = [];
		var cities = [];

		function load_citydata(callback) {
			d3.json("../data/cities.topo.json",function(error,data) {
				topojson.object(data, data.objects.cities).geometries.forEach(function(d) {
					cities.push({"city":d.id,"longitude":Number(d.properties.longitude),"latitude":Number(d.properties.latitude)});
				});
				callback(cities);
			});
		}

		function load_pointsonmap(city_data) {
			d3.csv("../data/Surface_all-2.csv", function(error,data) {
			g.selectAll("circle")
		 .data(data).enter()
		 .append("circle")
		 .attr("class",function(d) {
		 	if (d.SURFACE.replace(/\s+/g, '') === "Hard") { return "Hard"; } else if (d.SURFACE.replace(/\s+/g, '') === "Clay") { return "Clay"; } else if (d.SURFACE.replace(/\s+/g, '') === "Grass") {return "Grass";}
		 })
		 .attr("transform", function(d) {
		 	for (var i = 0; i < city_data.length; i++) {
		 		if (d.TOWN.trim() === city_data[i].city) { coordinates = [city_data[i].longitude,city_data[i].latitude]; }
		 	}
		 	return "translate(" + projection(coordinates) + ")";})
		 .attr("r", "5px")
		 .attr("fill", function(d) {if (d.SURFACE.replace(/\s+/g, '') === "Hard") { return "#118AB2"; } else if (d.SURFACE.replace(/\s+/g, '') === "Clay") { return "#FA7921"; } else if (d.SURFACE.replace(/\s+/g, '') === "Grass") {return "#7FB800";}})
		 .style("opacity",.7)
		 .on('mousemove', function(d) {
		                    var mouse = d3.mouse(svg.node()).map(function(d) {
		                        return parseInt(d);
		                    });
		                    tooltip.classed('hidden', false)
		                           .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
		                           .html('<div>'+"Town: "+d.TOWN+'</div><div>'+"Tournament: "+d.TOURN+'</div><div>'+'Surface: '+d.SURFACE+'</div>');
		                })
			  .on("mouseout",function(d) {
			  	tooltip.classed('hidden',true).style("opacity",0);
			  });
		});
		}


		var tooltip = d3.select('#map').append('div')
            .attr('class', 'hidden tooltip');	
        // console.log("2. svg stuff");    
		var svg = d3.select("#map")
					.append("svg")
					.attr("width",width)
					.attr("height",height);
		// console.log("3. g stuff");			
		var g = svg.append("g")
				   .attr("id","worldmap");
		// console.log("4. projection stuff");
		var projection = d3.geo.equirectangular()
						    .scale(153)
						    .translate([width / 2, height / 2])
						    .precision(.1);		   
		// console.log("5. geoPath stuff");				    
		var geoPath = d3.geo.path()
		    .projection(projection);
		// console.log("6. reading countries.topojson stuff");    
		d3.json("../data/countries.topo.json", function(error, topology) {
			g.selectAll("path")
			  .data(topojson.object(topology, topology.objects.countries).geometries)
			  .enter()
			  .append("path")
			  .attr("id", function(d) {return d.id;})
			  .attr("d", geoPath)
			  .style("fill","#DCDCDD")
			  // .on('mousemove', function(d) {
		   //                  var mouse = d3.mouse(svg.node()).map(function(d) {
		   //                      return parseInt(d);
		   //                  });
		   //                  tooltip.classed('hidden', false)
		   //                         .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
		   //                         .html(d.id);
		   //              })
			  // .on("mouseout",function(d) {
			  // 	tooltip.classed('hidden',true).style("opacity",0);
			  // });
		});
		load_citydata(load_pointsonmap);


		// Now create a bar chart
		var width = 600,
			height = 160;
		var margin = {top: 20, right: 20, bottom: 20, left: 20};
		var x = d3.scale.ordinal()
						.domain(["Clay","Grass","Hard"])
						.rangePoints([20,width-margin.left-margin.right-80]);
		var y = d3.scale.linear()
    					.range([height-margin.top-margin.bottom+20, 0]);
    	var xAxis = d3.svg.axis()
					    .scale(x)
					    .orient("top");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var barchart = d3.select("#bar").append("svg")
						 .attr("width",width + margin.left + margin.right)
						 .attr("height",height + margin.top + margin.bottom)
						 .append("g")
						 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.csv("../data/toun.csv", function(error,data) {
			y.domain([0,d3.max(data,function(d) {return +d.NUM;})]);
			barchart.append("g")
				.attr("class","x axis")
				.call(xAxis);

			barchart.append("g")
				.attr("class","y axis")
				.call(yAxis)
				.append("text")
		        .attr("transform", "rotate(-90)")
		        .attr("y", 6)
		        .attr("dy", ".51em")
		        .style("text-anchor", "end")
		        .text("Number of matches");

			barchart.selectAll(".bar")
					.data(data)
					.enter().append("rect")
					.attr("class","bar")
					.attr("id",function(d) {return d.SURFACE;})
					.attr("x",function(d) {return x(d.SURFACE);})
					.attr("y",function(d) {return y(d.NUM);})
					.attr("height",function(d){ return height-margin.top-y(d.NUM);})
					.attr("width",height/3)
					.attr("fill",function(d) { if (d.SURFACE === "Clay") { return "#FA7921"} else if (d.SURFACE === "Hard") { return "#118AB2"} else {return "#7FB800"}})
					.on('mousemove', function(d) {
						tooltip.classed("hidden",false)
							   .attr('style', 'left:' + (d3.event.pageX) + 'px; top:' + (d3.event.pageY - 28) + 'px')
							   .html(d.NUM);
						current_class = this.id;
						d3.selectAll("circle").style("opacity",0);
						d3.selectAll("."+current_class+"").style("opacity",1);
						// d3.selectAll(".clay").style("opacity",0);
					})
					.on('mouseout',function(d) {
						tooltip.classed("hidden",true).style("opacity",0);
						d3.selectAll("circle").style("opacity",1);
					});
		});				