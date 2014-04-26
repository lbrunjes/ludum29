/*





*/

var game = {
	width:640,
	height:480,
	font: "16px monospace",
	fontsize :16,
	container:"container",
	directions:{
		up:0,
		down: Math.PI,
		left: Math.PI/2,
		right: Math.PI/2*3,
	},
	keys:{
		"left":37, 
		"right":39,
		"up":38,
		"down":40	
	},
	keysDown:{
		"left":false, 
		"right":false,
		"up":false,
		"down":false,
	},
	settings:{
		dataDirectory:"data/",
		currentScreen:"main"
	},
	events:{
		"startup":function(){
			document.getElementById(game.container).focus();

			var savedhs = game.util.highScores= diesel.load("highScores");
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
			
			if(game.log.length != game.util.loglength){
				var ele = document.getElementById("log");
				
				if(ele){
					
					var logadds = "";
					for(var i = game.util.loglength; i<game.log.length;i++){
						logadds = "<p>"+game.log[i]+"</p>"+logadds;
						console.log(game.log[i]);
					}

					ele.innerHTML = logadds +ele.innerHTML;
				}
				
			}
			game.util.loglength = game.log.length;
			if(game.ticks %100 ==0 && game.ticks -1 != diesel.frameCount){
				console.log("@",game.ticks, diesel.frameCount);
			}
		},
		"keydown": function(event){
			for(keyname in game.keys){
				if(event.keyCode == game.keys[keyname]){
					game.keysDown[keyname] =true;
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
			var score = game.objects.player.score;
			var i =0;
			while(i<game.util.highScores.length && game.util.highScores[i].score >=score){
				i++;
			}
			game.util.highScores.splice(i,0,{
				"score":score,
				"name":name,
				"level": game.screens.inGame.currentLevel,
				"goal":game.objects.player.hasGoal});
			
			diesel.save("highScores", game.util.highScores);
			
			
			return i+1;
		}
	},

};
