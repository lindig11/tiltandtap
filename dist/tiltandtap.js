(function(  )  {

	/*
	tiltandtap is a JavaScript framework that recognize jerk tilting interactions:
	Tilt Up, Tilt Down, Tilt Left, Tilt Right, Tilt Clockwise and Tilt Counter-clockwise
	Tilting interactions can also be combined to touch gestures (tap, multiple taps and tap hold)
	on specific DOM elements
	@author: Linda Di Geronimo
	@company: ETH Zurich
	@website: globis.ethz.ch
	
	
	TODO: 
	-portrait upside down 
	-firefox support
	-callback for touch
	-de-activation touch
	-threshold levels
	-check if orientation changed and cc tilt gestures
	*/
	
	//CONSTANT GLOBAL VARIABLES
	var FIR = "firefox";
	var CHR = "chrome";
	var SAF = "safari";
	var OTH = "other";
	var OPE = "opera";
	//error messages 
	var error_message_fir = "unfortunately firefox does not support the devicemotion event, please try with another browser";
	var error_message_int = "unfortunately your browser does not support the devicemotion event, please try with another browser/device";
	var error_touch = ": touch gestures was not recognized for this tilting interaction, please specify: 'hold' or the number of taps as an integer";
	var error_touch_element = "please specify a correct element for the tilting interaction: "
	//==============================constructor===========================//
	this.tiltandtap = function() {
	
	
	//global variables and default value for options
	this.tiltLeft = defoptions();
	this.tiltRight = defoptions();
	this.tiltUp = defoptions();
	this.tiltDown = defoptions(),
	this.tiltClockwise = defoptions();
	this.tiltConterclockwise = defoptions();
	this.dimbuffer = 3;
	this.dimbufferdiscard = 20;
	this.buffer = new Array();
	this.frequency = 50;
	this.overlap = 1;
	this.notSupported = "";
	this.tap_interval = 200;
	this.taphold_interval = 200;
	this.touch_interval = 200;
	
	//utility variables
	//array of tilting interactions that dev want to perform
	this._ttoperform = new Array;
	this._mapEvent = {};
	this._ready = true;
	this._defaultInterval = this.frequency;
	this._realFrequency = this.frequency;
	//checks number of execution of motion event, used to understand if api supported
	this._nex = 0;
	//checks number of execution after a tilt was performed
	this._current = 0;
	//checks if a tilt event was performed
	this._hasbeentilt = false;
	this._tiltingtouch = new Array;
	//double step default options
	this._acceptedParameters = ['tiltLeft','tiltRight','tiltUp','tiltDown','tiltClockwise','tiltConterclockwise'];
	

	
	//check current os of the device
	this._currentbr = "";
	this._currentos = "";

	//default options for all tilting interactions
	function defoptions() {
		return {
		callback : undefined,
		audiofeedback : "none",
		vibrationfeedback : "none",
		visualfeedback : "none",
		touch : "none",//touch can be: "hold" or a number indicating the number of taps
		element : null,
		touchcallback : undefined,
		th_android :  75,
		th_windowsphone : 75,
		th_ios : 180,
		th : 75
		};
	};
	

	
	

	 // Create options by extending defaults with the passed arguments *https://scotch.io/tutorials/building-your-own-javascript-modal-plugin
	 if (arguments[0] && typeof arguments[0] === "object") {
		extendDefaults(this, arguments[0],this._acceptedParameters);
    }
	
	
	
	// Utility method to extend defaults with user options
	function extendDefaults(source, properties,ac) {
		
		var property;
		for (property in properties) {
		if(ac.includes(property)){
			extendDefaults(source[property],properties[property],ac);
		}
		else if (properties.hasOwnProperty(property)) {
			source[property] = properties[property];			
		  }
		}
		return source;
	}
	
	//execute init function
	init.call(this);
	//checkBrowser.call(this);
  }
  
    //private function called every time tiltandtap is instantiated
   function init()
   { 
		
		//save tiltandtap object
		var tat = this;
		//tilts that dev wants to be performed
		tat._ttoperform = tiltToPerform(tat);
		//set the map that associates tilting and alpha,beta,gamma and signs
		tat._mapEvent   = mapTilting(tat);
		//check the browser 
		tat._currentbr  = checkBrowser();
		//check current os
		tat._currentos = checkOperatingSystem();
		
		//set right th for all tilting
		setThresholds(tat);
		//touch events, if dev indicated so
		tat._tiltingtouch = associateTouchEvents(tat);
		
		 
		
		//device motion event
		if ((window.DeviceMotionEvent)  || ('listenForDeviceMovement' in window)) 
		{
			//if current browser is Firefox print a warning indicating that tat is not supported and execute function defined by dev.
			if(tat._currentbr === FIR)
			{
				console.warn(error_message_fir);
				
				if(typeof tat.notSupported ===  "function") {
					tat.notSupported.call(this);
				}
				
				return;
			}
			//if not firefox:
			window.addEventListener(
			'devicemotion', 
			function(eventData) {
			deviceMotionHandler(eventData,tat); 
			},true);
			
		}

		return this;
		
   }

  //private function - device motion event handler (private function)
  //param: eventdata and tiltandtap object
  //=== implemented via promises ===
  function deviceMotionHandler (eventData, tat)
  {	
	if(tat._ready)
	{
		
		bufferWindow(eventData,tat);
	//	tat._ready = false;
		

		
		//if first time that has been executed calculate real frequency
		if(tat._nex===0)
		{
			if(tat._currentos === "ios")
			{
				tat._defaultInterval = eventData.interval * 100;
			}
			else
			{
				tat._defaultInterval = eventData.interval;
			}
			
			tat._realFrequency   = calculateRealFrequency(tat.frequency,tat._defaultInterval);
			
			tat._nex++;
		}
		//if device does not support event return 0, print a warning and execute function defined by dev.
		if(tat._realFrequency===0)
		{
			console.warn(error_message_int);
			if(typeof tat.notSupported ===  "function") {
				tat.notSupported.call(this);
			}
			
			return 0;
		}
		
		setTimeout(function () {
		tat._ready= true;
		},tat._realFrequency);
		
	}
	
	
  }
  
  /*
  every tat._realFrequency inserts data into tat.buffer
  if buffer is big as tat.dimbuffer check if there was a tilting interaction
  if yes, start to discard tat.dimbufferdiscard data
  if no, creates a new window of the sensor data with tat.overlap
  */
  function bufferWindow(eventData,tat)
  {
	
	if(tat.buffer.length === tat.dimbuffer)
	{
		var obj = checkTilt(tat);
		if(!obj.tilt)
		{
			tat.buffer  = copyWindowWithOverlap(tat.buffer, tat.overlap);
			tat._hasbeentilt = false;
		}
		else
		{
			
			//if tilting interaction wanted by dev 
			if(tat._ttoperform.includes(obj.type)){
				//execute callback function defined by dev. and check if it is a function
				if(typeof tat[obj.type].callback ===  "function") {
					tat[obj.type].callback.call(this);
				}
				else {
					console.warn("you need to define a function as a callback for the "+obj.type+" event");
				}
			}
			tat._hasbeentilt = true;
			tat.buffer = new Array();
			
			tat._current++;
			return;
		}
		
	}
	
	if((tat._hasbeentilt)&& (tat._current>=tat.dimbufferdiscard))
	{
		tat.buffer.push(eventData);
		tat._hasbeentilt = false;
		tat._current =0;
		return;
	}
	if((tat._hasbeentilt) && (tat._current<tat.dimbufferdiscard))
	{
		tat._current++;
	
		return;
	}
	if(!tat._hasbeentilt)
	{
		tat.buffer.push(eventData);
	}
		
  }

  /*
	checks if users performed one of the tilting interactions defined by the dev.
	return an object with a tilt parameter: true if tilting performed false otw. and the type of tilting gesture performed
	TODO: iOS support
  */
  function checkTilt(tat)
  {
	var to_return = {
		tilt : false,
		type : 'none'
	}

	var energy_rr =energy(tat.buffer,tat._currentos);
	
	
	for(var i = 0; i<tat._acceptedParameters.length; i++)
	{
		var tilt = tat._acceptedParameters[i];
		
		var infotilt = tat._mapEvent[tilt];
		var abg = infotilt["rotationRate"];
		var sign = infotilt["sign"];
		//if orientation of the device is landscape use L value of the map
		var orientation = checkCurrentOrientationDevice();
		
		abg=infotilt["rotationRate"+orientation];
		sign = infotilt["sign"+orientation];
		
		var acc_last_value = tat.buffer[tat.dimbuffer-1].rotationRate[abg];
		
	
		if(Math.abs(energy_rr[abg])>=tat[tilt].th)
		{
			
			if(acc_last_value * sign >0)
			{
				
				//checks if some touch interactions where required
				if(isTouchRequired(tilt,tat._tiltingtouch))
				{
					
					
					to_return.tilt = true;
					to_return.type = tilt;
				}
			
			}
		}
	}
	return to_return;
  }
  
/*
checks if for tilt a touch interaction is required
if no, returns always true
if yes, return its state 
*/
function isTouchRequired (tilt,arr) {
	
	for(var i = 0; i<arr.length; i++)
	{
		if(arr[i].tilt === tilt)
		{
			return arr[i].enable;
		}
		
	}
	return true;
}  
//=========================================== TOUCH RECOGNITION ======================================//
//variables for touch interactions
var timer=0;

//bind the touchstart and touchend events to the elements defined by the dev.
//returns an array with all tilting interactions that require a touch event
function associateTouchEvents(tat)
{

	var arr = new Array();

	for(option in tat)
	{
		//if tilt int. containts touch option that is a number (indicating the number of taps) or equal to hold
		if((tat[option]) && (tat[option].touch==="hold" || Number.isInteger(tat[option].touch) ))
		{
			
			var element_touch = tat[option].element;
			var el = document.querySelectorAll(element_touch);
			
			if((element_touch) && (el) && (el.length!==0))
			{	
				
				for(var i = 0; i <el.length; i++)
				{
					var current = el[i];
					//if element current does not have already listener attach handlers
					if(!hasAlreadyListners(arr,element_touch))
					{
						addEvents(current,tat);
					}
					var obj = {};
					if(tat[option].touch === "hold")
					{
						obj = {
						tilt: option,
						listner_added: true,
						touch: tat[option].touch,
						el: current,
						enable: false,
						} 
					}
					else
					{
						obj = {
						tilt: option,
						listner_added: true,
						touch: tat[option].touch,
						el: current,
						n_taps: 0,
						enable: false,
						last_tap: 0
						}
					}
					 
					
					arr.push(obj);
					
				}	
			}//if element was not defined correctly print a warning
			else
			{
				console.warn(error_touch_element+option);
			}
			
		}
		else
		{	//print a warning if users specified a touch interaction but not correctly
			if((tat._acceptedParameters.includes(option)) && (tat[option].touch!="none"))
			{
				console.warn(option+error_touch);
			}
		
		}
	}
	return arr;

}

//add touchstart and touchend events to element
function addEvents (element,tat)
{
	element.addEventListener('touchstart', 
		function(event) {
			touchstart(event,tat);
	}, true);	
		
	element.addEventListener('touchend',
		function(event) {
				touchend(event,tat);
	},true);
				
			
}

//handler for touch start event
function touchstart(event,tat) 
{
	var arr_touch_target = new Array();
	var touch = tat._tiltingtouch;
	for(var i = 0; i<touch.length; i++)
	{
		var current = touch[i];
		
		if(event.target === current.el)
		{
			arr_touch_target.push(current);
		}
	}
	
	//check if tap hold for all tilting+touch interactions "binded" to element
	if(arr_touch_target.length!= 0)
	{
		timer = setTimeout(function () {
			for(i = 0; i<arr_touch_target.length; i++)
			{
				arr_touch_target[i].enable = true;
			}
		},tat.taphold_interval);
	
	}
	
	event.stopPropagation();
}


//handler for touch end event
function touchend(event, tat) {
	
	
	var touch = tat._tiltingtouch;
	for(var i = 0; i<touch.length; i++)
	{
		var current = touch[i];
		
		if(event.target === current.el)
		{
			if(current.touch!=="hold")
			{
				multiple_taps_recognition(current,tat.tap_interval);
			}
			else
			{
				end_tap_hold_recognition(current,tat.taphold_interval);
			}
			
		}
	}
	event.stopPropagation();
}


//tap hold logic
function end_tap_hold_recognition(current,interval)
{
	clearTimeout(timer);
	current.enable = false;	
}
//multiple taps logic
//todo: deactivation?
function multiple_taps_recognition(current,interval)
{
	var now_touch = Date.now();
	

	if((now_touch - current.last_tap < interval) || (current.last_tap ===0))
	{
		current.n_taps++;
		current.last_tap = now_touch;
		
		if(current.n_taps == current.touch)
		{
			
			current.enable = true;
			current.n_taps = 0;
			current.last_tap = 0;
		}
	}
	else
	{
		current.enable = false;
		current.n_taps = 0;
		current.last_tap = 0;
	}
}

//check if that element has already listners attached
function hasAlreadyListners(arr,el)
{
	for(var i=0; i<arr.length; i++)
	{
		if(arr[i].el === el && arr[i].listner_added)
		{
			return true;
		}
	}
	return false;
}
  
//=========================================== UTILITY ==============================================//
 
 /*
 given the frequency specified by the user and the interval given by the browser
 calculates real frequency to obtain motion data
 TODO: iOS support
 */
function calculateRealFrequency(frequency, interval){

	var div = 0;
	
	//if interval =0 the device do not support the API, return 0
	if(interval===0)
	{
		return div;
	}
	//TODO: iOS support
	//
	
	if(interval<frequency)
	{
		div = Math.floor(frequency/interval);
		div = div*(interval);
		
	}
	else
	{
		div = interval;
	}
	
	if(div!==frequency)
	{
		console.warn('Given the interval given by the browser: '+interval+', the frequency: '+frequency+' that you specified was not possible to use. Current frequency used: '+div);
	}
	return div;

}

//creates a new array and copy the last overalap elements of the source array
function copyWindowWithOverlap (source,overlap)
{
	var newBuffer = new Array();
	
	for (var i = source.length-overlap; i < source.length ; i++)
	{
		newBuffer.push(source[i]);
	}
	return newBuffer;
}

//calculate energy of an array of eventData elements
//if current_os is firefox, return directly the rotationRate data (since they are different from the other browsers)
function energy(arr,currentos)
{
	
	var energy = {
	alpha : 0,
	beta : 0,
	gamma: 0,
	a:0,
	b:0,
	c:0,
	arr: new Array ()
	};
	
	
	
	for (var i =0; i<arr.length; i++)
	{
		if(currentos === "ios")
		{
			energy.alpha+= (arr[i].rotationRate.alpha)/arr.length;
			energy.beta += (arr[i].rotationRate.beta)/arr.length;
			energy.gamma+= (arr[i].rotationRate.gamma)/arr.length;
			
			energy.a = arr[i].rotationRate.alpha;
			energy.b = arr[i].rotationRate.beta;
			energy.c = arr[i].rotationRate.gamma;
			
			energy.arr = arr;
			
		}
		else
		{
			energy.alpha+= (arr[i].rotationRate.alpha)*(arr[i].rotationRate.alpha);
			energy.beta += (arr[i].rotationRate.beta) *(arr[i].rotationRate.beta);
			energy.gamma+= (arr[i].rotationRate.gamma)*(arr[i].rotationRate.gamma);
			energy.arr = arr;
		}

		//DEBUG FOR iOS

	}
	
	
	return energy;
	
}


//map that associates tilting interaction and their corresponding rotationRate and accelerationIncludingGravity variables
//NOTE I could have  a switch case in the motion event HOWEVER this will cost o(s) every x millisecond
//this solution does not look that nice but it is more performant
//TODO: iOS support
//TODO: check orientation on portrait upside down (my phone does not support it)
function mapTilting()
{
	var map  = {
	"tiltLeft" : 
		{
		"rotationRate" : "beta",
		"rotationRateP" : "beta",
		"rotationRateL" : "alpha",
		"rotationRateLL" : "alpha",
		"sign"  : -1,
		"signP" : 1,
		"signL" : 1,
		"signLL" : -1
		},
	"tiltRight" : 
		{
		"rotationRate" : "beta",
		"rotationRateP" : "beta",
		"rotationRateL" : "alpha",
		"rotationRateLL" : "alpha",
		"sign"  : 1,
		"signP" : -1,
		"signL" : -1,
		"signLL" : 1
		},
	"tiltUp" : 
		{
		"rotationRate" : "alpha",
		"rotationRateP" : "beta",
		"rotationRateL" : "beta",
		"rotationRateLL" : "beta",
		"sign"  : 1,
		"signP" : -1,
		"signL" : 1,
		"signLL" : -1
		},	
	"tiltDown" : 
		{
		"rotationRate" : "alpha",
		"rotationRateP" : "beta",
		"rotationRateL" : "beta",
		"rotationRateLL" : "beta",
		"sign"  : -1,
		"signP" : 1,
		"signL" : -1,
		"signLL" : 1
		},	
	"tiltClockwise" : 
		{
		"rotationRate" : "gamma",
		"rotationRateP" : "gamma",
		"rotationRateL" : "gamma",
		"rotationRateLL" : "gamma",
		"sign" : -1,
		"signP" : 1,
		"signL" : -1,
		"signLL" : -1
		},	
		
	"tiltConterclockwise" : 
		{
		"rotationRate" : "gamma",
		"rotationRateP" : "gamma",
		"rotationRateL" : "gamma",
		"rotationRateLL" : "gamma",
		"sign" : 1,
		"signP" : -1,
		"signL" : 1,
		"signLL" : 1
		}
		
	}
	
	return map;

}

//set current threshold (depending on os) for each tilting interaction
function setThresholds (tat)
{
	var currentos = tat._currentos;
	for(option in tat)
	{
		if(tat[option].th !== undefined)
		{
			tat[option].th = tat[option]["th_"+currentos];
			
		}
		
	}
	

}


//create arrays with tilting interaction that dev wants to execute
function tiltToPerform(tat)
{
	var arr = new Array();
	
	for(option in tat)
	{
		
		if(tat[option].callback !== undefined)
		{
			arr.push(option);
		}
	}
	return arr;
}

//check the current orientation of the device
//returns empty string if portrait, P if Portrait but upside down
//L if landscape, LL landscape counterclockwise
function checkCurrentOrientationDevice()
{
	switch (window.orientation) {  
    case 0:  
    
		//debug iOS
		
		return "";
        // Portrait 
        break; 
        
    case 180:  
		
		
		return "P";
        // Portrait (Upside-down)
        break; 
  
    case -90:  
		
		
		return "L"
        // Landscape (Clockwise)
        break;  
  
    case 90:  
    
		
		return "LL"
        // Landscape  (Counterclockwise)
        break;
    }
}


//checks the browser of the device
//http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
function checkBrowser() {
    
	var browser="";
	// Opera 8.0+
	if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
	{
		return OPE;
	}
	
	// Firefox 1.0+
	if(typeof InstallTrigger !== 'undefined')
	{
		return FIR
	}

    // Safari 3.0+ "[object HTMLElementConstructor]" 
	if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification))
	{
		return SAF;
	}
	//Chrome
	if(!!window.chrome && !!window.chrome.webstore)
	{
		return CHR;
	}
	
	return OTH;

}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 * http://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system
 * @returns {String}
 */

function checkOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "windowsphone";
    }

    if (/android/i.test(userAgent)) {
        return "android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "ios";
    }

    return "unknown";
}


 

}());
