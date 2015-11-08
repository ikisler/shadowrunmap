var loginButton = document.getElementById('login');

var ref = new Firebase("https://blistering-torch-7640.firebaseio.com");

function login() {
	ref.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", authData);


		}
	});
}

loginButton.addEventListener('click', login);

// My UID: google:115312161939888854395

function displayInfo() {
	// When the Firebase is loaded, do all the things
	ref.child('zones').on('value', function(snapshot) {
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

		var infoContainer = document.createElement('div');
		infoContainer.className = 'info-container';

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

			tempDiv.appendChild(tempColorDiv);
			tempDiv.appendChild(tempName);

			infoContainer.appendChild(tempDiv);
		}

	});
}