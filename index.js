const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const fileUpload = require("express-fileupload");

var app = new express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());

app.use(express.static("static_dir"));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.get("/listVideos", (req, res) => {
    const arrayOfFiles = fs.readdirSync("./static_dir/database")
    res.send({
        results: arrayOfFiles
    });
});

let locale = {
    pythonStr: "python3"
};
if (fs.existsSync("local.json")) {
    locale = JSON.parse(String(fs.readFileSync("local.json")));
}


app.post("/uploadFile", (req, res) => {
    // Uploads the file
    let fileName = req.files.video_uploads.name;
    let baseName = fileName.split(".");
    baseName.pop();
    _baseName = baseName.join(".");
    let count = 0;
    baseName = _baseName;
    while (fs.existsSync(`static_dir/database/${baseName}/`)) {
        baseName = _baseName + String(count);
        count++;
    }
    try {
        fs.mkdirSync(`static_dir/database/${baseName}/`);
        req.files.video_uploads.mv(`static_dir/database/${baseName}/${fileName}`, (err) => {
            // callback - ask lec2note to process it
            if (false) { // using false so i can test the statvideo endpoint
                // save monies
                // var spawn = require('child_process').spawn,
                // ls    = spawn('ls');

                var spawn = require('child_process').spawn,
                ls = spawn(`${locale.pythonStr}`, [`lec2note_main/main.py`, `static_dir/database/${baseName}/${fileName}`,
                    `static_dir/database/${baseName}`]);

                ls.stdout.on('data', function (data) {
                    console.log('stdout: ' + data.toString());
                });

                ls.stderr.on('data', function (data) {
                    console.log('stderr: ' + data.toString());
                });

                ls.on('exit', function (code) {
                    console.log('child process exited with code ' + code.toString());
                });

                // let child = exec(`${locale.pythonStr} lec2note_main/main.py "static_dir/database/${baseName}/${fileName}" "static_dir/database/${baseName}"`,
                // function (error, stdout, stderr) {
                //     console.log('stdout: ' + stdout);
                //     console.log('stderr: ' + stderr);
                //     if (error !== null) {
                //         console.log('exec error: ' + error);
                //     }
                // });


            }
            res.end("SUCCESS");
        });
        // Validate that the file must be less than 10mb and 10s, so that we can have a live demo
        // also ratelimit this api just in case
    } catch (e) {
        res.end("FAIL");
        console.log(e);
        return;
    }

})

function createFile(filename) {
    fs.open(filename, 'r', function(err, fd) {
        if (err) {
            fs.writeFile(filename, '', function(err) {
                if (err) {
                    console.log(err);
                }
                console.log("The file was saved!");
            });
        } else {
            console.log("The file exists!");
        }
    });
}

app.get("/statVideo", (req, res) => {
    console.log(req.query);
    res.send(String(0)).end(); // Must send() a string not an int otherwise it is interpreted as a status code like 404
})

app.post('/modify', (req, res) => {
    console.log("modify");
    const data = JSON.parse(req.body);
    console.log(data);

    const folder = data["filename"].split(".")[0];
    console.log(folder);
    const filename = "static_dir/database/" + folder + "/modify.json";
    createFile(filename);

    fs.appendFile(filename, JSON.stringify(data) + "\n", function(err) {
        if (err) {
            console.log(err);
        }
        console.log("The file was saved!");
    });
    res.end();
})


// Upload a video to the website
// Enumerate my videos
// Search globally though my notes
// open a particular video

app.listen(3234);