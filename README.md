## 包管理器：pnpm

- pnpm实现了PC依赖包的集中管理，类似于Java中的Maven。而npm把依赖包放到了项目级目录，包重复率高

## 切换内网镜像

- pnpm config set registry http://192.168.3.12/repository/npm/
此仓库为群组仓库，优化从我们内部私有仓库查找要安装的NPM包，私有仓库找不到，自动去淘宝、腾讯公网仓库下载并缓存在本地服务器，理论速度远远高于使用公网镜像仓库

## volar提示版本不一致的解决办法

- pnpm up --latest vue-tsc

## 项目初始化

```javascipt
  pnpm install
```

## 项目运行

```javascipt
  pnpm start
```

## 项目打包

```javascipt
  pnpm run build
```
## pnpm 清除项目历史缓存资源

```javascipt
  pnpm store prune
```

## 项目目录

```javascipt
├── public/
├── src/
   ├── assets/                     // 静态资源目录
   ├── common/                     // 常量目录
   ├── hooks/                      // 公用 hooks
   ├── layout/                     // 布局目录
   ├── components/                 // 公用组件目录
   ├── plugins/                    // 插件目录
   ├── router/                     // 路由配置目录
   ├── store/                      // 状态管理目录
   ├── views/                      // 页面组件目录
   ├── types/                      // ts 类型提示目录
   ├── utils/                      // 公用方法
   ├── App.vue
   ├── main.ts
   ├── tsconfig.json               // TypeScript 配置文件
   ├── vite.config.ts              // Vite 配置文件
   └── package.json
```
