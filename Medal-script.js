$(document).ready(() => {
  games = ["Football", "Handball", "Water Polo", "Hockey", "Baseball", "Volleyball", "Tennis", "Badminton", "Beach Volleyball", "Table Tennis",
    "Gymnastics", "Rhythmic Gymnastics", "Trampolining", "Synchronized Swimming", "Diving", "Equestrianism",
    "Fencing", "Wrestling", "Judo", "Boxing", "Taekwondo", "Weightlifting",
    "Shooting", "Archery",
    "Swimming", "Athletics", "Cycling", "Modern Pentathlon", "Triathlon", "Canoeing", "Rowing", "Sailing"
  ];

  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/world_countries.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/medal_board_data.csv")
    .await(function(error, country_data, medal_data) {
      medal_vis_location = new MedalVis_Location(country_data, medal_data);
      medal_vis_location.show_medals_default();
      // //draw the timeline
      // let s_width = $(".time-slot").width();
      medal_vis_location.show_timeline();
    });

  //add list into the game drop-down menu
  for (i in games) {
    var game_to_add = "<option value= '" + games[i] + "'>" + games[i] + "</option>";
    $("#games-all").after(game_to_add);
  }
  //Listen the toggle clicking
  //By location(default)
  $(".tog-location").click(function() {
    $(this).toggleClass("down");
    $(".tog-number").toggleClass("down", false);
    $("#medal-chart").children().remove();
    // call function to draw chart by location
    d3.queue()
      .defer(d3.json, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/world_countries.json")
      .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/medal_board_data.csv")
      .await(function(error, country_data, medal_data) {
        medal_vis_location = new MedalVis_Location(country_data, medal_data);
        medal_vis_location.show_medals_default();
      });
  });
  //By number
  $(".tog-number").click(function() {
    $(this).toggleClass("down");
    $(".tog-location").toggleClass("down", false);
    $(".countries").remove();
    // call function to draw chart by number
    medal_vis_location.sort_circles();
      
  });

});

class MedalVis_Location {

  constructor(country_data, medal_data) {
    var thisvis = this;
    this.medal = "All";
    this.game = "All";
    this.year = "1904";
    this.country_data = country_data;
    this.medal_data = medal_data;
    this.radius = d3.scaleLinear()
      .domain([0, 300])
      .range([0, 40]);

    // Get a reference to the SVG element.
    this.svg = d3.select("#medal-chart")
      .append("svg")
      .attr("width", "100%")
      .attr("height", 600)
      .style("margin-top", "20px");

    this.tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
        var top5_html = "<table><tr><td align=\"center\">" + d.properties.name + ": " + d.medal_count + "</td></tr>";
        var medals_kind = thisvis.count_medals_kind(d.id);
        top5_html += "<tr><td><span class=\"golddot\"></span> " + medals_kind['Gold'];
        top5_html += "<span class=\"silverdot\"></span> " + medals_kind["Silver"];
        top5_html += "<span class=\"bronzedot\"></span> " + medals_kind["Bronze"] + "</td></tr>";

        var sorted_sport = thisvis.count_top_5(d.id);

        for (var i = 0; i < (sorted_sport.length < 5 ? sorted_sport.length : 5); i++) {
          var order = i + 1;
          top5_html += "<tr><td>#" + order + " " + sorted_sport[i][0] + ":</td><td>" + sorted_sport[i][1] + "</td></tr>";
        }
        return top5_html;
      });
  }


  setYear(new_year) {
    this.year = new_year;
    this.show_medals_changes();
  }

  // Callback for changing the kind of the medal.
  setMedal(new_medal) {
    this.medal = new_medal;
    this.show_medals_changes();
  }

  // Callback for changing the game.
  setGame(new_game) {
    this.game = new_game;
    this.show_medals_changes();
  }

  // Count the medals
  count_medals(medal_data_year) {
    var medal_count_by_ctry = {};

    medal_data_year.forEach(function(d) {
      if (!medal_count_by_ctry[d.NOC])
        medal_count_by_ctry[d.NOC] = 0;
      medal_count_by_ctry[d.NOC]++;
    });

    this.country_data.features.forEach(function(d) {
      if (medal_count_by_ctry[d.id])
        d.medal_count = medal_count_by_ctry[d.id];
      else
        d.medal_count = 0;
    });
  }

  // Count medals for specific kind (gold, silver and bronze)
  count_medals_kind(country_id) {
    var thisvis = this;
    var medals_kind = {};
    var medal_data_year = this.medal_data.filter(function(d) {
      return d.Year == thisvis.year;
    });
    var country_medal_data = medal_data_year.filter(function(d) {
      return (d.NOC == country_id);
    });
    country_medal_data.forEach(function(d) {
      if (!medals_kind[d.Medal])
        medals_kind[d.Medal] = 0;
      medals_kind[d.Medal]++;
    });
    return medals_kind;
  }

  // Count top-5 sports for each country
  count_top_5(country_id) {
    var sport_medals = {};
    var sortable = [];
    var thisvis = this;
    var medal_data_year = this.medal_data.filter(function(d) {
      return d.Year == thisvis.year;
    });
    var country_medal_data = medal_data_year.filter(function(d) {
      return (d.NOC == country_id);
    });
    country_medal_data.forEach(function(d) {
      if (!sport_medals[d.Sport])
        sport_medals[d.Sport] = 0;
      sport_medals[d.Sport]++;
    });

    for (var sport in sport_medals)
      sortable.push([sport, sport_medals[sport]]);

    sortable.sort(function(sport_a, sport_b) {
      return sport_b[1] - sport_a[1];
    });
    return sortable;
  }

  // Filter the data based on user's choices
  data_filter() {
    var thisvis = this;
    var medal_data_year = this.medal_data.filter(function(d) {
      return d.Year == thisvis.year;
    });
    if (this.medal == "All" && this.game == "All")
      return medal_data_year;
    else if (this.medal == "All")
      return medal_data_year.filter(function(d) {
        return d.Sport == thisvis.game;
      });
    else if (this.game == "All")
      return medal_data_year.filter(function(d) {
        return d.Medal == thisvis.medal;
      });
    else
      return medal_data_year.filter(function(d) {
        return (d.Medal == thisvis.medal && d.Sport == thisvis.game);
      });
  }


  //draw timeline
  show_timeline() {
    var margin = 20;
    var time_width = $(".time-slot").width();
    var format = d3.format("d");
    var year_data = d3.set(this.medal_data.map(function(d) {
        return d.Year;
      }))
      .values()
      .sort();
    // var x = d3.scaleTime()
    //   .domain([new Date(1908, 1, 1), new Date(2016, 1, 1)])
    //   .range([margin, time_width - margin]);

    var x = d3.scaleLinear()
      .domain([1896, 2016])
      .range([margin, time_width - margin]);

    // Create the SVG canvas that will be used to render the visualization.
    var time_svg = d3.select(".time-slot")
      .append("svg")
      .attr("width", time_width)
      .attr("height", "60px")
      .style("margin-top", "20px");

    // Add axes.  First the X axis and label.
    var x_axis = d3.axisBottom(x)
      .tickFormat(format)
      .tickValues(year_data);

    //get the click tick element
    function bold_label(year) {
      return d3.select('.axis')
        .selectAll('text')
        .filter(function(x) {
          return x == year;
        });
    }

    time_svg.append("g")
      .attr("class", "axis")
      .call(x_axis)
      .attr("transform", "translate(5,5)")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");


    time_svg.selectAll(".rec")
      .data(year_data)
      .enter().append("rect")
      .attr("class", "rec")
      .attr("x", function(d) {
        return x(d);
      })
      .attr("y", 1)
      .attr("width", "8px")
      .attr("height", "8px")
      .style("fill", "#FFFFFF")
      .on('mouseover', handleMouseIn)
      .on('mouseout', handleMouseOut)
      .on('click', handleClick);

    function handleMouseOut(d) {
      if (!d3.select(this).classed("clicked")) {
        bold_label(d).attr('style', "fill:#FFFFFF;font-weight:normal;")
          .style("text-anchor", "end");
        d3.select(this).attr("width", "8px")
          .attr("height", "8px")
          .style("fill", "#FFFFFF");
      }
    }

    function handleMouseIn(d) {
      bold_label(d).attr('style', "fill:goldenrod;font-weight:bold;")
        .style("text-anchor", "end");
      d3.select(this).attr("width", "10px")
        .attr("height", "10px")
        .style("fill", "goldenrod");
    }

    function handleClick(d) {

      d3.selectAll(".clicked")
        .classed("clicked", false)
        .attr("width", "8px")
        .attr("height", "8px")
        .style("fill", "#FFFFFF");

      d3.select(".highlighted").attr('style', "fill:#FFFFFF;font-weight:normal;")
        .style("text-anchor", "end")
        .classed("highlighted", false);

      d3.select(this).attr("width", "10px")
        .attr("height", "10px")
        .style("fill", "goldenrod")
        .classed("clicked", true);
      var change_year = bold_label(d).text();
      bold_label(d).classed("highlighted", true);
      this.year = change_year;
      console.log(change_year);

    }
  }


  // Show bubbles on the world map in default mode (All, All)
  show_medals_default() {

    var thisvis = this;
    var chart_w = $("#medal-chart").width();

    var path = d3.geoPath();

    var projection = d3.geoMercator()
      .scale(chart_w / 2 / Math.PI)
      .translate([chart_w / 2, 800 / 2]);

    path = d3.geoPath().projection(projection);

    this.tool_tip(this.svg);

    this.count_medals(this.medal_data.filter(function(d) {
      return d.Year == "1904";
    }));

    this.svg.append("g")
      .attr("class", "countries")
      .attr("width", "100%")
      .attr("height", 450)
      .style("margin-top", "20px")
      .selectAll("path").data(this.country_data.features)
      .enter().append("path")
      .attr("d", path)
      .attr("id", function(d) {
        return d.id;
      })
      .style("fill", "#d4d4d4")
      .style("opacity", 0.6);

    // this.svg.append("g")
    //   .attr("class", "bubble")
    //   .selectAll("circle")
    //   .data(this.country_data.features)
    //   .enter().append("g")
    //   .attr("transform", function(d) {
    //     return "translate(" + path.centroid(d) + ")";
    //   });
    
    var ctry_g = this.svg.append("g")
          .attr("class", "bubble")
              .selectAll("circle")
              .data(this.country_data.features)
              .enter().append("g")
              .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
              })
              .on('mouseover', function(d) {
                if (d.medal_count) {
                  thisvis.tool_tip.show(d);
                }
                d3.select("#" + d.id)
                  .style("opacity", 1.0)
                  .style("stroke", "white")
                  .style("stroke-width", 2);
                d3.select(this).style("opacity", 0.6);
              })
              .on('mouseout', function(d) {
                if (d.medal_count) {
                  thisvis.tool_tip.hide(d);
                }
                d3.select("#" + d.id)
                  .style("opacity", 0.6)
                  .style("stroke", "white")
                  .style("stroke-width", 0);
                d3.select(this).style("opacity", 1);
              });

    ctry_g.attr('id', "cg")
      .append('circle')
      .attr("r", function(d) {
        return thisvis.radius(d.medal_count);
      })
      .attr("id", function(d) {
        return d.id + d.id;
      })
      .style("fill", "#7ea23e")
      .style("fill-opacity", "0.7");
      
      this.svg.selectAll("#cg")
        .each(
          function(d){
            var elt = d3.select(this);
            if(d.medal_count > 50){
              elt.attr()
                .append('text')
                .attr("dx", -12)
                .attr("dy", 3)
                .text(function(d){return d.id;})
                .attr("font-size", "12px")
                .style("fill", "#272727bd");
            }
          }
        );
      
  }

  sort_circles() {

    var thisvis = this;
    var radius_map = new Map();

    // Get all the non-zero redius value of all circles.
    this.svg.selectAll("circle")
      .each(    
        function(d){
          var elt = d3.select(this);
          if(elt.attr("r") > 0){
            radius_map.set(elt.attr("id"), elt.attr("r"));
          }
        }
      );
    
    // // compute the total radius length
    var total_r = d3.sum(Array.from(radius_map.values()));

    // sort map by values
    // reference to https://stackoverflow.com/questions/37982476/how-to-sort-a-map-by-value-in-javascript
    const sorted_radius_map = new Map([...radius_map.entries()].sort((a, b) => b[1] - a[1]));
    var sorted_ctry = Array.from(sorted_radius_map.keys());
    
    for (var i in sorted_ctry){
      let circle_id = "#" + sorted_ctry[i];
      console.log(circle_id);

      this.svg.select(circle_id)
            .transition().duration(1000)
            .attr("transform", null)
            .attr('cx', radius_map.get(sorted_ctry[i])+20*i)
            .attr('cy', radius_map.get(sorted_ctry[i])+50)
            .style("fill", "red")
            .duration(1000);
    }      
  }

  // Change bubble size based on user's choices
  show_medals_changes() {
    var thisvis = this;
    this.count_medals(this.data_filter());
    var changed_tool_tip = this.tool_tip;

    if (!(this.medal == "All" && this.game == "All")) {
      var changed_tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) {
          return d.properties.name + ": " + d.medal_count;
        });
    }
    changed_tool_tip(this.svg);

    this.svg.selectAll("text").exit().remove();

    this.svg.selectAll("circle")
      .data(this.country_data.features)
      .attr("r", function(d) {
        return thisvis.radius(d.medal_count);
      });
      
    this.svg.selectAll("#cg")
        .on('mouseover', function(d) {
        if (d.medal_count) {
          changed_tool_tip.show(d);
        }
        d3.select("#" + d.id)
          .style("opacity", 1.0)
          .style("stroke", "white")
          .style("stroke-width", 2);
        d3.select(this).style("opacity", 0.6);
      })
      .on('mouseout', function(d) {
        if (d.medal_count) {
          changed_tool_tip.hide(d);
        }
        d3.select("#" + d.id)
          .style("opacity", 0.6)
          .style("stroke", "white")
          .style("stroke-width", 0);
        d3.select(this).style("opacity", 1);
      })
      .each(
        function(d){
          var elt = d3.select(this);
          if(d.medal_count > 50){
            elt.append('text')
              .attr("dx", -12)
              .attr("dy", 3)
              .text(function(d){return d.id;})
              .attr("font-size", "12px")
              .style("fill", "#272727bd");
          }
        }
      );
  }
}
