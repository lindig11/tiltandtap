# Tilt-and-Tap
Tilt-and-Tap is a JavaScript framework that recognize jerk tilting interactions:
Tilt Up, Tilt Down, Tilt Left, Tilt Right, Tilt Clockwise and Tilt Counter-clockwise.
Tilting interactions can also be combined to touch gestures (tap, multiple taps and tap hold) on specific DOM elements

# What are tilting interactions?
A tilt interaction, and more in detail a Jerk-Tilting interaction, is a rapid movement of the mobile device toward some direction (up, down, left, rigth etc.). Tilt-and-Tap tries to simplify the development of such interaction on the web, offering high-level APIs.

# Support
Currently, Tilt-and-Tap works almost everywhere and almost on all the browsers (Firefox is not supported yet). The plugin uses the *devicemotion* event and it internally bridge the differences among devices and browsers.

#Installation
Include the script somewhere in your webpage. Within the header is recommended.
```javascript
<script src="/path/to/tiltandtap.js"></script>
```

#Example Usage
All the following demos are available in the demo repository

## Just tilt

Change color of a div by rapidly tilting the device to some direction:
###html
```html
<div id="box">
<p id="result"> </p>
</div>
```
###javascript
```javascript
var mytat = new tiltandtap({
	tiltLeft :  {callback:left},
	tiltRight : {callback:right},
	tiltUp :    {callback:up},
	tiltDown:   {callback:down},
	tiltClockwise: {callback:clockwise},
	tiltConterclockwise : {callback: cc}
});

var box = document.querySelector("#box");
var p_result = document.querySelector("#result");

function left()
{
	p_result.innerHTML = "left";
	box.style.backgroundColor = "red";
	console.log("tilt left");
}
[...]

```


## Multiple taps and tilt

Tap three times on the div to activate tilting interaction. Rapidly tilt the device up or down to change the color.

###html
```html
<div id="box">
<p id="result"> </p>
</div>
```
###javascript
```javascript
var mytat = new tiltandtap({
	tiltUp : {callback:up, touch:3, element:"#box"},
	tiltDown: {callback:down, touch:3, element:"#box"}
});

var box = document.querySelector("#box");
var p_result = document.querySelector("#result");

function up ()
{
	p_result.innerHTML = "up";
	box.style.backgroundColor = "green";
	console.log("multiple taps + tilt up");
}

[...]
```

## Hold tap and tilt

Hold-tap the box while rapidly tilting your device up or down to change the color of the box.

###html
```html
<div id="box">
<p id="result"> </p>
</div>
```
###javascript
```javascript
var mytat = new tiltandtap({
	tiltUp : {callback:up, touch:"hold", element:"#box"},
	tiltDown: {callback:down, touch:"hold", element:"#box"}
});

var box = document.querySelector("#box");

function up ()
{

	box.style.backgroundColor = "green";
	console.log("hold tap + tilt up");
}

function down() 
{

	box.style.backgroundColor = "orange";
	console.log("hold tap + down");
}

```

#Options


#The project

Tilt-and-Tap was developed at ETH Zurich [(globis group)] (https://globis.ethz.ch/) as part of a PhD thesis. Find more [here] (https://globis.ethz.ch/#!/person/linda-di-geronimo/).
