var FW = {};

var constants = require('./constants'); //Not included in source control for security

var fs = require('fs');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var probe = require('node-ffprobe');



FW.authenticate = function(callback) {

    if(callback === undefined) {
        callback = function() {};
    }

    var err;

    console.log('Attempting to authenticate with cookie '+constants.cookie);

    var req = https.request({
        hostname: constants.host,
        path: '/home.php',
        method: 'GET',
        headers: {
            'Cookie': constants.cookie
        }
    }, function(res) {
        if(res.statusCode === 200) {
            console.log('✅ authenticate');
        }
        else {
            console.log('⚠️ authenticate');
            err = 'failed';
        }
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            callback(err);
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
};

var d = new Date();

FW.currentDate = (d.getMonth()+1)+'-'+d.getDate()+'-'+d.getFullYear();
FW.downloadedSong = 'SOTD-'+FW.currentDate+'.mp3';

FW.downloadSong = function(callback) {

    fs.mkdir('sotd', function(){
        var file = fs.createWriteStream('sotd/'+FW.downloadedSong);

        if(callback === undefined) {
            callback = function() {};
        }

        var err;

        var req = https.request({
            hostname: constants.host,
            path: '/song_download.php',
            method: 'GET',
            headers: {
                'Cookie': constants.cookie
            }
        }, function(res) {
            res.pipe(file);

            if(res.statusCode === 200) {
                console.log('✅ downloadSong');
            }
            else {
                console.log('⚠️ downloadSong');
                err = 'failed';
            }
            //console.log('STATUS: ' + res.statusCode);
            //console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.on('end', function() {
                callback(err);
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.end();
    });

};

FW.getSongLength = function(callback) {

    if(callback === undefined) {
        callback = function() {};
    }

    probe(__dirname+'/sotd/'+FW.downloadedSong, function(err, probeData) {
        if(err) throw err;
        callback(parseInt(probeData.streams[0]['duration'] * 1000));
    });

};

FW.startListening = function(callback) {

    if(callback === undefined) {
        callback = function() {};
    }

    var req = https.request({
        hostname: constants.host,
        path: '/song.php',
        method: 'GET',
        headers: {
            'Cookie': constants.cookie
        }
    }, function(res) {
        //res.setEncoding('utf8');
    });
    req.on('error', function(e) {
        console.log('    problem with request: ' + e.message);
    });
    req.end();
    console.log('    ✳️ startListening');
    callback();
};

FW.redeemPoints = function(callback) {

    if(callback === undefined) {
        callback = function() {};
    }

    var body = '';
    var error_text = 'Close window and listen again';

    var postData = querystring.stringify({
        'checktime': 'Redeem Points'
    });

    var req = https.request({
        hostname: constants.host,
        path: '/song.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'Cookie': constants.cookie
        }
    }, function(res) {
        //console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            body += chunk;
        });
        res.on('end', function() {
            if(body.indexOf(error_text) >= 0) {
                console.log('    ⚠️  redeemPoints');
            }
            else {
                console.log('    ✅ redeemPoints');
            }
            callback();
        })
    });

    req.on('error', function(e) {
        console.log('    problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
};


module.exports = FW;
