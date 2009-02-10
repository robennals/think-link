
/* The JSON prototype approach breaks firefox extensions. Here is a less intrusive version */

/*
    json.js
    2007-08-05

    Public Domain
    
    This is a rewritten version of the JSON printer/parser, by Rob Ennals.
    It started out as being the original JSON parser but is now quite different.
    The rewrite was done because the normal JSON parser breaks for...in loops,
    including those used by internal FireFox code.
    The main other change is that we strip out "null" and "false" values.
*/


var json_subs = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

function makeJSONString(obj){
	if(typeof obj.sort == 'function'){
        var a = [],     // The array holding the partial texts.
            i,          // Loop counter.
            l = obj.length,
            v;          // The value to be stringified.


        for (i = 0; i < l; i += 1) {
            v = obj[i];
            switch (typeof v) {
            case 'object':
                if (v) {
                    a.push(makeJSONString(v));
                } else {
                    a.push('null');
                }
                break;

            case 'string':
            case 'number':
            case 'boolean':
                a.push(makeJSONString(v));
            }
        }

// Join all of the member texts together and wrap them in brackets.

        return '[' + a.join(',') + ']';
  }
	switch(typeof obj){
    case 'boolean':
    		return String(obj);
		case 'number':
    	  return isFinite(obj) ? String(obj) : 'null';
    case 'function':
    	  return 'null';
    case 'object':
        var a = [],     // The array holding the partial texts.
            k,          // The current key.
            v;          // The current value.

// Iterate through all of the keys in the object, ignoring the proto chain
// and keys that are not strings.

        for (k in obj) {
            if (typeof k === 'string' &&
                    Object.prototype.hasOwnProperty.apply(obj, [k])) {
                v = obj[k];
                if(v === null || v === false || v === "") continue;
                switch (typeof v) {
                case 'object':
                    if (v) {
                    		a.push(makeJSONString(k) + ':' + makeJSONString(v));
                    } else {
                        a.push(makeJSONString(k) + ':null');
                    }
                    break;

                case 'string':
                case 'number':
                case 'boolean':
                    a.push(makeJSONString(k) + ':' + makeJSONString(v));

// Values without a JSON representation are ignored.

                }
            }
        }

// Join all of the member texts together and wrap them in braces.

        return '{' + a.join(',') + '}';
    case 'string':

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can simply slap some quotes around it.
// Otherwise we must also replace the offending characters with safe
// sequences.

            if (/["\\\x00-\x1f]/.test(obj)) {
                return '"' + obj.replace(/[\x00-\x1f\\"]/g, function (a) {
                    var c = json_subs[a];
                    if (c) {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                }) + '"';
            }
            return '"' + obj + '"';
        };
}

function parseJSON(str){
   var j;

// Parsing happens in three stages. In the first stage, we run the text against
// a regular expression which looks for non-JSON characters. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we will reject all
// unexpected characters.

// We split the first stage into 3 regexp operations in order to work around
// crippling deficiencies in Safari's regexp engine. First we replace all
// backslash pairs with '@' (a non-JSON character). Second we delete all of
// the string literals. Third, we look to see if only JSON characters
// remain. If so, then the text is safe for eval.

    if (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/.test(str.
            replace(/\\./g, '@').
            replace(/"[^"\\\n\r]*"/g, ''))) {
// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

			try{
 	  	  j = eval('(' + str + ')');
  	    return j;
    	}catch(e){
    		return null;
    	}
    }

// If the text is not JSON parseable, then a SyntaxError is thrown.

    throw new SyntaxError('parseJSON:' + str);
};
