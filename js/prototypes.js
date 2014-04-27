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
			context.translate(this.x - this.w/2,this.y+ this.h);
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
