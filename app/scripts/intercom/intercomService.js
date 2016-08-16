(function () {
    'use strict';
    var intercom = require('intercom-client');
    var unirest = require('unirest');
    var bluebird = require('bluebird');
    var fs = require('fs');

    var self = this;

    angular.module('app')
        .service('intercomService', ['$q', 'config', IntercomService]);
    
    function IntercomService($q, config) {
        var self;
        var client = new intercom.Client(config.appId, config.appKey).usePromises();
        return {
            getUsers: getUsers,
            getEvents: getEvents,
            writeEvents: writeEvents,
            /* intercom-client extension dependencies */
            promiseProxy: promiseProxy,
            callback: callback,
            get: get,
            nextPage: nextPage
            /* end intercom-client dependencies */
        };

        function getUsers(progressCallback) {
            var readPage = function(response) {
                users = users.concat(response.body.users);
                progressCallback(users);
                if(response.body.pages.next) {
                    client.nextPage(response.body.pages).then(readPage);
                } else {
                    deferred.resolve(users);
                }
            }
            var deferred = $q.defer();
            var users = [];
            client.users.list().then(readPage);
            return deferred.promise;
        }

        function getEvents(users, updateProgress, updateError) {
            var handleError = function(error) {
                console.error("Failed with " + (userIndex-1) + " with error: \r\n" + error)
                updateError(userIndex);
                writeEvents(events);
                if(userIndex < users.length) {
               	    get('/events', {type: 'user', user_id: users[userIndex++].user_id}).then(readPage, handleError);
                } else {
                    deferred.resolve(events);
                }
            }
            var readPage = function(response) {
                var page = response.body.pages.next ? response.body.pages.next : "-";
                events = events.concat(response.body.events);
                if(response.body.pages.next) {
                    client.nextPage(response.body.pages).then(readPage, handleError);
                    updateProgress(events);
                } else if (userIndex < users.length) {
                    writeEvents(events);
                    get('/events', {type: 'user', user_id: users[userIndex++].user_id}).then(readPage, handleError);
                    updateProgress(events);
                } else {
                    deferred.resolve(events);
                }
            }
            var deferred = $q.defer();
            var userIndex = 0;
            var events = [];
            self = this;
            get('/events', {type: 'user', user_id: users[userIndex++].user_id}).then(readPage, handleError);
            return deferred.promise;
        }

        function writeEvents(events) {
            var monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
            ];

            var file = fs.createWriteStream('events.csv');
            file.on('error', function (err) { console.error(err) });
            events.forEach(function (event) { 
                var date = new Date(event.created_at * 1000);
                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();
                var datetext = date.toTimeString();
                datetext = datetext.split(' ')[0]

                file.write(datetext + ' ' + day + '/' + monthNames[monthIndex] + '/' + year + ',' + event.event_name + '\r\n'); 
            });
            file.end();
        }

/* intercom-client dependencies */
        function callback (f, data) {
            if (!f) {
                return;
            }
            if (f.length >= 2) {
                const hasErrors = data.error || (data.body && data.body.type === 'error.list');
                if (hasErrors) {
                    f(data, null);
                } else {
                    f(null, data);
                }
            } else {
                f(data);
            }
        }

        function promiseProxy (f, req) {
            const callbackHandler = self.callback;
            return new bluebird(function (resolve, reject) {
                const resolver = function (err, data) {
                    if (err) {
                        reject(new Error(JSON.stringify(err)));
                    } else {
                        resolve(data);
                    }
                };
                req.end(function (r) { callbackHandler(resolver, r) });
            });
        }

        function get (endpoint, data, f) {
            return self.promiseProxy(f,
                unirest.get(`https://api.intercom.io${endpoint}`)
                    .auth(config.appId, config.appKey)
                    .type('json')
                    .query(data)
                    .header('Accept', 'application/json')
                    .header('User-Agent', 'intercom-node-client/2.0.0')
            );
        }

        function nextPage (paginationObject, f) {
            return self.promiseProxy(f,
                unirest.get(paginationObject.next)
                    .auth(config.appId, config.appKey)
                    .type('json')
                    .header('Accept', 'application/json')
                    .header('User-Agent', 'intercom-node-client/2.0.0')
            );
        }
/* end intercom-client dependencies */
    }
})();