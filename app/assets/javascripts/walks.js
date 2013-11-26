// Global Variables
var directionsService = new google.maps.DirectionsService();
var streetView = new google.maps.StreetViewService();
var walkMap;
var markerArray;
var instructionsArray;
var panorama;
var bearings = [];
var geoStreet = [];

// Initialize map and displays, then calls mapRoute function
function initialize(){
  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
  var toronto = new google.maps.LatLng(43.652527, -79.381961);
//>>>>>>>>>>>>>>>>>>>add style to map
  var mapOptions={
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: toronto
  }
  var walkMapStyles = [
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      { "color": "#efeee4" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f0652f" },
      { "weight": 1.2 }
    ]
  },{
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f0652f" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      { "color": "#689aca" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "color": "#464646" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      { "color": "#b8b4c1" }
    ]
  },{
    "elementType": "labels.text.stroke",
    "stylers": [
      { "weight": 3.7 }
    ]
  }
];
  walkMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  walkMap.setOptions({styles: walkMapStyles});
  panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"));
  directionsDisplay.setMap(walkMap);
  directionsDisplay.setPanel(document.getElementById('directions_box'));
  // var walk_start = $('walk_start').val();
  // var walk_end = $('walk_end').val();
  mapRoute();
} //function initialize

// mapRoute is called by function initialize, makes request for directions, then calls showMarkers function to add markers
function mapRoute(){
  var request ={
    origin: walk_start,
    destination: walk_end,
    travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  directionsService.route(request, function(response, status){
    if (status == google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
      makeMarkerArray(response);
    }
  }); //directionsService.route
}; //function mapRoute

//makeMarkerArray is called by function calcRoute, renders polyline along route path, sets marker locations at intervals set by user along polyline
function makeMarkerArray (directionResult){
  var routeData = directionResult.routes[0].legs[0];
  markerArray = [];
  instructionsArray = []
  // for each step, plot markers along polyline.  push to markerArray after start_location and followed by end_location
  markerArray.push(routeData.steps[0].start_location);
  instructionsArray.push(routeData.steps[0].instructions);
  for (i = 0; i< routeData.steps.length; i++) {
    var path = routeData.steps[i].path;
    var markerSpacing = 200;
    var stepArray = new google.maps.Polyline({
         path: path,
         strokeColor: "#464646",
         strokeOpacity: 0.8,
         strokeWeight: 2
    });
    var thisStepMarkerArray = stepArray.GetPointsAtDistance(markerSpacing);
    var thisStepInstructions = routeData.steps[i].instructions;
      for (j=0; j<thisStepMarkerArray.length; j++) {
        markerArray.push(thisStepMarkerArray[j]);
        instructionsArray.push(thisStepInstructions);
      }
    markerArray.push(routeData.steps[i].end_location);
    instructionsArray.push(routeData.steps[i].instructions);

  } //for loop
console.log(markerArray);
  plotMarkers(markerArray);
}; //function makeMarkerArray

//plotMarkers plots markers on map and sets bearing for street views to point to the next marker, and adds event listener for mouseover to view streetview
function plotMarkers (markerArray){
//>>>>>>>>>>>>>>>>>>>>set icons, special start and end icons
  for (var i = 0; i < markerArray.length; i++){
    var marker = new google.maps.Marker({
      position: markerArray[i],
      map: walkMap
    }); //Marker

    // set bearing at each marker.  If the last marker, use same bearing as the previous marker.
    marker.myIndex = i;
    if (i < markerArray.length-1){
      bearings[i] = getBearing(markerArray[i]['ob'], markerArray[i]['pb'], markerArray[i+1]['ob'], markerArray[i+1]['pb']);
    }
    // If last marker, set bearing in same direction as penultimate marker
    else {
      bearings[i] = bearings[i-1];
    }

// Event listener for mouseover on marker; it triggers streetview for that marker, in the correct orientation
    google.maps.event.addListener(marker, 'mouseover', function(event){
      streetView.getPanoramaByLocation(event.latLng, 50, showStreetView);
      panorama.setPov({
        heading: bearings[this.myIndex],
        pitch: 0
      });
      panorama.setVisible(true);
    }); //addListener
  }; //for loop
}; //function plotMarkers


// showStreetView is called by function plotMarkers, renders streetview in "pano" div
function showStreetView(data, status){
  if (status == google.maps.StreetViewStatus.OK){
    var markerPanoID = data.location.pano;
    panorama.setPano(markerPanoID);
  }

  else {alert('Sorry, no views are currently available for this location.');}
}; //function showStreetView

// getBearing is called by function showMarkers, calculates direction to next marker, in order to orient streetview point-of-view in direction of the walk
function getBearing(lt1, ln1, lt2, ln2) {
  var lat1 = convertToRad(lt1);
  var lon1 = convertToRad(ln1);
  var lat2 = convertToRad(lt2);
  var lon2 = convertToRad(ln2);
  var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
  if ( angle < 0.0 ) angle  += Math.PI * 2.0;
  angle = angle * 180.0 / Math.PI;
  return parseFloat(angle.toFixed(1));
}; //function getBearing

// convertTsoRad is called by function getBearing, converts degrees to radians, used for bearing calculation
function convertToRad(Value){
  return Value * Math.PI/180;
} //function convertToRad

google.maps.event.addDomListener(window, 'load', initialize);
