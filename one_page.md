## 一、背景：关于 Alva
首先我粗浅地看了一下咱们的产品，在我理解中，Alva 的核心价值，是把机构级投资能力个人化。

它体现在两层：

第一层是金融基础设施的平权。
过去高质量数据源、量化分析工具、回测系统、自动化监控能力，主要属于机构投资者或有工程能力的专业交易者。Alva 把这些能力封装进自然语言工作流里，让普通/准专业投资者也能调用机构级工具，而不是只能看行情软件和碎片化资讯。

第二层是投研智能的平权。
Alva agent 不只是帮用户查信息，而是让用户拥有一个可定制的投研团队：它可以持续搜集信息、验证逻辑、跟踪持仓、识别异常、生成界面，并在关键变化发生时主动提醒。用户不再只是被动接收信息，而是可以把自己的投资判断系统化、自动化。

## 二、Playbook 和 Skill 的概念
Playbook 像是一个 live investing app：前端是用户可消费的投资界面，后端由持续更新的 feed、计算逻辑、调度和 alert 支撑。它的价值不是展示一次性分析，而是把一个投资任务变成可持续运行、可检查、可订阅的产品。

Skill 则像是一个“方法论 + 操作路由 + 约束 + 可选模板/代码”的包，用来让 agent 在一系列构建契约下，稳定地产出某类结果。

对我们这个 task 中的 portfolio-watch-skill 来说，定义会更窄一些：

  > 一个专门让 agent 从任意用户持仓输入出发，生成 Portfolio Watch Playbook 的 reusable capability，包括监控维度、信号排序、feed/playbook/alert 架构、UI 模板、alert contract 和验证 checklist。

## 三、作业的问题拆解
> **构建一个 Portfolio Watch Skill——让任何 Alva 用户都能用它生成一个高质量的 Portfolio Watch Playbook，带界面和 Alert。** 用户加载你的 Skill，说一句话——比如「盯下我的 NVDA、TSLA、AAPL，有大事提醒我」。从这样一句话出发，Skill 应该产出一个 Playbook： - **有界面**——用户点进来看到持仓在发生什么。盯哪些维度、什么算异动、什么是噪音、多个信号同时出现怎么排序，由你的 Skill 决定。 - **发 Alert**——连到 IM 软件（如 Telegram），关键变化推到手机；点开一条 Alert，能顺到界面里对应的内容。 关键在可复用：这个 Skill 要能对一个你从没见过的持仓生效，而不只是你测试用的那个例子。

### 尝试先理解用户的需求

用户说的是：
“keep an eye on my NVDA, TSLA, and AAPL, ping me when something big happens.”

用户并没有说“涨跌 5% 提醒我”，而是说 “something big”。这意味着用户期待系统替他判断：

- 什么值得看；
- 什么可以忽略；
- 什么时候需要打扰我；
- 为什么这件事重要。

所以这里的核心不是 ticker monitoring，而是 attention delegation。

### 回答：盯哪些维度、什么算异动、什么是噪音、多个信号同时出现怎么排序
我会把它的产品目标拆成四层：

- 发现变化
    - 价格、成交量、波动率、相对表现、新闻、财报、评级、期权、宏观、情绪等。
- 判断异常
    - 这个变化相对于自身历史、市场环境、行业同伴是否显著。
- 判断相关性
    - 这个变化对用户组合是否重要。大仓位的中等变化，可能比小仓位的大涨跌更重要。
- 决定是否打扰用户
    - 只有高优先级、可解释、非重复、可能影响判断的信号，才应该触发 Alert。


### 这里还有一个重要点：用户输入天然是不完整的。
他没有给权重、成本价、投资周期、风险偏好、alert 频率。但这不是问题，而是 Skill 应该处理的常态。好的 Skill 不应该卡住用户，而应该：

先用合理默认值跑起来；
明确标注假设；
允许用户之后补充或调整。

比如没有权重，就默认 equal-weight；没有成本价，就先不做盈亏维度；没有风险偏好，就用 moderate sensitivity。

## 四、Skill 实现思路
核心分三层。

第一层是 Skill 主入口轻量化。
我把 SKILL.md 控制在 70 多行，只放触发场景、默认值、硬约束和构建顺序。它不塞长公式、不塞大段产品解释，而是告诉 agent：遇到 watchlist /
holdings / ping me / alert me 时，应该先做 portfolio spec，再做 data contract，再做 UI 和 alert，最后 release 和验证。

第二层是 把 know-how 拆成 reference contracts。
这里是 Skill 真正的产品判断：

- portfolio-method.md：定义 attention triage，不是 ticker monitoring。用 abnormality、portfolio relevance、explainability、freshness、
novelty 判断重要性。

- data-contract.md：规定 feed 必须产出哪些东西，比如 portfolio/summary、watch/assets、signals/events、alerts/events、notify/message。
- ui-contract.md：规定 Playbook 必须是 signal-first，首屏回答“现在该看什么”，并有 Signal Queue、Signal Detail、Holdings Table、Alert
History。

- alert-contract.md：规定 high severity 才 push，medium/low 只进界面，quiet run 写 <|SKIP_NOTIFICATION|>，alert 必须 deep link 回对应
signal。

- build-checklist.md：把 Alva 的当前 CLI flow、feed/release/lint/screenshot/subscription/notification-history 验证串起来。

第三层是 把模板改成真正支持这个 contract。
原来的模板还是 NVDA/TSLA/AAPL proof case。我把它改成可参数化模板：

- feed-template.js 现在不是只算一个 watch score，而是生成 signals、alerts 和 notify sidecar。
- index-template.html 不再只是指标表和图表，而是 signal-first：组合状态、Signal Queue、Signal Detail、Holdings State、Alert History。
- readme-template.md 不再写死三个 ticker 和固定公式，而是一个每次生成 Playbook 时要填充的 methodology README。

我刻意没有把某个 scoring formula 写死成唯一答案。因为 Skill 交付的是生成能力，不是某个具体 Playbook。真正要写死的是：

- 数据必须从哪里来；
- 输出必须长什么样；
- UI 必须怎么组织；
- Alert 什么时候能发；
- release 前必须验证什么。

所以最后的结构是：

Skill = trigger/scope
    + defaults
    + methodology
    + data contract
    + UI contract
    + alert contract
    + validation gates
    + reusable templates