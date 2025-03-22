#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p src/assets/images/hero

# Download sample images
curl -o src/assets/images/hero/bg1.jpg "https://source.unsplash.com/1600x900/?airplane,airport"
curl -o src/assets/images/hero/bg2.jpg "https://source.unsplash.com/1600x900/?travel,flight"
curl -o src/assets/images/hero/bg3.jpg "https://source.unsplash.com/1600x900/?destination,vacation"
curl -o src/assets/images/hero/bg4.jpg "https://source.unsplash.com/1600x900/?city,skyline"

# Make the script executable
chmod +x download-images.sh 