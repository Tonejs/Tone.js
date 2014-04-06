#remove the old build
rm ../Tone.js
#collect all of the deps
node collect.js
#r.js it
r.js -o build.js
#remove main.js
rm ../src/main.js
#delete the last two lines where the r.js put the require and define
sed -ie '$d' Tone.js 
sed -ie '$d' Tone.js 
#remove Tone.jse which sed just made for some reason
rm ./Tone.jse
#move tone to the top level
mv ./Tone.js ../