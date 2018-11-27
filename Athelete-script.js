$(document).ready(() => {
  d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/athlete_board_data.csv")
    .await(function(error, athelete_data) {
      var gender = 'All';
      athelete_vis = new AtheleteVis(athelete_data);
      // athelete_vis.calculateHeightData(gender);
      athelete_vis.calculateData(gender);
      // athelete_vis.show_athelete_default();
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
    // athelete_vis.calculateHeightData(gender);
    //athelete_vis.show_athelete_default();
    athelete_vis.calculateData(gender);
  });

  //Female athelete
  $(".tog-female").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-male").toggleClass("clicked", false);
    $("#box-svg").children().remove();
    // call function to draw chart with FEMALE athelete data
    var gender = 'F';
    // athelete_vis.calculateHeightData(gender);
    //athelete_vis.show_athelete_default();
    athelete_vis.calculateData(gender);

  });

  //Male athelete
  $(".tog-male").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-female").toggleClass("clicked", false);
    $("#box-svg").children().remove();
    // call function to draw chart with MALE athelete data
    var gender = 'M';
    // athelete_vis.calculateHeightData(gender);
    //athelete_vis.show_athelete_default();
    athelete_vis.calculateData(gender);

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
    if ($(".toggle-female").hasClass("down")) {
      sex = "F";
    } else {
      sex = "M";
    }
    age = Number($('#age-input').val());
    height = Number($('#height-input').val());
    weight = Number($('#weight-input').val());
    console.log("age: " + age);
    console.log("height: " + height);
    console.log("weight: " + weight);
    console.log("sex: " + sex);
    // call function to write the filter and give result

  });

});

const margin = 100;

class AtheleteVis {
  //reference: https://blog.datasyndrome.com/a-simple-box-plot-in-d3-dot-js-44e7083c9a9e
  constructor(athelete_data) {
    this.athelete_data = athelete_data;
    this.gender = "All";
    this.chart_w = $("#athelete-chart").width();
    var thisvis = this;
    //get all the games name
    this.games_data = d3.set(this.athelete_data.map(function(d) {
        return d.Sport;
      }))
      .values()
      .sort();
    console.log(this.games_data);

    this.game_chart = {
      0: "Height",
      1: "Weight",
      2: "Age"
    };
    this.ath_info_data = {};

    // Get a reference to the SVG element.
    this.svg = d3.select("#athelete-chart")
      .append("svg")
      .attr("id", "box-svg")
      .attr("width", "100%")
      .attr("height", 650)
      .style("margin-top", "20px");
    // .style("background-color", "#000000");

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


  // // Tackle the data set
  // calculateHeightData(g) {
  //   this.height_data = [];
  //   var thisvis = this;
  //   var gender_data = this.setGender(g);
  //   //filter the data
  //   console.log(this.games_data);
  //   for (var i in this.games_data) {
  //     var game = this.games_data[i];
  //     var filtered_data = gender_data.filter(function(d) {
  //       return d.Sport == game;
  //     });
  //     //Get the height data via games
  //     var filtered_height = filtered_data.map(function(d) {
  //       return d.Height;
  //     });
  //     filtered_height = filtered_height.sort(this.sortNumber);
  //     var record = {};
  //     var localMin = d3.min(filtered_height);
  //     var localMax = d3.max(filtered_height);
  //     record["game"] = game;
  //     record["height"] = filtered_height;
  //     record["quartile"] = this.boxQuartiles(filtered_height);
  //     record["whiskers"] = [localMin, localMax];
  //     this.height_data.push(record);
  //   }
  //   //console.log(this.height_data);
  //   this.show_athelete_default(gender_data);
  // }

  // Tackle the data set
  calculateData(g) {
    this.ath_info_data[0] = [];
    this.ath_info_data[1] = [];
    this.ath_info_data[2] = [];
    var thisvis = this;
    var gender_data = this.setGender(g);
    //filter the data
    console.log(this.games_data);
    for (var i in this.games_data) {
      var game = this.games_data[i];
      var filtered_data = gender_data.filter(function(d) {
        return d.Sport == game;
      });
      //Get the height data via games
      var filtered_hwa = {};
      filtered_hwa[0] = filtered_data.map(function(d) {
        return d.Height;
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
    console.log(this.ath_info_data);
    this.show_athelete_default(gender_data, 0);
    this.show_athelete_default(gender_data, 1);
    this.show_athelete_default(gender_data, 2);
  }


  // Callback for changing the gender.
  setGender(new_gender) {
    var thisvis = this;
    this.gender = new_gender;
    // this.show_athelete_changes();
    if (new_gender == 'All') {
      return this.athelete_data;
    } else {
      return this.athelete_data.filter(function(d) {
        return d.Sex == thisvis.gender;
      });
    }
  }

  // Show boxplot in default mode (All sex)
  show_athelete_default(athelete_gen_data, info) {
    console.log("in!");
    // //remove the previous one
    // this.svg.selectAll("g").remove();
    var thisvis = this;
    var margin = 100;
    var min_h = d3.min(this.ath_info_data[info], function(d) {
      return d.whiskers[0];
    });
    var max_h = d3.max(this.ath_info_data[info], function(d) {
      return d.whiskers[1];
    });

    var wid = (this.chart_w - margin - 32) / 3;
    var textwid = (this.chart_w - margin) / 3- 8;

    console.log(wid);
    // Define X scales for height
    var x_h = d3.scaleLinear()
      .domain([min_h, max_h])
      .range([0, wid]);
    var x_axis = d3.axisBottom().scale(x_h);

    // Define y scales
    var y = d3.scalePoint()
      .domain(this.games_data)
      .range([0, 580]);

    var y_axis = d3.axisLeft().scale(y);

    // Add axes.
    //First the Y axis and label.
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
      .style("font-family","'Yanone Kaffeesatz', sans-serif")
      .style("font-weight","300")
      .style("font-size","14px");

    // Then the Y axis.
    this.svg.append("g")
      .attr("class", "a_a_axis")
      .attr("transform", "translate(" + margin + ",5)")
      .call(y_axis)
      .selectAll("text")
      .style("font-family","'Yanone Kaffeesatz', sans-serif")
      .style("font-weight","300")
      .style("font-size","11px");

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
        console.log(whisker);
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
      .attr("stroke", "#177410")
      .attr("stroke-width", 1)
      .attr("fill", "none");


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
      .attr("stroke", "#177410")
      .attr("stroke-width", 1)
      .attr("fill", "#74B46F");

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
        .attr("stroke", "#177410")
        .attr("stroke-width", 1)
        .attr("fill", "none");
    }

    //render the boxplot
    d3.selectAll(".age").attr("transform", "translate(" + (margin + 30 + 2 * wid) + ",0)");
    d3.selectAll(".agetext").attr("transform", "translate(" + (2 * textwid) + ",0)");
    d3.selectAll(".ageaxis").attr("transform", "translate(" + (margin +30 + 2 * wid) + ",600)");
    d3.selectAll(".weight").attr("transform", "translate(" + (margin + 15 + wid) + ",0)");
    d3.selectAll(".weighttext").attr("transform", "translate(" + textwid + ",0)");
    d3.selectAll(".weightaxis").attr("transform", "translate(" + (margin + 15 + wid) + ",600)");

    // inputLine(age, height, weight, sex) {
    //     // line for input height
    //     this.svg.append("line")
    //         .attr("x1", this.x_h(height))
    //         .attr("x2", this.x_h(height))
    //         .attr("y1", 0)
    //         .attr("y2", 620)
    //         .attr("transform", "translate(" + (margin+5) + ",")
    //         .style("stroke", "gold")
    //         .style("stroke-width", 3)
    //         .style("stroke-dasharray", "4,4");
    //
    //     //line for input weight
    //     this.svg.append("line")
    //         .attr("x1", this.x_w(weight))
    //         .attr("x2", this.x_w(weight))
    //         .attr("y1", 0)
    //         .attr("y2", 620)
    //         .attr("transform", "translate(" + (margin+5+(this.chart_w-margin-5)/3) + ")")
    //         .style("stroke", "gold")
    //         .style("stroke-width", 3)
    //         .style("stroke-dasharray", "4,4");
    //
    //     //line for input age
    //     this.svg.append("line")
    //         .attr("x1", this.x_a(age))
    //         .attr("x2", this.x_a(age))
    //         .attr("y1", 0)
    //         .attr("y2", 620)
    //         .attr("transform", "translate(" + (margin+5+2*(this.chart_w-margin-5)/3) + ")")
    //         .style("stroke", "gold")
    //         .style("stroke-width", 3)
    //         .style("stroke-dasharray", "4,4");
    //
    //     console.log("line printed!")
    // }

  }


  // // Show boxplot in default mode (All sex)
  // show_athelete_default(athelete_gen_data) {
  //   console.log("in!");
  //   // //remove the previous one
  //   // this.svg.selectAll("g").remove();
  //   var thisvis = this;
  //   var margin = 120;
  //   var min_h = d3.min(athelete_gen_data, function(d) {
  //     return d.Height;
  //   });
  //   var max_h = d3.max(athelete_gen_data, function(d) {
  //     return d.Height;
  //   });
  //
  //   // Define X scales for height
  //   var x_h = d3.scaleLinear()
  //     .domain([min_h, max_h])
  //     .range([0, (this.chart_w - margin) / 3]);
  //
  //   // Define y scales
  //   var y = d3.scalePoint()
  //     .domain(this.games_data)
  //     .range([0, 580]);
  //
  //   var y_axis = d3.axisLeft().scale(y);
  //
  //   // Add axes.
  //   //First the X axis and label.
  //   this.svg.append("g")
  //     .attr("class", "a_axis")
  //     .attr("transform", "translate(" + (margin+5) + ",600)")
  //     .call(d3.axisBottom(x_h));
  //
  //   this.svg.append("text")
  //     .attr("class", "a_axis-label")
  //     .attr("y", 630)
  //     .attr("x", (this.chart_w - margin) / 3 - 8)
  //     .style("text-anchor", "middle")
  //     .text("Height")
  //     .style("font-size", "10px");
  //
  //   // Then the Y axis.
  //   this.svg.append("g")
  //     .attr("class", "a_a_axis")
  //     .attr("transform", "translate(" + margin + ",5)")
  //     .call(y_axis);
  //
  //   // Trasfer the boxplot
  //   var box_g = this.svg.append("g")
  //     .attr("transform", "translate(" + (margin+5) + ",1.5)");
  //
  //
  //   // Draw the box plot horizontal lines
  //   var barWidth = 10;
  //   var verticalLines = box_g.selectAll(".horizontalLines")
  //     .data(this.height_data)
  //     .enter()
  //     .append("line")
  //     .attr("x1", function(datum) {
  //       var whisker = parseInt(datum.whiskers[0]);
  //       console.log(whisker);
  //       return x_h(whisker);
  //     })
  //     .attr("y1", function(datum) {
  //       return y(datum.game) + barWidth / 2;
  //     })
  //     .attr("x2", function(datum) {
  //       var whisker = parseInt(datum.whiskers[1]);
  //       return x_h(whisker);
  //     })
  //     .attr("y2", function(datum) {
  //       return y(datum.game) + barWidth / 2;
  //     })
  //     .attr("stroke", "#177410")
  //     .attr("stroke-width", 1)
  //     .attr("fill", "none");
  //
  //   // Draw the boxes of the box plot, filled in white and on top of vertical lines
  //   var rects = box_g.selectAll("rect")
  //     .data(this.height_data)
  //     .enter()
  //     .append("rect")
  //     .attr("height", barWidth)
  //     .attr("width", function(datum) {
  //       var quartiles = datum.quartile;
  //       var width = x_h(quartiles[2]) - x_h(quartiles[0]);
  //       return width;
  //     })
  //     .attr("x", function(datum) {
  //       return x_h(datum.quartile[0]);
  //     })
  //     .attr("y", function(datum) {
  //       return y(datum.game);
  //     })
  //     .attr("stroke", "#177410")
  //     .attr("stroke-width", 1)
  //     .attr("fill", "#74B46F");
  //
  //   // Now render all the vertical lines at once - the whiskers and the median
  //   var verticalLineConfigs = [
  //     // Top whisker
  //     {
  //       x1: function(datum) {
  //         return x_h(datum.whiskers[0])
  //
  //       },
  //       y1: function(datum) {
  //         return y(datum.game)
  //       },
  //       x2: function(datum) {
  //         return x_h(datum.whiskers[0])
  //
  //       },
  //       y2: function(datum) {
  //         return y(datum.game) + barWidth
  //       }
  //     },
  //     // Median line
  //     {
  //       x1: function(datum) {
  //         return x_h(datum.quartile[1])
  //       },
  //       y1: function(datum) {
  //         return y(datum.game)
  //       },
  //       x2: function(datum) {
  //         return x_h(datum.quartile[1])
  //       },
  //       y2: function(datum) {
  //         return y(datum.game) + barWidth
  //       }
  //     },
  //     // Bottom whisker
  //     {
  //       x1: function(datum) {
  //         return x_h(datum.whiskers[1])
  //       },
  //       y1: function(datum) {
  //         return y(datum.game)
  //       },
  //       x2: function(datum) {
  //         return x_h(datum.whiskers[1])
  //       },
  //       y2: function(datum) {
  //         return y(datum.game) + barWidth
  //       }
  //     }
  //   ];
  //
  //   for (var i = 0; i < verticalLineConfigs.length; i++) {
  //     var lineConfig = verticalLineConfigs[i];
  //
  //     // Draw the whiskers at the min for this series
  //     var verticalLine = box_g.selectAll(".whiskers")
  //       .data(this.height_data)
  //       .enter()
  //       .append("line")
  //       .attr("x1", lineConfig.x1)
  //       .attr("y1", lineConfig.y1)
  //       .attr("x2", lineConfig.x2)
  //       .attr("y2", lineConfig.y2)
  //       .attr("stroke", "#177410")
  //       .attr("stroke-width", 1)
  //       .attr("fill", "none");
  //   }
  //
  // }


}
