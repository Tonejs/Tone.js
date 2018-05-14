#!/bin/bash

if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then

	# commit the build
	sh push_build.sh

	# update the site
	sh update_site.sh
fi
