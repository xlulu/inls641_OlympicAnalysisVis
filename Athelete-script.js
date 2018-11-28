$(document).ready(() => {
  //collapse the personal input
  $(function() {
    $(".collapse").hide();
    $("#arrow").click(function(e) {
      if ($(e.currentTarget).children().hasClass('fa-chevron-circle-down')) {
        $(e.currentTarget).children().removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
        $(".collapse").show();
      } else {
        $(e.currentTarget).children().removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
        $(".collapse").hide();
      }
    });
  });

  d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/athlete_board_data.csv")
    .await(function(error, athelete_data) {
      var gender = 'All';
      athelete_vis = new AtheleteVis(athelete_data);
      athelete_vis.calculateData(gender);
      athelete_vis.show_athelete_default(0);
      athelete_vis.show_athelete_default(1);
      athelete_vis.show_athelete_default(2);
      athelete_vis.prepare_hover();
    });

  //Listen the toggle button served for the chart
  //All athelete(default)
  $(".tog-sex").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-female").toggleClass("clicked", false);
    $(".tog-male").toggleClass("clicked", false);
    $("#box-svg").children().remove();
    // call function to draw chart with ALL athelete data
    var gender = 'All';
    athelete_vis.calculateData(gender);
    athelete_vis.show_athelete_default(0);
    athelete_vis.show_athelete_default(1);
    athelete_vis.show_athelete_default(2);
    athelete_vis.prepare_hover();
  });

  //Female athelete
  $(".tog-female").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-male").toggleClass("clicked", false);
    $("#box-svg").children().remove();
    // call function to draw chart with FEMALE athelete data
    var gender = 'F';
    athelete_vis.calculateData(gender);
    athelete_vis.show_athelete_default(0);
    athelete_vis.show_athelete_default(1);
    athelete_vis.show_athelete_default(2);
    athelete_vis.prepare_hover();

  });

  //Male athelete
  $(".tog-male").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-female").toggleClass("clicked", false);
    $("#box-svg").children().remove();
    // call function to draw chart with MALE athelete data
    var gender = 'M';
    athelete_vis.calculateData(gender);
    athelete_vis.show_athelete_default(0);
    athelete_vis.show_athelete_default(1);
    athelete_vis.show_athelete_default(2);
    athelete_vis.prepare_hover();
  });


  //Listen the selection of sex in input bar
  // Male selected(default)
  $(".toggle-male").click(function() {
    $(this).toggleClass("down");
    $(".toggle-female").toggleClass("down", false);
  });
  // Female selected(default)
  $(".toggle-female").click(function() {
    $(this).toggleClass("down");
    $(".toggle-male").toggleClass("down", false);
  });
  //Once click the "See" button, get the input information
  $(".see-result").click(function() {
    $("#box-svg").children().remove();
    if ($(".toggle-female").hasClass("down")) {
      sex = "F";
    } else {
      sex = "M";
    }
    var age = Number($('#age-input').val());
    var height = Number($('#height-input').val());
    var weight = Number($('#weight-input').val());
    // console.log("age: " + age);
    // console.log("height: " + height);
    // console.log("weight: " + weight);
    // console.log("sex: " + sex);
    // call function to write the filter and give result
    athelete_vis.calculateData(sex);
    athelete_vis.show_athelete_default(0);
    athelete_vis.show_athelete_default(1);
    athelete_vis.show_athelete_default(2);
    athelete_vis.inputLine(age, height, weight);
    athelete_vis.prepare_hover();
  });

});


class AtheleteVis {
  //reference: https://blog.datasyndrome.com/a-simple-box-plot-in-d3-dot-js-44e7083c9a9e
  constructor(athelete_data) {

    var thisvis = this;
    this.athelete_data = athelete_data;
    //use to save the data after filtered by gender
    this.athe_gender_data = [];
    //use to save all the calculated data
    this.ath_info_data = {};
    this.gender = "All";
    this.chart_w = $("#athelete-chart").width();
    this.margin = 100;
    this.width_for_scale = (this.chart_w - this.margin - 5) / 3 - 10;
    //get all the games name
    this.games_data = d3.set(this.athelete_data.map(function(d) {
        return d.Sport;
      }))
      .values()
      .sort();

    this.game_chart = {
      0: "Height",
      1: "Weight",
      2: "Age"
    };

    this.color_chart = {
      'All': ["#177410", "#74B46F"],
      'F': ["#BC4454", "#E0707E"],
      'M': ["#155F9F", "#67A1D3"]
    };

    // Get a reference to the SVG element.
    this.svg = d3.select("#athelete-chart")
      .append("svg")
      .attr("id", "box-svg")
      .attr("width", "100%")
      .attr("height", 650)
      .style("margin-top", "10px");

  }

  // Return the quantile needed for the boxplot
  boxQuartiles(h) {
    return [
      d3.quantile(h, 0.25),
      d3.quantile(h, 0.5),
      d3.quantile(h, 0.75)
    ];
  }

  sortNumber(a, b) {
    return a - b;
  }

  //Define the X scale
  x_scale(min, max) {
    return d3.scaleLinear()
      .domain([min - 1, max + 1])
      .range([0, this.width_for_scale]);
  }

  // Callback for changing the gender.
  setGender(new_gender) {
    var thisvis = this;
    this.gender = new_gender;
    if (new_gender == 'All') {
      this.athe_gender_data = this.athelete_data;
    } else {
      this.athe_gender_data = this.athelete_data.filter(function(d) {
        return d.Sex == thisvis.gender;
      });
    }
  }

  // Tackle the data set
  calculateData(g) {
    this.ath_info_data[0] = [];
    this.ath_info_data[1] = [];
    this.ath_info_data[2] = [];
    var thisvis = this;
    this.setGender(g);
    //filter the data
    //console.log(this.games_data);
    for (var i in this.games_data) {
      var game = this.games_data[i];
      var filtered_data = this.athe_gender_data.filter(function(d) {
        return d.Sport == game;
      });
      //Get the height data via games
      var filtered_hwa = {};
      filtered_hwa[0] = filtered_data.map(function(d) {
        return parseInt(d.Height);
      });
      //Get the weight data via games
      filtered_hwa[1] = filtered_data.map(function(d) {
        return parseInt(d.Weight);
      });
      //Get the height data via games
      filtered_hwa[2] = filtered_data.map(function(d) {
        return parseInt(d.Age);
      });
      //add record
      for (var f in d3.keys(filtered_hwa)) {
        filtered_hwa[f] = filtered_hwa[f].sort(this.sortNumber);
        var record = {};
        var localMin = d3.min(filtered_hwa[f]);
        var localMax = d3.max(filtered_hwa[f]);
        record["game"] = game;
        record[f] = filtered_hwa[f];
        record["quartile"] = this.boxQuartiles(filtered_hwa[f]);
        record["whiskers"] = [localMin, localMax];
        this.ath_info_data[f].push(record);
      }

    }
    //console.log(this.ath_info_data);
  }

  get_min_max(i) {
    var min_value = d3.min(this.ath_info_data[i], function(d) {
      return d.whiskers[0];
    });
    var max_value = d3.max(this.ath_info_data[i], function(d) {
      return d.whiskers[1];
    });
    return [min_value, max_value];
  }

  prepare_hover() {

    // Define y scales
    var y = d3.scalePoint()
      .domain(this.games_data)
      .range([5, 580]);

    var y_axis = d3.axisLeft().scale(y);
    var margin = 100;

    d3.select(".a_a_axis")
    .selectAll(".tick")
    .append("rect")
    .attr("width", this.chart_w)
    .attr("height", 18)
    .attr("id", function(d){return "rec-"+d.replace(/\s/g , "-");})
    .attr("transform", "translate(" + -margin + ", -8)")
    .call(y_axis)
    .style("fill", "black")
    .style("opacity", "0")
    .on('mouseover', function(d){
      d3.select(this).style("fill", "black").style("opacity", 0.2);
    })
    .on('mouseout', function(d){
      d3.select(this).style("opacity", "0");
    });

    // console.log(this.games_data);
    for (var i in this.games_data){
      let target = this.games_data[i].replace(/\s/g , "-");
      d3.selectAll("." + target).each(
        function(){
          d3.select(this)
            .on('mouseover', function(d){
              d3.select("#rec-" + target).style("fill", "black").style("opacity", 0.2);
            })
            .on('mouseout', function(d){
              d3.select("#rec-" + target).style("opacity", "0");
            });
      });
    }
      
  }

  // Show boxplot in default mode (All sex)
  show_athelete_default(info) {
    //console.log("in!");
    // //remove the previous one
    // this.svg.selectAll("g").remove();
    var thisvis = this;
    var margin = 100;
    var wid = (this.chart_w - margin - 32) / 3;
    var textwid = (this.chart_w - margin) / 3 - 8;
    var [min_h, max_h] = this.get_min_max(info);
    //console.log("range", i, min_h, max_h);
    // Define X scales for height
    var x_h = d3.scaleLinear()
      .domain([min_h - 1, max_h + 1])
      .range([0, wid]);
    var x_axis = d3.axisBottom().scale(x_h);

    // Define y scales
    var y = d3.scalePoint()
      .domain(this.games_data)
      .range([5, 580]);
    

    var y_axis = d3.axisLeft().scale(y);

    // Add axes.
    //First the X axis and label.
    this.svg.append("g")
      .attr("class", this.game_chart[info] + "axis")
      .attr("transform", "translate(" + (margin + 5) + ",600)")
      .call(x_axis);

    this.svg.append("text")
      .attr("class", "a_axis-label")
      .attr("y", 635)
      .attr("x", (this.chart_w - margin) / 3 - 20)
      .attr("class", this.game_chart[info] + "text")
      .style("text-anchor", "middle")
      .text(this.game_chart[info])
      .style("font-size", "10px")
      .style("font-family", "'Yanone Kaffeesatz', sans-serif")
      .style("font-weight", "300")
      .style("font-size", "14px");

    // Then the Y axis.
    this.svg.append("g")
      .attr("class", "a_a_axis")
      .attr("transform", "translate(" + margin + ",5)")
      .call(y_axis)
      .selectAll("text")
      .style("font-family", "'Yanone Kaffeesatz', sans-serif")
      .style("font-weight", "300")
      .style("font-size", "11px");

    // Trasfer the boxplot
    var box_g = this.svg.append("g")
      .attr("transform", "translate(" + (margin + 5) + ",1.5)")
      .attr("class", this.game_chart[info]);

    // Draw the box plot horizontal lines
    var barWidth = 10;
    var verticalLines = box_g.selectAll(".horizontalLines")
      .data(this.ath_info_data[info])
      .enter()
      .append("line")
      .attr("x1", function(datum) {
        var whisker = parseInt(datum.whiskers[0]);
        return x_h(whisker);
      })
      .attr("y1", function(datum) {
        return y(datum.game) + barWidth / 2;
      })
      .attr("x2", function(datum) {
        var whisker = parseInt(datum.whiskers[1]);
        return x_h(whisker);
      })
      .attr("y2", function(datum) {
        return y(datum.game) + barWidth / 2;
      })
      .attr("stroke", this.color_chart[this.gender][0])
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("class", function(datum) {
        return (datum.game).replace(/\s/g , "-");
      });

    // Draw the boxes of the box plot, filled in white and on top of vertical lines
    var rects = box_g.selectAll("rect")
      .data(this.ath_info_data[info])
      .enter()
      .append("rect")
      .attr("height", barWidth)
      .attr("width", function(datum) {
        var quartiles = datum.quartile;
        var width = x_h(quartiles[2]) - x_h(quartiles[0]);
        return width;
      })
      .attr("x", function(datum) {
        return x_h(datum.quartile[0]);
      })
      .attr("y", function(datum) {
        return y(datum.game);
      })
      .attr("stroke", this.color_chart[this.gender][0])
      .attr("stroke-width", 1)
      .attr("fill", this.color_chart[this.gender][1])
      .attr("class", function(datum) {
        return (datum.game).replace(/\s/g , "-");
      });

    // Now render all the vertical lines at once - the whiskers and the median
    var verticalLineConfigs = [
      // Top whisker
      {
        x1: function(datum) {
          return x_h(datum.whiskers[0])

        },
        y1: function(datum) {
          return y(datum.game)
        },
        x2: function(datum) {
          return x_h(datum.whiskers[0])

        },
        y2: function(datum) {
          return y(datum.game) + barWidth
        }
      },
      // Median line
      {
        x1: function(datum) {
          return x_h(datum.quartile[1])
        },
        y1: function(datum) {
          return y(datum.game)
        },
        x2: function(datum) {
          return x_h(datum.quartile[1])
        },
        y2: function(datum) {
          return y(datum.game) + barWidth
        }
      },
      // Bottom whisker
      {
        x1: function(datum) {
          return x_h(datum.whiskers[1])
        },
        y1: function(datum) {
          return y(datum.game)
        },
        x2: function(datum) {
          return x_h(datum.whiskers[1])
        },
        y2: function(datum) {
          return y(datum.game) + barWidth
        }
      }
    ];

    for (var i = 0; i < verticalLineConfigs.length; i++) {
      var lineConfig = verticalLineConfigs[i];

      // Draw the whiskers at the min for this series
      var verticalLine = box_g.selectAll(".whiskers")
        .data(this.ath_info_data[info])
        .enter()
        .append("line")
        .attr("x1", lineConfig.x1)
        .attr("y1", lineConfig.y1)
        .attr("x2", lineConfig.x2)
        .attr("y2", lineConfig.y2)
        .attr("stroke", this.color_chart[this.gender][0])
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("class", function(datum) {
          return (datum.game).replace(/\s/g , "-");
        });
    }

    //render the boxplot
    d3.selectAll(".age").attr("transform", "translate(" + (margin + 25 + 2 * wid) + ",0)");
    d3.selectAll(".agetext").attr("transform", "translate(" + (2 * textwid) + ",0)");
    d3.selectAll(".ageaxis").attr("transform", "translate(" + (margin + 25 + 2 * wid) + ",600)");
    d3.selectAll(".weight").attr("transform", "translate(" + (margin + 15 + wid) + ",0)");
    d3.selectAll(".weighttext").attr("transform", "translate(" + textwid + ",0)");
    d3.selectAll(".weightaxis").attr("transform", "translate(" + (margin + 15 + wid) + ",600)");

  }

  //take the input
  inputLine(age, height, weight) {
    //First, judge the input scope if in the scope (whisker[0],whisker[1]), show the lines
    //else if show the only line in scope and didnt recommend any games
    //else unfortunately tell them they're not fit for the Olympics anymore
    var thisvis = this;
    var proper_games = [];
    var input = {
      0: height,
      1: weight,
      2: age
    };
    var trans = {
      0: (this.margin + 5),
      1: (this.margin + 5 + (this.chart_w - this.margin - 5) / 3),
      2: (this.margin + 25 + 2 * ((this.chart_w - this.margin - 32) / 3))
    };

    for (var i in input) {
      //console.log("input i", input[i]);
      var [min, max] = this.get_min_max(i);
      //console.log("min max", min, max);
      if (input[i] <= max && input[i] >= min) {
        //input in range
        proper_games[i] = this.ath_info_data[i].filter(function(d) {
          return (d.quartile[0] <= input[i] && d.quartile[2] >= input[i]);
        }).map(function(d) {
          return d.game;
        });
        //console.log("games", proper_games[i]);
        //map the game to the boxplot
        for (var game in proper_games[i]) {
          var game_class = "." + this.game_chart[i] + " ." + proper_games[i][game];
          console.log(game_class);
          //console.log(d3.selectAll(game_class));
          d3.selectAll(game_class)
            .style("fill", "#74B46F")
            .style("stroke", "#177410");
        }
        //draw the line fit of the value
        var scale_x = this.x_scale(min, max);
        //console.log(scale_x(input[i]));
        this.svg.append("line")
          .attr("x1", scale_x(input[i]))
          .attr("x2", scale_x(input[i]))
          .attr("y1", 0)
          .attr("y2", 600)
          .attr("transform", "translate(" + trans[i] + ")")
          .style("stroke", "#177410")
          .style("stroke-width", "1.5px")
          .style("stroke-dasharray", "2,2");
      }

    }

    // Display the result based on user input
    var result = proper_games.shift().reduce(function(res, v) {
      if (res.indexOf(v) === -1 && proper_games.every(function(a) {
        return a.indexOf(v) !== -1;
    })) res.push(v);
    return res;}, []);
    // console.log("final result", result);
    var result_info = "You can try: ";
    for(var i in result)
       result_info += result[i] + " ";
    $("#result-info").text(result_info);
  }
}
