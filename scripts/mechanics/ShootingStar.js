function ShootingStar(xpos, ypos, s, xvel, yvel)
{
	this.x = xpos;
	this.y = ypos;
	this.size = s;
	this.xvelocity = xvel;
	this.yvelocity = yvel;
	
	this.update = function()
	{
		this.x += this.xvelocity;
		this.y -= this.yvelocity;
	}
}