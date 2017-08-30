#!/bin/bash

TMP_DIR=$(pwd)/tmp
mkdir $TMP_DIR

TONE_DIR=$(pwd)/..

BUILD_DIR=$TMP_DIR/build

echo tone dir: $TONE_DIR
echo build dir: $BUILD_DIR

# clone the build repo
if [ "$TRAVIS" = "true" ]; then
	GITHUB_USER=${GH_TOKEN}@
fi

git clone https://${GITHUB_USER}github.com/Tonejs/build $BUILD_DIR > /dev/null 2>&1
cd $BUILD_DIR
git checkout gh-pages

echo travis branch: $TRAVIS_BRANCH

# generate a new build
# gulp build

# push to the appropriate location
if [ "$TRAVIS" = "true" ]; then


	if [ "$TRAVIS_BRANCH" = "dev" ]; then

		# dev builds go into the dev folder
		mkdir $BUILD_DIR/test/
		cp -r $TONE_DIR/build/ $BUILD_DIR/test/

	elif [ "$TRAVIS_BRANCH" = "master" ]; then

		# master builds are on the root level folder
		cp -r $TONE_DIR/build/ $BUILD_DIR/

	fi

fi

# push the build
git add .
git commit -m 'build ${TRAVIS_BUILD_NUMBER}'
git push -f

rm -rf $TMP_DIR
