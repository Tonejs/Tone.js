#!/bin/bash

if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then

	# only commit the builds when not a PR
	# gulp commitDevBuild

	# commit the build
	bash push_build.sh

fi

# do coveralls either way
gulp coveralls
