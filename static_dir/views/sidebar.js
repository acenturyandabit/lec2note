controller.reserveView("sidebar");
(async() => {
    let resp = await fetch("views/sidebar.chnk.html");
    let sidebar = await resp.text();
    let sidebarDiv = htmlwrap(sidebar);
    document.body.appendChild(sidebarDiv);

    // Get consts here

    controller.registerView("sidebar", { default: true }, {
        load: async() => {
            // load the actual default view which is home
            controller.switchView("home");
        },
        unload: () => {
            // Also do nothing - sidebar is permanent
        }
    })
})();