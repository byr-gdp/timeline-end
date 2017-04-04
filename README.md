# Timeline End

## Install

- `npm install` 安装依赖。
- 进程守护用到了 pm2，若未安装需要 `npm install -g pm2`。

## Deploy

- `npm run dev`：连接测试数据库，用于开发，会实时通过 Babel 转码并重启服务。
- `npm run prod`：连接正式数据库。

## TODO

- 区分正式和开发环境 √
- session 持久化（目前有效期24小时）√
