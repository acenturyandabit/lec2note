controller.reserveView("showVideo");
(async() => {
    let resp = await fetch("views/showVideo.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);

    // Get consts here
    let sceneTemplate = templateDiv.querySelector(".transcriptTemplate");
    let transcriptCntr = templateDiv.querySelector(".transcriptslides");
    let video = templateDiv.querySelector(".videoPlaceholder");
    let currentFramePointer = {
        start_time: 0,
        end_time: 0
    };

    let nextSceneCache = [];

    video.addEventListener("timeupdate", () => {
        // Check if we should proceed
        let shouldProceed = false;
        let proceedTo = {};
        if (video.currentTime < currentFramePointer.start_time || video.currentTime > currentFramePointer.end_time) {
            // Check if there exists a frame to switch to
            nextSceneCache.forEach(ent => {
                let i = ent.d;
                if (i.start_time < video.currentTime && video.currentTime < i.end_time) {
                    proceedTo = ent;
                    shouldProceed = true;
                }
            })
        }
        if (shouldProceed) {
            currentFramePointer = proceedTo.d;
            // Unfocus all elements
            Array.from(transcriptCntr.children).forEach(i => i.classList.remove("focused"));
            // Focus on the element at the current time
            proceedTo.el.classList.add("focused");
            proceedTo.el.scrollIntoViewIfNeeded();
        }
    })

    let d2ts = (n) => {
        let hrs = Math.floor(n / 3600);
        let mins = Math.floor(n / 60) % 60;
        let s = Math.floor(n - (Math.floor(n / 60) * 60));
        let ds = Math.floor((n - Math.floor(n)) * 100);
        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ds).padStart(1, "0")}`
    }

    // When the user edits the transcript
    function editSlides(event, startTime, filename) {
        console.log("input event fired");
        var url = "/modify";
        var request = new XMLHttpRequest();
        request.open('POST', url, true);

        request.onreadystatechange = function() { // request successful
            // we can use server response to our request now
            if (request.readyState === XMLHttpRequest.DONE) {
                console.log(request.responseText);
            };
        }

        request.onerror = function() {
            // request failed
        };

        request.send(JSON.stringify({"start_time": startTime, "new_words":event.target.innerText, 
            "filename": filename}));
    }

    // Allow additional parameters for editSlides
    function handleEvent(startTime, filename) {
        return function(e) {
            editSlides(e, startTime, filename); 
        };
    }

    controller.registerView("showVideo", {}, {
        load: async() => {
            let froot = `database/${controller.state.video}`;
            document.querySelector(".main_container").appendChild(templateDiv);
            templateDiv.style.display = "";
            // fetch the video info and display it
            let st_resp = await fetch(`${froot}/data.json`);
            let st_json = await st_resp.json();

            // fetch modified text
            let modify_resp = await fetch(`${froot}/modify.json`);
            let modify_text = await modify_resp.text();
            let modify_arr = await modify_text.split("\n").slice(0,-1);

            // override original transcript with any modifications
            modify_arr.forEach(i => {
                let line = JSON.parse(i);
                let startTime = line["start_time"];
                let newWords = line["new_words"];

                st_json.scenes.find(t=>t.start_time===startTime).words = newWords;
            })

            // Load metadata
            // Create a new video element
            video.src = `${froot}/${st_json.meta.fileName}`;

            // Load scenes
            let totalText = "";
            st_json.scenes.forEach(i => {
                // Create a new scene from the scene template
                let nextScene = sceneTemplate.cloneNode(true);
                // add it to the list
                nextScene.style.display = "";
                nextScene.querySelector("img").src = `${froot}/${i.fname}`;
                nextScene.querySelector("span.ts").innerText = d2ts(i.start_time);
                nextScene.querySelector("span.snt").innerText = i.words;

                // Add event listener for modified transcript
                const startTime = i.start_time;
                const filename = st_json.meta.fileName;
                nextScene.querySelector("span.snt").addEventListener("input", 
                    handleEvent(startTime, filename));

                nextScene.querySelector("span.snt").innerText = i.words || "";
                transcriptCntr.appendChild(nextScene);
                nextScene.addEventListener("click", (e) => {
                    video.currentTime = i.start_time;
                })
                nextSceneCache.push({ d: i, el: nextScene });
                totalText += i.words;
            });

            // Show filename
            templateDiv.querySelector(".filename").innerText = st_json.meta.fileName;
            // Show fullTranscript
            templateDiv.querySelector(".fullTranscript").innerText = totalText;

            // Show the templateDiv by clearing display none
            templateDiv.style.display = "";

        },
        unload: () => {
            templateDiv.style.display = "none";
            nextSceneCache.forEach(i => i.el.remove());
            nextSceneCache = [];
        }
    })
})();