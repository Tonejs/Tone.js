#!/bin/bash

if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then

	gulp commitDevBuild

	gulp coveralls

	gulp commitJSDocs
		
fi