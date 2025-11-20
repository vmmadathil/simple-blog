*Production hits, and everything falls apart at turn 15*
*11/17/2025*

I've learned that context management isn't a prompt engineering problem -- it's a systems engineering problem. Recently, more attention is being given to **context engineering** as a determinant of agent success. In this post, I'm exploring my recent learnings in context engineering and offering implementation patterns. 

## Contextual Erosion 

Context degradation follows predictable patterns that mirror how distributed systems fail under load. 

In the first few turns of any conversation, many agents operate in what I call the "honeymoon phase." The context is clean, containing just the system prompt, the user's query, and a tool call or two. The signal-to-noise ratio is essentially perfect and often why demos look magical.

But cracks start to show as conversations progress. Each tool call adds its output to the context. Each agent response builds on previous responses. Each user clarification references earlier misunderstandings. By turn five or six, your context has transformed from a carefully crafted prompt into something more akin to a conference call where everyone's talking over each other.

The degradation accelerates non-linearly. Tool outputs, in particular, can degrade context quickly. A simple database query might return a few rows, but those rows come wrapped in JSON structure, complete with metadata, timestamps, null fields, and formatting that's designed for human readability, not model comprehension. A tool that returns 10 rows of data might consume 2,000 tokens to communicate 100 tokens worth of actual information.

By turn ten, you're not fighting a context window limit -- c1you're fighting information entropy. The model can no longer distinguish signal from noise. It starts repeating questions it already asked. It forgets constraints mentioned just five turns ago. It suggests approaches that already failed. Users describe this as the AI "getting dumber" over time, but what's really happening is more subtle: the model's attention mechanism is drowning in irrelevance.

This degradation pattern is so consistent across different models and architectures that I've come to think of it as a fundamental law—the Second Law of Context Thermodynamics, if you will. Entropy in a conversation always increases unless you actively fight it.

## Three-Tier Pattern
The traditional approach to context management treats all information equally, stuffing everything into a single context window and hoping for the best. This is like trying to run a modern application using only CPU registers — theoretically possible, but inefficient in practice.

Instead, we need to think about context the way CPU designers think about memory hierarchy. Modern processors don't have just one type of memory; they have registers for immediate operations, multiple levels of cache for frequently accessed data, RAM for working sets, and disk for long-term storage. Each tier has different access patterns, different performance characteristics, and different costs.

The same principle applies to agent context. After extensive experimentation, I've found that long-running agents need (at least) three distinct tiers of memory, each serving a fundamentally different purpose.

The first tier is the agent's immediate attention space, or **working memory**. This should be tiny, perhaps 2,000 to 4,000 tokens at most. It contains only the current user request, the last couple of tool results (aggressively compressed), and any active error states. Think of this as your agent's "registers"—the information it needs for the current operation. The key insight here is that this tier must be ruthlessly curated. Every token must be scrutinized and earn its place.

The second tier -- **session cache** -- maintains conversational continuity without full fidelity. This tier, typically 10,000 to 20,000 tokens, contains summarized conversation history, key decisions that have been made, failed approaches to avoid repeating, and user preferences discovered during the conversation. This is your agent's RAM; quickly accessible but not immediate.

The third tier is the **persistent store** of the complete history. This is unlimited in size but expensive to access. Full tool outputs, complete conversation transcripts, and detailed interaction logs all live here. Your agent rarely needs this tier, but when it does—usually for dispute resolution or context recover. Having it available can be the difference between graceful recovery and complete failure.

New information enters at the working memory level. As it ages, it gets compressed and pushed to session cache. Eventually, it's archived to persistent store. But critically, information can flow backward too -- when the agent needs to reference something specific, it can pull it back from a lower tier.

This architecture fundamentally changes how you think about context. Instead of asking "how can I fit everything into the context window?", you ask "what's the minimum context needed for this specific turn?" 

| **Tier** | **Working Memory** | **Session Cache** | **Persistent Store** |
|----------|-------------------|------------------|---------------------|
| **Size** | 2-4K tokens | 10-20K tokens | Unlimited |
| **Contents** | • Current query<br>• Active task<br>• Recent tools<br>• Errors | • Summary<br>• Decisions<br>• Failed paths<br>• Preferences | • Full history<br>• All outputs<br>• Audit trail<br>• Checkpoints |
| **Eviction** | LRU | LFU | TTL |
| **Coverage** | 95% | 30% | 5% |
| **Latency** | 0ms | 10ms | 100ms |
| **Flow →** | Aging after 3-4 turns | Aging after 5-10 turns | Archive after 11+ turns |
| **← Flow** | Promotion on reference | Promotion on reference | Retrieval on demand |

## State Machines and the Prevention of Spiraling
There's a specific failure mode I see constantly in production agents: the retry spiral. The agent tries an approach, it fails, the agent forgets it tried that approach, and tries it again. And again. And again. Sometimes completely restarting the task and losing all progress. Users watch in frustration as their supposedly intelligent agent bangs its head against the same wall repeatedly.

The solution isn't better prompts or stronger models. The solution is explicit state tracking. Your agent needs to maintain a state machine that tracks what it's tried, what worked, what failed, and why.

This state machine serves multiple purposes. First, it prevents exact retry spirals by maintaining a registry of attempted tool calls. Before making any tool call, the agent checks: have I tried this exact call before? If yes, and it failed, don't retry. This simple check eliminates the most frustrating failure mode users experience.

But the state machine goes deeper than preventing exact retries. It needs to track patterns of failure. If the agent tried to query a database three different ways and all failed with permission errors, the pattern is clear: we don't have database access. The agent shouldn't try a fourth variant; it should try a completely different approach or ask the user for help.

The state machine also enables intelligent backtracking. When the agent gets stuck, instead of randomly trying new approaches, it can traverse back up the decision tree to the last point where it had options and try a different branch. This transforms agent behavior from random walk to systematic exploration.

Implementing this requires maintaining three key data structures. First, a canonical registry of all attempted actions, indexed by a hash of the tool name and parameters. Second, a pattern matcher that identifies similar attempts even when parameters differ slightly. Third, a decision tree that tracks the causal chain of actions and their outcomes. This also can be implemented through popular frameworks like [LangGraph](https://docs.langchain.com/oss/python/langgraph/graph-api).

The engineering complexity here is non-trivial, but the payoff is massive. Users stop seeing an agent that fumbles randomly and start seeing one that systematically explores solutions. The difference in perceived intelligence is striking, even though the underlying model hasn't changed.


## Token Budgeting: The Economics of Attention

One of the hardest lessons I've learned is that you need to treat tokens like a scarce resource with an explicit budget. The naive approach—first-come, first-served until you hit the limit—leads to catastrophic failures where critical information gets crowded out by verbose tool outputs.

Instead, implement a token economy with explicit allocations. System instructions might get 5% of your budget. The current turn gets 15%. Tool results get 25%. Conversation history gets 40%. Examples and documentation get the remaining 15%. These percentages aren't magic -- they'll vary based on your use case -- but having explicit allocations forces you to make intentional trade-offs.

If you notice tool outputs consistently overflowing their allocation while conversation history uses only half its budget, you can dynamically shift tokens from history to tools. But do this gradually as sudden rebalancing causes context thrashing where the agent loses coherence because the information landscape shifted too quickly.

This budget system also enables graceful degradation. When you're approaching token limits, you don't randomly truncate. Instead you systematically drop information in priority order. Examples go first. Then extended documentation. Then older conversation history. Then summarized tool outputs. The current task and recent errors never get dropped.

The implementation requires careful bookkeeping. You need to track not just token counts but also information value. Some tool outputs are critical; others are confirmatory. Some conversation history provides essential context; other parts are pleasantries. Building this value model requires analyzing real conversations to understand what information the agent actually references versus what it ignores.

## The Observable Universe of Context

You can't optimize what you can't measure, and context health is notoriously difficult to observe. Metrics like token count and context window utilization tell you almost nothing about whether your agent is maintaining coherence.

The metrics that actually matter are more subtle. Compression ratio trends tell you whether you're heading toward context collapse. If your compression ratio increases monotonically over a conversation, you're on a collision course with failure. Reference resolution rate -- how often the agent references information that's been compressed out -- indicates whether your compression is too aggressive. Retry loop frequency shows whether your state management is working.

But the most important metric is what I call context coherence score. This measures whether the agent's responses remain consistent with earlier context. Are we contradicting earlier decisions? Are we asking for information already provided? Are we suggesting approaches we've already rejected? These coherence failures are leading indicators of context collapse.

Building this observability requires instrumenting your context pipeline extensively. Every compression decision, every state transition, every budget allocation needs to emit metrics. This feels like overhead during development, but it's the only way to debug production failures.

The diagnostic pattern that emerges from this observability is surprisingly consistent. When an agent fails, check token budget exhaustion first. If the budget is fine, check tool output overflow. If that's fine, check compression settings. Only after eliminating these common causes should you start investigating more exotic failures.

## Conclusion

Great agent systems are not differentiated by model capabilities. The differentiation comes from the ability to maintain coherence over long, complex, tool-heavy interactions.

The teams that win will be those that treat context engineering as a first-class systems problem. They'll build sophisticated compression pipelines that preserve semantic meaning while dramatically reducing token count. They'll implement state machines that prevent failure loops and enable intelligent backtracking. They'll create observability systems that catch context degradation before users notice.

But most importantly, they'll recognize that perfect memory is impossible. The goal isn't to preserve everything, it's to preserve what matters and gracefully handle the loss of what doesn't. This requires making hard engineering trade-offs, building complex distributed systems, and deeply understanding how information flows through agent conversations.


Reliable agents don't just come from bigger context windows or smarter models. It's also about the muscle to manage information systematically and continuously observe and optimize.



