# What the Cockatoos Can See

One afternoon in Sydney, I watched a sulphur-crested cockatoo grip a rusty water fountain handle with its foot and turn. The water arced high up and a second bird leaned in and drank. Other cockatoos waited nearby with a patience you never expect from birds famous for being a local nuisance. They shuffled orderly in line, taking turns as one would operate the handle while another sipped.

It was too hot to linger, but I still sat on the bench. I was gripped by their cooperation: the technique required two birds and they figured out who did what. This was knowledge that couldn't live in a single bird. It had to be distributed across the group, regenerated every time they gathered at the fountain, maintained through repetition and proximity and something that looked very much like trust.

A few years ago, [researchers documented](https://www.sciencedirect.com/science/article/pii/S0960982222012854) how Sydney's cockatoos learned to open wheelie bins and forage for food in the rubbish. The behavior started in a few southern suburbs and spread outward, passed along through observation and imitation. Eventually, different populations developed different techniques resulting in regional bin-opening dialects. The Stanwell Park cockatoos do it differently than the Sutherland cockatoos, the way Brooklyn makes pizza differently than New Haven.

But the bins are a trick a single bird can do. The fountain requires coordination and one bird's knowledge is useless without another bird's cooperation. The reliability in the mechanism isn't in any individual but baked into the culture of the flock. And the reason it works is that every bird can see what every other bird is doing. One watches the handle, another watches the water, and the ones waiting can see when it's time to move.

I watched those cockatoos for a long time, and as I finally walked back home I started thinking about the systems I build for a living. I work on AI reliability. I've built hallucination detectors, traced failure chains through production systems, and watched defenses fail in ways their designers never anticipated. Months later, I have not been able to stop thinking about those birds, because I've come to believe that we are trying to make these systems reliable while unable to see what they are doing.

---

I spent the last few years at AWS building and evaluating systems at production scale, the kind of scale where a failure doesn't show up in a test suite but surfaces three weeks later when a customer in a different region hits an input nobody anticipated. 

Last year I led a talk and workshop on [hallucination detection](github.com/aws-samples/responsible_ai_reduce_hallucinations_for_genai_apps) at AWS re:Invent. My audience was engaged and asked sharp questions, but I couldn't shake the feeling that what I was presenting was not enough. I was showing people how to find the wreckage after the crash and not prevent the failure in the first place. These were good methods, methods that worked, and all of them operated on the output. None of them could see what had happened inside the model between receiving the input and producing the response. We were getting more sophisticated at describing what went wrong without getting any closer to watching it go wrong.

The way we build AI reliability today splits the problem in two. You make the model as capable as possible through training, curated data and human feedback shaping its dispositions, and then you add defenses at deployment. Classifiers check whether inputs are appropriate. Retrieval systems ground the model's responses in approved sources. Output filters scan for toxicity and policy violations. Human reviewers spot-check the results.

Every one of these checks sees the same thing. They see the input. They see the output. None of them can see what happens in between.

We know training shapes dispositions, not guarantees. A model that is trained to be helpful will hallucinate when it struggles to produce a useful response. Even the most rigorously designed post-training environment won't prepare a model for all the edge cases it encounters in the wild. Nobody directly engineered intelligence into these systems. We created conditions and capability emerged from the interaction between model and data. And now we are trying to keep those systems honest using defenses that cannot observe the place where dishonesty happens.

---

In the 1980s, the [Therac-25](https://www.cs.columbia.edu/~junfeng/08fa-e6998/sched/readings/therac25.pdf) was the most advanced radiation therapy machine in North America. It was a computer-controlled electron accelerator that could deliver precise doses at an economical price point. The engineers who designed it were so confident in the software that they removed the hardware safety interlocks standard in earlier models. The software would ensure safety and independent hardware checks seemed redundant.

Between 1985 and 1987, the Therac-25 killed six patients and seriously injured others by delivering radiation doses a hundred times higher than intended. The failure mode was a race condition in the software that occurred only when operators typed commands in a particular sequence at a particular speed. When it triggered, patients received lethal overdoses while the machine displayed normal readings. 

The problem underneath the bug was that every layer of defense drew from the same well. The software had never been independently tested. It had been carried over from earlier models where hardware interlocks caught the errors it missed. The operators had been trained to trust the machine's readings, so when patients reported burning sensations, the staff assured them that was not possible. The error code "MALFUNCTION" appeared so frequently during normal operation that technicians learned to ignore it. The manufacturer's investigation process was designed to find hardware failures and couldn't conceive of software being at fault. What seemed like routine noise turned out to be lethal overdoses. 

Each layer of defense had a hole and the holes aligned perfectly, because they all drew from the same source: the native reporting of the machine. The operators watched the interface, the technicians watched the error codes, the investigators reviewed the logs, and nobody monitored the beam. Every check in the system was a check on what the machine said it was doing, and not one was a measurement of what the machine was actually doing. 

The Therac-25 was eventually fixed with independent hardware interlocks that measured the beam directly, observing what the machine was actually doing rather than trusting what the software reported.

---

I once spent hours tracing why an agent had fabricated an entire organization. It had conjured a non-existent company and then reasoned from that invention as if it were fact, producing a report that cited this fictional entity as though it were a well-known institution.

The failure mechanism was almost mundane. The retrieval system had returned nothing relevant to the user's query. But it had returned results, because retrieval systems always return results, so in the logs everything looked healthy. The model had been trained to be helpful, and returning nothing felt like failure. So it invented a bridge, a fictional entity that could plausibly connect three documents the retrieval system had surfaced, none of which were actually relevant. Then subsequent reasoning treated that bridge as real, built arguments on its fictional foundation, and produced output that was coherent, well-structured, and completely wrong.

A less capable model faced with the same empty retrieval would have produced something obviously broken, a generic hedge or an incoherent summary that any reviewer would flag. This model was fluent enough to invent a plausible entity and build a coherent argument on top of it. The tendency to fabricate rather than abstain comes from the training objective, not from a lack of intelligence, and scaling intelligence does not change the objective.

The obvious reaction is that this is a retrieval problem. We tweaked the retrieval, and it happened again a week later for another query. The retrieval system returned results each time, the relevance scores looked reasonable each time, and the model quietly bridged the gap each time. The failure wasn't in a component we could tune but in the model's decision to fabricate rather than abstain, and that decision happened inside the model and left no trace in the pipeline logs. The human reviewer skimmed the output, saw nothing obviously wrong, and approved it.

Every layer worked as designed, every layer had a hole, and the holes aligned because none of them could see the place where the failure actually occurred. The retrieval logs looked healthy, the output looked plausible, the reviewer saw nothing wrong, and every check was a check on the system's own reporting.

---

Even though we have methods to detect hallucinations in AI systems in real-time, adoption remains a challenge. When I show teams a working detector, I get the same response almost every time. They're interested, they ask good questions, and then nothing happens while they go and get more clarity on the roadmap.

During these demos, there was always a moment where the engineering lead went quiet and you could see them running a calculation that had nothing to do with whether the tool worked. They were thinking about what it would cost them to use it. And now I'm showing them something that will flag problems they don't have a playbook for and generate incidents that don't map onto any existing runbook. I was showing up with a smoke detector for a building with no fire department.

The resistance went further than organizational friction, though. Even with the detector running in production, you still cannot tell the CTO why the model is hallucinating. A detector that says "this output is probably wrong" does not tell you whether the context was insufficient, whether the model chose helpfulness over honesty, or whether the cause is something nobody has identified yet.

---

For the past year I've been working on how to [detect hallucinations in tool-calling agents](https://arxiv.org/abs/2601.05214), not from the output but from inside the model. We train probes on the model's internal activations during tool calls, looking for patterns that distinguish faithful reasoning from confabulation. I expected this to be difficult. The models are large, the activations are high-dimensional, and tool-calling behavior involves long chains of reasoning where errors compound.

We are finding most of the hallucinations and the probes are not complicated. The signal is there, sitting in the model's own internal representations, far more decipherable than anyone assumed given how often we call these systems opaque. What I want to talk about here is what it felt like and what it implies.

It was like the difference between listening to an engine and opening the hood. The model is more like a machine that keeps its own records, messy and incomplete, but readable if you know where to look. The reputation these models have for opacity is starting to look more like an artifact of not having looked than any property of the models themselves.

Others are looking too, and as I followed that work, reading about circuits and features and directions in activation space, I kept running into the same pattern. The research finds more structure than anyone expected, but it is almost always aimed at understanding models in order to build better ones. That is a different problem than keeping a deployed system honest. What did the model learn, and how can we shape what it learns next? What is the model doing right now, and can we intervene before it causes harm? Development operates on the timescale of training runs, weeks or months. Production operates on the timescale of a single generation pass, milliseconds. The overwhelming majority of the interpretability field's energy is flowing toward development. Production is where we need to go: utilizing live internal model signals to intervene and steer in real time.

---

Go back to the agent that invented a fake company. With output filtering, you catch this after the fact, if you catch it at all. A confident hallucination passes every surface check. Any decent pipeline can tell you that retrieval returned results, and the results had reasonable relevance scores, and the output was fluent and well-organized. What you cannot see is the moment inside the model where it registers the gap between what the retrieval provided and what the user asked for, and decides to fill that gap with invention rather than silence. By the time the output arrives, that decision is invisible and long gone.

With visibility into the model's internal state, you could see that moment. You could see the activation patterns that correspond to generating without grounding, the signatures that distinguish a model reasoning from evidence and a model reaching for a plausible bridge. You could intervene before it operates based on a fallacy. Suppress the bridging pattern, amplify the uncertainty signal, or simply halt generation, because the model has nothing useful to say and should say so.

A guardrail blocks outputs that look bad; a guidance system shapes the process that produces them. The guardrail will always be outpaced by a model that is more fluent than the guardrail is discerning, while the guidance system operates where the failure actually forms.

We can interpret toy models far better than frontier systems, and running interpretability at production speed remains an open engineering problem. The features we extract today explain fragments of behavior, not the full causal story. But the early results are already cleaner than they should be. The probes are simple and the signal is legible.

The approach of making models capable and then filtering their outputs has a ceiling. You can push training further, but training shapes distributions and does not eliminate tails. You can add more output filters, but filters that cannot see inside the process will always be guessing at what they catch and what slips past. The defenses will share the same blind spots because they all watch the same surface.

---

The Therac-25 operators could not see the beam; they watched the interface while the machine did something entirely different underneath.

The cockatoos at the fountain can see each other. Their technique holds not because any single bird mastered it but because the group can observe and adjust the process as it happens.

The first time I looked inside a model and saw a hallucination forming in the activations, saw the moment it started building on nothing, I hadn't solved it, but I could see what was happening. We have spent years stacking defenses on the surface and wondering why the failures keep slipping through.

We've been asking how to make these systems trustworthy. The better question is how to make them visible.

---

**If you're building systems that need to see what's happening inside the model — or if you've found signal where others told you there was only noise [let's chat](mailto:madathilvisakh@gmail.com).**
