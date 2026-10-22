import type {
  Course,
  CompareAppsTask,
  OpportunityBoardTask,
  Listing,
  TrackerTask,
  SectionOrderTask,
  SequenceTask,
  EvidenceTask,
  CoverLetterTask,
  RedPenTask,
  RedPenLine,
  ComposeTask,
  PortalTask,
  DossierTask,
  NetworkProfileTask,
  FollowUpTask,
  InboxWeekTask,
  InboxEmail,
  TextRule,
} from "../types";

/* ---------- Étape 1 : CompareApps (3 variantes) ---------- */

type Pair = { role: string; org: string; a: string; b: string; proof: string; source: string };

const compare = (p: Pair): CompareAppsTask => {
  const file = (n: string, s: string) => `${n.replace(/ /g, "_")}_${s}.pdf`;
  return {
    type: "compareApps",
    instruction: `${p.a} et ${p.b} ont le même diplôme et la même expérience. Tous deux ont postulé au poste de ${p.role} chez ${p.org}. Lisez les deux e-mails.`,
    a: {
      label: p.a,
      from: `${p.a.split(" ")[0].toLowerCase()}boss237@yahoo.fr`,
      subject: "CV",
      attachments: ["scan0001.pdf"],
      body: "bonjour monsieur svp trouvez mon cv pour tout poste vacant dans votre honorable entreprise. je suis travailleur et craignant Dieu. j'attends votre appel",
      outcome: "Aucune réponse après 4 semaines.",
    },
    b: {
      label: p.b,
      from: `${p.b.toLowerCase().replace(/ /g, ".")}@gmail.com`,
      subject: `Candidature au poste de ${p.role} – ${p.b}`,
      attachments: [file(p.b, "CV"), file(p.b, "Lettre_de_motivation")],
      body: `Madame, Monsieur,\n\nJe vous adresse ma candidature au poste de ${p.role} publié ${p.source}. ${p.proof}\n\nVous trouverez ci-joints mon CV et ma lettre de motivation. Je serais heureux(se) d'en discuter avec vous lors d'un entretien.\n\nCordialement,\n${p.b}\n+237 6 77 21 45 98`,
      outcome: "Invité(e) à un entretien 6 jours plus tard.",
    },
    questions: [
      {
        question: "Qu'apprend le recruteur par le seul objet de l'e-mail ?",
        options: [`L'objet de ${p.a} ne dit rien ; celui de ${p.b} nomme le poste et la personne`, "Rien : les objets ne sont pas lus", "Les deux objets sont aussi clairs", `Celui de ${p.a} est meilleur car il est court`],
        answer: 0,
        explanation: "Un recruteur qui reçoit 200 e-mails trie par objet. « CV » peut concerner n'importe quel poste ; « Candidature au poste de … – Nom » va directement dans la bonne pile.",
      },
      {
        question: `Pourquoi la pièce jointe de ${p.a} pose-t-elle problème ?`,
        options: ["C'est un PDF", "« scan0001.pdf » ne dit ni qui ni quoi, et il n'y a pas de lettre de motivation", "Elle est trop petite", "Il n'y a pas de problème"],
        answer: 1,
        explanation: `${p.b} a envoyé deux PDF clairement nommés : Nom_CV.pdf et Nom_Lettre_de_motivation.pdf. On les retrouve facilement et cela fait professionnel.`,
      },
      {
        question: `Qu'a fait ${p.b} que ${p.a} n'a pas fait ?`,
        options: ["Écrit un message plus long", "Nommé le poste exact, donné une preuve et demandé poliment un entretien", "Utilisé des mots comme « honorable »", "Envoyé l'e-mail la nuit"],
        answer: 1,
        explanation: "Même CV, résultat différent : un poste clair, une vraie preuve et une demande polie. C'est ce que ce cours vous apprend.",
      },
    ],
    success: "Vous avez vu la différence. Tout ce qui a fait réussir la deuxième candidature s'apprend, et vous allez construire chaque partie dans ce cours.",
  };
};

const compare1 = compare({
  role: "Vendeur(se) en pharmacie",
  org: "Akwa Star Pharmacy",
  a: "Eyong Peter",
  b: "Ngwa Brenda",
  proof: "Pendant mon stage de 18 mois dans une pharmacie de Bamenda, j'ai servi plus de 60 clients par jour et tenu le cahier de stock sans erreur.",
  source: "sur votre page Facebook le 2 novembre",
});
const compare2 = compare({
  role: "Réceptionniste",
  org: "Kribi Shores Hotel",
  a: "Mbarga Serge",
  b: "Ewane Linda",
  proof: "Je parle couramment anglais et français et j'ai accueilli jusqu'à 80 clients par jour lors de mon emploi de vacances dans une maison d'hôtes à Limbé.",
  source: "sur le site CameroonJobs",
});
const compare3 = compare({
  role: "Agent de saisie",
  org: "Mfoundi Bright Logistics",
  a: "Ateh Collins",
  b: "Fon Mirabel",
  proof: "Bénévole pour une enquête de santé à Bafoussam, j'ai saisi 1 200 fiches dans Excel en trois semaines avec 99 % d'exactitude.",
  source: "sur votre site internet",
});

/* ---------- Étape 2 : OpportunityBoard (3 variantes) ---------- */

const L = (l: Listing) => l;

const board1: OpportunityBoardTask = {
  type: "opportunityBoard",
  instruction: "Utilisez les filtres, lisez chaque offre, puis retenez celles qui valent une candidature et écartez les autres.",
  persona: "Ngwa Brenda : BTS en comptabilité (2025), stage de 18 mois dans une microfinance, vit à Bamenda, peut s'installer à Douala.",
  today: "lundi 3 novembre",
  listings: [
    L({ id: "b1", title: "Assistant(e) comptable junior", org: "Mbe Hills Microfinance", location: "Bamenda", field: "Finance", deadline: "21 novembre", contact: "jobs@mbehillsmf.cm", details: "BTS ou Licence en comptabilité. Excel. 1 an d'expérience, stages compris. Envoyer CV et lettre de motivation.", expired: false, fake: false, eligible: true, why: "Correspond à son diplôme et à son stage, dans sa ville, date limite à venir. À retenir." }),
    L({ id: "b2", title: "Caissier(ère)", org: "Tiko Fresh Foods", location: "Douala", field: "Vente", deadline: "15 novembre", contact: "recruit@tikofresh.cm", details: "Baccalauréat minimum. Expérience de la caisse. Basé à Douala.", expired: false, fake: false, eligible: true, why: "Elle remplit les conditions, Douala est possible pour elle, et il reste du temps. À retenir." }),
    L({ id: "b3", title: "Responsable financier", org: "Sanaga Health Initiative", location: "Yaoundé", field: "Finance", deadline: "28 octobre", contact: "careers@sanagahealth.org", details: "Master en finance, 5 ans d'expérience en ONG.", expired: true, fake: false, eligible: false, why: "La date limite (28 octobre) est passée, et il faut un Master et 5 ans. À écarter." }),
    L({ id: "b4", title: "Guichetier de banque – 40 postes", org: "Global Capital Recruitment", location: "Douala", field: "Finance", deadline: "Ouvert", contact: "WhatsApp +237 6 99 00 11 22", details: "Pas d'entretien ! Payez 15 000 FCFA de frais de dossier par Mobile Money pour confirmer. Salaire 450 000 FCFA.", expired: false, fake: true, eligible: true, why: "Des frais, WhatsApp seulement, pas d'entretien, salaire trop beau : arnaque classique. À écarter, et prévenez vos amis." }),
    L({ id: "b5", title: "Stagiaire en tenue de livres", org: "Menchum Green Energy", location: "Bamenda", field: "Finance", deadline: "30 novembre", contact: "internships@menchumgreen.cm", details: "Étudiants en dernière année ou jeunes diplômés en comptabilité. Stage rémunéré de 6 mois.", expired: false, fake: false, eligible: true, why: "Jeune diplômée en comptabilité, Bamenda, date limite correcte. À retenir." }),
    L({ id: "b6", title: "Technicien(ne) de laboratoire", org: "Akwa Star Pharmacy", location: "Douala", field: "Santé", deadline: "20 novembre", contact: "jobs@akwastarpharma.cm", details: "Diplôme de technicien de laboratoire exigé.", expired: false, fake: false, eligible: false, why: "Il faut un diplôme de laboratoire qu'elle n'a pas. À écarter." }),
  ],
  success: "Trois vraies chances, sans perdre de temps avec des offres expirées, fausses ou hors de portée. Moins de candidatures, mieux ciblées, obtiennent plus de réponses.",
};

const board2: OpportunityBoardTask = {
  ...board1,
  persona: "Ewane Linda : Licence en tourisme (2024), bilingue, 6 mois de réception dans une maison d'hôtes à Limbé, vit à Buea.",
  today: "mercredi 12 novembre",
  listings: [
    L({ id: "h1", title: "Réceptionniste", org: "Kribi Shores Hotel", location: "Kribi", field: "Hôtellerie", deadline: "30 novembre", contact: "recruitment@kribishores.cm", details: "Bilingue anglais–français, formation en tourisme ou hôtellerie, 6 mois d'expérience. CV et lettre de motivation.", expired: false, fake: false, eligible: true, why: "Correspondance parfaite : bilingue, tourisme, expérience de réception. À retenir." }),
    L({ id: "h2", title: "Conseiller(ère) clientèle", org: "Wouri Connect", location: "Buea", field: "Service client", deadline: "24 novembre", contact: "careers@wouriconnect.cm", details: "Licence, bilingue, bonne aisance au téléphone.", expired: false, fake: false, eligible: true, why: "Elle remplit les conditions et c'est à Buea. À retenir." }),
    L({ id: "h3", title: "Directeur d'hôtel", org: "Mount Fako Lodge", location: "Buea", field: "Hôtellerie", deadline: "5 décembre", contact: "gm@mountfakolodge.cm", details: "10 ans d'expérience en direction d'hôtel. Master souhaité.", expired: false, fake: false, eligible: false, why: "Il faut 10 ans de direction. Pas réaliste pour l'instant. À écarter." }),
    L({ id: "h4", title: "Hôtesse de l'air – compagnie internationale", org: "Sky Africa Jobs Agency", location: "Douala", field: "Hôtellerie", deadline: "Ouvert", contact: "skyafricajobs@gmail.com", details: "Envoyez 25 000 FCFA pour le kit de formation, la copie du passeport et votre code Mobile Money pour vérification.", expired: false, fake: true, eligible: true, why: "On demande de l'argent et votre code. Aucun vrai employeur ne fait cela. À écarter." }),
    L({ id: "h5", title: "Guide touristique (saisonnier)", org: "Limbe Coast Tours", location: "Limbé", field: "Tourisme", deadline: "1er novembre", contact: "info@limbecoast.cm", details: "Études de tourisme, anglais et français.", expired: true, fake: false, eligible: true, why: "Bon profil, mais la date limite (1er novembre) est passée. À écarter." }),
    L({ id: "h6", title: "Assistant(e) réservations", org: "Bamboutos Hotels Group", location: "Douala", field: "Hôtellerie", deadline: "28 novembre", contact: "jobs@bamboutoshotels.cm", details: "Licence, bilingue, maîtrise de l'informatique.", expired: false, fake: false, eligible: true, why: "Elle remplit les conditions ; Douala est assez proche. À retenir." }),
  ],
};

const board3: OpportunityBoardTask = {
  ...board1,
  persona: "Fon Mirabel : Baccalauréat et certificat en bureautique (2025), bénévole en saisie pour une enquête de santé, vit à Bafoussam.",
  today: "mardi 18 novembre",
  listings: [
    L({ id: "d1", title: "Agent de saisie", org: "Mfoundi Bright Logistics", location: "Bafoussam", field: "Administration", deadline: "5 décembre", contact: "hr@mfoundibright.cm", details: "Baccalauréat, Excel, saisie rapide et précise.", expired: false, fake: false, eligible: true, why: "Correspond à son niveau et à son expérience, dans sa ville. À retenir." }),
    L({ id: "d2", title: "Enquêteur(trice) (3 mois)", org: "Sanaga Health Initiative", location: "Bafoussam", field: "Recherche", deadline: "1er décembre", contact: "surveys@sanagahealth.org", details: "Baccalauréat, collecte de données sur smartphone, langues locales appréciées.", expired: false, fake: false, eligible: true, why: "Son expérience d'enquête correspond exactement. À retenir." }),
    L({ id: "d3", title: "Ingénieur systèmes informatiques", org: "Wouri Connect", location: "Douala", field: "Informatique", deadline: "10 décembre", contact: "careers@wouriconnect.cm", details: "Diplôme d'ingénieur en informatique, 3 ans d'expérience réseau.", expired: false, fake: false, eligible: false, why: "Il faut un diplôme d'ingénieur et 3 ans. À écarter pour l'instant." }),
    L({ id: "d4", title: "Saisie en ligne – gagnez 20 000/jour", org: "Fast Cash Typing", location: "En ligne", field: "Administration", deadline: "Aujourd'hui seulement", contact: "WhatsApp +237 6 51 00 00 00", details: "Payez 5 000 FCFA d'inscription et commencez tout de suite. Aucune expérience requise.", expired: false, fake: true, eligible: true, why: "Payer pour travailler, revenu irréaliste, WhatsApp seulement : une arnaque. À écarter." }),
    L({ id: "d5", title: "Assistant(e) de bureau", org: "Bamboutos Learning Centre", location: "Bafoussam", field: "Administration", deadline: "10 novembre", contact: "admin@bamboutoslearning.cm", details: "Baccalauréat, Word et Excel.", expired: true, fake: false, eligible: true, why: "Bon profil mais la date limite est passée. À écarter." }),
    L({ id: "d6", title: "Assistant(e) archives", org: "Menchum Green Energy", location: "Bafoussam", field: "Administration", deadline: "12 décembre", contact: "jobs@menchumgreen.cm", details: "Baccalauréat minimum, classement et informatique.", expired: false, fake: false, eligible: true, why: "Elle remplit les conditions et il reste du temps. À retenir." }),
  ],
};

/* ---------- Étape 3 : ApplicationTracker (3 variantes) ---------- */

const tracker1: TrackerTask = {
  type: "tracker",
  instruction: "Ajoutez au moins 2 candidatures à votre suivi avec l'organisation, le poste et la date limite. Ajoutez aussi les documents et une date de relance.",
  required: 2,
  suggestions: [
    { org: "Mbe Hills Microfinance", role: "Assistant(e) comptable junior", deadline: "2026-11-21", documents: "CV, lettre de motivation" },
    { org: "Tiko Fresh Foods", role: "Caissier(ère)", deadline: "2026-11-15", documents: "CV, lettre de motivation" },
    { org: "Menchum Green Energy", role: "Stagiaire en tenue de livres", deadline: "2026-11-30", documents: "CV, lettre, relevé de notes" },
  ],
  success: "Votre suivi est enregistré dans votre profil. Mettez-le à jour à chaque candidature et à chaque réponse.",
};
const tracker2: TrackerTask = {
  ...tracker1,
  suggestions: [
    { org: "Kribi Shores Hotel", role: "Réceptionniste", deadline: "2026-11-30", documents: "CV, lettre de motivation" },
    { org: "Wouri Connect", role: "Conseiller(ère) clientèle", deadline: "2026-11-24", documents: "CV, lettre, copie CNI" },
    { org: "Bamboutos Hotels Group", role: "Assistant(e) réservations", deadline: "2026-11-28", documents: "CV, lettre de motivation" },
  ],
};
const tracker3: TrackerTask = {
  ...tracker1,
  suggestions: [
    { org: "Mfoundi Bright Logistics", role: "Agent de saisie", deadline: "2026-12-05", documents: "CV, lettre de motivation" },
    { org: "Sanaga Health Initiative", role: "Enquêteur(trice)", deadline: "2026-12-01", documents: "CV, attestation du Bac" },
    { org: "Menchum Green Energy", role: "Assistant(e) archives", deadline: "2026-12-12", documents: "CV, lettre de motivation" },
  ],
};

/* ---------- Étape 4 : SectionOrder pour les formats de lettre (3 variantes) ---------- */

const LETTER_PARTS = {
  formal: [
    { id: "sender", label: "Vos nom, adresse, téléphone et e-mail (en haut à gauche)", why: "Le lecteur doit savoir tout de suite qui écrit et comment vous joindre." },
    { id: "recipient", label: "Monsieur le Directeur, Mbe Hills Microfinance, B.P. 120, Bamenda", why: "Le destinataire, sous vos coordonnées, souvent à droite." },
    { id: "date", label: "Bamenda, le 4 novembre 2026", why: "Le lieu et la date viennent avant l'objet." },
    { id: "subject", label: "Objet : Candidature au poste d'assistant(e) comptable junior", why: "L'objet dit en une ligne de quoi parle la lettre." },
    { id: "salutation", label: "Madame, Monsieur,", why: "Puis la formule d'appel." },
    { id: "body", label: "Corps : accroche, pourquoi moi, pourquoi vous, demande", why: "Les trois ou quatre courts paragraphes de la lettre." },
    { id: "close", label: "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.", why: "Une formule de politesse finale." },
    { id: "signature", label: "Signature et nom complet", why: "Signez toujours et écrivez votre nom à la fin." },
  ],
  email: [
    { id: "subjectLine", label: "Objet : Candidature au poste d'assistant(e) comptable junior – Ngwa Brenda", why: "La première chose que le recruteur voit dans sa boîte." },
    { id: "greet", label: "Madame, Monsieur,", why: "Commencez par une salutation." },
    { id: "purpose", label: "Je vous adresse ma candidature au poste d'assistant(e) comptable junior publié le…", why: "Dites dès la première ligne pourquoi vous écrivez." },
    { id: "proof", label: "Une phrase avec votre meilleure preuve", why: "Une raison d'ouvrir votre CV." },
    { id: "attach", label: "Vous trouverez ci-joints mon CV et ma lettre de motivation.", why: "Dites ce qui est joint." },
    { id: "closing", label: "Cordialement,", why: "Une formule de politesse." },
    { id: "sign", label: "Ngwa Brenda · +237 6 77 21 45 98", why: "Nom et téléphone pour qu'on puisse vous appeler." },
  ],
  paragraphs: [
    { id: "opening", label: "Accroche : le poste, et où vous l'avez vu", why: "Le lecteur sait tout de suite quel poste vous visez." },
    { id: "whyMe", label: "Pourquoi moi : deux preuves liées à l'annonce", why: "Le cœur de la lettre : des preuves, pas des adjectifs." },
    { id: "whyThem", label: "Pourquoi cette organisation", why: "Montre que vous l'avez choisie, pas « n'importe quelle entreprise »." },
    { id: "request", label: "Demande : solliciter un entretien et remercier", why: "Terminez par l'étape suivante que vous souhaitez." },
  ],
};

const rotate = <T,>(a: T[], n: number) => [...a.slice(n), ...a.slice(0, n)];
const shuffled = <T,>(a: T[], order: number[]) => order.map((i) => a[i]);

const letterOrder = (shift: number): SectionOrderTask => ({
  type: "sectionOrder",
  rounds: [
    {
      persona: "Une lettre formelle (imprimée, déposée en main propre ou jointe en PDF)",
      instruction: "Glissez ou utilisez les flèches pour remettre les parties dans l'ordre, du haut au bas de la page.",
      sections: shuffled(LETTER_PARTS.formal, rotate([4, 0, 6, 2, 7, 1, 5, 3], shift)),
      answer: LETTER_PARTS.formal.map((x) => x.id),
    },
    {
      persona: "L'e-mail de candidature qui accompagne vos documents",
      instruction: "Remettez les parties de l'e-mail dans l'ordre.",
      sections: shuffled(LETTER_PARTS.email, rotate([3, 6, 1, 4, 0, 5, 2], shift)),
      answer: LETTER_PARTS.email.map((x) => x.id),
    },
    {
      persona: "Les paragraphes d'une lettre de motivation",
      instruction: "Remettez les quatre paragraphes dans l'ordre.",
      sections: shuffled(LETTER_PARTS.paragraphs, rotate([2, 0, 3, 1], shift % 4)),
      answer: LETTER_PARTS.paragraphs.map((x) => x.id),
    },
  ],
  success: "Lettre formelle, e-mail, paragraphes : vous savez où va chaque élément. Les recruteurs remarquent une mise en page correcte avant de lire un mot.",
});

/* ---------- Étape 5 : Accroches (séquence : choisir, puis corriger) ---------- */

const BAD_OPENING_RULES = (role: string[], example: string): TextRule[] => [
  { kind: "changed", message: "Réécrivez l'accroche avec vos propres mots." },
  { kind: "excludesAll", words: ["humblement", "supplie", "honorable", "craignant dieu", "tout poste vacant", "travailleur", "travailleuse"], message: "Supprimez les supplications et les clichés (« je viens humblement », « honorable entreprise », « travailleur »)." },
  { kind: "includesAny", words: ["candidature", "postule", "postuler", "candidat"], message: "Dites clairement que vous posez votre candidature." },
  { kind: "includesAny", words: role, message: `Nommez le poste exact, par ex. « ${example} ».` },
  { kind: "minWords", n: 15, message: "Ajoutez une raison de lire la suite : votre diplôme ou votre meilleure preuve (au moins 15 mots)." },
  { kind: "maxWords", n: 70, message: "Une accroche fait 1 à 3 phrases : moins de 70 mots." },
];

const openings = (role: string, org: string, roleWords: string[], name: string, bg: string): SequenceTask => ({
  type: "sequence",
  tasks: [
    {
      type: "multipleChoice",
      question: `Quelle accroche pour le poste de ${role} chez ${org} donne envie au recruteur de continuer ?`,
      options: [
        "Je viens très humblement solliciter un poste vacant dans votre honorable entreprise.",
        `Je m'appelle ${name}, j'ai 24 ans, je suis célibataire et issu(e) d'une bonne famille chrétienne.`,
        `Je vous adresse ma candidature au poste de ${role} publié sur votre site internet. ${bg}`,
        "Après mon diplôme, je souhaite me perfectionner et acquérir de l'expérience dans votre entreprise.",
      ],
      answer: 2,
      explanation: "Elle nomme le poste et l'endroit où il a été vu, puis donne une raison de lire la suite. Les autres parlent des besoins du candidat, de sa vie privée ou de « tout poste ».",
      hints: ["« Un poste vacant » montre que vous n'avez pas lu l'annonce.", "L'âge, la situation de famille et la religion ne sont pas des raisons de vous recruter.", null, "Elle parle de ce que vous voulez, pas de ce que vous apportez."],
    },
    {
      type: "fixText",
      instruction: `Réécrivez cette accroche pour le poste de ${role} chez ${org}. Nommez le poste, dites où vous l'avez vu et donnez une raison de lire la suite.`,
      initial: "Je viens très humblement vous supplier de m'accorder tout poste vacant dans votre honorable entreprise. Je suis un jeune travailleur et craignant Dieu, prêt à travailler.",
      multiline: true,
      rules: BAD_OPENING_RULES(roleWords, `Je vous adresse ma candidature au poste de ${role}…`),
      success: "Clair et assuré. Le recruteur sait quel poste vous visez et pourquoi continuer à lire.",
    },
  ],
});

/* ---------- Étapes 6–7 : Preuves + lettre (même annonce par apprenant) ---------- */

type Advert = { id: string; org: string; role: string; contact: string; text: string; requirements: { id: string; text: string; keywords: string[] }[] };

const ADVERTS: Advert[] = [
  {
    id: "mbehills-accounts",
    org: "Mbe Hills Microfinance",
    role: "Assistant(e) comptable junior",
    contact: "",
    text: "Mbe Hills Microfinance, Bamenda, recrute un(e) assistant(e) comptable junior.\nProfil : BTS ou Licence en comptabilité ou finance ; bonne maîtrise d'Excel ; au moins 1 an d'expérience (stages compris) ; rigueur avec les chiffres ; anglais et français.\nEnvoyez CV et lettre de motivation à jobs@mbehillsmf.cm avant le 21 novembre.",
    requirements: [
      { id: "diploma", text: "BTS ou Licence en comptabilité ou finance", keywords: ["bts", "hnd", "licence", "bachelor", "comptab", "finance"] },
      { id: "excel", text: "Bonne maîtrise d'Excel", keywords: ["excel", "tableur"] },
      { id: "experience", text: "Au moins 1 an d'expérience (stages compris)", keywords: ["stage", "experience", "expérience", "assistant", "caiss"] },
      { id: "accuracy", text: "Rigueur avec les chiffres", keywords: ["erreur", "exact", "rapproch", "enregistr", "caisse", "chiffre"] },
      { id: "languages", text: "Anglais et français", keywords: ["anglais", "français", "francais", "bilingue"] },
    ],
  },
  {
    id: "wouri-care",
    org: "Wouri Connect",
    role: "Conseiller(ère) clientèle",
    contact: "Mme Ekane",
    text: "Wouri Connect, Buea, recherche des conseillers clientèle.\nProfil : Licence ; bilingue anglais–français ; expérience du service client ; calme sous pression ; bases en informatique.\nEnvoyez CV et lettre de motivation à careers@wouriconnect.cm, à l'attention de Mme Ekane, avant le 24 novembre.",
    requirements: [
      { id: "degree", text: "Une Licence", keywords: ["licence", "bachelor", "diplôme", "diplome", "bts"] },
      { id: "bilingual", text: "Bilingue anglais–français", keywords: ["anglais", "français", "francais", "bilingue"] },
      { id: "customers", text: "Expérience du service client", keywords: ["client", "accueil", "servi", "vente"] },
      { id: "pressure", text: "Calme sous pression", keywords: ["par jour", "quotidien", "affluence", "file", "réclamation", "reclamation"] },
      { id: "computer", text: "Bases en informatique", keywords: ["informatique", "word", "excel", "internet", "e-mail"] },
    ],
  },
  {
    id: "mfoundi-data",
    org: "Mfoundi Bright Logistics",
    role: "Agent de saisie",
    contact: "",
    text: "Mfoundi Bright Logistics, Bafoussam, recherche un agent de saisie.\nProfil : Baccalauréat ou plus ; Excel ; saisie rapide et précise ; expérience des registres ou formulaires ; fiable et ponctuel.\nEnvoyez CV et lettre de motivation à hr@mfoundibright.cm avant le 5 décembre.",
    requirements: [
      { id: "level", text: "Baccalauréat ou plus", keywords: ["baccalaur", "bac", "gce", "bts", "licence", "certificat"] },
      { id: "excel", text: "Excel", keywords: ["excel", "tableur"] },
      { id: "typing", text: "Saisie rapide et précise", keywords: ["saisi", "données", "donnees", "exactitude", "précis", "precis"] },
      { id: "records", text: "Expérience des registres ou formulaires", keywords: ["registre", "fiche", "formulaire", "enquête", "enquete", "stock", "dossier"] },
      { id: "reliable", text: "Fiable et ponctuel", keywords: ["jamais", "à l'heure", "chaque", "fiable", "ponctu", "délai", "delai"] },
    ],
  },
];

const evidence = (a: Advert): EvidenceTask => ({
  type: "evidence",
  instruction: "Pour chaque exigence, choisissez la ligne de votre CV qui la prouve. Laissez une lacune si vous n'avez pas de preuve : c'est honnête.",
  advert: { id: a.id, org: a.org, role: a.role, requirements: a.requirements },
  minLinks: 2,
  success: "Vos preuves sont reliées à cette annonce. À l'étape suivante, elles apparaissent dans votre outil de lettre de motivation.",
});

const letter = (a: Advert): CoverLetterTask => ({
  type: "coverLetter",
  instruction: "Rédigez votre lettre de motivation pour cette annonce, une partie à la fois. Utilisez vos preuves de l'étape précédente dans « Pourquoi moi ».",
  advert: { id: a.id, org: a.org, role: a.role, contact: a.contact, text: a.text },
  maxWords: 300,
  success: "Une lettre d'une page avec le poste, de vraies preuves et une demande claire. Téléchargez-la : vous la joindrez à l'étape 9.",
});

/* ---------- Étape 8 : Stylo rouge sur une lettre (3 variantes) ---------- */

const LETTER_ERRORS = [
  { id: "wrongOrg", label: "Mauvais nom d'organisation", why: "Copié d'une autre lettre. Rien ne montre plus vite la négligence : vérifiez les noms avant chaque envoi." },
  { id: "noRole", label: "Aucun poste nommé", why: "« Tout poste vacant » oblige le lecteur à deviner. Nommez le poste exact de l'annonce." },
  { id: "cliche", label: "Des clichés au lieu de preuves", why: "« Travailleur, dynamique, craignant Dieu » est dans toutes les lettres. Remplacez-le par ce que vous avez fait et son résultat." },
  { id: "personal", label: "Détails personnels inutiles", why: "L'âge, l'ethnie, la situation de famille et la religion n'ont pas leur place dans une lettre de motivation." },
  { id: "begging", label: "Ton suppliant", why: "« Je vous en supplie, je souffre » demande de la pitié. Montrez plutôt ce que vous apportez : avec assurance et politesse." },
  { id: "spelling", label: "Faute d'orthographe", why: "Une seule faute peut vous éliminer. Relisez à voix haute avant d'envoyer." },
  { id: "closing", label: "Formule finale inadaptée", why: "« Madame, Monsieur » appelle « Veuillez agréer… mes salutations distinguées ». « Bisous » ou « Votre fils » ne sont jamais professionnels." },
];

const redLetter = (lines: RedPenLine[]): RedPenTask => ({
  type: "redPen",
  instruction: "Cette lettre de motivation allait être envoyée. Touchez toutes les erreurs que vous trouvez.",
  passPercent: 70,
  success: "Bon œil. Relisez maintenant votre propre lettre pour ces sept erreurs avant de l'envoyer.",
  lines,
  errors: LETTER_ERRORS,
});

const redPen1 = redLetter([
  { style: "small", parts: ["Bamenda, le 4 novembre 2026"] },
  { parts: ["Objet : Candidature à ", { text: "tout poste vacant", error: "noRole" }] },
  { parts: ["Madame, Monsieur,"] },
  { parts: ["Je souhaite travailler chez ", { text: "Tiko Fresh Foods", error: "wrongOrg" }, ". J'ai vu votre annonce de Mbe Hills Microfinance sur Facebook."] },
  { parts: ["Je suis une jeune femme ", { text: "travailleuse, dynamique et craignant Dieu", error: "cliche" }, ". ", { text: "J'ai 25 ans, je suis célibataire, originaire de Ndop", error: "personal" }, "."] },
  { parts: ["J'ai un BTS en comptabilité et je maîtrise bien ", { text: "Exel", error: "spelling" }, "."] },
  { parts: [{ text: "Je vous en supplie, prenez-moi, j'ai beaucoup souffert depuis l'école", error: "begging" }, "."] },
  { parts: [{ text: "Bisous,", error: "closing" }] },
  { parts: ["Ngwa Brenda"] },
]);
const redPen2 = redLetter([
  { style: "small", parts: ["Buea, le 13 novembre 2026"] },
  { parts: ["Madame, Monsieur,"] },
  { parts: ["Je vous écris pour ", { text: "un poste dans votre société", error: "noRole" }, " chez ", { text: "Kribi Shores Hotel", error: "wrongOrg" }, ", suite à l'annonce de Wouri Connect."] },
  { parts: ["Je suis ", { text: "honnête, travailleuse et prête à travailler dans toutes les conditions", error: "cliche" }, "."] },
  { parts: [{ text: "Je suis catholique, j'ai 27 ans et je suis de l'ethnie bakweri", error: "personal" }, "."] },
  { parts: ["J'ai une Licence et de bonnes capacités de ", { text: "comunication", error: "spelling" }, "."] },
  { parts: [{ text: "Ma famille compte sur moi, ayez pitié et donnez-moi ce travail", error: "begging" }, "."] },
  { parts: [{ text: "Votre sœur en Christ,", error: "closing" }] },
  { parts: ["Ewane Linda"] },
]);
const redPen3 = redLetter([
  { style: "small", parts: ["Bafoussam, le 19 novembre 2026"] },
  { parts: ["Objet : Demande ", { text: "d'emploi", error: "noRole" }] },
  { parts: ["Madame, Monsieur,"] },
  { parts: ["Suite à votre annonce, je postule chez ", { text: "Sanaga Health Initiative", error: "wrongOrg" }, " (Mfoundi Bright Logistics, Bafoussam)."] },
  { parts: ["Je suis une personne ", { text: "dynamique, sérieuse et très travailleuse", error: "cliche" }, ". ", { text: "Je suis mariée, mère de deux enfants et chrétienne", error: "personal" }, "."] },
  { parts: ["J'ai mon Baccalauréat et je saisis de façon très ", { text: "précize", error: "spelling" }, "."] },
  { parts: [{ text: "Je vous en supplie, je suis sans emploi depuis trois ans", error: "begging" }, "."] },
  { parts: [{ text: "Bisous,", error: "closing" }] },
  { parts: ["Fon Mirabel"] },
]);

/* ---------- Étape 9 : Postuler par e-mail avec deux pièces jointes (3 variantes) ---------- */

const applyEmail = (to: string, role: string, roleWords: string[], name: string, junk: string[]): ComposeTask => {
  const f = name.replace(/ /g, "_");
  return {
    type: "compose",
    instruction: `Envoyez la candidature de ${name} au poste de ${role} à ${to}. Joignez le CV et la lettre de motivation, écrivez un objet clair et un court message.`,
    files: [junk[0], `${f}_CV.pdf`, junk[1], `${f}_Lettre_de_motivation.pdf`],
    rules: [
      { kind: "equals", field: "to", value: to, message: `Envoyez-le à ${to}, exactement comme dans l'annonce.` },
      { field: "subject", kind: "includesAny", words: roleWords, message: `Nommez le poste dans l'objet : « Candidature au poste de ${role} – ${name} ».` },
      { field: "subject", kind: "includesAny", words: name.toLowerCase().split(" "), message: `Ajoutez le nom dans l'objet : « Candidature au poste de ${role} – ${name} ».` },
      { kind: "attachment", file: `${f}_CV.pdf`, message: `Joignez le CV : ${f}_CV.pdf.` },
      { kind: "attachment", file: `${f}_Lettre_de_motivation.pdf`, message: `Joignez la lettre : ${f}_Lettre_de_motivation.pdf.` },
      { kind: "noAttachment", file: junk[0], message: `Retirez ${junk[0]} : n'envoyez que ce que l'annonce demande, en PDF bien nommés.` },
      { kind: "noAttachment", file: junk[1], message: `Retirez ${junk[1]} : n'envoyez que ce que l'annonce demande, en PDF bien nommés.` },
      { kind: "greeting", message: "Commencez par une salutation, par ex. « Madame, Monsieur, »." },
      { field: "body", kind: "includesAny", words: ["ci-joint", "ci-joints", "ci-jointe", "pièce jointe", "pièces jointes", "piece jointe", "trouverez"], message: "Dites ce qui est joint : « Vous trouverez ci-joints mon CV et ma lettre de motivation. »" },
      { kind: "closing", message: "Terminez par une formule comme « Cordialement, » et votre nom." },
      { field: "body", kind: "maxWords", n: 120, message: "Gardez l'e-mail court (moins de 120 mots) : les détails sont dans la lettre." },
    ],
    success: "Voilà une candidature qu'un recruteur classe en deux secondes : objet clair, deux PDF bien nommés, un message court et poli.",
  };
};

/* ---------- Étape 10 : Portail avec expiration de session (3 variantes) ---------- */

const portalInbox = (org: string): InboxEmail[] => [
  { id: "p1", from: "MTN MoMo", fromEmail: "noreply@momo-alerts.cm", subject: "Vous avez reçu 5 000 FCFA", preview: "ID de transaction 88213…", body: "Vous avez reçu 5 000 FCFA. ID de transaction 88213.", time: "08:12" },
  { id: "p2", from: "Résumé du groupe WhatsApp", fromEmail: "digest@groups.example.cm", subject: "12 nouveaux messages", preview: "Qui a les anciennes épreuves…", body: "12 nouveaux messages dans le groupe BTS 2025.", time: "Hier" },
  { id: "p3", from: `${org} (faux)`, fromEmail: `${org.toLowerCase().replace(/\s+/g, "")}-jobs@gmail.com`, subject: "Payez pour confirmer votre candidature", preview: "Envoyez 10 000 FCFA…", body: "Envoyez 10 000 FCFA pour confirmer votre candidature.", time: "Hier" },
];

const portal = (portalName: string, org: string, role: string, refPrefix: string, motivationQuestion: string): PortalTask => ({
  type: "portal",
  portalName,
  org,
  role,
  motivationQuestion,
  wordLimit: 150,
  maxFileMb: 2,
  allowedTypes: ["pdf"],
  refPrefix,
  sessionSeconds: 180,
  inbox: portalInbox(org),
  success: "Envoyée, confirmée et suivie. Vous avez aussi appris à enregistrer des brouillons : les vrais portails vous déconnectent sans prévenir.",
});

/* ---------- Étape 11 : Dossier (3 variantes) ---------- */

const dossier1: DossierTask = {
  type: "dossier",
  instruction: "Constituez le dossier papier demandé : seulement les pièces listées, le bon nombre d'exemplaires, dans l'ordre indiqué.",
  advert: {
    org: "Bamboutos Learning Centre",
    title: "Recrutement de 4 assistant(e)s administratif(ve)s",
    text: "Les dossiers comprennent, dans cet ordre :\n1. Une demande manuscrite adressée au Directeur\n2. Un CV (2 exemplaires)\n3. Une copie certifiée du diplôme le plus élevé\n4. Une copie de la carte nationale d'identité\n5. Deux photos d'identité\nLes dossiers sont déposés sous enveloppe fermée à l'accueil du Centre avant le 28 novembre.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 2 },
    { id: "diploma", copies: 1 },
    { id: "id", copies: 1 },
    { id: "photos", copies: 2 },
  ],
  pile: [
    { id: "cv", label: "CV", detail: "Imprimé, 2 pages" },
    { id: "originalDiploma", label: "Diplôme original", detail: "Ne déposez jamais d'originaux" },
    { id: "photos", label: "Photo d'identité" },
    { id: "letter", label: "Demande manuscrite", detail: "Adressée au Directeur" },
    { id: "baptism", label: "Certificat de baptême" },
    { id: "diploma", label: "Copie certifiée du BTS" },
    { id: "id", label: "Copie de la CNI" },
    { id: "transcript", label: "Relevé de notes", detail: "Non demandé" },
  ],
  success: "Complet, rien en trop, dans le bon ordre. Photographiez chaque page et notez la date de dépôt dans votre suivi.",
};
const dossier2: DossierTask = {
  ...dossier1,
  advert: {
    org: "Sanaga Health Initiative",
    title: "Agents de santé communautaire (6 postes)",
    text: "Les candidatures comprennent, dans cet ordre :\n1. Une lettre de candidature\n2. Un CV\n3. Une copie du diplôme le plus élevé\n4. Un certificat médical récent\n5. Une copie de la carte nationale d'identité (2 exemplaires)\nDépôt au bureau régional, Yaoundé, avant le 5 décembre.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 1 },
    { id: "diploma", copies: 1 },
    { id: "medical", copies: 1 },
    { id: "id", copies: 2 },
  ],
  pile: [
    { id: "id", label: "Copie de la CNI" },
    { id: "photos", label: "Photo d'identité", detail: "Non demandée ici" },
    { id: "medical", label: "Certificat médical", detail: "Daté de ce mois" },
    { id: "letter", label: "Lettre de candidature" },
    { id: "birth", label: "Copie d'acte de naissance" },
    { id: "cv", label: "CV" },
    { id: "originalId", label: "CNI originale", detail: "Gardez-la" },
    { id: "diploma", label: "Copie de la Licence" },
  ],
};
const dossier3: DossierTask = {
  ...dossier1,
  advert: {
    org: "Menchum Green Energy",
    title: "Programme jeunes diplômés",
    text: "Envoyez une enveloppe contenant, dans cet ordre :\n1. Une lettre de motivation\n2. Un CV (2 exemplaires)\n3. Les copies de tous les diplômes depuis le Baccalauréat\n4. Une copie d'acte de naissance\n5. Une photo d'identité\nÀ l'attention du Responsable RH, B.P. 77, Wum. Date limite : 12 décembre.",
  },
  required: [
    { id: "letter", copies: 1 },
    { id: "cv", copies: 2 },
    { id: "diploma", copies: 1 },
    { id: "birth", copies: 1 },
    { id: "photos", copies: 1 },
  ],
  pile: [
    { id: "birth", label: "Copie d'acte de naissance" },
    { id: "cv", label: "CV" },
    { id: "recommendation", label: "Lettre de votre pasteur", detail: "Non demandée" },
    { id: "diploma", label: "Copies du Bac et du BTS" },
    { id: "photos", label: "Photo d'identité" },
    { id: "letter", label: "Lettre de motivation" },
    { id: "originalDiploma", label: "BTS original", detail: "N'envoyez jamais d'originaux" },
    { id: "id", label: "Copie de la CNI", detail: "Non demandée ici" },
  ],
};

/* ---------- Étape 12 : Demander un référent (3 variantes) ---------- */

const referee = (to: string, who: string, role: string, roleWords: string[], org: string): ComposeTask => ({
  type: "compose",
  instruction: `${org} demande deux référents. Écrivez à ${who} (${to}) pour lui demander s'il ou elle accepte d'être votre référent pour le poste de ${role}.`,
  files: [],
  rules: [
    { kind: "equals", field: "to", value: to, message: `Envoyez-le à ${to}.` },
    { kind: "notEmpty", field: "subject", message: `Ajoutez un objet, par ex. « Demande de référence – ${role} ».` },
    { kind: "greeting", message: `Commencez par une salutation, par ex. « Bonjour ${who}, ».` },
    { field: "body", kind: "includesAny", words: ["référent", "referent", "référence", "reference", "recommandation"], message: "Dites clairement que vous lui demandez d'être votre référent." },
    { field: "body", kind: "includesAny", words: roleWords, message: `Nommez le poste visé : ${role}.` },
    { field: "body", kind: "includesAny", words: ["accepteriez", "pourriez", "voudriez", "s'il vous plaît", "svp", "je vous prie", "puis-je"], message: "Demandez poliment : « Accepteriez-vous d'être mon référent ? »" },
    { field: "body", kind: "includesAny", words: ["merci", "remercie"], message: "Remerciez-le ou la pour son temps." },
    { kind: "closing", message: "Terminez par une formule de politesse et votre nom." },
    { field: "body", kind: "maxWords", n: 150, message: "Restez bref : moins de 150 mots." },
  ],
  success: "Poli, précis et facile à accepter. Demandez toujours avant de citer quelqu'un, et prévenez-le d'un éventuel appel.",
});

/* ---------- Étape 13 : Profil réseau (3 variantes) ---------- */

const network = (headlineExample: string, aboutExample: string): NetworkProfileTask => ({
  type: "networkProfile",
  instruction: "Construisez le profil professionnel que les recruteurs trouveront en vous cherchant. Atteignez 100 % sur la jauge.",
  headlineExample,
  aboutExample,
  success: "Votre profil est prêt. Copiez-le sur le réseau professionnel que vous utilisez et ajoutez le lien dans l'en-tête de votre CV.",
});

/* ---------- Étape 14 : Relance + une semaine de réponses ---------- */

const followUp = (deadlineDay: number, role: string, org: string, to: string, roleWords: string[]): FollowUpTask => ({
  type: "followUp",
  instruction: `Vous avez postulé au poste de ${role} chez ${org} le jour 0. La date limite est le jour ${deadlineDay}. Pas de nouvelles. Quand relancez-vous ?`,
  days: deadlineDay + 14,
  deadlineDay,
  window: [deadlineDay + 5, deadlineDay + 10],
  feedback: {
    early: "Trop tôt : ils reçoivent encore des candidatures. Attendez environ une semaine après la date limite.",
    late: "Trop tard : les décisions sont peut-être prises. Relancez environ une semaine après la date limite.",
    right: "Exact : environ une semaine après la date limite. Écrivez maintenant une relance courte et polie.",
  },
  compose: {
    type: "compose",
    instruction: `Écrivez votre relance à ${to}.`,
    files: [],
    rules: [
      { kind: "equals", field: "to", value: to, message: `Envoyez-la à ${to}.` },
      { field: "subject", kind: "includesAny", words: roleWords, message: `Nommez le poste dans l'objet : « Suivi de ma candidature – ${role} ».` },
      { kind: "greeting", message: "Commencez par une salutation." },
      { field: "body", kind: "includesAny", words: ["candidature", "postulé", "postule", "envoyé", "envoye"], message: "Rappelez que vous avez postulé, et quand." },
      { field: "body", kind: "includesAny", words: ["toujours", "intéress", "interess", "motivé", "motive"], message: "Dites que le poste vous intéresse toujours." },
      { field: "body", kind: "excludesAll", words: ["pourquoi vous n'avez pas", "vous n'avez pas répondu", "urgent", "au plus vite"], message: "Restez poli : ne vous plaignez pas et n'exigez pas de réponse." },
      { kind: "closing", message: "Terminez par une formule de politesse et votre nom." },
      { field: "body", kind: "maxWords", n: 100, message: "Une relance est courte : moins de 100 mots." },
    ],
    success: "Court, poli, et votre nom revient en haut de la pile.",
  },
  success: "Relance au bon moment, sur le bon ton.",
});

const mail = (id: string, from: string, fromEmail: string, subject: string, body: string): InboxEmail => ({
  id,
  from,
  fromEmail,
  subject,
  preview: body.split("\n").find((l) => l.trim() && !/^(madame|bonjour|cher|chère)/i.test(l))?.slice(0, 60) ?? "",
  body,
  time: "",
});

const WEEK_FILES = (n: string) => [`${n}_CV.pdf`, `${n}_Diplome.pdf`, `${n}_Acte_de_naissance.pdf`, "selfie.jpg"];

const week = (n: string, a: { org: string; role: string; email: string }, b: { org: string; role: string; email: string }, order: "ackA" | "ackB"): InboxWeekTask => {
  const who = n.replace("_", " ");
  const ack = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "ack" as const,
    application: which,
    email: mail(id, `Recrutement ${app.org}`, app.email, `Candidature reçue – ${app.role}`, `Madame, Monsieur,\n\nCeci est un message automatique. Nous avons bien reçu votre candidature au poste de ${app.role}. Les candidats présélectionnés seront contactés.\n\n${app.org}`),
  });
  const missing = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "missingDocument" as const,
    application: which,
    deadlineHours: 36,
    email: mail(id, `RH ${app.org}`, app.email, `Pièce manquante – ${app.role}`, `Bonjour ${who},\n\nMerci pour votre candidature au poste de ${app.role}. Il manque à votre dossier une copie de votre diplôme. Merci de nous l'envoyer en réponse sous 36 heures, faute de quoi votre dossier ne pourra pas être étudié.\n\nCordialement,\nService RH, ${app.org}`),
  });
  const invite = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "interview" as const,
    application: which,
    deadlineHours: 24,
    email: mail(id, `RH ${app.org}`, app.email, `Invitation à un entretien – ${app.role}`, `Bonjour ${who},\n\nNous avons le plaisir de vous inviter à un entretien pour le poste de ${app.role}. Merci de répondre sous 24 heures en indiquant un jour et une heure où vous êtes disponible la semaine prochaine (du lundi au vendredi, 9 h – 16 h).\n\nCordialement,\nService RH, ${app.org}`),
  });
  const reject = (id: string, app: typeof a, at: number, which: "A" | "B") => ({
    id,
    at,
    kind: "rejection" as const,
    application: which,
    email: mail(id, `RH ${app.org}`, app.email, `Votre candidature – ${app.role}`, `Bonjour ${who},\n\nNous vous remercions de l'intérêt porté à ${app.org}. Après examen attentif, nous ne donnerons pas suite à votre candidature pour ce poste. Nous vous encourageons à postuler à nos prochaines offres.\n\nCordialement,\nService RH, ${app.org}`),
  });
  const scam = {
    id: "s",
    at: 58,
    kind: "scam" as const,
    application: null,
    email: mail("s", "Service Recrutement", "jobs.offer.cameroon@gmail.com", "FÉLICITATIONS vous êtes retenu(e) !!!", `Cher(e) candidat(e),\n\nVous avez été RETENU(E) pour un poste très bien payé. Pour confirmer, envoyez 20 000 FCFA de « frais de dossier » par Mobile Money au 6 50 00 00 00 avec votre code MoMo sous 2 heures.\n\nService Recrutement`),
  };
  const events =
    order === "ackA"
      ? [ack("a1", a, 2, "A"), ack("b1", b, 9, "B"), missing("a2", a, 30, "A"), scam, invite("b2", b, 95, "B")]
      : [ack("b1", b, 3, "B"), invite("a1", a, 26, "A"), scam, missing("b2", b, 74, "B"), reject("b3", b, 130, "B")];
  return {
    type: "inboxWeek",
    instruction: `C'est la semaine après vos candidatures chez ${a.org} (A) et ${b.org} (B). Traitez chaque e-mail et tenez votre suivi à jour.`,
    applications: [
      { id: "A", org: a.org, role: a.role },
      { id: "B", org: b.org, role: b.role },
    ],
    events,
    files: WEEK_FILES(n),
    requiredFile: `${n}_Diplome.pdf`,
    passPercent: 70,
    success: "Une semaine entière gérée : rien d'oublié, rien en retard, aucune arnaque, et un suivi qui dit la vérité.",
  };
};

const followWeek = (f: FollowUpTask, w: InboxWeekTask): SequenceTask => ({ type: "sequence", tasks: [f, w], images: [null, "app-14-envelope-path"] });

const MBE = { org: "Mbe Hills Microfinance", role: "Assistant(e) comptable junior", email: "jobs@mbehillsmf.cm" };
const TIKO = { org: "Tiko Fresh Foods", role: "Caissier(ère)", email: "recruit@tikofresh.cm" };
const KRIBI = { org: "Kribi Shores Hotel", role: "Réceptionniste", email: "recruitment@kribishores.cm" };
const WOURI = { org: "Wouri Connect", role: "Conseiller(ère) clientèle", email: "careers@wouriconnect.cm" };
const MFOUNDI = { org: "Mfoundi Bright Logistics", role: "Agent de saisie", email: "hr@mfoundibright.cm" };
const SANAGA = { org: "Sanaga Health Initiative", role: "Enquêteur(trice)", email: "surveys@sanagahealth.org" };

/* ---------- Étape 15 : Mission finale ---------- */

const MISSION_ADVERT = {
  org: "Nyanga Youth Futures",
  title: "Assistant(e) administratif(ve)",
  text: "Nyanga Youth Futures, association pour l'emploi des jeunes à Douala, recrute un(e) assistant(e) administratif(ve).\n\nVos missions : gérer la messagerie et le classement du bureau, tenir les registres de présence et de paiement dans Excel, accueillir les visiteurs et préparer des rapports simples.\n\nProfil : Baccalauréat ou plus ; Word, Excel et e-mail ; organisé(e) et rigoureux(se) ; français et anglais (l'un couramment).\n\nPour postuler : envoyez votre CV et une lettre de motivation en deux PDF (Prenom_Nom_CV.pdf et Prenom_Nom_Lettre_de_motivation.pdf) à l'adresse indiquée sur l'écran de mission. Objet : « Candidature au poste d'assistant(e) administratif(ve) – Votre nom ». Date limite : 15 décembre.",
};

const missionLetter: CoverLetterTask = {
  type: "coverLetter",
  instruction: "Rédigez votre lettre de motivation pour cette annonce, puis téléchargez-la. Vous la joindrez à votre vraie candidature.",
  advert: { id: "nyanga-admin", org: MISSION_ADVERT.org, role: MISSION_ADVERT.title, contact: "", text: MISSION_ADVERT.text },
  maxWords: 300,
  success: "Votre lettre pour Nyanga Youth Futures est prête. Téléchargez-la, puis touchez « Terminer le cours » pour l'adresse de la mission.",
};

const course: Course = {
  id: "applications",
  locale: "fr",
  title: "Des candidatures qui obtiennent des réponses",
  promise: "Repartez avec une lettre de motivation ciblée, un profil professionnel en ligne et une vraie candidature envoyée, et sachez répondre à chaque réponse.",
  price: 1000,
  track: "career",
  audience: "Pour les diplômés et les chercheurs d’emploi",
  cover: "app-15-mission",
  outcomes: ["Une lettre de motivation ciblée pour une vraie offre", "Un suivi des candidatures et un profil professionnel", "Une vraie candidature envoyée, et la réponse gérée"],
  series: "Décrocher un emploi · 2 sur 4",
  usesCv: true,
  badge: "app-certificate-badge",
  freeSteps: 1,
  steps: [
    // Partie A : Trouver et s'organiser
    {
      title: "Pourquoi certaines candidatures obtiennent une réponse",
      illustration: "app-01-two-applicants",
      cvSetup: true,
      body: [
        "Deux personnes avec le même diplôme postulent au même poste. L'une obtient un entretien, l'autre n'a aucune nouvelle. La différence vient rarement du CV : elle vient de tout ce qui l'entoure.",
        "Un objet clair, des PDF bien nommés, une lettre courte et ciblée, et une réponse polie quand le recruteur écrit. Tout cela s'apprend.",
        "Regardez deux candidatures réalistes et trouvez la différence.",
      ],
      mistake: "Envoyer le même e-mail « pour tout poste vacant » à toutes les entreprises. Les recruteurs le voient et passent.",
      task: compare1,
      variants: [compare2, compare3],
    },
    {
      title: "Trouver de vraies offres, éviter les pièges",
      illustration: "app-02-opportunities",
      body: [
        "Bonnes sources : sites et pages des organisations, sites d'emploi fiables, services carrière des universités, et les personnes que vous connaissez dans le domaine.",
        "Avant de passer du temps sur une annonce, vérifiez trois choses : la date limite est-elle à venir, avez-vous les conditions obligatoires, et est-elle réelle ? Des frais, un contact uniquement WhatsApp ou « pas d'entretien » signalent une arnaque.",
      ],
      mistake: "Postuler à tout. Dix candidatures bien ciblées obtiennent plus de réponses que cinquante au hasard.",
      task: board1,
      variants: [board2, board3],
    },
    {
      title: "Suivre chaque candidature",
      illustration: "app-03-tracker",
      body: [
        "Quand vous postulez à plusieurs offres, vous oubliez ce que vous avez envoyé, quand et à qui. Puis un recruteur appelle et vous ne savez plus de quel poste il s'agit.",
        "Un tableau de suivi est simple : organisation, poste, date limite, documents, statut, date de relance et numéro de référence. Le vôtre est enregistré dans votre profil et se télécharge en tableur.",
      ],
      mistake: "Tout garder en tête ou dans des discussions WhatsApp. Notez-le le jour même.",
      task: tracker1,
      variants: [tracker2, tracker3],
    },
    // Partie B : La lettre de motivation
    {
      title: "Lettre formelle, e-mail, lettre de motivation : les formats",
      illustration: "app-04-letter-formats",
      body: [
        "Au Cameroun, vous rencontrerez trois formats. La lettre formelle (imprimée ou en PDF) : vos coordonnées, le destinataire, le lieu et la date, l'objet, la formule d'appel, le corps, la formule de politesse et votre signature.",
        "L'e-mail de candidature : un court message qui porte vos documents. La lettre de motivation : quatre courts paragraphes, une page, jointe en PDF.",
      ],
      mistake: "Coller toute la lettre dans le corps de l'e-mail sans rien joindre. Gardez l'e-mail court et joignez la lettre.",
      task: letterOrder(0),
      variants: [letterOrder(1), letterOrder(2)],
    },
    {
      title: "Des accroches qui se font lire",
      illustration: "app-05-openings",
      body: [
        "Les deux premières lignes décident si le reste sera lu. Nommez le poste exact, où vous l'avez vu, et une raison de lire la suite.",
        "Évitez les supplications (« je viens humblement »), la flatterie (« votre honorable entreprise ») et les clichés (« travailleur et craignant Dieu »). Ils gaspillent les lignes les plus précieuses de votre lettre.",
      ],
      task: openings("assistant(e) comptable junior", "Mbe Hills Microfinance", ["comptable"], "Ngwa Brenda", "Titulaire d'un BTS en comptabilité et forte de 18 mois en microfinance, je peux appuyer votre équipe dès le premier jour."),
      variants: [
        openings("conseiller(ère) clientèle", "Wouri Connect", ["clientèle", "clientele", "conseill"], "Ewane Linda", "Bilingue, j'ai accueilli jusqu'à 80 clients par jour dans mon dernier poste."),
        openings("agent de saisie", "Mfoundi Bright Logistics", ["saisie"], "Fon Mirabel", "J'ai saisi 1 200 fiches d'enquête dans Excel en trois semaines avec 99 % d'exactitude."),
      ],
    },
    {
      title: "Relier vos preuves à leurs besoins",
      illustration: "app-06-evidence",
      variantGroup: "letter",
      body: [
        "Une lettre de motivation n'est pas un résumé du CV. Elle répond à une seule question : pourquoi correspondez-vous à cette annonce ?",
        "Listez ce qu'ils demandent, puis trouvez une preuve pour chaque point dans votre CV : quelque chose que vous avez fait, idéalement avec un chiffre. Sans preuve, laissez une lacune. N'inventez jamais.",
      ],
      mistake: "Annoncer des compétences que vous ne pouvez pas prouver. L'entretien le révélera, et cela ferme des portes.",
      task: evidence(ADVERTS[0]),
      variants: [evidence(ADVERTS[1]), evidence(ADVERTS[2])],
    },
    {
      title: "Rédiger votre lettre de motivation",
      illustration: "cv-14-cover-letter",
      variantGroup: "letter",
      body: [
        "Quatre courts paragraphes : le poste visé, pourquoi vous (deux preuves), pourquoi eux (un élément réel sur l'organisation) et une demande polie d'entretien.",
        "Une page, moins de 300 mots. Adressez-vous à une personne nommée si l'annonce en donne une (« Madame Ekane »), sinon « Madame, Monsieur ».",
      ],
      mistake: "Recopier le CV ligne par ligne. La lettre explique et relie, elle ne répète pas.",
      task: letter(ADVERTS[0]),
      variants: [letter(ADVERTS[1]), letter(ADVERTS[2])],
    },
    {
      title: "Stylo rouge : corrigez cette lettre",
      illustration: "app-08-red-pen",
      body: ["Entraînez votre œil sur la lettre de quelqu'un d'autre : noms, poste, ton, orthographe, formule finale.", "Puis relisez votre propre lettre pour les mêmes erreurs avant de l'envoyer."],
      task: redPen1,
      variants: [redPen2, redPen3],
    },
    // Partie C : Bien envoyer
    {
      title: "Postuler par e-mail",
      illustration: "app-09-email-apply",
      body: [
        "Objet : « Candidature au poste de [Poste] – Votre nom ». Corps : salutation, une ligne sur le poste, une preuve, ce qui est joint, une formule de politesse et votre signature avec votre téléphone.",
        "Joignez exactement ce que l'annonce demande, en PDF bien nommés : Prenom_Nom_CV.pdf et Prenom_Nom_Lettre_de_motivation.pdf.",
      ],
      mistake: "Envoyer depuis le téléphone avec « Envoyé de mon iPhone » pour seule signature. Signez toujours avec votre nom et votre numéro.",
      task: applyEmail("jobs@mbehillsmf.cm", "assistant(e) comptable junior", ["comptable"], "Ngwa Brenda", ["IMG_20261104.jpg", "CV_final_final2.docx"]),
      variants: [
        applyEmail("careers@wouriconnect.cm", "conseiller(ère) clientèle", ["clientèle", "clientele", "conseill"], "Ewane Linda", ["Capture_2026.png", "Document1.docx"]),
        applyEmail("hr@mfoundibright.cm", "agent de saisie", ["saisie"], "Fon Mirabel", ["scan0003.pdf", "mirabel cv new.docx"]),
      ],
    },
    {
      title: "Postuler sur un portail en ligne",
      illustration: "cv-15-portal",
      body: [
        "Beaucoup d'employeurs utilisent des formulaires en ligne. Ils expirent, limitent la taille des fichiers et le nombre de mots, et disent rarement pourquoi quelque chose a échoué.",
        "Préparez vos réponses et vos PDF avant de commencer, enregistrez souvent un brouillon, et copiez le numéro de référence de l'e-mail de confirmation dans votre suivi.",
      ],
      mistake: "Taper une longue réponse directement dans le formulaire et la perdre quand la session expire. Enregistrez des brouillons.",
      task: portal("Mbe Hills Carrières", "Mbe Hills Microfinance", "Assistant(e) comptable junior", "MBE", "Pourquoi voulez-vous travailler chez Mbe Hills Microfinance ? (150 mots max.)"),
      variants: [
        portal("Wouri Connect Emplois", "Wouri Connect", "Conseiller(ère) clientèle", "WCJ", "Décrivez une fois où vous avez aidé un client difficile. (150 mots max.)"),
        portal("Mfoundi Bright Recrutement", "Mfoundi Bright Logistics", "Agent de saisie", "MBL", "Comment vous assurez-vous que votre saisie est exacte ? (150 mots max.)"),
      ],
    },
    {
      title: "Constituer un dossier papier",
      illustration: "app-11-dossier",
      body: [
        "Certains employeurs, écoles et recrutements publics demandent encore un dossier papier. Lisez la liste de l'avis et suivez-la exactement : les pièces, le nombre d'exemplaires et l'ordre.",
        "Déposez des copies, jamais d'originaux. Avant de déposer, photographiez chaque page et notez la date dans votre suivi.",
      ],
      mistake: "Ajouter des papiers en plus « pour faire sérieux ». Les pièces en trop compliquent la vérification, et une pièce manquante peut vous éliminer.",
      task: dossier1,
      variants: [dossier2, dossier3],
    },
    {
      title: "Référents : demandez d'abord",
      illustration: "cv-16-referee",
      body: [
        "Beaucoup d'annonces demandent deux ou trois référents : un enseignant, un maître de stage ou un ancien employeur qui peut parler de votre travail.",
        "Demandez toujours avant de citer quelqu'un. Dites pour quel poste, et quand on pourrait l'appeler. Les membres de la famille ne sont pas des référents.",
      ],
      task: referee("p.tanyi@uniba-example.cm", "Dr Tanyi", "assistant(e) comptable junior", ["comptable"], "Mbe Hills Microfinance"),
      variants: [
        referee("m.ewane@limbeguesthouse.cm", "Mme Ewane", "conseiller(ère) clientèle", ["clientèle", "clientele", "conseill"], "Wouri Connect"),
        referee("survey.lead@sanagahealth.org", "M. Kamga", "agent de saisie", ["saisie"], "Mfoundi Bright Logistics"),
      ],
    },
    // Partie D : Après la candidature
    {
      title: "Un profil professionnel que les recruteurs trouvent",
      illustration: "app-13-network",
      body: [
        "Les recruteurs cherchent des candidats en ligne et vous recherchent après votre candidature. Un profil clair vous rend facile à trouver et digne de confiance.",
        "Un titre qui dit ce que vous faites et ce que vous cherchez, une section « Infos » courte à la première personne avec un résultat, votre expérience, au moins cinq compétences et une photo professionnelle.",
      ],
      mistake: "Un titre comme « Sans emploi » ou « À la recherche d'un emploi ». Dites ce que vous savez faire et le poste visé.",
      task: network(
        "Diplômée en comptabilité (BTS) | Caisse & Excel | À la recherche d'un poste d'assistante comptable à Bamenda ou Douala",
        "Je suis diplômée en comptabilité, basée à Bamenda, avec 18 mois d'expérience en microfinance. Pendant mon stage, j'ai rapproché la caisse quotidienne de 3 agents sans aucun écart et tenu à jour le registre des prêts. J'aime le travail précis sur les chiffres et les dossiers bien tenus. Je recherche un poste d'assistante comptable ou financière où continuer à apprendre.",
      ),
      variants: [
        network(
          "Service client bilingue | Diplômée en tourisme | À la recherche d'un poste d'accueil ou de service client",
          "Je suis diplômée en tourisme, bilingue, basée à Buea. Réceptionniste dans une maison d'hôtes à Limbé, j'ai accueilli jusqu'à 80 clients par jour et géré les réservations en anglais et en français. J'aime résoudre les problèmes avec calme et mettre les gens à l'aise. Je recherche un poste d'accueil ou de service client dans le Littoral ou le Sud-Ouest.",
        ),
        network(
          "Saisie de données & Excel | Collecte d'enquêtes | À la recherche d'un poste administratif ou de saisie à Bafoussam",
          "Je suis titulaire d'un certificat en bureautique, rigoureuse, basée à Bafoussam. Bénévole pour une enquête, j'ai saisi 1 200 fiches dans Excel en trois semaines avec 99 % d'exactitude. Je tape vite et je soigne les registres. Je recherche un poste d'agent de saisie ou d'assistante administrative.",
        ),
      ],
    },
    {
      title: "Relancer et répondre à chaque réponse",
      illustration: "app-14-follow-up",
      body: [
        "Le silence est normal. Environ une semaine après la date limite, une relance courte et polie remet votre nom en haut de la pile.",
        "Puis les réponses arrivent : accusés de réception automatiques (pas de réponse nécessaire), demandes de pièce manquante, invitations à un entretien, refus et arnaques. Chacune demande la bonne action, à temps.",
      ],
      mistake: "Ignorer un refus. Un court remerciement laisse une bonne impression pour la prochaine offre.",
      task: followWeek(followUp(7, "assistant(e) comptable junior", "Mbe Hills Microfinance", "jobs@mbehillsmf.cm", ["comptable"]), week("Ngwa_Brenda", MBE, TIKO, "ackA")),
      variants: [
        followWeek(followUp(10, "conseiller(ère) clientèle", "Wouri Connect", "careers@wouriconnect.cm", ["clientèle", "clientele", "conseill"]), week("Ewane_Linda", KRIBI, WOURI, "ackB")),
        followWeek(followUp(5, "agent de saisie", "Mfoundi Bright Logistics", "hr@mfoundibright.cm", ["saisie"]), week("Fon_Mirabel", MFOUNDI, SANAGA, "ackA")),
      ],
    },
    {
      title: "Mission finale : envoyez une vraie candidature",
      illustration: "app-15-mission",
      body: [
        "Votre dernière tâche est réelle. Ajoutez l'annonce ci-dessous à votre suivi, rédigez votre lettre de motivation pour elle, puis envoyez votre candidature depuis votre propre Gmail.",
        "Après cette étape, touchez « Terminer le cours » pour l'adresse de la mission. Nous vérifions automatiquement votre e-mail et les deux PDF, puis le recruteur vous répond, et vous devez lui répondre correctement.",
      ],
      task: {
        type: "sequence",
        tasks: [
          {
            type: "missionBrief",
            advert: MISSION_ADVERT,
            track: { org: MISSION_ADVERT.org, role: MISSION_ADVERT.title, deadline: "2026-12-15", documents: "CV, lettre de motivation (PDF)" },
            points: [
              "Ajoutez l'annonce à votre suivi.",
              "Rédigez et téléchargez votre lettre de motivation pour cette annonce (partie suivante) : Prenom_Nom_Lettre_de_motivation.pdf.",
              "Téléchargez votre CV depuis Mon CV : Prenom_Nom_CV.pdf, 2 pages maximum.",
              "Objet : « Candidature au poste d'assistant(e) administratif(ve) – Votre nom ». Un court message avec une salutation, le poste, une formule de politesse et votre signature.",
            ],
          },
          missionLetter,
        ],
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Quel objet convient le mieux pour un e-mail de candidature ?", options: ["CV", "Emploi", "Candidature au poste de vendeuse – Ngwa Brenda", "Aidez-moi svp"], answer: 2 },
      { step: 2, question: "Une annonce vous demande 10 000 FCFA pour « confirmer votre dossier ». Que faites-vous ?", options: ["Payer vite avant les autres", "L'écarter : c'est une arnaque", "Payer la moitié", "Envoyer votre code MoMo à la place"], answer: 1 },
      { step: 3, question: "Que met-on dans un tableau de suivi des candidatures ?", options: ["Seulement les entreprises qui ont répondu", "Organisation, poste, date limite, documents, statut et date de relance", "Vos prétentions salariales", "Rien : il suffit de se souvenir"], answer: 1 },
      { step: 4, question: "Dans une lettre formelle, où se place l'objet ?", options: ["Après la signature", "Avant la formule d'appel", "Tout en bas", "Il n'est pas nécessaire"], answer: 1 },
      { step: 5, question: "Quelle est la meilleure accroche ?", options: ["Je viens humblement solliciter tout poste vacant.", "Je m'appelle Paul, j'ai 23 ans et je suis célibataire.", "Je vous adresse ma candidature au poste d'agent de saisie publié sur votre site.", "Je souhaite me perfectionner dans votre honorable entreprise."], answer: 2 },
      { step: 6, question: "L'annonce demande Excel. Vous ne l'avez jamais utilisé. Que faites-vous dans la lettre ?", options: ["Vous dire expert d'Excel", "Ne pas le prétendre ; prouver les autres exigences", "Recopier l'annonce", "Ne plus postuler nulle part"], answer: 1 },
      { step: 8, question: "Vous avez commencé par « Madame, Monsieur ». Quelle formule finale convient ?", options: ["Bisous", "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées", "À plus", "Votre fils"], answer: 1 },
      { step: 9, question: "Quels noms de fichiers envoyer ?", options: ["scan0001.pdf et Document1.docx", "Ngwa_Brenda_CV.pdf et Ngwa_Brenda_Lettre_de_motivation.pdf", "CV.jpg", "cv final final.docx"], answer: 1 },
      { step: 11, question: "L'avis demande « une copie du diplôme le plus élevé ». Que mettez-vous dans le dossier ?", options: ["Le diplôme original", "Une copie du diplôme le plus élevé", "Tous les certificats depuis le primaire", "Rien"], answer: 1 },
      { step: 14, question: "Un employeur demande une pièce manquante sous 36 heures. Quelle est la bonne réponse ?", options: ["Attendre la semaine prochaine", "Répondre à temps, saluer, joindre le document et le signaler", "Appeler à minuit", "Envoyer une nouvelle candidature"], answer: 1 },
    ],
  },
  mission: {
    kind: "application",
    intro: "Prouvez-le pour de vrai : envoyez une candidature complète depuis votre propre Gmail, puis répondez au recruteur.",
    steps: [
      "Écrivez l'adresse Gmail depuis laquelle vous enverrez.",
      "Téléchargez votre CV (Prenom_Nom_CV.pdf) et votre lettre de motivation pour Nyanga Youth Futures (Prenom_Nom_Lettre_de_motivation.pdf).",
      "Dans Gmail, écrivez à l'adresse ci-dessous. Objet : « Candidature au poste d'assistant(e) administratif(ve) – Votre nom ».",
      "Écrivez un court message : une salutation, une ligne indiquant le poste visé, une formule de politesse et votre signature avec votre téléphone.",
      "Joignez les deux PDF et appuyez sur Envoyer. Nous vérifions tout automatiquement.",
      "Si votre candidature est validée, le recruteur répond. Répondez à son e-mail depuis Gmail exactement comme il le demande.",
    ],
    subjectWords: ["assistant administratif", "assistante administrative", "assistant(e) administratif", "administrative assistant"],
    orgWords: ["nyanga"],
    advert: MISSION_ADVERT,
    subjectExample: "Candidature au poste d'assistant(e) administratif(ve) – {name}",
    replies: {
      missing_document: {
        from: "Recrutement – Nyanga Youth Futures",
        subject: "Pièce manquante – Assistant(e) administratif(ve) (Réf. : {ref})",
        body: "Bonjour {name},\n\nMerci pour votre candidature au poste de {role} chez {org}. Votre dossier est presque complet, mais nous n'avons pas reçu de copie de votre diplôme le plus élevé.\n\nMerci de répondre à cet e-mail sous 48 heures avec le document joint en PDF.\n\nCordialement,\nL'équipe de recrutement\n{org}",
        instruction: "Répondez à cet e-mail depuis Gmail (touchez Répondre). Saluez, indiquez que le document est joint, joignez un PDF de votre diplôme bien nommé (par ex. Prenom_Nom_Diplome.pdf), puis terminez poliment et signez.",
      },
      interview: {
        from: "Recrutement – Nyanga Youth Futures",
        subject: "Invitation à un entretien – Assistant(e) administratif(ve) (Réf. : {ref})",
        body: "Bonjour {name},\n\nMerci pour votre candidature au poste de {role} chez {org}. Nous avons le plaisir de vous inviter à un court entretien téléphonique la semaine prochaine.\n\nMerci de répondre en indiquant un jour et une heure où vous êtes disponible (du lundi au vendredi, 9 h – 16 h).\n\nCordialement,\nL'équipe de recrutement\n{org}",
        instruction: "Répondez à cet e-mail depuis Gmail (touchez Répondre). Saluez, remerciez, donnez un jour et une heure de disponibilité (par ex. « mardi à 10 h »), puis terminez poliment et signez.",
      },
    },
    messages: {
      gmail: "Envoyez depuis l'adresse Gmail saisie ici.",
      subject: "L'objet doit nommer le poste : « Candidature au poste d'assistant(e) administratif(ve) – Votre nom ».",
      bodyGreeting: "Commencez l'e-mail par une salutation, par ex. « Madame, Monsieur, ».",
      bodyPurpose: "Indiquez dans l'e-mail le poste visé : « Je vous adresse ma candidature au poste d'assistant(e) administratif(ve). »",
      bodyClosing: "Terminez l'e-mail par une formule comme « Cordialement, ».",
      bodySignature: "Signez l'e-mail avec votre nom et votre numéro de téléphone.",
      bodyLength: "Gardez l'e-mail court (moins de 150 mots) : les détails vont dans la lettre de motivation.",
      twoPdfs: "Joignez deux fichiers PDF : votre CV et votre lettre de motivation.",
      cvFileName: "Nommez votre CV Prenom_Nom_CV.pdf, comme téléchargé depuis Mon CV.",
      letterFileName: "Nommez votre lettre Prenom_Nom_Lettre_de_motivation.pdf, comme téléchargée à l'étape 15.",
      unreadable: "Nous n'avons pas pu ouvrir l'un de vos PDF. Téléchargez-le à nouveau depuis le cours et joignez ce fichier (pas une photo ni un scan).",
      cvPages: "Votre CV dépasse 2 pages. Raccourcissez-le et renvoyez.",
      letterRole: "Votre lettre doit nommer le poste : assistant(e) administratif(ve).",
      letterOrg: "Votre lettre doit nommer l'organisation : Nyanga Youth Futures.",
      letterLength: "Votre lettre dépasse 350 mots. Tenez-vous à une page.",
      letterGreeting: "Votre lettre doit avoir une formule d'appel, par ex. « Madame, Monsieur, ».",
      letterClosing: "Votre lettre doit avoir une formule de politesse finale.",
      letterSignature: "Signez votre lettre avec votre nom complet à la fin.",
      reply_gmail: "Répondez depuis la même adresse Gmail que pour la candidature.",
      reply_greeting: "Commencez votre réponse par une salutation, par ex. « Bonjour, ».",
      reply_closing: "Terminez votre réponse par une formule comme « Cordialement, » et votre nom.",
      reply_attachment: "Joignez le document demandé en PDF.",
      reply_attachmentName: "Donnez au document un nom clair, par ex. Prenom_Nom_Diplome.pdf.",
      reply_availability: "Indiquez un jour et une heure de disponibilité, par ex. « mardi à 10 h ».",
      reply_thanks: "Remerciez-les pour l'invitation.",
    },
  },
};

export default course;
