---
name: compile-skill
description: >
  Splits an existing SKILL.md into deterministic and non-deterministic sections, then
  generates two output artifacts: a compiled skill file (retaining non-deterministic
  guidance, wired to the generated Python script) and a Python script implementing all
  deterministic logic as pure, testable functions. USE FOR: compiling a skill, splitting
  skill logic into deterministic vs non-deterministic parts, extracting deterministic steps
  from a SKILL.md, generating a Python script from structured skill instructions, behavioral
  equivalence analysis, making skill steps testable. DO NOT USE FOR: creating new skills
  from scratch (use agent-customization skill instead); general Python code generation
  unrelated to a SKILL.md file.
argument-hint: 'Path to the SKILL.md to compile; optionally a target output folder'
---

# compile-skill

Analyzes a SKILL.md file, classifies its sections as **deterministic** or
**non-deterministic**, and generates two behaviorally equivalent artifacts:

- A **compiled skill file** that retains all semantic guidance and wires the
  deterministic path to the generated Python script.
- A **Python implementation script** that implements all deterministic logic as
  pure, independently testable functions.

---

## When to Use

Activate this skill when the user wants to:

- "Compile" a SKILL.md into a deterministic, testable Python script
- Extract all rule-based, step-ordered, or template-driven logic from a skill
- Separate open-ended agent guidance from mechanical procedure logic
- Analyze which parts of a skill require semantic judgment vs. deterministic execution
- Generate a Python implementation from structured skill instructions

---

## Memory Policy

- User Memory [NoAccess, NoStore]
- Session Memory [NoAccess, NoStore]
- Repo Memory [NoAccess, NoStore]

---

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| `skill-path` | Yes | Path to the SKILL.md to compile (e.g., `skills/my-skill/SKILL.md`) |
| `target-folder` | No | Override output folder. Defaults to the same folder as `skill-path`. |

---

## Naming Rules

Given input path `<skill-folder>/SKILL.md` where the folder's base name is `<skill-name>`:

| Artifact | Output Path |
|----------|-------------|
| Compiled skill | `<skill-folder>/compiled/<skill-name>.compiled.skill.md` |
| Python script | `<skill-folder>/compiled/scripts/<script-name>.py` |

`<script-name>` = `<skill-name>` with all hyphens (`-`) replaced by underscores (`_`).

**Example** — input `skills/check-cpp-coding-standard/SKILL.md`:
- Compiled skill → `skills/check-cpp-coding-standard/compiled/check-cpp-coding-standard.compiled.skill.md`
- Python script → `skills/check-cpp-coding-standard/compiled/scripts/check_cpp_coding_standard.py`

---

## Procedure

### Step 1 — Read and Parse the Input Skill

1. Read the full content of the input SKILL.md.
2. Extract the YAML frontmatter block (content between the first pair of `---` markers).
3. Enumerate every top-level H2 heading and capture its body text.
4. Note all file references (links to `./references/`, `./scripts/`, `./assets/`).

### Step 2 — Classify Each Section

For each H2 section — and for mixed sections at the individual bullet or sentence level —
classify content as **deterministic** or **non-deterministic** using the criteria in
[split-criteria.md](./references/split-criteria.md).

Produce a classification table before proceeding:

| Section | Subsection / Element | Classification | Reason |
|---------|----------------------|----------------|--------|

Use this table as the source of truth for Steps 4, 5, and 6.

### Step 3 — Extract Deterministic Elements

From all deterministic content, assign each element to one of five extraction categories:

| Category | Function prefix | Covers |
|----------|-----------------|--------|
| Parse | `parse_*` | File discovery, content extraction, pattern matching |
| Validate | `validate_*` | Rule checks yielding pass/fail and violation details |
| Select | `select_*` | Ranking, filtering, sorting, deduplication |
| Format | `format_*` | Assembling output from structured data |
| Constants | `UPPER_SNAKE_CASE` | All fixed text: headings, error messages, labels |

For each element, record:
- Source location (section heading + bullet or line context)
- Extraction category
- Exact text, rule, pattern, or template to preserve verbatim

### Step 4 — Generate Python Script

Create `<skill-folder>/compiled/scripts/<script-name>.py` following
[python-script-template.md](./references/python-script-template.md).

Mandatory rules:

1. **Constants block first**: All output text, headings, and messages as module-level
   `UPPER_SNAKE_CASE` constants before any function definition.
2. **Function order**: `parse_*` → `validate_*` → `select_*` → `format_*` → `main()`.
3. **Function size limit**: ≤ 30 lines per function. Extract named helpers for larger logic.
4. **Purity**: No `random`, `datetime.now()`, `uuid.uuid4()`, or unordered `dict`/`set`
   iteration in any output-producing code path.
5. **Plain data contracts**: Functions accept and return only `str`, `list`, or `dict`.
   No I/O or side effects outside `main()`.
6. **CLI interface**: `main()` parses `--input <file>` (default `sys.stdin`) and writes to
   `sys.stdout`.
7. **Error fidelity**: Every error and fallback message must be the verbatim text from the
   original skill. Raise `ValueError(CONSTANT_NAME)` — never an ad-hoc inline string.
8. **No silent fallbacks**: Every invalid branch must raise; never silently skip or pass.

### Step 5 — Generate Compiled Skill File

Create `<skill-folder>/compiled/<skill-name>.compiled.skill.md` with this exact structure:

1. **YAML frontmatter**: Copy the original frontmatter, then append three fields:
   ```yaml
   compiled: true
   source: SKILL.md
   script: scripts/<script-name>.py
   ```

2. **Non-deterministic sections verbatim**: Copy unchanged, preserving all headings and
   wording exactly. Do not paraphrase or alter.

3. **Replaced deterministic procedure blocks**: For each deterministic block, substitute
   the original prose with the following template — fill in placeholders, change nothing
   else:

   ```markdown
   > **[Compiled — Deterministic]**
   > Implemented in `./scripts/<script-name>.py` — function `<function_name>()`.
   > Run: `python ./compiled/scripts/<script-name>.py --input <arg-description>`
   > Expected output: <one-line description of the output format>
   > **Do not re-implement this logic inline.**
   ```

4. **Equivalence Check section**: Append the section generated in Step 6.

### Step 6 — Generate Equivalence Check Section

Fill in and append the following section to the compiled skill file:

```markdown
---

## Equivalence Check

> Auto-generated by the `compile-skill` skill.
> Records behavioral parity between the original `SKILL.md` and this compiled file.

### Procedure Parity

| Step | Original Behavior | Compiled Behavior | Status |
|------|-------------------|-------------------|--------|

### Output Parity

| Output Element | Original Wording / Format | Compiled Constant / Function | Status |
|----------------|---------------------------|------------------------------|--------|

### Known Deviations

- None
```

Rules for filling in the tables:

- Use the classification table from Step 2 as the source of truth.
- **Procedure Parity**: one row per deterministic step, mapped to its generated function.
  Omit non-deterministic steps (they are preserved verbatim, so parity is automatic).
- **Output Parity**: one row per piece of fixed output text, mapped to its constant name.
- **Status values**: `✓ Equivalent` | `⚠ Partial (see Known Deviations)` | `✗ Not implemented`
- Set `⚠ Partial` and add a Known Deviations entry for any step that required
  interpretation or simplification during translation.
- If a section could not be classified with confidence, default to non-deterministic and
  record the ambiguity as a Known Deviation.

---

## Constraints

- Do not alter observable behavior during translation. Same inputs → same outputs,
  same step order, same branch rules, same error text, same output headings.
- Do not add validation rules not present in the original skill.
- Do not reorder steps unless the original explicitly states the steps are unordered.
- All runtime output text must originate from a module-level constant in the Python
  script — never a hard-coded inline string inside a function body.
- Document every `⚠ Partial` and `✗ Not implemented` status with an explanation in
  Known Deviations. Never leave a deviation silent.
