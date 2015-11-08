var loginButton = document.getElementById('login');

function login() {
	var ref = new Firebase("https://blistering-torch-7640.firebaseio.com");
	ref.authWithOAuthPopup("google", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", authData);
		}
	});
}

loginButton.addEventListener('click', login);