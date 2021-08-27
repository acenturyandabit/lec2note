const express = require("express");
var app = new express();
app.use(express.static("static_dir"));


// Upload a video to the website
// Enumerate my videos
// Search globally though my notes
// open a particular video

const fs = require("fs")

try {
  const arrayOfFiles = fs.readdirSync("./static_dir/database")
  console.log(arrayOfFiles)
} catch(e) {
  console.log(e)
}

app.listen(3234);