var loginButton = document.getElementById('login');
var addButton = document.getElementById('add');
var currentZonesButton = document.getElementById('current-zones');
var currentMarkersButton = document.getElementById('current-markers');

loginButton.addEventListener('click', login);
addButton.addEventListener('click', loginFirst);
currentZonesButton.addEventListener('click', loginFirst);
currentMarkersButton.addEventListener('click', loginFirst);

var ref = new Firebase("https://blistering-torch-7640.firebaseio.com");

var locationsObjs;

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
			console.log(authData.displayName);
			console.log(authData.uid);

			// If successful:
			// Display information
			ref.child('zones').on('value', function(snapshot) {
				var rawData = snapshot.val(); // Raw data from the Firebase
				locationsObjs = [];	// Holds the location objects

				// Move the objects into an array
				for(var index in rawData) {
					var attr = rawData[index];
					locationsObjs.push(attr);
				}

				//displayBoundaryInfo(locationsObjs);

				// Remove loginFirst messages
				loginButton.removeEventListener('click', loginFirst);
				addButton.removeEventListener('click', loginFirst);
				currentZonesButton.removeEventListener('click', loginFirst);
				currentMarkersButton.removeEventListener('click', loginFirst);
			});

			addButton.addEventListener('click', add);
			currentZonesButton.addEventListener('click', displayBoundaryInfo(locationsObjs));

			// Hide the login button
			loginButton.className += ' invisible';
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
	if(!removeBoundaryInfo();) {
		displayBoundaryInfo();
	}
}

function removeBoundaryInfo() {
	var old = document.getElementsByClassName('info-container');
	var oldInfoHeading = document.getElementsByClassName('info-container-heading');
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
	infoContainer.className = 'info-container';

	var currentInfo = document.createElement('h2');
	var infoHeading = document.createTextNode('Current Information');
	infoHeading.className = 'info-container-heading';
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
		tempColorDiv.className = 'color';

		tempNameDiv = document.createElement('div');
		tempName = document.createTextNode(locationsObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'name';

		tempBoundariesDiv = document.createElement('div');
		tempBoundaries = document.createTextNode(locationsObjs[i].boundaries);
		tempBoundariesDiv.appendChild(tempBoundaries);
		tempBoundariesDiv.className = 'boundaries';

		tempDiv.appendChild(tempNameDiv);
		tempDiv.appendChild(tempColorDiv);
		tempDiv.appendChild(tempBoundariesDiv);

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