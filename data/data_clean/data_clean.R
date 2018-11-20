library(tidyverse)
setwd("/Users/ltl/Desktop/2018-Fall/INLS641/Project")
olympics <- read.csv("athlete_events.csv")
olympics <- as.tibble(olympics)

# Remove Winter Olympic Data
SummerData <- olympics %>% filter(Season == "Summer")
SummerData <- as.tibble(SummerData)

# Remove rows with null values in Height or Weight
SummerData <- 
  SummerData %>% drop_na(Height, Weight, Age)

# sport information (firstYear, lastYear, count)
spt <- 
  SummerData %>%
    group_by(Sport, Year) %>%
    count() %>%
    arrange(Sport)

spt_info <-
  spt %>% 
    group_by(Sport) %>%
    summarise(lastY = max(Year), firstY = min(Year))

# Sport & country
ctr_event <- 
  SummerData %>% 
  select(Sport, NOC)

country_num <- 
  ctr_event[!duplicated(ctr_event),] %>%
  group_by(Sport) %>%
  count() %>%
  arrange(n)

colnames(country_num)[2] <- 'Number of Countries'

# Sports held less than 3 times in Olympic history.
a <- filter(spt_info, lastY - firstY <= 12)
# Sports have less than 20 participant countries
b <- filter(country_num, `Number of Countries` <= 20)
# Sports we will remove from the dataset
c <- union(a$Sport, b$Sport)

# Remove rows with Sport in Sports
ProjectData <- 
  SummerData %>%
    filter(!Sport %in% c)

write.csv(ProjectData, '/Users/ltl/Desktop/2018-Fall/INLS641/Project/Project_Data.csv', row.names=T)
