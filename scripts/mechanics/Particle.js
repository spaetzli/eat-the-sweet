function Particle(xpos,ypos,img,plife,psize,pxvel,pyvel,prot,pangvel,imrtl,scalesize,scalealpha,c,imgs)
{
	this.x = xpos;								// The x position of the particle
	this.y = ypos;								// The y position of the particle
	this.image = img;							// The image to be used for this particle
	this.initsize = psize;						// The initial size of the particle (used when rescaling)
	this.width = psize;							// The width of the particle
	this.height = psize;						// The height of the particle
	this.alpha = 1;								// The alpha (opacity) value of the particle
	this.red = 255;								// Amount of red in this particle's color when drawing it without an image
	this.green = 255;							// Amount of green in this particle's color when drawing it without an image
	this.blue = 255;							// Amount of blue in this particle's color when drawing it without an image
	this.rotation = prot;						// The rotation of this particle
	this.xvel = pxvel;							// The velocity in the x direction
	this.yvel = pyvel;							// The velocity in the y direction
	this.angvel = pangvel;						// The angular velocity of this particle (how much it rotates each update)
	this.lifetime = plife;						// How long this particle should exist for
	this.life = plife;							// How much time this particle has left
	this.ctx = c;								// A reference to the context to be used when drawing
	this.images = imgs;							// A reference to the images array to be used for drawing (in retrospect, I should have just passed in the image I want to use instead of the whole array and a string...)
	this.scaleSizeWithLife = scalesize;			// Should this particle's size decrease as it gets older?
	this.scaleAlphaWithLife = scalealpha;		// Should this particle fade as it gets older?
	this.immortal = imrtl;						// Does this particle live forever?
	
	// This function updates the particle, causing it to move and scale according to its parameters
	this.update = function() {
		this.x -= this.xvel;
		this.y -= this.yvel;
		if(this.scaleSizeWithLife)
		{
			this.height = this.initsize * (this.life/this.lifetime);
			this.width = this.initsize * (this.life/this.lifetime);
		}
		if(this.scaleAlphaWithLife)
		{
			this.alpha = (this.life/this.lifetime);
		}
		this.rotation += this.angvel;
		if(!this.immortal)
		{
			this.life--;
		}
	}
	
	// This function updates's the particle's default color
	this.setColor = function(r, g, b){
		this.red = r;
		this.green = g;
		this.blue = b;
	}
	
	// This function draws the particle
	this.draw = function() {
		
		// If there's an image specified, draw it.
		if(this.image != ""){
			this.ctx.globalCompositeOperation = "lighter";
			this.ctx.globalAlpha = this.alpha;
			this.ctx.save();
			this.ctx.translate(this.x,this.y);
			this.ctx.rotate(this.rotation);
			this.ctx.drawImage(this.images[this.image],-this.width/2, -this.height/2, this.width, this.height);
			this.ctx.restore();
			this.ctx.globalAlpha = 1;
			this.ctx.globalCompositeOperation = "source-over";
		}
		// Otherwise, just draw a colored square
		else {
			this.ctx.fillStyle = this.color = "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
			this.ctx.fillRect(this.x,this.y,this.width,this.height);	
		}
								
	}
	
	// Checks to see if the particle is dead or not
	this.isDead = function() {
		var dead = !this.immortal && this.life <= 0;
		return dead;
	}
}