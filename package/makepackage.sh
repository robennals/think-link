#!/bin/bash

pushd ../firefox_plugin/chrome
zip -r thinklink.jar content skin
popd
mv ../firefox_plugin/chrome/thinklink.jar chrome/
cp ../firefox_plugin/install.rdf .
rm thinklink.xpi
zip -r thinklink.xpi chrome chrome.manifest defaults install.rdf

