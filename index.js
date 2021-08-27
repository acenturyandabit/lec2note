const express = require("express");
var app = new express();
app.use(express.static("static_dir"));


// Upload a video to the website
// Enumerate my videos
// Search globally though my notes
// open a particular video

app.listen(3234);