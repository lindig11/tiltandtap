# Tilt-and-Tap
Tilt-and-Tap is a JavaScript framework that recognize jerk tilting interactions:
Tilt Up, Tilt Down, Tilt Left, Tilt Right, Tilt Clockwise and Tilt Counter-clockwise.
Tilting interactions can also be combined to touch gestures (tap, multiple taps and tap hold) on specific elements.
**Feel free to contribute to the project!**

# What are tilting interactions?
A tilt interaction, and more in detail a Jerk-Tilting interaction, is a rapid movement of the mobile device toward some direction (up, down, left, rigth, south-east, south-west, north-east, north-west, clock and counterclockwise). Tilt-and-Tap tries to simplify the development of such interaction on the web, offering high-level APIs.

# Support
Currently, Tilt-and-Tap works almost everywhere and almost on all the browsers. The plugin uses the *devicemotion* event and it internally bridge the differences among devices and browsers.
Chrome introduced a bug in version 66. For this reason, TAT does not work on Chrome currently.

#Installation
Include the script somewhere in your webpage. Within the header is recommended.
```javascript
<script src="/path/to/tiltandtap.js"></script>
```
No other plugins (jQuery included) are required.

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
## Feedback

Tilt-and-Tap offers three types of feedback (triggered once the gesture has been performed) visual, audio and vibration.
In the example below we show how to trigger these feedback.
All gesture have a visual feedback associated (a blue line will show on the display). When a tilt up gesture is performed, the phone will vibrate for 200ms. With a tilt down the phone will play an audio file "click.mp3". Please note that some of these features are not supported by all browsers and for some, it is required that the user touch the screen before the phone plays a sound or vibrates.

###html
```html
<div id="box">
<p id="result"> </p>
</div>
```
###javascript
```javascript
var mytat = new tiltandtap({
	tiltLeft :  {callback:left, visualfeedback:"blue"},
	tiltRight : {callback:right, visualfeedback:"blue"},
	tiltUp :    {callback:up, vibrationfeedback:200, visualfeedback:"blue"},
	tiltDown:   {callback:down, audiofeedback:"click.mp3", visualfeedback:"blue"},
	tiltClockwise: {callback:clockwise, visualfeedback:"blue"},
	tiltConterclockwise : {callback: cc,visualfeedback:"blue"},
	tiltSouthEast : {callback: se,visualfeedback:"blue"},
	tiltSouthWest : {callback: sw,visualfeedback:"blue"},
	tiltNorthEast : {callback: ne,visualfeedback:"blue"},
	tiltNorthWest : {callback: nw,visualfeedback:"blue"}
});


```

#Options

##tilting options
For each tilting interaction we support a number of sub-options that can be defined for each gesture.

|__Option Name__   | __Description__   | __Default Value__|__Possible Values__|
| ------------- |:-------------| :-----:| :-----|
| __callback__   | callback function to be called once the tilt gesture was recognized  | null| an existing function |
| __th_android__      | Threshold of gesture for Android devices |   75 | any number  |
| __th_firefox__      | Threshold of gesture for Firefox Browsers |   75 | any number  |
| __th_ios__      | Threshold of gesture for iOS |   180 | any number  |
| __touch__ | Tilting gesture can be combined with an additional touch interaction. This option indicates which interaction has to be performed.   |    "none" | "hold" or any positive integer number|
| __element__ | It indicates where the touch interaction (if indicated) has to be performed.   |    null | a valid ID of an existing element in the DOM|
| __visualfeedback__ | A visual feedback will appear once the gesture has been performed.  |    "none" | a string containing the color of the feedback|
| __vibrationfeedback__ | A vibration feedback will be executed once the gesture has been performed.   |    "none" | any positive number|
| __audiofeedback__ | An audio feedback will be executed once the gesture has been performed.   |    "none" | path (string) of the audio file|


##global options
Global option of the plugin.

|__Option Name__   | __Description__   | __Default Value__|__Possible Values__|
| ------------- |:-------------| :-----:| :-----|
| __frequency__   | It indicates how frequent motion data should be retrieved | 50 (milliseconds) |  any positive number |
| __dimbuffer__   | It indicades how fast the gestures should be. The smaller the number the faster [0,+inf] | 3| any positive interger number |
| __dimbufferdiscard__   | It indicates how many data the framework should discard after a gesture was recognized| 20 |  any positive interger number |
| __dimbufferdiscard_fir__   | It indicates how many data the framework should discard after a gesture was recognized for Firefox | 100 |  any positive interger number |
| __tap_interval__   | It indicates the maximum interval between taps | 200 (milliseconds) |  any positive number |
| __taphold_interval__   | It indicates the minimum interval for a tap hold interaction| 200 (milliseconds) |  any positive  number |
| __overlap__   | Tilt-and-Tap uses a window overlap method to recognize gestures. This value indicate how big the overlap should be. | 1 |  any positive interger number |
| __notSupported__   | Callback function called if the devicemotion event is not supported | "" |  an existing function |


###example javascript:
```javascript
var mytat = new tiltandtap({
	tiltUp : [...],
	dimbuffer: 3,
	dimbufferdiscard: 20,
	frequency: 50,
	overlap:1
});
```


#Thresholds and TODOs
Tilt-and-Tap uses thresholds to recognize gestures. These thresholds are platform-dependent. The current default thresholds have been empirically tested but developers can change them for each interaction and for each platform (Android, iOS and Windows Phone) using the right global option. This to give more power to developers to test and try different gestures with different thresholds. 
General and platform-indipendent labels ("slow", "medium", "fast") to indicate the velocity of the gesture are next in the TODO list.



#The project

Tilt-and-Tap was developed at ETH Zurich [(globis group)] (https://globis.ethz.ch/) as part of a PhD thesis. Find more [here] (https://globis.ethz.ch/#!/person/linda-di-geronimo/).
Tilt-and-Tap also includes continuous tilting interactions that can be found [here] (https://github.com/lindig11/WebGravity).
