controller.reserveView("home");
(async() => {
    let resp = await fetch("views/home.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    let videoTabTemplate = templateDiv.querySelector(".result_template");
    let resultsContainer = templateDiv.querySelector(".results_container");
    let videoListingsCache = [];

    // Add a file upload here.

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
                newVideoListing.querySelector("img").src = `database/${videoName}/thumbnail.png`;
                // Append the template
                resultsContainer.appendChild(newVideoListing);
                videoListingsCache.push(newVideoListing);
            })
        },
        unload: () => {
            templateDiv.style.display = "none";
            videoListingsCache.forEach(i => i.remove());
        }
    })
})();