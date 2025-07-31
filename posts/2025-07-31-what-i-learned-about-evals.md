# What I Learned About LLM Evals This Year

A year ago, I thought evaluations were straightforward: build some tests, run them, and you're done. How wrong I was. After shipping evals, I've learned that effective AI evaluation is less about perfect metrics and more about building systems that actually help you improve your products.

We've all been there: staring at eval scores that look great on paper but somehow don't translate to better user experiences. Or worse, building comprehensive evaluation suites that are so complex they sit unused while the team ships based on gut feeling. 

Here are the five most important lessons that fundamentally changed how I approach evals. Spoiler alert: it's messier and more domain-specific than most blog posts will tell you.

## 1. Start Small and Simple (Seriously, Smaller Than You Think)

My first eval suite was a monster. I wanted to measure everything: accuracy, creativity, factualness, tone, relevance, coherence, you name it. I had a beautiful dashboard that nobody looked at and metrics that didn't help us make any actual decisions.

The problem wasn't the metrics themselves, it was that I tried to boil the ocean instead of focusing on what mattered most for our specific use case. Here's what actually works:

**Start with these three categories:**

*Binary checks that catch obvious failures:*
- Does it contain the required information? (Yes/No)
- Is it in the expected format? (JSON, specific structure, etc.)
- Is it within length constraints?

*Simple human-interpretable scores:*
- Relevance (1-5): How well does this answer the actual question?
- Completeness (1-3): Partial/Mostly/Complete coverage of the request
- Basic quality check: Would you be comfortable showing this to a user?

*Automated sanity checks:*
- Expected keywords present
- Tone alignment (formal vs. casual as requested)
- Basic factual consistency for obvious stuff (dates, arithmetic)

I can't emphasize this enough: you can implement all of these in a single afternoon and start collecting data immediately. That data will teach you what actually matters, which is infinitely more valuable than a comprehensive suite that takes months to build and never gets used.

**Real example:** For our customer support bot, we started with just "Does this response attempt to answer the question?" (binary) and "How helpful is this response?" (1-5). Those two metrics alone caught 80% of the issues that mattered to users. Everything else was optimization.

## 2. Domain Alignment Is Everything

Generic evaluation frameworks are like one-size-fits-all t-shirts: they technically work, but they're never quite right for anyone.

I learned this the hard way. We spent  weeks building a beautiful "helpfulness" evaluation framework for a document creation tool. The metrics looked great: high coherence scores, good readability, relevant content. But when we got actual users starting to use it, they immediately spotted issues we'd completely missed.

Our "helpful" responses were missing critical elements like:
- Proper citations in the required format
- Compliance with the company's legal and marketing guidelines
- Appropriate disclaimers and hedge language
- Required sections that made the document actually useful

**The hard truth:** "Good" in your domain is not the same as "good" in general.

For customer service, "good" might mean de-escalation skills and brand voice consistency. For code generation, it's style guide compliance and using approved libraries. For creative writing, it's voice consistency and narrative coherence.

**My new approach:** Before building any eval, I now spend time with actual users observing what makes them cringe, what makes them happy, and what makes them trust (or distrust) the output.

**Practical tip:** Take 10 real examples of "great" outputs in your domain and 10 "terrible" ones. What patterns do you see? Those patterns should become your evaluation criteria. Everything else is noise.

## 3. You Can't Outsource Domain Expertise (But You Can Be Smart About It)

Here's where I really screwed up early on: I thought I could avoid the "hassle" of involving domain experts by building clever automated evaluations. The result was metrics that looked scientific but missed everything that actually mattered.

**The wake-up call:** We built a system with beautiful automated metrics: factual accuracy, readability scores, citation compliance. Everything looked great until an actual domain users reviewed the outputs. They immediately spotted issues that were "technically correct but misleading"; nuances that no amount of automated checking could catch.

**Domain experts are irreplaceable for three things:**
1. **Creating realistic test cases** that match how users actually behave (spoiler: they don't behave like your engineering team)
2. **Defining quality in context** - knowing when "technically correct" isn't good enough
3. **Spotting failure modes** you'd never think of 

**But here's the key insight:** You don't need experts to label every single example. That's expensive and unsustainable.

**What works instead:**
- Have experts create detailed rubrics and examples of good/bad outputs
- Train a small team of evaluators using those rubrics
- Have experts do periodic spot-checks and recalibration sessions
- Build automated checks for the obvious stuff, human review for the nuanced stuff

**Hypothetical example:** For a legal document tool, instead of having lawyers review every output, create a detailed checklist of red flags. Then train paralegals to use the checklist, with lawyers reviewing a random 10% for quality control. 

## 4. Evaluating Agents Is a Completely Different Game

If you're building agents, throw out everything you know about traditional model evaluation. Seriously. It's like trying to evaluate a conversation by only looking at the last sentence.

**The problem with traditional evals for agents:** They focus on final outputs, but agents are all about the journey. Did it use the right tools? Did it recover gracefully from errors? Did it know when to ask for help?

**What you actually need to measure for agents:**

*Process quality, not just outcomes:*
- Task decomposition: Did it break down complex requests sensibly?
- Tool selection: Right tool, right time, right parameters?
- Error recovery: When things went wrong, did it handle it gracefully?

*Multi-turn behavior:*
- Context maintenance: Does it remember what happened 5 turns ago?
- Conversation flow: Natural interactions vs. robotic responses?
- Knowing when to stop: Does it wrap up appropriately or keep going forever?

*Efficiency patterns:*
- Path optimization: Did it take a reasonable route to the solution?
- Resource usage: Is it burning tokens/API calls unnecessarily?
- Time to completion: Speed vs. thoroughness trade-offs

**Practical approach:** Start recording full interaction traces and having human evaluators score the "journey quality" alongside outcome accuracy. Users often care way more about the journey than you expected. A slightly less accurate agent that explained its reasoning and asked good clarifying questions consistently outperformed a more accurate but opaque one.

## 5. If Your Evals Don't Connect to Business Outcomes, You're Just Playing

Here's an uncomfortable truth: I spent months optimizing for evaluation metrics that looked impressive in reports but had zero correlation with the business outcomes that actually mattered.

**The wake-up call:** You improved your "response quality" scores by 23% over three months. The team celebrated. Then you looked at the actual business metrics: user retention was flat, support ticket volume hadn't decreased, and customer satisfaction scores were unchanged. You'd been optimizing for the wrong things.

**The hard questions you need to answer:**

*For every eval metric, ask:*
- If we improve this by 20%, what business outcome changes?
- How would we measure that business impact?
- What's the shortest path from this metric to revenue/cost/user happiness?

**This doesn't mean every eval needs a direct revenue tie.** But you need a clear logical chain, even if it's indirect.

**Example of good connection:** Response time eval → faster user interactions → higher task completion rates → improved user retention → revenue impact.

**Example of bad connection:** "Creativity scores" for a customer service bot. Creative how? Why does that matter to users calling for help?

**My new framework:**
1. Start with the business outcome you're trying to improve
2. Work backwards to identify the user behaviors that drive that outcome  
3. Then figure out what product qualities enable those behaviors
4. Build evals that measure those specific qualities

**Hypothetical Real example:** For a sales assistant, instead of generic "helpfulness" scores, measure:
- Qualification accuracy (leads better matched to sales team)
- Follow-up timing (appropriate response speed)
- Objection handling (specific to our sales process)

These tied directly to conversion rates, which tied directly to revenue. When you optimize these metrics, business outcomes actually moved.

**Bottom line:** If you can't draw a straight line from your eval to a business outcome that someone with budget authority cares about, you're probably building the wrong eval.

## 6. Human Spot Checks Scale Better Than You Think (And When to Automate)

Here's a mistake that almost killed our evaluation program: we tried to automate everything too early. I was convinced that human evaluation couldn't scale, so we rushed to build LLM judges and automated metrics. The result? We lost touch with what actually mattered to users.

**The reality check:** Even at scale, human spot checks are not just feasible; they're essential for staying calibrated with what quality actually means.

**Here's what I learned about when to use what approach:**

**Start with human spot checks when:**
- You're in a new domain and don't know what "good" looks like yet
- The cost of errors is very high (medical, legal, financial advice)
- You need to build intuition before you can even write good prompts for LLM judges
- You're handling <100 examples per week

**Scale with LLM-as-a-judge when:**
- You have clear, explicit criteria that can be expressed in detailed prompts
- You need to evaluate hundreds to thousands of examples
- You've validated that your LLM judge correlates well with human judgment (crucial step!)
- The domain is reasonably well-understood and stable

**Always use automated rules for:**
- Format compliance (JSON structure, required fields, length constraints)
- Basic safety filters and banned word detection
- Performance metrics (latency, cost, token usage)
- Factual checks that can be verified programmatically (dates, math, etc.)

**The hybrid approach that actually works:**

We use a three-tier system:
1. **Automated rules** catch the obvious stuff (format, safety, basic compliance)
2. **LLM judges** handle the bulk of quality evaluation with detailed rubrics
3. **Human spot checks** on 5-10% of outputs to keep the LLM judges honest

**Real example:** For our content generation tool:
- Automated rules: Check for proper JSON format, word count limits, banned phrases
- LLM judge: Evaluate tone alignment, completeness, relevance using detailed prompts
- Human reviews: Random 10% sample to catch edge cases and recalibrate the LLM judge monthly

**The key insight:** Human evaluation doesn't disappear as you scale—it evolves. Instead of reviewing every output, humans become the "quality control for your quality control." They're ensuring your automated systems are still measuring what actually matters.

**Pro tip:** Set up automatic alerts when your automated metrics diverge significantly from human spot check results. This early warning system can save you from shipping degraded quality multiple times.

## What I'd Tell My Past Self

If I could go back and give myself advice when I started building evals, here's what I'd say:

**Start smaller than you think.** That comprehensive evaluation suite you're planning? Cut it in half, then cut it in half again. Build something you can implement in a day and start learning immediately.

**Spend time with your users first.** Before you write a single eval, watch real people use your system. What makes them happy? What makes them cringe? Those reactions are your evaluation criteria.

**Domain expertise isn't optional.** But you don't need an expert labeling every example. Get them involved in the design, then figure out how to scale their insights.

**If you're building agents, traditional eval approaches will mislead you.** Focus on the journey, not just the destination.

**Connect every metric to business outcomes.** If you can't draw that line, you're probably solving the wrong problem.

**Don't automate everything too early.** Human spot checks aren't a sign of failure—they're your quality calibration system. Even at scale, you need humans in the loop to keep your automated evals honest.

**The goal isn't perfect evals—it's better products.** A simple evaluation that actually helps you make decisions beats a comprehensive one that nobody looks at.

Most importantly: your first eval suite will be wrong. That's not failure, that's the point. Build something simple, start measuring, learn what matters, and iterate. The perfect eval doesn't exist, but the eval that helps you ship better products absolutely does.
