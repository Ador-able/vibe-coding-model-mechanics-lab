# 模型机制观察室

包含六个独立页面：

| 页面 | 地址 | 观察内容 |
| --- | --- | --- |
| 分词观察室 | `http://127.0.0.1:4319/` | 官方分词器的 token、编号、字节和完整解码 |
| 向量观察室 | `http://127.0.0.1:4319/vectors.html` | 用人工数字演示编号查表、方向、长度与三种比较指标 |
| 生成观察室 | `http://127.0.0.1:4319/generation.html` | 用人工候选得分演示逐步选择 token、追加上下文和停止 |
| 注意力观察室 | `http://127.0.0.1:4319/attention.html` | 用人工 Q、K、V 观察注意力权重与加权汇总 |
| 采样观察室 | `http://127.0.0.1:4319/sampling.html` | 对比温度、top-p 与固定前缀的100次本地抽样 |

## 分词观察

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

## 向量观察

打开 `/vectors.html`，输入序列 `[2, 0, 2]` 会从人工 embedding 表依次取出第 2、0、2 行。三个维度仅为教学数字，没有赋予情绪、颜色等含义。

下方换用二维人工向量，固定 A = (1, 1)。选择预设或拖动 B 的坐标，观察方向、长度、余弦相似度、内积和欧氏距离。图中箭头从原点出发，虚线连接两个端点。

零向量没有方向，其余弦相似度显示“未定义”；内积和距离仍可计算。显示值保留最多三位小数，计算使用原值。这些数值不代表真实模型的语义或检索效果。

本课起点 `vcm-02-02-start` 就是上一课的完成版，只包含分词页。完成版 `vcm-02-02-end` 增加向量页，两种页面可独立使用。可从完成版建立自己的实验分支：

```powershell
git switch -c my-vector-lab vcm-02-02-end
pnpm install --frozen-lockfile
pnpm dev
```

需要重新开始时，先在自己的分支保留实验，再新建一条分支。原分支仍保存之前的修改：

```powershell
git add .
git commit -m "保存我的向量实验"
git switch -c my-vector-lab-retry vcm-02-02-end
pnpm install --frozen-lockfile
pnpm dev
```

用 `pnpm exec tsx scripts/record-vectors.ts` 重新生成 `evidence/向量实验结果.json`；它保存实际计算值，余弦未定义时记录为 `null`。无需下载权重或配置密钥。

## 逐步生成观察

打开 `/generation.html`，从“早餐喝”开始，每次只选择一个教学 token。页面列出本步人工候选的得分与实际 softmax 计算概率，并保留选择前的上下文和候选记录。

主要按钮每次选择最高概率，并列时取表中靠前的一项。候选行的“手动选它”用于比较分支，不等于模型随机采样。所有词表、得分和上下文转移均为人工设置，不是真实模型内部记录，没有运行模型推理，也无需密钥。

连续选择最高概率，会得到“豆浆 → 。 → <EOS>”。手动选择“咖啡 → ， → 配面包 → ， → 配包子 → ，”，可以观察达到 6 个生成 token 上限后的截断。上限包括结束标记，不包括最初的“早餐喝”；选到 `<EOS>` 视为序列结束，它不拼进普通输出文字。句号后只生成结束标记是本页的教学规则。

起点 `vcm-02-03-start` 是上一课的完成版，包含分词与向量页。完成点 `vcm-02-03-end` 增加生成页。建立自己的练习分支：

```powershell
git switch -c my-generation-lab vcm-02-03-end
pnpm install --frozen-lockfile
pnpm dev
```

恢复前先保留实验，再从完成点创建另一条分支：

```powershell
git add .
git commit -m "保存我的逐步生成实验"
git switch -c my-generation-lab-retry vcm-02-03-end
pnpm install --frozen-lockfile
pnpm dev
```

用 `pnpm exec tsx scripts/record-generation.ts` 重新生成 `evidence/生成实验结果.json`，其中保存未舍入的概率、每步候选、所选 token 与停止原因。

## 注意力观察

打开 `/attention.html`。主图显示三个位置的注意力权重、各自的加权贡献和最终输出。可以切换 Q，也可以只改变 C 的 V；逐项计算在下方折叠区。

这里使用人工二维 Q、K、V，位置 A、B、C 不对应具体词语，维度没有固定语义。程序真实计算 `softmax(Q Kᵀ / √2) V`，没有运行模型推理，不加载权重，不需要密钥。这个单查询实验只观察三个位置之间的加权汇总，不展示完整 Transformer。

起点 `vcm-02-04-start` 是上一课完成版。完成点 `vcm-02-04-end` 增加独立注意力页；从完成点建立自己的分支后运行：

```powershell
git switch -c my-attention-lab vcm-02-04-end
pnpm install --frozen-lockfile
pnpm dev
```

重来前先保留当前实验，再从完成点新建分支：

```powershell
git add .
git commit -m "保存我的注意力实验"
git switch -c my-attention-lab-retry vcm-02-04-end
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm exec tsx scripts/record-attention.ts` 可重新生成 `evidence/注意力实验结果.json`，保存未舍入的得分、权重、加权贡献与输出。计算公式对应 [Attention Is All You Need 第 3.2.1 节](https://arxiv.org/html/1706.03762v7#S3.SS2.SSS1)。

## 采样观察

打开 `/sampling.html`，复用“早餐喝”的人工初始得分：豆浆 2、咖啡 1、茶 0。对照温度 0.5/1/2 的分布，再选择 top-p 1/0.8/0.5，观察概率排序、累计阈值与重归一化。top-p 保留达到阈值的最小前缀，包含跨过阈值的一项；top-p=1 保留全部候选。

“运行100次抽样”每次都从同一固定分布有放回抽取一个 token，不是生成连续100个 token。默认 T=1、top-p=0.8、种子2026；参数或种子变化后旧结果清空。32位线性同余伪随机算法只用于本页复现，同一种子不保证任何云端模型结果相同。人工概率不是任务正确率；这里没有训练、推理能力或真实 API 调用，也不需要密钥。

本课起点 `vcm-02-06-start-r2` 是注意力观察室的完成版；完成点 `vcm-02-06-end-r3` 增加采样页。按项目既有 Node.js/pnpm 版本启动独立分支：

```powershell
git switch -c my-sampling-lab vcm-02-06-end-r3
pnpm install --frozen-lockfile
pnpm dev
```

恢复前保存实验，再从完成点建立新分支：

```powershell
git add .
git commit -m "保存我的采样实验"
git switch -c my-sampling-lab-retry vcm-02-06-end-r3
pnpm install --frozen-lockfile
pnpm dev
```

执行 `pnpm exec tsx scripts/record-sampling.ts` 可重新生成 `evidence/采样实验结果.json`，包含温度对照、top-p=0.8 的候选与两组种子下逐次抽样的真实结果。
