// Some helper functions from my past


function htmlwrap(html, el) {
    let d = document.createElement(el || 'div');
    d.innerHTML = html;
    if (d.children.length == 1) {
        let dd = d.children[0];
        dd.remove();
        return dd;
    } else return d;
}


function _controller() {
    /*Object.defineProperty(this, 'state', {
        get: () => {
            return JSON.parse(localStorage.getItem("__state"));
        },
        set: (val) => {
            localStorage.setItem("__state", JSON.stringify(val));
        }
    });*/
    this.state = {
        currentView: ""
    };
    this.views = {};
    this.pendingViews = {};
    this.reserveView = (name) => {
        this.pendingViews[name] = {};
        this.pendingViews[name].promise = new Promise((res) => {
            this.pendingViews[name].resolve = res;
        });
        // Block the load from firing until name is ready
    }
    this.registerView = (name, options, view) => {
        if (!view) view = options;
        if (this.pendingViews[name]) this.pendingViews[name].resolve();
        this.views[name] = {
            view: view,
            options: options
        };
    }

    this.switchView = (newView) => {
        if (this.state.currentView) {
            this.views[this.state.currentView].view.unload(this);
        }
        this.state.currentView = newView;
        this.views[this.state.currentView].view.load(this);
    }

    this.load = async() => {
        await Promise.all(Object.values(this.pendingViews).map(i => i.promise));
        // Find the initial view and load it.
        let defaultView = Object.keys(this.views)[0];
        for (let v in this.views) {
            if (this.views[v].options.default) {
                defaultView = v;
            }
        }
        this.switchView(defaultView);
    }
}
var controller = new _controller();

// State getter and setter from localstorage