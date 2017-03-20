define('mask', ['doc'], function($) {

	var charToRegex = function(patternLetter) {
		switch(patternLetter) {
			case "9":
				return new RegExp("[0-9]");
			case "":
				return "end";
			default:
				return "literal";
		}
	}

	function format(value, pattern) {
		value = value.replace(/\D/g, '').replace(/^0+/, '');

		var i = value.length - 1,
			j = pattern.length - 1,
			formatted = '';

		while (j >= 0) {
			if (pattern[j] === ',') {
				formatted = ',' + formatted;
				j--;
			}
			if (i >= 0) {
				formatted = value[i] + formatted;
			} else if (pattern[j] === '0'){
				formatted = '0' + formatted;
			}
			i--; j--;
		}

		return formatted;
	};

	var applyNumberMask = function(el) {
		var pattern = el.getAttribute('mask-number'),
			$el = $(el),
			oldVal = $el.val();

		$el.on('input', function(event) {
			var inputContent = $el.val();
			if (oldVal.indexOf(inputContent) === -1 || oldVal == inputContent) {
				$el.val(format(inputContent, pattern));
			}
			oldVal = $el.val();
		});

		$el.on('blur', function(event) {
			var newVal = format($el.val(), pattern);
			$el.val(newVal);
			oldVal = newVal;
		});
	};

	var applyMask = function(el) {
		var pattern = el.getAttribute("mask"),
			patternRegex = "";
		var _currentValue = el.value;

		var addletter = function(input, key, e) {
			var	patternLetter = pattern.charAt(input.value.length - 1),
				regexResult = regex.charToRegex(patternLetter);

			if(regexResult === "literal") {
				el.value = el.value.slice(0, el.value.length - 1);
				input.value = input.value + patternLetter + key;
				addletter(input, key, e);
				return;
			}

			if(regexResult === "end") {
				e.preventDefault();
				return;
			}

			if(!key.match(regexResult)) {
				el.value = el.value.slice(0, el.value.length - 1);
				return;
			}
		};

		var eventKey = 'input';

		$(el).on(eventKey, function(e) {
			if(_currentValue.length == el.value.length) {
				 e.stopPropagation();
				 _currentValue = el.value;
				 return;
			} else if (pattern.length < el.value.length) {
				e.stopPropagation();
				el.value = el.value.slice(0, el.value.length - 1);
				return;
			}

			var letter = el.value.slice(-1);
			addletter(el, letter, e);
			setTimeout(function() {
				if(el.createTextRange) {
					var textRange = el.createTextRange();
					textRange.collapse(true);
					textRange.moveStart('character', el.value.length + 1);
					textRange.moveEnd('character', 0);
					textRange.select();
				} else if (el.setSelectionRange) {
					el.setSelectionRange(el.value.length + 1, el.value.length + 1);
					el.value = el.value;
				}
				_currentValue = el.value;
			}, 0);
			_currentValue = el.value;
		});

		(function format(value) {
			if(!value) {
				return;
			}
			var formattedValue = "", maskIndex = 0;
			var formatPattern = el.getAttribute("mask-pattern"),
			value = value.replace(formatPattern, '');
			for(var valueIndex = 0; valueIndex < value.length; valueIndex++) {
				var	patternLetter = pattern.charAt(maskIndex++),
					regexResult = regex.charToRegex(patternLetter);
				if(regexResult === "literal") {
					formattedValue += patternLetter;
					maskIndex++;
				} else if (regexResult === "end") {
					break;
				}
				if(regexResult === "literal" && patternLetter === value.charAt(valueIndex)) {
					maskIndex--;
					continue;
				}
				formattedValue += value.charAt(valueIndex);
			}
			$(el).val(formattedValue);
		})($(el).val());
	}

	$('[mask]').each(applyMask);
	$('[mask-number]').each(applyNumberMask);

	return {
		'applyMask' : applyMask,
		'applyNumberMask' : applyNumberMask
	}
});
