# GYAAN-PATRA (ਗਿਆਨ-ਪੱਤਰ): Final Spec

CTBF-SE-01 · Offline adaptive learning app for government-school students · CT BuildFest 2.0

> Evaluator status: round 2 scored 86/100, round 3 scored 84/100. This final version (round 4) has not been scored. The 90+ target was not verified.

Pitch: "Offline adaptive learning where the student device does not exist. One teacher phone, one photocopier, at most five stacks of sheets. Gyaan-Patra tells a teacher WHY children get fractions and decimals wrong, which sheet each child should get next, and what changed by the end of the same day."

Status rule for the whole project: nothing below has been run yet. Every number on a slide must come from something the team actually ran, or be marked "cited, verified" with a named source. Anything marked VERIFY BEFORE SLIDE must not be shown until someone has opened the source and checked it.

## 1. Scope lock

- Topic: fractions and decimals, Class 5-7. Four misconceptions, about 36 items, five class variants, one sheet size (A5, six items per sheet, printed 2-up on A4 and cut), plus a three-item exit ticket.
- Languages: sheet stems and teacher UI fully in Punjabi and English. Hindi UI labels are stretch-only.
- Data: local-only on the teacher's phone; a plain CSV/JSON Save backup button with a warning. No accounts, no cloud.
- Stretch-only, built only if the H18 checkpoint is green: per-child unique-sheet simulation arm, large-print A4 variant of the same PDF, Ed25519-signed content packs, Hindi labels.
- Cut: shared-device mode, dyslexia font, SUS, CRDT, audio, BKT/DAG, and any on-device LLM.

## 2. Slide one: the opening statistic (verify before slide)

Opening line (30 seconds): "'Offline adaptive learning' usually means an app that works without internet. We mean something harder: adaptive learning where the student device does not exist. The only computer in the room is the teacher's phone; the only output technology is a photocopier." One verified figure with a named source goes on slide one. Nobody may present it from memory. Owner: E, deadline H8.

Figure 1 (device access at home): ASER Centre/Pratham, ASER (Rural) 2022, released January 2023, section on household and children's digital access, table "availability of a smartphone in the household for enrolled children" (national and Punjab). Also open ASER 2024 (released January 2025) and use the latest edition. VERIFY BEFORE SLIDE: exact percentage, year, rural-only scope, and the separate figure on children who could use the phone for study. For orientation only and unverified: the household smartphone share was reported to have risen sharply between 2018 and 2022. Do not put "rose sharply" on a slide either until the numbers are copied from the table.

Figure 2 (device access at school): UDISE+ (Ministry of Education, udiseplus.gov.in), latest published year, infrastructure section on government schools with functional computers/ICT lab and with internet; use the Punjab state report card for the local line. VERIFY BEFORE SLIDE: exact percentage, definition (functional computer versus any computer), year. Slide wording template: "[VERIFIED X%] of rural children have a smartphone at home (ASER 20XX, table N), but only [VERIFIED Y%] of government schools have [definition] (UDISE+ 20XX). A home phone is a parent's shared phone, not a classroom device." If either figure cannot be verified by H8, drop the number and use the qualitative sentence "see ASER and UDISE+ in the appendix"; never fill in a remembered value.

## 3. Core ideas

### A) Photocopier-first class variants

Five identical-for-everyone A5 variants. Each child gets one per cycle; the app tells the teacher how many copies of each. No per-child QR: children identify themselves with a roll number (grid, or fallbacks in section 8). The unit of logistics is a stack, not a child.

### B) Hypothesis-driven assignment

Per child a posterior over H = {none, M1, M2, M3, M4, unclear}. A child's next variant is the one with the highest expected information gain (EIG), subject to eligibility and a minimum-group-size merge rule written out in section 5. The teacher sees the posterior, the bubbles that moved it, a counterfactual ("had Q3 been B, P(M4) would be ..."), and a "Not what I see" override.

### C) Same-day exit-ticket loop

Daily cadence is a stated design choice. Misconceptions (all documented in the literature): M1 bigger denominator means bigger fraction; M2 add tops and add bottoms (1/2 + 1/3 = 2/5); M3 longer decimal is larger (whole-number thinking); M4 shorter decimal is larger (0.3 > 0.45). The M3/M4 "smallest-of" item is: "Which is the smallest: A 0.4, B 0.375, C 0.35, D all equal?" Correct = C. M3 picks A, M4 picks B. "Largest-of" items hide M4 (M4 gets them right by coincidence), so the sheet pairs both types. Two different wrong options give two different, correct posteriors. This item powers the unscripted demo.

Variants (neutral shapes, reassigned at random each cycle; shapes carry no ability meaning): ▲ fraction size (M1 versus none), ● fraction sums (M2 versus none), ■ decimal size (M3 versus M4 versus none), ◆ confirm/transfer after reteach (for "probably settled"), ★ broad re-screen (for "unclear"). First-ever sheet for everyone is ★ (one copy run).

Skill rule (no BKT/DAG): three skills S1 fraction size, S2 fraction sums, S3 decimal size; one prerequisite edge S1 before S2. A skill is "settled" when P(none) is at least 0.8 on two consecutive sheets (exit tickets count as one sheet). Eligibility: a child may only be assigned variants for unsettled skills, plus ◆ if all are settled-pending-confirm, plus ★ if "unclear". The posterior chooses items within eligible variants; skill order matters only when no misconception is confirmed. A confirmed misconception (P at least 0.6 with at least two tagged-option evidence items) overrides skill order. If P(M1) is above 0.5, M2 evidence is tempered (its likelihood flattened by half) because sums errors are confounded with size errors. Surprising-but-justified next sheet: a child who gets 6/6 on a decimals sheet whose larger numbers happened to be the shorter ones (0.8 vs 0.75; largest of 0.4, 0.375, 0.35) looks "mastered" to a score-based tool. Our posterior keeps M4 alive because M4 predicts exactly those answers. Tomorrow's sheet ■ puts the longer decimal as the larger one (0.45 vs 0.3; smallest of 0.4, 0.375, 0.35). The teacher card says: "All correct, but these answers are also what M4 produces. Tomorrow's sheet is chosen to rule M4 in or out."

Over-claim guard: the UI names a misconception only if the top hypothesis is at least 0.6 and has at least two tagged-option evidence items; otherwise it says "Not enough evidence to name a misconception" and shows the next sheet that would help. Straight-lining (five or more identical letters out of six) and patterns with no tagged-option evidence go to "unclear" by design.

## 4. The same-day exit-ticket loop

One-line timeline: "Period 1 assigned sheet, recess scan, periods 2-4 reteach card, period 6 exit ticket + scan, evening or next-morning copies, next day period 1 next sheet."

- Period 1 (10 min): children complete their assigned variant.
- Recess (about 7 min): teacher scans about 41 sheets (target 8-10 s each); the app updates posteriors and builds the reteach card for the top misconception.
- Periods 2-4: teacher reteaches using the card (concrete material, e.g., fold chapatis).
- Period 6 (5 min): exit ticket. Three items, A5, one version for the whole class chosen by the day's reteach topic (E-frac or E-dec), so one master and one copy run. Scan at dispersal (about 7 min). The same likelihood table updates the posterior. Class screen shows "evidence shift on the reteached misconception" as a descriptive measure, not a learning claim.
- Evening or next morning before assembly: teacher copies the stacks the app lists (usually 3-5). Next day period 1 starts with the new variants.

Why daily is a design, not a gap: the copier is the actuator and the teacher's time is the budget (about 20 minutes a day in this plan), so one diagnostic decision per child per day with a second same-day data point is the cadence the physical channel supports. Per-question adaptation is explicitly not claimed; where one device per child exists, an in-app tutor adapts faster and should be preferred. Our scope is classrooms where the device does not exist.

## 5. Assigner and merge rule

Parameters (teacher-visible): `MIN_GROUP = 3` (set to 1 to disable merging), `EPS = 0.02` bits, `PROTECT_P = 0.6`, `PROTECT_LOSS = 0.30` bits, `MAX_STACKS = 5`, `MC_N = 300` (fixed seed so results are reproducible).

Objective: maximise the sum over children of EIG(child, assigned variant), subject to eligibility, at most `MAX_STACKS` variants, and every non-protected stack having at least `MIN_GROUP` children.

```text
EIG(c, v) = H(p_c) - E_{a ~ P(a | p_c, v)} [ H(p_c | a) ]     # bits over H; Monte Carlo, MC_N samples
assign(children C, variants V):
  # 1. eligibility and scores
  for c in C: for v in V:
      elig[c][v] = eligible(c, v)            # skill rule, repeat-guard
      score[c][v] = elig[c][v] ? EIG(c, v) : -inf
  # 2. first choice, deterministic tie-breaking
  sizes = counts of c whose provisional best is v
  for c in C:
      best[c] = argmax_v score[c][v]
      ties = {v : score[c][v] >= score[c][best] - EPS}
      if |ties| > 1: best[c] = argmax over ties of (current group size, then fixed shape order ▲ ● ■ ◆ ★)
  # 3. merge loop
  protected = {c : top(p_c) >= PROTECT_P and evidenceCount(c) >= 2
                   and score[c][best[c]] - max_{v' != best[c], elig} score[c][v'] > PROTECT_LOSS}
  while exists v with 0 < n_v < MIN_GROUP and nonProtectedMembers(v) > 0 and (#nonempty variants > 1):
      v* = the group with smallest n_v ; ties -> smallest sum of members' best scores (least to lose)
      candidates T = surviving variants with n >= MIN_GROUP
      if none exist, stop merging
      for the NON-protected members M of v*:
          choose t in T maximising sum_{c in M, elig[c][t]} score[c][t]
          if some c in M is ineligible for t: that c moves to its own best t' in T, else stays unmerged and is flagged
      for each moved c: regret[c] = score[c][best_old] - score[c][t]; merged[c] = true; log reason
      protected members of v* stay in v*; the stack remains and prints (n_v) copies
  # 4. output
  stacks = {v: [c...]} ; copies per stack ; list of merged children with regret ; list of protected singletons
  teacher may drag any child to another stack (logged override)
```

Singleton handling: a protected child (confirmed misconception whose best variant is much better than any alternative) keeps their own stack; the teacher copies one page. A non-protected singleton is merged. A child whose best variant is merged away goes to the highest-scoring eligible surviving variant (or travels with their whole group), their regret is logged and the teacher sees "moved from ● to ■ (cost 0.06 bits)". The teacher can undo.

Worked example: 12 children, five variants, `MIN_GROUP = 3`. EIG values are illustrative; the simulation reports measured distributions.

| Roll | Posterior summary | ▲ | ● | ■ | ◆ | ★ | First choice |
|---|---|---:|---:|---:|---:|---:|---|
| 01 | M1 0.70 | 0.62 | 0.10 | 0.08 | 0.30 | 0.25 | ▲ |
| 02 | M1 0.60 | 0.58 | 0.12 | 0.10 | 0.28 | 0.26 | ▲ |
| 03 | M1 0.50, none 0.30 | 0.66 | 0.15 | 0.09 | 0.27 | 0.24 | ▲ |
| 04 | M1 0.40, unclear 0.30 | 0.55 | 0.13 | 0.09 | 0.22 | 0.40 | ▲ |
| 05 | M2 0.65 | 0.14 | 0.60 | 0.07 | 0.18 | 0.20 | ● |
| 06 | M2 0.50, M1 0.30 | 0.50 | 0.48 | 0.08 | 0.20 | 0.23 | ▲ (tie within EPS: larger group) |
| 07 | M3 0.45, M4 0.45 | 0.05 | 0.04 | 0.95 | 0.15 | 0.20 | ■ |
| 08 | M3 0.70 | 0.06 | 0.05 | 0.55 | 0.25 | 0.18 | ■ |
| 09 | M4 0.40, none 0.50 | 0.07 | 0.06 | 0.52 | 0.20 | 0.21 | ■ |
| 10 | none 0.85 (S1,S2 settled) | n/a | n/a | 0.09 | 0.18 | n/a | ◆ |
| 11 | none 0.87 (S1,S2 settled) | n/a | n/a | 0.11 | 0.17 | n/a | ◆ |
| 12 | unclear 0.60 (all-A pattern) | 0.30 | 0.22 | 0.28 | 0.12 | 0.41 | ★ |

Provisional sizes: ▲ 5 (01,02,03,04,06), ● 1 (05), ■ 3 (07,08,09), ◆ 2 (10,11), ★ 1 (12). Sum of first-choice EIG = 6.29 bits. Merge loop: groups below 3 are ★ (1; best-score sum 0.41), ● (1; 0.60), ◆ (2; 0.35); order is ★, ●, ◆ by size then least to lose.

- ★ {12}: candidate stacks with at least 3 children are ▲ and ■; 12 scores 0.30 on ▲ and 0.28 on ■, so 12 moves to ▲; regret 0.11 bits. Since 12 is unclear, ★ would have been the better test, which is exactly the cost being measured.
- ● {05}: protected (P(M2) 0.65 is at least 0.6, two or more evidence items, and the loss 0.60 - 0.14 = 0.46 exceeds 0.30). Stays; teacher copies one page.
- ◆ {10, 11}: not protected; both are eligible only for S3 variants (■) or ◆; ■ is the surviving stack with at least 3 children, so both move to ■; regret 0.09 + 0.06 = 0.15 bits.

Result: stacks ▲ 6 (01,02,03,04,06,12), ■ 5 (07,08,09,10,11), ● 1 (05). Three stacks instead of five; 3 of 12 children (25%) had their assignment changed by merging; total regret 0.26 of 6.29 bits (4.1%). Teacher sees the merged children and can drag any back.

New simulation arm that measures the merging cost (B, run on the same simulator as section 12): compare `MIN_GROUP = 1` (no merge), 3 (default), and 5 (aggressive), for class sizes 20, 41 and 60 (merging should bite most in small classes), under the clean and the mismatched generator (section 12). Report per cell, mean and SD over 10 seeds: (a) top-1 and top-2 identification of the true primary misconception after rounds 1 and 2; (b) fraction of children whose assignment changed because of merging; (c) mean regret bits per child; (d) mean number of stacks. Pre-declared acceptance: at n=41 merging with `MIN_GROUP = 3` costs at most 3 percentage points of top-1 accuracy versus no merging and removes at least one stack on average. If it costs more, change the default to `MIN_GROUP = 2` or 1 and say so on the claim page.

One-page claim (fill blanks only with measured numbers): "Classes without student devices can still run hypothesis-testing practice: under a photocopier budget of at most five stacks, hypothesis-driven variant assignment identifies the true primary misconception for X% of simulated students after two sheets versus Y% for difficulty-only variants and Z% for one fixed sheet (clean generator), and X%/Y%/Z% under a deliberately mismatched generator. The minimum-group merge rule reduces stacks from S0 to S1 on average and changes the assignment of W% of children at a cost of V percentage points. We do not claim to have invented misconception diagnosis (Eedi and ordered-multiple-choice work exist); the claim is the closed loop on paper with one phone and an explicit sheet budget, and the item design that exposes shorter-is-larger. We make no claim about learning gains." If the measured result disappoints, the page states that and what was changed.

## 6. Architecture

Preact + Vite + vite-plugin-pwa (precaches app, fonts subset and OpenCV.js WASM), Dexie/IndexedDB, jsPDF for sheet PDFs. First install of the PWA needs a connection once (school Wi-Fi, home data, or a shared link); after that it runs fully offline. Honest note on the adoption slide.

Engine in TypeScript, unit-tested: item schema `{id, variant, skill, stem{pa,en}, options[4], correct, tag per option}`; likelihood `P(option | hypothesis)` from tags (tagged option about 0.7 under its hypothesis, correct about 0.9 under none, residual spread, slip and guess about 0.1), independent-item Bayes update, blank = no evidence, assumptions panel in the app.

Sheet: four corner fiducials, variant code (five large squares plus a huge printed shape), roll-number grid (tens digit 0-4, units digit 0-9), six items x four bubbles, black/white/empty-bubble reference patches.

Scanner (OpenCV.js): illumination flattening, adaptive threshold, fiducials by shape and relative size, homography to canonical frame, bubble classes {filled, empty, ambiguous, multiple}, one-tap confirm on ambiguous (crop held in memory only), reject-and-retake on low contrast or missing corners.

Photocopy tolerance: 12 mm solid fiducials inset 12 mm from the edge (copiers crop 3-5 mm); detection by relative size so 92-100% reduction and 1-2 degrees of skew are absorbed by the homography; per-sheet normalisation between black and white patches; bubble fill measured as delta from the sheet's own empty-bubble median; 8 mm bubbles, 1.5 pt outlines, option letters outside the circle, pure black on white, nothing grey, "fill the circle completely with a dark pen".

Screens: Class -> Print (stacks and copy counts, merge explanation) -> Scan (or L3 entry) -> Review flags -> Learn (class misconception heatmap, per-child evidence, reteach card, tomorrow's stacks) -> Exit ticket mode.

Zero network requests at runtime (checked in DevTools); no images stored.

## 7. Deployment and cost slide

Cost per class per month (arithmetic shown on the slide; every input flagged as an assumption unless verified):

`cost = students x A5 sheets per month x (price per A4 side / 2)`, because two A5 sheets share one A4 side.

Assumptions: class of 41; 22 school days per month; photocopy price Rs 1 per A4 side (shops commonly charge in the range Rs 0.5-2; check the local rate and the school's own copier or riso cost); children use their own pens; teacher uses own phone; data cost Rs 0.

- Heavy (daily sheet + daily exit ticket = two A5 per child per day): 41 x 44 x 0.5 = Rs 902 per month. At Rs 0.5: Rs 451. At Rs 2: Rs 1,804. About Rs 22 per child per month at Rs 1.
- Lean (two targeted sheets + two exit tickets per week, about 4.3 weeks = 17 A5 per child per month): 41 x 17 x 0.5 = Rs 349 per month (about Rs 8.5 per child).
- Comparison, flagged assumption: eight shared tablets for a class of 41 (one per five children) at Rs 8,000 each = Rs 64,000 one-time, plus charging, content and replacement. Paper at Rs 902 per month would take about 71 months to equal that figure; at Rs 349 about 183 months. State that this compares cost only and says nothing about outcomes.

Who pays: the school's existing photocopy/consumables budget; verify any specific grant head before naming it. Adoption path: teacher receives a PDF pack (five master variants + two exit tickets, Punjabi/English) over WhatsApp, Bluetooth, or a pen drive; installs the PWA once over any connection, then fully offline; copies masters at the school copier or a shop; block/cluster resource persons share updated packs through WhatsApp groups. Updates are a PDF plus a JSON item file; signed packs are a stretch.

Pilot in three schools with one metric the teacher chooses (teacher minutes per day, share of sheets scanned without correction). Limits: copier access, teacher time (about 20 min a day), and cost figures are assumptions until measured.

## 8. Roll-number grid and fallbacks

Default: two-digit shaded grid. Risk: 10-12 year-olds mis-shading. Fallbacks, in order:

- B Scan-order mode: teacher scans sheets in roll-call order; the app announces "Next expected: roll 07" with a Skip button for absent children. If a shaded grid exists and disagrees with the expected roll, the sheet is flagged.
- C Teacher confirms from a crop: app shows the roll-number area of the sheet (child writes the number in a large box) and the teacher types two digits (about 3 s).

Decision rule: if fewer than 90% of children's grids are read correctly at first scan in the child session (section 9) or adult rehearsal, default switches to B. The grid, scan-order and crop reading are all implemented in the vertical slice's data model, because roll is only a field in the answer record.

## 9. Real child data or no child claims

Plan (decide at H8; owner E): 5-8 children aged 10-13 from a tuition centre, younger siblings or cousins of local teammates, or a volunteer school, with written guardian consent (Punjabi/English slip), a guardian or faculty chaperone present, organiser permission, no names or photos, no audio recording, children may stop anytime, aggregate reporting only, raw sheets destroyed after the event. Session length 30-40 minutes at about H22-26, ideally at the venue on the second morning, otherwise a teammate hosts it locally.

What we measure: (a) usability: share of children who shade the roll grid and bubbles correctly at first attempt and what they find confusing (this decides section 8); (b) scan pipeline: share of sheets read correctly, with flags; (c) pipeline check: whether predicted misconception matches the interviewer's reading after a two-question verbal why interview. Report as "n = k children, usability observations and pipeline check, not validation".

Decision rule: if fewer than five consented children can be arranged by H8, make no child-learning claim and no interview-agreement claim, and say so on the limitations slide. Adult-proxy numbers are rehearsal and scan-study data only and are never a headline. Mandatory regardless: one faculty member or teacher runs Print -> Scan -> Learn on four real sheets, timed per step, with a think-aloud and a quote captured with permission (E, H22-24).

## 10. Differentiation

| Capability | Diksha | Kolibri | ZipGrade | Eedi | Gyaan-Patra |
|---|---|---|---|---|---|
| Student device needed | Yes | Yes | No | Yes | No |
| Works offline | Downloads | Yes (server/LAN) | Yes | No | Yes, single phone |
| Photocopier-reproducible practice with stated sheet budget | No | No | Fixed sheets | No | Yes (at most five stacks, measured merge cost) |
| Diagnoses WHY (misconception) | No | Mostly no | No | Yes | Yes |
| Next task tests a hypothesis, including looks-mastered-but-ambiguous | No | No | No | Partly | Yes, with counterfactual |
| Same-day second data point without devices | No | No | No | No | Exit-ticket loop |
| Teacher explanation | Limited | Reports | Scores | Reports | Evidence, override, reteach card |

Descriptions and comparisons must be verified before presenting.

## 11. Misconception sourcing

Cite and verify references before slides: Hart et al., *Children's Understanding of Mathematics 11-16* (1981); Stacey, Steinle et al. on decimal misconceptions; Ashlock, *Error Patterns in Computation*; Brown and VanLehn (1980) buggy algorithms; Briggs et al. (2006) ordered multiple choice; Eedi/NeurIPS 2020 Education Challenge (inspiration, credited); NCERT Class 5-7 maths.

Process: D drafts 36 items with one tag per distractor; a second teammate tags independently; disagreements logged and resolved; B's simulation confirms identifiability; source note per tag in the app; teacher override ("Not what I see") halves the hypothesis and logs it. Limits: priors are expert/literature, not calibrated on Indian classrooms; Punjabi wording may shift option attractiveness.

## 12. Evaluation

### A) Simulation

200 synthetic students per seed, 10 seeds, two rounds, class size 41 as the main case. Policies under the same stack budget: fixed sheet; K=5 difficulty-only; K=5 hypothesis-driven (no merge, `MIN_GROUP = 1`); K=5 hypothesis-driven with merge (default). Per-child upper bound is a stretch arm.

Two generators shown side by side on the proof slide:

- Clean: matches engine assumptions (one misconception, independent slip 0.1).
- Mismatched: heterogeneous slip 5-25% per student; correlated errors via a per-student carelessness trait; guess rate 0.25-0.40; misconception applied with probability 0.5-0.95 per item; 30% of students hold two misconceptions; 10% blanks; some hold none; plus a run with the engine's assumed slip wrong.

Metrics: top-1 and top-2 identification after rounds 1 and 2, mean and SD; plus merge-cost metrics in section 5. Pre-declared: hypothesis-driven beats difficulty-only under both generators; if not under mismatch, report that. Statement on slide: this checks robustness of the algorithm to our own assumptions, not learning. Fallback: 100 students, 5 seeds.

### B) Scan study

Timeboxed H14-H20, hard stop H20 with whatever exists, minimum 12 sheets. Study set: 24 A5 sheets = eight laser originals, eight first-generation photocopies, eight second-generation photocopies (one batch at 92%), copies made from blank masters then filled; fill cards give ground truth; four sheets with messy marks (light pencil, partial fill, erasure, double mark).

Use two phones (own and cheapest available) and three lighting conditions (venue diffuse light on dark backdrop, dim, side glare). Each sheet scanned three times (phone A good light, phone B good light, phone B bad light) = 72 scans, about 430 answer decisions plus 144 roll-grid reads.

Report: corner-found rate, per-answer accuracy before and after one-tap confirm, precision/recall of filled, flags per 100 answers, roll-grid accuracy, seconds per scan, one failure image. Targets (not claims): at least 95% on originals, at least 90% on copies after confirm. Study runs on a tagged scanner build (tag at H14) in a separate browser profile, so integration bugs on the main branch cannot invalidate it.

### C) Faculty/teacher and child sessions

Run the faculty/teacher session and child session as described in section 9. Report only what was actually run, with sample sizes and limitations.

## 13. UI/UX and accessibility

Bottom nav Print / Scan / Learn plus an Exit-ticket tab; one primary action per screen; 48 px or larger touch targets; offline badge; WCAG 2.2 contrast 4.5:1; no colour-only cues (heatmap cells carry numbers); TalkBack labels on the main flow (checked once); scan lock = vibration + sound + green overlay; undo for corrections; unclear shown calmly, not as an error.

Sheets: pure black on white, 12 pt or larger, Punjabi and English. Reteach card: "11 of 41 children seem to think a bigger bottom number means a bigger fraction (M1). Try: fold two chapatis into halves and thirds and ask which piece is bigger. Board questions: ... Why we think so: 11 children chose B on Q2 and Q5 [See evidence] [Not what I see]." Twelve templated cards (four misconceptions x Punjabi/English, Hindi stretch). Heatmap: misconceptions x number of children; tap shows roll numbers.

## 14. Ethics, privacy, safety

Roll numbers only; no images stored (frames processed in memory and discarded); camera permission only on Scan; local-only storage; plain backup with warning; no public ranking or ability labels; shapes reassigned randomly each cycle and sheets carry only a shape and Practice Sheet; low-stakes use only (practice composition, never grading or placement); every inference overridable and logged; diagnosis shown only above the evidence threshold.

DPDP Act 2023 duties for minors' data are handled by collecting almost nothing (stated as design intent, not legal advice). Consent, chaperone and aggregate-only rules apply to any child session.

Limitations stated on a slide: expert priors, simulated validation, OMR error, one topic, copier dependency, roll-grid burden for younger children, daily cadence, first install needs a connection once, cost figures are assumptions.

## 15. De-risking

Ladder: L1 auto-corner scan; L2 teacher taps four corners, bubbles auto-read; L3 teacher taps answers on a bubble grid (about 15 s per child); L4 typed entry.

H5 gate (10 scans including two photocopies): L1 passes at 8/10 corners found and 90% accuracy after confirm. L1 fail but L2 pass: pitch says semi-automatic scan. Both fail: pre-decided pitch is photocopier-first hypothesis-testing sheets, merge rule and exit-ticket loop; the judge's sheet is still a real paper sheet entered with L3; scanner is shown as measured prototype with its numbers; A moves to fast-entry and heatmap.

Other controls: layout locked at H14; two identical printed demo sets in separate bags; pre-baked class of 41 with two prior rounds; second phone cloned; offline check at H26 (install, airplane mode, kill app, cold reopen, zero requests, on cheap phone); recorded two-minute backup video; disclosed recorded-scan replay; second pre-scanned judge sheet loadable via a Load earlier scan button and disclosed as such; copier scouted at H0 with runners at H3 and H20.

Venue rehearsal protocol: marked table spot; phone model and stand height written down (about 28 cm above a black chart-paper backdrop); overhead light plus diffuse lamp (tracing paper) at 45 degrees; A5 on dark clipboard; dark gel pen provided; instruction "fill the circle completely"; 10 consecutive scans must give at least nine with no critical error; repeat at H27, H29 and 15 minutes before the slot.

## 16. Unscripted-demo rehearsal protocol

Goal: the system must never over-claim, and unclear must look like a feature. Run at the venue at H27 and H29 with at least eight fillers on ■ and ▲ sheets, each scanned live, each sheet logged (intended pattern, system output, confident-and-wrong yes/no):

- all-A straight-lining -> expect unclear / not enough evidence, no named misconception;
- random answers -> expect unclear;
- partial (only Q1-Q3, rest blank) -> expect evidence from three questions only, at most a tentative leaning;
- M3-consistent (always the longer decimal larger) -> expect M3 named with evidence;
- M4-consistent (smallest-of and shorter-larger choices) -> expect M4 named;
- M1-consistent with two deliberate slips -> expect M1 leading but with visible uncertainty note;
- mix of M3 and M2 -> expect two moderate hypotheses and mixed wording;
- double marks and light pencil -> expect flags, not silent answers.

Acceptance: across at least 30 rehearsal sheets, zero confident-and-wrong outputs from fillers 1-3 and 8, and six of eight pattern types behave as expected. Any failure is fixed in the likelihood threshold or evidence rule, not hidden. In the live demo the presenter says before the judge starts: "If we can't tell, the app will say so. That is the right answer."

## 17. Build order, cut lines, roles, hour-by-hour

Write real clock times on the whiteboard at H0 (example: H0 = 09:00 on 30 Oct, so H10 = 19:00, H16 = 01:00 on 31 Oct, H24 = 09:00). Roles: A Vision (scanner); B Engine + simulation; C Frontend/PWA/i18n/a11y; D Content + sheet PDFs + copier ops; E Pitch + evaluation logistics + faculty and child sessions + deck. With four people merge E's logistics into D and the deck into C.

- H0-1: contracts (item schema, layout JSON in fiducial-normalised coordinates, answer record with roll field), repo, copier scouted.
- H1-5 spike: D sheet template v0 by H2, copies by H4; A fiducial detect, warp, bubbles on originals and copies; B Bayes update + EIG + assigner skeleton with unit tests; C PWA, roster, i18n shell; E stems with D, sourcing notes, consent slip, figures to verify.
- H5 gate: scanner go/no-go (section 15).
- H5-10: vertical slice with L3 manual entry (B and C lead, D feeds items, A builds L2 tap-corner): printed filled paper sheet -> tap-in answers -> posterior -> assignment with merge -> copy counts -> heatmap -> reteach card, offline, in Punjabi and English. H10 hard checkpoint: slice runs end to end on cheap phone. If not, everything else stops until it does.
- H10-16: scanner added behind slice (A; rest integrates and builds exit-ticket mode, E-frac/E-dec items, roll fallbacks); B runs simulation with merge arm and mismatched generator; D produces study masters.
- H14: sheet layout locked; scanner build tagged; study sheets printed, copied and filled H14-H17 by D and E and any free hands.
- H16: full path works with scanner or, if not ready, with L3. This is the cut line for the pitch: whichever rung passes becomes the demo rung.
- H17-20: scan study scanning (A + E), simulation plots (B), heatmap and reteach polish (C). H20: scanner frozen at whatever rung passes.
- H18: integration checkpoint; stretch items (signed packs, large-print, per-child arm, Hindi labels) only if green, in that order.
- H22-24: faculty session; H22-26: child session if approved at H8. H24: feature freeze.
- H24-27: accessibility pass, offline check, pre-baked data, deck (only obtained results), claim page, cost slide, backup video, credits (OpenCV.js, jsPDF, Dexie, Preact, ASER, UDISE+, Eedi, literature).
- H27-30: two timed venue rehearsals with filler protocol, Q&A drill, packing, rest. Cut order if behind: signed packs, Hindi labels, large-print, per-child arm, child session (then no child claims), substitute dataset check.

## 18. Demo script

Eight beats, five minutes, hard time boxes, recovery lines:

1. **0:00-0:30** Definition and verified figure from slide one. Recovery: if figure is unverified, say the qualitative sentence only.
2. **0:30-0:50** Constraint: phone in airplane mode, three stacks of sheets: "three stacks, not forty-one; that is what a photocopier can do."
3. **0:50-1:40** Judge fills a ■ sheet with a dark pen: "Fill Q1-Q4, shade your roll number; where there are two wrong answers pick either; try to fool us." Hard stop at 1:40; partial sheets are fine. Recovery: if judge picks all the same letter, say "this is the case it should call unclear", and show it.
4. **1:40-2:10** Live scan (30 s box). Recovery at 15 s without lock: "Camera is the hard part, so we built a ladder"; tap corners (L2), or grid (L3). At 2:10, load the pocket sheet regardless.
5. **2:10-2:50** Posterior with evidence bubbles and counterfactual line; if unclear, show the next sheet that would help. Recovery: use Not what I see to demonstrate teacher override.
6. **2:50-3:20** Surprising next sheet: pre-baked all-correct child still gets ■ because M4 is not ruled out.
7. **3:20-4:00** Pre-scanned second sheet (disclosed) with other wrong choices gives a different diagnosis; then class view: stacks and copy counts after merging (three stacks, three children moved, cost shown), reteach card in Punjabi/English, and one-line exit-ticket timeline.
8. **4:00-5:00** One proof slide: scan table including photocopies; simulation clean versus mismatched with merge cost; faculty quote and, if run, child usability numbers; cost per class per month and adoption path; limitations. Recovery: if short on time, show scan table and simulation only. Total failure: play the disclosed backup video.

## 19. Tough Q&A

- "ZipGrade plus a quiz bank?" Show the 6/6 child who is still assigned ■ because M4 predicts the same answers, then the measured comparison against difficulty-only under the same stack budget.
- "Your simulation proves your assumptions." We used a mismatched generator (heterogeneous slips, correlated errors, two-misconception students, blanks, different guess rates) and show the degraded result next to the clean one; real signals are the scan study, faculty session and, if run, child usability session.
- "Does merging hurt?" We measured it: stacks reduced from S0 to S1 at a cost of V percentage points of identification accuracy, changing W% of assignments; MIN_GROUP is teacher-adjustable and 1 turns it off.
- "Daily cadence is slow." It is the cadence a copier and teacher's time support, with a same-day exit ticket as a second data point; we do not claim per-question adaptation, and if devices exist an app should be used.
- "Did you test with children?" Either "n = k consented children, usability and pipeline check, not validation" or "no; we make no child-learning claim."
- "Can 11-year-olds shade a roll number?" Tested on k children; fallbacks are scan-order mode and teacher confirmation from a crop; default switches below 90% first-try accuracy.
- "Photocopies degrade." We tested first- and second-generation copies and a 92% reduction, with scale-tolerant detection and per-sheet normalisation (show table, including failures).
- "Grouping stigmatises." Shapes are random each cycle, sheets show no level, reports are teacher-only; no public ranking.
- "Who pays and how does it spread?" Show cost arithmetic with assumptions flagged and WhatsApp/pen-drive adoption path; first install needs a connection once.
- "Data safety?" Roll numbers, no images, local only, plain backup with warning; signed packs only if built.

## 20. Honest expectation

Targets: Innovation about 18 (hypothesis-testing sheets with a measured merge result and the looks-mastered-but-ambiguous example), Relevance 14 (verified device-access figure, exit-ticket loop, cost and adoption path), Technical about 22 (CV with copy tolerance, EIG assigner with merge rule, clean-versus-mismatched simulation, measured scan study), Prototype about 13 (vertical slice by H10, unscripted fill with graceful unclear, ladder, backups), Presentation 14 (eight timed beats, recovery lines, claim page).

Dominant risks: the scanner (H5 gate, H10 slice, H16 cut line) and recruiting children (H8 decision with a no-claims fallback).
