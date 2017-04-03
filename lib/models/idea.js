'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
var IdeaSchema = new Schema({
  content: String,
  author: String,
  updateTime: {
    type: Date,
    default: Date.now
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  appendList: {
    type: Array,
    default: []
  }
});

exports.default = _mongoose2.default.model('Idea', IdeaSchema);