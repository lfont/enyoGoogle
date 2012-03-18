enyo.kind({
    name: "enyoGoogle.Loader",
    kind: "enyo.Component",
    statics: {
        scriptLoadedCbs: [],
        apiLoadedCbs: [],
        alreadyCalled: false,
        loadAPI: function (inName, inVersion, inOptions, inCallback) {
            if (window["google"] && window["google"]["load"]) {
                enyoGoogle.Loader.googleLoad(inName, inVersion,
                                            inOptions, inCallback);
            } else {
                this.scriptLoadedCbs.push(enyo.bind(enyoGoogle.Loader,
                                         "googleLoad",
                                         inName, inVersion,
                                         inOptions, inCallback));
                if (!this.alreadyCalled) {
                    this.alreadyCalled =  true;
                    this.addScript();
                }
            }
        },
        addScript: function () {
            var script = document.createElement("script");
            script.onload = function () {
                enyoGoogle.Loader.scriptLoaded();
            };
            script.src = "https://www.google.com/jsapi";
            document.body.appendChild(script);
        },
        scriptLoaded: function () {
            var i, c;
            for (i = 0; i < enyoGoogle.Loader.scriptLoadedCbs.length; i++) {
                c = enyoGoogle.Loader.scriptLoadedCbs[i];
                c();
            }
            enyoGoogle.Loader.scriptLoadedCbs = [];
        },
        googleLoad: function (inName, inVersion, inOptions, inCallback) {
            var alreadyLoaded;
            if (window["google"] && window["google"][inName]) {
                if (inCallback) inCallback();
            } else {
                alreadyLoaded = this.apiLoadedCbs[inName] !== undefined;
                if (!alreadyLoaded) {
                    this.apiLoadedCbs[inName] = [];
                }
                this.apiLoadedCbs[inName].push(inCallback);

                if (!alreadyLoaded) {
                    if (typeof(inOptions) === "function") {
                        inCallback = inOptions;
                        inOptions = "";
                    }

                    google.load(inName, inVersion, {
                        callback: enyo.bind(enyoGoogle.Loader, "apiLoaded", inName),
                        other_params: inOptions
                    });
                }
            }
        },
        apiLoaded: function (inName) {
            var callbacks = enyoGoogle.Loader.apiLoadedCbs[inName],
                i, c;
            for (i = 0; i < callbacks.length; i++) {
                c = callbacks[i];
                c();
            }
            enyoGoogle.Loader.apiLoadedCbs[inName] = [];
        }
    }
});