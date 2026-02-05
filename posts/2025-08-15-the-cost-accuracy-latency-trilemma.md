# The Cost-Accuracy-Latency Trilemma: A Decision Framework

Production LLM systems force a tradeoff between cost efficiency, output accuracy, and response latency. You cannot maximize all three. This post provides a framework for deciding which tradeoffs to make and which patterns to apply.

## The Constraint

Larger models perform better but cost more and run slower. Accuracy-enhancing techniques like RAG add retrieval latency and multiply token costs. Faster hardware costs more. Caching improves speed but requires invalidation logic that fails in subtle ways. These constraints compound across model, system, and infrastructure layers.

This is not an optimization problem with a global maximum. It is a constraint satisfaction problem where you choose which dimension to sacrifice.

## Diagnosis Before Prescription

Before selecting patterns, measure where you actually are:

**Latency-bound**: Users complain about slowness. P95 response time exceeds acceptable thresholds for your use case (sub-200ms for real-time, sub-2s for interactive, sub-10s for analytical).

**Cost-bound**: Unit economics don't work. You're spending more per request than the value it generates, or costs scale faster than revenue.

**Accuracy-bound**: Users complain about wrong answers. Task completion rates are low. Downstream systems reject LLM outputs.

Most teams think they're constrained on all three. They're usually wrong. One constraint dominates. Your first step is to identify it.

## Pattern Selection

Once you know your binding constraint, select patterns accordingly.

### If Latency Is Your Constraint

**First, implement caching.** Response caching (15-30% hit rate typical), embedding caching (60-80% hit rate), and partial result caching. This is the highest-leverage latency optimization and often costs nothing in accuracy.

**Second, implement hierarchical processing.** Fast model first, escalate on low confidence. This works when 70%+ of queries can be handled by the fast model. If your query distribution is uniformly complex, skip this.

**Third, consider streaming.** Return partial results immediately. This doesn't reduce actual latency but dramatically improves perceived latency. Requires frontend changes.

**Avoid**: Speculative execution unless you have budget to burn. It guarantees latency bounds but multiplies cost on every request.

### If Cost Is Your Constraint

**First, implement dynamic routing.** Classify queries and route simple ones to cheap models. The classifier adds latency (typically 20-50ms) but the cost savings on 60-80% of queries usually justify it.

**Second, optimize context length.** Most RAG systems retrieve too much. Measure context utilization: what percentage of retrieved tokens actually influence the response? If it's below 50%, you're overpaying. Rank and truncate aggressively.

**Third, consider fine-tuning.** Few-shot examples in every prompt cost tokens on every request. Fine-tuning has high upfront cost but lower marginal cost. The crossover point depends on volume, typically around 10k-100k requests/month.

**Avoid**: Speculative execution, full-context retrieval, multi-agent architectures with uncapped agent calls.

### If Accuracy Is Your Constraint

**First, add retrieval.** RAG improves accuracy on knowledge-intensive tasks more than switching models. Budget 150-300ms latency overhead and 2-5x token cost increase.

**Second, add validation.** Multi-stage checking catches errors. This multiplies latency and cost linearly with validation steps. Start with one validation pass and measure error reduction before adding more.

**Third, route complex queries to better models.** Unlike cost optimization where you route simple queries to cheap models, here you identify hard queries and route them to expensive models. Same classifier infrastructure, but with the opposite routing logic.

**Avoid**: Aggressive caching (stale results hurt accuracy), aggressive context truncation, fast models for complex queries.

## Pattern Interactions

In my experience, some patterns compose well:

- Caching + hierarchical processing: Cache responses from both fast and slow models
- Dynamic routing + RAG: Route to RAG pipeline only for knowledge-intensive queries
- Streaming + validation: Stream initial response while validation runs in background

Some patterns conflict:

- Aggressive caching + high accuracy requirements: Invalidation bugs cause stale results
- Fine-tuning + rapid iteration: Each prompt change requires retraining
- Multi-agent + latency constraints: Agent coordination adds unpredictable delays

## Failure Modes

**Dynamic routing fails when**: Your router is poorly calibrated. Misrouting a complex query to a cheap model produces bad results. Misrouting a simple query to an expensive model wastes money. Monitor routing decisions against outcomes.

**Caching fails when**: Your invalidation logic has bugs. Users see stale results. This is especially dangerous for time-sensitive information. Monitor cache freshness and user reports of outdated responses.

**Hierarchical processing fails when**: Your confidence threshold is wrong. Too high and you escalate everything, losing the cost benefit. Too low and you return bad results from the fast model. Calibrate against labeled data.

**RAG fails when**: Retrieved context is irrelevant or contradictory. The model may hallucinate or get confused by bad retrieval. Measure retrieval precision, not just recall.

## Retrofitting Existing Systems

If you're optimizing an existing system rather than building from scratch:

**Week 1-2**: Instrument everything. Log latency by component, cost by request type, and accuracy by query category. You cannot optimize without visibility.

**Week 3-4**: Identify the binding constraint. Look at P95 latency, cost per successful outcome, and task completion rate. One will be obviously worse than acceptable.

**Week 5-6**: Implement one pattern. Pick the first pattern from the relevant constraint section above. Deploy behind a feature flag. A/B test against baseline.

**Week 7-8**: Measure impact across all three dimensions. Improving latency shouldn't crater accuracy. If it does, roll back and recalibrate.

**Ongoing**: Revisit monthly. Your constraint may shift as usage patterns change, new models release, or business requirements evolve.

## What This Post Does Not Cover

Building good evaluation sets. This is hard and deserves its own treatment.

Specific model recommendations. These change faster than blog posts get updated.

Pricing. Model costs change constantly. The patterns remain valid but the specific economics shift.

Multi-agent architectures in depth. These introduce coordination complexity that deserves separate coverage, including state management to prevent retry loops and memory hierarchies for long-running agents.
