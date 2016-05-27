'use strict';
const path = require('path');

global.assert = require('assert');
global.basePath = path.join.bind(path, __dirname, '..');
