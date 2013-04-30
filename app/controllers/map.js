var LIST_LOCATIONS_URL = 'https://control.zypsee.com/zypsee_service/driver/listLocationsJson';
var LOCATION_ICON_IMG_URL = 'images/car.png;'
var getDriversFailedDialog = Titanium.UI.createAlertDialog({
	title:'Unable to connect to internet',
	message:'Cannot get driver locations at this time'
});

function refocusMapByGeolocation(animate) {
	return function() {
		Ti.Geolocation.getCurrentPosition(function(location) {
			if (location.success) {
				var coords = location.coords;
				$.main.setLocation({
					animate: animate,
					regionFit: true,
					latitude: coords.latitude,
					longitude: coords.longitude,
					latitudeDelta: .01,
					longitudeDelta: .01
				});
			} else {
				alert('Unable to locate your current position.');
			}
		});
	};
}

Ti.Geolocation.purpose = "Recieve User Location";
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
Ti.Geolocation.distanceFilter = 10;

$.map.addEventListener('open', function() {
	$.main.hide();
	$.mapIndicator.show();
});
$.map.addEventListener('login', function(event) {
	refocusMapByGeolocation(false)();
	
	// show loading screen until onload or onerror complete
	var httpClient = Ti.Network.createHTTPClient({
		onload: function() {
			var response = JSON.parse(this.responseText);
			var drivers = response.drivers;
			for (var i = 0; i < drivers.length; i++) {
				var driver = drivers[i];
				var annotation = Ti.Map.createAnnotation(driver);
				annotation.applyProperties({
					image: LOCATION_ICON_IMG_URL,
					title: 'Driver #' + driver.driverId
				});
				annotation.addEventListener('click', function() {
					Alloy.Globals.Zypsee.showSubview(Alloy.Globals.Zypsee.DRIVERINFO, { annotation: this });
				});
				$.main.addAnnotation(annotation);
			}
			$.mapIndicator.hide();
			$.main.show();
		},
		onerror: function() {
			Ti.API.warn('Unable to get driver locations');
			getDriversFailedDialog.show();
			$.mapIndicator.hide();
		},
		timeout: 10000
	});
	httpClient.open('GET', LIST_LOCATIONS_URL, true);
	httpClient.send();
	
	event.onComplete();
});
$.map.addEventListener('deselectAnnotation', function(event) {
	$.main.deselectAnnotation(event.annotation); // TODO: use native Objective C: annotationView.canShowCallout = NO;
	event.onComplete();
});
$.refocus.addEventListener('click', refocusMapByGeolocation(true));
$.logout.addEventListener('click', function() {
	Alloy.Globals.Zypsee.showSubview(Alloy.Globals.Zypsee.LOGIN);
});

