controller.reserveView("home");
(async() => {
    let resp = await fetch("views/home.chnk.html");
    let template = await resp.text();
    let templateDiv = htmlwrap(template);
    document.body.appendChild(templateDiv);
    controller.registerView("home", { default: true }, {
        load: () => {
            templateDiv.style.display = "";
            //TODO: 

            // Query existing documents and show them 
        },
        unload: () => {
            templateDiv.style.display = "none";
        }
    })
})();