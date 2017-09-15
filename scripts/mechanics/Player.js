function Player(c,imgs)
		{
			this.width = 36;
			this.height = 36;
			this.x = 300;
			this.y = 400;
			this.score = 0;
			this.xspeed = 6;
			this.yspeed = 0;
			this.ctx = c;
			this.images = imgs;
			this.image = "playerRight";
			
			this.draw = function() {
				this.ctx.drawImage(this.images[this.image],this.x, this.y, this.width, this.height);
			}
		}