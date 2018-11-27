$(document).ready(() => {
      //collapse the personal input

      // $('#arrow').toggleClass('fa-rotate-180');
      // $(this).find($(".fa")).removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
      $(function() {
          $(".collapse").hide();
          $("#arrow").click(function(e){
            if ($(e.currentTarget).children().hasClass('fa-chevron-circle-down')) {
              $(e.currentTarget).children().removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
              $(".collapse").show();
            } else{
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
          console.log("age: " + age);
          console.log("height: " + height);
          console.log("weight: " + weight);
          console.log("sex: " + sex);
          // call function to write the filter and give result
            athelete_vis.calculateData(sex);
            athelete_vis.inputLine(age, height, weight, sex);
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
        this.color_chart = {
          'All': ["#177410", "#74B46F"],
          'F': ["#BC4454", "#E0707E"],
          'M': ["#155F9F", "#67A1D3"]
        };
        this.ath_info_data = {};

        // Get a reference to the SVG element.
        this.svg = d3.select("#athelete-chart")
          .append("svg")
          .attr("id", "box-svg")
          .attr("width", "100%")
          .attr("height", 650)
          .style("margin-top", "10px")
            // .on("mousemove", function(d) {
            //     let mouse_coords = d3.mouse(this);
            //     console.log(mouse_coords[1]);
            //     svg.selectAll(".highlight_box")
            //         .attr("y", mouse_coords[1]);
            // })
            // .on("mouseout", function(d) {
            //     svg.selectAll(".vertical_line")
            //         .attr("y", -100);
            // })
        ;


          // this.svg.select(#box_svg).append("rect")
          //     .attr("class", "highlight_box")
          //     .attr("x", 0)
          //     .attr("y", -100)
          //     .attr("height", 10)
          //     .attr("width", 620)
          //     .style("stroke", "black")
          //     .style("stroke-width", 4)
          //     .style("fill", "gray")
          //     .style("opacity", 30);




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
        var textwid = (this.chart_w - margin) / 3 - 8;

        console.log(wid);
        // Define X scales for height
        var x_h = d3.scaleLinear()
          .domain([min_h - 1, max_h + 1])
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
          .attr("class", this.game_chart[info])
            // .on("mousemove", function(d) {
            //     let mouse_coords = d3.mouse(this);
            //     console.log(mouse_coords[1]);
            //     svg.selectAll(".highlight_box")
            //         .attr("y", mouse_coords[1]);
            // })
            // .on("mouseout", function(d) {
            //     svg.selectAll(".vertical_line")
            //         .attr("y", -100);
            // })
        ;




            // .on("mousemove", function(d) {
          //     let mouse_coords = d3.mouse(this);
          //     box_g.selectAll(".vertical_line")
          //         .attr("x1", mouse_coords[0])
          //         .attr("x2", mouse_coords[0]);
          //     console.log(mouse_coords[0]); // ??? I can show the coords but cant move the line???
          // })
          //   .on("mouseout", function(d) {
          //         box_g.selectAll(".vertical_line")
          //             .attr("x1", -100)   //-100 are inc
          //             .attr("x2", -100);
          //     })


          // Vertical line to show the values
          // box_g.append("line")
          //     .attr("class", "vertical_line")
          //     .attr("x1", -100)
          //     .attr("x2", -100)
          //     .attr("y1", 0)
          //     .attr("y2", 620)
          //     .style("stroke", "black")
          //     .style("stroke-width", 4); // multiple lines?

          // // this.svg.select(#box_svg).
          // box_g.append("rect")
          //     .attr("class", "highlight_box")
          //     .attr("x", 0)
          //     .attr("y", -100)
          //     .attr("height", 10)
          //     .attr("width", 620)
          //     .style("stroke", "black")
          //     .style("stroke-width", 4)
          //     .style("fill", "gray")
          //     .style("opacity", 30);


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
          .attr("stroke", this.color_chart[this.gender][0])
          .attr("stroke-width", 1)
          .attr("fill", this.color_chart[this.gender][1]);

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
              // .on("mousemove", function(d) {
                  //     let mouse_coords = d3.mouse(this);
                  //     box_g.selectAll(".vertical_line")
                  //         .attr("x1", mouse_coords[0])
                  //         .attr("x2", mouse_coords[0]);
                  //     console.log(mouse_coords[0]); // ??? I can show the coords but cant move the line???
                  // })
                  //   .on("mouseout", function(d) {
                  //         box_g.selectAll(".vertical_line")
                  //             .attr("x1", -100)   //-100 are inc
                  //             .attr("x2", -100);
                  //     })

          ;


            // // Vertical line to show the values
            // this.svg.append("line")
            //     .attr("class", "vertical_line")
            //     .attr("x1", -100)
            //     .attr("x2", -100)
            //     .attr("y1", 0)
            //     .attr("y2", 620)
            //     .style("stroke", "black")
            //     .style("stroke-width", 70);

        }

        //render the boxplot
        d3.selectAll(".age").attr("transform", "translate(" + (margin + 30 + 2 * wid) + ",0)");
        d3.selectAll(".agetext").attr("transform", "translate(" + (2 * textwid) + ",0)");
        d3.selectAll(".ageaxis").attr("transform", "translate(" + (margin + 30 + 2 * wid) + ",600)");
        d3.selectAll(".weight").attr("transform", "translate(" + (margin + 15 + wid) + ",0)");
        d3.selectAll(".weighttext").attr("transform", "translate(" + textwid + ",0)");
        d3.selectAll(".weightaxis").attr("transform", "translate(" + (margin + 15 + wid) + ",600)");

      }


        // x_h(data){
        //     var thisvis = this;
        //
        //     var min_h = d3.min(this.athelete_data, function(d) {
        //         return parseInt(d.Height);
        //     });
        //     var max_h = d3.max(this.athelete_data, function(d) {
        //         return parseInt(d.Height);
        //     });
        //
        //     var x = d3.scaleLinear()
        //         .domain([min_h - 1, max_h + 1])
        //         .range([0, (this.chart_w - margin - 5) / 3 - 10]);
        //     return x(data);
        //
        //
        // }
        // set x linear func for input weight
        // x_w(data){
        //     var thisvis = this;
        //     var min_w = d3.min(this.athelete_data, function(d) {
        //         return parseInt(d.Weight);
        //     });
        //     var max_w = d3.max(this.athelete_data, function(d) {
        //         return parseInt(d.Weight);
        //     });
        //     var x = d3.scaleLinear()
        //         .domain([min_w - 1, max_w + 1])
        //         .range([0, (this.chart_w - margin - 5) / 3 - 10]);
        //     //.range([(this.chart_w - margin) / 3, 2 * (this.chart_w - margin) / 3]);
        //     return x(data);
        // }
        // // set x linear func for input age
        // x_a(data){
        //     var thisvis = this;
        //     var min_a = d3.min(this.athelete_data, function(d) {
        //         return parseInt(d.Age);
        //     });
        //     var max_a = d3.max(this.athelete_data, function(d) {
        //         return parseInt(d.Age);
        //     });
        //     var x = d3.scaleLinear()
        //         .domain([min_a, max_a])
        //         .range([0, (this.chart_w - margin - 5) / 3 - 10]);
        //     //.range([2 * (this.chart_w - margin) / 3, this.chart_w - margin]);
        //     return x(data);
        // }



        // // set x linear func for input height
        // still need to change the data for F and M
        inputLine(age, height, weight, sex) {
            var thisvis = this;
            var show_data = this.athelete_data.filter(function(d) {
                return d.Sex == sex;});

            var min_h = d3.min(show_data, function(d) {
                return parseInt(d.Height);
            });
            var max_h = d3.max(show_data, function(d) {
                return parseInt(d.Height);
            });

            var x_h = d3.scaleLinear()
                .domain([min_h - 1, max_h + 1])
                .range([0, (this.chart_w - margin - 5) / 3 - 10]);

            var min_w = d3.min(show_data, function(d) {
                return parseInt(d.Weight);
            });
            var max_w = d3.max(show_data, function(d) {
                return parseInt(d.Weight);
            });
            var x_w = d3.scaleLinear()
                .domain([min_w - 1, max_w + 1])
                .range([0, (this.chart_w - margin - 5) / 3 - 10]);

            var min_a = d3.min(show_data, function(d) {
                return parseInt(d.Age);
            });
            var max_a = d3.max(show_data, function(d) {
                return parseInt(d.Age);
            });
            var x_a = d3.scaleLinear()
                .domain([min_a, max_a])
                .range([0, (this.chart_w - margin - 5) / 3 - 10]);

            // line for input height
            this.svg.append("line")
                .attr("x1", x_h(height))
                .attr("x2", x_h(height))
                .attr("y1", 0)
                .attr("y2", 620)
                .attr("transform", "translate(" + (margin+ 5) + ")")
                .style("stroke", "gold")
                .style("stroke-width", 3)
                .style("stroke-dasharray", "4,4");

            //line for input weight
            this.svg.append("line")
                .attr("x1", x_w(weight))
                .attr("x2", x_w(weight))
                .attr("y1", 0)
                .attr("y2", 620)
                .attr("transform", "translate(" + (margin+5+(this.chart_w-margin-5)/3) + ")")
            //d3.selectAll(".weightaxis").attr("transform", "translate(" + (margin + 15 + wid) + ",600)");
                .style("stroke", "gold")
                .style("stroke-width", 3)
                .style("stroke-dasharray", "4,4");

            //line for input age
            this.svg.append("line")
                .attr("x1", x_a(age))
                .attr("x2", x_a(age))
                .attr("y1", 0)
                .attr("y2", 620)
                .attr("transform", "translate(" + (margin + 30 + 2 * ((this.chart_w - margin - 32) / 3)) + ")")
                // .attr("transform", "translate(" + (margin+5+2*(this.chart_w-margin-5)/3) + ")")
                .style("stroke", "gold")
                .style("stroke-width", 3)
                .style("stroke-dasharray", "4,4");

            console.log("line printed!")
        }


    }
