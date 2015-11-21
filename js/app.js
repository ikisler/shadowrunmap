/*****
"Shadowrun Map" by Isabeau Kisler
Application shows zones and map markers from the roleplaying game, Shadowrun 2050.

New information can be added to the database through add.html.

Project created for a personal Shadowrun game, using Firebase and Google Maps API.

11/15
*****/

/***** Setting up the Firebase *****/
// Create a reference to the Firebase containing zone information.
var firebaseRef = {
	main: new Firebase('https://blistering-torch-7640.firebaseio.com/')
};

var mapObj = {};

mapObj.start = function() {
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

	// When the Firebase for the Zones is loaded, do all the things
	firebaseRef.main.child('zones').orderByChild('name').on('value', function(snapshot) {
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
			locationBoundaries.push(mapObj.fixBoundaries(locationsObjs[i].boundaries));
		}

		// Create the map
		mapObj.createMap(locationBoundaries, locationsObjs);

		// Create the map key
		mapObj.createMapKey(locationsObjs);
	});

	// When the Firebase for the Markers is loaded, add them to the map
	firebaseRef.main.child('markers').on('value', function(snapshot) {
		var rawData = snapshot.val(); // Raw data from the Firebase
		var marker;
		var latlng;

		for(var i=0; i<rawData.length; i++) {
			latlng = {lat: rawData[i].lat, lng: rawData[i].lng};

			marker = new google.maps.Marker({
				position: latlng,
				map: map,
				title: rawData[i].name
			});
		}

	});
};

/***** Fix the format of the boundaries that come from the Firebase *****/
mapObj.fixBoundaries = function(boundaries) {
	var tempBoundaries = boundaries.split(',. '); // Boundaries as strings
	var fixedBoundaries = []; // Boundaries as objects

	// Loop through all the boundary strings and turn them into objects
	for(var i=0; i<tempBoundaries.length; i++) {
		fixedBoundaries.push(JSON.parse(tempBoundaries[i]));
	}

	// Return the array of boundary objects
	return fixedBoundaries;
};

/***** Google Maps Function and Highlighted Areas *****/
mapObj.path; // Holds the current path on the map
mapObj.map; // Holds the map object
mapObj.createMap = function(boundaries, locations) {
	var mapOptions = {
		zoom: 9,
		center: new google.maps.LatLng(47.60292227835496, -122.2507095336914),
		mapTypeId: google.maps.MapTypeId.ROADMAP //TERRAIN
	};

	// Get the map element
	map = new google.maps.Map(document.getElementById('map-canvas'),
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
			mapObj.path = poly.getPath();

			// Append a new coord, and it will appear on the map
			mapObj.path.push(event.latLng);

			// Append the new boundary value to the textbox
			// Beginning line
			if(newBoundariesText.value === '') {
				newBoundariesText.value = '{"lat": ' + event.latLng.lat() + ', "lng": ' + event.latLng.lng() + '}';
			} else {;
				newBoundariesText.value += ',. {"lat": ' + event.latLng.lat() + ', "lng": ' + event.latLng.lng() + '}';
			}
		}
	});

	mapObj.newPath();
};

// This code is used for creating new polygon areas
mapObj.newPath = function() {
		var newBoundariesCheck = document.getElementsByClassName('new-area-boundaries-check')[0];
	var newBoundariesText = document.getElementsByClassName('new-area-boundaries-text')[0];

	newBoundariesCheck.onclick = function() {
		// If the checkbox isn't checked, then remove the boundaries textbox from the page,
		// clear the path on the polyline, and reset the value of the boundaries textbox
		if(!newBoundariesCheck.checked) {
			newBoundariesText.className += ' invisible';

			if(mapObj.path) {
				mapObj.path.clear();
			}
			newBoundariesText.value = '';
		} else {
			// Otherwise, show the new boundaries textbox
			newBoundariesText.className = newBoundariesText.className.replace(' invisible', '');
		}
	}
};

/***** The Map Key *****/
mapObj.createMapKey = function(locations) {
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
};

mapObj.start();