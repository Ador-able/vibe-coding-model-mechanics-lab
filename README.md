# 分词观察室

输入文本，观察真实 token ID，再完整解码。只使用官方分词器配置，不加载模型权重，不调用模型 API，不需要密钥。分词在浏览器本地完成。

选择“对比两种分词器”，可查看同一文本的不同编号序列。token 数更少不代表模型更聪明，也不能直接推出在线服务更便宜。

色块下方为 token ID。字符跨越多个 token 时，色块会合并显示并标明数量；“查看 token ID 和字节”保留真实边界，不能独立解码的片段会直接注明。

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

从 `vcm-02-01-end` 建立练习分支，运行比较与字节观察版；`vcm-02-01-start` 是只显示编号和完整解码的基础版：

```powershell
git switch -c my-token-lab vcm-02-01-end
```

需要重来时，先在自己的分支提交实验，再从标签创建另一条分支。已有实验仍留在原分支。切换后按锁文件安装依赖；Git 不恢复 `node_modules`、未提交文件或外部服务状态。

```powershell
git add .
git commit -m "保存我的分词实验"
git switch -c my-token-lab-retry vcm-02-01-end
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm record` 可重新生成 `evidence/实际分词结果.json`，包含预设和中英文对照的真实分词、编号、字节及解码结果。
