const express = require("express");
const fs = require("fs")

var app = new express();
app.use(express.static("static_dir"));

app.get("/listVideos", (req, res) => {
    const arrayOfFiles = fs.readdirSync("./static_dir/database")
    res.send({
        results: arrayOfFiles
    });
});

app.post("/processFile", (req, res) => {
    // Takes a file and processes it using the pipeline (in the background)
})

app.post("/uploadFile", (req, res) => {
    // Uploads the file
    console.log(req.body);
})

// Upload a video to the website
// Enumerate my videos
// Search globally though my notes
// open a particular video

app.listen(3234);