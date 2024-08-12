#!/bin/bash

# Get the list of available countries
country_array=(
    Albania Algeria Andorra Argentina Armenia Australia Austria Azerbaijan Bahamas
    Bangladesh Belgium Belize Bermuda Bhutan Bolivia Bosnia_And_Herzegovina Brazil Brunei_Darussalam
    Bulgaria Cambodia Canada Cayman_Islands Chile Colombia Costa_Rica Croatia Cyprus
    Czech_Republic Denmark Dominican_Republic Ecuador Egypt El_Salvador Estonia Finland France
    Georgia Germany Ghana Greece Greenland Guam Guatemala Honduras Hong_Kong
    Hungary Iceland India Indonesia Ireland Isle_Of_Man Israel Italy Jamaica
    Japan Jersey Kazakhstan Kenya Lao_Peoples_Democratic_Republic Latvia Lebanon Liechtenstein Lithuania
    Luxembourg Malaysia Malta Mexico Moldova Monaco Mongolia Montenegro Morocco
    Myanmar Nepal Netherlands New_Zealand Nigeria North_Macedonia Norway Pakistan Panama
    Papua_New_Guinea Paraguay Peru Philippines Poland Portugal Puerto_Rico Romania Serbia
    Singapore Slovakia Slovenia South_Africa South_Korea Spain Sri_Lanka Sweden Switzerland
    Taiwan Thailand Trinidad_And_Tobago Turkey Ukraine United_Arab_Emirates United_Kingdom United_States Uruguay
    Uzbekistan Venezuela Vietnam
)

# Get the number of countries
num_countries=${#country_array[@]}

# Loop indefinitely
while true; do
  for country in "${country_array[@]}"; do
    # Execute the Node.js script
    node get-car-data.js

    # Wait for the Node.js script to finish
    wait $!

    echo "$country"

    # Connect to the random country
    nordvpn connect "$country"

  done
done
