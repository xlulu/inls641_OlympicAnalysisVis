$(document).ready(() => {
  games = ["Football", "Handball", "Water Polo", "Hockey", "Baseball", "Volleyball", "Tennis", "Badminton", "Beach Volleyball", "Table Tennis",
    "Gymnastics", "Rhythmic Gymnastics", "Trampolining", "Synchronized Swimming", "Diving", "Equestrianism",
    "Fencing", "Wrestling", "Judo", "Boxing", "Taekwondo", "Weightlifting",
    "Shooting", "Archery",
    "Swimming", "Athletics", "Cycling", "Modern Pentathlon", "Triathlon", "Canoeing", "Rowing", "Sailing"
  ];

  show_map();
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
    show_map();
  });
  $(".tog-number").click(function() {
    $(this).toggleClass("down");
    $(".tog-location").toggleClass("down", false);
    $("#medal-chart").children().remove();
    // call function to draw chart by number
  });
});

function show_map(){
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/world_countries.json")
    .defer(d3.csv, "https://raw.githubusercontent.com/xlulu/inls641_OlympicAnalysisVis/master/data/medal_board_data.csv")
    .await(show_medals);
}

function show_medals (error, country_data, medal_data) {

  var chart_w = $("#medal-chart").width();
  console.log(chart_w);

  var svg = d3.select("#medal-chart")
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", 600)
                  .style("margin-top", "20px");

  var path = d3.geoPath();

  var projection = d3.geoMercator()
      .scale(chart_w / 2 / Math.PI)
      .translate([chart_w / 2, 800 / 2]);

  path = d3.geoPath().projection(projection);



  // Tool tip for showing the state when mouse over the point
  var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d){
      return d.properties.name+": "+d.medal_count;
    });
  tool_tip(svg);

  count_medals(country_data, medal_data);

  var min_medals = d3.min(country_data.features, function(d){ return d.medal_count;});
  var max_medals = d3.max(country_data.features, function(d){ return d.medal_count;});
  console.log(min_medals, max_medals);


  var radius = d3.scaleLinear()
      .domain([0, max_medals])
      .range([0, 30]);


  svg.append("g")
        .attr("class", "countries")
        .attr("width", "100%")
        .attr("height", 450)
        .style("margin-top", "20px")
        .selectAll("path").data(country_data.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "#d4d4d4")
        .style("opacity",0.6)
        .on('mouseover',function(d){
            if(d.medal_count){
              tool_tip.show(d);}
            d3.select(this)
              .style("opacity", 1.0)
              .style("stroke","white")
              .style("stroke-width",2);
            })
        .on('mouseout', function(d){
          if(d.medal_count){
            tool_tip.hide(d);}
            d3.select(this)
              .style("opacity", 0.6)
              .style("stroke","white")
              .style("stroke-width", 0);
        });

    svg.append("g")
        .attr("class", "bubble")
      .selectAll("circle")
        .data(country_data.features)
      .enter().append("circle")
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("r", function(d) { return radius(d.medal_count); })
        .style("fill", "#2ecc71");

}

function count_medals(country_data, medal_data){
  var medal_count_by_ctry = {};

  medal_data.forEach(function(d) {

      if(d.Year == "2008"){
        if(!medal_count_by_ctry[d.NOC])
              medal_count_by_ctry[d.NOC] = 0;

        medal_count_by_ctry[d.NOC]++;
      }});

  country_data.features.forEach(function(d) {
    if(medal_count_by_ctry[d.id])
      d.medal_count = medal_count_by_ctry[d.id];
    else
      d.medal_count = 0;
    });
}
