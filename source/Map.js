enyo.kind({
    name: "enyoGoogle.Map",
    kind: "enyo.Control",
    published: {
        /**
          The latitude of the location.
         */
        latitude: 37.029043436050415,
        /**
          The longitde of the location.
         */
        longitude: -101.55550763010979,
        /**
          The zoom level of the map view.
         */
        zoom: 4,
        /**
          Show a marker at the center of the current map view.
         */
        showMarker: false,
        /**
          The map type of the map view.  Valid map types are aerial, auto, birdseye, collinsBart, mercator, ordnanceSurvey and road.
         */
        mapType: "ROADMAP",
        /**
          Show traffic info
         */
        showTraffic: false,
        /**
          Represents Google options to customize the map that is displayed.  Can only be set at create time.  For example,
          { kind: "enyo.GoogleMap", options: { disableDefaultUI: true, draggable: false } }
         */
        options: ""
    },
    events: {
        onMarkerClick: "",
        onLoaded: "",
        onLoadFailure: ""
    },
    statics: {
        /**
          The Google Maps Key used to authenticate the application.
         */
        credentials: "",
        degradedMode: false,
        forceDegradedMode: false,
        sensor: false
    },
    //* @protected
    rendered: function () {
        this.inherited(arguments);
        enyoGoogle.Loader.loadAPI("maps", "3.8",
            enyo.macroize("key={$credentials}&sensor={$sensor}",
                {
                    credentials: enyoGoogle.Map.credentials,
                    sensor: enyoGoogle.Map.sensor
                }),
            enyo.bind(this, "renderMap"));
    },
    destroy: function () {
        this.inherited(arguments);
        if (this.$.marker) {
           this.$.marker.destroy();
        }
    },
    createMap: function () {
        this.centerLoc = new google.maps.LatLng(this.latitude, this.longitude);

        var props = {
                center: this.centerLoc,
                mapTypeId: google.maps.MapTypeId[this.mapType],
                zoom: Number(this.zoom)
            };

        enyo.mixin(props, this.options);
        this.map = new google.maps.Map(this.hasNode(), props);
        this.mapEntities = [];
        this.detectFeatures();
    },
    detectFeatures: function () {
        enyoGoogle.Map.degradedMode = true;

        if (enyoGoogle.Map.forceDegradedMode) return;

        // IF the platform support Google maps's event detach all custom handlers.
        google.maps.event.addListenerOnce(this.map, "idle", enyo.bind(this, function () {
            enyoGoogle.Map.degradedMode = false;
        }));
    },
    mousedownHandler: function (inSender, inEvent) {
        if (!enyoGoogle.Map.degradedMode) return;
        this.mouseClientX = inEvent.clientX;
        this.mouseClientY = inEvent.clientY;
        this.dragingMap = true;
    },
    mousemoveHandler: function (inSender, inEvent) {
        if (!enyoGoogle.Map.degradedMode) return;
        if (this.dragingMap) {
            this.map.panBy(this.mouseClientX - inEvent.clientX,
                           this.mouseClientY - inEvent.clientY);
            this.mouseClientX = inEvent.clientX;
            this.mouseClientY = inEvent.clientY;
        }
    },
    mouseupHandler: function (inSender, inEvent) {
        if (!enyoGoogle.Map.degradedMode) return;
        this.dragingMap = false;
    },
    dblclickHandler: function (inSender, inEvent) {
        if (!enyoGoogle.Map.degradedMode) return;
        this.setZoom(this.getZoom() + 1);
    },
    destroyMap: function () {
        this.map = null;
    },
    renderMap: function() {
        this.destroyMap();
        try {
            this.createMap();
        } catch (e) {
            this.doLoadFailure(e);
            return;
        }

        setTimeout(enyo.bind(this, function () {
            this.showMarkerChanged();
            this.doLoaded();
        }), 1000);
    },
    //* @public
    /**
      Returns the actual Google map control.
     */
    hasMap: function () {
        return this.map;
    },
    getMarker: function () {
        return this.$.marker;
    },
    /**
      Removes all overlays from the map except the dropped marker and the markers in inExcludes.
     */
    clearAll: function (inExcludes) {
        var markers = this.getComponents(),
            destroy, i, j;
            
        for (i = 0; i < markers.length; i++) {
            if (markers[i] === this.$.marker) continue;
            destroy = true;
            if (inExcludes) {
                for (j = 0; j < inExcludes.length; j++) {
                    if (markers[i] === inExcludes[j]) {
                        destroy = false;
                        break;
                    }
                }
            }
            if (destroy) {
                markers[i].destroy();
            }
        }
    },
    /**
      Sets the location of the center of the map view.
      @param {number} inLatitude The latitude of the location.
      @param {number} inLongitude The longitude of the location.
     */
    setCenter: function (inLatitude, inLongitude) {
        this.latitude = inLatitude;
        this.longitude = inLongitude;
        this.updateCenter();
    },
    latitudeChanged: function () {
        this.latitude = Number(this.latitude);
        this.updateCenter();
    },
    longitudeChanged: function () {
        this.longitude = Number(this.longitude);
        this.updateCenter();
    },
    updateCenter: function () {
        this.centerLoc = new google.maps.LatLng(this.latitude, this.longitude);
        this.map.setCenter(this.centerLoc);
    },
    zoomChanged: function () {
        this.zoom = Number(this.zoom);
        this.map.setZoom(this.zoom);
    },
    getZoom: function () {
        return this.map.getZoom();
    },
    showMarkerChanged: function () {
        if (this.showMarker) {
            if (this.$.marker) {
                this.$.marker.setPosition(this.centerLoc);
            } else {
                this.createComponent({
                    name: "marker",
                    kind: "enyoGoogle.MapMarker",
                    map: this.map,
                    options: {
                        draggable: true
                    },
                    position: this.centerLoc,
                    onMarkerClick: "markerClick"
                });
            }
        } else if (this.$.marker) {
            this.$.marker.setMap(null);
        }
    },
    markerClick: function (inSender, inEvent) {
        this.doMarkerClick(inEvent);
    },
    mapTypeChanged: function () {
        var id = google.maps.MapTypeId[this.mapType] || google.maps.MapTypeId.ROADMAP;
        this.map.setMapTypeId(id);
    },
    showTrafficChanged: function () {
        if (this.trafficTileLayer) {
            this.trafficTileLayer.setMap(null);
            this.trafficTileLayer = null;
        }

        if (this.showTraffic) {
            this.trafficTileLayer = new google.maps.TrafficLayer();
            this.trafficTileLayer.setMap(this.map);
            this.mapEntities.push(this.trafficTileLayer);
        }
    },
    //* @public
    customMarkerHandler: function (inSender, inEvent) {
        var fn = this.customMarkerOnMarkerClickHandlerName[inSender] &&
            this.owner[this.customMarkerOnMarkerClickHandlerName[inSender]];
        if (fn) {
            enyo.bind(this.owner, fn)(inSender, inEvent);
        }
    },
    createMarker: function (inLatitude, inLongitude, inOptions) {
        return this.updateMarker(null, inLatitude, inLongitude, inOptions);
    },
    updateMarker: function (inMarker, inLatitude, inLongitude, inOptions) {
        var marker = inMarker;
        if (!marker) {
            marker = this.createComponent({
                kind: "enyoGoogle.MapMarker",
                map: this.map,
                position: new google.maps.LatLng(inLatitude, inLongitude),
                options: inOptions
            });
            if (inOptions.onMarkerClick) {
                if (!this.customMarkerOnMarkerClickHandlerName) {
                    this.customMarkerOnMarkerClickHandlerName = {};
                }
                this.customMarkerOnMarkerClickHandlerName[marker] = inOptions.onMarkerClick;
                marker.onMarkerClick = "customMarkerHandler";
            }
        } else {
            marker.setOptions(inOptions);
        }
        return marker;
    }
});