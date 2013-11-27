# // Global Variables
directionsService = new google.maps.DirectionsService()
streetView = new google.maps.StreetViewService()
bearings = []
geoStreet = []
panorama = 0
walkMap = 0

# Initialize map and displays, then calls mapRoute function
initialize = ()->
  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true, polylineOptions: {strokeColor: '#464646'}})
  toronto = new google.maps.LatLng(43.652527, -79.381961)
  mapOptions = {
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: toronto}
  walkMapStyles = [{
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#efeee4" }]},
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#f0652f" },{ "weight": 1.2 }]},
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#f0652f" }]},
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [{ "color": "#689aca" }]},
  {
    "featureType": "water",
    "stylers": [{ "color": "#464646" }]},
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#b8b4c1" }]},
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "weight": 3.7 }]}
  ]
  walkMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions)
  walkMap.setOptions({styles: walkMapStyles})
  panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"))
  directionsDisplay.setMap(walkMap)
  directionsDisplay.setPanel(document.getElementById('directions_box'))
  mapRoute(walkMap, directionsDisplay, panorama)


# # mapRoute is called by function initialize, makes request for directions, then calls showMarkers function to add markers
mapRoute = (walkMap, directionsDisplay, panorama)->
  request = {
    origin: walk_start,
    destination: walk_end,
    travelMode: google.maps.DirectionsTravelMode.WALKING
  }
  directionsService.route(request, (response, status) ->
    if status == google.maps.DirectionsStatus.OK
      directionsDisplay.setDirections(response)
      $('#walk_show').append('<h3> Start (star): ' + response.routes[0].legs[0].start_address + '</br>End: ' + response.routes[0].legs[0].end_address + '</h3>')
      console.log(response)
      makeMarkerArray(walkMap, response, panorama))


# For each step, plot markers along polyline.  push to markerArray after start_location and followed by end_location
makeMarkerArray = (walkMap, directionResult, panorama)->
  routeData = directionResult.routes[0].legs[0]
  markerArray = []
  instructionsArray = []
  markerArray.push(routeData.steps[0].start_location)
  instructionsArray.push(routeData.steps[0].instructions)
  for i in [0..(routeData.steps.length-2)]
    pathw = routeData.steps[i].path
    markerSpacing = 200
    stepArray = new google.maps.Polyline({
      path: pathw,
      strokeColor: "#464646",
      strokeOpacity: 0.8,
      strokeWeight: 2})
    thisStepMarkerArray = stepArray.GetPointsAtDistance(markerSpacing)
    console.log(i + ' step array:')
    console.log(thisStepMarkerArray)
    # if i==routeData.steps.length-1 then thisStepInstructions = 'You have arrived!'
    thisStepInstructions = routeData.steps[i].instructions
    if thisStepMarkerArray.length>0
      for j in [0..(thisStepMarkerArray.length-1)]
        markerArray.push(thisStepMarkerArray[j])
        instructionsArray.push(thisStepInstructions)
    else
    markerArray.push(routeData.steps[i].end_location)
    instructionsArray.push(routeData.steps[i+1].instructions)
  plotMarkers(walkMap, markerArray, instructionsArray, panorama)


#   set bearing at each marker.  If the last marker, use same bearing as the previous marker.
plotMarkers = (walkMap, markerArray, instructionsArray, panorama)->
  octopus = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-4/32/Poulpo-icon.png'
  chicken = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-2/32/polenta-icon.png'
  starfish = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-4/48/Pico-icon.png'
  for i in [0..markerArray.length-1]
    if i==0
      marker = new google.maps.Marker({
        position: markerArray[0],
        map: walkMap,
        icon: starfish
      })
      lastSelectedMarker = marker
    else
      marker = new google.maps.Marker({
        position: markerArray[i],
        map: walkMap,
        icon: octopus
      })
    marker.myIndex = i
    if i < markerArray.length-2
      thisLatLng = markerArray[i]
      nextLatLng = markerArray[i+1]
      bearings[i] = getBearing(thisLatLng.lat(), thisLatLng.lng(), nextLatLng.lat(), nextLatLng.lng())
    # If last marker, set bearing in same direction as penultimate marker
    else bearings[i] = bearings[i-1]



# Event listener for mouseover on marker; it triggers streetview for that marker, in the correct orientation
    google.maps.event.addListener marker, 'click', (event) ->
      streetView.getPanoramaByLocation(event.latLng, 50, showStreetView)
      if lastSelectedMarker.myIndex == 0 then lastSelectedMarker.setIcon(starfish)
      else lastSelectedMarker.setIcon(octopus)
      panorama.setPov({ heading: bearings[this.myIndex], pitch: 0})
      panorama.setVisible(true)
      this.setIcon(chicken)
      lastSelectedMarker = this
      $('#directions_box').empty()
      $('#directions_box').append('<h3>Directions:</h3></br>' + instructionsArray[this.myIndex])


showStreetView = (data, status)->
  if status == google.maps.StreetViewStatus.OK then panorama.setPano(data.location.pano) else alert 'Sorry, no views are currently available for this location.'

getBearing = (lt1, ln1, lt2, ln2)->
  lat1 = convertToRad(lt1)
  lon1 = convertToRad(ln1)
  lat2 = convertToRad(lt2)
  lon2 = convertToRad(ln2)
  angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) )
  if angle < 0.0 then angle += Math.PI * 2.0
  angle = angle * 180.0 / Math.PI
  parseFloat(angle.toFixed(1))

convertToRad = (value)->
  value * Math.PI/180

google.maps.event.addDomListener(window, 'load', initialize)
google.maps.event.addDomListener window, "resize", (event) ->
  center = walkMap.getCenter()
  google.maps.event.trigger(walkMap, "resize")
  google.maps.event.trigger(panorama, "resize")
  walkMap.setCenter(center)
  console.log('resized')


