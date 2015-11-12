var loginButton = document.getElementById('login');
var addButton = document.getElementById('add');
var currentZonesButton = document.getElementById('current-zones');
var currentMarkersButton = document.getElementById('current-markers');

loginButton.addEventListener('click', login);
addButton.addEventListener('click', loginFirst);
//currentZonesButton.addEventListener('click', loginFirst);
//currentMarkersButton.addEventListener('click', loginFirst);

// Disable the buttons until the Firebase has time to load
currentZonesButton.disabled = true;
currentMarkersButton.disabled = true;

setTimeout(function(){
	currentZonesButton.disabled = false;
	currentMarkersButton.disabled = false;
}, 2000);

/*
// Disable the buttons until the Firebase is loaded
			addButton.disabled = true;
			currentZonesButton.disabled = true;
			currentMarkersButton.disabled = true;
			
			setTimeout(function(){
				addButton.disabled = false;
				currentZonesButton.disabled = false;
				currentMarkersButton.disabled = false;

				addButton.addEventListener('click', add);
				currentZonesButton.addEventListener('click', currentZonesToggle);
			}, 5000);
*/

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

	console.log(markerObjs);
});

currentZonesButton.addEventListener('click', currentZonesToggle);
currentMarkersButton.addEventListener('click', currentMarkersToggle);

/***** Login Users *****/
function login() {
	ref.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
//			if (error.code === "TRANSPORT_UNAVAILABLE") {
//				ref.authWithOAuthRedirect("google", function(error) {
//					console.log("BING");
//					console.log(authData);
//				});
//			} else {
				console.log("Login Failed!", error);
//			}
		} else {
			console.log("Authenticated successfully with payload:", authData);
			console.log(authData.uid);

			// If successful:
			// Remove any error messages
			removeOldErrors();

			// Remove loginFirst messages
			addButton.removeEventListener('click', loginFirst);

			// Hide the login button
			loginButton.className += ' invisible';

			addButton.addEventListener('click', add);
		}
	});
}


// My UID: google:115312161939888854395

function loginFirst() {
	showErrorMessage('Please log in first.');
}

// Toggles the display of the current zones.
// After login, attached to the currentZonesButton
function currentZonesToggle() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	if(!removeBoundaryInfo()) {
		displayBoundaryInfo();
	}
}

function currentMarkersToggle() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	if(!removeMarkerInfo()) {
		displayMarkerInfo();
	}
}

function removeBoundaryInfo() {
	var main = document.getElementsByTagName('main')[0];
	var old = document.getElementsByClassName('info-container-zones');
	var oldInfoHeading = document.getElementsByClassName('info-container-zones-heading');
	
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

function removeMarkerInfo() {
	var main = document.getElementsByTagName('main')[0];
	var old = document.getElementsByClassName('info-container-markers');
	var oldInfoHeading = document.getElementsByClassName('info-container-markers-heading');
	
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

/***** Display Current Zones Information *****/
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

/***** Display Current Markers Information *****/
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


/***** Add New Zone to Firebase *****/
function add() {
	var newName = document.getElementsByClassName('add-item-name')[0].value;
	var newColor = document.getElementsByClassName('add-item-color')[0].value;
	var newBoundaries = document.getElementsByClassName('add-item-boundaries')[0].value;

	// Validation
	if(!validate()) {
		return false;
	}

	var zonesRef = ref.child('zones');

	var newBoundary = zonesRef.push();
	newBoundary.set({
		'name': newName,
		'color': newColor,
		'boundaries': newBoundaries
	});

	newName = '';
	newColor = '';
	newBoundaries = '';
}

/**** Validation *****/
function validate() {
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

/***** Remove Error Messages *****/
function removeOldErrors() {
	var errorMessageContainer = document.getElementsByClassName('error-message-container')[0];

	while(errorMessageContainer.firstChild) {
		errorMessageContainer.removeChild(errorMessageContainer.firstChild);
	}
}