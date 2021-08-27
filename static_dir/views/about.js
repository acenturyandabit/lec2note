controller.reserveView("about");
(async() => {
    let resp = await fetch("views/about.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    document.body.appendChild(templateDiv);

    // Get consts here

    controller.registerView("about", {
        load: async() => {
            // Show the templateDiv by clearing display none
            templateDiv.style.display = "";
            // Do any fetching etc here

        },
        unload: () => {
            templateDiv.style.display = "none";
        }
    })
})();