/**
 * angular-br-filters
 * An Angular library of masks applicable to several Brazilian data.
 * @version v0.7.0
 * @link https://github.com/the-darc/angular-br-filters
 * @license MIT
 */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * br-masks
 * A library of masks applicable to several Brazilian data like I.E., CNPJ, CPF and others
 * @version v0.4.1
 * @link http://github.com/the-darc/br-masks
 * @license MIT
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['string-mask'], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory(require('string-mask'));
	} else {
		// Browser globals (root is window)
		root.BrM = factory(root.StringMask);
	}
}(this, function (StringMask) {
	if (!StringMask) {
		throw new Error('StringMask not found');
	}
/*exported CEP */
var CEP = function(value) {
	var cepMask = new StringMask('00000-000');
	if(!value) {
		return value;
	}
	var processed = cepMask.process(value);
	return processed.result;
};

/*exported CNPJ */
var CNPJ = function(value) {
	if(!value) {
		return value;
	}
	var cnpjPattern = new StringMask('00.000.000\/0000-00');
	var formatedValue = cnpjPattern.apply(value);
	return formatedValue;
};

/*exported CPFCNPJ */
/*globals CPF, CNPJ*/
var CPFCNPJ = function(value) {
	if (!value || !value.length) {
		return value;
	} else if (value.length <= 11) {
		return CPF(value);
	} else {
		return CNPJ(value);
	}
};

/*exported CPF */
var CPF = function(value) {
	var cpfPattern = new StringMask('000.000.000-00');
	if(!value) {
		return value;
	}
	var formatedValue = cpfPattern.apply(value);
	return formatedValue;
};

/*exported FINANCE */
var FINANCE = function(value, precision, decimalSep, groupSep) {
	precision = (!precision && precision !== 0) || precision < 0? 2 : precision;
	decimalSep = decimalSep || '.';
	groupSep = groupSep || '';

	var decimalsPattern = precision > 0 ? decimalSep + new Array(precision + 1).join('0') : '';
	var maskPattern = '#'+groupSep+'##0'+decimalsPattern;

	value = parseFloat(value);
	if (!value) {
		value = 0;
	}

	var negative = false;
	if (value < 0) {
		value = value * -1;
		negative = true;
	}
	var financeMask = new StringMask(maskPattern, {reverse: true});
	var masked = financeMask.apply(value.toFixed(precision).replace(/[^\d]+/g,''));
	return negative ? '('+masked+')' : masked;
};

/*exported IE */
var IE = function(value, uf) {
	if (!value || typeof value !== 'string') {
		return value;
	}

	var ieMasks = {
		'AC': [{mask: new StringMask('00.000.000/000-00')}],
		'AL': [{mask: new StringMask('000000000')}],
		'AM': [{mask: new StringMask('00.000.000-0')}],
		'AP': [{mask: new StringMask('000000000')}],
		'BA': [{chars: 8, mask: new StringMask('000000-00')},
			   {mask: new StringMask('0000000-00')}],
		'CE': [{mask: new StringMask('00000000-0')}],
		'DF': [{mask: new StringMask('00000000000-00')}],
		'ES': [{mask: new StringMask('00000000-0')}],
		'GO': [{mask: new StringMask('00.000.000-0')}],
		'MA': [{mask: new StringMask('000000000')}],
		'MG': [{mask: new StringMask('000.000.000/0000')}],
		'MS': [{mask: new StringMask('000000000')}],
		'MT': [{mask: new StringMask('0000000000-0')}],
		'PA': [{mask: new StringMask('00-000000-0')}],
		'PB': [{mask: new StringMask('00000000-0')}],
		'PE': [{chars: 9, mask: new StringMask('0000000-00')},
			   {mask: new StringMask('00.0.000.0000000-0')}],
		'PI': [{mask: new StringMask('000000000')}],
		'PR': [{mask: new StringMask('000.00000-00')}],
		'RJ': [{mask: new StringMask('00.000.00-0')}],
		'RN': [{chars: 9, mask: new StringMask('00.000.000-0')},
			   {mask: new StringMask('00.0.000.000-0')}],
		'RO': [{mask: new StringMask('0000000000000-0')}],
		'RR': [{mask: new StringMask('00000000-0')}],
		'RS': [{mask: new StringMask('000/0000000')}],
		'SC': [{mask: new StringMask('000.000.000')}],
		'SE': [{mask: new StringMask('00000000-0')}],
		'SP': [{mask: new StringMask('000.000.000.000')},
			   {mask: new StringMask('-00000000.0/000')}],
		'TO': [{mask: new StringMask('00000000000')}]
	};

	function clearValue (value) {
		return value.replace(/[^0-9]/g, '');
	}

	function getMask(uf, value) {
		if(!uf || !ieMasks[uf]) {
			return undefined;
		}
		var _uf = uf.toUpperCase();
		if (_uf === 'SP' && /^P/i.test(value)) {
			return ieMasks.SP[1].mask;
		}
		var masks = ieMasks[uf];
		var i = 0;
		while(masks[i].chars && masks[i].chars < clearValue(value).length && i < masks.length - 1) {
			i++;
		}
		return masks[i].mask;
	}

	var mask = getMask(uf, value);
	if(!mask) {
		return value;
	}
	var processed = mask.process(clearValue(value));
	if (uf && uf.toUpperCase() === 'SP' && /^p/i.test(value)) {
		return 'P'+processed.result;
	}
	return processed.result;
};

/*exported NFEACCESSKEY */
var NFEACCESSKEY = function(value) {
	if(!value) {
		return value;
	}

	var maskPattern = '0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000';
	var nfeMask = new StringMask(maskPattern);
	var formatedValue = nfeMask.apply(value);
	return formatedValue;
};

/*exported PHONE */
var PHONE = function(value) {
	var phoneMask8D = new StringMask('(00) 0000-0000'),
		phoneMask9D = new StringMask('(00) 00000-0000');

	if(!value) {
		return value;
	}

	var formatedValue;
	value = value + '';
	if(value.length < 11){
		formatedValue = phoneMask8D.apply(value);
	}else{
		formatedValue = phoneMask9D.apply(value);
	}

	return formatedValue;
};

	return {
		ie: IE,
		cpf: CPF,
		cnpj: CNPJ,
		phone: PHONE,
		cep: CEP,
		finance: FINANCE,
		nfeAccessKey: NFEACCESSKEY,
		cpfCnpj: CPFCNPJ
	};
}));
},{"string-mask":2}],2:[function(require,module,exports){
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.StringMask = factory();
	}
}(this, function () {
	var tokens = {
		'0': {pattern: /\d/, _default: '0'},
		'9': {pattern: /\d/, optional: true},
		'#': {pattern: /\d/, optional: true, recursive: true},
		'S': {pattern: /[a-zA-Z]/},
		'U': {pattern: /[a-zA-Z]/, transform: function (c) { return c.toLocaleUpperCase(); }},
		'L': {pattern: /[a-zA-Z]/, transform: function (c) { return c.toLocaleLowerCase(); }},
		'$': {escape: true}
	};

	function isEscaped(pattern, pos) {
		var count = 0;
		var i = pos - 1;
		var token = {escape: true};
		while (i >= 0 && token && token.escape) {
			token = tokens[pattern.charAt(i)];
			count += token && token.escape ? 1 : 0;
			i--;
		}
		return count > 0 && count%2 === 1;
	}

	function calcOptionalNumbersToUse(pattern, value) {
		var numbersInP = pattern.replace(/[^0]/g,'').length;
		var numbersInV = value.replace(/[^\d]/g,'').length;
		return numbersInV - numbersInP;
	}

	function concatChar(text, character, options, token) {
		if (token && typeof token.transform === 'function') character = token.transform(character);
		if (options.reverse) return character + text;
		return text + character;
	}

	function hasMoreTokens(pattern, pos, inc) {
		var pc = pattern.charAt(pos);
		var token = tokens[pc];
		if (pc === '') return false;
		return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
	}

	function insertChar(text, char, position) {
		var t = text.split('');
		t.splice(position >= 0 ? position: 0, 0, char);
		return t.join('');
	}

	function StringMask(pattern, opt) {
		this.options = opt || {};
		this.options = {
			reverse: this.options.reverse || false,
			usedefaults: this.options.usedefaults || this.options.reverse
		};
		this.pattern = pattern;
	}

	StringMask.prototype.process = function proccess(value) {
		if (!value) return '';
		value = value + '';
		var pattern2 = this.pattern;
		var valid = true;
		var formatted = '';
		var valuePos = this.options.reverse ? value.length - 1 : 0;
		var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
		var escapeNext = false;
		var recursive = [];
		var inRecursiveMode = false;

		var steps = {
			start: this.options.reverse ? pattern2.length - 1 : 0,
			end: this.options.reverse ? -1 : pattern2.length,
			inc: this.options.reverse ? -1 : 1
		};

		function continueCondition(options) {
			if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
				return true;
			} else if (!inRecursiveMode) {
				inRecursiveMode = recursive.length > 0;
			}

			if (inRecursiveMode) {
				var pc = recursive.shift();
				recursive.push(pc);
				if (options.reverse && valuePos >= 0) {
					i++;
					pattern2 = insertChar(pattern2, pc, i);
					return true;
				} else if (!options.reverse && valuePos < value.length) {
					pattern2 = insertChar(pattern2, pc, i);
					return true;
				}
			}
			return i < pattern2.length && i >= 0;
		}

		for (var i = steps.start; continueCondition(this.options); i = i + steps.inc) {
			var pc = pattern2.charAt(i);
			var vc = value.charAt(valuePos);
			var token = tokens[pc];
			if (!inRecursiveMode || vc) {
				if (this.options.reverse && isEscaped(pattern2, i)) {
					formatted = concatChar(formatted, pc, this.options, token);
					i = i + steps.inc;
					continue;
				} else if (!this.options.reverse && escapeNext) {
					formatted = concatChar(formatted, pc, this.options, token);
					escapeNext = false;
					continue;
				} else if (!this.options.reverse && token && token.escape) {
					escapeNext = true;
					continue;
				}
			}

			if (!inRecursiveMode && token && token.recursive) {
				recursive.push(pc);
			} else if (inRecursiveMode && !vc) {
				if (!token || !token.recursive) formatted = concatChar(formatted, pc, this.options, token);
				continue;
			} else if (recursive.length > 0 && token && !token.recursive) {
				// Recursive tokens most be the last tokens of the pattern
				valid = false;
				continue;
			} else if (!inRecursiveMode && recursive.length > 0 && !vc) {
				continue;
			}

			if (!token) {
				formatted = concatChar(formatted, pc, this.options, token);
				if (!inRecursiveMode && recursive.length) {
					recursive.push(pc);
				}
			} else if (token.optional) {
				if (token.pattern.test(vc) && optionalNumbersToUse) {
					formatted = concatChar(formatted, vc, this.options, token);
					valuePos = valuePos + steps.inc;
					optionalNumbersToUse--;
				} else if (recursive.length > 0 && vc) {
					valid = false;
					break;
				}
			} else if (token.pattern.test(vc)) {
				formatted = concatChar(formatted, vc, this.options, token);
				valuePos = valuePos + steps.inc;
			} else if (!vc && token._default && this.options.usedefaults) {
				formatted = concatChar(formatted, token._default, this.options, token);
			} else {
				valid = false;
				break;
			}
		}

		return {result: formatted, valid: valid};
	};

	StringMask.prototype.apply = function(value) {
		return this.process(value).result;
	};

	StringMask.prototype.validate = function(value) {
		return this.process(value).valid;
	};

	StringMask.process = function(value, pattern, options) {
		return new StringMask(pattern, options).process(value);
	};

	StringMask.apply = function(value, pattern, options) {
		return new StringMask(pattern, options).apply(value);
	};

	StringMask.validate = function(value, pattern, options) {
		return new StringMask(pattern, options).validate(value);
	};

	return StringMask;
}));

},{}],3:[function(require,module,exports){
var BrM = require('br-masks');

var m = angular.module('idf.br-filters', []);

var ehCPF = function(strCPF) {
	if (strCPF.replace(/[^\d]+/g, "").length > 11) return false;
	if (strCPF == "00000000000") return false;

	var soma = 0;
	var resto;

	for (i=1; i<=9; i++) soma = soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
		resto = (soma * 10) % 11;

	if ((resto == 10) || (resto == 11))  resto = 0;
	if (resto != parseInt(strCPF.substring(9, 10)) ) return false;

	soma = 0;
	for (i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
		resto = (soma * 10) % 11;

	if ((resto == 10) || (resto == 11))  resto = 0;
	if (resto != parseInt(strCPF.substring(10, 11) ) ) return false;
	return true;
}

module.exports = m.name;

m.filter('percentage', ['$filter', function($filter) {
	return function(input, decimals) {
		if (angular.isUndefined(input) || input === null) {
			return input;
		}

		return $filter('number')(input * 100, decimals) + '%';
	};
}])
.filter('brCep', [function() {
	return function(input) {
		return BrM.cep(input);
	};
}])
.filter('brPhoneNumber', [function() {
	return function(input) {
		return BrM.phone(input);
	};
}])
.filter('brCpf', [function() {
	return function(input) {
		return BrM.cpf(input);
	};
}])
.filter('brCnpj', [function() {
	return function(input) {
		return BrM.cnpj(input);
	};
}])
.filter('brCpfCnpj', [function() {
	return function(input) {
		if(!input) return input;

		if(ehCPF(input))
			return BrM.cpf(input);

		if(input.length < 14) {
			var pad = "00000000000000"
			input = pad.substring(0, pad.length - input.length) + input
		}

		return BrM.cpfCnpj(input);
	};
}])
.filter('brIe', [function() {
	return function(input, uf) {
		return BrM.ie(input,uf);
	};
}])
.filter('finance', ['$locale', function($locale) {
	return function(input, currency, decimals) {
		if (angular.isUndefined(input) || input === null) {
			return input;
		}

		var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
		thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
		currencySym = '';

		if (currency === true) {
			currencySym = $locale.NUMBER_FORMATS.CURRENCY_SYM + ' ';
		} else if (currency) {
			currencySym = currency;
		}

		return currencySym + BrM.finance(input, decimals, decimalDelimiter, thousandsDelimiter);
	};
}])
.filter('nfeAccessKey', [function() {
	return function(input) {
		return BrM.nfeAccessKey(input);
	};
}])
.filter('age', function() {
	/**
	 * @param value birthdate can be a date object or a time in milliseconds
	 * return the age based on the birthdate or undefined if value is invalid.
	 */
	 return function calculateAge(value) {
	 	if (!value) {
	 		return undefined;
	 	}
	 	var isDateInstance = (value instanceof Date);
	 	var isValidType = isDateInstance || !isNaN(parseInt(value));
	 	if (!isValidType) {
	 		return undefined;
	 	}
	 	var birthdate = isDateInstance ? value : new Date(value);
	 	if (birthdate > new Date()) {
	 		return undefined;
	 	}
	 	var ageDifMs = Date.now() - birthdate.getTime();
		 var ageDate = new Date(ageDifMs); // miliseconds from epoch
		 return Math.abs(ageDate.getUTCFullYear() - 1970);
		};
	});

},{"br-masks":1}]},{},[3]);
