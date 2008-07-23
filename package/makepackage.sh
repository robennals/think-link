#!/usr/bin/bash

pushd ../firefox_plugin/chrome
zip -r thinklink.jar content skin
popd
mv ../firefox_plugin/chrome/thinklink.jar chrome/
rm thinklink.xpi
zip -r thinklink.xpi chrome chrome.manifest defaults install.rdf

