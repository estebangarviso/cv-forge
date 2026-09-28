# GitHub Copilot skills (cvforge)

| Skill                                                             | Use when                                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [google-drive-cv-storage](google-drive-cv-storage/SKILL.md)       | Reading, writing, listing, or deleting CVs via Google Drive                    |
| [google-oauth-token-refresh](google-oauth-token-refresh/SKILL.md) | Touching `src/auth.ts` / `src/proxy.ts`, or debugging stale sessions           |
| [cv-editor-split-view](cv-editor-split-view/SKILL.md)             | Changing the editor's form+preview layout or scroll                            |
| [form-composition](form-composition/SKILL.md)                     | Adding a form section/field, or a form file growing past ~300 lines            |
| [react-pdf-cv-rendering](react-pdf-cv-rendering/SKILL.md)         | Changing `CvPdfDocument`/`cv-pdf-*` components, PDF fonts, or `@shared/ui/pdf` |

Each skill is grounded in a real bug or non-obvious convention in this codebase — see its `References` section for the exact files.
