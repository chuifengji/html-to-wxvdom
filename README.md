# HtmlToJson
## tokenize
花了一天时间去看编译原理，并参考了html5parser和webkit htmlToken的思路，采用DFA实现了tokenize的部分。
为了使得状态机状态更简单，我去掉了对文档类型和注释的解析，这差不多为我省去了十来个状态，要知道，现在的状态机也只有10个状态。具体的可以看我给出的图。token类型也做了简化，仅有startTag、content、endTag三类。
## parser
loading...
