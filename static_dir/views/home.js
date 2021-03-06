controller.reserveView("home");
(async() => {
    let resp = await fetch("views/home.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    let videoTabTemplate = templateDiv.querySelector(".result_template");
    let resultsContainer = templateDiv.querySelector(".results_container");
    let videoListingsCache = [];

    templateDiv.querySelector(".searcher").addEventListener("input", (e) => {
        queryText = e.target.value;
        videoListingsCache.forEach(i => i.e.style.display = "none");
        videoListingsCache.filter(i => (i.n.includes(queryText))).forEach(i => i.e.style.display = "");
    });
    // Code for file upload
    function formSubmit(event) {
        var url = "/uploadFile";
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.onreadystatechange = function() { // request successful
            // we can use server response to our request now
            if (request.readyState === XMLHttpRequest.DONE) {
                controller.switchView("home"); // refresh window
            };
        }
        request.onerror = function() {
            // request failed
        };
        request.send(new FormData(event.target)); // create FormData from form that triggered event
        event.preventDefault();
    }

    templateDiv.querySelector(".upload-inner-dash").addEventListener("click", () => {
        templateDiv.querySelector("#video_uploads").click();
    })
    templateDiv.querySelector("#video_uploads").addEventListener("input", () => {
        templateDiv.querySelector("#vuploadsubmitbtn").click();
    })
    templateDiv.querySelector("#uploadform").addEventListener("submit", formSubmit);





    controller.registerView("home", {}, {
        load: async() => {
            document.querySelector(".main_container").appendChild(templateDiv);
            templateDiv.style.display = "";
            // Query existing documents and show them 
            let lv_resp = await fetch("listVideos");
            let lv_json = await lv_resp.json();
            let videoList = lv_json.results;
            videoList.forEach(videoName => {
                // Copy the template
                let newVideoListing = videoTabTemplate.cloneNode(true);
                newVideoListing.addEventListener("click", (e) => {
                    controller.state.video = videoName;
                    controller.switchView("showVideo");
                });
                newVideoListing.style.display = "";
                // Modify the template with the specifics
                newVideoListing.querySelector(".videoTitle").innerText = videoName;
                newVideoListing.querySelector("img").addEventListener("error", async(e) => {
                    if (e.target.src != 'fallback-processing.png') e.target.src = 'fallback-processing.png';

                    // Also get the percentage
                    let vpct_resp = await fetch("statVideo?f=" + videoName);
                    let vpct_txt = await vpct_resp.text();
                    if (vpct_txt == "undefined") vpct_txt = "Processing...";
                    else vpct_txt = `${vpct_txt}% complete`;
                    newVideoListing.querySelector(".videoTitle").innerText = `${videoName}: ${vpct_txt}`;
                    setTimeout(() => {
                        e.target.src = `database/${videoName}/thumbnail.png`;
                        newVideoListing.querySelector(".videoTitle").innerText = `${videoName}`;
                    }, 3000);
                })
                newVideoListing.querySelector("img").src = `database/${videoName}/thumbnail.png`;
                // Append the template
                resultsContainer.appendChild(newVideoListing);
                videoListingsCache.push({ n: videoName, e: newVideoListing });
            })
        },
        unload: () => {
            templateDiv.style.display = "none";
            videoListingsCache.forEach(i => i.e.remove());
            videoListingsCache = [];
        }
    })
})();