#!/bin/bash

TMP_DIR=$(pwd)/tmp/
mkdir $TMP_DIR
SITE_DIR=$TMP_DIR/Site

# clone the tonejs.github.io site
if [ "$TRAVIS" = "true" ]; then
	GITHUB_USER=${GH_TOKEN}@
fi

git clone https://${GITHUB_USER}github.com/Tonejs/tonejs.github.io $SITE_DIR > /dev/null 2>&1

cd $SITE_DIR
# run the update script
sh update.sh

rm -rf $TMP_DIR
