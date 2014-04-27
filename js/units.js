/*





*/

game.objects.player = function(){

	this.icon = "X";
	this.color = game.colors.blue;
	this.speed = 100;
	this.gravity =50;
	this.x = game.width/2;
	this.y = game.height/4;
	this.score =0;

	this.update = function(ticks){

		for(var direction in game.directions){
			if(game.keysDown[direction]){
				this.score++;
				this.move(ticks,  game.directions[direction], this.speed )
			}
		}

		if(game.keysDown.down){
			game.screens.game.world.addLayer();
		}

		
		if(this.y > game.height/2){
			this.y = game.height/2;
			game.screens.game.world.addLayer();

		}


		//test for collisions.
		var data = game.context.level.getImageData(this.x -this.w/2, this.y+this.h +1, this.w, 1).data, color;
		for(var i = 0; i< data.length; i+=4){
			color ="#"+data[i].toString(16)+""+data[i+1].toString(16)+""+data[i+2].toString(16);
			
			if(color === game.colors.tan || color === game.colors.brown){
				diesel.raiseEvent("collision");

			}


		}


	}


};
game.objects.player.prototype = new game.objects.units.base();






game.objects.level = function(){
	this.breadth=[];
	this.effects=[];
	this.centers=[];
	this.block = 6;
	this.blocksY = Math.ceil(game.height/(this.block))+1;

	this.simplex = new SimplexNoise();
	this.underground = false;
	this.timetofall = .25;
	this.lastFell = 0;

	this.init = function(){
		for(var i = 0; i < this.blocksY; i++){
			if( i < this.blocksY /2){
				this.breadth.push(game.width);
				this.centers.push(game.width/2)

			}
			else{
				this.addLayer();
			}
		}

	}
	

	this.draw = function(context){
		//passone.
		context.save();
		context.fillStyle = game.colors.tan;

		context.fillRect(0,0,game.width,game.height);
		
		
		for(var i = 0; i<  this.breadth.length; i++){
			context.fillStyle = game.colors.brown;
	
			context.clearRect(
				(this.centers[i] - (this.breadth[i]/2)),
				0,
				this.breadth[i],
				this.block
				);
			
			context.fillRect(
				0,
				1,
				this.centers[i] - (this.breadth[i]) / 2 - 1,
				this.block
				);

			context.fillRect(
				this.centers[i] + (this.breadth[i]) / 2 - 1,
				1,
				game.width,
				this.block
				);

			context.fillStyle = "rgba(255,0,0,.5)";
			context.fillRect(this.centers[i], 0 , 1, this.block);
			context.translate(0,this.block);
		
		}

		
		context.restore();
	};

	this.update = function(ticks){
		this.lastFell+=ticks;
		if(this.lastFell > this.timetofall){
			this.addLayer();
		
		}
	}

	this.addLayer = function(){
		this.lastFell  = 0;
		var b = this.simplex.noise(
			this.breadth.length - 1, 
			this.centers[0]);

		var c = Math.random() * 2 -1;
		

		b = Math.abs(b) * game.width/3 *2+ this.breadth.length % 5 +2 * this.block ;
		c = diesel.clamp(this.centers[0] + c * this.block *1.5,
		 0, game.width);

		this.breadth.push(b);
		this.centers.push(c)
		
		this.y += this.block;

		if(this.breadth.length > this.blocksY){
			this.breadth.splice(0,1);
			this.centers.splice(0,1);

		}
		game.screens.game.player.score += 100;

	};


	this.init();


}
game.objects.level.prototype = game.objects.base;