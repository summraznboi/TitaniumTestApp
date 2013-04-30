var storage = require('storage');
var ZYPSEE_COMPANY_LOGO_IMG_URL = 'images/car.png';

(function() {
	var defaultOpenOptions = {
		modal: true,
		modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE,
		modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN
	};
	
	var currentNoWindowState, 
		currentLoginWindowState, 
		currentMapWindowState, 
		currentDriverInfoWindowState;
	
	function WindowStateInfo() {
		this.warnSameStateTransition = function() {
			Ti.API.warn('Transitioning to same window state: ' + this.name);
		};
		this.errorWrongStateTransition = function(nextState) {
			Ti.API.error('Invalid window state transition: ' + this.name + ' to ' + nextState.name);
		};
	}
	function WindowState() {
		WindowStateInfo.prototype.constructor.apply(this);
		this.openWindow = function() {
			this.window.open(this.openOptions);
		};
		this.closeWindow = function() {
			this.window.close();
		};
		this.openNewWindow = function(windowState) {
			windowState.openWindow();
			this.closeWindow();
		};
	}
	
	// Current window is none
	currentNoWindowState = new function() {
		WindowStateInfo.prototype.constructor.apply(this);
		this.name = 'none';
		
		this.transitionTo = function(nextState, data) {
			var self = this;
			switch(nextState) {
				case currentLoginWindowState:
					nextState.openWindow();
					return nextState;
				case currentMapWindowState:
					data.onComplete = function() {
						nextState.openWindow();
					};
					nextState.window.fireEvent('login', data);
					return nextState;
				case currentDriverInfoWindowState:
					self.errorWrongStateTransition(nextState);
					return self;
			}
		};
	};
	
	// Current window is login
	currentLoginWindowState = new function() {
		WindowState.prototype.constructor.apply(this);
		this.window = $.loginRequire.getView('login');
		this.openOptions = _.chain(defaultOpenOptions).clone()
								.extend({ navBarHidden: true })
								.value();
		this.name = 'login';
		
		this.transitionTo = function(nextState, data) {
			var self = this;
			switch(nextState) {
				case currentLoginWindowState:
					self.warnSameStateTransition();
					return self;
				case currentMapWindowState:
					data.onComplete = function() {
						self.openNewWindow(nextState);
						storage.put('loggedIn', 'true');
					};
					nextState.window.fireEvent('login', data);
					return nextState;
				case currentDriverInfoWindowState:
					self.errorWrongStateTransition(nextState);
					return self;
			}
		};
	};
	
	// Current window is map
	currentMapWindowState = new function() {
		WindowState.prototype.constructor.apply(this);
		this.window = $.mapRequire.getView('map');
		this.openOptions = _.clone(defaultOpenOptions);
		this.name = 'map';
		
		this.transitionTo = function(nextState, data) {
			var self = this;
			switch(nextState) {
				case currentLoginWindowState:
					data.onComplete = function() {
						self.openNewWindow(nextState);
						storage.put('loggedIn', 'false');
					};
					nextState.window.fireEvent('logout', data);
					return nextState;
				case currentMapWindowState:
					self.warnSameStateTransition();
					return self;
				case currentDriverInfoWindowState:
					data.onComplete = function() {
						var newData = _.clone(data);
						newData.onComplete = function() {
							nextState.openWindow();
						};
						nextState.window.fireEvent('showDriverInfo', newData);
					};
					self.window.fireEvent('deselectAnnotation', data);
					return nextState;
			}
		};
	};
	
	// Current window is dirver info
	currentDriverInfoWindowState = new function() {
		WindowState.prototype.constructor.apply(this);
		this.window = $.driverInfoRequire.getView('driverInfo');
		this.openOptions = _.chain(defaultOpenOptions).clone()
								.extend({
									modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
									modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
								})
								.value();
		this.name = 'driverInfo';
		
		this.transitionTo = function(nextState, data) {
			var self = this;
			switch(nextState) {
				case currentLoginWindowState:
					this.errorWrongStateTransition(nextState);
					return self;
				case currentMapWindowState:
					self.closeWindow();
					return nextState;
				case currentDriverInfoWindowState:
					this.warnSameStateTransition();
					return self;
			}
		};
	};
	
	var windowStateNameMapping = {
		WINDOW_LOGIN: currentLoginWindowState,
		WINDOW_MAP: currentMapWindowState,
		WINDOW_DRIVERINFO: currentDriverInfoWindowState
	};
	
	var currentWindowState = currentNoWindowState;
	Alloy.Globals.Zypsee = {
		LOGIN: 'WINDOW_LOGIN',
		MAP: 'WINDOW_MAP',
		DRIVERINFO: 'WINDOW_DRIVERINFO',
		
		showSubview: function(viewType, data) {
			data = data || {};
			currentWindowState = currentWindowState
				.transitionTo(windowStateNameMapping[viewType], data);
			Ti.API.log('Transitioned to window state: ' + currentWindowState.name);
		}
	};
})();

var loginValue = storage.get('loggedIn');
var isLoggedIn = loginValue === 'true';
var subViewToShow = isLoggedIn ? Alloy.Globals.Zypsee.MAP : Alloy.Globals.Zypsee.LOGIN;
Alloy.Globals.Zypsee.showSubview(subViewToShow);

