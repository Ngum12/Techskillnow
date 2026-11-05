# Digital product creator course — guided workshop revision

- ID: `digital-product`; base price **2,500 FCFA**; existing referral pricing is unchanged.
- 21 lessons; first 4 free, including the first ChatGPT account and prompting simulations.
- English, with the existing English fallback for French requests.
- Existing checkout, access-code, progress, assessment and certificate workflows; no database migration.

## Teaching pattern

Each lesson first presents two or three sequential learning cards. Every card includes a plain-language explanation, a worked example and a highlighted takeaway. Only then does the learner enter a guided simulation. Reading cards can be revisited without discarding the mounted simulation.

The active course now uses `creatorWorkshop`. The previous long-form `creatorLab` renderer remains for backward compatibility with cached task payloads; it is not used by this course's revised lesson definitions. The new local completion cache does not inherit passes from the old lesson numbering. Existing saved project strings under `tsn_creator_project_v1` are preserved. Because lesson numbers changed, returning learners should revisit the pathway from lesson 1 rather than assume old saved progress describes the same lesson.

## Pathway and visible results

1. Turn through a four-page finished sample and inspect why each page works.
2. Build a reader/outcome/title card from a worked example.
3. Rehearse ChatGPT account creation and identify workspace controls.
4. Type a taught prompt and inspect an authored assistant response.
5. Repair a weak prompt, receive ingredient feedback and compare the improved response.
6. Request and save an outline.
7. Request and inspect an action/checkpoint/fix draft.
8. Tap problematic draft lines and replace them with defensible wording.
9. Assemble an instruction from three small inputs and see it enter the editable draft.
10. Rehearse Canva account creation and locate design/upload/export controls.
11. Create a document, fix readability, inspect pages and export an actual PDF.
12. Understand Google-account access to Drive and locate its storage controls.
13. Move files into purpose-specific folders and download a real project backup.
14. Hear practice reader questions and revise the visible document.
15. Change price/fee/cost controls; compare zero/three/ten sales.
16. Rehearse Selar account creation and locate seller tools.
17. Save a practice store profile and inspect the resulting identity.
18. Attach a real PDF, build a listing and inspect the published practice offer.
19. Inspect payout requirements and rehearse pending/failed/confirmed payment and file delivery.
20. Compose a launch post, inspect its status preview and answer a buyer question.
21. Complete a sequential real-platform handover and download the launch pack.

## Account simulations

ChatGPT, Canva, Selar and Google Drive all offer a signup rehearsal and an “already have an account” skip. All learners still complete a workspace-control tour. The email path uses a supplied dummy email, dummy password and training inbox code. A separate Google account-selection route avoids incorrectly pretending Google sign-in requires the same email signup screens.

These are representative, labelled training interfaces. They do not claim to reproduce current vendor screens exactly or open accounts. Live methods, screen labels, eligibility and verification requirements can change. Do not collect real passwords, payment PINs, OTPs or identity documents. Only official services should receive real account information.

## Prompting and drafting

`ChatWalkthrough` contains a New chat control, editable composer, prompt ingredient feedback, visible user messages and authored assistant responses. Initial prompt exercises show the worked prompt; the correction exercise starts with an intentionally weak prompt and a weak-response example. Completed responses can save the outline/draft into the learner project.

No live AI API calls are made. The response examples are explicitly labelled course-authored training responses. They do not prove factual correctness, demand or earnings. The real-world handover asks learners to apply the practised prompt structure to their own original subject, tested method and verified evidence.

## Design and assets

Creator illustrations and the course card use containment rather than cropping. Other course illustration behaviour is preserved. All six original PNGs remain; the course uses smaller WebP derivatives.

The training designer has document selection, title, page tabs, size/contrast controls, optional original-image upload and actual jsPDF download. All three pages must be inspected before export. The PDF uses narrow phone-friendly pages, the selected readable type scale and an optional uploaded image. The training preview is not claimed to implement every Canva layout feature. Standard PDF fonts support English/French text; other scripts require separate review.

## Storage and boundaries

Project data is local to the current browser; it does not sync across learner accounts or devices. Backup/restore, storage warnings and shared-phone clearing remain available. Original images should also be retained in the learner's own product folder; an image selected in a designer session is not part of the JSON draft backup.

Practice uploads stay in memory for the current browser session, and practice publishing/payment states never contact Selar or move money. Profile and listing forms display results instead of pretending to create live stores. Real-world actions are explicit learner declarations, not automatically verified claims.

Check current Selar Cameroon payment/payout routes, verification requirements, fees and holds before updating platform-specific guidance. The money sandbox uses hypothetical adjustable fees. No real transactions or external messages are sent by this course.

## Validation limits

TypeScript compilation is checked. Phone-sized browser review uses local course fixtures only inside the inspection browser so that individual workshop screens can be viewed without weakening paid server access. The deployed API still decides which lessons are free or paid. Real account creation, real payouts and the learner's originality/reader trials require actual external work.

The current environment has a pre-existing Google Fonts access restriction that blocked production builds of the homepage Newsreader font. Do not claim a production build passed or use fake font responses to bypass that restriction.
