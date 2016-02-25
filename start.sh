#!/bin/bash

wget --header="Cookie: PHPSESSID=mn7hjl5l99vnmpkilb9p5sskf0; verf=3acc5731d3fa5a7a40a83fba3d20cc8f" -O temp.mp3 https://fluff.world/song_download.php
node app.js --useBashScript