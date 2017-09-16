window.addEventListener("load",loadImages);

// Important constants
var CANVAS_WIDTH = 480;				// The width of the canvas
var CANVAS_HEIGHT = 720;			// The height of the canvas
var FPS = 30;						// How many frames per second this game will run at

// Game variables
var gravity = .98;					// How quickly the player's vertical velocity decreases
var jumpspeed = 25;					// The velocity the player gains after bouncing on a cloud
var avgCloudDist = 200;				// The intended average distance between each pair of clouds
var maxHeight = 28000;				// The height of the level (the top of the level is at maxHeight)
var groundline = 670;				// The line representing where the ground starts


// Game objects
var background;						// The game's sky background
var player;							// The player (the cat)
var cursor;							// An object for storing the cursor's coordinates
var bigDessert;						// The big dessert at the top of the level
var clouds = [];					// The array of clouds in the game
var particles = [];					// The array of particles in the game
var cookies = [];					// The array of cookies in the game
var stars = [];						// The array of background stars in the game
var highScores = [];				// The array of the player's top 5 high scores
var bgClouds = [];					// The array of clouds floating in the background
var shootingStar;					// The shooting star that goes across the screen every so often. Since these are rare, I think I'll only use one object instead of an array
var ctx;							// A reference to the canvas's 2d context for drawing
var bgMusic;						// The background music in the game

// Gamestate Variables
var firstClick = true;				// Is this the fist click of the game?
var dbljump = 0;					// How many double jumps does the player have?
var gameState = "playing";			// The current state of the game. 'playing' = game started and in progress; 'lose' = player lost, display lose text; 'win' = player won, display win text; 'pause' = game paused 

var temptemptemp = 0;

var IMAGE_SOURCES = {
	playerLeft: "images/catleft.png",
	playerRight: "images/catright.png",
	backgroundImage: "images/background.png",
	cloudFluff: "images/cloud2.png",
	cloud: "images/cloud.png",
	star: "images/starparticle.png",
	cookie: "images/cookie.png",
	candy: "images/candy.png",
	cupcake: "images/cupcake.png",
	icecream: "images/icecream.png",
	shootingstar: "images/star.png",
	ground: "images/ground.png"
}
var images = {};

var KEYBOARD = {
	"KEY_LEFT": 37,
	"KEY_UP": 38,
	"KEY_RIGHT": 39,
	"KEY_DOWN": 40,
	"KEY_SPACE": 32
}
var keydown = [];

function init() 
{
	var canvasElement = document.querySelector("canvas");
	canvasElement.width = CANVAS_WIDTH;
	canvasElement.height = CANVAS_HEIGHT;
				
	//get a 2D rendering context
	ctx = canvasElement.getContext("2d");
	
	player = new Player(ctx,images);
	
	background = new Background(-maxHeight + CANVAS_HEIGHT, maxHeight, ctx, images);
	
	cursor = {
		x: CANVAS_WIDTH/2,
		y: CANVAS_HEIGHT/2
	}
	
	for(i = 0; i < 5; i++)
	{
		highScores[i] = 0;
	}

	// Create all of the game's random objects
	generateGameObjects();
	
	// Make the big dessert
	bigDessert = new BackgroundCloud(CANVAS_WIDTH/2 - (CANVAS_WIDTH/1.5)/2, clouds[clouds.length - 1].y - CANVAS_HEIGHT/2 - 200, CANVAS_WIDTH/1.5,CANVAS_HEIGHT/2,1000);
	
	setInterval(loop,1000/FPS);
	
	window.addEventListener("keydown",function(e) {
				//console.log("keydown=" + e.keyCode);
				keydown[e.keyCode] = true;
	});
	window.addEventListener("keyup",function(e) {
				//console.log("keyup=" + e.keyCode);
				keydown[e.keyCode] = false;
	});
	
	window.addEventListener("mousemove",function(e) {
			e = e || window.event;
			if (e.pageX || e.pageY) {
				cursor.x = e.pageX;
				cursor.y = e.pageY;
			} 
			else {
				var de = document.documentElement;
				var b = document.body;
				cursor.x = e.clientX + 
				(de.scrollLeft || b.scrollLeft) - (de.clientLeft || 0);
				cursor.y = e.clientY + 
				(de.scrollTop || b.scrollTop) - (de.clientTop || 0);
			}	

			cursor.x += (CANVAS_WIDTH - window.innerWidth) * 0.5;
	});
	
	document.getElementById("canvas").addEventListener("mousedown",function(e) {
			if(firstClick){
				player.yspeed = -35;
				firstClick = false;
			}
			// in case I decide to implement a double jump powerup
			else if(dbljump > 0){
				player.yspeed = -jumpspeed;
				dbljump--;
			}
	});
	
	window.addEventListener("click", function(e) {
			if(gameState == "lose" || gameState == "win")
			{
				resetGame();
			}
	});
	
	// Adds the background music
	bgMusic = new Audio('sound/bgmusic.mp3');
	bgMusic.addEventListener('ended',function() {
		this.currentTime = 0;
		this.play();
	}, false);
	//bgMusic.src = "sound/bgmusic.mp3";
	bgMusic.volume = 1.0;
	bgMusic.play();
	
	
	// Pauses the game when SPACE is pressed
	window.addEventListener("keydown", function(e) {
		if(gameState != "win" && gameState != "lose")
		{
			if(e.keyCode == 32)
			{				
				if(gameState == "pause")
				{
					gameState = "playing";
					bgMusic.play();
				}
				else
				{
					gameState = "pause";
					bgMusic.pause();	
				}
			}
		}
	});

	// Toggle mute audio
	window.addEventListener("keydown", function(e) {
		if(e.keyCode == 77) //'M'
		{
			if(bgMusic.muted != true)
				bgMusic.muted = true
			else
				bgMusic.muted = false;
		}
	});
}

// Resets the game to its initial state
function resetGame()
{
	groundline = 670;
	background = new Background(-maxHeight + CANVAS_HEIGHT, maxHeight, ctx, images);
	player = new Player(ctx, images);
	clouds = [];
	particles = [];
	cookies = [];
	stars = [];
	shootingStar = null;
	
	generateGameObjects();
	bigDessert = new BackgroundCloud(CANVAS_WIDTH/2 - (CANVAS_WIDTH/1.5)/2, clouds[clouds.length - 1].y - CANVAS_HEIGHT/2 - 200, CANVAS_WIDTH/1.5,CANVAS_HEIGHT/2,1000);
	
	firstClick = true;
	dbljump = 0;
	gameState = "playing";
}

function loop() {
	update();
	draw();
}

function update() {

	if(gameState != "win" && gameState != "pause")
	{	
		//ask Daemon which keys are down
		if(keydown[KEYBOARD.KEY_UP]) {
			background.y -= 50; // 0 is at the top of the screen. so operators are the "opposite"
		}
		if(keydown[KEYBOARD.KEY_DOWN]) {
			background.y += 50;
		}
		
		// Decrease the player's velocity
		player.yspeed += gravity;
		
		// If the player's velocity would carry it above half the screen's height, move everything else down instead
		if(player.y < CANVAS_HEIGHT/2 && player.yspeed < 0)
		{
			moveBackgroundObjects(-player.yspeed);
		}
		// Otherwise, move the player
		else
		{
			player.y += player.yspeed;
		}
		
		// If the player hits the ground, make sure he stops moving and stays on the ground
		if(player.y + player.height >= groundline)
		{
			player.y = groundline - player.height;
			player.yspeed = 0;
		}
		
		// Update all the particles
		updateParticles();
		
		// Move all the background clouds
		for(i = 0; i < bgClouds.length; i++)
		{
			bgClouds[i].x -= bgClouds[i].velocity;
			if(bgClouds[i].x < -bgClouds[i].width)
			{
				bgClouds[i].x = CANVAS_WIDTH;
			}
		}
		
		// if distance beween cursor and player is less than the distance
		// it would move in one frame (i.e. player's speed), 
		if(Math.abs(player.x - cursor.x) < player.xspeed)
		{
			// then only move it by only the actual distance between the player and cursor 
			// so that they end up at the same x value of the cursor
			player.x += (cursor.x - player.x);
		}
		else
		{
			if(cursor.x < player.x)
			{
				player.x -= player.xspeed;
				player.image = "playerLeft";
			}
			else if(cursor.x > player.x)
			{
				player.x += player.xspeed;
				player.image = "playerRight";
			}
		}
		
		
		if(shootingStar == null)
		{
			if(Math.random() * 1000 < 1)
			{
				// The chance that the star will come from either the left or right
				var chance = Math.random() * 100;
				var angle;
				
				if(chance < 50)
				{
					angle = Math.PI * 1.25;								
					shootingStar = new ShootingStar(500,Math.random() * 110 - 20, 40, Math.cos(angle)*10,Math.sin(angle)*10);
				}
				else
				{
					angle = Math.PI * 1.75;
					shootingStar = new ShootingStar(-60,Math.random() * 110 - 20, 40, Math.cos(angle)*10,Math.sin(angle)*10);
				}
			}
		}
		else
		{
			shootingStar.update();
			var sparkleCount = Math.random() * 5; 
			for(i = 0; i < sparkleCount; i++)
			{
				for(j = 0; j <= particles.length; j++)
				{
					if(particles[j] == null)
					{
						var angle = Math.random() * Math.PI * .5;
						if(shootingStar.xvelocity < 0)
						{
							angle = Math.random() * Math.PI * .5;
						}
						else
						{
							angle = Math.random() * Math.PI * .5 + (Math.PI/2);
						}
						
						var plife = Math.random() * 100 + 20;
						particles[j] = new Particle(shootingStar.x + shootingStar.size/2,
													shootingStar.y + shootingStar.size/2,
													"star",
													plife,
													Math.random() * 15 + 15,
													Math.cos(angle)*2,
													-Math.sin(angle)*2,
													Math.random() * Math.PI*2,
													Math.random() * Math.PI/10,
													false,
													true,
													true,
													ctx,
													images);
						break;
					}
				}
			}
			if(shootingStar.x + shootingStar.size < -200 || shootingStar.x > 700)
			{
				shootingStar = null;
			}
			
		}
		
		// keeping the player in bounds			
		player.x = clamp(player.x,0,CANVAS_WIDTH - player.width);
		// keeping the background in bounds
		background.y = clamp(background.y,-background.height + CANVAS_HEIGHT,0);
		
		// If the game is still going and the player has fallen off the screen, it's game over.
		if(gameState == "playing" && player.y > CANVAS_HEIGHT)
		{
			gameState = "lose";
			checkHighScore();
		}
		
		// If the game is still going, check for collisions.
		if(gameState == "playing"){
			checkCollisions();
		}
	}
}

function draw() {

	// Draw the background
	background.draw();
	
	// Draw the stars
	for(n = 0; n < stars.length; n++)
	{
		// There's no chance of the stars being null
		stars[n].draw();
	}
	
	// Draw the background clouds
	for(n = 0; n < bgClouds.length; n++)
	{
		if(bgClouds[n] != null) {
			ctx.drawImage(images["cloud"],bgClouds[n].x,bgClouds[n].y,bgClouds[n].width,bgClouds[n].height);
		}
	}
	
	// Draw the ground if it is onscreen
	//if(groundline < 720){
	//	ctx.fillStyle = "green";
	//	ctx.fillRect(0,groundline,CANVAS_WIDTH,720);
	//}
	
	ctx.drawImage(images["ground"],0,groundline - 350,500,400);
	
	// Draw all the objects
	ctx.drawImage(images["icecream"],bigDessert.x,bigDessert.y,bigDessert.width,bigDessert.height);
	player.draw();
	drawClouds();
	drawCookies();
	drawParticles();
	if(shootingStar != null)
	{
		ctx.drawImage(images["shootingstar"],shootingStar.x, shootingStar.y, shootingStar.size, shootingStar.size);
	}
	
	
	// Draw the player's score text
	ctx.textBaseline = 'top';
	ctx.font = '30px VanillaRegular';
	ctx.fillStyle = "#fff";
	//ctx.globalAlpha = 0.5;
	ctx.fillText("Score: " + player.score,10,5);
	ctx.strokeText("Score: " + player.score,10,5);
	if(dbljump > 0)
	{
		ctx.fillText("Click to Double Jump!",10,50);
		ctx.strokeText("Click to Double Jump!",10,50);
		for(i = 0; i < dbljump; i++)
		{
			ctx.drawImage(images["shootingstar"],15 + 30 * i,85,20,20);
		}
	}
	
	// Reset alpha back to 1 to avoid having everything be alpha
	//ctx.globalAlpha = 1;
	
	
	// TODO when game is paused
	if(gameState == "pause")
	{
		ctx.fillText("PAUSED",150,200);
		ctx.strokeText("PAUSED",150,200);
	}
	
	// If the game is over, display a message depending on whether the player won or lost and display their score
	if(gameState == "win" || gameState == "lose")
	{
		ctx.font = '50px VanillaRegular';
		ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#000";
		if(gameState == "win")
		{
			ctx.fillText("YOU WIN!", 90, 150);
			ctx.strokeText("YOU WIN!", 90, 150);
		}
		else
		{
			ctx.fillText("YOU LOSE!", 70, 150);
			ctx.strokeText("YOU LOSE!", 70, 150);
		}
		
		// Filling and stroking
		ctx.font = '40px VanillaRegular';
		ctx.fillText("Your Score: " + player.score, 25, 200);
		ctx.strokeText("Your Score: " + player.score, 25, 200);
		ctx.fillText("High Scores", 70, 300);
		ctx.strokeText("High Scores", 70, 300);
		for(i = 0; i < 5; i++)
		{
			// If the high score is more than 0, display that score
			var text = "";
			if(highScores[i] > 0) {
				text += highScores[i];
			}
			// If the high score is 0, display some dashes.
			else{
				text = "---";
			}
			ctx.fillText("" + (i + 1) + ": " + text, 110, 350 + i*50);
			ctx.strokeText("" + (i + 1) + ": " + text, 110, 350 + i*50);
		}
	}
}	

function clamp(val, min, max) {
	return Math.max(min, Math.min(max, val));
}

// Uses the separating axis theorem to return whether two rectangular objects are colliding
function hitTest(x1,y1,w1,h1,x2,y2,w2,h2) {
	if(Math.abs(x2 - x1) > (43) || Math.abs(y2 - y1) > (28)) {
		
		return false;
	}
	
	return true;
}

function checkCollisions(){
	//colortodraw = "white";
	for(i = 0; i < clouds.length; i++) {
		var c = clouds[i];
		// The values added and subtracted here are actually completely arbitrary. For some reason, there are extremely
		// strange and illogical offsets between where the rectangles draw and where the values used for their position
		// when checking collisions evaluate to. So I had to use these offsets which I determined through experimentation.
		if(c != null && hitTest(c.x + 7,c.y - 10,c.width,c.height,player.x,player.y,player.width,player.height) && player.yspeed > 0 && player.y - player.yspeed < (c.y - player.height))
		{
			player.score += clouds[i].points;
			generateCloudBurst(clouds[i].x + clouds[i].width/2, clouds[i].y + clouds[i].height/2);
			clouds[i] = null;
			player.yspeed = -jumpspeed;
		}
	}
	
	// Check for player cookie collisions
	for(i = 0; i < cookies.length; i++)
	{
		var cookie = cookies[i];
		
		if(cookie != null && hitTest(cookie.x, cookie.y, cookie.width, cookie.height,player.x,player.y, player.width, player.height))
		{
			player.score += cookie.points;
			cookies[i] = null;
		}
	}
	
	// Check if the plare has reached the dessert at the top. If they have, they win!
	if(player.y < bigDessert.y + bigDessert.height && (player.x + player.width > bigDessert.x && player.x < bigDessert.x + bigDessert.width))
	{
		gameState = "win";
		player.score += bigDessert.velocity; // I used the velocity parameter to store the points value, so add that to the player's score.
		checkHighScore();
	}
	
	if(shootingStar != null && hitTest(shootingStar.x,shootingStar.y,shootingStar.size,shootingStar.size,player.x,player.y, player.width, player.height))
	{
		shootingStar = null;
		if(dbljump < 3)
			dbljump++;
	}
}

// Checks to see if the player has gotten a high score and updates the list if so.
function checkHighScore()
{
	for(i = 0; i < 5; i++)
	{
		if(player.score > highScores[i])
		{
			var prevScore = player.score;
			for(j = i; j < 5; j++)
			{
				var temp = highScores[j];
				highScores[j] = prevScore;
				prevScore = temp;
			}
			break;
		}
	}
}

// Moves all the background objects downward by the distance specified
function moveBackgroundObjects(dist)
{
	player.score += dist/10;
	player.score = Math.floor(player.score);
	
	background.y += dist;
	groundline += dist;
	
	bigDessert.y += dist;
	
	if(shootingStar != null)
	{
		shootingStar.y += dist;
	}
	
	for(i = 0; i < clouds.length; i++)
	{
		if(clouds[i] != null)
		{
			clouds[i].y += dist;
		}
	}
	
	for(i = 0; i < particles.length; i++)
	{
		if(particles[i] != null)
		{
			particles[i].y += dist;
		}
	}
	
	for(i = 0; i < cookies.length; i++)
	{
		if(cookies[i] != null)
		{
			cookies[i].y += dist;
		}
	}
	
	for(i = 0; i < stars.length; i++)
	{
		stars[i].y += dist;
	}
	
	for(i = 0; i < bgClouds.length; i++)
	{
		bgClouds[i].y += dist;
	}
	
}

function drawClouds() {
	this.ctx.globalCompositeOperation = "lighter";
	for(i = 0; i < clouds.length; i++) {
		if(clouds[i] != null && clouds[i].y + clouds[i].height*2 > 0 && clouds[i].y < CANVAS_HEIGHT) {
			ctx.drawImage(images["cloud"],clouds[i].x - clouds[i].width/2,clouds[i].y - clouds[i].height/2,clouds[i].width*2,clouds[i].height*2);
		}
	}
	this.ctx.globalCompositeOperation = "source-over";
	
}

// Drawing the goodies along the way, and changing their sizes
function drawCookies() {
	for(p = 0; p < cookies.length; p++)
	{
		if(cookies[p] != null && cookies[p].y + cookies[p].height > 0 && cookies[p].y < CANVAS_HEIGHT)
		{
			var image = "";
			if(cookies[p].points == 50)
			{
				image = "cookie";
				cookies[p].width = 35;
				cookies[p].height = 35;
			}
			if(cookies[p].points == 100)
			{
				image = "candy";
				cookies[p].width = 40;
				cookies[p].height = cookies[p].width * 0.4;
			}
			if(cookies[p].points == 200)
			{
				image = "cupcake";
				cookies[p].width = 40;
				cookies[p].height = 45;
			}
			ctx.drawImage(images[image],cookies[p].x, cookies[p].y, cookies[p].width, cookies[p].height);
		}
	}
}

function drawParticles() {
	for(m = 0; m < particles.length; m++)
	{
		if(particles[m] != null)
		{
			particles[m].draw();
		}
	}
}

function updateParticles() {
	for(l = 0; l < particles.length; l++)
	{
		if(particles[l] != null)
		{
			particles[l].update();
			if(particles[l].life <= 0)
			{
				particles[l] = null;
			}
		}
		
	}
}

function generateGameObjects()
{
	// First, generate all of our clouds
	generateClouds();
	
	// Now generate cookies
	var cookiecount = 0;
	for(i = 0; i < clouds.length; i++)
	{
		var cookiechance = Math.random() * 100;
		if(cookiechance < 50)
		{
			cookies[cookiecount] = new Cookie(clouds[i].x - clouds[i].width + (Math.random() * (clouds[i].width * 3)),clouds[i].y + Math.random() * avgCloudDist/2 + 15);
			//cookies[cookiecount] = new Cookie(clouds[i].x + clouds[i].width/2 - 15,clouds[i].y - 35);
			cookiecount++;
		}
	}
	
	// Now generate star particles
	var starline = -maxHeight * .35;
	var starcount = 0;
	while(starline > -maxHeight - CANVAS_HEIGHT)
	{
		var starx = 0;
		while(starx < CANVAS_WIDTH)
		{
			var starchance = Math.random() * 100;
			if(starchance < 5)
			{
				//xpos,ypos,img,plife,psize,pxvel,pyvel,prot,pangvel,immortal,scalesize,scalealpha,c,imgs
				stars[starcount] = new Particle(starx,starline,"star",1,Math.random() * 8 + 3,0,0,0,0,true,false,false,ctx,images);
				starcount++;
			}
			starx += 12;
		}
		starline -= 50;
	}
	
	// Now generate background clouds
	var cloudline = 100;
	var bgcount = 0;
	while(cloudline > -maxHeight * .4)
	{
		var cloudChance = Math.random() * 100;
		if(cloudChance < 60)
		{
			var cwidth = Math.random() * 40 + 30;
			bgClouds[bgcount] = new BackgroundCloud(Math.random() * (CANVAS_WIDTH - cwidth) + cwidth/2, cloudline,cwidth,cwidth/2.25,Math.random() * 1 + 1);
			bgcount++;
		}
		cloudline -= Math.random() * 40 + 50;
	}
}

// Algorithm for generating the clouds
function generateClouds() {
	var currentY = CANVAS_HEIGHT/12;
	var currentIndex = 0;
	var prevCloud = null;
	
	while(currentY > -background.height) {
		clouds[currentIndex] = new Cloud(Math.random() * (CANVAS_WIDTH - 100) + 50,
										 currentY + avgCloudDist * .4);
		
		if(prevCloud != null)
		{
			var dist = clouds[currentIndex].x - prevCloud.x;
			if(Math.abs(dist) > CANVAS_WIDTH * .5)
			{
				clouds[currentIndex + 1] = {
					points: 5,
					width: 50,
					height: 20,
					x: prevCloud.x + dist/(Math.random() * 2 + 3),
					y: currentY + avgCloudDist/2 - Math.random() * 20
				}
			
				++currentIndex;
			}
			else if(Math.abs(dist) < CANVAS_WIDTH * .2)
			{
				clouds[currentIndex + 1] = {
					points: 5,
					width: 50,
					height: 20,
					x: prevCloud.x - (dist + 100),
					y: clouds[currentIndex].y + avgCloudDist/2
				}
				
				++currentIndex;
			}
		}
		else
		{
			prevCloud = clouds[currentIndex];
		}
		
		
		
		var chance = Math.random() * 100 + 1;
		if(chance <= Math.abs(clouds[currentIndex].x - prevCloud.x)/5)
		{
			if(chance <= Math.abs(clouds[currentIndex].x - prevCloud.x)/10)
			{
				clouds[currentIndex].points = 50;
			}
			else
			{
				clouds[currentIndex].points = 25;
			}
		}
		
		prevCloud = clouds[currentIndex];
		
		++currentIndex;
		currentY -= avgCloudDist;
	}
}

// Creates a burst particle effect when the player win
function generateCloudBurst(xpos, ypos) {
	var count = Math.random() * 10 + 10;
	var angle = Math.random() * (2 *Math.PI);
	for(k = 0; k < count; k++)
	{
		for(j = 0; j <= particles.length; j++)
		{
			if(particles[j] == null)
			{
				var pvel = 1.5;
				var plife = Math.random() * 15 + 10;
				var size = Math.random() * 40 + 30;
				//xpos,ypos,img,plife,psize,pvel,velangle,pangvel,immortal,scalesize,scalealpha,c,imgs
				particles[j] = new Particle(xpos,
											ypos,
											"cloudFluff",
											plife,size,
											Math.cos(angle)*pvel*2,
											Math.sin(angle)*pvel/1.5,
											Math.random() * Math.PI*2,
											Math.random() * Math.PI/10,
											false,
											true,
											true,
											ctx,
											images);
				break;
			}
		}
		angle += (Math.PI*2)/count;
	}
}

function loadImages() {
	var numLoadedImages = 0;
	var numImages = 0;
	// get num of sources
		for(var imageName in IMAGE_SOURCES) {
			numImages++
		}
		
	//load images
	for(var imageName in IMAGE_SOURCES) {
		//console.log("Loading " + imageName);
		images[imageName] = new Image();
		images[imageName].src = IMAGE_SOURCES[imageName];
		
		images[imageName].onload = function() {
			//console.log(this.src + " loaded");
			if(++numLoadedImages >= numImages) {
				//console.log("Done loading images");
				init();
			}
		}; //end onload
	} //end for
} //end loadImages