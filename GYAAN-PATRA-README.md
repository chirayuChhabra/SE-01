# Gyaan-Patra proposal

This branch proposes **Gyaan-Patra (ਗਿਆਨ-ਪੱਤਰ)** for CTBF-SE-01: an offline adaptive learning workflow for government-school classrooms where students do not have devices.

## What is being proposed

Gyaan-Patra uses one teacher phone, a photocopier, and at most five stacks of A5 sheets to run a same-day diagnostic loop for Class 5-7 fractions and decimals:

1. Print a small set of class variants.
2. Scan or manually enter answers on the teacher phone.
3. Maintain an evidence-based posterior over four documented misconceptions plus `none` and `unclear`.
4. Select the next sheet using expected information gain, eligibility rules, and a visible minimum-group merge cost.
5. Give the teacher evidence, a reteach card, copy counts, and a three-item exit ticket for a second same-day data point.

The system is deliberately local-only. It does not require student devices, accounts, cloud inference, or a per-child QR code.

## Files in this proposal

- [`GYAAN-PATRA-FINAL-SPEC.md`](GYAAN-PATRA-FINAL-SPEC.md) — the complete final specification supplied for this proposal, including scope, item model, assigner pseudocode, merge rule, scanner ladder, evaluation plan, privacy constraints, demo script, and honest claim limits.
- [`GYAAN-PATRA-README.md`](GYAAN-PATRA-README.md) — this merge-oriented overview.

## What changes relative to the current direction

- Reframes adaptation around a teacher-operated paper channel rather than a student-device LMS.
- Adds five photocopier-first class variants with an explicit maximum-stack budget.
- Adds hypothesis-driven assignment using Bayesian evidence and expected information gain.
- Adds an `unclear` state and an evidence threshold so the UI does not confidently name a misconception without enough tagged evidence.
- Adds a same-day exit-ticket loop and reteach card for the teacher.
- Adds a deterministic minimum-group merge rule, protected singleton behavior, regret logging, and a teacher override.
- Adds an OpenCV.js scanner ladder with manual-entry fallbacks for photocopy and lighting failures.
- Adds clean and deliberately mismatched simulation generators, scan-study targets, and a no-child-claims fallback.
- Adds Punjabi/English sheet and teacher-UI requirements, privacy constraints, offline behavior, and cost assumptions.

## Merge and review checklist

Before treating the proposal as a verified product claim, the team should review and implement the following in order:

- [ ] Verify the ASER and UDISE+ figures before putting any number on a slide.
- [ ] Agree the item schema, misconception tags, likelihood table, and source note for every distractor.
- [ ] Implement and unit-test the Bayesian updater, EIG calculation, eligibility rules, and merge loop.
- [ ] Build the vertical slice with L3 manual entry before making the camera scanner a dependency.
- [ ] Run the clean and mismatched simulations with fixed seeds and publish mean/SD results.
- [ ] Run the scan study on originals, first-generation copies, second-generation copies, and messy marks.
- [ ] Run the faculty/teacher rehearsal and record only observed timings and permitted quotes.
- [ ] Arrange the consented child session or explicitly preserve the no-child-claims position.
- [ ] Verify offline behavior in airplane mode, including cold reopen and zero runtime requests.
- [ ] Replace every placeholder, assumption, and `VERIFY BEFORE SLIDE` item with an observed or cited result before presenting it as evidence.

## Honest claim boundary

This proposal does not claim learning gains, calibrated Indian-classroom priors, perfect OMR, or that paper adaptation is faster than a student-device tutor. Its intended claim is narrower: a teacher can run hypothesis-testing practice and a same-day evidence loop with one phone and a constrained number of photocopy stacks. That claim must be supported by the simulation, scan study, faculty session, and any child usability session that actually run.

## Suggested merge title

`docs: propose Gyaan-Patra offline adaptive paper loop`
