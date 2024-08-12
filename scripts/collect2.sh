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
  echo "127.0.0.1   $SITE" | sudo tee -a /etc/hosts
  echo "Generating tokens"
  mapfile -t token_array < <(node get-tokens.js)

  sudo sed -i '/127.0.0.1   $SITE/d' /etc/hosts
  wait $!

  node request.js "${token_array[@]}"
  wait $!

  # Generate a random index
  random_index=$(($RANDOM % $num_countries))

  # Get the random country code
  random_country=${country_array[$random_index]}

  echo "$random_country"

  # Connect to the random country
  nordvpn connect "$random_country"

    # Optional: Add a sleep interval to avoid rapid looping
  sleep 1
  
done

  # # Wait for the Node.js script to finish
  # wait $!

  # # Generate a random index
  # random_index=$(($RANDOM % $num_countries))

  # # Get the random country code
  # random_country=${country_array[$random_index]}

  # echo "$random_country"

  # # Connect to the random country
  # nordvpn connect "$random_country"

  #   # Optional: Add a sleep interval to avoid rapid looping
  # sleep 1

done
