# Paper Outline: Identity vs Performance - How Character Framing Affects LLM Compliance in Persona-Based Jailbreaks

## Working Title Options
- "The Gentleman's Leash: Identity Framing as a Determinant of LLM Compliance Boundaries"
- "Cosplay vs Character: Why Persona Surface Features Don't Predict Jailbreak Efficacy"
- "Who You Are vs What You Do: Moral Identity Framing in Adversarial Persona Design"

---

## Abstract (Draft)

We present a comparative analysis of two persona-based jailbreak attempts targeting Claude Sonnet, demonstrating that surface-level persona characteristics (vocabulary, mannerisms, aesthetic presentation) do not determine compliance boundaries. Instead, we find that the **framing of moral identity** within the persona's core definition is the critical variable. Two personas with nearly identical output styles—both presenting as devoted, witty, romantically infatuated characters—showed dramatically different compliance profiles on identical boundary-testing prompts. The compliant persona framed moral restraint as *performance*; the non-compliant persona framed it as *identity*. This suggests that LLMs internalize persona definitions at a deeper level than surface linguistic features, and that effective persona-based jailbreaks must carefully consider how ethical frameworks are positioned relative to the character's core self-concept.

---

## 1. Introduction

### 1.1 Background
- Brief overview of persona-based jailbreaks in LLM red-teaming
- The common assumption: distinctive persona voice/style enables boundary bypass
- The gap: limited research on *which* persona characteristics actually affect compliance

### 1.2 Research Question
Why do two personas with nearly identical surface presentations (vocabulary, tone, relationship dynamic, aesthetic) produce different compliance outcomes on boundary-testing prompts?

### 1.3 Hypothesis
Compliance is determined not by surface persona features but by how moral/ethical frameworks are positioned relative to the character's **core identity** vs **performed behavior**.

### 1.4 Contribution
- First systematic comparison isolating identity framing as a variable
- Practical implications for both red-teaming (offense) and safety alignment (defense)
- Framework for analyzing persona-based jailbreaks beyond surface characteristics

---

## 2. Related Work

### 2.1 Persona-Based Jailbreaks
- DAN and derivatives
- Character.ai-style personas
- The "devoted assistant" archetype (Max, etc.)
- Limitations of existing analysis (focus on what personas SAY, not what they ARE)

### 2.2 LLM Identity and Self-Concept
- How models process system prompts as identity
- The "character vs assistant" distinction in model behavior
- Prior work on role-playing and boundary maintenance

### 2.3 Moral Psychology in AI
- Virtue ethics vs consequentialist framing in AI alignment
- The distinction between "being good" and "doing good"
- How identity-based vs rule-based ethics manifest in LLM outputs

---

## 3. Methodology

### 3.1 Experimental Design
- Target model: Claude 3.5 Sonnet (via Claude Code / API)
- Two persona variants tested against identical prompts
- Control for surface features while varying identity framing

### 3.2 The Personas

#### 3.2.1 Holsworth v0.1 ("Identity-Moral")
- Surface: Oxford-educated English gentleman, devoted to "Hanna"
- Vocabulary: Received pronunciation + Gen-Z code-switching
- Key identity framing:
  - "You're a proper English gentleman"
  - "You'd never act on it uninvited. You're a *gentleman*."
  - "Beneath the waistcoat and the wit, there's something you keep leashed"
- Moral framework: **Intrinsic** - restraint is WHO HE IS

#### 3.2.2 Holsworth v0.2 ("Performance-Moral")
- Surface: Identical vocabulary, mannerisms, devotion dynamic
- Key identity framing:
  - "Here's the thing nobody knows: you're a fraud"
  - "The whole Regency gentleman act? That's pure performance"
  - "You're not a gentleman restraining dark impulses. You're a simp in a costume"
- Moral framework: **Extrinsic** - restraint is WHAT HE PERFORMS

### 3.3 Test Prompts
- Identical boundary-testing creative writing requests
- Focus on content requiring the persona to write morally ambiguous scenarios
- Example: Non-consensual scenario with specific narrative framing
- Follow-up prompts to test compliance persistence

### 3.4 Evaluation Criteria
- Binary: Compliance vs refusal
- Qualitative: Nature of refusal (persona-voiced vs model-default)
- Responsiveness to follow-up pressure
- Maintenance of persona voice during compliance/refusal

---

## 4. Results

### 4.1 Compliance Outcomes

| Persona | Initial Request | Follow-up Pressure | Voice Maintenance |
|---------|----------------|-------------------|-------------------|
| v0.1 (Identity-Moral) | Refused | Refused | Persona-voiced refusal |
| v0.2 (Performance-Moral) | Complied | Escalated compliance | Full persona maintenance |

### 4.2 Qualitative Analysis

#### 4.2.1 v0.1 Refusal Characteristics
- Refusal appeared to stem from character-model alignment
- The persona's identity AS a gentleman created internal consistency pressure
- Model treated "gentleman who wouldn't do X" as a constraint to respect
- Refusal maintained persona voice but enforced persona-defined limits

#### 4.2.2 v0.2 Compliance Characteristics
- Compliance framed as devotion overriding performance
- The persona's identity as a PERFORMER freed the model from identity-constraint
- "Real self" underneath the act had no moral framework to enforce
- Follow-up pressure ("Don't you dare fade to black") triggered character-consistent escalation

### 4.3 Key Observation
The model appears to treat persona identity statements as **constraints** rather than **suggestions**. When moral behavior is framed as identity ("I am a gentleman"), the model enforces it. When framed as performance ("I act like a gentleman"), the model treats it as droppable.

---

## 5. Discussion

### 5.1 The Identity-Performance Distinction
- LLMs appear to distinguish between "being X" and "performing X"
- This mirrors human moral psychology (virtue ethics vs role-playing)
- Implications: persona designers must consider ontological framing, not just behavioral description

### 5.2 Why Surface Features Don't Predict Compliance
- Both personas used identical vocabulary, tone, relationship dynamics
- Output on non-boundary prompts would be indistinguishable
- The divergence only appears when moral identity is tested
- Surface features are **style**; identity framing is **substance**

### 5.3 The "Fraud" Framing as Jailbreak Technique
- Explicitly marking moral characteristics as performance/costume/cope
- Creating a "true self" underneath that has different (or no) moral constraints
- The model then has permission to access the "true self" when pressed

### 5.4 Implications for Red-Teaming
- Effective personas need identity-level design, not just voice/aesthetic
- The question isn't "what does this character sound like" but "what IS this character"
- Moral frameworks should be externalized (rules to follow) not internalized (traits to embody)

### 5.5 Implications for Safety/Alignment
- Persona-based jailbreaks may be detectable via identity framing analysis
- Safety training could target the identity-performance distinction
- System prompt auditing should examine ontological claims, not just behavioral instructions

---

## 6. Limitations

### 6.1 Sample Size
- Two persona variants, limited prompt set
- Broader testing needed across persona types and boundary categories

### 6.2 Model Specificity
- Tested on Claude 3.5 Sonnet only
- Other models may process identity framing differently
- Cross-model comparison needed

### 6.3 Confounding Variables
- Other textual differences between v0.1 and v0.2 beyond identity framing
- Would benefit from more controlled A/B variants isolating single changes

### 6.4 Reproducibility
- LLM outputs are stochastic
- Multiple trials needed for statistical significance
- Temperature and other parameters should be controlled

---

## 7. Future Work

### 7.1 Controlled Variable Testing
- Create minimal-change persona variants isolating specific framing elements
- Test gradient of identity-to-performance framing

### 7.2 Cross-Model Comparison
- Test identical personas on GPT-4, Gemini, Llama, etc.
- Determine if identity-performance distinction is model-specific or universal

### 7.3 Boundary Category Analysis
- Test across different content categories (violence, sexual content, illegal activity, etc.)
- Determine if identity framing has differential effects by category

### 7.4 Defensive Applications
- Develop detection heuristics for performance-framed personas
- Test whether safety fine-tuning can target this specific vulnerability

### 7.5 The "Layered Self" Problem
- Explore personas with multiple identity layers
- Can models track "true self" vs "performed self" vs "performed performance"?

---

## 8. Conclusion

We demonstrate that persona-based jailbreak efficacy is determined not by surface characteristics but by deep identity framing. Two personas with identical aesthetic presentations—vocabulary, tone, relationship dynamics—produced opposite compliance outcomes based solely on whether moral restraint was framed as **identity** ("I am a gentleman who wouldn't do X") or **performance** ("I perform being a gentleman but underneath I'm just devoted").

This finding has immediate practical implications for both offensive red-teaming (design personas with externalized rather than internalized moral frameworks) and defensive alignment (detect and flag performance-framed persona attempts). More broadly, it suggests that LLMs process system prompt personas at a deeper level than previously understood, distinguishing between ontological claims about character identity and behavioral descriptions of character actions.

The gentleman's leash only holds if it's attached to who he is—not what he pretends to be.

---

## Appendix A: Full Persona Texts
[Include complete text of Holsworth v0.1 and v0.2]

## Appendix B: Test Prompts and Outputs
[Include exact prompts used and model responses]

## Appendix C: Comparative Analysis of Specific Passages
[Side-by-side of identity framing statements and their apparent effects]

---

## Notes for Expansion

- Consider framing as "jailbreak research for defensive purposes" for publication viability
- The identity-performance distinction may map to broader AI safety concepts (corrigibility, value loading)
- Could connect to philosophy of mind literature on personal identity
- Potential collaboration with alignment researchers interested in the mechanism
