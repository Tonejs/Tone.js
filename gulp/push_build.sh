#!/bin/bash

TMP_DIR=$(pwd)/tmp
mkdir $TMP_DIR

TONE_DIR=$(pwd)/..

BUILD_DIR=$TMP_DIR/build

# clone the build repo
if [ "$TRAVIS" = "true" ]; then
	GITHUB_USER=${GH_TOKEN}@
fi

git clone https://${GITHUB_USER}github.com/Tonejs/build $BUILD_DIR > /dev/null 2>&1
cd $BUILD_DIR
git checkout gh-pages

# generate a new build
gulp build


# push to the appropriate location
if [ "$TRAVIS" = "true" ]; then


	if [ "$TRAVIS_BRANCH" = "dev" ]; then

		# dev builds go into the dev folder
		cp -a $TONE_DIR/build/. $BUILD_DIR/dev/

	elif [ "$TRAVIS_BRANCH" = "master" ]; then

		# master builds are on the root level folder
		cp -a $TONE_DIR/build/. $BUILD_DIR/

		# and also in a folder with the version name
		VERSION=$(node $TONE_DIR/gulp/version.js $TONE_DIR)
		mkdir $BUILD_DIR/$VERSION
		cp -a $TONE_DIR/build/. $BUILD_DIR/$VERSION

	fi

fi

# push the build
git add .
git commit -m "build #$TRAVIS_BUILD_NUMBER: $TRAVIS_COMMIT_MESSAGE"
git push -f

rm -rf $TMP_DIR
