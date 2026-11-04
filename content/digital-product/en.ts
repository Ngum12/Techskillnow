import type { Course, Step } from '../types';
import type { CreatorLabTask, ProjectField } from '@/lib/creator/types';
const field = (key: ProjectField, label: string, hint: string, min = 30) => ({key,label,hint,min});
const round = (scene: string, options: [string,string,boolean][], customer = 'Merveille’s practice shop') => ({scene,customer,options:options.map(([text,feedback,correct])=>({text,feedback,correct}))});
const lesson = (title: string, illustration: string, body: string[], task: Omit<CreatorLabTask,'type'|'success'>, success: string, mistake?: string): Step => ({title,illustration,body,mistake,task:{type:'creatorLab',...task,success}});
const course: Course = {
 id:'digital-product',locale:'en',
 title:'Start Selling & Earning with Your First Digital Product — Right Now',
 promise:'Turn something you know into a useful practical guide with AI, create the PDF on your phone, open your Selar shop and prepare your first launch. No audience or laptop required to begin; sales are not guaranteed.',
 price:2500,track:'career',series:'Create • Publish • Launch',
 audience:'For phone-first creators with a useful skill to share',
 outcomes:['Your original practical guide as a downloadable PDF','Your own Selar account, listing and payout setup checklist','AI prompts, a product preview and a seven-day launch kit'],
 cover:'creator-cover',badge:'creator-complete',freeSteps:2,
 steps:[
 lesson('Your phone becomes a product studio','creator-cover',[
  'A digital product is a file or resource someone buys to achieve a result. Your product here is a short practical guide: clear actions, useful visuals, checkpoints and fixes. Length is not the value. Helping a beginner do something is.',
  'Meet Merveille, a fictional baker in Douala. People keep asking how she prepares a small birthday cake. We will help her package a method she has actually tested, then build YOUR own product alongside hers. Choose cooking, cake decorating, crafts, phone photography or another skill you can verify.',
  'You leave with a PDF, a shop listing and a launch kit. The exercises cannot open accounts or collect money for you. You will complete those steps in the real services. Start today, then allow time for reader feedback and verification. Income depends on demand, quality and reaching customers.'
 ],{stage:'Find the useful result',instruction:'At the customer desk, choose the offer that helps someone complete a real task.',rounds:[
  round('A first-time baker says: “I have one small oven and I cannot get an even cake. What exactly will your guide help me do?”',[
   ['Learn absolutely everything about baking.','Too broad. A beginner cannot tell what they will finish.',false],
   ['Prepare one small birthday cake with a tested method, equipment list, doneness checks and fixes for common problems.','Specific reader, practical constraints and an observable result. That is a useful product promise.',true],
   ['Make 100,000 FCFA this weekend guaranteed.','An unsupported earnings promise does not teach baking or establish demand.',false]
  ]),
  round('Merveille finds a popular paid guide online. What should she create?',[
   ['Copy it and use AI to change the words.','Rewording another creator’s work does not make it yours. Build from your experience and permitted sources.',false],
   ['Write her tested method, use her own process photos and ask a beginner to try the instructions.','Original experience plus a real reader test creates value that generic text cannot supply.',true],
   ['Generate 80 pages so it looks expensive.','Extra pages increase effort and data use without necessarily improving the result.',false]
  ])]},'You can recognise a practical product people can evaluate.','Do not confuse an attractive file with a useful result.'),
 lesson('One reader. One problem. Your first offer.','creator-reader',[
  'Start with people you can reach. “Everyone in Africa” is not a useful first audience. “Beginners in my neighbourhood baking with a small oven” gives you equipment, language and budget constraints to address.',
  'Write: “I help [reader] do [specific task] with [available resources].” Keep the result under the reader’s control. Do not promise income, cures or guaranteed success.',
  'Choose a title that names the action. For example: “Decorate Your First Birthday Cake with Three Simple Piping Patterns.” You do not need to pretend to be an expert. State what you have actually done and where your experience stops.'
 ],{stage:'My product · the promise',instruction:'Build your own product card. These details will power your AI prompt and sales listing.',fields:[
  field('title','Product title','Name a useful action, not “The Ultimate Everything Guide”.',10),
  field('audience','Who is this for?','Describe their experience, tools, language and main difficulty.'),
  field('outcome','What will the reader finish?','One achievable result; no earnings or health guarantees.'),
  field('experience','What can you genuinely teach?','Your experience, available equipment, limits and what you must research.',50)
 ]},'Your product now has a reader and a clear purpose.'),
 lesson('Investigate demand before creating','creator-baker',[
  'Talk to five people who resemble your reader. Ask: “When did you last try this? What went wrong? What did you use to solve it? What would make instructions useful?” Record their exact problems without names or private contact details.',
  '“Would you buy my amazing guide?” invites politeness. Evidence is a recent problem, an existing workaround and a request for a specific solution. Five conversations are a starting signal, not proof of a market.',
  'Show a proposed contents list or sample. If people do not need the result, adjust the idea now. You can return to your product card without losing your work. Do not invent research or AI-generated testimonials.'
 ],{stage:'Demand detective',instruction:'Interview the reader, then record your actual findings.',rounds:[
  round('You ask a neighbour whether your cake guide sounds nice. She says yes. What is the most useful next question?',[
   ['Would you definitely buy it?','This encourages a promise that may not reflect behaviour.',false],
   ['Tell me about the last cake you tried. Where did you get stuck and what did you do?','Past behaviour and concrete difficulties reveal what the guide needs to solve.',true],
   ['Can I quote you as a satisfied customer?','She has not used the product. That would misrepresent her experience.',false]
  ])],fields:[field('demand','Your five conversations','For each: recent attempt, difficulty, existing workaround and requested help. Finish with what you will change. No personal details.',150)],checklist:['I spoke with five suitable people and recorded their real responses.']},'Your idea is grounded in conversations, not invented demand.'),
 lesson('Set up your creator tools on your phone','creator-product',[
  'Use a small toolset: ChatGPT for questions, outlines and editing; Canva for visual layout and PDF export; Google Drive or phone storage for versions; Selar for your store and delivery. You do not need several AI subscriptions to start.',
  'Open the official sites below. Create your own accounts, verify email where requested and use unique passwords. For Google apps, sign in with your own account. Review free options before accepting upgrades. Interfaces and plan limits change.',
  'Create a folder named My Digital Product with Drafts, Images, Final and Launch subfolders. Keep original photos and sources. On shared phones, sign out of external services when finished. Never paste a password, payment PIN or private customer information into AI or this course.'
 ],{stage:'My creator toolkit',instruction:'Open each real service, understand its job, then complete your setup.',tools:[
  {label:'ChatGPT',url:'https://chatgpt.com',why:'Ask questions, develop an outline and revise your explanations. Free usage limits may apply.'},
  {label:'Canva',url:'https://www.canva.com',why:'Create mobile-readable layouts, a cover and product preview. Choose free assets or your own.'},
  {label:'Google Drive',url:'https://drive.google.com',why:'Back up drafts and final files. Phone storage is an alternative.'},
  {label:'Selar',url:'https://selar.com',why:'Create a store, configure available payouts and deliver your product.'}
 ],rounds:[round('An AI response asks you to paste your Selar password so it can set up your shop. What do you do?',[
  ['Paste it because AI needs access.','No. A writing assistant does not need your credentials.',false],
  ['Keep credentials private and complete account setup directly on the official service.','Correct. Your work can move between tools; your passwords should not.',true]
 ])],checklist:['I can open and use my AI tool.','I can open Canva and know which features are free.','I created my product folder and know how to back it up.']},'Your tools have clear jobs and your files have a home.'),
 lesson('Build the reader’s route','creator-kitchen',[
  'A practical guide needs a sequence a beginner can follow: result, prerequisites, materials, actions, checks, troubleshooting and a final checklist. Put equipment and constraints before the reader spends money or starts.',
  'For a cooking guide, verify quantities, equipment assumptions, temperatures, hygiene and storage with appropriate reliable guidance and a tested method. This course’s baking story illustrates instruction design; it is not a verified recipe.',
  'Outline your own guide with short section headings. Every section should help the reader act or check their result. Remove motivational filler. Include alternatives only when you can verify that they work.'
 ],{stage:'Assemble the guide',instruction:'Tap the cards in the order a beginner needs them. Then write the route for your own product.',order:{items:[
  {id:'fix',label:'Troubleshooting and final checklist',why:'Offer fixes after readers know what the expected result looks like.'},
  {id:'do',label:'Numbered actions with checkpoints',why:'Give one observable action at a time and describe what should happen.'},
  {id:'goal',label:'Result, audience and limits',why:'Tell readers whether this method suits them before they begin.'},
  {id:'tools',label:'Materials, equipment and preparation',why:'Let readers prepare before committing to the process.'}
 ],answer:['goal','tools','do','fix']},fields:[field('outline','Your guide outline','At least six headings. Include preparation, actions, checkpoints, troubleshooting and a usable checklist.',100)]},'Your guide has a practical route from preparation to result.'),
 lesson('Direct AI instead of accepting its first draft','creator-baker',[
  'A useful prompt contains the reader, result, available resources, your tested knowledge, the output structure and constraints. Tell the assistant to ask for missing details and flag facts to verify.',
  'Use the personal brief below. Copy it into your AI tool, answer its questions, then request one section at a time. Ask for plain language, numbered actions, visual suggestions and troubleshooting. Keep your own voice and examples.',
  'Compare the response with your experience. Save useful drafts in your product folder. AI cannot test your recipe, interview customers or prove a claim. Do not sell an unchecked response.'
 ],{stage:'AI prompt workshop',instruction:'Practise directing the assistant. Your personal brief is built from your saved project.',rounds:[
  round('The prompt says: “Write a bestselling cake guide. Make it professional.” What information is missing?',[
   ['Only the word count.','Length does not explain the reader’s equipment, experience or intended result.',false],
   ['The reader, outcome, equipment, tested method, structure and facts to verify.','These constraints turn an open-ended request into a usable editorial brief.',true]
  ]),
  round('The assistant supplies exact storage times without a source. What is your next action?',[
   ['Keep them because the answer sounds confident.','Confidence is not evidence, particularly for food safety.',false],
   ['Flag them, consult reliable guidance and revise the instructions before publishing.','Verification happens outside the AI response. Keep the evidence with your draft.',true]
  ])],checklist:['I used my personal brief in an AI tool and reviewed its questions.','I saved a draft and marked uncertain claims for verification.']},'You can brief AI and keep editorial responsibility.'),
 lesson('Write steps a beginner can actually follow','creator-reader',[
  '“Mix well” leaves the reader guessing. A useful instruction says what to do, with what, in what order, what to observe and when to stop. Include quantities or durations only when verified for your method.',
  'Draft the guide in your own words. Use numbered steps and descriptive headings. Add a materials checklist and a troubleshooting section. Explain unfamiliar terms on first use. Keep sentences short enough to read while doing the task.',
  'Write your actual guide in the studio. The preview and PDF export use this text; practice scenarios never enter your product. The export is a simple text layout. Canva lets you add your own step photos and richer page design later.'
 ],{stage:'Instruction repair desk',instruction:'Repair the example mentally, then write your own actionable draft.',rounds:[
  round('A draft says: “Prepare everything, mix well, bake until perfect.” What change would help a beginner most?',[
   ['Add “professionally” to every sentence.','More impressive language does not supply missing actions.',false],
   ['Specify the preparation and tested method, then describe visible checkpoints and doneness checks.','Readers need actions and evidence they are on track. Verify details rather than guessing them.',true]
  ])],fields:[field('draft','Your practical guide draft','Write your own preparation list, numbered actions, checkpoints, common problems and final checklist. Aim for a useful short guide, not a page target.',600)]},'Your guide now contains instructions rather than promises.'),
 lesson('The fact-check and originality desk','creator-kitchen',[
  'Make a verification log: claim, source or test, date checked and correction. For health, legal, financial or safety-critical subjects, get qualified review or choose a topic within your competence.',
  'Use your own photos and writing or assets with commercial-use permission. Keep the licence record. Do not copy a competitor, invent testimonials, or present an AI illustration as proof of a result you achieved.',
  'Remove unsupported superlatives such as “guaranteed”, “works for everyone” and “expert-approved” without evidence. Keep useful constraints visible: who the guide suits, what it requires and what it cannot promise.'
 ],{stage:'AI editorial room',instruction:'Find what must change before this guide can be sold.',rounds:[
  round('The draft says: “This method works in every oven and guarantees a perfect result.”',[
   ['Publish it; strong promises sell.','This promises more than the creator can establish.',false],
   ['State the equipment and conditions actually tested, and add checks the reader can perform.','A clear scope is more useful than a universal claim.',true]
  ]),
  round('The cover uses a photo found through an image search. No licence is visible.',[
   ['Credit the website and sell it.','Credit alone does not establish commercial-use permission.',false],
   ['Use an original image or obtain and record appropriate commercial-use permission.','Check the licence and keep evidence with your project files.',true]
  ])],fields:[field('verification','Your verification and permissions log','List important claims, how you checked them, corrections and the rights for each visual. Do not claim tests you have not done.',120)],checklist:['I checked the important instructions and corrected unsupported claims.','My writing and visuals are original or have appropriate permission.']},'Your verification record supports the work you plan to sell.'),
 lesson('Design a guide people can read on a phone','creator-product',[
  'In Canva, search for a simple document layout or start a blank document. Choose a readable font, strong contrast and consistent headings. Keep steps near the image that explains them. Avoid tiny captions and text placed on busy photos.',
  'Create a cover with the result, intended reader and your creator name. Use your own process photos for demonstrations. An attractive generated image can decorate a cover but cannot prove that your method works.',
  'Use My Product below to inspect the draft in a narrow phone preview. Change the preview reading size to see how much text fits. These controls are a practice preview, not a full Canva editor. Export a PDF draft, or copy your content into Canva for final layout. Open the final PDF on your actual phone before uploading.'
 ],{stage:'The reader’s phone',instruction:'Check the design decision, then export and inspect your real guide.',tools:[{label:'Open Canva',url:'https://www.canva.com',why:'Create a simple cover and add your own step images. Check asset licences and paid-feature labels.'}],rounds:[round('Your page looks elegant when zoomed out, but a reader must pinch-zoom every instruction.',[
  ['Make the file longer by increasing margins.','Extra whitespace alone does not solve unreadable type.',false],
  ['Increase text size, simplify the layout and test the PDF on a small phone.','Readability during the task matters more than how a thumbnail looks.',true]
 ])],checklist:['I exported my guide as a PDF and opened it on my phone.','I can read the instructions without repeatedly zooming.','My cover and preview accurately show what the buyer receives.']},'You have inspected the actual file a customer will receive.'),
 lesson('Let a real beginner try it','creator-reader',[
  'Choose one person who resembles your reader. Give them a sample task and ask them to use the instructions without you explaining every step. For cooking, have them follow a safe, verified method with suitable supervision where needed.',
  'Ask where they hesitated, what was missing and what they expected to see. Record the exact point of confusion, then revise that part. Compliments alone do not tell you whether the guide works.',
  'This milestone takes real-world time. Return after the reader trial. Record anonymous feedback here. Update the draft and final PDF so the version you sell includes the improvements.'
 ],{stage:'The beginner test',instruction:'Turn real feedback into a better product.',fields:[field('review','Reader test and revision notes','Who the guide was tested with (no private details), what they tried, where they got stuck, your change and the result of checking the change.',140)],checklist:['A real intended reader tried a representative task or section.','I revised the guide and exported the corrected version.']},'A reader has helped improve your product before launch.'),
 lesson('Price your work and understand the money','creator-product',[
  'Choose a starting price based on the result, alternatives and feedback from your intended buyers. The 2,500 FCFA price of this TechSkillNow course is not a prescribed price for your own product.',
  'Net proceeds differ from the amount a buyer pays. Check current platform, currency conversion, withdrawal and payment charges in your actual account. Include promotion costs and refunds in your records. Taxes and business obligations may also apply.',
  'Use the sandbox with zero, three and ten sales. Its starting fees are hypothetical, not Selar’s current fee schedule. Do not spend on ads expecting guaranteed returns. Start with a clear offer and a small audience you can reach.'
 ],{stage:'Price & profit sandbox',instruction:'Choose a price for YOUR guide, then explore how fees and launch costs change the result.',fields:[field('price','Your starting price in FCFA','Digits only. Use customer feedback and value, not an invented income target.',3)],rounds:[round('A seller has 10 sales at 2,000 FCFA and says they made 20,000 FCFA profit. What is missing?',[
  ['Nothing; sales and profit are identical.','Revenue does not deduct costs.',false],
  ['Fees, refunds, promotion costs and other relevant expenses.','Keep revenue and net proceeds separate. A payment can also be pending before withdrawal.',true]
 ])]},'You can distinguish a sale, revenue and money remaining after costs.'),
 lesson('Create your real Selar account and store','creator-baker',[
  'Open Selar using the official link. Choose its account-creation option, enter your own email and a unique password, and complete the email verification or other checks it requests. Sign in, then follow the seller/store setup offered in your account. Labels can change.',
  'Use your genuine country and details. Set a recognisable store name, creator description, appropriate profile image and a support email you monitor. If prompted for identity or business verification, complete it only inside the official service. Never use invented information.',
  'Keep the setup practical: a first-time visitor should understand who you help and what your guide does. Do not purchase a subscription just because a screen promotes it. Check whether the features you need are available on your current plan.'
 ],{stage:'Selar setup rehearsal',instruction:'Practise the account decisions, then create your real store in Selar.',tools:[{label:'Open Selar',url:'https://selar.com',why:'Create and verify your own account. Only Selar can confirm its current requirements.'}],rounds:[round('You have opened a store but verification is still pending. Should you tell customers payments and payouts are ready?',[
  ['Yes, the account exists.','Account creation does not establish payment acceptance or withdrawal readiness.',false],
  ['Finish the required checks and inspect payment and payout availability first.','You need a usable selling workflow, not just a login.',true]
 ])],checklist:['I created and can sign into my own Selar account.','I completed the verification requested so far, or resolved any blocking request.','I set my real country, store identity and support contact.']},'You have declared your real account and store setup complete.'),
 lesson('Payments, withdrawal and the buyer’s journey','creator-product',[
  'Buyer payment and seller withdrawal are separate. In your Selar account, inspect the payment methods and currencies available for your actual country and product. For Cameroon buyers, check specifically whether MTN MoMo and Orange Money appear in the live checkout. Do not advertise a method you have not confirmed.',
  'In your seller payment or payout settings, choose an available destination in your own name and complete the requested verification. Read fees, minimum amounts, holding periods and withdrawal timing. Never share a mobile-money PIN or OTP with a customer, agent, AI tool or this course.',
  'If a required method or payout route is unavailable, contact official Selar support and pause launch. Do not change your country to bypass restrictions. For delivery checks, use a supported preview/test method if available. A real transaction should only be made knowingly with the resulting fees understood.'
 ],{stage:'Payment control room',instruction:'Distinguish checkout, payment confirmation, file delivery and payout. No real money moves in this simulation.',rounds:[
  round('A buyer sends a screenshot saying “paid”, but your seller dashboard has no confirmed order.',[
   ['Send the file and hope the payment arrives.','A screenshot is not independent confirmation of receipt.',false],
   ['Check the transaction in the official dashboard and follow the platform’s pending-payment guidance.','Verify in the service itself. Never ask for a buyer’s PIN or OTP.',true]
  ]),
  round('Your store accepts a buyer’s payment. Does that establish you can withdraw it immediately?',[
   ['Yes, every accepted payment is instantly withdrawable.','Availability can depend on verification, holding periods and payout settings.',false],
   ['No. Inspect payout eligibility, timing, destination, minimums and fees in the account.','Checkout acceptance and seller withdrawal are separate parts of the workflow.',true]
  ])],checklist:['I checked the actual buyer payment methods and currency for my listing.','I configured an available payout destination and completed required verification.','I understand current fees, holds, minimums and withdrawal timing.']},'You have checked the payment route and payout requirements in your own account.'),
 lesson('Build a listing that matches the product','creator-product',[
  'In your Selar seller dashboard, use the add/create-product option and choose the appropriate digital download format. Upload the final PDF, cover and any supported preview. Name the product clearly and use your starting price. Confirm currency and file limits shown by the service.',
  'Write: who it is for, the result, what is included, required materials or skills, what is excluded, and how the buyer receives help. If selling a cake guide, make clear that the buyer receives a downloadable guide, not a physical cake or live coaching.',
  'Preview the listing as a visitor. Check the cover, price, mobile readability, downloadable file and checkout. Publish only after the information is accurate. Copy the actual product URL. If you cannot finish a real step, return later instead of marking it complete.'
 ],{stage:'My storefront',instruction:'Write the real listing and publish it in Selar. The studio does not publish it for you.',fields:[field('description','Your sales description','Reader, achievable result, exact contents, prerequisites, delivery format, limits and support. No invented testimonials or guaranteed earnings.',180),field('storeUrl','Your published Selar product URL','Paste the HTTPS link to the actual product listing, not a dashboard or a fictional link.',15)],rounds:[round('The guide contains a decorating checklist and illustrated instructions. Which listing is honest?',[
  ['Get a professional baking qualification and guaranteed orders.','Neither a qualification nor orders are delivered by this file.',false],
  ['A downloadable beginner guide with preparation checklist, illustrated steps and common fixes; ingredients and coaching are not included.','The buyer can understand exactly what is and is not included.',true]
 ])],checklist:['I uploaded the correct final PDF, cover and preview to my Selar product.','I reviewed and published the listing with the correct price and currency.','I checked the buyer journey and file delivery through an appropriate supported method.']},'Your real listing link and product description are saved in your project.'),
 lesson('Launch without an audience or ad budget','creator-baker',[
  'Start with people who match the problem, not everyone in your contacts. Ask permission before sending a sales link privately. For groups, follow the admin’s rules. Do not scrape contacts, spam groups or invent scarcity.',
  'Prepare three pieces: a helpful tip, a short demonstration of one useful part, and a clear offer naming the audience, result, price and link. Show genuine process evidence. You can use voice-over or hands-only clips if you do not want to show your face.',
  'Plan seven days: share one useful tip; show a sample; explain who it suits; answer a real question; demonstrate a task; invite relevant feedback; review results. Adjust the offer based on questions and behaviour. Do not invent views or sales, and do not spend on ads before understanding costs and demand.'
 ],{stage:'My seven-day launch kit',instruction:'Write your own messages and customer plan. Keep it specific, useful and permission-based.',fields:[field('launch','Your launch messages and seven-day plan','Include a helpful tip, demonstration script, offer with price and link, support reply and actions for days 1–7.',250)],rounds:[round('Your helpful post gets questions but no sales. What is the best next step?',[
  ['Buy more ads immediately and claim only two copies remain.','A digital download does not have invented stock scarcity. More traffic will not fix an unclear offer.',false],
  ['Read the questions, check audience fit and improve the sample or description before spending.','Use actual feedback to diagnose the gap rather than assuming more advertising is the answer.',true]
 ])]},'Your launch kit is ready without pretending that sales are guaranteed.'),
 lesson('Your first customer and your next improvement','creator-complete',[
  'A sale is the start of delivery and support. Keep the platform’s order reference, confirm the transaction in the seller dashboard and use its supported delivery and resolution process. Never publish customer details.',
  'If a buyer cannot download, confirm the order and help them use the official access method. For refund requests, communicate clearly and follow your disclosed policy, platform requirements and applicable consumer rules. Do not pressure buyers to provide a testimonial.',
  'Open My Product and download your PDF, launch pack and project backup. Your verification notes stay in the private launch pack, not the customer PDF. Keep copies in your product folder. After publishing, collect real feedback and improve your guide. Completing this course means you built and launched a useful offer; earnings require real customers.'
 ],{stage:'Launch handover',instruction:'Resolve the customer situations and check your real deliverables. No actual sales are required to graduate.',image:'creator-complete',rounds:[
  round('A confirmed customer says the download will not open on their phone. What should you do?',[
   ['Ignore them because the sale is complete.','Support and usable delivery are part of the product experience.',false],
   ['Check the official order, help them access the correct file and follow Selar’s support process if needed.','Resolve the delivery issue without requesting credentials or exposing their details.',true]
  ]),
  round('You launched but have no orders yet. What should you report?',[
   ['Use a simulated sales screenshot as proof.','Simulated activity is not a real customer transaction.',false],
   ['Record zero sales, review actual customer responses and adjust the offer or how you reach suitable people.','An honest record helps you learn what needs improving.',true]
  ])],checklist:['I downloaded and backed up my final guide and launch materials.','My real store, payout setup and published listing are ready.','I have a support contact and a plan to collect real reader feedback.']},'Your product, shop and launch kit are ready for the next real customer.')
 ],
 assessment:{passMark:80,warmup:[0,3,7],questions:[
  {question:'Which product promise is most useful?',options:['Everything about business','A specific achievable task for a defined reader','Guaranteed income tomorrow'],answer:1,step:1},
  {question:'What is the strongest early demand signal?',options:['AI says it will sell','A friend says the cover is pretty','Intended readers describe recent problems and useful missing help'],answer:2,step:3},
  {question:'Why choose a small AI and design toolset?',options:['To understand each tool and complete the work without unnecessary subscriptions','Because more tools guarantee income','To avoid checking outputs'],answer:0,step:4},
  {question:'An AI assistant gives an exact unreferenced safety instruction. What next?',options:['Publish it confidently','Verify it through reliable guidance before using it','Add a colourful illustration'],answer:1,step:6},
  {question:'What belongs before a guide’s action steps?',options:['Materials, prerequisites and preparation','An invented testimonial','A guaranteed income claim'],answer:0,step:5},
  {question:'What makes a reader trial useful?',options:['Only asking whether the guide is nice','Watching where a suitable reader gets stuck and revising those instructions','Pretending AI followed the method'],answer:1,step:10},
  {question:'Revenue is 10,000 FCFA and relevant fees/costs total 2,000 FCFA. What remains before other obligations?',options:['12,000 FCFA','10,000 FCFA','8,000 FCFA'],answer:2,step:11},
  {question:'Does buyer payment acceptance prove seller withdrawal is ready?',options:['Always','No; payout settings, verification, timing and fees must be checked','Only if someone sends a screenshot'],answer:1,step:13},
  {question:'Where should you enter your Selar password and verification information?',options:['Into this lesson','Into a writing AI','Only through the official service’s appropriate secure screens'],answer:2,step:12},
  {question:'What should a listing make clear?',options:['The real contents, limits, format, price and support','That every buyer will earn money','That a downloadable guide includes a physical cake'],answer:0,step:14},
  {question:'Which is a sensible first launch action?',options:['Spam every group','Invent a customer testimonial','Share a useful sample with a relevant audience that permits promotion'],answer:2,step:15},
  {question:'A payment screenshot arrives but no order is confirmed. What should you trust?',options:['The screenshot alone','The official platform transaction status and resolution guidance','A request for the buyer’s mobile-money PIN'],answer:1,step:16}
 ]}
};
export default course;
