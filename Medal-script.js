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

  var svg = d3.select("#medal-chart")
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", 450)
                  .style("padding-top", "100px")
                  .style("margin-top", "20px")
                  .append('g')
                  .attr('class', 'map');

  var path = d3.geoPath();

  var projection = d3.geoMercator()
      .scale(130);

  path = d3.geoPath().projection(projection);

    console.log(country_data.features.id)

    svg.append("g")
        .attr("class", "countries").selectAll("path").data(country_data.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "#d4d4d4")
        .style("opacity",0.6)
        .on('mouseover',function(d){
            d3.select(this)
              .style("opacity", 1.0)
              .style("stroke","white")
              .style("stroke-width",2);
            })
        .on('mouseout', function(d){
            d3.select(this)
              .style("opacity", 0.6)
              .style("stroke","white")
              .style("stroke-width", 0);
});


    svg.append("path")
        .datum(topojson.mesh(country_data.features, function(a, b) { return a.id !== b.id; }))
        // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);

}
