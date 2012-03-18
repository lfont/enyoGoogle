enyoGoogle.Map.credentials = "AIzaSyAtDkAgyml1VHrvhvbFNtCqJo7MyH3c-Xk";
enyoGoogle.Map.forceDegradedMode = true;
enyoGoogle.Map.sensor = true;

enyo.kind({
    name: "App",
    kind: "enyo.VFlexBox",
    components: [
        {
            name: "map",
            kind: "enyoGoogle.Map",
            flex: 1,
            showMarker: true,
            zoom: 8,
            onLoaded: "mapLoaded",
            onLoadFailure: "mapLoadFailure",
            onMarkerClick: "mapMarkerClicked"
        }
    ],
    mapLoaded: function (inSender, inEvent) {
        enyo.log("Map loaded successfully.");
        this.markerInfoWindow = new google.maps.InfoWindow({
            content: "Hello world!"
        });
    },
    mapLoadFailure: function (inSender, inEvent) {
        enyo.error("Load failure from map.");
    },
    mapMarkerClicked: function (inSender, inEvent) {
        this.markerInfoWindow.open(this.$.map.hasMap(), this.$.map.getMarker().hasMarker());
        this.$.map.createMarker(37.05, -100.50, {
            onMarkerClick: "customMarkerClicked"
        });
    },
    customMarkerClicked: function (inSender, inEvent) {
        enyo.log("Custom marker click.");
        this.$.map.clearAll();
    }
});