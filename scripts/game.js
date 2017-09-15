eatsweet.game = ( function() { 
	var dom = eatsweet.dom,
	$ = dom.$;
	
	// hide the active screen (if any) and show the screen 
	function showScreen(screenId) {
		var activeScreen = $("#game .screen.active")[0];
		var screen = $("#" + screenId)[0]; 
		if(activeScreen) {
			dom.removeClass(activeScreen, "active");
		}
			dom.addClass(screen, "active");
	}
	
	// expose public methods
	return {
		showScreen: showScreen
	};
})(); 