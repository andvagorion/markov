MarkovImage = (function() {

	var depth = 5;
	
	var graph = {};

	function process(img) {
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;

		document.body.appendChild(canvas);

		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		let imgData = ctx.getImageData(0, 0, img.width, img.height);

		// add8BitCanvas(_imgData);
		analyse(imgData, img.width, img.height);
	}

	function analyse(imgData, width, height) {
		let buffer = new Uint32Array(imgData.data.buffer);
		// buffer = convertTo8Bit(imgData);

		createIfNotExists(graph, "y");
		createIfNotExists(graph, "x");

		for (let y = 0; y < height; y++) {

			let yPx = buffer[y * width];
			createIfNotExists(graph["y"], yPx);
		
			if (y < height - 1) {
				let next = buffer[(y + 1) * width];
				increment(graph["y"][yPx], next);
			}
			/*
			if (y > 0) {
				let next = buffer[(y - 1) * width];
				increment(graph["y"][yPx], next);	
			}
			*/

			let row = buffer.slice(y * width, (y + 1) * width);
			
			/*
			console.log(debugRGB(row));
			*/

			for (let x = 0; x < width; x++) {

				let start = Math.max(0, x + 1 - depth);
				let end = x + 1;

				let pixels = row.slice(start, end);

				/*
				if (end - start == 3) {
					console.log(x + ": from " + start + " to " + end);
					console.log(debugRGB(pixels));
				}
				*/
				
				createIfNotExists(graph["x"], pixels);
			
				if (x < width - 1) {
					let next = row[x + 1];
					increment(graph["x"][pixels], next);
				}

			}
		}
	}

	function create(width, height, newTab) {

		//console.log(graph);

		let currentDepth = depth;
		
		let canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		document.body.appendChild(canvas);
		
		let size = width * height;
		let buffer = new Uint32Array(size);

		let curr = randomFrom(graph["y"]);

		for (let y = 0; y < height; y++) {

			let rnd = Math.random();
			let nextY = rnd < 0.05 ? randomFrom(graph["y"]) : randomFromWeighted(graph["y"][curr]);

			if (nextY < 0) {
				nextY = randomFrom(graph["y"]);
			}
			buffer[y * width] = nextY;
			curr = nextY;

			for (let x = 1; x < width; x++) {

				if (currentDepth < depth) {
					currentDepth++;
				}

				let rowStart = y * width;
				let idx = y * width + x;
				let prevIdx = x - currentDepth > 0 ? idx - currentDepth : rowStart;

				let pixels = buffer.slice(prevIdx, idx);
				
				let next = randomFromWeighted(graph["x"][pixels]);

				if (next < 0) {
					/*
					console.log("can't find next for " + debugRGB(pixels));
					let b = buffer.slice();
					console.log(b);
					console.log(prevIdx + ", " + idx);
					*/
					next = randomFrom(graph["y"]);
					currentDepth = 0;
				}

				buffer[y * width + x] = next;
				curr = next;
			}

			curr = buffer[y * width];
		}
		
		// buffer = convertToRGBA(buffer);
		
		let ctx = canvas.getContext("2d");
		var iData = new ImageData(new Uint8ClampedArray(buffer.buffer), width, height);
		ctx.putImageData(iData, 0, 0);

		if (newTab) {
			var d=canvas.toDataURL("image/png");
			var w=window.open("about:blank","image from canvas");
			w.document.write("<img src='" + d + "' alt='from canvas'/>");
		}
	}

	function randomFrom(obj) {
		var keys = Object.keys(obj);
		return keys[getRandomIntInclusive(0, keys.length - 1)];
	}

	function randomFromWeighted(obj) {
		let _max = 0;
		for (let e in obj) {
			_max += obj[e];
		}
		let _rnd = getRandomIntInclusive(0, _max);
		for (let e in obj) {
			_rnd -= obj[e];
			if (_rnd <= 0) {
				return e;
			}
		}

		return -1;
	}

	//The maximum is inclusive and the minimum is inclusive
	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function createIfNotExists(obj, key) {
		if (!obj.hasOwnProperty(key)) {
			obj[key] = {};
		}
	}

	function increment(obj, key) {
		if (obj.hasOwnProperty(key)) {
			obj[key]++;
		} else {
			obj[key] = 1;
		}
	}

	function add8BitCanvas() {
		let bbb = convertTo8Bit(_imgData);

		var canvas2 = document.createElement("canvas");
		canvas2.width = img.width;
		canvas2.height = img.height;

		document.body.appendChild(canvas2);

		paint8BitImage(canvas2, img.width, img.height, bbb);
	}

	function convertTo8Bit(imgData) {
		let _buffer32 = new Uint32Array(imgData.data.buffer);
		
		let bit8 = [];

		for (let pixelValue of _buffer32) {
			let blue = pixelValue >> 16 & 0xFF,
				green = pixelValue >> 8 & 0xFF,
				red = pixelValue & 0xFF;

			let rgb8 = ((red >> 5) << 6) + ((green >> 5) << 3) + (blue >> 5);
			bit8.push(rgb8);
		}

		return bit8;
	}

	function debugRGB(pixels) {
		let str = "";
		for (colVal of pixels) {
			str += toRGBString(colVal) + " ";
		}
		return str;
	}

	function toRGBString(pixelValue) {
		let blue = pixelValue >> 16 & 0xFF,
			green = pixelValue >> 8 & 0xFF,
			red = pixelValue & 0xFF;
		return "(" + red + ", " + green + ", " + blue + ")";
	}

	function convertToRGBA(arr) {
		var buf = new Uint32Array(arr.length);
		for(let i=0; i < arr.length; i++){
			let bitVal = arr[i];
			buf[i] =
				(255 << 24)
				+ ((bitVal << 5 & 0xFF) << 16)
				+ ((bitVal << 5 >> 3 & 0xFF) << 8)
				+ (bitVal << 5 >> 6 & 0xFF);
		}
		return buf;
	}

	function paint8BitImage(canvas, width, height, pxData) {
		let ctx = canvas.getContext("2d");
		let buf = convertToRGBA(pxData);

		var iData = new ImageData(new Uint8ClampedArray(buf.buffer), width, height);
		ctx.putImageData(iData, 0, 0);
	}

	function dec2bin(dec){
		return (dec >>> 0).toString(2);
	}

	return {
		process: process,
		create: create
	}

})();

(function() {

	let img = new Image();
	img.onload = function() {
		MarkovImage.process(this);
		MarkovImage.create(img.width, img.height, false);
	}
	img.src = "icke.jpeg";

})();