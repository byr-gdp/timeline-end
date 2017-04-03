
'use strict';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import Idea from './models/idea';
import UserInfo from './models/user';

const app = express();
var corsOptions = {
  origin: 'timeline.52byr.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
}

// TODO: 数据库配置写入配置文件
// 测试环境
mongoose.connect('mongodb://127.0.0.1/test-timeline');
// mongoose.connect('mongodb://127.0.0.1/work-timeline');

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(session({
  secret: 'beAWellSwimmingFish', // 建议使用 128 个字符的随机字符串
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  },
  name: 'swimmingFish',
}));

const router = express.Router();

// 登录，set-cookie
router.post('/login', (req, res) => {
  const body = req.body;

  if (typeof body.name !== 'undefined' && typeof body.password !== 'undefined') {
    if (body.name === UserInfo.name && body.password === UserInfo.password) {
      req.session.isValid = true;
      res.json({
        msg: '登录成功',
        code: 200,
      });
    } else {
      req.session.isValid = false;
      res.json({
        msg: '帐号或密码错误',
        code: 400,
      });
    }
  }
});

// 登出，登录状态无效
router.post('/logout', (req, res) => {
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
router.post('/ideas', (req, res) => {
  const body = req.body;

  if (!req.session.isValid) {
    res.json({
      msg: '请先登录',
      code: 400,
    });
    return;
  }

  if (typeof body.content !== 'undefined' && typeof body.author !== 'undefined') {
    const idea = new Idea({
      content: body.content,
      author: body.author,
      appendList: []
    });

    // TODO: 发布失败错误码
    idea.save((err) => {
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
router.get('/ideas', (req, res) => {
  const query = req.query;
  const userInfo = {
    author: UserInfo.name,
    isLogin: !!req.session.isValid,
  };

  if (typeof query.pageNo !== 'undefined' && typeof query.pageSize !== 'undefined') {
    Idea.find()
      .sort({'createTime': -1})
      .limit(query.pageSize)
      .skip((parseInt(query.pageNo) - 1) * query.pageSize)
      .exec((err, ideas) => {
        if (!err) {
          res.json({
            code: 200,
            data: {
              list: ideas,
              userInfo: userInfo,
            }
          });
        }
    });
  }
});

// 发表附言
router.post('/idea/:idea_id', (req, res) => {
  if (!req.session.isValid) {
    res.json({
      msg: '请先登录',
      code: 400,
    });
    return;
  }

  const ideaId = req.params.idea_id;
  const body = req.body;

  if (typeof ideaId !== 'undefiend') {
    Idea.findOne({ _id: ideaId }).exec((err, idea) => {
      if (!err) {
        const appendList = idea.appendList.concat({
          content: body.content,
          author: body.author,
          createTime: new Date(),
        });

        Idea.update({ _id: ideaId }, { appendList: appendList}, (err, raw) => {
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
app.listen(8084, () => {
  console.log('listening on port 8084');
});
