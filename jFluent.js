////////////////////////////////////////////////////////////////////////////////
/////////////////////// jFluent validation plugin //////////////////////////////
/////////////////////// Author: Shantanu          //////////////////////////////
/////////////////////// Date: Oct 2012            //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var errors = [,];
var func = null;

//Constants
var strRegexCreditCard = "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$";
var strRegexEmail = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
var strRegexISOCurrencyCodes = /^(AED|AFN|ALL|AMD|ANG|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BGN|BHD|BIF|BMD|BND|BOB|BRL|BSD|BTN|BWP|BYR|BZD|CAD|CDF|CHF|CLP|CNY|COP|CRC|CUC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|GBP|GEL|GGP|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HRK|HTG|HUF|IDR|ILS|IMP|INR|IQD|IRR|ISK|JEP|JMD|JOD|JPY|KES|KGS|KHR|KMF|KPW|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LTL|LVL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRO|MUR|MVR|MWK|MXN|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLL|SOS|SPL|SRD|STD|SVC|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TVD|TWD|TZS|UAH|UGX|USD|UYU|UZS|VEF|VND|VUV|WST|XAF|BEA|CFA|BEA|XCD|XDR|IMF|XOF|BCE|XPF|CFP|YER|ZAR|ZMK|ZWD)$/i;

$(document).ready(function () {
    var allInputs = $(":input");

    if (allInputs != null) {
        allInputs.change(function () {
            if (func != null) {
                $.jFluentValidate();
            }
        });
    }    
});

// Plug-in
(function ($) {
    $.jFluentRules = function (rulesFunc) {
        func = rulesFunc;
    },
    $.jFluentValidate = function () {
        errors = [,];

        ClearErrorMessages();

        if (func != null) {
            func.apply({}, []);

            DisplayErrorMessages();

            return errors.length <= 1;
        }

        return false;
    },
    $.fn.CreditCard = function (errorMessage) {
        var input = this.val();
        if (CheckLuhn(input)) {
            if (this.val().match(strRegexCreditCard) == null) {
                AddError(this.attr("id"), errorMessage, "Not a valid credit card number.");
            }
        }
        else {
            AddError(this.attr("id"), errorMessage, "Not a valid credit card number.");
        }

        return this;
    },
    $.fn.Email = function (errorMessage) {
        var input = this.val();
        
        if (input.match(strRegexEmail) == null) {
            AddError(this.attr("id"), errorMessage, "Not a valid email address.");
        }

        return this;
    },
    $.fn.ISOCurrencyCode = function (errorMessage) {
        var input = this.val();
        
        if (input.match(strRegexISOCurrencyCodes) == null) {
            AddError(this.attr("id"), errorMessage, "Not a valid currency code.");
        }

        return this;
    },
    $.fn.IsAlphaNumeric = function (errorMessage, alphaUnicodeRange, numericUnicodeRange) {
        if (alphaUnicodeRange == null) {
            alphaUnicodeRange = "a-zA-Z";
        }
        if (numericUnicodeRange == null) {
            numericUnicodeRange = "0-9";
        }

        var input = this.val();
        
        if (input.match("^(?=[" + numericUnicodeRange + "]*?[" + alphaUnicodeRange + "]+)(?=[" + alphaUnicodeRange + "]*?[" + numericUnicodeRange + "]+)[" + alphaUnicodeRange + numericUnicodeRange + "]+$") == null) {
            AddError(this.attr("id"), errorMessage, "Not alphanumeric.");
        }

        return this;
    },
    $.fn.IsAlpha = function (errorMessage, alphaUnicodeRange) {
        if (alphaUnicodeRange == null) {
            alphaUnicodeRange = "a-zA-Z";
        }

        var input = this.val();
        
        if (input.match("^[" + alphaUnicodeRange + "]+$") == null) {
            AddError(this.attr("id"), errorMessage, "Not alpha.");
        }

        return this;
    },
    $.fn.IsNumeric = function (errorMessage, numericUnicodeRange) {
        if (numericUnicodeRange == null) {
            numericUnicodeRange = "0-9";
        }

        var input = this.val();
        
        if (input.match("^[" + numericUnicodeRange + "]+$") == null) {
            AddError(this.attr("id"), errorMessage, "Not numeric.");
        }

        return this;
    },
    $.fn.Matches = function (regExp, errorMessage) {
        var input = this.val();
        
        if (input.match(regExp) == null) {
            AddError(this.attr("id"), errorMessage, "Match not valid.");
        }

        return this;
    },
    $.fn.Length = function (length, errorMessage) {
        if (this.val().length != length) {
            AddError(this.attr("id"), errorMessage, "The length is not valid.");
        }
        return this;
    },
    $.fn.NotNull = function (errorMessage) {
        if (this.val() == null) {
            AddError(this.attr("id"), errorMessage, "Should not be null.");
        }
        return this;
    },
    $.fn.Equal = function (item, errorMessage) {
        if (this.val() != item) {
            AddError(this.attr("id"), errorMessage, "The item is not equal.");
        }
        return this;
    },
    $.fn.NotEqual = function (item, errorMessage) {
        if (this.val() == item) {
            AddError(this.attr("id"), errorMessage, "The item is equal.");
        }
        return this;
    },
    $.fn.LengthGreaterThan = function (length, orEqual, errorMessage) {
        if (orEqual){
            if (this.val().length < length) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than or equal to.");
            }
        }
        else {
            if (this.val().length <= length) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than.");
            }
        }

        return this;
    },
    $.fn.LengthLessThan = function (length, orEqual, errorMessage) {
        if (orEqual){
            if (this.val().length > length) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than or equal to.");
            }
        }
        else {
            if (this.val().length >= length) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than.");
            }
        }

        return this;
    },
    $.fn.LengthBetween = function (lowerLimit, upperLimit, exclusive, errorMessage) {
        if (exclusive) {
            if (!(lowerLimit < this.val().length & this.val().length < upperLimit)) {
                AddError(this.attr("id"), errorMessage, "The item is not between lowerLimit and upperLimit.");
            }
        }
        else {
            if (!(lowerLimit <= this.val().length & this.val().length <= upperLimit)) {
                AddError(this.attr("id"), errorMessage, "The item is not between lowerLimit and upperLimit.");
            }
        }

        return this;
    },
    $.fn.GreaterThan = function (item, orEqual, errorMessage) {
        if (orEqual){
            if (this.val() < item) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than or equal to.");
            }
        }
        else {
            if (this.val() <= item) {
                AddError(this.attr("id"), errorMessage, "The item is not greater than.");
            }
        }

        return this;
    },
    $.fn.LessThan = function (item, orEqual, errorMessage) {
        if (orEqual){
            if (this.val() > item) {
                AddError(this.attr("id"), errorMessage, "The item is not less than or equal to.");
            }
        }
        else {
            if (this.val() >= item) {
                AddError(this.attr("id"), errorMessage, "The item is not less than.");
            }
        }

        return this;
    },
    $.fn.Between = function (lowerLimit, upperLimit, exclusive, errorMessage) {
        if (exclusive) {
            if (!(lowerLimit < this.val() & this.val() < upperLimit)) {
                AddError(this.attr("id"), errorMessage, "The item is not between lowerLimit and upperLimit.");
            }
        }
        else {
            if (!(lowerLimit <= this.val() & this.val() <= upperLimit)) {
                AddError(this.attr("id"), errorMessage, "The item is not between lowerLimit and upperLimit.");
            }
        }

        return this;
    },
    $.fn.NotNullOrEmpty = function (errorMessage) {
        if (this.val() == null || this.val() == '') {
            AddError(this.attr("id"), errorMessage, "Value should not be null or empty.");
        }
        return this;
    },
    $.fn.SelectRequired = function (func, errorMessage) {
        var inputType = $(this).attr("type");
        $("input:" + inputType + "[name=" +  $(this).attr("name")  + "]:checked").Required(func, errorMessage, this.attr("id"));       
    },
    $.fn.Required = function (func, errorMessage, errorId) {
        if (!func.apply({}, [this.val()])) {            
            AddError(errorId != null ? errorId : this.attr("id"), errorMessage, "Required rule was not met.");
        }

        return this;
    },
    $.jFluentIsValid = function () {
        return errors.length <= 1;
    },
    $.jFluentErrors = function () {
        return errors;
    };
})(jQuery);

/// Private functions ///
function ClearErrorMessages() {
    $(".field-validation-error").empty();

    $(".field-validation-error").addClass("field-validation-valid");
}

function DisplayErrorMessages() {
    for (i = 1; i < errors.length; i++) {
        DisplayErrorMessage(i);
    }
}

function DisplayErrorMessage(i) {
    var errorMessageElement = $("[data-valmsg-for='" + errors[i][0] + "']");

    var errorMessage = '';

    if (errorMessageElement.children().first() != null) {
        errorMessage = errorMessageElement.children().first().text();
        errorMessageElement.empty();
    }

    var span = document.createElement("span");
    $(span).attr("generated", true);
    $(span).attr("class", "");
    $(span).text(errorMessage == '' ? errors[i][1] : errorMessage + "|" + errors[i][1]);

    errorMessageElement.append(span);
    errorMessageElement.removeClass("field-validation-valid");
    errorMessageElement.addClass("field-validation-error");
}

function AddError(id, errorMessage, defaultErrorMessage) {
    errors.push([id, errorMessage != null ? errorMessage : defaultErrorMessage]);
}

function CheckLuhn(input) {
    var sum = 0;
    var numdigits = input.length;
    var parity = numdigits % 2;
    for (var i = 0; i < numdigits; i++) {
        var digit = parseInt(input.charAt(i))
        if (i % 2 == parity) digit *= 2;
        if (digit > 9) digit -= 9;
        sum += digit;
    }
    return sum > 0 ? (sum % 10) == 0 : false;
} 
