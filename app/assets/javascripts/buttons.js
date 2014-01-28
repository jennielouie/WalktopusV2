// window.onload = function() {

//    $('#nextStepButton').click(function(){
//      console.log('View next marker');
//      if (lastSelectedMarker.myIndex == markerHandles.length-1) {
//        currentIndex = 0;
//      } else {
//        currentIndex = lastSelectedMarker.myIndex + 1;
//      }
//      changeSV();
//    });

//    $('#prevStepButton').click(function(){
//      console.log('View previous marker');
//      if (lastSelectedMarker.myIndex == 0) {
//        currentIndex = markerHandles.length-1;
//      } else {
//        currentIndex = lastSelectedMarker.myIndex - 1;
//      }
//      changeSV();
//      });

//      function changeSV() {
//        if (lastSelectedMarker == markerHandles[0]){
//            lastSelectedMarker.setIcon(starfish);
//        } else {
//          lastSelectedMarker.setIcon(octopus);
//        }

//        panoOptions = {
//          position: markerArray[currentIndex]
//        };
//        panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"), panoOptions);
//        panorama.setPov({ heading: bearings[currentIndex], pitch: 0});
//        walkMap.setHeading(bearings[currentIndex]);

//        panorama.setVisible(true);
//        currentMarker = markerHandles[currentIndex];
//        currentMarker.setIcon(chicken);
//        lastSelectedMarker = currentMarker;
//        $('#directions_box').empty();
//        $('#directions_box').append('<h6>Directions:</h6></br><h6>' + instructionsArray[currentIndex] + '</h6>');
//    };
// };