function lonelyInteger(arr) {
    var arrBeg = arr.toString();

    var lonelyInt;
    
    if(arr.length === 1) {
        lonelyInt = arr[0];
    } else {
    	for(var i=0; i<arr.length; i++) {
    		if(arrBeg.indexOf(arr[i]) === arrBeg.lastIndexOf(arr[i])) {
    			lonelyInt = arr[i];
    		}
    	}
    }

    return lonelyInt;
}


console.log('total ', lonelyInteger([1,1,2]));


var main = document.getElementsByTagName('main')[0];

/***** Error Handling *****/
// If the browser can't cannot to the Firebase in five seconds, create and show an error message
var cannotConnect = setTimeout(function(){
	var errorMessage = document.createElement('div');
	errorMessage.className = 'error-message';
	var message = document.createTextNode('An error has occured.  Please check your internet connection or try again later.');
	errorMessage.appendChild(message);
	main.appendChild(errorMessage);

}, 5000);

/***** Setting up the Firebase *****/
// Create a reference to the Firebase containing zone information.
var myFirebaseRef = new Firebase('https://blistering-torch-7640.firebaseio.com/characters');

// When the Firebase for the Characters is loaded, do all the things
myFirebaseRef.orderByChild('name').on('value', function(snapshot) {

	var characters = snapshot.val(); // Raw data from the Firebase
	var locationsObjs = [];	// Holds the location objects
	var locationBoundaries = []; // Holds the corrected location boundaries

	// Clear the timeout for the error message
	clearTimeout(cannotConnect);
/*
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
*/
	// If the character information exists on the page already, remove it
	while(main.firstChild) {
		main.removeChild(main.firstChild);
	}

	for(var characterName in characters) {
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

		bioName.innerHTML = characterName;
		bioPic.src = characters[characterName].img;
		bioPic.alt = characterName + "'s pic";

		bioPortrait.appendChild(bioPic);
		bioPortrait.appendChild(bioName);

		bioDescription.innerHTML = characters[characterName].description;

		bio.appendChild(bioPortrait);
		bio.appendChild(bioDescription);

		main.appendChild(bio);

		console.log('name: ' + characterName + ' img: ' + characters[characterName].img);
	}
});