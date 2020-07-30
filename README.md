# HtmlToJson

## 呵呵

花了一天时间去看编译原理，并参考了html5parser和webkit htmlToken的思路，采用DFA实现了tokenize的部分。
为了使得状态机状态更简单，我去掉了对文档类型和注释的解析，这差不多为我省去了十来个状态，要知道，现在的状态机也只有10个状态。具体的可以看我给出的图。token类型也做了简化，仅有startTag、text、endTag三类。tokenize之后依据微信小程序rich-text的VDOM格式进行parser输出

## How to use it?

npm i html-to-wxvdom

1. in vue or react

import parser from "html-to-wxvdom";

parser("html string")//get the following object type data

```
js 

[{"name":"p","attrs":{},"children":[{"type":"text","text":"怎么老是下雨啊我的天。"}]},
{"name":"p","attrs":{},"children":[
{"name":"img","attrs":{"src":"http://api/give-me-liberty-or-give-me-death.jpg","style":"max-width:100%;"},"children":[]},
{"name":"br","attrs":{},"children":[]}]
}]

```

2. in the node

`const wxParser = require("html-to-wxvdom")`
