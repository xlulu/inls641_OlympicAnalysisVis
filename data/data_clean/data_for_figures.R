library(tidyverse)
library(readr)
library(jsonlite)

setwd("/Users/ltl/Desktop/2018-Fall/INLS641/Project/data_for_figures")
pdata <- read.csv("./Project_Data.csv")
pdata_t <- as.tibble(pdata)

# Medal board
athlete_board_data <- 
  pdata_t %>% select(ID, Sex, Age, Height, Weight, Sport, Event)
colnames(athlete_board_data)[1] <- "Athlete_Id"

write.csv(athlete_board_data, '/Users/ltl/Desktop/2018-Fall/INLS641/Project/data_for_figures/athlete_board_data.csv')

mdata <- read.csv("/Users/ltl/Desktop/2018-Fall/INLS641/Project/data_for_figures/Metal.csv")
mdata_t <- as.tibble(mdata)

medal_board_data <- 
  mdata_t %>% 
    select(NOC, Medal, Year, Sport, Event) %>%
    na.omit()

write.csv(medal_board_data, '/Users/ltl/Desktop/2018-Fall/INLS641/Project/data_for_figures/medal_board_data.csv')


data <- read.csv("./medal_board_data.csv")
data_t <- as.tibble(data)