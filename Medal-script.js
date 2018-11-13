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
    .await(function(error, country_data, medal_data){
      medal_vis_location = new MedalVis_Location(country_data, medal_data);
      medal_vis_location.show_medals_default();
    });

  //add list into the game drop-down menu
  for (i in games) {
    var game_to_add = "<option value= '" + games[i] + "'>" + games[i] + "</option>";
    $("#games-all").after(game_to_add);
  }
  //Listen the toggle clicking
  $(".tog-location").click(function() {
    $(this).toggleClass("down");
    $(".tog-number").toggleClass("down", false);
    $("#medal-chart").children().remove();
    // call function to draw chart by location
    d3.queue()
      .defer(d3.json, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/world_countries.json")
      .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/medal_board_data.csv")
      .await(function(error, country_data, medal_data){
        medal_vis_location = new MedalVis_Location(country_data, medal_data);
        medal_vis_location.show_medals_default();
      });
  });
  $(".tog-number").click(function() {
    $(this).toggleClass("down");
    $(".tog-location").toggleClass("down", false);
    $("#medal-chart").children().remove();
    // call function to draw chart by number
  });
});

// function show_map(){
//   d3.queue()
//     .defer(d3.json, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/world_countries.json")
//     .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/medal_board_data.csv")
//     .await(show_medals);
// }
//
// function show_medals (error, country_data, medal_data) {
//
//   var chart_w = $("#medal-chart").width();
//   var svg = d3.select("#medal-chart")
//                   .append("svg")
//                   .attr("width", "100%")
//                   .attr("height", 600)
//                   .style("margin-top", "20px");
//
//   var path = d3.geoPath();
//
//   var projection = d3.geoMercator()
//       .scale(chart_w / 2 / Math.PI)
//       .translate([chart_w / 2, 800 / 2]);
//
//   path = d3.geoPath().projection(projection);
//
//   // Tool tip for showing the state when mouse over the point
//   var tool_tip = d3.tip()
//     .attr("class", "d3-tip")
//     .offset([-8, 0])
//     .html(function(d){
//       return d.properties.name+": "+d.medal_count;
//     });
//   tool_tip(svg);
//
//   count_medals(country_data, data_filter(medal_data));
//
//   var min_medals = d3.min(country_data.features, function(d){ return d.medal_count;});
//   var max_medals = d3.max(country_data.features, function(d){ return d.medal_count;});
//   console.log(min_medals, max_medals);
//
//
//   var radius = d3.scaleLinear()
//       .domain([0, max_medals])
//       .range([0, 40]);
//
//
//   svg.append("g")
//         .attr("class", "countries")
//         .attr("width", "100%")
//         .attr("height", 450)
//         .style("margin-top", "20px")
//         .selectAll("path").data(country_data.features)
//         .enter().append("path")
//         .attr("d", path)
//         .attr("id", function(d){ return d.id;})
//         .style("fill", "#d4d4d4")
//         .style("opacity",0.6);
//
//     svg.append("g")
//         .attr("class", "bubble")
//       .selectAll("circle")
//         .data(country_data.features)
//       .enter().append("circle")
//         .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
//         .attr("r", function(d) { return radius(d.medal_count); })
//         .style("fill", "#2ecc71")
//         .on('mouseover',function(d){
//             if(d.medal_count){
//               tool_tip.show(d);}
//             d3.select("#"+d.id)
//               .style("opacity", 1.0)
//               .style("stroke","white")
//               .style("stroke-width",2);
//             })
//         .on('mouseout', function(d){
//           if(d.medal_count){
//             tool_tip.hide(d);}
//             d3.select("#"+d.id)
//               .style("opacity", 0.6)
//               .style("stroke","white")
//               .style("stroke-width", 0);
//         });
//
// }
//
// function count_medals(country_data, medal_data){
//   var medal_count_by_ctry = {};
//
//   medal_data.forEach(function(d) {
//
//       if(d.Year == "2008"){
//         if(!medal_count_by_ctry[d.NOC])
//               medal_count_by_ctry[d.NOC] = 0;
//
//         medal_count_by_ctry[d.NOC]++;
//       }});
//
//   country_data.features.forEach(function(d) {
//     if(medal_count_by_ctry[d.id])
//       d.medal_count = medal_count_by_ctry[d.id];
//     else
//       d.medal_count = 0;
//     });
// }
//
// function data_filter(medal_data){
//   var medal, game = dataFilter();
//   if (medal == "All" && game == "All")
//     return medal_data;
//   else if (medal == "All")
//     return medal_data.filter(function(d){ return d.Sport == game;});
//   else if (game == "All")
//     return medal_data.filter(function(d){ return d.Medal == medal;});
//   else
//     return medal_data.filter(function(d){ return (d.Medal == medal && d.Sport == game);});
// }
//
// function dataFilter(){
//   var medal_options = document.getElementById("medal-options");
//   var medal = medal_options.options[medal_options.selectedIndex].text;
//   var game_options = document.getElementById("game-options");
//   var game = game_options.options[game_options.selectedIndex].text;
//   return medal, game;
// }

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
                          .html(function(d){
                              var top5_html = "<table><tr><td align=\"center\">" + d.properties.name + ": " + d.medal_count + "</td></tr>";
                              var medals_kind = thisvis.count_medals_kind(d.id);
                              top5_html += "<tr><td><span class=\"golddot\"></span> " + medals_kind["Gold"];
                              top5_html += "<span class=\"silverdot\"></span> " + medals_kind["Silver"];
                              top5_html += "<span class=\"bronzedot\"></span> " + medals_kind["Bronze"] + "</td></tr>";

                              var sorted_sport = thisvis.count_top_5(d.id);

                              for (var i = 0; i < (sorted_sport.length < 5 ? sorted_sport.length : 5); i++){
                                  var order = i+1;
                                  top5_html += "<tr><td>#" + order +" "+ sorted_sport[i][0] + ":</td><td>" + sorted_sport[i][1] + "</td></tr>";
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
    count_medals(medal_data_year){
      var medal_count_by_ctry = {};

      medal_data_year.forEach(function(d) {
            if(!medal_count_by_ctry[d.NOC])
                  medal_count_by_ctry[d.NOC] = 0;
            medal_count_by_ctry[d.NOC]++;
          });

      this.country_data.features.forEach(function(d) {
        if(medal_count_by_ctry[d.id])
          d.medal_count = medal_count_by_ctry[d.id];
        else
          d.medal_count = 0;
        });
    }

    // Count medals for specific kind (gold, silver and bronze)
    count_medals_kind(country_id){
      var thisvis = this;
      var medals_kind = {};
      var medal_data_year = this.medal_data.filter(function(d){ return d.Year == thisvis.year;});
      var country_medal_data = medal_data_year.filter(function(d){ return (d.NOC == country_id);});
      country_medal_data.forEach(function(d){
        if(!medals_kind[d.Medal])
              medals_kind[d.Medal] = 0;
        medals_kind[d.Medal]++;
      });
      return medals_kind;
    }

    // Count top-5 sports for each country
    count_top_5(country_id){
      var sport_medals = {};
      var sortable = [];
      var thisvis = this;
      var medal_data_year = this.medal_data.filter(function(d){ return d.Year == thisvis.year;});
      var country_medal_data = medal_data_year.filter(function(d){ return (d.NOC == country_id);});
      country_medal_data.forEach(function(d){
        if(!sport_medals[d.Sport])
              sport_medals[d.Sport] = 0;
        sport_medals[d.Sport]++;
      });

      for (var sport in sport_medals)
            sortable.push([sport, sport_medals[sport]]);

      sortable.sort(function(sport_a, sport_b){ return sport_b[1] - sport_a[1];});
      return sortable;
    }

    // Filter the data based on user's choices
    data_filter(){
      var thisvis = this;
      var medal_data_year = this.medal_data.filter(function(d){ return d.Year == thisvis.year;});
      if (this.medal == "All" && this.game == "All")
        return medal_data_year;
      else if (this.medal == "All")
        return medal_data_year.filter(function(d){ return d.Sport == thisvis.game;});
      else if (this.game == "All")
        return medal_data_year.filter(function(d){ return d.Medal == thisvis.medal;});
      else
        return medal_data_year.filter(function(d){ return (d.Medal == thisvis.medal && d.Sport == thisvis.game);});
    }

    // Show bubbles on the world map in default mode (All, All)
    show_medals_default(){

        var thisvis = this;
        var chart_w = $("#medal-chart").width();

        var path = d3.geoPath();

        var projection = d3.geoMercator()
            .scale(chart_w / 2 / Math.PI)
            .translate([chart_w / 2, 800 / 2]);

        path = d3.geoPath().projection(projection);

        this.tool_tip(this.svg);

        this.count_medals(this.medal_data.filter(function(d){ return d.Year == "1904";}));

        this.svg.append("g")
              .attr("class", "countries")
              .attr("width", "100%")
              .attr("height", 450)
              .style("margin-top", "20px")
              .selectAll("path").data(this.country_data.features)
              .enter().append("path")
              .attr("d", path)
              .attr("id", function(d){ return d.id;})
              .style("fill", "#d4d4d4")
              .style("opacity",0.6);

        this.svg.append("g")
                .attr("class", "bubble")
              .selectAll("circle")
                .data(this.country_data.features)
              .enter().append("circle")
                .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
                .attr("r", function(d) { return thisvis.radius(d.medal_count); })
                .style("fill", "#2ecc71")
                .on('mouseover',function(d){
                    if(d.medal_count){
                      thisvis.tool_tip.show(d);}
                    d3.select("#"+d.id)
                      .style("opacity", 1.0)
                      .style("stroke","white")
                      .style("stroke-width",2);
                    d3.select(this).style("opacity", 0.6);
                    })
                .on('mouseout', function(d){
                  if(d.medal_count){
                    thisvis.tool_tip.hide(d);}
                    d3.select("#"+d.id)
                      .style("opacity", 0.6)
                      .style("stroke","white")
                      .style("stroke-width", 0);
                    d3.select(this).style("opacity", 1);
                });
    }

    // Change bubble size based on user's choices
    show_medals_changes() {
        var thisvis = this;
        this.count_medals(this.data_filter());
        var changed_tool_tip = this.tool_tip;

        if(!(this.medal == "All" && this.game == "All"))
        {
            var changed_tool_tip = d3.tip()
                                     .attr("class", "d3-tip")
                                     .offset([-8, 0])
                                     .html(function(d){
                                          return d.properties.name + ": " + d.medal_count;
                                       });
        }
        changed_tool_tip(this.svg);

        this.svg.selectAll("circle")
          .data(this.country_data.features)
                          .attr("r", function(d) { return thisvis.radius(d.medal_count); })
                          .on('mouseover',function(d){
                              if(d.medal_count){
                                changed_tool_tip.show(d);}
                              d3.select("#"+d.id)
                                .style("opacity", 1.0)
                                .style("stroke","white")
                                .style("stroke-width",2);
                              d3.select(this).style("opacity", 0.6);
                              })
                          .on('mouseout', function(d){
                            if(d.medal_count){
                              changed_tool_tip.hide(d);}
                              d3.select("#"+d.id)
                                .style("opacity", 0.6)
                                .style("stroke","white")
                                .style("stroke-width", 0);
                              d3.select(this).style("opacity", 1);
                          });;
    }
}
