#!/bin/bash
pm2 stop 'timeline-end'
NODE_ENV=production pm2 restart index.js --name 'timeline-end'
