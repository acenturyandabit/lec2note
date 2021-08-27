controller.reserveView("showVideo");
(async() => {
    let resp = await fetch("views/showVideo.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    document.body.appendChild(templateDiv);

    // Get consts here


    controller.registerView("showVideo", {
        load: async() => {
            // fetch the video info and display it
            let st_resp = await fetch("fetchVideo?" + controller.state.video);
            let st_json = await st_resp.json();

            // Load metadata
            // Create a new video element
            templateDiv.querySelector(".videoPlaceholder").src = `database/${controller.state.video}/${st_json.result.meta.fileName}`;

            // Load scenes
            st_json.result.scenes.forEach(i => {
                    // Create a new scene from the scene template
                    // add it to the list
                })
                // Show the templateDiv by clearing display none
            templateDiv.style.display = "";
            // Do any fetching etc here
        },
        unload: () => {
            templateDiv.style.display = "none";
        }
    })
})();