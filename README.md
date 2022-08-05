# @hoseaguo/deploy

利用[node-ssh](https://github.com/steelbrain/node-ssh.git)连接服务器，再把本地打包后的文件夹压缩上传到服务器，然后在服务器里解压，可以安装npm依赖，可以通过pm2配置文件来启动node项目。

## Installing
Using npm:

```bash
$ npm install @hoseaguo/deploy --save-dev
```

Using yarn:

```bash
$ yarn add @hoseaguo/deploy -D
```

## Example
```javascript 
import deploy from "@hoseaguo/deploy";

deploy({
  host: 'localhost',
  username: 'root',
  password: 'root'
});
```

## API

```typescript
import { Config } from "node-ssh";

interface Options extends Config {
  /* 本地打包路径 default: "./dist" */
  distPath?: string,
  /* 服务器部署路径 default: "/data/www/_test" */
  serverPath?: string,
  /* 是否安装npm包 default: false */
  installNpmPackage?: boolean,
  /* 打包文件名 default: "_dist.zip" */
  zipFileame?: string,
  /* 打包发送到服务器的目录，会清空服务器上文件夹的内容，可以配置清空排除 正则表达式 default: "node_modules|.*\.json"  */
  cleanExclude?: string,
  /* pm2配置文件路径，假设存在的话，会在部署最后一步，进行 `pm2 startOrReload pm2进程配置文件名`，来重启pm2 服务 default: "" 表示没有，不会启动pm2 */
  pm2ConfigFileName?: string,
}
```