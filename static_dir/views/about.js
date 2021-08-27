controller.reserveView("about");
(async() => {
    let resp = await fetch("views/about.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    // Get consts here

    controller.registerView("about", {}, {
        load: async() => {
            // Show the templateDiv
            document.querySelector(".main_container").appendChild(templateDiv);
            templateDiv.style.display = "";
            // Do any fetching etc here

        },
        unload: () => {
            templateDiv.style.display = "none";
        }
    })
})();