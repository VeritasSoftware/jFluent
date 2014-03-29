////////////////////////////////////////////////////////////////////////////////
/////////////////////// jFluent validation plugin //////////////////////////////
/////////////////////// Author: Shantanu          //////////////////////////////
/////////////////////// Date: Oct 2012            //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//Errors array - saves error element id and error msg pair
//var errors = [, ];
var errors = [];

//Rules function
var func = null;

//Constants
var strRegexCreditCard = "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$";
var strRegexEmail = "[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-z0-9](?:[A-z0-9-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9-]*[A-z0-9])?";
var strRegexISOCurrencyCodes = /^(AED|AFN|ALL|AMD|ANG|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BGN|BHD|BIF|BMD|BND|BOB|BRL|BSD|BTN|BWP|BYR|BZD|CAD|CDF|CHF|CLP|CNY|COP|CRC|CUC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|GBP|GEL|GGP|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HRK|HTG|HUF|IDR|ILS|IMP|INR|IQD|IRR|ISK|JEP|JMD|JOD|JPY|KES|KGS|KHR|KMF|KPW|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LSL|LTL|LVL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRO|MUR|MVR|MWK|MXN|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLL|SOS|SPL|SRD|STD|SVC|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TVD|TWD|TZS|UAH|UGX|USD|UYU|UZS|VEF|VND|VUV|WST|XAF|BEA|CFA|BEA|XCD|XDR|IMF|XOF|BCE|XPF|CFP|YER|ZAR|ZMK|ZWD)$/i;

//Flag to add change handlers to input elements
var addChangeHandlers = false;

//Flags for single field validation
var jFluentValidateSingleId = null;
//Flags for firing rules for a field
var jFluentFireRuleId = null;
var jFluentIsRuleFiredInProgress = false;
//Flag to indicate a full validation
var jFluentFullValidate = false;

var jFluentOptions = null;

// Plug-in
(function ($) {
    $.jFluentRules = function (rulesFunc, options) {
        jFluentValidateSingleId = null;
        jFluentFireRuleId = null;
        jFluentIsRuleFiredInProgress = false;
        jFluentFullValidate = false;

        jFluentOptions = options;

        //Save the rules function
        func = rulesFunc;

        //If validateOnChange option is false then do not attach change handler to inputs
        //default - attach change handler to inputs
        if (jFluentOptions != null) {
            if (!jFluentOptions.validateOnChange) {
                return;
            }
        }
        //Set flag to true to add change handlers to elements
        addChangeHandlers = true;
        //Call rules function which will add the change handlers
        func();
    },
    $.fn.FireRulesFor = function (id) {
        if (jFluentFullValidate) return this;

        if (jFluentIsRuleFiredInProgress) return this;

        if ((jFluentValidateSingleId != $(this).attr("id"))) return this;

        jFluentIsRuleFiredInProgress = true;
        jFluentFullValidate = false;

        if (addChangeHandlers) return this;

        jFluentFireRuleId = id == null ? $(this).attr("id") : id;

        //errors = [,];

        addChangeHandlers = false;

        ClearSingleErrorMessages(jFluentFireRuleId)

        if (func != null) {
            //Call rules function to execute validation rules
            func();

            //Display validation summary
            $.jFluentValidationSummary();

            jFluentFireRuleId = null;
            jFluentIsRuleFiredInProgress = false;

            return this;
        }

        jFluentFireRuleId = null;
        jFluentIsRuleFiredInProgress = false;

        return this;
    },
    $.fn.jFluentValidateSingle = function (id) {
        jFluentIsRuleFiredInProgress = false;
        jFluentFireRuleId = null;
        jFluentFullValidate = false;

        jFluentValidateSingleId = id == null ? $(this).attr("id") : id;

        errors = [, ];

        addChangeHandlers = false;

        //ClearErrorMessages();
        ClearSingleErrorMessages(jFluentValidateSingleId)

        if (func != null) {
            //Call rules function to execute validation rules
            func();

            //Display error msgs
            DisplayErrorMessages();

            //Display validation summary
            $.jFluentValidationSummary();

            jFluentValidateSingleId = null;

            return errors.length <= 1;
        }

        jFluentValidateSingleId = null;

        return false;
    },
    $.jFluentValidate = function () {
        jFluentValidateSingleId = null;
        jFluentFireRuleId = null;
        jFluentIsRuleFiredInProgress = false;
        jFluentFullValidate = true;

        //Initialise errors array
        errors = [, ];

        addChangeHandlers = false;

        ClearErrorMessages();

        if (func != null) {
            //Call rules function to execute validation rules
            func();

            //Display error msgs
            DisplayErrorMessages();

            //Display validation summary
            $.jFluentValidationSummary();

            jFluentFullValidate = false;

            return errors.length <= 1;
        }

        return false;
    },
    $.fn.CreditCard = function (errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        var input = this.val();
        //If Luhn validation succeeds then regex validation else error
        if (CheckLuhn(input)) {
            if (input.match(strRegexCreditCard) == null) {
                AddError(this.attr("id"), errorMessage, "Not a valid credit card number.");
            }
        }
        else {
            AddError(this.attr("id"), errorMessage, "Not a valid credit card number.");
        }

        return this;
    },
    $.fn.Email = function (errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && jFluentIsRuleFiredInProgress && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        var input = this.val();

        //Match input against email regex
        if (input.match(strRegexEmail) == null) {
            AddError(this.attr("id"), errorMessage, "Not a valid email address.");
        }

        return this;
    },
    $.fn.ISOCurrencyCode = function (errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        var input = this.val();

        if (input.match(strRegexISOCurrencyCodes) == null) {
            AddError(this.attr("id"), errorMessage, "Not a valid currency code.");
        }

        return this;
    },
    $.fn.IsAlphaNumeric = function (errorMessage, alphaUnicodeRange, numericUnicodeRange) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        var input = this.val();

        if (input.match(regExp) == null) {
            AddError(this.attr("id"), errorMessage, "Match not valid.");
        }

        return this;
    },
    $.fn.Length = function (length, errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (this.val().length != length) {
            AddError(this.attr("id"), errorMessage, "The length is not valid.");
        }
        return this;
    },
    $.fn.NotNull = function (errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (this.val() == null) {
            AddError(this.attr("id"), errorMessage, "Should not be null.");
        }
        return this;
    },
    $.fn.Equal = function (item, errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (this.val() != item) {
            AddError(this.attr("id"), errorMessage, "The item is not equal.");
        }
        return this;
    },
    $.fn.NotEqual = function (item, errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (this.val() == item) {
            AddError(this.attr("id"), errorMessage, "The item is equal.");
        }
        return this;
    },
    $.fn.LengthGreaterThan = function (length, orEqual, errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (orEqual) {
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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (orEqual) {
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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (orEqual) {
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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (orEqual) {
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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

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
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        if (this.val() == null || this.val() == '') {
            AddError(this.attr("id"), errorMessage, "Value should not be null or empty.");
        }
        return this;
    },
    $.fn.SelectRequired = function (func, errorMessage) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule($(this).attr("id"))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }
        var inputType = $(this).attr("type");

        //Call Required with value of checked value
        return $("input:" + inputType + "[name=" + $(this).attr("name") + "]:checked").Required(func, errorMessage, $(this).attr("id"));
    },
    $.fn.Required = function (func, errorMessage, errorId) {
        if (!addChangeHandlers && !jFluentFullValidate && !IsFireRule((errorId || $(this).attr("id")))) return this;
        if (!addChangeHandlers && !jFluentFullValidate && !jFluentIsRuleFiredInProgress && !IsSingleValidationElement($(this).attr("id"))) return this;

        if (addChangeHandlers) {
            AddChangeHandler(this);
            return this;
        }

        //Call validation function with field value
        if (!func(this.val())) {
            AddError(errorId != null ? errorId : this.attr("id"), errorMessage, "Required rule was not met.");
        }

        return this;
    },
    //Write errors to validation summary
    $.jFluentValidationSummary = function () {
        //Get validation summary element
        var vSummary = $(".validation-summary-valid");

        if (vSummary.length == 0) {
            vSummary = $(".validation-summary-errors")
        }

        if (vSummary.length > 0) {
            var ul = vSummary.children("ul");

            if (ul.length > 0 & errors.length > 1) {
                vSummary.addClass("validation-summary-errors");
                vSummary.removeClass("validation-summary-valid");
                ul.html("");
                for (i = 1; i < errors.length; i++) {
                    //Get error msg element
                    //var errorMessageElement = $("[data-valmsg-for='" + errors[i][0] + "']");
                    var errorMessageElement = null;
                    if (errors[i] != null) {
                        errorMessageElement = $("[data-valmsg-for='" + errors[i][0] + "']");
                    }

                    if (errorMessageElement == null) {
                        continue;
                    }
                    //Get default error msg
                    var defaultErrorMessage = errorMessageElement.contents().filter(function () {
                        return this.nodeType == 3;
                    }).text();
                    //Display default error message or else error message in rule
                    if (defaultErrorMessage == '') {
                        ul.append("<li>" + errors[i][1] + "</li>")
                    }
                    else {
                        ul.append("<li>" + defaultErrorMessage + "</li>")
                    }
                }
            }
            else {
                if (ul.length > 0) {
                    ul.html("");
                }
                vSummary.addClass("validation-summary-valid");
            }
        }
    },
    $.jFluentIsValid = function () {
        //Is valid if errors array contains a error else false
        return errors.length <= 1;
    },
    $.jFluentErrors = function () {
        //Return errors array
        return errors;
    };
})(jQuery);

/// Private functions ///
//Clear error messages from form
function ClearErrorMessages() {
    //Remove errors lists
    $(".field-validation-error ul").remove();

    //Add valid class
    $(".field-validation-error").addClass("field-validation-valid");
}

function IsSingleValidationElement(id) {
    if (jFluentValidateSingleId != null) {
        if (id == jFluentValidateSingleId) {
            return true;
        }
        return false;
    }
    return true;
}

function IsFireRule(id) {
    if (jFluentFireRuleId != null) {
        if (id == jFluentFireRuleId) {
            return true;
        }
        return false;
    }
    return true;
}

function ClearSingleErrorMessages(id) {
    //Remove errors lists
    $("[data-valmsg-for='" + id + "'] ul").remove();
    //Add valid class
    $("[data-valmsg-for='" + id + "']").addClass("field-validation-valid");
}

function DisplayErrorMessages() {
    //Loop through error array and display error messages in error message element
    for (i = 1; i < errors.length; i++) {
        DisplayErrorMessage(i);
    }
}

//Display error message in error msg element
function DisplayErrorMessage(i) {
    //Get error message element
    var errorMessageElement = null;
    if (errors[i] != null) {
        errorMessageElement = $("[data-valmsg-for='" + errors[i][0] + "']");
    }

    if (errorMessageElement == null) {
        return;
    }

    var errorList = null;

    //If no default error message then add error msg specified in rule
    if (errorMessageElement.contents().filter(function () {
        return this.nodeType == 3;
    }).text() == '') {

        //If error list does not exist then create else get the list
        if (errorMessageElement.children("ul").length == 0) {
            errorList = $("<ul></ul>");

            $(errorMessageElement).append(errorList);
        }
        else {
            errorList = errorMessageElement.children().first();
        }

        //Add error message to list
        errorList.append($("<li>" + errors[i][1] + "</li>"));
    }

    //Remove valid class
    errorMessageElement.removeClass("field-validation-valid");
    //Add error class
    errorMessageElement.addClass("field-validation-error");
}

//Add error to errors array
function AddError(id, errorMessage, defaultErrorMessage) {
    //Add error to errors array
    errors.push([id, errorMessage != null ? errorMessage : defaultErrorMessage]);
}

//Luhn algorithm for credit card validation
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

//Add change handler to input
function AddChangeHandler(input) {
    //Add change handler to input element
    input.unbind("change");

    input.change(function (e) {
        if (func != null) {
            //alert('fired');
            //Call jFluent single field validation on change           
            $(input).jFluentValidateSingle();
        }
        e.stopPropagation();
    });
}