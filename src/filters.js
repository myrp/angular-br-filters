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
