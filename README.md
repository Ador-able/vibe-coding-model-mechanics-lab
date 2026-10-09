# 模型机制观察室

本地观察分词、向量、逐 token 生成、注意力和采样。分词使用随仓库提供的公开分词器，其余数值由人工设定，用于理解机制。所有页面都不调用模型，不需要密钥。

沿用课程首次准备的 Node.js。Windows 双击“启动实验.cmd”，无需安装项目依赖；保持窗口打开，从浏览器切换各页面即可。停止服务时在窗口按 Ctrl+C。其他系统在本目录运行 node serve.mjs。

| 页面 | 地址 |
| --- | --- |
| 分词 | http://127.0.0.1:4319/ |
| 向量 | http://127.0.0.1:4319/vectors.html |
| 逐步生成 | http://127.0.0.1:4319/generation.html |
| 注意力 | http://127.0.0.1:4319/attention.html |
| 采样 | http://127.0.0.1:4319/sampling.html |

各页操作与当前页面记录彼此独立，刷新会重新开始。源码改动要重来时，先在自己的分支提交改动，再从对应课程节点建立新练习分支。

## 分词范围

公开分词器的版本和许可保存在 public/tokenizers/manifest.json。本实验不自动添加特殊 token，不套用聊天模板；文本中的特殊 token 字符串仍可能被识别。Qwen 分词器包含 NFC 规范化，因此完整解码可能与输入的 Unicode 码点序列不同。这里的计数不代表在线聊天服务的整次请求用量。

## 修改源码

只运行课堂实验时使用随仓库的 dist 和 serve.mjs。需要修改源码时，按 package.json 的工具准备：首次 pnpm install --frozen-lockfile，开发运行 pnpm dev，修改后用 pnpm build 更新 dist。

## Git 节点

从 [GitHub 仓库](https://github.com/Ador-able/vibe-coding-model-mechanics-lab) 获取代码。日常运行使用 main；课程的 vcm-02-…-start 与 end 标签保留各节源码节点。修改源码前建立自己的练习分支。恢复时先提交当前改动，再从本节指定节点建立新分支；切换源码后让编码助手按当前 README 更新构建。
