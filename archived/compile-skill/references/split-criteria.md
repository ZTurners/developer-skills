# Split Criteria: Deterministic vs Non-Deterministic

Used by the `compile-skill` SKILL.md (Step 2) to classify each section of an input
SKILL.md as **deterministic** (extract to Python) or **non-deterministic** (keep as
agent guidance).

---

## Deterministic Sections

A section or element is **deterministic** when its output is fully determined by its
inputs and no open-ended judgment is required. Classify as deterministic if it is:

### Ordered Step Lists (unambiguous)

Numbered steps where each step has a single mechanical outcome:
- ✓ "1. Read file X. 2. Extract all lines matching pattern Y."
- ✓ "3. Sort findings by severity descending."
- ✗ "1. Analyze the code quality." ← requires judgment

### Scoring and Ranking Rules

Explicit thresholds or weights that determine order or category:
- ✓ `severity = HIGH if violation_count > 5 else MEDIUM`
- ✓ "Output findings highest severity first."
- ✓ Tables of fixed numeric weights per category

### Parsing Logic

Instructions for extracting structured content from known formats:
- ✓ Named file patterns / globs: `**/*.cpp`, `documents/coding_standards/**`
- ✓ Named fields to extract from YAML frontmatter or Markdown headings
- ✓ Delimiter-based extraction rules ("content between `---` markers")
- ✓ Regular expression patterns stated explicitly

### Validation Checks

Pass/fail conditions with explicit, testable criteria:
- ✓ "Fails if identifier does not match `[A-Z][a-zA-Z0-9]*`"
- ✓ Rule-to-section mappings: "check `NamingConvention` against section 3.1 of standard"
- ✓ Error message text that must appear when a check fails

### Output Templates with Fixed Wording

Structural or textual requirements for the output that are invariant:
- ✓ Fixed heading text: `"## Findings (highest severity first)"`
- ✓ Table column definitions: "columns: File | Line | Rule | Severity"
- ✓ Sentences that must appear verbatim (disclaimers, labels)
- ✓ Required output sections listed by exact name

### File Discovery Rules

Specific locations, extensions, or filenames the agent must search:
- ✓ Specific folder paths: `{WORKSPACE}/documents/coding_standards`
- ✓ Specific file extensions to include: `.cpp`, `.hpp`
- ✓ Specific filenames: `basic_cpp_coding_standard.md`

---

## Non-Deterministic Sections

A section is **non-deterministic** when it requires semantic judgment, contextual
reasoning, or open-ended interpretation. Classify as non-deterministic if it is:

### Open-Ended Analysis

- "Identify any potential issues" — no explicit criteria
- "Review the code for quality" — judgment-based
- Anything requiring understanding of programmer intent or architecture

### Semantic Judgment

- "Suggest improvements" — agent decides what constitutes an improvement
- "Identify the most relevant standards" — relevance is contextual
- "Understand what the user wants" — intent detection

### Preference / Style Assumptions

- "Prefer clarity over brevity" — value judgment
- "When in doubt, flag it" — policy without mechanical rule
- Tone and phrasing guidance that is not a fixed output template

### Adaptive Behavior

- "If the user asks for X, do Y" — intent detection is inherently non-deterministic
- "Read context to determine the appropriate scope"

### Explanatory Prose

- Background explaining *why* a rule exists (not what the rule does)
- Motivation for a procedure step: "This helps ensure..."
- Caveats about when a rule may not apply

---

## Mixed Sections

Some sections contain both deterministic and non-deterministic content. Split at the
**sentence or bullet level**:

| Content | Classification |
|---------|----------------|
| "List all found standards files" | Deterministic — produces a deterministic list |
| "For each section, identify the specific rules" | Non-deterministic — requires judgment |
| "List all `.cpp` files under `src/`" | Deterministic — glob pattern |
| "List cpp files from context and user input" | Non-deterministic — "from context" requires interpretation |
| "Sort findings highest severity first" | Deterministic — explicit ordering rule |
| "Provide a clear and actionable summary" | Non-deterministic — clarity is judgment |
| "Output a table with columns: File, Line, Rule, Severity" | Deterministic — fixed schema |
| "Include any other relevant findings" | Non-deterministic — relevance requires judgment |

**When a section is mixed**: extract the deterministic bullets into the Python script
and leave the non-deterministic bullets in the compiled skill instructions. Insert a
`> **[Compiled — Deterministic]**` block at the position of the extracted content to
show where the script runs.

---

## Classification Decision Table

Use this as a quick-reference before consulting the full criteria above.

| Indicator phrase | Classification |
|-----------------|----------------|
| "List all X matching pattern Y" | Deterministic |
| "Find files in folder Z with extension E" | Deterministic |
| "Sort by / order by" | Deterministic |
| "Validate that X matches rule Y" | Deterministic |
| "Output format: table with columns..." | Deterministic |
| "If count > N then severity = S" | Deterministic |
| "Output the following heading verbatim: ..." | Deterministic |
| "Analyze / review / assess" (no criteria stated) | Non-deterministic |
| "Suggest / recommend" | Non-deterministic |
| "Understand / interpret" | Non-deterministic |
| "Identify the most relevant / best / appropriate" | Non-deterministic |
| "Provide clear / actionable feedback" | Non-deterministic |
| "When in doubt..." | Non-deterministic |
| "Consider whether..." | Non-deterministic |
| "This helps ensure..." | Non-deterministic (prose) |

---

## Classification Confidence and Fallback

If a section or element **cannot be classified with confidence** after applying the
criteria above:

1. Default to **non-deterministic** (preserve as agent guidance).
2. Record the ambiguity in the Equivalence Check → Known Deviations section.
3. Add a `<!-- UNRESOLVED: reason -->` HTML comment inline in the compiled skill at
   the location of the ambiguous content.

Never silently force an ambiguous section into a deterministic Python function.
