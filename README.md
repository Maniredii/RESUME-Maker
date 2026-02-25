# ATS Resume Studio

A lightweight, Overleaf-inspired resume platform where users write resumes in a live editor and instantly get:

- Real-time formatted preview
- ATS score with section/format checks
- Job-description keyword match insights
- Guided **Next Steps** suggestions
- One-click insertion of missing keywords into skills
- Template switcher (Software, Data, Product)
- Export to HTML and Print/Save as PDF

## Run locally

Because this project is plain HTML/CSS/JS, you can run it with any static server.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Next platform milestones

To turn this into a full hosted platform similar to Overleaf:

1. Authentication + cloud projects (save/share resumes)
2. Collaborative editing + comments + version history
3. Rich template marketplace + custom theme editor
4. Backend ATS scoring service + model-based feedback
5. PDF pipeline with strict typography controls
