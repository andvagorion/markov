
var MarkovChars = (function() {

	var initalizedForDepth = 0;
	var initalized = false;
	var start = {};
	var graph = {};

	function init(depth) {

		let _len = len = input.length;
		for (let i = 0; i < _len; i++) {
			let _word = input[i];

			// first letter
			let _first = _word.charAt(0);
			increment(start, _first);

			let max = _word.length;
			for (let j = 1; j <= max; j++) {
				let _chars = _word.slice(Math.max(0, j - depth), j);
				createIfNotExists(graph, _chars);

				if (j + 1 > max) {
					increment(graph[_chars], "END");
				} else {
					let _next = _word.slice(j, j + 1);
					increment(graph[_chars], _next);
				}
			}
		}
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

	function create(depth, maxLength) {
		if (depth > initalizedForDepth) {
			initalized = false;
		}

		if (!initalized) {
			init(depth);
			initalized = true;
			initalizedForDepth = depth;
		}

		let _word = "" + randomFrom(start);

		let _next = "";

		while (_next != "END" && _word.length < maxLength) {
			_word += _next;
			let _curr = _word.slice(-depth);
			_next = randomFrom(graph[_curr]);
			if (_next == "(" && _word.indexOf("(") >= 0) {
				_next = ")";
			}
			if (_next == ")" && _word.indexOf("(") < 0) {
				_next = "END";
			}
		}

		if (_word.indexOf("(") >= 0 && _word.indexOf(")") < 0){
			_word += ")";
		}

		if (input.indexOf(_word) >= 0) {
			return create(depth, maxLength);
		}

		return _word;
	}

	function randomFrom(obj) {
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

		return "END";
	}

	//The maximum is inclusive and the minimum is inclusive
	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	return {
		init: init,
		create: create
	}

})();
