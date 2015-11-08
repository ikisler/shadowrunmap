/***** Error Handling *****/
// If the browser can't cannot to the Firebase in five seconds, create and show an error message
var cannotConnect = setTimeout(function(){
	var main = document.getElementsByTagName('main')[0];
	var errorMessage = document.createElement('div');
	errorMessage.className = 'error-message';
	var message = document.createTextNode('An error has occured.  Please check your internet connection or try again later.');
	errorMessage.appendChild(message);
	main.appendChild(errorMessage);

	// Set the map height to 0 so the error message is at the top of the page
	document.getElementById('map-canvas').style.height = 0;

}, 5000);

/***** Setting up the Firebase *****/
// Create a reference to the Firebase containing zone information.
var myFirebaseRef = new Firebase('https://blistering-torch-7640.firebaseio.com/');

// When the Firebase is loaded, do all the things
myFirebaseRef.child('zones').on('value', function(snapshot) {
	var rawData = snapshot.val(); // Raw data from the Firebase
	var locationsObjs = [];	// Holds the location objects
	var locationBoundaries = []; // Holds the corrected location boundaries

	// Clear the timeout for the error message
	clearTimeout(cannotConnect);

	// Move the objects into an array
	for(var index in rawData) {
    	var attr = rawData[index];
    	locationsObjs.push(attr);
	}

	// Move the correction boundaries into an array
	for(var i=0; i<locationsObjs.length; i++) {
		locationBoundaries.push(fixBoundaries(locationsObjs[i].boundaries));
	}

	// Create the map
	createMap(locationBoundaries, locationsObjs);

	// Create the map key
	createMapKey(locationsObjs);
});

/***** Fix the format of the boundaries that come from the Firebase *****/
function fixBoundaries(boundaries) {
	var tempBoundaries = boundaries.split(',. '); // Boundaries as strings
	var fixedBoundaries = []; // Boundaries as objects

	// Loop through all the boundary strings and turn them into objects
	for(var i=0; i<tempBoundaries.length; i++) {
		fixedBoundaries.push(JSON.parse(tempBoundaries[i]));
	}

	// Return the array of boundary objects
	return fixedBoundaries;
}

/***** Google Maps Function and Highlighted Areas *****/

// Global variable to hold the current path on the map, so it can be cleared later
var path;

function createMap(boundaries, locations) {
	var mapOptions = {
		zoom: 9,
		center: new google.maps.LatLng(47.60292227835496, -122.2507095336914),
		mapTypeId: google.maps.MapTypeId.ROADMAP //TERRAIN
	};

	// Get the map element
	var map = new google.maps.Map(document.getElementById('map-canvas'),
		 mapOptions);

	// Create the polygon overlay using the passed boundary and location information
	var polygon;
	for(var i=0; i< boundaries.length; i++) {
		polygon = new  google.maps.Polygon({
				paths: boundaries[i],
				strokeColor: '#000000',
				strokeOpacity: 0,
				strokeWeight: 2,
				fillColor: locations[i].color,
				fillOpacity: 0.40
		});

		// Add the polygon to the map
		polygon.setMap(map);

	}

	// This code is used for creating new polygon areas
	// Variable to hold a polyline for illustrating new boundaries
	var poly = new google.maps.Polyline({
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	});
	poly.setMap(map);

	// The textbox that holds the new boundary text
	var newBoundariesText = document.getElementsByClassName('new-area-boundaries-text')[0];
	
	google.maps.event.addListener(map, 'click', function(event) {
		//  If the new-area-boundaries checkbox is checked, add new boundary locations to the new-area-boundaries-text div
		if(document.getElementsByClassName('new-area-boundaries-check')[0].checked) {
			path = poly.getPath();

			// Append a new coord, and it will appear on the map
			path.push(event.latLng);

			// Append the new boundary value to the textbox
			var obj = '{"lat": ' + event.latLng.lat() + ', "lng": ' + event.latLng.lng() + '},.';
			newBoundariesText.value += obj;
		}
	});
}

// This code is used for creating new polygon areas
window.onload = function() {
	var newBoundariesCheck = document.getElementsByClassName('new-area-boundaries-check')[0];
	var newBoundariesText = document.getElementsByClassName('new-area-boundaries-text')[0];
	var newBoundariesCopyButton = document.getElementsByClassName('new-area-boundaries-copy')[0];

	newBoundariesCheck.onclick = function() {
		// If the checkbox isn't checked, then remove the boundaries textbox from the page,
		// clear the path on the polyline, and reset the value of the boundaries textbox
		if(!newBoundariesCheck.checked) {
			newBoundariesText.className += ' invisible';
			newBoundariesCopyButton.className += ' invisible';

			path.clear();
			newBoundariesText.value = '';
		} else {
			// Otherwise, show the new boundaries textbox
			newBoundariesText.className = newBoundariesText.className.replace(' invisible', '');
			newBoundariesCopyButton.className = newBoundariesCopyButton.className.replace(' invisible', '');
		}
	}
}

function copyBoundaries() {
	var newBoundariesText = document.getElementsByClassName('new-area-boundaries-text')[0].value;
}

/***** The Map Key *****/
function createMapKey(locations) {
	// Get the main element
	var main = document.getElementsByTagName('main');

	// If the map key already exists, destroy it
	// This is in case the Firebase is updated while someone is looking at it
	var key = document.getElementsByClassName('key');
	if(key.length > 0) {
		main[0].removeChild(key[0]);
	}

	// Create a div to hold the map key, and give it a class
	var keyContainer = document.createElement('div');
	keyContainer.className += ' key';

	// Temp variables to use while creating each key
	var tempContainerDiv;
	var tempColorDiv;
	var tempNameDiv;
	var tempName;

	// For each zone, create elements to hold the color and name
	for(var i=0; i<locations.length; i++) {
		// Create a DIV to hold the location
		tempDiv = document.createElement('div');
		tempDiv.className += ' key-location';

		// Create a box for the location color
		tempColorDiv = document.createElement('div');
		tempColorDiv.className += ' key-location-color';
		tempColorDiv.style.backgroundColor = locations[i].color;

		// Create a box location name
		tempNameDiv = document.createElement('span');
		tempNameDiv.className += ' key-location-name';
		tempName = document.createTextNode(locations[i].name);
		tempNameDiv.appendChild(tempName);

		// Append everything to the keyContainer
		tempDiv.appendChild(tempColorDiv);
		tempDiv.appendChild(tempNameDiv);
		keyContainer.appendChild(tempDiv);
	}

	// Append everything to the main element
	main[0].appendChild(keyContainer);
}