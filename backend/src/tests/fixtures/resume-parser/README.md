# PATHWAY.ECO — Resume Parser Synthetic Test Corpus

## Overview

This directory contains a comprehensive, reusable synthetic resume dataset designed to rigorously benchmark, evaluate, and prevent regressions in the PATHWAY.ECO resume parsing pipeline.

The dataset covers **20 distinct candidate scenarios** across both **PDF** and **DOCX** formats (40 total test documents), paired with independently authored ground-truth JSON files.

All candidate identities, companies, phone numbers, email addresses, and URLs are **100% fictional** to ensure zero exposure of private personal information.

---

## Directory Structure

```
backend/src/tests/fixtures/resume-parser/
├── resumes/                      # 40 Test Documents (20 PDF + 20 DOCX)
│   ├── resume-01-student-no-exp.pdf
│   ├── resume-01-student-no-exp.docx
│   ├── ...
│   ├── resume-20-complex-wrapped-bullets.pdf
│   └── resume-20-complex-wrapped-bullets.docx
├── expected/                     # 20 Independently Authored Ground Truth Files
│   ├── resume-01-student-no-exp.json
│   ├── ...
│   └── resume-20-complex-wrapped-bullets.json
├── test-matrix.json              # Full Machine-Readable Test Metadata Matrix
└── README.md                     # Dataset Documentation (This File)
```

---

## Candidate Scenarios Matrix

| # | Scenario ID | Candidate Name | Category | Formatting Style | Expected Counts |
|---|-------------|----------------|----------|------------------|-----------------|
| 1 | `resume-01-student-no-exp` | Kavya Ramesh | student_no_experience | clean_single_column | Edu: 2, Exp: 0, Intern: 0, Proj: 2, Cert: 0, Links: 2 |
| 2 | `resume-02-fresher-academic-projects` | Rohan Varma | fresher_academic_projects | academic_serif | Edu: 1, Exp: 0, Intern: 0, Proj: 2, Cert: 2, Links: 2 |
| 3 | `resume-03-fresher-multi-internships` | Sneha Deshmukh | fresher_multiple_internships | modern_tech | Edu: 1, Exp: 0, Intern: 2, Proj: 1, Cert: 0, Links: 2 |
| 4 | `resume-04-recent-grad-intern-fulltime` | Aditya Kulkarni | recent_grad_intern_fulltime | standard_chronological | Edu: 1, Exp: 2, Intern: 0, Proj: 1, Cert: 0, Links: 2 |
| 5 | `resume-05-fullstack-2y-exp` | Pranav Nair | fullstack_2y_exp | compact_single_column | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 1, Links: 2 |
| 6 | `resume-06-backend-multi-employer` | Meera Iyer | backend_multi_employer | company_first | Edu: 1, Exp: 3, Intern: 0, Proj: 0, Cert: 0, Links: 2 |
| 7 | `resume-07-frontend-freelance` | Aarav Mehta | frontend_freelance | creative_portfolio | Edu: 1, Exp: 2, Intern: 0, Proj: 1, Cert: 0, Links: 3 |
| 8 | `resume-08-java-certified` | Vikram Joshi | java_certified | corporate_standard | Edu: 1, Exp: 1, Intern: 0, Proj: 0, Cert: 3, Links: 2 |
| 9 | `resume-09-python-ai-research` | Ananya Sen | python_ai_research | research_academic | Edu: 2, Exp: 1, Intern: 0, Proj: 1, Cert: 0, Links: 2 |
| 10 | `resume-10-senior-engineer-7y` | Tarun Singhania | senior_engineer_7y | dense_multipage | Edu: 1, Exp: 3, Intern: 0, Proj: 0, Cert: 0, Links: 2 |
| 11 | `resume-11-engineering-manager` | Nandita Roy | engineering_manager | executive_layout | Edu: 1, Exp: 2, Intern: 0, Proj: 0, Cert: 0, Links: 2 |
| 12 | `resume-12-career-switcher` | Deepak Chawla | career_switcher | hybrid_functional | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 1, Links: 2 |
| 13 | `resume-13-traditional-single-column` | Harish Patel | traditional_single_column | classic_times | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 0, Links: 2 |
| 14 | `resume-14-two-column-layout` | Ritu Sharma | two_column_layout | two_column_visual | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 0, Links: 2 |
| 15 | `resume-15-tables-structured` | Sandeep Reddy | tables_structured | tabular_grid | Edu: 1, Exp: 1, Intern: 0, Proj: 0, Cert: 2, Links: 2 |
| 16 | `resume-16-multi-project-inline-repos` | Pooja Hegde | multi_project_inline_repos | clean_projects_centric | Edu: 1, Exp: 0, Intern: 0, Proj: 2, Cert: 0, Links: 2 |
| 17 | `resume-17-unusual-headings` | Manish Agarwal | unusual_headings | creative_headings | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 0, Links: 2 |
| 18 | `resume-18-diverse-date-formats` | Divya Menon | diverse_date_formats | varied_dates | Edu: 1, Exp: 2, Intern: 0, Proj: 0, Cert: 0, Links: 2 |
| 19 | `resume-19-missing-info` | Karthik Swaminathan | missing_info | sparse_minimal | Edu: 1, Exp: 1, Intern: 0, Proj: 0, Cert: 0, Links: 0 |
| 20 | `resume-20-complex-wrapped-bullets` | Shalini Verma | complex_wrapped_bullets | dense_wrapped_bullets | Edu: 1, Exp: 1, Intern: 0, Proj: 1, Cert: 0, Links: 2 |

---

## Format Generation Architecture

1. **PDF Generation (`pdf-lib`)**:
   - Uses `pdf-lib` standard vector text rendering with standard typography (Helvetica, Times, Courier).
   - Generates single-column standard top-down flows and multi-column sidebars without third-party CLI tools or native binaries.
   - Text streams adhere to standard PDF text matrices, making text parseable via `pdf-parse` layout and simple modes.

2. **DOCX Generation (OpenXML Package Engine)**:
   - Built with native Node.js `zlib` and raw OPC ZIP packaging (zero new external npm dependencies).
   - Includes standard `[Content_Types].xml`, relationships, and `word/document.xml` formatting tags (`<w:p>`, `<w:r>`, `<w:tbl>`, `<w:tc>`, bullet indentation `<w:ind>`).
   - Validated against `mammoth` structured extraction.

---

## Ground Truth Schema Contracts

Expected ground-truth files strictly align with TypeScript interfaces (`StructuredResumeData` and `ParsedResumeData`):

- **Personal Info**: `name`, `email`, `phone`, `location`, `headline`, `bio`
- **Education**: `institution`, `degree`, `fieldOfStudy`, `startYear`, `endYear`, `isCurrent`, `gpa`
- **Experience**: `company`, `roleTitle`, `employmentType`, `startDate`, `endDate`, `isCurrent`, `bulletsCount`
- **Internships**: `company`, `roleTitle`, `employmentType`, `startDate`, `endDate`, `isCurrent`, `bulletsCount`
- **Projects**: `title`, `role`, `technologies`, `githubUrl`, `projectUrl`, `bulletsCount`
- **Certifications**: `name`, `issuingOrganization`, `issueDate`, `expiryDate`, `credentialId`
- **Technical & Soft Skills**: `technicalSkills`, `softSkills`
- **Professional Links**: `platform`, `url`
- **Languages**: `language`, `proficiency`

---

## Evaluation Harness & Discrepancy Taxonomy

The automated evaluation harness (`backend/src/scripts/testResumeParserCorpus.ts`) evaluates both PDF and DOCX files against the expected ground truth and categorizes differences according to:

1. **Missing Record (False Negative)**: An expected entity was not found in the parsed output.
2. **Incorrectly Classified Record**: An entity was detected but placed in the wrong section (e.g., an internship placed in experience, or a project label extracted as an experience entry).
3. **Correct Record with Missing Fields**: The entity was detected, but key attributes (e.g., startYear, degree, issuingOrganization) were empty or unparsed.
4. **Incorrect Field Value**: An extracted attribute had an inaccurate value (e.g., start year parsed as 2021 instead of 2020).
5. **Fabricated Field (False Positive)**: The parser extracted an entity or field not present in the source resume or ground truth.
6. **Duplicate Record**: The same entity was extracted more than once.

---

## How to Run the Evaluation Harness

To run the automated corpus evaluation harness:

```bash
# Build backend
npm --prefix backend run build

# Run corpus test harness
node backend/dist/scripts/testResumeParserCorpus.js
```
