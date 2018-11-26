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
      medal_vis_location.show_timeline();
      medal_vis_location.show_medals_default();
      // //draw the timeline
      // let s_width = $(".time-slot").width();
    });

  //add list into the game drop-down menu
  for (i in games) {
    var game_to_add = "<option value= '" + games[i] + "'>" + games[i] + "</option>";
    $("#games-all").after(game_to_add);
  }
  //Listen the toggle clicking
  //By location(default)
  $(".tog-location").click(function() {
    var cur_year = medal_vis_location.year;
    $(this).toggleClass("down");
    $(".tog-number").toggleClass("down", false);
    $(".countries").show(1000);
    medal_vis_location.number = false;
    medal_vis_location.year = cur_year;
    medal_vis_location.move_medals_to_map();
  });
  //By number
  $(".tog-number").click(function() {
    $(this).toggleClass("down");
    $(".tog-location").toggleClass("down", false);
    $(".countries").hide(1000);
    // call function to draw chart by number
    medal_vis_location.number = true;
    medal_vis_location.sort_circles();
  });

});

class MedalVis_Location {

  constructor(country_data, medal_data) {
    var thisvis = this;
    this.medal = "All";
    this.game = "All";
    this.year = "2016";
    this.number = false;
    this.country_data = country_data;
    this.medal_data = medal_data;
    this.radius = d3.scaleLinear()
      .domain([0, 230])
      .range([0, 120]);

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
    if(this.number == true)
        this.sort_circles();
  }

  // Callback for changing the kind of the medal.
  setMedal(new_medal) {
    this.medal = new_medal;
    this.show_medals_changes();
    if(this.number == true)
        this.sort_circles();
  }

  // Callback for changing the game.
  setGame(new_game) {
    this.game = new_game;
    this.show_medals_changes();
    if(this.number == true)
        this.sort_circles();
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
    var thisvis = this;
    var margin = 20;
    var time_width = $(".time-slot").width();
    var format = d3.format("d");
    var year_data = d3.set(this.medal_data.map(function(d) {
        return d.Year;
      }))
      .values()
      .sort();
    //curve the hover data
    var bisectDate = d3.bisector(function(d) {
      return d;
    }).left;

    var x = d3.scaleLinear()
      .domain([1896, 2016])
      .range([margin, time_width - margin]);

    // Create the SVG canvas that will be used to render the visualization.
    var time_svg = d3.select(".time-slot")
      .append("svg")
      .attr("width", time_width)
      .attr("height", "60px");

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

    //get the text by year
    function get_text(year) {
      return d3.selectAll('.tick text')
        .filter(function(d) {
          return d == year;
        });
    }

    time_svg.append("g")
      .attr("class", "axis")
      .call(x_axis)
      .attr("transform", "translate(5,20)")
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
      .attr("y", 18)
      .attr("width", "8px")
      .attr("height", "8px")
      .style("fill", "#FFFFFF");

    //add a vertical line following the mouse
    var focus = time_svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", 30)
      .attr("transform", "translate(4,-10)");

    time_svg.append("rect")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "overlay")
      .attr("width", time_width)
      .attr("height", "60px")
      .attr("transform", "translate(0,-10)")
      .attr("opacity", "0")
      .on("mouseover", function() {
        focus.style("display", null);
      })
      .on("mouseout", function() {
        focus.style("display", "none");
      })
      .on("mousemove", handleMouseMove);
      // .on("click", handleClick);

    function handleMouseMove(d) {
      //refresh the timeline once change
      handleMouseOut();
      //add new highlight
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(year_data, format(x0)),
        d0 = year_data[i - 1],
        d1 = year_data[i],
        d = x0 - d0 > d1 - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d) + ", 12)");
      thisvis.setYear(d);
      get_text(d).style("fill", "goldenrod")
        .style("font-size", "12px");
    }

    function handleMouseOut() {
      d3.selectAll(".tick text")
        .filter(function() {
          return !this.classList.contains('clicked')
        })
        .attr('style', "fill:#FFFFFF;font-weight:normal;")
        .style("text-anchor", "end");
    }

    function handleClick(d) {
      //clear the highlight
      d3.selectAll(".tick text").classed("clicked",false);
      handleMouseOut();
      //add new highlight
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(year_data, format(x0)),
        d0 = year_data[i - 1],
        d1 = year_data[i],
        d = x0 - d0 > d1 - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d) + ", 12)");

      get_text(d).style("fill", "goldenrod")
        .style("font-size", "12px")
        .classed("clicked", true);

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
      return d.Year == "2016";
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

    var ctry_g = this.svg.append("g")
          .attr("class", "bubble")
              .selectAll("g")
              .data(this.country_data.features)
              .enter().append("g")
              .attr("class", "ctr_g")
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

    ctry_g.attr('id', function(d) {
        return "g-" + d.id;
      })
      .append('circle')
      .attr("r", function(d) {
        return thisvis.radius(d.medal_count);
      })
      .attr("id", function(d) {
        return "c-" + d.id;
      })
      .style("fill", "#7ea23e")
      .style("fill-opacity", "0.7");

    ctry_g.each(
        function(d){
          var elt = d3.select(this);
          if (elt.attr("id") != null && elt.attr("id").startsWith("g-")){
            if(d.medal_count > 15){
              elt.append('text')
                .attr("dx", -12)
                .attr("dy", 3)
                .text(function(d){return d.id;})
                .attr("font-size", "12px")
                .style("fill", "#272727bd");
            }
          }
        }
      );

  }

  move_medals_to_map() {
    var chart_w = $("#medal-chart").width();
    var path = d3.geoPath();

    var projection = d3.geoMercator()
      .scale(chart_w / 2 / Math.PI)
      .translate([chart_w / 2, 800 / 2]);

    path = d3.geoPath().projection(projection);

    this.svg.selectAll(".ctr_g")
      .data(this.country_data.features)
      .transition().duration(1000)
      .attr("transform", function(d) {
        return "translate(" + path.centroid(d) + ")";
      });
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

    // clear former text
    this.svg.selectAll("text").remove();

    this.svg.selectAll("circle")
      .data(this.country_data.features)
      .attr("r", function(d) {
        return thisvis.radius(d.medal_count);
      });

    this.svg.selectAll(".ctr_g")
      .data(this.country_data.features)
      .each( // add text again based on new size of bubbles
        function(d){
          var elt = d3.select(this);
          if (elt.attr("id") != null && elt.attr("id").startsWith("g-")){
            if(d.medal_count > 15){
              elt.append('text')
                .attr("dx", -12)
                .attr("dy", 3)
                .text(function(d){return d.id;})
                .attr("font-size", "12px")
                .style("fill", "#272727bd");}
          }
        }
      ).on('mouseover', function(d) {
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
      });
  }

  // Show sorted circles after click the "number" button
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

  // sort map by values
  // reference to https://stackoverflow.com/questions/37982476/how-to-sort-a-map-by-value-in-javascript
  const sorted_radius_map = new Map([...radius_map.entries()].sort((a, b) => b[1] - a[1]));
  let sorted_ctry = Array.from(sorted_radius_map.keys());

  // compute the position of circles after movement.
  let x_pos = 0;
  let y_start = [];
  y_start.push(2 * Number(this.svg.select("#" + sorted_ctry[0]).attr("r")) + 15);

  // The row will display current circle.
  let row = 1;
  for (i in sorted_ctry){
    let g_id = "#g-" + sorted_ctry[i].substr(2, 4);
    let current_r = Number(this.svg.select("#" + sorted_ctry[i]).attr("r"));

    x_pos += current_r + 15;

    if ((x_pos > 800)&& (!y_start[row])) {
      y_start.push(y_start[row-1] + 15 + 2 * current_r);
      row += 1;
      x_pos = current_r + 15;
    }

    let y_pos = y_start[row-1] - current_r;

    this.svg.select(g_id)
      .transition().duration(1000)
      .attr("transform", "translate(" + x_pos + ", " + y_pos + ")")
      .duration(1000);

    x_pos += current_r;
  }

}

}
