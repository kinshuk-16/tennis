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
		var bar_width = 1000,
			bar_height = 50;
		var tourn_meta = [{data: [{tourn: "ATP", count: 23}], name: "Clay"}
						 ,{data: [{tourn: "ATP", count: 7}], name: "Grass"}
						 ,{data: [{tourn: "ATP", count: 35}], name: "Hard"}];
		var tourn_meta = tourn_meta.map(function(d) {
			return d.data.map(function(o,i) {
				return {y: o.count,
						x: o.tourn};
			});
		});
		var stack = d3.layout.stack();

		stack(tourn_meta);

		var tourn_meta = tourn_meta.map(function(group) {
			return group.map(function(d) {
				return {
					x: d.y,
					y: d.x,
					x0: d.y0
				};
			});
		});
		var bar_svg = d3.select("#bar-chart")
					.append("svg")
					.attr("width",bar_width)
					.attr("height",bar_height)
					.append("g");
		var xMax = d3.max(tourn_meta, function(group) {
			return d3.max(group, function(d) {
				return d.x + d.x0;
			});
		});
		var xScale = d3.scale.linear()
        			   .domain([0, xMax])
        			   .range([0, bar_width]),
    		tourns = tourn_meta[0].map(function (d) {
        				return d.y;
    				}),
    		yScale = d3.scale.ordinal()
        					 .domain(tourns)
        					 .rangeRoundBands([0, bar_height], .1);

		
		var colors = ["#FA7921","#7FB800","#118AB2"];
		var groups = bar_svg.selectAll("g")
							.data(tourn_meta)
							.enter()
							.append("g")
							.style("fill", function(d,i) {return colors[i];});
		var rects = groups.selectAll("rect")
						  .data(function(d) {return d;})
						  .enter()
						  .append("rect")
						  .attr("id", function(d) { return d.x; })
						  .attr("x",function(d) { return xScale(d.x0); })
						  .attr("y",function(d) { return yScale(d.y); })
						  .attr("height", function(d) { return yScale.rangeBand(); })
						  .attr("width", function(d) { return xScale(d.x); })
						  .on("mousemove", function(d) {
						  	if (this.id == 23) { current_class = "Clay";} else if (this.id == 7) { current_class = "Grass";} else { current_class = "Hard";}
							d3.selectAll("circle").style("opacity",0);
							d3.selectAll("."+current_class+"").style("opacity",1);
						  });	
		rects.selectAll("text")
			 .data()
			 .text(function(d) { return d.x;})
			 .attr("y", 0)
			 .style("color","white");		