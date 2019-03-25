# Analysis of 120 years of Olympic Athletes and Results

This is a visual analytics system developed by YIWEN JIANG, YU YUAN, TIANLIN LAN and LU XU. This system aims to help users who are interested in the Olympic Games and want to know more about the history, trend of the sports and participants of the Olympic Games.

# Dataset
From Kaggle: 	https://www.kaggle.com/heesoo37/120-years-of-olympic-history-athletes-and-results

--Includes all the Games and Athletes information from Athens 1896 to Rio 2016. 

--We used Summer Olympics data only.

--Customized datasets for different visualizations.

          Athlete Board :  Only analyzed 32 games.
                           Removed empty rows
                           Removed non-continuous sports data



# Project URL

You can play with our system by using the following url:

https://opal.ils.unc.edu/~yiwen/OlympicAnalysisVis/Olympics-medal.html


# Medal Board
![alt text](https://github.com/xlulu/inls641_OlympicAnalysisVis/blob/master/Medal%20Board%20screenshot.png)


The medal board is designed to let users observe the change and the distribution of amount of medals won by different countries in previous Olympic Games. The basic idea of this graph is to use the circle size to display the amount of medals.

Users can change the year of Olympic Games by dragging the cursor on the timeline bar or by clicking on the year label directly, the size of the circles will change correspondingly. Users could also change the view by choosing “Location” tab or “Numbers” tab and add filters to the graph in order to see the numbers of a specific category: a specific game(balls, swim, etc) or a specific kind of medals(gold, silver, bronze). Users could view the detailed information about the medals one country won in one Olympic Game and their strengths by hovering their mouses on the circle.

# Athlete Board
![alt text](https://github.com/xlulu/inls641_OlympicAnalysisVis/blob/master/Athlete%20Board%20screenshot.png)


The athlete board is designed to let users find out the age, height and weight of athletes participated in the past Olympic Games and explore their possible sports to develop based on their own data by interacting with the graph.

User could view the boxplot describing specific game to find out their answers, in which it provides the median value, maximum, minimum and the scope between the first quarter to the third quarter of age/height/weight.. Instead of providing bar chart, boxplot would help users to figure out the outliers as well as the variation between this. By hovering it, user would see the specific value of each boxplot to know a detailed age scope of specific games. By selecting the toggle button of gender choices, users can see those statistical information only about female/male athletes.
