/*****
"Shadowrun Map" by Isabeau Kisler
Website for a personal Shadowrun 2050 Game.

Includes:
-- Maps page that shows zones and map markers from the game.
-- New map information can be added through add.html
-- Characters page that show character information
-- Runs page that details in-game adventures

Project created for a personal Shadowrun game, using Firebase and Google Maps API.

11/15
*****/

/***** Setting up the Firebase *****/
// Create a reference to the Firebase containing zone information.
var firebaseRef = {
	main: new Firebase('https://blistering-torch-7640.firebaseio.com/')
};

/***** Manages creating different posts for pages *****/
var createPosts = {};

// Create a text post
createPosts.createTextPost = function() {
	var article = document.createElement('article');
	var postHeader = document.createElement('div');
	postHeader.className = 'post-header';
	var postTitle = document.createElement('span');
	postTitle.className = 'post-title';
	var postDate = document.createElement('span');
	postDate.className = 'post-date';
	var postBody = document.createElement('div');
	postBody.className = 'post-body';

	// Add the title and date to the header
	postHeader.appendChild(postTitle);
	postHeader.appendChild(postDate);

	// Add all the pieces to the article
	article.appendChild(postHeader);
	article.appendChild(postBody);

	return {article: article, title: postTitle, date: postDate, body: postBody};
};

// Create an image post
createPosts.createImagePost = function() {
	var bio = document.createElement('div');
	bio.className = 'bio';
	var bioPortrait = document.createElement('figure');
	bioPortrait.className = 'bio-portrait';
	var bioPic = document.createElement('img');
	bioPic.className = 'bio-pic';
	var bioName = document.createElement('figcaption');
	bioName.className = 'bio-name';
	var bioDescription = document.createElement('div');
	bioDescription.className = 'bio-description';

	bioPortrait.appendChild(bioPic);
	bioPortrait.appendChild(bioName);

	bio.appendChild(bioPortrait);
	bio.appendChild(bioDescription);

	return {article: bio, image: bioPic, caption: bioName, description: bioDescription};
};

/***** INDEX.HTML *****/
/***** Manages updates and the hero slider *****/
var updatesObj = Object.create(createPosts);
updatesObj.imgs = [
	{
		src: 'img/screenshots/bios.jpg',
		description: 'About the Characters',
		link: 'bios.html'
	},
	{
		src: 'img/screenshots/map.jpg',
		description: 'Seattle Map',
		link: 'map.html'
	},
	{
		src: 'img/screenshots/runs.jpg',
		description: 'Runs',
		link: 'runs.html'
	}
];
updatesObj.heroImg = document.getElementsByClassName('hero-img')[0];
updatesObj.heroLink = document.getElementsByClassName('hero-link')[0];
updatesObj.heroDescription = document.getElementsByClassName('hero-description')[0];
updatesObj.featuredItem = document.getElementsByClassName('featured-item');
updatesObj.currentIndex = 0; // Keeps track of which image is being shown in the Hero section

updatesObj.showUpdates = function() {
	var that = this;

	var updatesContainer = document.getElementsByClassName('updates-container')[0];

	// Let the user know that there will be more content by loading a blank post first
	var article = this.createTextPost();
	updatesContainer.insertBefore(article.article, updatesContainer.childNodes[2]);

	firebaseRef.main.child('updates').on('value', function(snapshot) {
		var updates = snapshot.val(); // Raw data from the Firebase

		while(updatesContainer.childNodes[2]) {
			updatesContainer.removeChild(updatesContainer.childNodes[2]);
		}

		for(post in updates) {
			var newPost = that.createTextPost();
			newPost.title.innerHTML = updates[post].title;

			// Format Date
			var date = post;
			date = post.slice(0,2) + '/' + post.slice(2, 4) + '/' + post.slice(4, 6);

			newPost.date.innerHTML = date;

			newPost.body.innerHTML = updates[post].content;

			updatesContainer.insertBefore(newPost.article, updatesContainer.childNodes[2]);
		}

	});
};

updatesObj.iterateHeroSlider = function() {
	updatesObj.heroImg.src = updatesObj.imgs[updatesObj.currentIndex].src;
	updatesObj.heroLink.href = updatesObj.imgs[updatesObj.currentIndex].link;
	updatesObj.heroDescription.innerHTML = updatesObj.imgs[updatesObj.currentIndex].description;

	// If a featured item does not have the white-out class, add it
	for(var i=0; i<updatesObj.imgs.length; i++) {
		if(updatesObj.featuredItem[i].className.search('white-out') < 0) {
			updatesObj.featuredItem[i].className += ' white-out';
		}
	}

	// Then remove the white-out class from the currently chosen featured item
	updatesObj.featuredItem[updatesObj.currentIndex].className = updatesObj.featuredItem[updatesObj.currentIndex].className.replace(' white-out', '');

	// If the current index is about to go beyond the array, reset it back to zero
	if(updatesObj.currentIndex === 2) {
		updatesObj.currentIndex = 0;
	} else {
		updatesObj.currentIndex++;
	}
}

// Users can change the featured item by mousing over the desired one
updatesObj.changeFeaturedItem = function() {
	updatesObj.featuredItem[0].addEventListener('mouseover', function(){
		updatesObj.currentIndex = 0;
		updatesObj.iterateHeroSlider();
	});

	updatesObj.featuredItem[1].addEventListener('mouseover', function(){
		updatesObj.currentIndex = 1;
		updatesObj.iterateHeroSlider();
	});

	updatesObj.featuredItem[2].addEventListener('mouseover', function(){
		updatesObj.currentIndex = 2;
		updatesObj.iterateHeroSlider();
	});
};

updatesObj.start = function() {
	this.iterateHeroSlider();

	setInterval(this.iterateHeroSlider, 4000);

	this.showUpdates();

	this.changeFeaturedItem();
};


/***** RUNS.HTML *****/
/***** Manages the display of runs completed *****/
var runsObj = Object.create(createPosts);

runsObj.showRuns = function() {
	var that = this;
	var runsContainer = document.getElementsByClassName('runs-container')[0];

	// Let the user know that there will be more content by loading a blank post first
	var article = this.createTextPost();
	runsContainer.insertBefore(article.article, runsContainer.childNodes[2]);

	firebaseRef.main.child('runs').on('value', function(snapshot) {
		var runs = snapshot.val(); // Raw data from the Firebase

		while(runsContainer.childNodes[2]) {
			runsContainer.removeChild(runsContainer.childNodes[2]);
		}

		for(post in runs) {
			var newPost = that.createTextPost();

			newPost.title.innerHTML = runs[post].title;
			// Format Date
			var date = post;
			date = post.slice(0,2) + '/' + post.slice(2, 4) + '/' + post.slice(4, 6);

			newPost.date.innerHTML = date;

			newPost.body.innerHTML = runs[post].content;

			runsContainer.insertBefore(newPost.article, runsContainer.childNodes[2]);
		}

	});
};


/***** BIOS.HTML *****/
/***** Manages the character bios *****/
var biosObj = Object.create(createPosts);
biosObj.start = function() {
	var that = this;

	var main = document.getElementsByTagName('main')[0];

	var test = this.createImagePost();
	main.appendChild(test.article);

	/***** Error Handling *****/
	// If the browser can't cannot to the Firebase in five seconds, create and show an error message
	cannotConnect = setTimeout(function(){
		var errorMessage = document.createElement('div');
		errorMessage.className = 'error-message';
		var message = document.createTextNode('An error has occured.  Please check your internet connection or try again later.');
		errorMessage.appendChild(message);
		main.appendChild(errorMessage);

	}, 5000);

	// When the Firebase for the Characters is loaded, do all the things
	firebaseRef.main.child('characters').orderByChild('name').on('value', function(snapshot) {

		var characters = snapshot.val(); // Raw data from the Firebase

		// Clear the timeout for the error message
		clearTimeout(cannotConnect);

		// If the character information exists on the page already, remove it
		while(main.firstChild) {
			main.removeChild(main.firstChild);
		}

		for(var characterName in characters) {
			var bio = that.createImagePost();

			bio.caption.innerHTML = characterName;
			bio.image.src = characters[characterName].img;
			bio.image.alt = characterName + "'s pic";

			bio.description.innerHTML = characters[characterName].description;

			main.appendChild(bio.article);
		}
	});
};


/***** MAP.HTML *****/
/***** Manages the map *****/
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

		for(place in rawData) {
			if(rawData[place]) {
				latlng = {lat: rawData[place].lat, lng: rawData[place].lng};

				marker = new google.maps.Marker({
					position: latlng,
					map: mapObj.map,
					title: rawData[place].name
				});

				function helper(name, description) {
					var infowindow =  new google.maps.InfoWindow({
						content: '<div class="infowindow-header">' + name + '</div><p class="infowindow-content">' + description + '</p>'
					});

					return function() { infowindow.open(mapObj.map, this); };
				}
				// If there's a description, use that; otherwise, use a space
				if(rawData[place].description) {
					marker.addListener('click', helper(rawData[place].name, rawData[place].description));
				} else {
					marker.addListener('click', helper(rawData[place].name, ' '));
				}
			}
		}

		/* Does not work:

		for(var i=0; i<rawData.length; i++) {
			if(rawData[i]) {
				latlng = {lat: rawData[i].lat, lng: rawData[i].lng};

				marker = new google.maps.Marker({
					position: latlng,
					map: map,
					title: rawData[i].name
				});
			}
		}
		*/

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
	mapObj.map = new google.maps.Map(document.getElementById('map-canvas'),
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
		polygon.setMap(mapObj.map);

	}

	// This code is used for creating new polygon areas
	// Variable to hold a polyline for illustrating new boundaries
	var poly = new google.maps.Polyline({
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	});
	poly.setMap(mapObj.map);

	// The textbox that holds the new boundary text
	var newBoundariesText = document.getElementsByClassName('new-area-boundaries-text')[0];
	
	google.maps.event.addListener(mapObj.map, 'click', function(event) {
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


/***** ADD.HTML *****/
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

loginObj.start = function() {
	// Set up markers
	addMarkersObj.setup();

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

	// Track if a user is logged in or not
	this.loggedIn = false;
};

/***** Tell the user to login first to add new information *****/
loginObj.loginFirst = function() {
	loginObj.showErrorMessage('Please log in first.');
};

/***** Login Users *****/
loginObj.login = function() {
	firebaseRef.main.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			/*** This needs to get fixed later.
			if (error.code === "TRANSPORT_UNAVAILABLE") {
				firebaseRef.main.authWithOAuthRedirect("google", function(error) {
					loginObj.showErrorMessage('Login failed!  Check your internet connection and try again');
				});
			} else {
				loginObj.showErrorMessage('Login failed!  Check your internet connection and try again');
			}
			***/
			loginObj.showErrorMessage('Login failed!  Check your internet connection and try again');
		} else {
			// If successful:
			loginObj.loggedIn = true;

			// Remove any error messages
			loginObj.removeOldErrors();

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
	var rawData;
	
	ref.orderByChild('name').on('value', function(snapshot) {
		rawData = snapshot.val(); // Raw data from the Firebase

		// Move the objects into an array
		for(var index in rawData) {
			var attr = rawData[index];
			attr.index = index;
			arrObjs.push(attr);
		}
		arrObjs = [];
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
//addMarkersObj.markerObjs = addMarkersObj.setUpFirebase('markers');
addMarkersObj.markerObjs;
addMarkersObj.markerRef = firebaseRef.main.child('markers');
addMarkersObj.arrObjs = [];
addMarkersObj.rawData;

addMarkersObj.setup = function() {
	addMarkersObj.markerRef.orderByChild('name').on('value', function(snapshot) {
		addMarkersObj.rawData = snapshot.val(); // Raw data from the Firebase

		// Move the objects into an array
		for(var index in addMarkersObj.rawData) {
			var attr = addMarkersObj.rawData[index];
			attr.index = index;
			addMarkersObj.arrObjs.push(attr);
		}

		addMarkersObj.markerObjs = addMarkersObj.arrObjs;
		addMarkersObj.arrObjs = [];
	});
};




/***** Toggles the display of current marker information *****/
addMarkersObj.currentMarkersToggle = function() {
	// If the info-container exists, delete it.
	// otherwise, display it.
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
	var tempDeleteDiv;
	var tempDeleteSpan;
	var tempDeleteText;

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

		if(loginObj.loggedIn) {
			tempDeleteDiv = document.createElement('div');
			tempDeleteSpan = document.createElement('span');
			tempDeleteSpan.setAttribute('data-marker-name', addMarkersObj.markerObjs[i].index);
			tempDeleteSpan.addEventListener('click', addMarkersObj.removeMarker(tempDeleteSpan, tempDeleteDiv));
			tempDeleteText = document.createTextNode('X');
			tempDeleteSpan.appendChild(tempDeleteText);
			tempDeleteDiv.appendChild(tempDeleteSpan);
			tempDeleteDiv.className = 'delete-marker line-item';

			tempDiv.appendChild(tempDeleteDiv);
		}

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
	var newDescription = document.getElementsByClassName('add-item-marker-description')[0];
	var markersRef = firebaseRef.main.child('markers'); // The markers section of the Firebase

	// Push a new marker into the Firebase
	var newMarker = markersRef.push();
	newMarker.set({
		'name': newName.value,
		'lat': parseFloat(newLat.value),
		'lng': parseFloat(newLng.value),
		'description': newDescription.value
	}, function(error){ // If information isn't added to the Firebase, show an error
		if(error) {
			addMarkersObj.showErrorMessage('New marker not added.  Error: ' + error);
		} else {
			addMarkersObj.showErrorMessage('New marker added');
			addMarkersObj.currentMarkersToggle();
			addMarkersObj.currentMarkersToggle();
		}
	});

	// Reset the input boxes back to empty
	newName.value = '';
	newLat.value = '';
	newLng.value = '';
	newDescription.value = '';
};

/**** Remove Marker ****/
addMarkersObj.removeMarker = function(marker, parent) {
	return function() {
		// If it's not already open, open the 'are you sure' dialog:
		if(!parent.children[1]) {
			var tempDiv = document.createElement('div');
			var yesButton = document.createElement('button');
			var noButton = document.createElement('button');
			// If the user clicks 'no', remove the menu
			noButton.addEventListener('click', function(e) {
				e.target.parentNode.parentNode.removeChild(e.target.parentNode);
			});
			// If user clicks 'yes'
			yesButton.addEventListener('click', function(e) {
				firebaseRef.main.child('markers').child(e.target.parentNode.parentNode.children[0].dataset.markerName).remove(function(error) {
					if(error) {
						console.log('Error: ', error)
					} else {
						// Close and open the markers list
						addMarkersObj.currentMarkersToggle();
						addMarkersObj.currentMarkersToggle();
					}
				});

			});
			var yesText = document.createTextNode('Yes');
			var noText = document.createTextNode('No');
			var sure = document.createTextNode('Are you sure?');

			yesButton.appendChild(yesText);
			noButton.appendChild(noText);

			tempDiv.appendChild(sure);
			tempDiv.appendChild(yesButton);
			tempDiv.appendChild(noButton);

			parent.appendChild(tempDiv);
		}
	}
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

