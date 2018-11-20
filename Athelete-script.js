$(document).ready(() => {

  //Listen the toggle button served for the chart
  //All athelete(default)
  $(".tog-sex").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-female").toggleClass("clicked", false);
    $(".tog-male").toggleClass("clicked", false);
    $("#athelete-chart").children().remove();
    // call function to draw chart with ALL athelete data
  });

  //Female athelete
  $(".tog-female").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-male").toggleClass("clicked", false);
    $("#athelete-chart").children().remove();
    // call function to draw chart with FEMALE athelete data

  });

  //Male athelete
  $(".tog-male").click(function() {
    $(this).toggleClass("clicked");
    $(".tog-sex").toggleClass("clicked", false);
    $(".tog-female").toggleClass("clicked", false);
    $("#athelete-chart").children().remove();
    // call function to draw chart with MALE athelete data

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
  $(".see-result").click(function(){
    if($(".toggle-female").hasClass("down")){
      sex = "F";
    }else{
      sex = "M";
    }
    age = Number($('#age-input').val());
    height = Number($('#height-input').val());
    weight = Number($('#weight-input').val());
    console.log("age: "+age);
    console.log("height: "+height);
    console.log("weight: "+weight);
    console.log("sex: "+sex);
    // call function to write the filter and give result

  });






});
