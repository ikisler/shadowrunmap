/*****
"Shadowrun Map" by Isabeau Kisler
Application shows zones and map markers from the roleplaying game, Shadowrun 2050.

New information can be added to the database through add.html.

Project created for a personal Shadowrun game, using Firebase and Google Maps API.

11/15
*****/

// Buttons
var goHome = document.getElementById('go-home');
var loginButton = document.getElementById('login');
var addZonesButton = document.getElementById('add-zones');
var addMarkersButton = document.getElementById('add-markers');
var currentZonesButton = document.getElementById('current-zones');
var currentMarkersButton = document.getElementById('current-markers');

// Send the user back to the map page
goHome.addEventListener('click', function() {
	location.href='index.html';
});

loginButton.addEventListener('click', login);
addZonesButton.addEventListener('click', loginFirst);
addMarkersButton.addEventListener('click', loginFirst);

// Disable the buttons until the Firebase has time to load
currentZonesButton.disabled = true;
currentMarkersButton.disabled = true;

setTimeout(function(){
	currentZonesButton.disabled = false;
	currentMarkersButton.disabled = false;
}, 2000);

var ref = new Firebase("https://blistering-torch-7640.firebaseio.com");

var locationsObjs;
var markerObjs;

// Set up info to see the current information in the Firebase
ref.child('zones').on('value', function(snapshot) {
	var rawData = snapshot.val(); // Raw data from the Firebase
	locationsObjs = [];	// Holds the location objects

	// Move the objects into an array
	for(var index in rawData) {
		var attr = rawData[index];
		locationsObjs.push(attr);
	}
});

ref.child('markers').on('value', function(snapshot) {
	var rawData = snapshot.val(); // Raw data from the Firebase
	markerObjs = []; // Holds the marker objects

	// Move the objects into an array
	for(var index in rawData) {
		var attr = rawData[index];
		markerObjs.push(attr);
	}
});

// After the Firebase is loaded, add listeners to toggle the display of information
currentZonesButton.addEventListener('click', currentZonesToggle);
currentMarkersButton.addEventListener('click', currentMarkersToggle);

/***** Login Users *****/
function login() {
	ref.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			if (error.code === "TRANSPORT_UNAVAILABLE") {
				ref.authWithOAuthRedirect("google", function(error) {
					showErrorMessage('Login failed!  Check your internet connection and try again');
				});
			} else {
				showErrorMessage('Login failed!  Check your internet connection and try again');
			}
		} else {
			// If successful:
			// Remove any error messages
			removeOldErrors();

			// Remove loginFirst messages
			addZonesButton.removeEventListener('click', loginFirst);
			addMarkersButton.removeEventListener('click', loginFirst);

			// Hide the login button
			loginButton.className += ' invisible';

			// Add addNew functions
			addZonesButton.addEventListener('click', addNewZone);
			addMarkersButton.addEventListener('click', addNewMarker);

			// Show a message saying that login was successful
			showErrorMessage('Login successful');
		}
	});
}

/***** Tell the user to login first to add new information *****/
function loginFirst() {
	showErrorMessage('Please log in first.');
}

/***** Toggles the display of current zone information *****/
function currentZonesToggle() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	if(!removeBoundaryInfo()) {
		displayBoundaryInfo();
	}
}

/***** Toggles the display of current marker information *****/
function currentMarkersToggle() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	if(!removeMarkerInfo()) {
		displayMarkerInfo();
	}
}

/***** Display current zones information *****/
function displayBoundaryInfo() {
	// Get the main element
	var main = document.getElementsByTagName('main')[0];

	// If the info container already exists on the page, destroy it
	// This is in case the Firebase is updated while someone is looking at it
	removeBoundaryInfo();

	var infoContainer = document.createElement('div');
	infoContainer.className = 'info-container-zones';

	var currentInfo = document.createElement('h2');
	var infoHeading = document.createTextNode('Current Zones Information');
	currentInfo.className = 'info-container-zones-heading';
	currentInfo.appendChild(infoHeading);

	var tempDiv;
	var tempColorDiv;
	var tempColor;
	var tempNameDiv;
	var tempName;
	var tempBoundariesDiv;
	var tempBoundaries;

	for(var i=0; i<locationsObjs.length; i++) {
		tempDiv = document.createElement('div');
		tempDiv.className = 'location-item';

		tempColorDiv = document.createElement('div');
		tempColor = document.createTextNode(locationsObjs[i].color);
		tempColorDiv.appendChild(tempColor);
		tempColorDiv.className = 'zone-color line-item';

		tempNameDiv = document.createElement('div');
		tempName = document.createTextNode(locationsObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'zone-name line-item';

		tempBoundariesDiv = document.createElement('div');
		tempBoundaries = document.createTextNode(locationsObjs[i].boundaries);
		tempBoundariesDiv.appendChild(tempBoundaries);
		tempBoundariesDiv.className = 'zone-boundaries';

		tempDiv.appendChild(tempNameDiv);
		tempDiv.appendChild(tempColorDiv);
		tempDiv.appendChild(tempBoundariesDiv);

		infoContainer.appendChild(tempDiv);
	}

	main.appendChild(currentInfo);
	main.appendChild(infoContainer);
}

/***** Display current markers information *****/
function displayMarkerInfo() {
	// Get the main element
	var main = document.getElementsByTagName('main')[0];

	// If the info container already exists on the page, destroy it
	// This is in case the Firebase is updated while someone is looking at it
	removeMarkerInfo();

	var infoContainer = document.createElement('div');
	infoContainer.className = 'info-container-markers';

	var currentInfo = document.createElement('h2');
	var infoHeading = document.createTextNode('Current Marker Information');
	currentInfo.className = 'info-container-markers-heading';
	currentInfo.appendChild(infoHeading);

	var tempDiv;
	var tempLatDiv;
	var tempLat;
	var tempLngDiv;
	var tempLng;
	var tempNameDiv;
	var tempName;

	for(var i=0; i<markerObjs.length; i++) {
		tempDiv = document.createElement('div');
		tempDiv.className = 'location-item';

		tempNameDiv = document.createElement('div');
		tempName = document.createTextNode(markerObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'marker-name line-item';

		tempLatDiv = document.createElement('div');
		tempLat = document.createTextNode(markerObjs[i].lat);
		tempLatDiv.appendChild(tempLat);
		tempLatDiv.className = 'marker-lat line-item';

		tempLngDiv = document.createElement('div');
		tempLng = document.createTextNode(markerObjs[i].lng);
		tempLngDiv.appendChild(tempLng);
		tempLngDiv.className = 'marker-lng line-item';

		tempDiv.appendChild(tempNameDiv);
		tempDiv.appendChild(tempLatDiv);
		tempDiv.appendChild(tempLngDiv);

		infoContainer.appendChild(tempDiv);
	}

	main.appendChild(currentInfo);
	main.appendChild(infoContainer);
}

/***** Remove the zone information from the page *****/
function removeBoundaryInfo() {
	var main = document.getElementsByTagName('main')[0];
	var old = document.getElementsByClassName('info-container-zones');
	var oldInfoHeading = document.getElementsByClassName('info-container-zones-heading');
	
	// If the info-container-zones div exists on the page, remove it and it's heading.
	if(old.length > 0) {
		main.removeChild(oldInfoHeading[0]);
		main.removeChild(old[0]);
		// Info-container was removed
		return true;
	} else {
		// info-container didn't exist
		return false;
	}
}

/***** Remove the marker information from the page *****/
function removeMarkerInfo() {
	var main = document.getElementsByTagName('main')[0];
	var old = document.getElementsByClassName('info-container-markers');
	var oldInfoHeading = document.getElementsByClassName('info-container-markers-heading');
	
	// If the info-container-markers div exists on the page, remove it and it's heading.
	if(old.length > 0) {
		main.removeChild(oldInfoHeading[0]);
		main.removeChild(old[0]);
		// Info-container was removed
		return true;
	} else {
		// info-container didn't exist
		return false;
	}
}

/***** Add new zone to Firebase *****/
function addNewZone() {
	// ValidateZone returns false if the new information was NOT valid.
	// So here, we leave the function if it returns false.
	if(!validateZone()) {
		return false;
	}

	// Remove any old errors
	removeOldErrors();

	// Get the contents of the input boxes
	var newName = document.getElementsByClassName('add-item-name')[0];
	var newColor = document.getElementsByClassName('add-item-color')[0];
	var newBoundaries = document.getElementsByClassName('add-item-boundaries')[0];
	var zonesRef = ref.child('zones'); // The zones section of the Firebase

	// Push a new zone into the Firebase
	var newBoundary = zonesRef.push();
	newBoundary.set({
		'name': newName.value,
		'color': newColor.value,
		'boundaries': newBoundaries.value
	}, function(error){ // If information isn't added to the Firebase, show an error
		showErrorMessage('New zone not added.  Error: ' + error);
	});

	// Reset the input boxes back to empty
	newName.value = '';
	newColor.value = '';
	newBoundaries.value = '';
}

/***** Add new marker to Firebase *****/
function addNewMarker() {
	// ValidateMarker returns false if the new information was NOT valid.
	// So here, we leave the function if it returns false.
	if(!validateMarker()) {
		return false;
	}

	// Remove any old errors
	removeOldErrors();

	// Get the contents of the input boxes
	var newName = document.getElementsByClassName('add-item-marker-name')[0];
	var newLat = document.getElementsByClassName('add-item-marker-lat')[0];
	var newLng = document.getElementsByClassName('add-item-marker-lng')[0];
	var markersRef = ref.child('markers'); // The markers section of the Firebase

	// Push a new marker into the Firebase
	var newMarker = markersRef.push();
	newMarker.set({
		'name': newName.value,
		'lat': newLat.value,
		'lng': newLng.value
	}, function(error){ // If information isn't added to the Firebase, show an error
		showErrorMessage('New marker not added.  Error: ' + error);
	});

	// Reset the input boxes back to empty
	newName.value = '';
	newLat.value = '';
	newLng.value = '';
}

/**** Validation *****/
function validateZone() {
	var newName = document.getElementsByClassName('add-item-name')[0].value;
	var newColor = document.getElementsByClassName('add-item-color')[0].value;
	var newBoundaries = document.getElementsByClassName('add-item-boundaries')[0].value;
	var valid = true;

	// Name can be anything, I don't care
	if(newName.length === 0) {
		showErrorMessage('Enter name');
		valid = false;
	}

	// Hex Colors
	if(newColor.search(/#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/) < 0) {
		showErrorMessage('Enter a hex value, in this format: #000000 or #000');
		valid = false;

	}
	// Boundaries
	if(newBoundaries.search(/{"lat": -?([0-9]){1,}.([0-9]){1,}, "lng": -?([0-9]){1,}.([0-9]){1,}},./) < 0) {
		showErrorMessage('Enter valid boundaries in the correct format');
		valid = false;
	}
	// If anything is invalid, leave the function
	if(!valid) {
		return false;
	}

	return true;
}

function validateMarker() {
	var newName = document.getElementsByClassName('add-item-marker-name')[0].value;
	var newLat = document.getElementsByClassName('add-item-marker-lat')[0].value;
	var newLng = document.getElementsByClassName('add-item-marker-lng')[0].value;
	var valid = true;

	// Name can be anything, I don't care
	if(newName.length === 0) {
		showErrorMessage('Enter name');
		valid = false;
	}

	// Lat and Lng are both doubles
	if(newLat.search(/-?(?:\d*\.)?\d+/) < 0) {
		showErrorMessage('Enter a valid latitude');
		valid = false;

	}

	if(newLng.search(/-?(?:\d*\.)?\d+/) < 0) {
		showErrorMessage('Enter a valid longitude');
		valid = false;
	}
	// If anything is invalid, leave the function
	if(!valid) {
		return false;
	}

	return true;
}

/***** Show an error message *****/
function showErrorMessage(error) {
	// Remove any old errors
	removeOldErrors();

	var errorMessageContainer = document.getElementsByClassName('error-message-container')[0];
	errorMessageContainer.value = '';

	var errorMessage = document.createElement('li');
	errorMessage.className = 'error-message';
	var message = document.createTextNode(error);

	errorMessageContainer.className = errorMessageContainer.className.replace('invisible', '');

	errorMessage.appendChild(message);
	errorMessageContainer.appendChild(errorMessage);

}

/***** Remove error message(s) *****/
function removeOldErrors() {
	var errorMessageContainer = document.getElementsByClassName('error-message-container')[0];

	while(errorMessageContainer.firstChild) {
		errorMessageContainer.removeChild(errorMessageContainer.firstChild);
	}
}