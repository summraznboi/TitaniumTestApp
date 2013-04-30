var listSection = Ti.UI.createListSection({ headerTitle: 'Driver Info' });
var driverInfoCancelButton = Ti.UI.createButton({ systemButton: Ti.UI.iPhone.SystemButton.CANCEL });

$.driverDescription.appendSection(listSection);
$.driverInfo.setRightNavButton(driverInfoCancelButton);

$.driverInfo.addEventListener('showDriverInfo', function(event) {
	var annotationData = event.annotation;
	
	var accuracyMeters = annotationData.accuracyMeters;
	var lastUpdated = annotationData.lastUpdated;
	var driverDimensions = [
	    { properties: { title: 'Driver ID', subtitle: annotationData.title } },
	    { properties: { title: 'Latitude', subtitle: annotationData.latitude } },
	    { properties: { title: 'Longitude', subtitle: annotationData.longitude } },
	    { properties: { title: 'Accuracy', subtitle: accuracyMeters ? accuracyMeters + ' meters' : 'Unknown' } },
	    { properties: { title: 'Last updated', subtitle: lastUpdated ? lastUpdated : 'Unkwown' } }
	];
	listSection.setItems(driverDimensions);
	
	event.onComplete();
});
driverInfoCancelButton.addEventListener('click', function() {
	Alloy.Globals.Zypsee.showSubview(Alloy.Globals.Zypsee.MAP);
});
