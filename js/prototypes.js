/*
	These are prototype that are super handy but are annoying to 
	keep intermixed with game code. because they are long and basically 
	provide a bunch of core functionality that really wont change game to game.

	Includes:
	game.objects.base
	game.screens.base
	game.objects.units.base
	game.objects.weapons.base
	game.objects.effects.base
	game.objects.level

*/
/*
 This is the basis for game objects
*/
game.objects = {};
game.objects.base ={
	/*
	Attributes
	*/
	id:null,
	type:"base",
	x:0,
	y:0,
	w:10,
	h:10,
	team:"none",
	name:"",
	color:"#ffffff",
	selected: false,
	
	/*
	Draw funcs
	*/
	
	draw:function(context){

		context.save();
			context.translate(this.x,this.y);
			context.rotate(this.r)
			context.translate(this.w/-2,this.h/-2);
			context.fillStyle = this.color;
			context.fillRect(0,0,this.w,this.h);
		context.restore();
	},
	"drawDetail":function(context, x, y, w, h){
		var i =2;
		var _t;
		var fill = context.fillStyle;
		context.fillStyle = "rgba(255,255,255,.25)";
		for(key in this){
			_t =typeof this[key]
			if( _t ==="string" || _t ==="number" ){
				i++;
				context.fillText(key + " = "+this[key], x, y + i*game.fontSize);
			}
			
		}
		context.fillStyle = fill;
	},
	
	/*
	Updates are importants
	*/
	
	"update":function(ticks, id){
		if( id && id !=this.id){
			this.id == id;
		}
	},
	
	/*
	Some geometery functions
	*/
	
	"contains":function(x,y){
		return Math.abs(x- this.x) <= this.w/2 &&  Math.abs(y - this.y) <= this.h/2;
	},
	"direction":function(x,y){
		return Math.atan2(this.x - x, this.y -y);
	},
	"distanceSq":function(x,y){
		return Math.pow(this.x - x,2)+Math.pow(this.y - y,2);
	},
	"distance":function(x,y){
		return Math.sqrt(Math.pow(this.x - x,2)+Math.pow(this.y - y,2));
	},
	"manhattanDistance":function(x,y){
		return Math.abs(this.x - x)+Math.abs(this.y - y);
	},
	
	/*
		Events go  here
	*/
	"move": function(ticks, angle, force){
		//move the units intended direction
		this.x -= Math.sin(angle) * ticks *force;
		this.y -= Math.cos(angle) * ticks *force;	
		this.x  = diesel.clamp(this.x, 0, game.width);
		this.y  = diesel.clamp(this.y, 0,game.width);
	
	},	
	"canMove":function(ticks, angle, force){
		//discard invalid data;
		if(!ticks || ticks >1 || angle ===undefined ||!force){
			return false;
		}
		//ask the level if that is cool.
		return game.screens.inGame.current().icon.wall == game.screens.inGame.getTileData(this.x,this.y);
		
		
	},
	

	"teleport":function(x,y){
		this.x = x;
		this.y = y;
	},
	"clamp":function(x, small, big){
		return Math.max(Math.min(x,big),small);
	}

}


/*
SCREENS

*/

game.screens.base = {
	//used to store data for use in the click function {x:i,y:i,w:i,h:i,click:fn}
	"clickZones":[],
	//set this to true to have the world update on the screen you are on.
	"updateAssets":false,
	
	//called when the screen is changed
	"reset":function(arg){
		this.clearAllContexts();
	},
	//called to draw teh screen
	"draw":function(ticks){
		var i =1;
		for(canvas in game.context){
			game.context[canvas].fillStyle= "#ffffff";
			game.context[canvas].fillText(canvas, 10, game.fontSize *2*i);
		}
	},
	//called the update the state of the things in the scene
	"update":function(ticks){
		
		if(this.updateAssets && !game.state.paused){
			//update units
		}
	},
	
	/*
	
	EVENTS START HERE
	
	*/
	
	//called when the object is clicked
	"click":function(evt){
		for(i in this.clickZones){
			if(this.clickZones[i].x < diesel.mouseX 
				&& this.clickZones[i].x + this.clickZones[i].w > diesel.mouseX 
				&& this.clickZones[i].y < diesel.mouseY
				&& this.clickZones[i].y + this.clickZones[i].h > diesel.mouseY){
					
					this.clickZones[i].click();
				}
			}
	},
	
	//called when a screen is created.
	"open":function(event){
	
	},
	//called when  screen is closed.
	"close":function(evt){
	
	},
	
	
	/*
	
		HELPER FUNCTIONS BEGIN HERE
	
	*/
		
	
	
	//draws the selected text centred horizontally on a point.
	fillTextCenteredX:function(ctx, text, x,y){
		var len = ctx.measureText(text).width;
		ctx.fillText(text, x -len/2,y);
	},
	//I need to add a menu function 
	//right now im using boxws might be good to do block highlight instead.
	drawMenu:function(ctx, menuTextArray,x,y, w, h, lineh){
		//draw highlight trect
		if(!lineh){
		lineh = game.fontsize;
		}
		
		
		
		//show all the text.
		for(var i =0 ; i <menuTextArray.length; i++){
	
			ctx.fillText(menuTextArray[i], x,y + (i +1)*lineh);
			
		}
		
		//TODO scroll?
	
	},
	
	drawScreen:function(ctx, screen, x,y,w,h,lh){
		lh = lh||game.fontsize;
		if(screen.text){
			this.drawMenu(ctx, screen.text ,x,y,w,h,lh );
		}
		
		if(screen.sprite && diesel.spriteCache[screen.sprite.name]){
				var spr = diesel.spriteCache[screen.sprite.name];
				var idx = 0 | screen.sprite.idx;
				var src = spr.getSprite( idx, Math.floor(diesel.frameCount/10)%spr.frames );
				ctx.drawImage(spr.image, src[0],src[1],src[2],src[3],
					x + w/3*2, y ,w/4, h/4);
		}
	},
	
	//clears all the contexts.
	//handy.
	"clearAllContexts":function(){
		for(canvas in game.context){
			game.context[canvas].clearRect(0,0,game.width, game.height);
		}
	},
	
	"drawClickZones":function(ctx){
		var fill = ctx.fillStyle;
	
		for(i in this.clickZones){
			ctx.fillRect(this.clickZones[i].x,this.clickZones[i].y,this.clickZones[i].w,this.clickZones[i].h);
			ctx.fillStyle = "#000000";
			if(this.clickZones[i].h >=game.fontSize *2){
			ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h/2);
			
			}
			else{
				ctx.fillText(i, this.clickZones[i].x +this.clickZones[i].w/2,this.clickZones[i].y +this.clickZones[i].h);
			}
			ctx.fillStyle =fill;
		}
	},
}

/*
The unit object
*/
game.objects.units={};

game.objects.units.base = function(){
	this.health = 1;
	this.healthMax = 1;
	this.id = -1;
	this.type="unit";
	this.x = 0;
	this.y = 16;
	this.w = 16;
	this.h = 16;
	this.weapon = false;
	this.icon = "?";
	this.color = "#ff0000";
	this.speed = .5;//seconds per move.
	this.lastMoved=-1 *this.speed;
	


	this.canAttack = function(){
		if (this.weapon != null){
			return this.weapon.canFire();
		}
		return false;
	};
	
	this.onDeath =function(){
		game.screens.level.units.splice(this.id, 1);
		game.score += this.deathPoints;
	};
	this.onHit =function(projectile){
		this.health--;
		if (this.health <=0){
			this.onDeath();
		}
	};
	this.draw=function(context){

		context.save();
			context.translate(this.x - this.w/2 +Math.sin(diesel.frameCount/20+this.id),this.y+ this.h+Math.cos(diesel.frameCount/20+this.id));
			context.fillStyle = this.color;
			context.fillText(this.icon, 0,0,this.w,this.h);
		context.restore();
		if(this.weapon){
			this.weapon.draw(context);
		}
	},
	
	this.update= function(ticks, id){
		if( id!= undefined){
			this.id = id;
		}
		
	
		//move in a direction toward the player
		var playerY = this.y - game.objects.player.y;
		var playerX = this.x - game.objects.player.x;
		var vert = Math.abs(playerY) > Math.abs(playerX);
		var dist = Math.abs(playerY) + Math.abs(playerX)
		
		//TODO real path finding
		if(vert){
			if(playerY > 0){
				this.facing = "up";
			}
			else{
				this.facing = "down"
			}
		}
		else{
			if(playerX < 0){
				this.facing = "right";
			}
			else{
				this.facing = "left"
			}
			
		}
		
		this.lastMoved -= ticks;
		
		//moving requires a can move check doing it twice is dumb
		if(dist >0){
			this.move(ticks, this.facing, this.speed);
		}	
		
		//shoot if needed.
		if(this.weapon){
			//console.log(this.weapon, this.weapon.canFire(ticks));
			
			this.weapon.update(ticks);
			if(this.weapon.canFire(ticks) && dist < this.weapon.range ){
				this.weapon.fire(ticks, this, game.objects.player);	
				game.log.push(this.name + " attacks with " +this.weapon.name);
			} 
		}
	};
	
	this.canMove =function(ticks, facing, speed){
		var level  = game.screens.inGame.current();
		var clear =false;
		
		//have we hit our tick limit?
		if(this.speed + this.lastMoved > 0){
			return false
		}
				
		
		var direction = this.getDirectionFromAngle(facing);
		
		
		if(direction == "left" &&
			game.screens.inGame.getTileAndUnitData(
				this.x -this.w,this.y,true) != level.icon.wall &&
			this.x >= this.w)
			{
			clear =true;
		}
		else if(direction == "right" &&
			game.screens.inGame.getTileAndUnitData(
				this.x+this.w,this.y,true) != level.icon.wall &&
			this.x < game.width - this.w){
			clear =true;
		
		}
		else if(direction == "up" &&
			game.screens.inGame.getTileAndUnitData(
				this.x,this.y -this.h,true) != level.icon.wall &&
			this.y >= this.h	){
			clear =true;
		
		}
		else if(direction == "down" &&
			game.screens.inGame.getTileAndUnitData(
				this.x,this.y+this.h,true) != level.icon.wall &&
			
			this.y < game.height -this.h){
			clear =true;
	
		}

		return clear;
	}
	this.move = function(ticks, facing, speed){
	
		if(this.canMove(ticks, facing, speed)){
			var direction = this.getDirectionFromAngle(facing);
			this.lastMoved =0;
			if(direction=="up"){
				this.y -= game.screens.inGame.current().grid.y;
			}
			else if(direction=="down"){
				this.y += game.screens.inGame.current().grid.y;
			}
			else if(direction=="left"){
				this.x -= game.screens.inGame.current().grid.x;
			}
			else if(direction=="right"){
				this.x += game.screens.inGame.current().grid.x;
			}
			
		}
		
	}
	
	this.getDirectionFromAngle = function(facing){
		var direction = facing;
		
		//conver facing to a number
		if(typeof(facing)=== "number"){
			facing = facing %(Math.PI *2);
		
		if(facing < 0){
				facing += Math.PI + Math.PI;
			}
			if(facing > Math.PI/4 && facing < Math.PI/4 *3){
				direction = "left";
			}
			else if(facing > Math.PI/4 *3 && facing < Math.PI/4 *5){
				direction = "down";
			}
			else if(facing > Math.PI/4 *5 && facing < Math.PI/4 *7){
				direction = "right";
			}
			else {
				direction = "up";
			}
		}
		return direction;
	}
	this.onCollision = function(effect){
		this.health -= effect.damage;
		game.log.push(this.name + " took "+ effect.damage+ " damage");
	}

}
game.objects.units.base.prototype = game.objects.base;


/*
The base weapon
*/
game.objects.weapons = {};
game.objects.weapons.base =function(){
	this.id = false;
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	this.angle = 0;
	this.mouseAim =false;
	this.ranged =false;
	this.range = 8;//manhatan dist to target

	this.sinceLastFired =0;
	this.rateOfFire = 1;
	this.sprite = null;
	this.bulletEffect ="弹";
	this.flashEffect ="闪";
	this.fired = false;
	this.effects =[];
	this.effectsLimit = 1;
	this.effectType = "base";
	
	this.canFire = function(ticks){
		return this.sinceLastFired  > this.rateOfFire && 
			this.effects.length < this.effectsLimit;
	}
	
	this.fire= function(ticks, shooter, target){
		this.sinceLastFired= 0;
		var item = new game.objects.effects[this.effectType]( 
					shooter.x,
					shooter.y,
					Math.atan2(shooter.x -target.x, shooter.y-target.y,
					this.name)
					);
		item.team =shooter.team;
		this.effects.push(item);
		this.fired=true;

	
	}
	this.update =function(ticks,id){
		this.sinceLastFired +=ticks;
		this.fired =false;
		for(var i =0;i < this.effects.length;i++){
			if(!this.effects[i].update(ticks,i)){
				this.effects.splice(i,1);
			}
		}
	}
	this.draw =function(context){
		context.save();
			context.translate(this.x + this.w/-2, this.y-this.h/2);
			if(this.sprite){
				
				this.sprite.draw(context,this.w,this.h);
			}
			else{
				context.fillStyle= "#999999";
				context.fillText(this.icon,0,0,this.w,this.h);
			}
		context.restore();
		for(var i =0;i < this.effects.length;i++){
			this.effects[i].draw(context);
			
		}
	}
};
game.objects.weapons.base.prototype = game.objects.base;


/*
The base effect
*/
game.objects.effects={};
game.objects.effects.base = function(_x, _y, _angle, _parent ){
	this.team ="enemy";
	this.speed = 0.1;
	this.x =_x;
	this.y =_y;
	this.w =8;
	this.h =8;
	this.angle = _angle;
	this.collides = true;
	this.type="effect";
	this.name="Generic"
	this.collideEffect= "flash";
	this.distanceCull = true;
	this.remove =false;
	this.damageMax =5;
	this.damageMin = 0;
	this.parent = _parent;
	
	this.damage = Math.floor(Math.random()
		* (this.damageMax - this.damageMin) 
		+ this.damageMin);
	
	
	this.update =function(ticks ,id){
		this.id =id;
		if(this.collides){	
			if(this.canMove(ticks, this.angle, this.speed)){
				this.move(ticks,this.angle,this.speed);	
			}
			else{
				this.onCollision();
			}
			if(this.team == "player"){
				for(var i =0; i < game.screens.inGame.current().units.length;i++){
					var u = game.screens.inGame.current().units[i];
					if(u.collides && u.contains(this.x ,this.y)){
						diesel.raiseEvent("effectcollides", this, u);
					}
				}
			}
			else{
				if(game.objects.player.contains(this.x,this.y)){
					diesel.raiseEvent("collision", this);
				}
			}
			
		
		}
		else{
			this.move(ticks,this.angle,this.speed);	
		}
		
		//are we off screen popus off the effect stack;
		if(this.distanceCull && game.objects.player.manhattanDistance(this.x,this.y) > game.width/2 + game.height/2){
	
			this.remove = true;
		}
		
		return !this.remove;
		
		
	};
	this.onCollision =function(unit){
		this.remove = true;
	}
};
game.objects.effects.base.prototype = game.objects.base;

/*
 The base level
*/

game.objects.level = function(seed,startx,starty){
	this.grid={
		x:game.objects.player.w,
		y:game.objects.player.h
	}
	this.simplex = new SimplexNoise();
	this.icon = {
		up:"上",
		down:"下",
		wall:"X",
		empty: " ",
		door:"門",
		fountain:"泉",
		goal:"愛"//love
	}
	this.visibility = 50; //how far you can see in squares.
	this.x =0;
	this.y =0;
	this.data =[];
	this.noise =[];
	this.fog=[];
	this.monsterTypes = [
		"monster",
		"dog",
		"fly",
		"boar"
	];
	this.isGoal =false;
	this.colorRGB = [
		Math.floor(0x99 * Math.random() + 0x66),
		Math.floor(0x99 * Math.random() + 0x66),
		Math.floor(0x99 * Math.random() + 0x66)];
	this.color = "#"+this.colorRGB[0].toString(16)+
	this.colorRGB[1].toString(16)+
	this.colorRGB[2].toString(16);
		
	this.units = [];
	this.path=[];
	this.up=false;
	this.down=false;
	
	
	//assign data to data
	this.init =function(seed){
		//setup hallways
		var upY = Math.round(starty/this.grid.y);
		var upX = Math.round(startx/this.grid.x);
		this.up = [upY,upX];
		this.icon.wall = String.fromCharCode(Math.floor(0x4e00* Math.random()+0x4e00));
		
		for(var j =0; j< game.height/this.grid.y;j++){
			var row = [];
			var noiseRow=[];
			var fogRow=[];
			for(var i = 0; i< game.width/this.grid.x;i++){
				//TODO noise.
				var tile = Math.random();
				var tile = this.simplex.noise(i/5,j/5);
				noiseRow.push(tile);
				
				if(tile  > seed/100*Math.random()){
					row.push(this.icon.empty);
				}
				else{
					row.push(this.icon.wall);
					
				}
				fogRow.push(true);
			}
			this.data.push(row);
			this.noise.push(noiseRow);
			this.fog.push(fogRow);
		}
	//add details
		//ensure we can get from the exit to the entrance
	
		var result = [];
		var tries = 0;
		var triesMax =50;
		var point = this.randomSpot();
		
		var graph;
		while(result.length == 0 && tries < triesMax ){
			point = this.randomSpot();
			
			if(point[1] !=upY && point[0] !=upX){
			
			
				if(tries ==Math.floor(triesMax/2)){
					for(var y = upY-1; y<= upY+1 && y >=0 && y < this.data.length; y++){
						for(var x = upX-1; x<= upX+1 && x >=0 && x <this.data[y].length ; x++){
							this.data[y][x]= this.icon.empty;
						
						}
					}
				}
				
				if(this.data[point[1]][point[0]] == this.icon.empty && point[1] < this.data.length -2){
					
					var start = [upY,upX];
					var end = [point[1],point[0]];
					var graph = [];
					for(var i =0; i < this.data.length;i++){
						graph.push(this.data[i].slice());
					}
					
					result = StupidSearch(graph,start,end,this.icon.wall);
					tries++;
				}
				else{
					if(Math.random > .25){
					this.data[point[1]][point[0]]= this.icon.empty;
					}
					else{
					this.data[point[1]][point[0]]= this.icon.door;
					}
				}
			}
			
		}
		
		if(tries == triesMax){
			//we are not gonna be able to wlak from point a to the goal fix it
			console.log("adding goal");
			//we need draw love some where on the level make some space
			for(var y = upY-2; y<= upY+2 && y >=0 && y < this.data.length; y++){
				for(var x = upX-2; x<= upX+2 && x >=0 && x <this.data[y].length ; x++){
					this.data[y][x]= this.icon.empty;
					
				}
			}
			
			//add the goal:
			var goal = Math.floor(25*Math.random());
			if (goal == 12){goal++};
		
			this.data[upY + Math.floor(goal/5) -2][upX + goal%5 -2] = this.icon.goal;
			
			
		}
		else{
			this.path = result;
			this.down = point;
		}		
		
		//stairs
		this.data[point[1]][point[0]] = this.icon.down;
		this.data[upY][upX] = this.icon.up;
		
		
		//add monsters
		var monsters = Math.random() * 10 + game.screens.inGame.currentLevel %6;
		var monsterType = this.monsterTypes[Math.floor(Math.random() *this.monsterTypes.length)];
		for(var m =0; m< monsters;m++){
		point = this.randomSpot();
			while(this.data[point[1]][point[0]] != this.icon.empty){
				point = this.randomSpot();
			}
			this.units.push(
				new game.objects[monsterType](point[0] * this.grid.x,
				point[1] * this.grid.y));
		}
		
		//add doors if appropriate
		//TODO
		point = this.randomSpot();
		if(point[0] !=upX && point[1] !=upY){
			this.data[point[1]][point[0]] = this.icon.door;
		}
		
		//add a fountain into the map.
		point = this.randomSpot();
		if(point[0] !=upX && point[1] !=upY){
			this.data[point[1]][point[0]] = this.icon.fountain;
		}
	}
	
	
	this.randomSpot = function(){
		var data = Math.floor(Math.random() * this.data.length) ;
		return [Math.floor(Math.random() * this.data[data].length), data];	
	}
	this.canSee =function(x,y){
		//TODO
		return this.fog[y] &&!this.fog[y][x];
	}
	
	this.draw=function(context){
		context.save();
			context.translate(this.x,this.y);
			//draw the path thw first few levels
			if(this.id < 2){
				visible = 2-this.id/3;
				context.fillStyle = "rgba(0,128,0,"+visible+")";
				for(var i =0; i< this.path.length;i++){
				
					context.fillRect(this.path[i][1]* this.grid.x,this.path[i][0]* this.grid.y, this.grid.x,this.grid.y);
				}
			}
	
			for( var  y = 0; y <  this.data.length;y++){
				for( var  x = 0; x <  this.data[y].length;x++){
					if(this.canSee(x,y)){
					
						context.fillStyle ="#090703";	
						context.fillStyle ="rgba("+Math.floor(this.colorRGB[0]/3 - this.noise[y][x] * 5)%128+","
													+ Math.floor(this.colorRGB[1]/3- this.noise[y][x] *5)%128+","+
													 Math.floor(this.colorRGB[2]/3- this.noise[y][x] * 5)%128+","
													+Math.abs(this.noise[y][x])+")";;
						context.fillRect(x*this.grid.x, y * this.grid.y, this.grid.x,this.grid.y);
					
						context.fillStyle = "#ffffff";
						var tile= this.data[y][x];
						if(tile == this.icon.wall){
							context.fillStyle = this.color;
						}
						else if(tile == this.icon.fountain){
							context.fillStyle = "#0000ff";
						}
						else if(tile == this.icon.door){
							context.fillStyle = "#ffcc00";
						}
						else if(tile == this.icon.goal){
							context.fillStyle = "#"+
							Math.floor(128* Math.sin(diesel.frameCount/16)+128).toString(16)+
							Math.floor(128* Math.sin(diesel.frameCount/64)+128).toString(16)+
							Math.floor(128* Math.sin(diesel.frameCount/32)+128).toString(16)
						}
							
						
						context.fillText(this.data[y][x],
							x*this.grid.x, (y+1) *this.grid.y);
					}
				}
			}
		context.restore();
		context.save();
			context.translate(8,0);
			for(var i = 0;i < this.units.length;i++){
				if(this.canSee(this.units[i].x/this.grid.x,this.units[i].y/this.grid.y)){
					this.units[i].draw(context)
				}
			}
			
			game.objects.player.draw(game.context.main);
		context.restore();
		
	};
	this.update =function(ticks,id){
		//update units.
		if(!this.id||this.id!= id){
			this.id =id;
		}
		for(var i = 0;i < this.units.length;i++){
			this.units[i].update(ticks, i)
		}
		
		// update the fog of war!
		for(var y= 0; y < this.data.length;y++){
			for(var x=0; x < this.data[y].length;x++){
				if(this.fog[y][x] &&
					Math.abs( game.objects.player.x -(x*this.grid.x) )+ 
					Math.abs( game.objects.player.y -(y*this.grid.y)) 
					< game.objects.player.vision){
					 this.fog[y][x] = false;
					 game.objects.player.score++;
					}
			}
		}
	}
	
	this.init(seed);
}
game.objects.level.prototype = game.objects.base;

