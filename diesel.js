/*
	Diesel
	A Simple Html5 Game engine.

	Designed to make the building game about making the game instead of wrangling html.

	Lee Brunjes 2013
	
	Version 0.4
	Last updated: 31 Mar, 2014
	TODO:
	game now only called at init time.
	figure out why I made event arg objects instead of just making one instead? 
		I think I wanted to modify the event arguments but I don't really know.
	general API cleanup. maybe some name spaces.
	Sane caching from preloads
	mobile testing/multitouch?

*/
var diesel={
	
	
	"debug":false, //are we currently debugging?
	"debugCanvas":false, //should we add the debug overlay?
	"debugData":[], //data for the debugger.
	"started":false, //have we set up the game yet?
	"shouldLoop":true, //if the game loop keeps running after the next draw call
	"pauseOnBlur":true, //we the loop stops on blur
	"useContainerForEvents":false, //this must be changed before init is called or no dice.

	"fpsLimit": 60, 
	"keyCacheLength":10, //length of the following buffer
	"lastkeys":[], //buffer of pressed keys to allow combos
	"timeStarted":null, //starut up time of the engine
	"lastFrameTime":0,
	"lastFrameEnd":0, 
	"lastFrameStart":0,
	"nextFrame":null, //pointer to the next call to the loop.

	"frameCount":0, //number of frames run.

	"container"	:document.getElementsByTagName("body")[0], //handle for the game container to push events etc to
	"mouseX":0,
	"mouseY":0,
	"soundCache":{},
	"imageCache":{},
	"spriteCache":{},
	"preloads":0, // number of remaining preloads
	
	/*
		preload handling functions
		
	*/
	"preloadSuccess":function(){
		diesel.preloads--;
		if(diesel.preloads<=0){
			diesel.start();
		}
	},
	"preloadError":function(evt){
		console.log("Diesel, ERROR, loading an item from preloads",
			"this will likely cause errors later", evt);
		diesel.preloads--;
		if(diesel.preloads<=0){
			diesel.start();
		}
	},
	/*
	
	FPS Functions
	
	*/
	"timeBetweenFrames": function(){
		if(diesel.fpsLimit > 0 && diesel.fpsLimit <200){
			return 1000/diesel.fpsLimit;
		}
		return 4;//hardlimit at 200fps becuase after that is sort of dumb
	},
	"fps":function(){
		if(diesel.lastFrameTime>0){
			return 1000/diesel.lastFrameTime;
		}
		return diesel.fpsLimit;
	},
	
	//initializer
	"init":function(){
		//ensure that some on the stuff we are using exists.
		diesel.setCompatability();
		document.removeEventListener("DOMContentLoaded", diesel.init, false);

	
		console.log("Diesel, starting");
		diesel.timeStarted = new Date();
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameStart = new Date();
		
		if(!game){
			console.log("Diesel, Warning, no game object found, this is bad.");
		}
		if(!game.settings.dataDirectory){
			console.log("Diesel, Warning, no game.settings.dataDirectory. using current");
			game.settings.dataDirectory = "./";
		}
		//add a trailing slash if it is missing.
		if(game.settings.dataDirectory.lastIndexOf('/') != game.settings.dataDirectory.length-1){
			game.settings.dataDirectory = game.settings.dataDirectory +"/";
		}


		
		//at some point the game will have some assets to load here.
		if(game.preload){
			var file;
			for(i in game.preload){
				file= game.preload[i];
				if(file.image){
					if(!diesel.imageCache[file.image]){
						var img = new Image();
						img.id = file.image;
						diesel.imageCache[file.image] = img;
						diesel.preloads++;
							
						img.onerror = diesel.preloadError;
						img.onload = diesel.preloadSuccess;
						img.src=game.settings.dataDirectory+file.image;
					}
				}
				if(file.sound){
					if(!diesel.soundCache[file.sound]){

						var snd = new Audio();
						snd.id = file.sound;
						diesel.soundCache[file.sound] = snd;
						diesel.preloads++;

						snd.addEventListener("loadeddata", diesel.preloadError);
						snd.addEventListener("onerror", diesel.preloadError);
						snd.src=game.settings.dataDirectory+file.sound;
					}
				}
				if(file.sprite){
					if(!diesel.spriteCache[file.sprites]){
						diesel.preloads++;
						var spr = new diesel.sprite(file);
						diesel.spriteCache[file.sprite] = spr;
					}
				}
			}
		}
		else{
			console.log("Diesel, no preloads");
		}


		//set focus to the game container
		if(!game.container){
			console.log("Diesel, Warning, game.container is not defined. using body");
			diesel.container = document.getElementsByTagName("body")[0];
		}
		else{
			diesel.container = document.getElementById(game.container);
		}
		diesel.container.focus();
		
		diesel.raiseEvent("init");
		

		//initialize the canvas(es)
		var canvas_el;
		if(!game.context){
			console.log("Diesel, no context added in game context, using all canvases in the page");
			game.context = {};
			var els= document.getElementsByTagName("canvas");
			for( var i =0 ; i < els.length;i++ ){
				
				if(els[i].id ){
				game.context [els[i].id] = els[i];
				}
			}
		}
		else{
			for( var canvas in game.context){
				canvas_el = document.getElementById(canvas)
				
				//create it if it does not exist
				if(!canvas_el){
					canvas_el = document.createElement("canvas");
					canvas_el.id =canvas;
					diesel.container.appendChild(canvas_el);
				}
				
				game.context[canvas] = canvas_el.getContext("2d");

				//TODO preserve aspect ratio
				canvas_el.width = game.width;
				canvas_el.height = game.height;

				//debug data to show init;
				game.context[canvas].font = game.font;
				game.context[canvas].fillText("loaded " +canvas , 0,i);
				i+=game.fontSize;


			}
		}
		
		//setup teh debug pane
		var canvas = document.createElement("canvas");
		canvas.id = "__diesel_debug_canvas";
		canvas.width = game.width;
		canvas.height = game.height;
		diesel.container.appendChild(canvas);
		
		diesel.debugCanvas = canvas.getContext("2d");
		diesel.debugCanvas.font = game.font;
		diesel.debugCanvas.width = game.width;
		diesel.debugCanvas.height = game.height;
		
		
		if(!game.font){
			console.log("Diesel, Warning, No game.font, using defaults");
		}
		if(!game.fontsize){
			console.log("Diesel, Warning, No game.fontsize, using defaults");
		}

		//bind game events
		if(game.events){
			for(event in game.events){
				if(event){
					if(diesel.useContainerForEvents){
						diesel.container.addEventListener(event, game.events[event],false);
					}
					else{
						document.addEventListener(event, game.events[event],false);
					}
				}
			}
		}
		else{
			console.log("Diesel, Warning, game.events is not defined the game will not get inputs.");
		}

		//bind diesel events
		for(event in diesel.events){
			if(event){
				if(event.indexOf && event.indexOf("window")<0){
					diesel.container.addEventListener(event, diesel.events[event]);
				}
				else{
				window.addEventListener(event.substring(6), diesel.events[event]);
				}
			}
		}

		//start if needed
		if(diesel.preloads ==0 && !diesel.started){
			diesel.start();
		}

	},
	
	//send the startup event once things are bound.
	"start":function(){
		diesel.started==true;
		
		diesel.raiseEvent("startup");

		//start up the loop
		console.log("Diesel, Turning over. startup event sent");
		diesel.loop();
	},
	


	//called to run the game loop.
	"loop":function(){

		var frameStart = new Date();
		var timePassed = (frameStart - diesel.lastFrameStart)/1000;
		
		//spit out events
		diesel.raiseEvent("draw",timePassed);
		diesel.raiseEvent("update",timePassed);
		
		
		//record debug data 
		diesel.debugData.push({
			"lastFrameTime":diesel.lastFrameTime,
			"waitTime": Math.abs(diesel.timeBetweenFrames()  - diesel.lastFrameTime),
			"fps": diesel.fps(),
			"limit":diesel.fpsLimit,
			"frame": diesel.FrameCount,
			"mouse":[diesel.mouseX, diesel.mouseY]
		});
		if(diesel.debugData.length >50){
			diesel.debugData.splice(0,1);
		}
		if(diesel.debug){
			diesel.drawDebug(diesel.debugCanvas);
		}
		
		
		//Adjust internal counters and timers
		diesel.frameCount++;
		diesel.lastFrameStart = frameStart;
		diesel.lastFrameEnd = new Date();
		diesel.lastFrameTime = diesel.lastFrameEnd -frameStart;
		
		//allow the loop to continue
		if(diesel.shouldLoop){
			diesel.nextFrame =setTimeout(diesel.loop, Math.abs(diesel.timeBetweenFrames()  - diesel.lastFrameTime)+1);
		}
		else{
			diesel.nextFrame = false;
		}
	},
	

	/*
		Event injection
	*/
	
	"raiseEvent":function(eventName, args){
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent(eventName, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = eventName;
		}
		
		event.eventName = eventName;
		event.args = [];
		for(var i =1; i < arguments.length;i++){
			event.args.push(arguments[i]);
		}
		
		if (document.createEvent) {
			diesel.container.dispatchEvent(event);
		} else {
			diesel.container.fireEvent("on" + event.eventType, event);
		}
	},
	"raiseEventObject":function(eventName, object){
		var event;
		if (document.createEvent) {
			event = document.createEvent("HTMLEvents");
			event.initEvent(eventName, true, true);
		} else {
			event = document.createEventObject();
			event.eventType = eventName;
		}
		
		event.eventName = eventName;
		
		for(var key in object){
			event[key] = object[key];
		}
		
		if (document.createEvent) {
			diesel.container.dispatchEvent(event);
		} else {
			diesel.container.fireEvent("on" + event.eventType, event);
		}
	},
	//Events
	"events":{
		"mousemove":function(evt){		

			var rect = diesel.container.getBoundingClientRect()
			diesel.mouseX = evt.pageX - rect.left - diesel.container.scrollLeft - window.pageXOffset;

			diesel.mouseY = evt.pageY - rect.top - diesel.container.scrollTop -window.pageYOffset;
			
			
    
		},
		"windowblur":function(evt){
			if(diesel.pauseOnBlur){
				diesel.shouldLoop =false;
			}
		},
		"windowfocus":function(evt){
			diesel.shouldLoop = true;
			if(!diesel.nextFrame){
				diesel.lastFrameEnd = new Date();
				diesel.lastFrameStart = new Date();
				diesel.loop();
			}
		},
		"windowkeyup":function(evt){
			diesel.lastkeys.push(evt.keyCode);
			
			if(diesel.lastkeys.length > diesel.keyCacheLength){
				diesel.lastkeys.splice(0,1);
			}
			
			//this is really important
			if(diesel.lastkeys.length ==5){
			if(diesel.lastkeys[0] == 73 &&
				diesel.lastkeys[1] == 68 &&
				diesel.lastkeys[2] == 68 &&
				diesel.lastkeys[3] == 81 &&
				diesel.lastkeys[4] == 68)
			
				console.log("YOU DIRTY RAT");
			
			}
		}

	},

	/*
	Save/Load functions using localStorage
	*/
	"save":function(name, data){
		if(window.localStorage){
			localStorage[name]= JSON.stringify(data);
			console.log("Diesel, Saved", name);
		}
		else{
			console.log("Diesel:Cannot save, not supported.")
		}
	},
	"load":function(name){
		if(window.localStorage){
			if(localStorage[name]){
				return JSON.parse(localStorage[name]);
			}
			console.log("Diesel: Save not found");
		}
		else{
			console.log("Diesel: Cannot load, Not supported");
		}
		return false;
	},
	"listSaves":function(){
		var saves = [];
		for(save in localStorage){
			saves.push(save);
		}
		return saves;
	},
	"deleteSave":function(name){
		localStorage.removeItem(name);
	},	
	
	/*
		sprites
	
	*/
	"sprite":function(spriteObject){
		this.w = spriteObject.size[0];
		this.h = spriteObject.size[0];
		
		this.keys = spriteObject.keys;
		this.frames = spriteObject.frames;
		
		this.getSprite = function( name, frame){
			var idx =0;
			if(typeof (name) == "number"  ){
				idx = name *this.frames + frame;
			}
			else{
				if(this.keys[name]!== undefined){
			
					idx = this.keys[name] *this.frames + frame;
				}
			}
			return this.getSpriteByIndex(idx); ;
		}
		this.getSpriteByIndex = function( idx){
			return [this.w * (idx % this.frames),
				this.h * Math.floor(idx / this.frames),
				this.w,this.h] ;
		}
		
		this.id = spriteObject.sprite;
		this.image = new Image();
		this.image.onload = diesel.preloadSuccess;
		this.image.onerror = diesel.preloadError;
		this.image.src = game.settings.dataDirectory + this.id; 
		this.numAnimations = function(){
			return Math.floor(this.image.height/this.h);
		};
	
	},
	"spriteInstance":function(sprite){
		this.frame=0;
		this.frameCount= sprite.frames;
		this.animation="";
		this.sprite = sprite;
		this.draw = function(context, w,h){
		
		if (!w ){
			w =this.sprite.w;
		}
		if(!h){
		 h =this.sprite.h;
		}
			var src = this.sprite.getSprite(this.animation, this.frame);
			context.drawImage(this.sprite.image, 
				src[0],src[1],src[2],src[3],0,0,w,h );
		};
		this.nextFrame =function(){
			this.frame = (this.frame + 1) % this.frameCount;
		};
	},
	/*
		Utilities
	*/
	//setup some default things and override if they dont exist;
	"setCompatability":function(){
		if(!window.console){
			window.console = {"log":function(args){}};
		}
		if(!window.localStorage){
			console.log("Diesel, No Local Storage. Faking...");
			window.localStorage = {};
		}
	},
	"keyNames":{
		8:"Backspace",
		9:"Tab",
		13:"Enter",
		16:"Shift",
		17:"Ctrl",
		18:"Alt",
		20:"Caps Lock",
		27:"Escape",
		32:"Space",
		33:"Page Up",
		34:"Page Down",
		35:"End",
		36:"Home",
		37:"Left",
		38:"Up",
		39:"Right",
		40:"Down",
		45:"Insert",
		46:"Delete",
		48:"10",
		49:"1",
		50:"2",
		51:"3",
		52:"4",
		53:"5",
		54:"6",
		55:"7",
		56:"8",
		57:"9",
		112:"F1",
		113:"F2",
		114:"F3",
		115:"F4",
		116:"F5",
		117:"F6",
		118:"F7",
		119:"F8",
		120:"F9",
		121:"F11",
		122:"F11",
		123:"F12",
		144:"Num Lock",
		219:"[",
		220:"|",
		221:"]",
		222:"'"
	},
	"getKeyName":function(keyCode){
		if( diesel.keyNames[keyCode]){
			return diesel. keyNames[keyCode];
		}
		// hope this  is a ltter key:)
		return String.fromCharCode(keyCode);
	},
	"simulateKeyUp":function(keyCode){
		diesel.raiseEventObject("keyup",{"keyCode":keyCode});
	},
	"simulateKeyDown":function(keyCode){
		diesel.raiseEventObject("keydown",{"keyCode":keyCode});
	},
	"clamp":function(x, small, big){
		return Math.max(Math.min(x,big),small);
	},
	"drawDebug":function(context){
		context.clearRect(0,0,context.width,context.height);
		
		context.fillStyle = "rgba(22,22,22,.75)";
		context.fillRect(0,0,context.width,context.height);
		context.fillStyle = "#ffffff";
		context.fillText("Diesel, Debug Canvas",16,16);
		
		context.fillText("BARS--red:total frame time. green: waiting time",16,32);
		context.fillText("white line is fps",16,48);
		context.fillText("Frames:"+diesel.frameCount+
			" Mouse:("+diesel.mouseX+","+diesel.mouseY+") fps limit:"
			+diesel.fpsLimit,16,64);
		var w = context.width/50;
		for(var i = 0; i < diesel.debugData.length;i++){
			
			context.fillStyle = "#ff0000";
			
			context.fillRect(i*w,context.height- diesel.debugData[i].lastFrameTime, 
				w, diesel.debugData[i].lastFrameTime);
			if(i%10 ==0){
				context.fillText(Math.floor(diesel.debugData[i].lastFrameTime), i*w,
				context.height- diesel.debugData[i].lastFrameTime )
			}
			
			context.fillStyle = "#00ff00";
			context.fillRect(i*w,context.height- diesel.debugData[i].waitTime, w, 
				diesel.debugData[i].waitTime);
			context.fillStyle = "#ffffff";
			if(i%10 ==0){
				context.fillText(Math.floor(diesel.debugData[i].waitTime)	, i*w,
				context.height- diesel.debugData[i].waitTime+16 )
			}
			
		
			context.fillRect(i*w,256 - diesel.debugData[i].fps , w, 1);
			if(i%10 ==0){
				context.fillText(Math.floor(diesel.debugData[i].fps)	, i*w,
				256 - diesel.debugData[i].fps )
			}
			
			
		}
	},
	"ajax":function(url){
		var xhr = new XMLHttpRequest();
		  
		xhr.open("GET", url,false);
		xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    
		xhr.send(null);
		if (xhr.status !== 200 && xhr.status !== 0)
		{
			console.log("diesel, Ajax missed", xhr);
			
		}
		else{
			return (xhr.responseText);
		}
  },


}

//this calls the inti function to start the engine.
document.addEventListener("DOMContentLoaded", diesel.init, false);

