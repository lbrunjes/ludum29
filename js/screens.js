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
		this.fillTextCenteredX(game.context.ui, "[ SPACE ]",game.width/2,game.height/4*3 +32);





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

