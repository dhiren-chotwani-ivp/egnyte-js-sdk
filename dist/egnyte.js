(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Egnyte"] = factory();
	else
		root["Egnyte"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    "fsmeta": "/v1/fs",
    "fscontent": "/v1/fs-content",
    "fschunked": "/v1/fs-content-chunked",
    "notes": "/v1/notes",
    "links": "/v1/links",
    "perms": "/v1/perms",
    "userinfo": "/v1/userinfo",
    "users": "/v2/users/",
    "events": "/v1/events",
    "search": "/v1/search",
    "eventscursor": "/v1/events/cursor",
    "tokenauth": "/puboauth/token"
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var helpers = __webpack_require__(2);
module.exports = function mkerr(fields, error) {
    error = error || Error(fields.message);
    fields.statusCode = fields.statusCode || 0;
    helpers.hintDeveloper(fields.hint, error);
    return Object.assign(error, fields);
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var disallowedChars = /[":<>|?*\\]/;

var helpers = {
    encodeNameSafe: function encodeNameSafe(name) {
        if (!name) {
            throw new Error("No name given");
        }
        if (disallowedChars.test(name)) {
            throw new Error("Disallowed characters in path");
        }

        name = name.replace(/^\/\//, "/");

        return name;
    },
    encodePathComponents: function encodePathComponents(path) {
        path = helpers.encodeNameSafe(path);
        return path.split("/").map(encodeURIComponent).join("/").replace(/#/g, "%23");
        //TODO: handle special chars not covered by this.
    },
    normalizeEgnyteDomain: function normalizeEgnyteDomain(domain) {
        return "https://" + helpers.normalizeURL(domain).replace(/^https?:\/\//, "");
    },
    normalizeURL: function normalizeURL(url) {
        return url.replace(/\/*$/, "");
    },
    hintDeveloper: function hintDeveloper(hint, err) {
        //TODO: make this optinal, by configuration or dev build
        console && console.warn(hint, err);
    }
};

module.exports = helpers;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var requestEngineFactory = __webpack_require__(5);
var helpers = __webpack_require__(2);
var decorators = __webpack_require__(7);
var inputHandler = __webpack_require__(11);
var mkerr = __webpack_require__(1);

var plugins = new Set();

var mkReqFunctionFactory = function mkReqFunctionFactory(tools) {
    return function (guarantees, apiFacadeMethod) {
        return function (input) {
            return apiFacadeMethod(tools, decorators.configure(input), inputHandler.process(input, guarantees));
        };
    };
};

module.exports = {
    instance: function instance(options) {
        var tools = {
            requestEngine: requestEngineFactory(options),
            helpers: helpers,
            mkerr: mkerr,
            inputHandler: inputHandler
        };
        var core = {
            setDomain: function setDomain(domain) {
                var normalizedDomain = domain ? helpers.normalizeEgnyteDomain(domain) : null;
                options.egnyteDomainURL = normalizedDomain;
                core.domain = normalizedDomain;
            },

            API: {
                manual: tools.requestEngine
            },
            domain: null,
            _: {
                mkReqFunction: mkReqFunctionFactory(tools)
            }
        };
        plugins.forEach(function (p) {
            return p.init(core);
        });
        return core;
    },
    plug: function plug(plugin) {
        // Set automatically deduplicates if a plugin was added twice
        plugins.add(plugin);
    },

    _: {
        helpers: helpers,
        plugins: plugins,
        requestEngineFactory: requestEngineFactory
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var core = __webpack_require__(3);
core.plug(__webpack_require__(12));
core.plug(__webpack_require__(13));
core.plug(__webpack_require__(14));
core.plug(__webpack_require__(15));
core.plug(__webpack_require__(16));
core.plug(__webpack_require__(17));
module.exports = __webpack_require__(23);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var errorify = __webpack_require__(6);

var enginePrototypeMethods = {};

function Engine(options) {
    this.authType = "Bearer";
    this.options = options;
    this.token = options.token;

    this.requestHandler = options.httpRequest;

    this.quota = {
        startOfTheSecond: 0,
        calls: 0,
        retrying: 0
    };
    this.queue = [];

    this.queueHandler = _rollQueue.bind(this);
}
Engine.prototype = enginePrototypeMethods;

module.exports = function createEngine(options) {
    return new Engine(options);
};

//======================================================================
// auth


enginePrototypeMethods.isAuthorized = function () {
    return !!this.token;
};

enginePrototypeMethods.getToken = function () {
    return this.token;
};

enginePrototypeMethods.setToken = function (externalToken) {
    this.token = externalToken;
};

enginePrototypeMethods.dropToken = function (externalToken) {
    this.token = null;
};

//======================================================================
//request handling
function params(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    if (str.length) {
        return "?" + str.join("&");
    } else {
        return "";
    }
}
enginePrototypeMethods.getEndpoint = function (appendice) {
    var endpoint = this.options.egnyteDomainURL + "/pubapi";
    if (appendice) {
        if (appendice.charAt(0) !== "/") {
            appendice = "/" + appendice;
        }
        endpoint += appendice;
    }
    return endpoint;
};

enginePrototypeMethods.sendRequest = function (opts, callback, forceNoAuth) {
    var self = this;
    opts = Object.assign({}, self.options.requestDefaults, opts); //merging in the defaults
    var originalOpts = Object.assign({}, opts); //just copying the object

    if (this.isAuthorized() || forceNoAuth) {
        opts.url += params(opts.params);
        opts.headers = opts.headers || {};
        if (!forceNoAuth) {
            opts.headers["Authorization"] = this.authType + " " + this.getToken();
        }
        if (!callback) {
            return self.requestHandler(opts);
        } else {
            var timer;
            var retry = function retry() {
                self.sendRequest(originalOpts, self.retryHandler(callback, retry, timer));
            };
            if (self.timerStart) {
                timer = self.timerStart();
            }

            return self.requestHandler(opts, self.retryHandler(callback, retry, timer));
        }
    } else {
        callback.call(this, new Error("Not authorized"), {
            statusCode: 0
        }, null);
    }
};

enginePrototypeMethods.retryHandler = function (callback, retry, timer) {
    var self = this;
    return function (error, response, body) {
        //build an error object for http errors
        if (!error && response.statusCode >= 400 && response.statusCode < 600) {
            error = new Error(body);
        }
        try {
            //this shouldn't be required, but server sometimes responds with content-type text/plain
            body = JSON.parse(body);
        } catch (e) {}

        if (response) {
            var retryAfter = response.headers["retry-after"];
            var masheryCode = response.headers["x-mashery-error-code"];
            //in case headers get returned as arrays, we only expect one value
            retryAfter = typeof retryAfter === "array" ? retryAfter[0] : retryAfter;
            masheryCode = typeof masheryCode === "array" ? masheryCode[0] : masheryCode;
        }

        if (response && self.options.handleQuota && response.statusCode === 403 && retryAfter) {
            if (masheryCode === "ERR_403_DEVELOPER_OVER_QPS") {
                //retry
                console && console.warn("developer over QPS, retrying");
                self.quota.retrying = 1000 * ~~retryAfter;
                setTimeout(function () {
                    self.quota.retrying = 0;
                    retry();
                }, self.quota.retrying);
            }
            if (masheryCode === "ERR_403_DEVELOPER_OVER_RATE") {
                error.RATE = true;
                callback.call(this, error, response, body);
            }
        } else {

            if (response &&
            //Checking for failed auth responses
            //(ノಠ益ಠ)ノ彡┻━┻
            self.options.onInvalidToken && (response.statusCode === 401 || response.statusCode === 403 && masheryCode === "ERR_403_DEVELOPER_INACTIVE")) {
                self.auth.dropToken();
                self.options.onInvalidToken();
            }
            if (self.timerEnd) {
                self.timerEnd(timer);
            }
            callback.call(this, error, response, body);
        }
    };
};

enginePrototypeMethods.retrieveStreamFromRequest = function (opts) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var requestFunction = function requestFunction() {

            try {
                var req = self.sendRequest(opts);
                resolve(req);
            } catch (error) {
                reject(errorify({
                    error: error
                }));
            }
        };

        if (!this.options.handleQuota) {
            requestFunction();
        } else {
            //add to queue
            this.queue.push(requestFunction);
            //stop previous queue processing if any
            clearTimeout(this.quota.to);
            //start queue processing
            this.queueHandler();
        }
    });
};

enginePrototypeMethods.promiseRequest = function (opts, requestHandler, forceNoAuth) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var requestFunction = function requestFunction() {
            try {
                var req = self.sendRequest(opts, function (error, response, body) {
                    if (error) {
                        reject(errorify({
                            error: error,
                            response: response,
                            body: body
                        }));
                    } else {
                        resolve({
                            response: response,
                            body: body
                        });
                    }
                }, forceNoAuth);
                requestHandler && requestHandler(req);
            } catch (error) {
                reject(errorify({
                    error: error
                }));
            }
        };
        if (!self.options.handleQuota) {
            requestFunction();
        } else {
            //add to queue
            self.queue.push(requestFunction);
            //stop previous queue processing if any
            clearTimeout(self.quota.to);
            //start queue processing
            self.queueHandler();
        }
    });
};

enginePrototypeMethods.setupTiming = function (getTimer, timeEnd) {
    this.timerStart = getTimer;
    this.timerEnd = timeEnd;
};

//gets bound to this in the constructor and saved as this.queueHandler
function _rollQueue() {
    if (this.queue.length) {
        var currentWait = _quotaWaitTime(this.quota, this.options.QPS);
        if (currentWait === 0) {
            var requestFunction = this.queue.shift();
            requestFunction();
            this.quota.calls++;
        }
        this.quota.to = setTimeout(this.queueHandler, currentWait);
    }
}

function _quotaWaitTime(quota, QPS) {
    var now = Date.now();
    var diff = now - quota.startOfTheSecond;
    //in the middle of retrying a denied call
    if (quota.retrying) {
        quota.startOfTheSecond = now + quota.retrying;
        return quota.retrying + 1;
    }
    //last call was over a second ago, can start
    if (diff > 1002) {
        quota.startOfTheSecond = now;
        quota.calls = 0;
        return 0;
    }
    //calls limit not reached
    if (quota.calls < QPS) {
        return 0;
    }
    //calls limit reached, delay to the next second
    return 1003 - diff;
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var mkerr = __webpack_require__(1);

//making sense of all the different error message bodies
var isMsg = {
    "msg": 1,
    "message": 1,
    "errorMessage": 1
};

var htmlMsgRegex = /^\s*<h1>([^<]*)<\/h1>\s*$/gi;

function findMessage(obj) {
    var result;
    for (var i in obj) {
        if (isMsg[i]) {
            return obj[i];
        }
        if (_typeof(obj[i]) === "object") {
            result = findMessage(obj[i]);
            if (result) {
                return result;
            }
        }
    }
}
//this should understand all the message formats from the server and translate to a nice message
function psychicMessageParser(mess, statusCode) {
    var nice;
    if (typeof mess === "string") {
        try {
            nice = findMessage(JSON.parse(mess));
            if (!nice) {
                //fallback if nothing found - return raw JSON string anyway
                nice = mess;
            }
        } catch (e) {
            nice = mess ? mess.replace(htmlMsgRegex, "$1") : "Unknown error";
        }
        if (statusCode === 404 && mess.length > 300) {
            //server returned a dirty 404
            nice = "Not found";
        }
    } else {
        nice = findMessage(mess);
    }
    return nice;
}

module.exports = function (result) {
    var error, code;
    if (result.response) {
        code = ~~result.response.statusCode;
        error = mkerr({
            statusCode: code,
            message: "" + psychicMessageParser(result.body || result.error.message, code),
            response: result.response,
            body: result.body
        }, result.error);
    } else {
        error = mkerr({
            statusCode: 0
        }, result.error);
    }
    return error;
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mkerr = __webpack_require__(1);

// IMPORTANT: order matters. Make sure customize is at the end and beforeSend is last
//   so it doesn't get overwritten
var activeDecorators = [
// put more here, not below
__webpack_require__(8), __webpack_require__(9), __webpack_require__(10)];

module.exports = {
    configure: function configure(input) {
        return function (opts) {
            opts = activeDecorators.reduce(function (optsModified, decorator) {
                if (decorator.name in input) {
                    var updatedOpts = decorator.execute(optsModified, input);
                    if (!updatedOpts) {
                        throw mkerr({
                            message: "Decorator from " + decorator.name + " didn't return the options object"
                        });
                    }
                    return updatedOpts;
                } else {
                    return optsModified;
                }
            }, opts);
            return opts;
        };
    }
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    name: "customizeRequest",
    execute: function execute(opts, input) {
        return Object.assign(opts, input.customizeRequest);
    }
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    name: "queryParams",
    execute: function execute(opts, input) {
        Object.assign(opts.params, input.queryParams);
        return opts;
    }
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    name: "beforeSend",
    execute: function execute(opts, input) {
        return input.beforeSend(opts, input);
    }
};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mkerr = __webpack_require__(1);
var helpers = __webpack_require__(2);

module.exports = {
    process: function process(originalInput, guarantees) {
        var input = Object.assign({}, originalInput);
        if (guarantees.requires) {
            guarantees.requires.forEach(function (key) {
                if (input[key] === undefined) {
                    throw mkerr({
                        message: "Invalid input, " + key + " field required",
                        hint: key + " field required"
                    });
                }
            });
        }
        if (guarantees.optional) {
            guarantees.optional.forEach(function (key) {
                if (key in input && input[key] === undefined) {
                    helpers.hintDeveloper(key + " field was explicitly passed an undefined value. It's likely an accident. Avoid specifying the property at all if it's undefined.");
                }
            });
        }
        if (guarantees.fsIdentification) {
            if (!(input.fileId || input.folderId || input.path)) {
                throw mkerr({
                    message: "Identify a file or folder. One of the fields must be specified: fileId folderId path",
                    hint: "Identify a file or folder. One of the fields must be specified: fileId folderId path"
                });
            } else {
                input = handleIdentification(input);
            }
        }
        return input;
    }
};

var goodId = /^[0-9a-z\-]+$/i;
function detectIncorrectId(key, id) {
    if (!goodId.test(id)) {
        throw mkerr({
            message: "Invalid file or folder identification, " + key + " field seems to contain something else than an ID",
            hint: key + " field expected to match " + goodId.toString()
        });
    }
}

function handleIdentification(input) {
    if (input.fileId) {
        detectIncorrectId("fileId", input.fileId);
        input.pathFromRoot = "/ids/file/" + input.fileId;
        return input;
    }
    if (input.folderId) {
        detectIncorrectId("folderId", input.folderId);
        input.pathFromRoot = "/ids/file/" + input.folderId;
        return input;
    }
    if (input.path) {
        input.pathFromRoot = helpers.encodePathComponents(input.path);
        return input;
    }
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENDPOINTS = __webpack_require__(0);

module.exports = {
    init: function init(core) {
        var mkReqFunction = core._.mkReqFunction;
        authAPI = {
            getUserInfo: mkReqFunction({}, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.userinfo)
                    };
                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.body;
                });
            }),
            isAuthorized: mkReqFunction({}, function (tools) {
                return tools.requestEngine.isAuthorized();
            })

        };

        core.API.auth = authAPI;
        return authAPI;
    }
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENDPOINTS = __webpack_require__(0);

module.exports = {
    init: function init(core) {
        var mkReqFunction = core._.mkReqFunction;
        var fsAPI = {
            get: mkReqFunction({
                fsIdentification: true,
                optional: ["versionEntryId"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot)
                    };

                    if (input.versionEntryId) {
                        opts.params = {
                            "entry_id": input.versionEntryId
                        };
                    }

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.body;
                });
            }),
            exists: mkReqFunction({
                fsIdentification: true
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot)
                    };

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.response.statusCode == 200;
                }, //breaking change
                function (result) {
                    //result.error result.response, result.body
                    if (result.response && result.response.statusCode == 404) {
                        return false;
                    } else {
                        throw result;
                    }
                });
            }),
            parents: mkReqFunction({
                fsIdentification: true
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot + "/parents")
                    };

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.body;
                });
            }),
            createFolder: mkReqFunction({
                fsIdentification: true
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "POST",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot),
                        json: {
                            "action": "add_folder"
                        }
                    };
                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.body;
                }); //breaking change
            }),
            //breaking change - no more rename, can be implemented properly later
            move: mkReqFunction({
                fsIdentification: true,
                requires: ["destination"]
            }, transfer.bind(null, "move")),
            copy: mkReqFunction({
                fsIdentification: true,
                requires: ["destination"]
            }, transfer.bind(null, "copy")),
            remove: mkReqFunction({
                fsIdentification: true,
                optional: ["versionEntryId"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "DELETE",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot)
                    };
                    if (input.versionEntryId) {
                        opts.params = {
                            "entry_id": versionEntryId
                        };
                    }
                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.response.statusCode;
                }); //backwards commpatibility
            })
        };

        core.API.storage = fsAPI;
        return fsAPI;
    }
};

function transfer(action, tools, decorate, input) {
    return Promise.resolve().then(function () {
        var newPath = tools.helpers.encodeNameSafe(input.destination);
        var opts = {
            method: "POST",
            url: tools.requestEngine.getEndpoint(ENDPOINTS.fsmeta + input.pathFromRoot),
            json: {
                "action": action,
                "destination": newPath
            }
        };
        return tools.requestEngine.promiseRequest(decorate(opts));
    }).then(function (result) {
        return result.body;
    }); //breaking change
    // .then(function (result) { //result.response result.body
    //     if (result.response.statusCode == 200) {
    //         return {
    //             oldPath: pathFromRoot,
    //             path: newPath
    //         };
    //     }
    // });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENDPOINTS = __webpack_require__(0);

module.exports = {
    init: function init(core) {
        var mkReqFunction = core._.mkReqFunction;
        var fsBrowserAPI = {
            download: mkReqFunction({
                fsIdentification: true,
                optional: ["versionEntryId", "isBinary"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fscontent + input.pathFromRoot)
                    };
                    if (input.versionEntryId) {
                        opts.params = {
                            "entry_id": input.versionEntryId
                        };
                    }

                    if (input.isBinary) {
                        opts.responseType = "arraybuffer";
                    }

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.response;
                });
            }),
            storeFile: mkReqFunction({
                fsIdentification: true,
                requires: ["file"],
                optional: ["mimeType"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {

                    var opts = {
                        method: "POST",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fscontent + input.pathFromRoot),
                        body: input.file
                    };

                    opts.headers = {};
                    if (input.mimeType) {
                        opts.headers["Content-Type"] = input.mimeType;
                    }

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    result.body.id = result.response.headers["etag"]; //for backward compatibility
                    return result.body;
                });
            }),
            //TODO: check if EOS supports this
            storeFileMultipart: mkReqFunction({
                fsIdentification: true,
                requires: ["file"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    if (!window.FormData) {
                        throw new Error("Unsupported browser");
                    }
                    var file = fileOrBlob;
                    var formData = new window.FormData();
                    formData.append('file', file);
                    pathFromRoot = helpers.encodeNameSafe(pathFromRoot) || "";
                    var opts = {
                        method: "POST",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.fscontent + input.pathFromRoot),
                        body: formData
                    };
                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    result.body.id = result.response.headers["etag"]; //for backward compatibility
                    return result.body;
                });
            })

        };

        core.API.storage = Object.assign(core.API.storage, fsBrowserAPI);
        return fsBrowserAPI;
    }
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENDPOINTS_links = __webpack_require__(0).links;

module.exports = {
    init: function init(core) {
        var mkReqFunction = core._.mkReqFunction;
        var linksAPI = {
            createLink: mkReqFunction({
                requires: ["path", "linkSetup"],
                fsIdentification: true
            }, function (tools, decorate, input) {
                var linkSetup = input.linkSetup;
                var defaults = {
                    path: null,
                    type: "file",
                    accessibility: "domain"
                };
                return Promise.resolve().then(function () {
                    var setup = Object.assign(defaults, linkSetup, {
                        path: input.pathFromRoot
                    });
                    // setup.path = tools.encodeNameSafe(setup.path);

                    return tools.requestEngine.promiseRequest(decorate({
                        method: "POST",
                        url: tools.requestEngine.getEndpoint() + ENDPOINTS_links,
                        json: setup
                    }));
                }).then(function (result) {
                    //result.response result.body
                    return result.body;
                });
            }),
            removeLink: mkReqFunction({
                requires: ["id"]
            }, function (tools, decorate, input) {
                return tools.requestEngine.promiseRequest(decorate({
                    method: "DELETE",
                    url: tools.requestEngine.getEndpoint() + ENDPOINTS_links + "/" + input.id
                })).then(function (result) {
                    //result.response result.body
                    return result.response.statusCode;
                });
            }),
            listLink: mkReqFunction({
                requires: ["id"]
            }, function (tools, decorate, input) {
                return tools.requestEngine.promiseRequest(decorate({
                    method: "GET",
                    url: tools.requestEngine.getEndpoint() + ENDPOINTS_links + "/" + input.id
                })).then(function (result) {
                    //result.response result.body
                    return result.body;
                });
            }),
            listLinks: mkReqFunction({
                requires: ["filters"]
            }, function (tools, decorate, input) {
                var filters = input.filters;
                return Promise.resolve().then(function () {
                    filters.path = filters.path && tools.helpers.encodeNameSafe(filters.path);

                    return tools.requestEngine.promiseRequest(decorate({
                        method: "get",
                        url: tools.requestEngine.getEndpoint() + ENDPOINTS_links,
                        params: filters
                    }));
                }).then(function (result) {
                    //result.response result.body
                    return result.body;
                });
            }),
            findOne: mkReqFunction({
                requires: ["filters"]
            }, function (tools, decorate, input) {
                return linksAPI.listLinks(input).then(function (list) {
                    if (list.ids && list.ids.length > 0) {
                        return linksAPI.listLink({
                            id: list.ids[0]
                        });
                    } else {
                        return null;
                    }
                });
            })
        };

        core.API.link = linksAPI;
        return linksAPI;
    }
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ENDPOINTS = __webpack_require__(0);

module.exports = {
    init: function init(core) {
        var mkReqFunction = core._.mkReqFunction;
        usersAPI = {
            getById: mkReqFunction({
                fsIdentification: false,
                requires: ["id"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.users + input.id)
                    };

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    return result.body;
                });
            }),
            getByName: mkReqFunction({
                fsIdentification: false,
                requires: ["name"]
            }, function (tools, decorate, input) {
                return Promise.resolve().then(function () {
                    var opts = {
                        method: "GET",
                        url: tools.requestEngine.getEndpoint(ENDPOINTS.users),
                        params: {
                            filter: "userName eq \"" + input.name + "\""
                        }
                    };

                    return tools.requestEngine.promiseRequest(decorate(opts));
                }).then(function (result) {
                    if (result.body.resources && result.body.resources[0]) {
                        return result.body.resources[0];
                    } else {
                        throw tools.mkerr({
                            message: "User not found"
                        });
                    }
                });
            })
        };

        core.API.user = usersAPI;
        return usersAPI;
    }
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var filePickerInit = __webpack_require__(18).init;

module.exports = {
    init: function init(core) {
        filePickerInit(core);
    }
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = init;

var _app = __webpack_require__(19);

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(core) {
    core.filePicker = function (containerNode, options) {
        // TODO: options validation and authentication mechanisms to be added here
        (0, _app2.default)(containerNode, options, core);
    };
} // accept input and pass to the app

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _hyperapp = __webpack_require__(20);

function init(targetNode, options, core) {
    options.perPage = options.perPage || 100; //TODO: move up to index

    (0, _hyperapp.app)({
        root: targetNode,
        state: {
            path: options.path || "/",
            listing: [],
            page: 1,
            pagesTotal: 0
        },
        actions: {
            listFolder: function listFolder(state, actions, folderPath) {
                var path = folderPath || state.path;
                return function (update) {
                    update(Object.assign(state, { path: path }));
                    core.API.storage.get({
                        path: state.path,
                        count: options.perPage,
                        offset: state.page - 1
                    }).then(function (folder) {
                        update(Object.assign(state, {
                            pagesTotal: Math.ceil(folder.total_count / options.perPage),
                            listing: [].concat(folder.folders, folder.files)
                        }));
                    });
                };
            },

            callbacks: {
                selection: function selection() {
                    options.selection(state.listing.filter(function (i) {
                        return i.isSelected;
                    }));
                },
                cancel: function cancel() {
                    options.cancel();
                },
                error: function error(state, actions, _error) {
                    options.error(_error);
                }
            }
        },
        events: {
            load: function load(state, actions) {
                actions.listFolder();
            }
        },
        view: function view(state, actions) {
            return (0, _hyperapp.h)(
                "div",
                { "class": "eg-filepicker" },
                state.listing.map(function (item) {
                    return item.is_folder ? (0, _hyperapp.h)(Folder, { item: item, actions: actions }) : (0, _hyperapp.h)(File, { item: item, actions: actions });
                })
            );
        }
    });
}
exports.default = init;

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__h__ = __webpack_require__(21);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return __WEBPACK_IMPORTED_MODULE_0__h__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app__ = __webpack_require__(22);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "app", function() { return __WEBPACK_IMPORTED_MODULE_1__app__["a"]; });




/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = h;
var i
var stack = []

function h(tag, data) {
  var node
  var children = []

  for (i = arguments.length; i-- > 2; ) {
    stack.push(arguments[i])
  }

  while (stack.length) {
    if (Array.isArray((node = stack.pop()))) {
      for (i = node.length; i--; ) {
        stack.push(node[i])
      }
    } else if (node != null && node !== true && node !== false) {
      if (typeof node === "number") {
        node = node + ""
      }
      children.push(node)
    }
  }

  return typeof tag === "string"
    ? {
        tag: tag,
        data: data || {},
        children: children
      }
    : tag(data, children)
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = app;
var globalInvokeLaterStack = []

function app(props) {
  var appState
  var appView = props.view
  var appActions = {}
  var appEvents = {}
  var appMixins = props.mixins || []
  var appRoot = props.root || document.body
  var element = appRoot.children[0]
  var oldNode
  var willRender

  for (var i = 0; i <= appMixins.length; i++) {
    var mixin = appMixins[i] ? appMixins[i](emit) : props

    Object.keys(mixin.events || []).map(function(key) {
      appEvents[key] = (appEvents[key] || []).concat(mixin.events[key])
    })

    initialize(appActions, mixin.actions)
    appState = merge(appState, mixin.state)
  }

  requestRender(
    (oldNode = emit("load", element)) === element && (oldNode = element = null)
  )

  return emit

  function initialize(actions, withActions, lastName) {
    Object.keys(withActions || []).map(function(key) {
      var action = withActions[key]
      var name = lastName ? lastName + "." + key : key

      if (typeof action === "function") {
        actions[key] = function(data) {
          emit("action", { name: name, data: data })

          var result = emit("resolve", action(appState, appActions, data))

          return typeof result === "function" ? result(update) : update(result)
        }
      } else {
        initialize(actions[key] || (actions[key] = {}), action, name)
      }
    })
  }

  function render(cb) {
    element = patch(
      appRoot,
      element,
      oldNode,
      (oldNode = emit("render", appView)(appState, appActions)),
      (willRender = !willRender)
    )
    while ((cb = globalInvokeLaterStack.pop())) cb()
  }

  function requestRender() {
    if (appView && !willRender) {
      requestAnimationFrame(render, (willRender = !willRender))
    }
  }

  function update(withState) {
    if (withState && (withState = emit("update", merge(appState, withState)))) {
      requestRender((appState = withState))
    }
    return appState
  }

  function emit(name, data) {
    return (appEvents[name] || []).map(function(cb) {
      var result = cb(appState, appActions, data)
      if (result != null) {
        data = result
      }
    }), data
  }

  function merge(a, b) {
    var obj = {}

    for (var i in a) {
      obj[i] = a[i]
    }

    for (var i in b) {
      obj[i] = b[i]
    }

    return obj
  }

  function getKey(node) {
    if (node && (node = node.data)) {
      return node.key
    }
  }

  function createElement(node, isSVG) {
    if (typeof node === "string") {
      var element = document.createTextNode(node)
    } else {
      var element = (isSVG = isSVG || node.tag === "svg")
        ? document.createElementNS("http://www.w3.org/2000/svg", node.tag)
        : document.createElement(node.tag)

      if (node.data && node.data.oncreate) {
        globalInvokeLaterStack.push(function() {
          node.data.oncreate(element)
        })
      }

      for (var i in node.data) {
        setData(element, i, node.data[i])
      }

      for (var i = 0; i < node.children.length; ) {
        element.appendChild(createElement(node.children[i++], isSVG))
      }
    }

    return element
  }

  function setData(element, name, value, oldValue) {
    if (name === "key") {
    } else if (name === "style") {
      for (var i in merge(oldValue, (value = value || {}))) {
        element.style[i] = value[i] || ""
      }
    } else {
      try {
        element[name] = value
      } catch (_) {}

      if (typeof value !== "function") {
        if (value) {
          element.setAttribute(name, value)
        } else {
          element.removeAttribute(name)
        }
      }
    }
  }

  function updateElement(element, oldData, data) {
    for (var i in merge(oldData, data)) {
      var value = data[i]
      var oldValue = i === "value" || i === "checked" ? element[i] : oldData[i]

      if (value !== oldValue) {
        setData(element, i, value, oldValue)
      }
    }

    if (data && data.onupdate) {
      globalInvokeLaterStack.push(function() {
        data.onupdate(element, oldData)
      })
    }
  }

  function removeElement(parent, element, data) {
    if (data && data.onremove) {
      data.onremove(element)
    } else {
      parent.removeChild(element)
    }
  }

  function patch(parent, element, oldNode, node, isSVG, nextSibling) {
    if (oldNode == null) {
      element = parent.insertBefore(createElement(node, isSVG), element)
    } else if (node.tag != null && node.tag === oldNode.tag) {
      updateElement(element, oldNode.data, node.data)

      isSVG = isSVG || node.tag === "svg"

      var len = node.children.length
      var oldLen = oldNode.children.length
      var oldKeyed = {}
      var oldElements = []
      var keyed = {}

      for (var i = 0; i < oldLen; i++) {
        var oldElement = (oldElements[i] = element.childNodes[i])
        var oldChild = oldNode.children[i]
        var oldKey = getKey(oldChild)

        if (null != oldKey) {
          oldKeyed[oldKey] = [oldElement, oldChild]
        }
      }

      var i = 0
      var j = 0

      while (j < len) {
        var oldElement = oldElements[i]
        var oldChild = oldNode.children[i]
        var newChild = node.children[j]

        var oldKey = getKey(oldChild)
        if (keyed[oldKey]) {
          i++
          continue
        }

        var newKey = getKey(newChild)

        var keyedNode = oldKeyed[newKey] || []

        if (null == newKey) {
          if (null == oldKey) {
            patch(element, oldElement, oldChild, newChild, isSVG)
            j++
          }
          i++
        } else {
          if (oldKey === newKey) {
            patch(element, keyedNode[0], keyedNode[1], newChild, isSVG)
            i++
          } else if (keyedNode[0]) {
            element.insertBefore(keyedNode[0], oldElement)
            patch(element, keyedNode[0], keyedNode[1], newChild, isSVG)
          } else {
            patch(element, oldElement, null, newChild, isSVG)
          }

          j++
          keyed[newKey] = newChild
        }
      }

      while (i < oldLen) {
        var oldChild = oldNode.children[i]
        var oldKey = getKey(oldChild)
        if (null == oldKey) {
          removeElement(element, oldElements[i], oldChild.data)
        }
        i++
      }

      for (var i in oldKeyed) {
        var keyedNode = oldKeyed[i]
        var reusableNode = keyedNode[1]
        if (!keyed[reusableNode.data.key]) {
          removeElement(element, keyedNode[0], reusableNode.data)
        }
      }
    } else if (element && node !== element.nodeValue) {
      element = parent.insertBefore(
        createElement(node, isSVG),
        (nextSibling = element)
      )
      removeElement(parent, nextSibling, oldNode.data)
    }

    return element
  }
}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var core = __webpack_require__(3);
var defaults = __webpack_require__(24);

module.exports = {
    init: function init(egnyteDomainURL, opts) {
        //TODO: plug in httpRequest depending on env
        var instance = core.instance(Object.assign({ httpRequest: __webpack_require__(25) }, defaults, opts));
        instance.setDomain(egnyteDomainURL);
        return instance;
    }
};

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    handleQuota: true,
    QPS: 2
};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var window = __webpack_require__(26)
var once = __webpack_require__(28)
var parseHeaders = __webpack_require__(29)



module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest


function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function createXHR(options, callback) {
    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    if (typeof options === "string") {
        options = { uri: options }
    }

    options = options || {}
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)))

/***/ }),
/* 27 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var trim = __webpack_require__(30)
  , forEach = __webpack_require__(31)
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}

/***/ }),
/* 30 */
/***/ (function(module, exports) {


exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(32)

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};


/***/ })
/******/ ]);
});
//# sourceMappingURL=egnyte.js.map