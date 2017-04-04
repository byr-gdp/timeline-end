'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _idea = require('./models/idea');

var _idea2 = _interopRequireDefault(_idea);

var _user = require('./models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var corsOptions = {
  origin: 'timeline.52byr.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
};

// TODO: 数据库配置写入配置文件
if (process.env.NODE_ENV === 'production') {
  _mongoose2.default.connect('mongodb://127.0.0.1/work-timeline');
} else {
  _mongoose2.default.connect('mongodb://127.0.0.1/test-timeline');
}

app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());
app.use((0, _cors2.default)(corsOptions));
app.use((0, _expressSession2.default)({
  secret: 'beAWellSwimmingFish', // 建议使用 128 个字符的随机字符串
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 小时
    httpOnly: true
  },
  name: 'swimmingFish'
}));

var router = _express2.default.Router();

// 登录，set-cookie
router.post('/login', function (req, res) {
  var body = req.body;

  if (typeof body.name !== 'undefined' && typeof body.password !== 'undefined') {
    if (body.name === _user2.default.name && body.password === _user2.default.password) {
      req.session.isValid = true;
      res.json({
        msg: '登录成功',
        code: 200
      });
    } else {
      req.session.isValid = false;
      res.json({
        msg: '帐号或密码错误',
        code: 400
      });
    }
  }
});

// 登出，登录状态无效
router.post('/logout', function (req, res) {
  if (req.session.isValid) {
    req.session.isValid = false;
    res.json({
      msg: '退出登录成功',
      code: 200
    });
  } else {
    res.json({
      msg: '尚未登录',
      code: 400
    });
  }
});

// 新建一个 idea
router.post('/ideas', function (req, res) {
  var body = req.body;

  if (!req.session.isValid) {
    res.json({
      msg: '请先登录',
      code: 400
    });
    return;
  }

  if (typeof body.content !== 'undefined' && typeof body.author !== 'undefined') {
    var idea = new _idea2.default({
      content: body.content,
      author: body.author,
      appendList: []
    });

    // TODO: 发布失败错误码
    idea.save(function (err) {
      if (!err) {
        res.json({
          msg: '发布成功',
          code: 200
        });
      } else {
        res.json({
          msg: '发布失败',
          code: 200
        });
      }
    });
  }
});

// 获取 idea 列表
router.get('/ideas', function (req, res) {
  var query = req.query;
  var userInfo = {
    author: _user2.default.name,
    isLogin: !!req.session.isValid
  };

  if (typeof query.pageNo !== 'undefined' && typeof query.pageSize !== 'undefined') {
    _idea2.default.find().sort({ 'createTime': -1 }).limit(query.pageSize).skip((parseInt(query.pageNo) - 1) * query.pageSize).exec(function (err, ideas) {
      if (!err) {
        res.json({
          code: 200,
          data: {
            list: ideas,
            userInfo: userInfo
          }
        });
      }
    });
  }
});

// 发表附言
router.post('/idea/:idea_id', function (req, res) {
  if (!req.session.isValid) {
    res.json({
      msg: '请先登录',
      code: 400
    });
    return;
  }

  var ideaId = req.params.idea_id;
  var body = req.body;

  if (typeof ideaId !== 'undefiend') {
    _idea2.default.findOne({ _id: ideaId }).exec(function (err, idea) {
      if (!err) {
        var appendList = idea.appendList.concat({
          content: body.content,
          author: body.author,
          createTime: new Date()
        });

        _idea2.default.update({ _id: ideaId }, { appendList: appendList }, function (err, raw) {
          if (!err) {
            res.json({
              code: 200,
              msg: '添加附言成功',
              data: raw
            });
          }
        });
      }
    });
  }
});

app.use('/api', router);
app.listen(8084, function () {
  console.log('listening on port 8084');
});