/*****
"Shadowrun Map" by Isabeau Kisler
Application shows zones and map markers from the roleplaying game, Shadowrun 2050.

New information can be added to the database through add.html.

Project created for a personal Shadowrun game, using Firebase and Google Maps API.

11/15
*****/

/***** Manages setting up the Firebase *****/
// Create a reference to the Firebase containing zone information.
var firebaseRef = {
	main: new Firebase('https://blistering-torch-7640.firebaseio.com/')
};

/***** Manages error messages *****/
var errorsObj = {};
errorsObj.showErrorMessage = function(error) {
	// Remove any old errors
	this.removeOldErrors();

	var errorMessageContainer = document.getElementsByClassName('error-message-container')[0];
	errorMessageContainer.value = '';

	var errorMessage = document.createElement('li');
	errorMessage.className = 'error-message';
	var message = document.createTextNode(error);

	errorMessageContainer.className = errorMessageContainer.className.replace('invisible', '');

	errorMessage.appendChild(message);
	errorMessageContainer.appendChild(errorMessage);

};

errorsObj.removeOldErrors = function() {
	var errorMessageContainer = document.getElementsByClassName('error-message-container')[0];

	while(errorMessageContainer.firstChild) {
		errorMessageContainer.removeChild(errorMessageContainer.firstChild);
	}
}

/***** Manages setting up the buttons and loggin in *****/
var loginObj = Object.create(errorsObj);

loginObj.setUpButtons = function() {
	this.goHome = document.getElementById('go-home');
	this.loginButton = document.getElementById('login');
	this.addZonesButton = document.getElementById('add-zones');
	this.addMarkersButton = document.getElementById('add-markers');
	this.currentZonesButton = document.getElementById('current-zones');
	this.currentMarkersButton = document.getElementById('current-markers');

	// Send the user back to the map page
	this.goHome.addEventListener('click', function() {
		location.href='map.html';
	});

	this.loginButton.addEventListener('click', loginObj.login);
	this.addZonesButton.addEventListener('click', loginObj.loginFirst);
	this.addMarkersButton.addEventListener('click', loginObj.loginFirst);

	// Disable the buttons until the Firebase has time to load
	this.currentZonesButton.disabled = true;
	this.currentMarkersButton.disabled = true;

	setTimeout(function(){
		loginObj.currentZonesButton.disabled = false;
		loginObj.currentMarkersButton.disabled = false;
	}, 2000);

	this.currentZonesButton.addEventListener('click', addZonesObj.currentZonesToggle);
	this.currentMarkersButton.addEventListener('click', addMarkersObj.currentMarkersToggle);
};

/***** Tell the user to login first to add new information *****/
loginObj.loginFirst = function() {
	loginObj.showErrorMessage('Please log in first.');
};

/***** Login Users *****/
loginObj.login = function() {
	firebaseRef.main.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			if (error.code === "TRANSPORT_UNAVAILABLE") {
				firebaseRef.main.authWithOAuthRedirect("google", function(error) {
					loginObj.showErrorMessage('Login failed!  Check your internet connection and try again');
				});
			} else {
				loginObj.showErrorMessage('Login failed!  Check your internet connection and try again');
			}
		} else {
			// If successful:
			// Remove any error messages
			removeOldErrors();

			// Remove loginFirst messages
			loginObj.addZonesButton.removeEventListener('click', loginObj.loginFirst);
			loginObj.addMarkersButton.removeEventListener('click', loginObj.loginFirst);

			// Hide the login button
			loginObj.loginButton.className += ' invisible';

			// Add addNew functions
			loginObj.addZonesButton.addEventListener('click', addZonesObj.addNewZone);
			loginObj.addMarkersButton.addEventListener('click', addMarkersObj.addNewMarker);

			// Show a message saying that login was successful
			loginObj.showErrorMessage('Login successful');
		}
	});
};

/***** Helps manage adding information to the page *****/
var addInfo = Object.create(errorsObj);
addInfo.setUpFirebase = function(child) {
	var ref = firebaseRef.main.child(child);
	var arrObjs = [];
	
	ref.orderByChild('name').on('value', function(snapshot) {
		var rawData = snapshot.val(); // Raw data from the Firebase

		// Move the objects into an array
		for(var index in rawData) {
			var attr = rawData[index];
			arrObjs.push(attr);
		}
	});

	return arrObjs;
}

/***** Remove the selected information from the page *****/
addInfo.removeInfo = function(infoContainer, infoHeader) {
	var main = document.getElementsByTagName('main')[0];
	var old = document.getElementsByClassName(infoContainer);
	var oldInfoHeading = document.getElementsByClassName(infoHeader);
	
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
};

/***** Manages the zone boundaries *****/
var addZonesObj = Object.create(addInfo);
addZonesObj.locationsObjs = addZonesObj.setUpFirebase('zones');

/***** Toggles the display of current zone information *****/
addZonesObj.currentZonesToggle = function() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	if(!addZonesObj.removeInfo('info-container-zones', 'info-container-zones-heading')) {
		addZonesObj.displayBoundaryInfo();
	}
};

/***** Display current zones information *****/
addZonesObj.displayBoundaryInfo = function() {
	// Get the main element
	var main = document.getElementsByTagName('main')[0];

	// If the info container already exists on the page, destroy it
	// This is in case the Firebase is updated while someone is looking at it
	addZonesObj.removeInfo('info-container-zones', 'info-container-zones-heading');

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

	for(var i=0; i<addZonesObj.locationsObjs.length; i++) {
		tempDiv = document.createElement('div');
		tempDiv.className = 'location-item';

		tempColorDiv = document.createElement('div');
		tempColor = document.createTextNode(addZonesObj.locationsObjs[i].color);
		tempColorDiv.appendChild(tempColor);
		tempColorDiv.className = 'zone-color line-item';

		tempNameDiv = document.createElement('div');
		tempName = document.createTextNode(addZonesObj.locationsObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'zone-name line-item';

		tempBoundariesDiv = document.createElement('div');
		tempBoundaries = document.createTextNode(addZonesObj.locationsObjs[i].boundaries);
		tempBoundariesDiv.appendChild(tempBoundaries);
		tempBoundariesDiv.className = 'zone-boundaries';

		tempDiv.appendChild(tempNameDiv);
		tempDiv.appendChild(tempColorDiv);
		tempDiv.appendChild(tempBoundariesDiv);

		infoContainer.appendChild(tempDiv);
	}

	main.appendChild(currentInfo);
	main.appendChild(infoContainer);
};

/***** Add new zone to Firebase *****/
addZonesObj.addNewZone = function() {
	// ValidateZone returns false if the new information was NOT valid.
	// So here, we leave the function if it returns false.
	if(!addZonesObj.validateZone()) {
		return false;
	}

	// Remove any old errors
	addZonesObj.removeOldErrors();

	// Get the contents of the input boxes
	var newName = document.getElementsByClassName('add-item-name')[0];
	var newColor = document.getElementsByClassName('add-item-color')[0];
	var newBoundaries = document.getElementsByClassName('add-item-boundaries')[0];
	var zonesRef = firebaseRef.main.child('zones'); // The zones section of the Firebase

	// Push a new zone into the Firebase
	var newBoundary = zonesRef.push();
	newBoundary.set({
		'name': newName.value,
		'color': newColor.value,
		'boundaries': newBoundaries.value
	}, function(error){ // If information isn't added to the Firebase, show an error
		if(error) {
			addZonesObj.showErrorMessage('New zone not added.  Error: ' + error);
		} else {
			addZonesObj.showErrorMessage('New zone added');
		}
	});

	// Reset the input boxes back to empty
	newName.value = '';
	newColor.value = '';
	newBoundaries.value = '';
};

/**** Validation *****/
addZonesObj.validateZone = function() {
	var newName = document.getElementsByClassName('add-item-name')[0].value;
	var newColor = document.getElementsByClassName('add-item-color')[0].value;
	var newBoundaries = document.getElementsByClassName('add-item-boundaries')[0].value;
	var valid = true;

	// Name can be anything, I don't care
	if(newName.length === 0) {
		addZonesObj.showErrorMessage('Enter name');
		valid = false;
	}

	// Hex Colors
	if(newColor.search(/#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b/) < 0) {
		addZonesObj.showErrorMessage('Enter a hex value, in this format: #000000 or #000');
		valid = false;

	}
	// Boundaries
	if(newBoundaries.search(/{"lat": -?([0-9]){1,}.([0-9]){1,}, "lng": -?([0-9]){1,}.([0-9]){1,}},./) < 0) {
		addZonesObj.showErrorMessage('Enter valid boundaries in the correct format');
		valid = false;
	}
	// If anything is invalid, leave the function
	if(!valid) {
		return false;
	}

	return true;
};


/***** Manages the markers *****/
var addMarkersObj = Object.create(addInfo);
addMarkersObj.markerObjs = addMarkersObj.setUpFirebase('markers');

/***** Toggles the display of current marker information *****/
addMarkersObj.currentMarkersToggle = function() {
	// If the info-container exists, delete it.
	// otherwise, display it.
	//if(!removeMarkerInfo()) {
	if(!addMarkersObj.removeInfo('info-container-markers', 'info-container-markers-heading')) {
		addMarkersObj.displayMarkerInfo();
	}
};

/***** Display current markers information *****/
addMarkersObj.displayMarkerInfo = function() {
	// Get the main element
	var main = document.getElementsByTagName('main')[0];

	// If the info container already exists on the page, destroy it
	// This is in case the Firebase is updated while someone is looking at it
	addMarkersObj.removeInfo('info-container-markers', 'info-container-markers-heading');

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

	for(var i=0; i<addMarkersObj.markerObjs.length; i++) {
		tempDiv = document.createElement('div');
		tempDiv.className = 'location-item';

		tempNameDiv = document.createElement('div');
		tempName = document.createTextNode(addMarkersObj.markerObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'marker-name line-item';

		tempLatDiv = document.createElement('div');
		tempLat = document.createTextNode(addMarkersObj.markerObjs[i].lat);
		tempLatDiv.appendChild(tempLat);
		tempLatDiv.className = 'marker-lat line-item';

		tempLngDiv = document.createElement('div');
		tempLng = document.createTextNode(addMarkersObj.markerObjs[i].lng);
		tempLngDiv.appendChild(tempLng);
		tempLngDiv.className = 'marker-lng line-item';

		tempDiv.appendChild(tempNameDiv);
		tempDiv.appendChild(tempLatDiv);
		tempDiv.appendChild(tempLngDiv);

		infoContainer.appendChild(tempDiv);
	}

	main.appendChild(currentInfo);
	main.appendChild(infoContainer);
};

/***** Add new marker to Firebase *****/
addMarkersObj.addNewMarker = function() {
	// ValidateMarker returns false if the new information was NOT valid.
	// So here, we leave the function if it returns false.
	if(!addMarkersObj.validateMarker()) {
		return false;
	}

	// Remove any old errors
	addMarkersObj.removeOldErrors();

	// Get the contents of the input boxes
	var newName = document.getElementsByClassName('add-item-marker-name')[0];
	var newLat = document.getElementsByClassName('add-item-marker-lat')[0];
	var newLng = document.getElementsByClassName('add-item-marker-lng')[0];
	var markersRef = firebaseRef.main.child('markers'); // The markers section of the Firebase

	// Push a new marker into the Firebase
	var newMarker = markersRef.push();
	newMarker.set({
		'name': newName.value,
		'lat': newLat.value,
		'lng': newLng.value
	}, function(error){ // If information isn't added to the Firebase, show an error
		if(error) {
			addMarkersObj.showErrorMessage('New marker not added.  Error: ' + error);
		} else {
			addMarkersObj.showErrorMessage('New marker added');
		}
	});

	// Reset the input boxes back to empty
	newName.value = '';
	newLat.value = '';
	newLng.value = '';
};

/**** Validation *****/
addMarkersObj.validateMarker = function() {
	var newName = document.getElementsByClassName('add-item-marker-name')[0].value;
	var newLat = document.getElementsByClassName('add-item-marker-lat')[0].value;
	var newLng = document.getElementsByClassName('add-item-marker-lng')[0].value;
	var valid = true;

	// Name can be anything, I don't care
	if(newName.length === 0) {
		addMarkersObj.showErrorMessage('Enter name');
		valid = false;
	}

	// Lat and Lng are both doubles
	if(newLat.search(/-?(?:\d*\.)?\d+/) < 0) {
		addMarkersObj.showErrorMessage('Enter a valid latitude');
		valid = false;

	}

	if(newLng.search(/-?(?:\d*\.)?\d+/) < 0) {
		addMarkersObj.showErrorMessage('Enter a valid longitude');
		valid = false;
	}
	// If anything is invalid, leave the function
	if(!valid) {
		return false;
	}

	return true;
};

/***** Set up the page *****/
loginObj.setUpButtons();