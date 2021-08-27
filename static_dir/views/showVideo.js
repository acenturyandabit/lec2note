controller.reserveView("showVideo");
(async() => {
    let resp = await fetch("views/showVideo.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);

    // Get consts here
    let sceneTemplate = templateDiv.querySelector(".transcriptTemplate");
    let transcriptCntr = templateDiv.querySelector(".transcriptslides");
    let video = templateDiv.querySelector(".videoPlaceholder");
    let nextSceneCache = [];

    let d2ts = (n) => {
        let hrs = Math.floor(n / 3600);
        let mins = Math.floor(n / 60) % 60;
        let s = Math.floor(n - (Math.floor(n / 60) * 60));
        let ds = Math.floor((n - Math.floor(n)) * 100);
        return `${String(hrs).padStart(2,"0")}:${String(mins).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(ds).padStart(1,"0")}`
    }

    controller.registerView("showVideo", {}, {
        load: async() => {
            let froot = `database/${controller.state.video}`;
            document.querySelector(".main_container").appendChild(templateDiv);
            templateDiv.style.display = "";
            // fetch the video info and display it
            let st_resp = await fetch(`${froot}/data.json`);
            let st_json = await st_resp.json();

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
                transcriptCntr.appendChild(nextScene);
                nextScene.addEventListener("click", (e) => {
                    video.currentTime = i.start_time;
                })
                nextSceneCache.push(nextScene);
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
            nextSceneCache.forEach(i => i.remove());
        }
    })
})();