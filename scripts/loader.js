var eatsweet = {};

// wait until main document is loaded
window.addEventListener("load", function() {
	// start dynamic loading
	Modernizr.load([{
		// these files are always loaded
		load: ["scripts/sizzle.js", "scripts/dom.js", "scripts/game.js"],
		
		// called when all files have finished loading and executing
		complete: function() {
			console.log("All files have loaded!");
			
			// show first screen
			eatsweet.game.showScreen("main-menu");
			
			var playButton = document.getElementById("play-game");
			playButton.addEventListener("click", function(e) {
				eatsweet.game.showScreen("game-screen");
			});
			
			var instructionButton = document.getElementById("how-to-play");
			instructionButton.addEventListener("click", function(e) {
				eatsweet.game.showScreen("instructions");
			});

			var backButton = document.getElementById("back-button");
			backButton.addEventListener("click", function(e) {
				eatsweet.game.showScreen("main-menu");
			});
			
			window.addEventListener("keydown", function(e) {
				// keyCode 27 refers to the ESC button
				if(e.keyCode == 27)
				{
					eatsweet.game.showScreen("main-menu");
				}
			});
		}
	}]); // end Modernizr.load
}, false); // end addEventListener