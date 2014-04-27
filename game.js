/*





*/

var game = {
	name:"Pitfall",
	width:640,
	height:480,
	font: "16px monospace",
	fontsize :16,
	container:"container",
	colors:{
		orange:"#FF6E00",
		green:"#14CC7A",
		blue:"#40FFDF",
		brown:"#292212",
		tan:"#CC9114",
		black:"#000"
	},
	directions:{
	//	up:0,
	//s	down: Math.PI,
		left: Math.PI/2,
		right: Math.PI/2*3,
	},
	keys:{
		"left":37, 
		"right":39,
		"up":38,
		"down":40,
		"jump": 13,
		"back":8
	},
	keysDown:{
		"left":false, 
		"right":false,
		"up":false,
		"down":false,
		"space":false,
		"back":false
	},
	settings:{
		dataDirectory:"data/",
		screen:"main"
	},
	events:{
		"startup":function(){
			document.getElementById(game.container).focus();

			var savedhs = diesel.load("ludum29_highScores");
			if(savedhs){
				game.util.highScores = savedhs;
			}
		},
		"draw":function(event){
			game.screens[game.settings.screen].draw(event.args[0]);
		},
		"update":function(event){
			game.ticks++;
			game.screens[game.settings.screen].update(event.args[0]);
		},
		"keydown": function(event){
			for(keyname in game.keys){
				if(event.keyCode == game.keys[keyname]){
					game.keysDown[keyname] = true;
					event.preventDefault();
				}
			}
			if(game.screens[game.settings.screen].keydown){
				game.screens[game.settings.screen].keydown(event);

			}

				
		},
		"keyup":function(event){
			for(keyname in game.keys){
				if(event.keyCode == game.keys[keyname]){
					game.keysDown[keyname] =false;
					event.preventDefault();
				}
			}	
			if(game.screens[game.settings.screen].keyup){
				game.screens[game.settings.screen].keyup(event);
			}
		},
		"click":function(evt){
			if(game.screens[game.settings.screen] &&
					game.screens[game.settings.screen].click){

				game.screens[game.settings.screen].click(evt);
			}
			else{
				game.context.vfx.fillText("No Scene: "+game.settings.screen, diesel.mouseX, diesel.mouseY);
				evt.preventDefault();
			}
		},
		"screenChange":function(event){
			var from = event.args[0], to = event.args[1], transition = event.args[2]|| false;
			console.log(from, to, transition);

			game.screens[from].close();
			if(transition){
				game.screens[transition].reset(from, to);
				game.screens[transition].open();
				game.settings.screen = transition;
			}
			else{
				game.screens[to].reset();
				game.screens[to].open();
				game.settings.screen = to;
			}
		
		},
		"collision":function(event){
			
			diesel.raiseEvent("screenChange","game", "endGame");
		}
	},
	screens:{},
	objects:{},
	context:{
		"level":"2d",
		"ui":"2d"
	},
	util:{
		"loglength":0,
		"highScores":[],
		"getHighScores":function(){
			return game.util.highScores;
		
		},
		"addHighScore":function(initials){
			if(!game.util.highScores){
			game.util.highScores =[];
			}
			var name = game.objects.player.name;
			if(initials){
				name = initials;
			}
			var score = Math.ceil(game.screens.game.player.score);
			var i =0;
			while(i<game.util.highScores.length && game.util.highScores[i].score >=score){
				i++;
			}
			game.util.highScores.splice(i,0,{
				"score":score,
				"name":name,
			
				"goal":game.objects.player.hasGoal});
			
			diesel.save("ludum29_highScores", game.util.highScores);
			
			
			return i+1;
		}
	},

};

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

/*
	Screens for use in teh game.




*/
game.screens.main= function(){

	this.clickZones=[
		{x:16,y: game.height/3 +16,w:game.width/2 -32,h:game.height/4,"click":function(){
				diesel.raiseEvent("screenChange","main","game");		
		}},
		{x:16 +game.width/2,y: game.height/3 +16,w:game.width/2 -32,h:game.height/4,"click":function(){
				diesel.raiseEvent("screenChange","main","scores");		
		}},
	];

	this.draw = function(){
		game.context.level.fillStyle = game.colors.blue;
		game.context.level.fillRect(0,0, game.width, game.height/4);
		game.context.level.fillStyle = game.colors.green;
		game.context.level.fillRect(0,game.height/4, game.width, game.height/4);
		game.context.level.fillStyle = game.colors.tan;
		game.context.level.fillRect(0,game.height/2, game.width, game.height/4);
		game.context.level.fillStyle = game.colors.brown;
		game.context.level.fillRect(0,game.height/4*3, game.width, game.height/4);
	
		
		game.context.ui.clearRect(0,0,game.width,game.height);

		//draw the title
		game.context.ui.fillStyle = game.colors.orange;
		var text = game.context.ui.font;
		game.context.ui.font = "64px monospace";
		this.fillTextCenteredX(game.context.ui, game.name, game.width/2, game.height/4);
		game.context.ui.font = text;
		//draw the buttons
		game.context.ui.fillStyle = game.colors.black;
		game.context.ui.fillRect(16, game.height/3 +16, game.width/2 -32, game.height/4);
		game.context.ui.fillRect(game.width/2 + 16, game.height/3 +16, game.width/2 -32, game.height/4);

		game.context.ui.strokeStyle= game.colors.tan;
		game.context.ui.strokeRect(16, game.height/3 +16, game.width/2 -32, game.height/4);
		game.context.ui.strokeRect(game.width/2 + 16, game.height/3 +16, game.width/2 -32, game.height/4);
		
		game.context.ui.fillStyle = game.colors.blue;
	
		this.fillTextCenteredX(game.context.ui, "PLAY", game.width/4, game.height/2);
		this.fillTextCenteredX(game.context.ui, "SCORES", game.width/4*3, game.height/2);




		//draw the keys
		game.context.ui.fillStyle = game.colors.blue;
		//this.fillTextCenteredX(game.context.ui, "[⇧]",game.width/2,game.height/4*3 );
		this.fillTextCenteredX(game.context.ui, "[⇦][⇩][⇨]",game.width/2,game.height/4*3 +16);
		//this.fillTextCenteredX(game.context.ui, "[ SPACE ]",game.width/2,game.height/4*3 +32);





	}
};
game.screens.main.prototype = game.screens.base;
game.screens.main =new game.screens.main();







game.screens.game= function(){
	this.x = 0;
	this.y=0;
	this.clickZones=[];
	this.player =false;
	this.units=[];
	this.world =[];
	
	this.reset = function(){
		console.log("resetting level");
		this.player = new game.objects.player();
		this.world = new game.objects.level();
		
		game.context.ui.clearRect(0,0,game.width,game.height);
		
	}

	this.draw = function(){
		game.context.ui.clearRect(0,0,game.width, game.height);// -32,game.width,32);
		
		game.context.level.save();
		game.context.level.translate(0,Math.floor(this.world.y));
		//draw the level units and palyer
		this.world.draw(game.context.level);

		for(var i = 0 ; i < this.units.length; i++){
			this.units[i].draw(game.context.level);
		}
		this.player.draw(game.context.ui);
		game.context.level.restore();

		//draw UI
		
		game.context.ui.fillStyle = game.colors.orange;
		game.context.ui.fillText ("SCORE:" + Math.floor(this.player.score), 16 , game.height -8);
		game.context.ui.fillText ("SPEED:" + Math.floor(this.world.speed), game.width -100 , game.height -8);
		
	}
	this.update = function(ticks){
		this.world.update(ticks);
		this.player.update(ticks);
		for(var i = 0 ; i < this.units.length; i++){
			this.units[i].update(ticks);
		}

	}

}
game.screens.game.prototype = game.screens.base;
game.screens.game =new game.screens.game();















game.screens.scores= function(){
	
	this.clickZones=[
		{x:0,y:0,w:game.width,h:game.height,"click":function(){diesel.raiseEvent("screenChange","scores","main");}}
	];

	this.noise = new SimplexNoise();


	this.draw = function(){
		// game.context.level.fillStyle= game.colors.brown;
		// game.context.level.fillRect(0,0,game.width,game.height);
		// //draw UI
		game.context.ui.fillStyle = game.colors.blue;
		

		game.context.ui.clearRect(0,0,game.width,game.height);
		game.context.ui.fillText("Name", 64,64);
		game.context.ui.fillText("Score", 256,64);
			
		if(game.util.highScores){
			for(var i = 0; i< game.util.highScores.length && i <20; i++){
				if( i < 9){
					game.context.ui.fillText(i+1, 9,80 + i *16);
				}
				else{
					game.context.ui.fillText(i+1, 0,80 + i *16);
				}
				game.context.ui.fillText(game.util.highScores[i].name, 64,80 + 16*i);
				game.context.ui.fillText(game.util.highScores[i].score, 256,80 + 16*i);
			}
		}

		//
		this.fillTextCenteredX(game.context.ui, "Press [Enter] to continue", game.width/2, game.height - 32);
		

		
	}

	this.keydown =function(event){
		
			if(event.keyCode == 13){
				diesel.raiseEvent("screenChange","scores","main");
			}
		}

}
game.screens.scores.prototype = game.screens.base;
game.screens.scores =new game.screens.scores();













game.screens.endGame = function(){
this.rank = false;
this.i =0;
this.name =["A","A","A"];

this.reset = function(){

	this.rank = false;
	this.i =0;
	this.name =[" "," "," "," "," "," "," "," "];

}

this.clickZones = [
	{x:0,y:0,w:game.width,h:game.height,"click":function(){if(this.rank){diesel.raiseEvent("screenChange","endGame","main");}}}
];

this.draw = function(){
	game.context.ui.clearRect(0,0,game.width, game.height);
	game.context.ui.fillStyle = game.colors.blue;
	if(this.rank){
		this.fillTextCenteredX(game.context.ui,this.name.join("").trim()+ " is the #"+
		this.rank+" player of all time", 
		game.width/2, game.height/2);
		this.fillTextCenteredX(game.context.ui, "Press [Enter] to continue", game.width/2, game.height - 32);
	}
	else{
		this.fillTextCenteredX(game.context.ui, "GAME OVER", game.width/2, game.height/2);
		this.fillTextCenteredX(game.context.ui,
					"ENTER YOUR INITALS:"+this.name.join(""),game.width/2,game.height/2+16);
		this.fillTextCenteredX(game.context.ui,
					"Then press enter",game.width/2,game.height/2+32);
	}
}

	this.keydown =function(event){
		if(!this.rank){
			if(event.keyCode == 13){
				this.rank = game.util.addHighScore(this.name.join(""));
			
			}else{	
				if(event.keyCode == 8){
					this.i--;
					this.name[this.i] = " ";
					
				}
				else{
					var key=diesel.getKeyName(event.keyCode);
					if(key==="Space"){
						key =" ";
					}

					this.name[this.i] = key.substring(0,1);
					
					this.i = (this.i +1) % this.name.length;
				}
			}
		}else{
			diesel.raiseEvent("screenChange","endGame","main");
		}
	
	}

}
game.screens.endGame.prototype = game.screens.base;
game.screens.endGame =new game.screens.endGame();

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
		
			context.fillRect(0,-2,this.w, 3);

		}
		if(game.keysDown.right){
			context.fillStyle = game.colors.orange;
		
			context.fillRect(-2,0, 3,this.h);

		}
		if(game.keysDown.left){
			context.fillStyle = game.colors.orange;
		
			context.fillRect(this.w,0,3, this.h);

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
