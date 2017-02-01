'use strict';

var api = require('fwapi');
var client = require('au5ton-logger');
var fs = require('fs');

let listenCount = 0;
let listenLimit = 10; //Daily limit imposed by Fluff
let songLength = 1000;

let fileName = '';

const login = {
    user: process.argv[2],
    pass: process.argv[3]
};

if(process.argv[4] === '--downloadSong') {
    api.auth.authenticate(login.user, login.pass, function(status){
        if(status === 'success') {
            api.song.setCookie(api.auth.cookie);
            api.song.downloadSong({
                path: api.constants.APP_PREFS
            }, function(status) {
                if(status.status === 'success') {
                    fileName = api.song.lastDownloadedSong;
                }
            });
        }

    },true);
}
else {
    api.auth.authenticate(login.user, login.pass, function(status){
        if(status === 'success') {
            api.song.setCookie(api.auth.cookie);
            api.song.downloadSong({
                path: api.constants.APP_PREFS
            }, function(status) {
                if(status.status === 'success') {
                    fileName = api.song.lastDownloadedSong;

                    api.song.getSongLength(fileName, function(length) {
                        client.success('Song length is: ', length, 'ms');
                        songLength = length;
                        recur();
                    });

                }
            });
        }

    },true);
}

let recur = function() {
    client.log('Listening iteration: ',listenCount);
    api.song.startListening(function(){
        setTimeout(function(){
            client.log('    Song duration has passed!');
            client.log('    Attempting to redeem points');
            api.song.redeemPoints(function(status){
                listenCount++;
                if(listenCount < listenLimit) {
                    recur();
                }
            });
        },songLength+2000);
    });
};
