var fw = require('./fw');


var listenCount = 1;
var listenLimit = 9; //Daily limit imposed by Fluff
var songLength = 238192;
function recursive() {
    console.log('Listening iteration: '+listenCount);
    fw.startListening(function(){
        console.log('    Listening request done.');
        setTimeout(function(){
            console.log('    Song duration has passed!');
            console.log('    Attempting to redeem points');
            fw.redeemPoints(function(){
                listenCount++;
                if(listenCount <= listenLimit) {
                    recursive();
                }
            });
        },songLength+2000);
    });
}

if(process.argv[2] === '--downloadSong') {
    fw.authenticate(function() {
        console.log('Song download started.');
        fw.downloadSong(function(){
            console.log('Song downloaded');
        });
    });
}
else if(process.argv[2] === '--skipDownload'){
    fw.authenticate(function() {
        console.log('--skipDownload specified, song already downloaded.');
        fw.getSongLength(function(length) {
            songLength = length;
            console.log('Song length, in milliseconds: '+songLength);
            recursive();
        });
    });
}
else {
    fw.authenticate(function() {
        console.log('Song download started.');
        fw.downloadSong(function(){
            console.log('Song downloaded');
            fw.getSongLength(function(length) {
                songLength = length;
                console.log('Song length, in milliseconds: '+songLength);
                recursive();
            });
        });
    });
}
