var loginButton = document.getElementById('login');

var ref = new Firebase("https://blistering-torch-7640.firebaseio.com");

function login() {
	ref.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", authData);

			// If successful:
			// Display information
			ref.child('zones').on('value', function(snapshot) {
				var rawData = snapshot.val(); // Raw data from the Firebase
				var locationsObjs = [];	// Holds the location objects
				var locationBoundaries = []; // Holds the corrected location boundaries

				// Move the objects into an array
				for(var index in rawData) {
					var attr = rawData[index];
					locationsObjs.push(attr);
				}

				displayInfo(locationsObjs);
			});

			// Hide the login button
			loginButton.className += ' invisible';
		}
	});
}

loginButton.addEventListener('click', login);

// My UID: google:115312161939888854395

function displayInfo(locationsObjs) {
	// Get the main element
	var main = document.getElementsByTagName('main')[0];

	var infoContainer = document.createElement('div');
	infoContainer.className = 'info-container';

	var currentInfo = document.createElement('h2');
	var infoHeading = document.createTextNode('Current Information');
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

		tempColorDiv = document.createElement('span');
		tempColor = document.createTextNode(locationsObjs[i].color);
		tempColorDiv.appendChild(tempColor);
		tempColorDiv.className = 'color';

		tempNameDiv = document.createElement('span');
		tempName = document.createTextNode(locationsObjs[i].name);
		tempNameDiv.appendChild(tempName);
		tempNameDiv.className = 'name';

		tempBoundariesDiv = document.createElement('span');
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