#!/usr/bin/env bash

TMP_DIR=./tmp
mkdir $TMP_DIR

TONE_DIR=$(pwd)/../

BUILD_DIR=$TMP_DIR/build

# clone the build repo
if [[ "$TRAVIS" = "true" ]]; then
	GITHUB_USER=${GH_TOKEN}@
fi

git clone https://${GITHUB_USER}github.com/Tonejs/build $BUILD_DIR > /dev/null 2>&1
git checkout gh-pages

cd $TMP_DIR/build

# generate a new build
gulp build

# push to the appropriate location
if [[ "$TRAVIS" = "true" ]]; then
	if [[ "$TRAVIS_BRANCH" = "travis" ]]; then

		# dev builds go into the dev folder
		cp -rf $TONE_DIR/build/{Tone.js,Tone.min.js} $BUILD_DIR/dev/

	elif [[ "$TRAVIS_BRANCH" = "master" ]]; then

		# master builds are on the root level folder
		cp -rf $TONE_DIR/build/{Tone.js,Tone.min.js} $BUILD_DIR/

	fi
fi

# push the build
cd $BUILD_DIR

git add .
git commit -m 'build ${TRAVIS_BUILD_NUMBER}'
git push -f
