/*





*/

game.objects.player = function(){

	this.icon = "X";
	this.color = game.colors.blue;
	this.speed = 0;
	this.maxSpeed = 128;
	this.minSpeed = 8
	this.gravity =50;
	this.x = game.width/2;
	this.y = game.height/4;
	this.w = 8;
	this.h = 8;
	this.score =0;

	this.update = function(ticks){

		var moving = false;
		for(var direction in game.directions){
		
			if(game.keysDown[direction]){
				this.score+= game.screens.game.world.speed ;
				if(!this.speed || this.speed < 1){
					this.speed = this.minSpeed;
				}
				this.move(ticks,  game.directions[direction], this.speed );
				moving = true;
			}
		}

		

		if(game.keysDown.down){
			game.screens.game.world.speed += .01;

		}

		if(moving){
				this.speed =  diesel.clamp(this.speed *2 , 0 , this.maxSpeed);
			}
			else{
				this.speed =  this.speed /2;
			}

		
		if(this.y > game.height/2){
			this.y = game.height/2;
		}


		//test for collisions.
		var data = game.context.level.getImageData(this.x - this.w/2, this.y, this.w, this.h).data, color;
		for(var i = 0; i< data.length; i+=4){
			color ="#"+data[i].toString(16)+""+data[i+1].toString(16)+""+data[i+2].toString(16);
			
			if(color === game.colors.tan || color === game.colors.brown){
				diesel.raiseEvent("collision");

			}
		}
	}
	this.draw = function(context){
		context.fillStyle = game.colors.blue;
		context.strokeStyle = game.colors.black;
		context.save();
		context.translate(this.x-this.w/2,this.y);
		context.fillRect(0,0,this.w, this.h);
		context.strokeRect(-1,-1,this.w+2, this.h+2);
		if(game.keysDown.down){
			context.fillStyle = game.colors.orange;
		
			context.fillRect(0,0,this.w, 1);

		}
		context.restore();

	}
};
game.objects.player.prototype = new game.objects.units.base();






game.objects.level = function(){
	this.speed =1;
	this.breadth=[];
	this.effects=[];
	this.centers=[];
	this.block =  game.screens.game.player.h;
	this.blocksY = Math.ceil(game.height/(this.block))+1;
	this.minBreadth = 128;

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
		context.fillRect(0,0,game.width,this.block *  this.breadth.length);

			
		context.fillStyle = game.colors.blue;
		context.fillRect(0,0,game.width,game.height/2);
		context.fillStyle = game.colors.green;
		context.fillRect(0,game.height/2 -this.block,game.width, this.block);
			
		
		for(var i = 0; i<  this.breadth.length; i++){

			
			if( i >this.blocksY /2){
				context.fillStyle = game.colors.black;
				context.fillRect(
					(this.centers[i] - (this.breadth[i]/2)),
					0,
					this.breadth[i],
					this.block
					);
				context.fillStyle = game.colors.brown;
	
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

			//	context.fillStyle = "rgba(255,0,0,1)";
			//	context.fillRect(this.centers[i], 0 , 1, this.block);
			}
			context.translate(0,this.block);
		
		}

		
		context.restore();
	};

	this.update = function(ticks){
		
		if(Math.floor(this.y / this.block) + this.blocksY +2 <this.breadth.length){
			this.addLayer();
		
		}
		if (Math.floor(this.y) % 10 == 0){
			this.speed += 0.01;

		}
		this.y -= this.speed;
	}

	this.addLayer = function(){
		this.lastFell  = 0;
		if(this.timetofall>0){
			this.timetofall -= 0.001;
		}
		var b = this.simplex.noise(
			this.breadth.length - 1, 
			this.centers[this.centers.length -1]);

		var c = (Math.random() * 2 - 1) * (game.screens.game.player.w );
		

		b = Math.abs(b) * game.width /2;
		if(b < this.minBreadth){
			b = this.minBreadth;
			if(this.minBreadth > game.screens.game.player.w *1.5){
				this.minBreadth-=this.block/6;
			}
			else{
				this.minBreadth =128;
			}
		}
		
		c = diesel.clamp(this.centers[this.centers.length-1] + c, 0, game.width);

		this.breadth.push(b);
		this.centers.push(c)
		
		//this.y += this.block;

		// if(this.breadth.length > this.blocksY){
		// 	this.breadth.splice(0,1);
		// 	this.centers.splice(0,1);

		// }
		game.screens.game.player.score += Math.floor(100 *this.speed);

	};


	this.init();


}
game.objects.level.prototype = game.objects.base;