# 分词观察室

输入文本，观察真实 token ID，再完整解码。只使用官方分词器配置，不加载模型权重，不调用模型 API，不需要密钥。分词在浏览器本地完成。

## 启动

Node.js 24.12.0、pnpm 11.20.0：

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://127.0.0.1:4319`。配置文件已随项目提供；依赖安装后可断网运行。

## 数据范围

分词使用 `@huggingface/tokenizers` 0.2.0。Qwen3-0.6B 与 DeepSeek-V3 的官方仓库版本、下载链接、许可及 SHA256 见 `public/tokenizers/manifest.json`，原始许可文件保存在各自目录，未修改分词器文件。

本实验不自动添加特殊 token，不套用聊天模板，不清理解码后的空格。文本中主动输入的特殊 token 字符串仍可能被词表识别。公开分词器的结果不代表在线服务的账单。

Qwen3 使用 NFC 规范化：组合字符可能在完整解码时呈现为预组合字符。页面会实际比较复原结果，不能把“完整解码”理解为永远逐码点相同。

## 验证

```powershell
pnpm check
pnpm test
pnpm build
pnpm preview
```

关键样本由 Python `tokenizers` 0.22.2 的 Rust 核心独立生成，正常运行和测试均不需要 Python。

## Git 存档

从 `vcm-02-01-start` 建立练习分支，可运行基础观察页：

```powershell
git switch -c my-token-lab vcm-02-01-start
```

需要重来时，先在自己的分支提交实验，再从标签创建另一条分支。已有实验仍留在原分支。切换后按锁文件安装依赖；Git 不恢复 `node_modules`、未提交文件或外部服务状态。
