import type { Course, Step } from "../types";
import type { CreatorWorkshopTask } from "@/lib/creator/workshop";
import { sample } from "@/lib/creator/workshop";
const card = (
  heading: string,
  explanation: string,
  example: string,
  takeaway: string,
) => ({ heading, explanation, example, takeaway });
const lesson = (
  title: string,
  image: string,
  task: Omit<CreatorWorkshopTask, "type" | "title" | "success">,
  success: string,
): Step => ({
  title,
  illustration: image,
  body: [
    "Follow the lesson cards first. Then complete the guided simulation: you will see the result of each action before moving on.",
  ],
  task: { type: "creatorWorkshop", title, ...task, success },
});
const course: Course = {
  id: "digital-product",
  locale: "en",
  price: 2500,
  freeSteps: 4,
  track: "career",
  series: "Create • Publish • Launch",
  cover: "creator-cover",
  badge: "creator-complete",
  title: "Start Selling & Earning with Your First Digital Product — Right Now",
  promise:
    "Learn the tools step by step, practise prompting in a visual AI conversation, design a useful PDF guide and rehearse opening your Selar shop. Then follow the guided handover to your real accounts. Sales are not guaranteed.",
  audience: "For beginners creating useful digital guides on a phone",
  outcomes: [
    "Guided ChatGPT, Canva, Google Drive and Selar account walkthroughs",
    "A practical guide built through visible prompts, editing and PDF design",
    "A rehearsed shop, payment journey and real-world launch pathway",
  ],
  steps: [
    lesson(
      "1. See what you are going to create",
      "creator-cover",
      {
        mode: "tour",
        instruction: "Explore the finished example one page at a time.",
        hint: "Notice the action, checkpoint and fix on each useful page.",
        learn: [
          card(
            "Start with something useful, not a blank page",
            "You are going to make a short practical guide: a downloadable PDF that helps a specific reader do something. It could teach a tested cooking method, a craft process or another useful skill. A buyer pays for the help it provides, not the number of pages.",
            "Our practice story follows Merveille, a home baker. She creates a guide to photographing her cake with a phone: equipment, actions, checkpoints and troubleshooting.",
            "One reader + one achievable result gives the product a clear purpose.",
          ),
          card(
            "See the destination before learning the tools",
            "This course uses a worked example so you can practise without already knowing how to write a guide. First you inspect it. Then you build a product card, send prompts, repair instructions, design pages and create a practice shop. After rehearsing, repeat the workflow with your own original, verified subject.",
            "A useful page says: “Include the entire product. Check that no edges are cut off. Step back and retake if needed.” It gives the reader an action, a check and a fix.",
            "You will learn each operation before being asked to use it.",
          ),
        ],
      },
      "You have inspected the finished example and can recognise a useful practical page.",
    ),
    lesson(
      "2. Build a clear product promise",
      "creator-reader",
      {
        mode: "offer",
        instruction: "Build your first product card from a worked example.",
        hint: "A title, a reader and an observable outcome are enough for this first step.",
        learn: [
          card(
            "Name the reader’s situation",
            "A guide cannot solve every problem for everyone. Describe the reader’s starting point: experience, equipment and difficulty. This tells you what to explain and what not to assume. You can begin with the practice photography topic and change it later.",
            "Too broad: “Everyone who likes business.”\nSpecific: “Home bakers taking cake photos with an Android phone and daylight.”",
            "A specific reader makes instructions easier to write.",
          ),
          card(
            "Promise an action the reader can complete",
            "Choose an outcome you can show or inspect. “Take three clear product photos” can be checked. “Become rich immediately” depends on factors the guide cannot control. Make the product title explain the useful action.",
            "I help [home bakers] create [three clear cake photos] with [an Android phone and daylight].",
            "Promise a practical result; do not promise guaranteed sales or earnings.",
          ),
        ],
      },
      "Your short product card is saved and visible.",
    ),
    lesson(
      "3. Meet ChatGPT and practise creating an account",
      "creator-baker",
      {
        mode: "account",
        tool: "ChatGPT",
        instruction:
          "Create the practice account or skip sign-up if you already have one. Everyone completes the workspace tour.",
        hint: "The main controls are New chat, the message composer and account settings.",
        learn: [
          card(
            "What ChatGPT does in this workflow",
            "ChatGPT is a conversational assistant. You give it instructions, called prompts, and inspect the response. It can help organise ideas, create draft sections and suggest revisions. It does not know whether your recipe works or whether customers will buy. You remain responsible for checking the work.",
            "You: “Create a six-part outline for beginners taking product photos on a phone.”\nAssistant: an outline you inspect, edit and verify.",
            "Use AI as a drafting assistant, not evidence that a claim is true.",
          ),
          card(
            "Learn the account route",
            "On the official site, choose the sign-up option and follow an available method such as email or Google sign-in. Email signup may ask for a password and verification. Methods, eligibility checks and screen labels can change. The simulation rehearses a representative email route, not a live connection.",
            "Sign up → choose a method → practice email → practice password → verification message → workspace.\nAlready have an account? Skip signup and learn the workspace controls.",
            "Use your own credentials only on the actual official service.",
          ),
          card(
            "Recognise the workspace",
            "New chat starts a fresh conversation. The composer is where you type your prompt. The account menu is where you inspect settings and plan options. Do not buy a subscription just because an upgrade is advertised; begin with available free features and understand limits.",
            "Look for “New chat”, type in the message box, then use the send control. A response appears in the conversation above.",
            "Know where to start, where to type and where the result appears.",
          ),
        ],
      },
      "You rehearsed the ChatGPT account route and located its key workspace controls.",
    ),
    lesson(
      "4. Send your first useful prompt",
      "creator-product",
      {
        mode: "chat",
        phase: "enter",
        instruction:
          "Type the worked prompt, or an equivalent instruction containing the three taught ingredients, then press Send.",
        hint: "The response names a reader and an achievable result. It is an authored example, not a claim that a market has been proven.",
        learn: [
          card(
            "A prompt is an instruction",
            "Typing “cake” leaves the assistant guessing. A useful prompt names the job, the reader and the format you want. You do not need special technical language. Plain, specific instructions are enough.",
            "Write a product idea for home bakers who use an Android phone. Help them take three clear product photos. Return a title, reader and outcome.",
            "Tell the assistant what to do, who it is for and how to return the result.",
          ),
          card(
            "Read the response as an editor",
            "Check whether the result matches your request. Is the reader specific? Can the outcome be observed? Does the response introduce unsupported promises? If it misses something, ask for a correction rather than accepting it because it sounds polished.",
            "Good result: a title, a defined reader and three photos they can produce.\nWeak result: “Become a professional photographer and get guaranteed customers.”",
            "A fluent answer can still be the wrong answer.",
          ),
        ],
        prompt: {
          starter: "",
          model:
            "Write a product idea for home bakers who use an Android phone. Help them take three clear product photos. Return a title, reader and outcome.",
          requirements: [
            { label: "Name home bakers as the reader", words: ["baker"] },
            {
              label: "Mention the phone constraint",
              words: ["phone", "android"],
            },
            { label: "Ask for a title", words: ["title"] },
            { label: "Ask for a defined reader", words: ["reader"] },
            { label: "Ask for an observable outcome", words: ["outcome"] },
          ],
          response: `TITLE\n${sample.title}\n\nREADER\n${sample.audience}\n\nOUTCOME\n${sample.outcome}\n\nWHY THIS IS SPECIFIC\nIt names the task, the available device and a result the reader can inspect. It does not establish demand or promise income.`,
        },
      },
      "You sent a specific prompt and inspected the visible response.",
    ),
    lesson(
      "5. Repair a weak prompt and compare the result",
      "creator-reader",
      {
        mode: "chat",
        phase: "repair",
        instruction:
          "Correct “Write a guide. Make it good.” Add the reader, available tools, structure and verification rule.",
        hint: "Better instructions produce a more constrained example. The assistant asks for missing facts instead of inventing them.",
        learn: [
          card(
            "Diagnose what is missing",
            "“Write a guide” has no reader, no outcome, no tool constraints and no structure. The assistant may produce generic paragraphs. Repair the prompt by adding these missing details. You can see the weak text in the composer and edit it directly.",
            "Weak: “Write a guide. Make it good.”\nBetter: “For beginner home bakers using a phone, outline a guide to clear product photos. Include materials, numbered steps, checkpoints and troubleshooting.”",
            "Improve the instruction before asking for more text.",
          ),
          card(
            "Tell AI what not to invent",
            "If important details are missing, ask the assistant to ask questions or flag uncertainty. For a cooking guide, quantities, temperatures and safe storage must come from a tested method and appropriate reliable guidance. A model should not invent them to fill a gap.",
            "Add: “Ask about missing details first. Do not invent facts or promise sales. Mark anything I must verify.”",
            "Ask for missing information; never hide uncertainty behind confident wording.",
          ),
        ],
        prompt: {
          starter: "Write a guide. Make it good.",
          model:
            "For beginner home bakers using a phone, outline a practical guide to clear product photos. Include materials, numbered steps, checkpoints and troubleshooting. Ask about missing details first. Do not invent facts or promise sales.",
          requirements: [
            { label: "Define the beginner reader", words: ["beginner"] },
            {
              label: "State the phone constraint",
              words: ["phone", "android"],
            },
            { label: "Ask for numbered steps", words: ["steps", "numbered"] },
            {
              label: "Ask for checkpoints or troubleshooting",
              words: ["checkpoint", "troubleshoot"],
            },
            {
              label: "Ask about missing details and avoid invention",
              words: ["missing", "not invent", "verify"],
            },
          ],
          response:
            "Before drafting, I would check:\n1. What phone and camera functions are available?\n2. What kind of product will be photographed?\n3. Is a place with indirect daylight available?\n\nProposed structure:\nMaterials → setup → full product view → detail photo → quality check → troubleshooting.\n\nAny technical facts you add should be checked. Photography instructions do not guarantee customer orders.",
        },
      },
      "You repaired the prompt and can explain why the response improved.",
    ),
    lesson(
      "6. Build an outline through a conversation",
      "creator-kitchen",
      {
        mode: "chat",
        instruction:
          "Ask for a beginner-friendly outline with preparation, actions and fixes.",
        hint: "Each section supports something the reader needs to prepare, do or check. Keep the outline before drafting the details.",
        learn: [
          card(
            "Outline before asking for a whole guide",
            "An outline is the route through your product. It helps you find missing preparation and remove sections that do not help the reader. Ask for headings first. This is easier to review than a long, polished draft with hidden gaps.",
            "A route for product photos: prepare the phone → find soft light → frame the whole product → capture a detail → inspect and export → troubleshoot.",
            "Approve the route before expanding individual sections.",
          ),
          card(
            "Put prerequisites before the action",
            "A beginner should know what equipment, skill and time are needed before starting. After each action, explain what success looks like. Put common fixes close enough that the reader can recover when something goes wrong.",
            "If “clean the lens” appears only after the photos are taken, the reader may have to repeat the work. Move preparation to the beginning.",
            "Order the guide around the reader’s task, not around what AI writes first.",
          ),
        ],
        prompt: {
          starter: "",
          model:
            "Create a six-section outline for a beginner practical guide using a phone. Put preparation before numbered actions. Include quality checkpoints and troubleshooting. Keep each heading short.",
          requirements: [
            { label: "Request an outline", words: ["outline"] },
            { label: "Include preparation", words: ["preparation", "prepare"] },
            { label: "Include checkpoints", words: ["checkpoint", "quality"] },
            {
              label: "Include troubleshooting",
              words: ["troubleshoot", "fix"],
            },
          ],
          response:
            "1. Result, audience and limits\n2. Materials and preparation\n3. The first action and its checkpoint\n4. The remaining actions and checks\n5. Common problems and practical fixes\n6. Final checklist and file handover",
          save: "outline",
        },
      },
      "Your outline is saved as a route you can adapt to your own guide.",
    ),
    lesson(
      "7. Draft one section, then inspect it",
      "creator-baker",
      {
        mode: "chat",
        instruction:
          "Request one action/checkpoint/fix section, not a whole publication at once.",
        hint: "Notice the separation between doing, checking and correcting. The worked draft will be available in the next guided editor.",
        learn: [
          card(
            "One section is easier to improve",
            "Ask for one section at a time. Explain what the reader is trying to do and the available tools. Then inspect the result. This keeps you in control of the instruction quality and avoids a pile of repetitive pages.",
            "Draft a short product-photography section for beginners using a phone. Include an action, a checkpoint and a fix. Use plain language and do not promise sales.",
            "Draft small enough that you can check every instruction.",
          ),
          card(
            "Move from explanation to action",
            "A useful guide does not just say that photography matters. It tells the reader how to position the subject, inspect the result and correct a problem. You can add your own examples after checking the section.",
            "Action: frame the whole product.\nCheckpoint: all edges are visible and detail is sharp.\nFix: step back or stabilise the phone and retake.",
            "Action + checkpoint + fix is the basic building block of your guide.",
          ),
        ],
        prompt: {
          starter: "",
          model:
            "Draft a short product-photography section for beginners using a phone. Include an action, a checkpoint and a fix. Use plain language and do not promise sales.",
          requirements: [
            { label: "Explain the phone context", words: ["phone"] },
            { label: "Ask for an action", words: ["action", "step"] },
            { label: "Ask for a checkpoint", words: ["checkpoint", "check"] },
            {
              label: "Ask for a fix",
              words: ["fix", "correct", "troubleshoot"],
            },
          ],
          response: sample.draft,
          save: "draft",
        },
      },
      "You have a visible worked draft to inspect and personalise.",
    ),
    lesson(
      "8. Fix the AI draft before trusting it",
      "creator-kitchen",
      {
        mode: "review",
        instruction:
          "Tap the problematic lines, inspect the issue and apply a correction.",
        hint: "The repaired document changes on screen.",
        learn: [
          card(
            "Three checks before a draft becomes a product",
            "Inspect accuracy, clarity and permission. Accuracy asks whether the claims are supported. Clarity asks whether a beginner can act. Permission asks whether the words and images are yours or appropriately licensed. Fix all three before polishing the design.",
            "“Guaranteed sales” is unsupported. “Mix well” is unclear. A competitor’s photo without permission has a rights problem.",
            "Good design cannot repair unsupported or copied content.",
          ),
          card(
            "Use evidence outside the AI conversation",
            "AI can suggest what to check, but another AI answer is not independent verification. Use your actual experience, a real trial and appropriate reliable references. Keep permission and source notes with your private working files.",
            "For cooking: verify the method, quantities and safety guidance. For photography: try the steps on the intended phone and inspect the exported result.",
            "Verify what you plan to sell, not just what looks convincing.",
          ),
        ],
      },
      "You repaired the practice draft’s unsupported, unclear and unlicensed content.",
    ),
    lesson(
      "9. Assemble your guide one instruction at a time",
      "creator-product",
      {
        mode: "files",
        phase: "editor",
        instruction:
          "Build a short instruction from its action, checkpoint and fix. Add it and watch the guide change.",
        hint: "You do not need to write a whole guide from scratch. Start with the worked structure and edit each section.",
        learn: [
          card(
            "Use the step editor, not a blank document",
            "The guide editor gives you a worked draft and three small inputs. Add one action, what the reader should observe, and what to do if it fails. You will see that instruction appear in the assembled document immediately.",
            "Action: Hold the phone steadily.\nCheck: the subject is sharp and fully visible.\nFix: stabilise the phone or step back and retake.",
            "Build one useful unit, inspect it, then continue.",
          ),
          card(
            "Make the final product your own",
            "Practice text is a starting point for learning, not a finished original product to sell unchanged. Replace it with your experience, examples and verified method. You can use the same structure for cooking, crafts or another practical subject. Read the complete guide as a beginner before export.",
            "If your real guide teaches a cake recipe, replace photography instructions with your tested recipe and verified food-safety guidance. Keep the action/checkpoint/fix structure.",
            "A reusable structure helps you create; it does not replace subject knowledge.",
          ),
        ],
      },
      "You built and saved an instruction inside the assembled guide.",
    ),
    lesson(
      "10. Meet Canva and practise account creation",
      "creator-baker",
      {
        mode: "account",
        tool: "Canva",
        instruction:
          "Rehearse the account route, or skip it if you already have an account. Then locate the design controls.",
        hint: "Find Create a design, Uploads and Share / Download.",
        learn: [
          card(
            "What Canva adds",
            "Canva is a visual design tool. It helps arrange your cover, headings, photos and document pages. In this workflow, ChatGPT helps draft and revise text; Canva helps make the final guide readable. Design is not a substitute for accurate instructions.",
            "The draft becomes a simple document with a cover, preparation page, steps and troubleshooting. Your own process photos sit near the instructions they explain.",
            "Use design to make the task easier to follow.",
          ),
          card(
            "Create an account without accidental upgrades",
            "Open the official service and follow an available sign-up method. Account creation and promotional upgrade screens can vary. Use the free option where available and inspect any paid asset labels before using them. Existing account holders can go straight to the workspace tour.",
            "Sign up → verify if requested → open workspace → Create a design. Later, Uploads adds images and Share / Download leads to export options.",
            "Know what each control does before starting a design.",
          ),
        ],
      },
      "You rehearsed Canva signup and found the design, upload and export controls.",
    ),
    lesson(
      "11. Design a readable guide and download the PDF",
      "creator-product",
      {
        mode: "design",
        instruction:
          "Start a document, fix its readability and export the actual PDF.",
        hint: "The preview and PDF should show the work you just assembled.",
        learn: [
          card(
            "Choose a document for a multi-page guide",
            "A social post promotes a product; a document holds the product itself. Start a document design, create a cover, add preparation and instructions, then inspect every page. A template is a starting layout, not a reason to keep irrelevant headings or tiny text.",
            "Create a design → Document → add your title → inspect the cover, preparation and step pages.",
            "Choose a format that fits what the buyer will download.",
          ),
          card(
            "Make the words readable while someone works",
            "Phone readers should not need to zoom every line. Use clear headings, sufficient text size, strong contrast and short sections. Keep useful images fully visible. Decorative pale text on a bright background may look attractive but be difficult to read.",
            "In the practice editor, change the tiny type to 16 or 20 and change pale-on-gold to dark-on-white. The page visibly improves.",
            "Readability is a functional requirement, not a decoration.",
          ),
          card(
            "Export and inspect the file itself",
            "Use the download/share controls to export PDF. Open that exported file on your phone, not just the design preview. Check that text, images, page order and links remain usable. Keep your own image rights and avoid uploading private customer details.",
            "In this lesson the training editor exports a real PDF. On the actual Canva service, use its current PDF download option and inspect the result.",
            "The buyer receives the exported file; inspect that file.",
          ),
        ],
      },
      "You designed readable pages and exported a real PDF.",
    ),
    lesson(
      "12. Understand Google Drive and file storage",
      "creator-reader",
      {
        mode: "account",
        tool: "Google Drive",
        instruction:
          "Rehearse account access and locate the file controls. If you already use Google, skip the signup rehearsal.",
        hint: "Drive uses a Google account. You do not need a separate new account if you already have one.",
        learn: [
          card(
            "Keep the source and final file separate",
            "Phone storage can hold your files; Google Drive can provide an additional backup. Drive uses your Google account, so a learner with Gmail may already have access. The practice account route demonstrates the general verification concept; Google’s actual signup can include other required steps.",
            "My Digital Product / Drafts / Images / Final / Launch. Keep the original images and editable source as well as the PDF you sell.",
            "A backup protects work that otherwise exists on one phone.",
          ),
          card(
            "Understand file access before sharing",
            "New creates a folder or uploads a file. My Drive helps you find saved work. Share controls access. Do not accidentally give buyers access to a private folder with notes, account details or unfinished drafts. Sell the final file through the intended delivery workflow.",
            "Share the correct final guide, not your whole product folder. Keep verification notes and project backups private.",
            "Finding a file and granting access are different actions.",
          ),
        ],
      },
      "You know how storage, folders and sharing fit the product workflow.",
    ),
    lesson(
      "13. Organise the files and back up your work",
      "creator-product",
      {
        mode: "files",
        instruction:
          "Place each practice file into the correct folder, then download a real project backup.",
        hint: "The file organiser changes visibly as you move files.",
        learn: [
          card(
            "A small folder system prevents expensive mistakes",
            "When several files have similar names it is easy to upload an old draft. Use clear folders and versions. Drafts hold editable working text; Images hold originals and licence notes; Final holds the buyer-ready export; Launch holds promotional material.",
            "draft-v1.txt → Drafts\nmy-original-photo.jpg → Images\nguide-final.pdf → Final\nlaunch-message.txt → Launch",
            "Your latest draft and your final customer file should not be confused.",
          ),
          card(
            "Back up the course project",
            "The TechSkillNow project draft is stored in this browser. Clearing browser storage, changing devices or using a shared phone can make it unavailable. Download a backup after meaningful progress and keep it in your own storage. Restore only a backup you trust.",
            "My saved project & backups → Download project backup. The JSON file restores your editable work; the customer PDF is a separate file.",
            "A customer PDF and an editable project backup serve different purposes.",
          ),
        ],
      },
      "You organised the practice folder and downloaded your project backup.",
    ),
    lesson(
      "14. Watch a beginner use your instructions",
      "creator-reader",
      {
        mode: "review",
        phase: "reader",
        instruction:
          "Hear the beginner’s questions and revise the instructions so they can continue.",
        hint: "Each correction changes the document; the learner should no longer need to guess.",
        learn: [
          card(
            "A reader trial is an observation, not a compliment",
            "Someone saying “looks nice” does not establish that the instructions work. Ask an intended reader to try a representative task. Observe where they stop or ask questions. Avoid explaining every missing step yourself; revise the guide so the next reader has the answer.",
            "Reader: “You said prepare the phone. What does that mean?”\nRevision: “Clean the lens, check storage and charge the phone.”",
            "A moment of confusion tells you what the guide must explain.",
          ),
          card(
            "Revise the exact point of difficulty",
            "Record the unclear instruction, the reader’s question and the change. Then check whether the change helped. The simulation gives you a practice reader first. Before selling, repeat the process with a real person and your own original method.",
            "Before: “Send the picture.”\nAfter: “Keep the original, export the chosen version and inspect the exported copy before sharing.”",
            "A real reader trial is still needed after the rehearsal.",
          ),
        ],
      },
      "You revised the instructions using the practice reader’s actual questions.",
    ),
    lesson(
      "15. Choose a price and understand net proceeds",
      "creator-product",
      {
        mode: "price",
        instruction:
          "Compare zero sales and three sales while changing price, fees and launch cost.",
        hint: "The money remaining changes on screen; revenue is only the starting amount.",
        learn: [
          card(
            "Choose a price for your own product",
            "The 2,500 FCFA fee buys this TechSkillNow course. Your guide has its own price. Consider the usefulness of the result, alternatives and feedback from intended buyers. A price is a starting decision to evaluate, not a guarantee that someone will buy.",
            "Your guide might have a different price from the course. Do not copy a price because an influencer used it for another market.",
            "Course price and learner-product price are separate.",
          ),
          card(
            "Subtract costs before calling it earnings",
            "Revenue is price multiplied by confirmed sales. Fees, refunds and promotion costs reduce what remains. Withdrawal timing can also differ from when the sale happened. The simulator uses adjustable hypothetical fees, not a claim about Selar’s current charges.",
            "At zero sales, a launch expense is still a cost. More sales can increase revenue, but they do not erase fees or other obligations.",
            "Inspect the live fee schedule and record actual transactions honestly.",
          ),
        ],
      },
      "You compared costs and saved a starting product price.",
    ),
    lesson(
      "16. Create a Selar account and find the seller tools",
      "creator-baker",
      {
        mode: "account",
        tool: "Selar",
        instruction:
          "Rehearse sign-up or skip it if you have an account. Then locate products, orders and payout settings.",
        hint: "A store login, a confirmed order and a ready payout route are different milestones.",
        learn: [
          card(
            "What Selar does",
            "Selar is the selling and delivery part of this workflow. Your listing tells buyers what they receive; checkout handles available payment methods; the seller dashboard shows orders and payout information. Availability and requirements must be checked in the actual account for your country.",
            "Product listing → buyer checkout → confirmed order → file delivery → eligible seller payout.",
            "Selling has several stages; creating a login is only the beginning.",
          ),
          card(
            "Set up your own account honestly",
            "Open the official service, choose an available signup method, verify as requested and enter your genuine details. Select your actual country. Complete required identity or business checks only inside official secure screens. Never use a false country to bypass a restriction.",
            "In practice: supplied email, dummy password and training code. In real life: your own account and the current requirements shown by Selar.",
            "The simulation creates confidence; the real account is created on the actual service.",
          ),
        ],
      },
      "You rehearsed Selar signup and found the main seller controls.",
    ),
    lesson(
      "17. Set up a store profile customers can understand",
      "creator-baker",
      {
        mode: "store",
        phase: "profile",
        instruction:
          "Find Store settings and build the practice shop identity.",
        hint: "After saving, inspect the storefront identity that appears.",
        learn: [
          card(
            "Your store identity answers three questions",
            "Who is the creator? Who does the store help? How can a buyer ask for support? Use a recognisable name and a short description. Avoid claiming qualifications or results you cannot substantiate. Use a support address you actually monitor in the real store.",
            "Merveille’s Practical Guides\nUseful phone-friendly guides for home bakers\nSupport: merveille@example.com (practice only)",
            "A clear identity is more useful than an impressive but vague slogan.",
          ),
          card(
            "Save and inspect the result",
            "A form is only the editing step. After saving, inspect what a visitor sees. Check spelling and whether the description matches the products. The simulation provides a representative settings screen; live screen names and placement may vary.",
            "Store settings → name, audience and support → Save → inspect the visible store profile.",
            "Always inspect the result after you save a setting.",
          ),
        ],
      },
      "You created a visible practice store profile.",
    ),
    lesson(
      "18. Upload the guide and publish a practice listing",
      "creator-product",
      {
        mode: "store",
        phase: "listing",
        instruction:
          "Open Products, choose digital download, attach your real PDF and inspect the published practice listing.",
        hint: "A buyer must be able to tell that this is a downloadable file, not a physical product.",
        learn: [
          card(
            "Match the product format to what you sell",
            "A practical PDF guide is a digital download. Upload the correct final file, not an editable private draft. Use a descriptive title, choose the intended currency and enter your product price. The real service will show its current file and format limits.",
            "Products → Add product → Digital download → final PDF → title and price. The practice upload remains in this browser and does not publish on Selar.",
            "Choose the right format and the right final file.",
          ),
          card(
            "Use a description structure instead of inventing a paragraph",
            "Tell buyers who it is for, what they will do, what is included, what they need and what is excluded. You can start from the taught structure and customise it. A preview should represent the actual product. Do not invent testimonials or income claims.",
            "For home bakers using a phone. A downloadable guide with preparation, steps, checkpoints and fixes. Equipment, physical products and live coaching are not included.",
            "A clear listing reduces misunderstandings before payment.",
          ),
          card(
            "Preview before sharing a link",
            "The practice Publish button creates a visible listing so you can inspect it. Check price, format, wording and the attached PDF. In the real service, use the actual publishing option and check the visitor view and supported delivery test.",
            "After publishing, look at the offer as a buyer: “What will I receive? Can I read the preview? Is the price and currency clear?”",
            "A simulated listing is practice; publish your actual listing during the handover.",
          ),
        ],
      },
      "Your practice listing is visible with the chosen PDF, description and price.",
    ),
    lesson(
      "19. Rehearse payment, payout and file delivery",
      "creator-product",
      {
        mode: "payments",
        instruction:
          "Inspect seller payout requirements, then follow the practice buyer checkout through to the PDF.",
        hint: "The exercise never charges money or collects payment credentials.",
        learn: [
          card(
            "Confirm seller withdrawal requirements separately",
            "Buyer payment methods and seller payout routes are different. In the actual account, inspect your country, supported destination, required verification, charges, minimums and holding periods. Do not assume funds are immediately withdrawable because an order exists.",
            "A buyer may have a mobile-money option while the seller still has an outstanding verification requirement. Both sides need checking.",
            "Payment acceptance does not establish payout readiness.",
          ),
          card(
            "Trust the official order state",
            "A screenshot is not independent confirmation that you received a payment. Use the official seller dashboard and supported resolution process. If a payment fails or is pending, help the buyer retry through the platform. Never ask for a PIN or OTP.",
            "Practice order: pending → inspect failure → simulate confirmed platform status → unlock delivery → open the actual selected PDF.",
            "Only the confirmed official transaction state should guide fulfilment.",
          ),
          card(
            "Inspect what the buyer receives",
            "A confirmed order is not the end of the experience. Open the delivered file and check that it is the right version, readable and complete. For the live store, use a supported preview or test method if available; do not make surprise real charges for practice.",
            "The rehearsal lets you open the PDF after a simulated confirmation. No payment happened, and the real Selar listing still needs its own delivery check.",
            "A successful buyer journey ends with a usable correct file.",
          ),
        ],
      },
      "You rehearsed payout inspection, transaction states and actual file access.",
    ),
    lesson(
      "20. Create a launch message people can understand",
      "creator-baker",
      {
        mode: "launch",
        instruction:
          "Build a launch post, inspect it as a status and answer a customer question.",
        hint: "The message is saved, not sent to anyone.",
        learn: [
          card(
            "Start by helping the intended reader",
            "Share one useful tip or demonstration that relates to the product. Then explain who the guide helps, its result, contents, price and how to see a preview. You can show hands, a screen or a voice-over without appearing on camera.",
            "Tip → reader and result → contents → price → honest next action. A sample demonstrates usefulness better than a claim about becoming rich.",
            "Useful evidence makes the offer easier to evaluate.",
          ),
          card(
            "Respect the audience and answer practical questions",
            "Ask permission before private promotion and follow group rules. Do not spam or invent scarcity for an unlimited download. Buyers may ask whether it is a physical item, what is included and how delivery works. Answer plainly.",
            "Customer: “Is coaching included?”\nReply: “It is a downloadable PDF guide. Live coaching is not included.”",
            "A clear support reply is part of selling responsibly.",
          ),
        ],
      },
      "You created a visible launch post and saved a clear customer reply.",
    ),
    lesson(
      "21. Move from practice to your real product and shop",
      "creator-complete",
      {
        mode: "handover",
        instruction:
          "Complete one real-world action at a time using the accounts and operations you have rehearsed.",
        hint: "Do not mark an unresolved action complete. A sale is not required to finish the course.",
        learn: [
          card(
            "Repeat the workflow with your own original content",
            "You now know where to click, what to type and what result to inspect. Use the real AI tool with your own subject and evidence, revise the guide, design the final PDF and ask a real reader to try it. The practice example is not your finished original product.",
            "For a cake guide: use your own tested method and process images, verify measurements and safety instructions, and keep the action/checkpoint/fix structure.",
            "Apply the practised method to knowledge you can genuinely verify.",
          ),
          card(
            "Complete real account, payment and delivery checks",
            "The simulation does not create accounts or configure withdrawals. Open the official services yourself. Resolve verification requirements, inspect current Cameroon payment/payout availability, publish the correct PDF and check delivery. If a required route is unavailable, contact official support and pause launch.",
            "Your finish line is a useful original guide, usable accounts, a real listing and a prepared launch. Whether someone buys depends on real demand and execution.",
            "A working offer is an achievable milestone; income is not guaranteed.",
          ),
          card(
            "Keep the launch folder and improve from evidence",
            "Download your launch material and project backup. Record actual questions, costs and confirmed sales, including zero sales. Use real feedback to improve the preview, guide or audience selection. Do not present simulation screens as real earnings or reviews.",
            "Day 1: share a useful tip. Later: demonstrate, show a sample, answer questions and review actual results. Keep private customer information out of public posts.",
            "Honest records show what to improve next.",
          ),
        ],
      },
      "You completed the guided pathway and declared your real-world launch actions complete.",
    ),
  ],
  assessment: {
    passMark: 80,
    warmup: [0, 3, 7],
    questions: [
      {
        question: "What makes a practical product promise useful?",
        options: [
          "An observable result for a specific reader",
          "A guarantee of immediate earnings",
          "A large page count",
        ],
        answer: 0,
        step: 2,
      },
      {
        question: "What belongs in a useful prompt?",
        options: [
          "Only “make it professional”",
          "The reader, task, constraints and desired structure",
          "A real account password",
        ],
        answer: 1,
        step: 4,
      },
      {
        question: "What should you do if you already have an account?",
        options: [
          "Create a fake identity",
          "Skip the signup rehearsal and learn the workspace controls",
          "Skip learning where to send prompts",
        ],
        answer: 1,
        step: 3,
      },
      {
        question:
          "An AI draft contains an unsupported technical instruction. What next?",
        options: [
          "Publish because it sounds confident",
          "Add a cover image",
          "Verify through appropriate reliable guidance and your tested method",
        ],
        answer: 2,
        step: 8,
      },
      {
        question: "What is a useful instruction unit?",
        options: [
          "Action, checkpoint and a correction if needed",
          "A vague promise",
          "A page of motivation",
        ],
        answer: 0,
        step: 9,
      },
      {
        question: "What should you inspect after PDF export?",
        options: [
          "Only the design thumbnail",
          "The actual exported file on a phone",
          "Only the product price",
        ],
        answer: 1,
        step: 11,
      },
      {
        question: "What is the point of a reader trial?",
        options: [
          "Collect a compliment",
          "Invent a testimonial",
          "Find where a real intended reader gets stuck and revise it",
        ],
        answer: 2,
        step: 14,
      },
      {
        question:
          "Does buyer payment support establish seller withdrawal readiness?",
        options: [
          "Always",
          "No; inspect payout destination, verification, fees and timing separately",
          "Only when a screenshot exists",
        ],
        answer: 1,
        step: 19,
      },
      {
        question:
          "Revenue is 10,000 FCFA and relevant costs/fees total 2,000 FCFA. What remains before other obligations?",
        options: ["8,000 FCFA", "10,000 FCFA", "12,000 FCFA"],
        answer: 0,
        step: 15,
      },
      {
        question:
          "Where should real account and verification details be entered?",
        options: [
          "Into this course’s practice forms",
          "Into an AI chat",
          "Only on the official service’s appropriate secure screens",
        ],
        answer: 2,
        step: 16,
      },
      {
        question: "What should a product listing clearly state?",
        options: [
          "Guaranteed income",
          "The real digital contents, format, price, limits and support",
          "That a guide includes a physical cake",
        ],
        answer: 1,
        step: 18,
      },
      {
        question: "What does a confirmed practice checkout mean?",
        options: [
          "A real customer paid",
          "A real payout was configured",
          "Only that the simulated workflow was rehearsed; live setup still needs completion",
        ],
        answer: 2,
        step: 21,
      },
    ],
  },
};
export default course;
