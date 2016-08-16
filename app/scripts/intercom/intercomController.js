(function () {
    'use strict';
    angular.module('app')
        .controller('intercomController', ['intercomService', '$q', '$mdDialog', '$timeout', IntercomController]);
    
    function IntercomController(intercomService, $q, $mdDialog, $timeout) {
        var self = this;


        self.selected = null;
        self.loading = true;
        self.users = [];
        self.events = [];
        self.updateTrackerStatus = updateTrackerStatus;
        self.status = "Initializing";
        self.userStatus = "";
        self.eventStatus = "";
        self.errorMessage = "";
        self.eventTrackers = [{name:"studio-button-add", count: 0, index: 0},
            {name:"studio-button-select", count: 0, index: 0},
            {name:"studio-button-share", count: 0, index: 0}
        ];
        self.addEvent = "";
        self.createEventTracker = createEventTracker;
        self.removeTracker = removeTracker;
        
        // Load initial data
        getAllUsers();
        
        //----------------------
        // Internal functions 
        //----------------------
        
        function createEventTracker() {
            if(self.addEvent && self.addEvent.length > 0) {
                for(var i = 0; i < self.eventTrackers.length; i++) {
                    if(self.eventTrackers[i].name === self.addEvent) {
                        return;
                    }
                }
                self.eventTrackers.push({ name: self.addEvent, count: 0, index: 0});
                self.addEvent = "";
                self.updateTrackerStatus(self.events);
            }
        }

        function removeTracker(trackerIndex) {
            $timeout(function () {
                self.eventTrackers.splice(trackerIndex, 1);
            })
        }

        
        function updateTrackerStatus(events, fullScan) {
            self.events = events;
            for(var trackerIndex = 0; trackerIndex < self.eventTrackers.length; trackerIndex++) {
                if(fullScan) {
                    self.eventTrackers[trackerIndex].index = 0;
                    self.eventTrackers[trackerIndex].count = 0;
                }
                for(; self.eventTrackers[trackerIndex].index < self.events.length; self.eventTrackers[trackerIndex].index++) {
                    if(events[self.eventTrackers[trackerIndex].index].event_name === self.eventTrackers[trackerIndex].name) {
                        self.eventTrackers[trackerIndex].count++;
                    }
                }
            }
            $timeout(function() {
                if(self.loading) {
                    self.eventStatus = "Read " + events.length + " events so far";
                }
            });
        }

        function getAllEvents() {
            function updateError(errorUser) {
                $timeout(function() {
                    self.errorMessage = "Error reading user " + errorUser + " events. Continuing";
                });
            }
            self.status = "Getting events of users";
            intercomService.getEvents(self.users, self.updateTrackerStatus, updateError).then(function (events) {
                self.loading = false;
                self.events = events;
                self.eventStatus = "Finished reading " + events.length + " events";
                updateTrackerStatus(self.events, true);
                self.status = "Writing event file";
                intercomService.writeEvents(events);
                self.status = "Finished loading and wrote full event file";
            })
        }

        function getAllUsers() {
            function updateStatus(users) {
                $timeout(function() {
                    self.userStatus = "Read " + users.length + " users so far";
                });
            }
            self.status = "Getting users";
            intercomService.getUsers(updateStatus).then(function (users) {
                self.userStatus = "Finished reading " + users.length + " users";
                self.users = users;
                self.selected = users[0];
                getAllEvents();
            });
        }
    }

})();