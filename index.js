'use strict';

var jsonPersistence = function(fileName, injectedFileSystem) {
    var fs = injectedFileSystem || require('fs');

    var module = {};

    module.init         = init;
    module.add          = add;
    module.addRange     = addRange;
    module.getAll       = getAll;
    module.query        = query;
    module.update       = update;
    module.remove       = remove;
    module.checkIfEmpty = checkIfEmpty;

    function init(callback) {
        fs.exists(fileName, function(exists) {
            if (!exists) {
                _initializeJsonFile(function(error) {
                    callback(error);
                });
            } else {
                var error = new Error('File already exists');
                callback(error);
            }
        });
    }

    function _initializeJsonFile(callback) {
        fs.writeFile(fileName, JSON.stringify([]), function(error) {
            callback(error);
        });
    }

    function getAll(callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error, null);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());
                callback(null, parsedData);
            }
        });
    }

    function add(data, callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());
                parsedData.push(data);

                fs.writeFile(fileName, JSON.stringify(parsedData), function(error) {
                    callback(error);
                });
            }
        });
    }

    function addRange(data, callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());

                var bulkData = parsedData.concat(data);

                fs.writeFile(fileName, JSON.stringify(bulkData), function(error) {
                    callback(error);
                });
            }
        });
    }

    function query(filteringFunction, callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error, null);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());

                var filteredData = [];

                parsedData.forEach(function(element) {
                    if (filteringFunction(element)) {
                        filteredData.push(element);
                    }
                });

                callback(null, filteredData);
            }
        });
    }

    function update(filteringFunction, updatingFunction, callback, noItemsCallback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());
                var elementsUpdated = 0;

                parsedData.forEach(function(element) {
                    if (filteringFunction(element)) {
                        updatingFunction(element);
                        elementsUpdated++;
                    }
                });

                if (elementsUpdated === 0) {
                    noItemsCallback(new Error('No items found'));
                    return;
                }

                fs.writeFile(fileName, JSON.stringify(parsedData), function(error) {
                    callback(error);
                });
            }
        });
    }

    function remove(filteringFunction, callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());

                var filteredData = [];

                parsedData.forEach(function(element) {
                    if (!filteringFunction(element)) {
                        filteredData.push(element);
                    }
                });

                fs.writeFile(fileName, JSON.stringify(filteredData), function(error) {
                    callback(error);
                });
            }
        });
    }

    function checkIfEmpty(callback) {
        fs.readFile(fileName, function(error, dataChunk) {
            if (error) {
                callback(error, null);
            } else {
                var parsedData = JSON.parse(dataChunk.toString());
                if (parsedData.length === 0) {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }
        });
    }

    return module;
};

module.exports = jsonPersistence;