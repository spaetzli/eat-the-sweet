function Cookie(xpos,ypos)
{
	this.x = xpos;
	this.y = ypos;
	this.width = 30;
	this.height = 30;
	this.points = 50;
	var pointChance = Math.random() * 100;
	if(pointChance < 5)
	{
		this.points = 200;
	}
	else if(pointChance >= 5 && pointChance < 20)
	{
		this.points = 100;
	}
}