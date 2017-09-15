function Background(ypos,height,c,imgs)
{
	this.width = 500;
	this.height = height;
	this.x = 0;
	this.y = ypos;
	this.ctx = c;
	this.images = imgs;
	this.draw = function() {
		//ctx.fillStyle = this.color;
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		this.ctx.drawImage(this.images["backgroundImage"],this.x, this.y, this.width, this.height);
	}
}