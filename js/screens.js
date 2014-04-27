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
		game.context.ui.clearRect(0,0,game.width,game.height);

		//draw the title
		game.context.ui.fillStyle = game.colors.orange;

		this.fillTextCenteredX(game.context.ui, game.name, game.width/2, game.height/4);

		//draw the buttons
		game.context.ui.strokeStyle= game.colors.tan;
		game.context.ui.strokeRect(16, game.height/3 +16, game.width/2 -32, game.height/4);
		game.context.ui.strokeRect(game.width/2 + 16, game.height/3 +16, game.width/2 -32, game.height/4);

		this.fillTextCenteredX(game.context.ui, "PLAY", game.width/4, game.height/2);
		this.fillTextCenteredX(game.context.ui, "SCORES", game.width/4*3, game.height/2);




		//draw the keys
		game.context.ui.fillStyle = game.colors.blue;
		this.fillTextCenteredX(game.context.ui, "[⇧]",game.width/2,game.height/4*3 );
		this.fillTextCenteredX(game.context.ui, "[⇦][⇩][⇨]",game.width/2,game.height/4*3 +16);
		this.fillTextCenteredX(game.context.ui, "[ SPACE ]",game.width/2,game.height/4*3 +32);





	}
};
game.screens.main.prototype = game.screens.base;
game.screens.main =new game.screens.main();







game.screens.game= function(){
	this.x = 0;
	this.y=0;
	this.clickZones=[

	];
	this.player =false;
	this.units=[];
	this.world =[];
	
	this.reset = function(){
		console.log("resetting level");
		this.player = new game.objects.player();
		this.world = new game.objects.level();
		

	}

	this.draw = function(){
		//darw the level units and palyer
		this.world.draw(game.context.level);

		for(var i = 0 ; i < this.units.length; i++){
			this.units[i].draw(game.context.level);
		}
		this.player.draw(game.context.level);


		//draw UI
		game.context.ui.clearRect(0,0,game.width,game.height);
		
		game.context.ui.fillStyle = game.colors.orange;
		game.context.ui.fillText ("SCORE:" + this.player.score, 16 , game.height -8);

		
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

	];

	this.noise = new SimplexNoise();


	this.draw = function(){
		game.context.level.fillStyle= game.colors.brown;
		game.context.level.fillRect(0,0,game.width,game.height);

		//

		//draw UI

		
	}
	this.update

}
game.screens.scores.prototype = game.screens.base;
game.screens.scores =new game.screens.scores();













game.screens.endGame = function(){


}
game.screens.endGame.prototype = game.screens.base;
game.screens.endGame =new game.screens.endGame();

