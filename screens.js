/*
	Screens for use in teh game.




*/
game.screens.main= function(){

	this.clickZones=[

	];

	this.draw = function(){

			var __y = game.height/4*3;
		this.fillTextCenteredX(game.context.ui, "         [⇧]         ",game.width/2,__y );
		__y+=16;
		this.fillTextCenteredX(game.context.ui, "Keys: [⇦][⇩][⇨]      ",game.width/2, __y);
		__y+=16;
		this.fillTextCenteredX(game.context.ui, "     [i][space]     ",game.width/2, __y);
		


	}

	this.update = function(){

		
	}

	this.mousedown =function(){


	}

	this.keydown= function(){


	}
}
game.screens.main.prototype = new game.screens.base();
game.screens.main =new game.screens.main();







game.screens.game= function(){

	this.clickZones=[

	];
	this.draw = function(){

		
	}
	this.update

}
game.screens.game.prototype = new game.screens.base();
game.screens.game =new game.screens.game();
