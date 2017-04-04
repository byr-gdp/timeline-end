#!/bin/bash
babel src -d lib
NODE_ENV=development node ./index.js
