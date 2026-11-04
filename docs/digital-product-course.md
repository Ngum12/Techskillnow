# Digital product creator course

- Course ID: `digital-product`
- Base price: **2,500 FCFA** (existing referral pricing still applies).
- Language: English. The existing locale fallback serves this version for French requests.
- 16 lessons; first 2 free; 12-question final assessment, 80% pass mark.
- Uses existing course registration, checkout, access codes, progress, assessment and certificate workflows. No database migration required.

## Learning path

1. Identify a useful result rather than an income promise.
2. Save the learner's audience, product promise and experience.
3. Interview five potential readers and record actual findings.
4. Set up ChatGPT, Canva and storage; understand each tool's purpose.
5. Assemble a reader's route and create the outline.
6. Build a personalised AI prompt; use it in the real service.
7. Repair vague practice instructions; author an actionable original draft.
8. Check claims, originality and visual permissions.
9. Inspect the phone preview; export the PDF; design in Canva if desired.
10. Run a real beginner trial and revise the guide.
11. Set a product price; explore hypothetical fees and costs.
12. Create a real Selar account and store.
13. Check actual payment and payout availability and verification.
14. Create the real listing; rehearse PDF upload, checkout and delivery.
15. Write a seven-day launch kit with permission-based promotion.
16. Practise customer support and download final deliverables.

## Implementation

`content/digital-product/en.ts` contains all instructional content and curated scenarios. `creatorLab` is the new task type. `CreatorStudio` is loaded on demand by the existing task renderer. `PublishingRehearsal` is a fictional training interface, not an imitation claimed to match Selar's current screens.

The six uploaded illustrations are retained. Smaller WebP derivatives in `public/illustrations/creator-*` are used for the course. Course cards now support the existing optional cover field.

The product project saves locally under `tsn_creator_project_v1`. It is **not** linked to a learner account and does **not** sync across devices. Shared-device notices, clear-project controls, JSON backup/restore and download tools are provided. Private verification notes are excluded from the customer PDF but included in the learner's launch pack. Import accepts only known string fields, limits lengths and requires confirmation before replacing local work.

PDF export loads jsPDF on demand and produces a simple selectable-text document. It uses standard fonts suitable for English/French text, normalises unsupported punctuation, and does not claim to provide full Canva layout or arbitrary writing-system support. Visual preview font/colour controls do not change the export layout. Learners should use Canva for advanced layouts and original demonstration photos.

No AI API calls, real payments, Selar integrations or credential collection are introduced. AI prompts are generated from the saved project and copied into the learner's chosen service. Real account, verification, reader-trial and launch tasks are learner declarations, not independently verified evidence. All practice payment states are explicitly simulated. The rehearsal's PDF remains in memory for that session and is never uploaded.

Before revising platform-specific instructions, check Selar's current Cameroon account requirements, accepted payment methods, payout routes, fees and holding periods. Do not promise MTN/Orange availability without checking the actual account and checkout. Hypothetical fee defaults in the sandbox are not Selar's published prices.

## Current environment evidence

TypeScript checks pass. The production build encounters the existing homepage Newsreader download failure because this environment cannot reach Google Fonts. No font verification bypass or mock responses were used. Database-backed purchases, payouts and signed-in progress require the configured external credentials and have not been exercised as real transactions.
