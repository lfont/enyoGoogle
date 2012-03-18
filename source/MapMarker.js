enyo.kind({
    name: "enyoGoogle.MapMarker",
    kind: "enyo.Component",
    published: {
        map: "",
        position: "",
        /**
          Represents Google Marker options to customize the marker that is displayed.
          For example,
          { kind: "enyoGoogle.MapMarker", options: { clickable: false, draggable: false } }
         */
        options: ""
    },
    events: {
        onMarkerClick: ""
    },
    statics: {
        initialize: function () {
            if (enyoGoogle.DegradedMapMarker) return;

            enyoGoogle.DegradedMapMarker = function (options) {
                this.div_ = document.createElement("div");
                this.divShadown_ = document.createElement("div");
                this.position_ = options.position;

                if (options.hasOwnProperty("clickable")) {
                    this.clickable_ = options.clickable;
                } else {
                    this.clickable_ = true;
                }

                if (options.map) {
                    this.setMap(options.map);
                }
            };

            enyoGoogle.DegradedMapMarker.prototype = new google.maps.OverlayView();

            enyoGoogle.DegradedMapMarker.prototype.onAdd = function () {
                var div = this.div_,
                    divShadown = this.divShadown_,
                    panes;

                div.className = "enyoGoogle-mapMarker";
                divShadown.className = "enyoGoogle-mapMarker-shadow";

                //img.src = enyo.path.rewrite("$/") + "../images/marker_sprite.png";
                //div.appendChild(img);

                panes = this.getPanes();
                panes.floatPane.appendChild(div);
                panes.overlayLayer.appendChild(divShadown);
            };

            enyoGoogle.DegradedMapMarker.prototype.draw = function () {
                var div = this.div_,
                    divShadown = this.divShadown_,
                    overlayProjection = this.getProjection(),
                    divPixel = overlayProjection.fromLatLngToDivPixel(this.position_);
                
                div.style.left =
                divShadown.style.left = divPixel.x - 10 + "px";

                div.style.top =
                divShadown.style.top = divPixel.y - 34 + "px";
            };

            enyoGoogle.DegradedMapMarker.prototype.onRemove = function () {
                this.div_.parentNode.removeChild(this.div_);
                this.div_ = null;
                this.divShadown_.parentNode.removeChild(this.divShadown_);
                this.divShadown_ = null;
            };

            enyoGoogle.DegradedMapMarker.prototype.getDiv = function () {
                return this.div_;
            };

            enyoGoogle.DegradedMapMarker.prototype.getPosition = function () {
                return this.position_;
            };

            enyoGoogle.DegradedMapMarker.prototype.setPosition = function (position) {
                this.position_ = position;
                this.draw();
            };

            enyoGoogle.DegradedMapMarker.prototype.setOptions = function (options) {
                if (options.map) {
                    this.setMap(options.map);
                }

                if (options.position) {
                    this.setPosition(options.position);
                }

                if (options.clickable) {
                    this.setClickable(options.clickable);
                }
            };

            enyoGoogle.DegradedMapMarker.prototype.getClickable = function () {
                return this.clickable_;
            };

            enyoGoogle.DegradedMapMarker.prototype.setClickable = function (flag) {
                this.clickable_ = flag;
            };
        }
    },
    create: function () {
        enyoGoogle.MapMarker.initialize();

        this.inherited(arguments);
        this.options.map = this.map;
        this.options.position = this.position;

        if (enyoGoogle.Map.degradedMode) {
            this.marker = new enyoGoogle.DegradedMapMarker(this.options);
            this.markerClickEvent = enyo.bind(this, "markerClick");
            this.marker.getDiv().addEventListener("click", this.markerClickEvent, false);
        } else {
            this.marker = new google.maps.Marker(this.options);
            this.markerClickEvent = google.maps.event.addListener(this.marker,
                "click", enyo.bind(this, "markerClick"));
        }
    },
    destroy: function () {
        if (this.markerClickEvent) {
            if (enyoGoogle.Map.degradedMode) {
               this.marker.getDiv().removeEventListener("click", this.markerClickEvent, false);
            } else {
                google.maps.event.removeListener(this.markerClickEvent);
            }
        }

        this.setMap(null);
        this.inherited(arguments);
    },
    mapChanged: function () {
        this.marker.setMap(this.map);
    },
    getMap: function () {
        return this.marker.getMap();
    },
    positionChanged: function () {
        this.marker.setPosition(this.position);
    },
    getPosition: function () {
        return this.marker.getPosition();
    },
    optionsChanged: function () {
        this.marker.setOptions(this.options);
    },
    hasMarker: function () {
        return this.marker;
    },
    markerClick: function (inEvent) {
        if (!this.marker.getClickable()) return;
        this.doMarkerClick(inEvent);
    }
});