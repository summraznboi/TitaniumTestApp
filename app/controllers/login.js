var storage = require('storage');
var loginDialog = Titanium.UI.createAlertDialog({
	title:'Login failed',
	message:'Please try again!'
});

function validateUser() {
	if ($.username.value === 'admin' && $.password.value === 'admin123') {
    	Alloy.Globals.Zypsee.showSubview(Alloy.Globals.Zypsee.MAP);
    } else {
    	loginDialog.show();
    }
}

$.login.addEventListener('logout', function(event) {
	$.username.value = '';
	$.password.value = '';
	event.onComplete();
});
$.signon.addEventListener('click', validateUser);

// Set up the coordinates
var usernameCenterX = Ti.Platform.displayCaps.platformWidth / 2;
var usernameCenterY = Ti.Platform.displayCaps.platformHeight / 4;
var littleLowerThanCenterRatio = .666;

$.username.center = { 
	x: usernameCenterX, 
	y: usernameCenterY
};
$.password.center = {
	x: usernameCenterX,
	y: usernameCenterY + ($.username.height + $.password.height) / 2
};
$.signon.center = {
	x: usernameCenterX,
	y: Ti.Platform.displayCaps.platformHeight * littleLowerThanCenterRatio
};
