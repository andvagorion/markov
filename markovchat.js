
var MarkovChat = (function() {

	var initialized = false;

	var graph = {
		authors: {}
	};

	function init() {
		
		let _len = input.length;
		for (let i = 0; i < _len; i++) {
			let _line = input[i];
			
			let _author = getAuthor(_line);
			increment(graph["authors"], _author);
			
			createIfNotExists(graph, _author);
			createIfNotExists(graph[_author], "start");
			createIfNotExists(graph[_author], "words");
			
			let _message = getMessage(_line);

			// first word
			let _first = _message[0];
			increment(graph[_author]["start"], _first);
			
			let max = _message.length;
			for (let j = 0; j < max; j++) {
				let _word = _message[j]
				createIfNotExists(graph[_author]["words"], _word);
			
				if (j == max - 1) {
					//console.log("END at " + _chars + " of " + _word);
					increment(graph[_author]["words"][_word], "END");
				} else {
					let _next = _message[j + 1];
					increment(graph[_author]["words"][_word], _next);
				}

			}
			
		}
		document.body.innerHTML = JSON.stringify(graph);
	}

	function getAuthor(line) {
		return line.substr(0, line.indexOf(":"));
	}

	function getMessage(line) {
		return line.substr(line.indexOf(":") + 1).trim().split(" ");
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

	function create() {
		if (!initialized) {
			init();
			initialized = true;
		}

		let _author = "" + randomFrom(graph["authors"]);
		
		let _message = [];
		let _word = "" + randomFrom(graph[_author]["start"]);

		while (_word != "END" && _message.length < 50) {
			_message.push(_word);
			_word = randomFrom(graph[_author]["words"][_word]);
		}
		
		return _author + ": " + _message.join(" ");
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


MarkovChat.init();