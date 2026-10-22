import type { Course, KeywordAdvert, RecruiterScanTask, RedPenTask, AdvertHighlightTask, InboxTask, SectionOrderTask, CvProfileTask, TailorTask, KeywordMatchTask, TextRule } from "../types";

/* ---------- Éléments communs ---------- */

const CLICHES: TextRule = {
  kind: "excludesAll",
  words: ["travailleur", "travailleuse", "craignant dieu", "honnête et", "n'importe quelle entreprise", "toute entreprise", "dynamique et", "prêt à travailler", "prête à travailler"],
  message: "Retirez les clichés comme « travailleur », « craignant Dieu » ou « prêt à travailler dans toute entreprise ». Tout le monde les écrit : donnez plutôt des preuves.",
};

const PROFILE_OWN = {
  instruction: "Écrivez maintenant votre propre profil en 3 lignes environ : qui vous êtes (études ou expérience), une ou deux forces avec une preuve, et le poste que vous visez.",
  example:
    "Diplômée d'un BTS en marketing, 18 mois d'expérience en vente à Buea. J'ai servi plus de 80 clients par jour et géré les paiements Mobile Money sans erreur. Je recherche un poste en vente ou service client.",
  rules: [
    { kind: "minWords", n: 20, message: "Écrivez un peu plus : environ 3 lignes (au moins 20 mots)." },
    { kind: "maxWords", n: 75, message: "Restez court : 3 lignes, moins de 75 mots." },
    CLICHES,
    {
      kind: "includesAny",
      words: ["poste", "emploi", "recherche", "souhaite", "vise", "opportunité", "fonction"],
      message: "Terminez en disant le poste que vous visez, ex. « Je recherche un poste en service client. »",
    },
  ] as TextRule[],
};

/* ---------- Étape 1 : RecruiterScan (3 variantes) ---------- */

const SCAN_LESSON =
  "La plupart des gens ne retiennent presque rien du CV surchargé, et beaucoup plus du CV clair. Le premier regard d'un recruteur dure environ 7 secondes : des titres clairs, des lignes courtes et des chiffres décident s'il continue à lire.";

const scan1: RecruiterScanTask = {
  type: "recruiterScan",
  instruction: "Vous êtes le recruteur. Vous verrez un CV pendant 7 secondes seulement, puis vous répondrez à 3 questions.",
  seconds: 7,
  lesson: SCAN_LESSON,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "EBOT MBI CLARISSE",
        contact: "Tél : 6 77 45 12 90 / 699 01 23 45 · E-mail : clarissebabygirl@yahoo.fr · B.P. 211 Kumba · Née le 12/04/1999 à Mamfe · Célibataire · Chrétienne",
        sections: [
          {
            heading: "Déclaration personnelle",
            lines: [
              "Je suis une jeune femme travailleuse, honnête et craignant Dieu, prête à travailler dans toute entreprise qui me donnera l'occasion de montrer mes potentialités et de contribuer à la croissance de l'entreprise et à mon propre développement.",
            ],
          },
          {
            heading: "Expérience de travail",
            lines: [
              "2021-2022 j'ai travaillé à l'épicerie Mama Clara comme vendeuse où j'étais chargée de vendre, nettoyer la boutique, ranger les marchandises et autres tâches confiées par la patronne. 2019 job de vacances dans une boulangerie.",
            ],
          },
          { heading: "Parcours scolaire", lines: ["2012 CEP, École publique de Mamfe. 2016 GCE O Level 7 matières, Lycée de Kumba. 2018 GCE A Level 3 matières. 2021 BTS en Marketing, Institut supérieur de commerce de Buea."] },
          { heading: "Loisirs", lines: ["Lecture, voyages, cuisine, films, danse, dormir."] },
        ],
      },
      questions: [
        { question: "Quel est son diplôme le plus élevé ?", options: ["GCE A Level", "BTS en Marketing", "Licence en économie", "Master"], answer: 1 },
        { question: "Où a-t-elle travaillé le plus récemment ?", options: ["Une boulangerie", "Une épicerie", "Une banque", "Une école"], answer: 1 },
        { question: "Quelle est son adresse e-mail ?", options: ["clarissebabygirl@yahoo.fr", "clarisse.ebot@gmail.com", "ebot.clarisse@yahoo.com", "Il n'y avait pas d'e-mail"], answer: 0 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Tabi Ndip Joel",
        contact: "tabi.ndip@gmail.com | +237 677 12 34 56 | Buea",
        sections: [
          { heading: "Profil", lines: ["Diplômé d'un BTS en marketing, 2 ans d'expérience en vente. Ventes hebdomadaires de boissons augmentées de 15 %."] },
          {
            heading: "Expérience",
            lines: ["Vendeur, Supermarché Étoile, Buea (2022–2024)", "Servi plus de 80 clients par jour, paiements Mobile Money", "Ventes de boissons augmentées de 15 % grâce à un nouveau rayonnage"],
          },
          { heading: "Formation", lines: ["BTS Marketing, Institut supérieur de commerce, Buea (2022)"] },
          { heading: "Compétences", lines: ["Service client · Mobile Money · Microsoft Excel · Anglais et français"] },
        ],
      },
      questions: [
        { question: "Quel est son diplôme le plus élevé ?", options: ["GCE A Level", "BTS Marketing", "Licence en économie", "Master"], answer: 1 },
        { question: "Où a-t-il travaillé ?", options: ["Une banque", "Une école", "Supermarché Étoile", "Un hôpital"], answer: 2 },
        { question: "De combien a-t-il augmenté les ventes de boissons ?", options: ["5 %", "15 %", "50 %", "Il ne l'a pas dit"], answer: 1 },
      ],
    },
  ],
};

const scan2: RecruiterScanTask = {
  ...scan1,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "FONYUY BERTRAND NSAH",
        contact: "Tél : 650 33 21 09 · E-mail : bertrandkingofnso@gmail.com · Quartier Up Station, Bamenda · Né le 03/09/1997 · Marié · Catholique",
        sections: [
          {
            heading: "Objectif de carrière",
            lines: [
              "Obtenir un poste stimulant dans une organisation réputée où je pourrai utiliser mes compétences et mes connaissances pour atteindre les objectifs de l'organisation et assurer mon propre développement personnel en tant que jeune homme dynamique.",
            ],
          },
          {
            heading: "Expérience professionnelle",
            lines: [
              "De 2019 à 2020 j'étais professeur de mathématiques dans un collège privé de Bamenda. Depuis 2021 je travaille comme agent de saisie dans une agence de transport où je suis chargé de saisir les données, recevoir les clients et faire d'autres tâches.",
            ],
          },
          { heading: "Diplômes académiques", lines: ["FSLC 2008. GCE O Level 2013. GCE A Level 2015. Licence en mathématiques, Université de Bamenda, 2019."] },
          { heading: "Centres d'intérêt", lines: ["Football, musique, internet, amis, activités d'église, voyages."] },
        ],
      },
      questions: [
        { question: "Quel est son emploi actuel ?", options: ["Professeur", "Agent de saisie", "Chauffeur", "Comptable"], answer: 1 },
        { question: "Qu'a-t-il étudié à l'université ?", options: ["L'économie", "L'informatique", "Les mathématiques", "Le droit"], answer: 2 },
        { question: "Dans quelle ville habite-t-il ?", options: ["Bamenda", "Douala", "Buea", "Kumba"], answer: 0 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Nkeng Ateh",
        contact: "nkeng.ateh@gmail.com | +237 670 45 67 89 | Douala",
        sections: [
          { heading: "Profil", lines: ["Licenciée en comptabilité avec un stage de 6 mois. Plus de 300 transactions rapprochées par mois sans erreur."] },
          {
            heading: "Expérience",
            lines: ["Stagiaire comptable, Sawa Microfinance, Douala (janv.–juin 2024)", "Rapproché plus de 300 transactions Mobile Money par mois", "Préparé 12 rapports de caisse hebdomadaires pour le chef d'agence"],
          },
          { heading: "Formation", lines: ["Licence en comptabilité, Université de Douala (2023)"] },
          { heading: "Compétences", lines: ["Microsoft Excel (très bon niveau) · Sage comptabilité · Anglais et français"] },
        ],
      },
      questions: [
        { question: "Où a-t-elle fait son stage ?", options: ["Un supermarché", "Sawa Microfinance", "Un hôpital", "Une école"], answer: 1 },
        { question: "Combien de transactions rapprochait-elle par mois ?", options: ["30", "100", "Plus de 300", "Elle ne l'a pas dit"], answer: 2 },
        { question: "Qu'a-t-elle étudié ?", options: ["Le marketing", "La comptabilité", "Le droit", "Les soins infirmiers"], answer: 1 },
      ],
    },
  ],
};

const scan3: RecruiterScanTask = {
  ...scan1,
  rounds: [
    {
      label: "CV A",
      cv: {
        layout: "messy",
        name: "NGO BASSA MARIE-CLAIRE",
        contact: "Tél : 691 22 33 44 · E-mail : mcsweetheart237@gmail.com · B.P. 4021 Yaoundé · Née le 21 juillet 2000 · Célibataire",
        sections: [
          {
            heading: "Objectif",
            lines: [
              "À la recherche d'un emploi où je pourrai mettre en pratique toutes les connaissances acquises pendant mes études, je suis sérieuse, ponctuelle, obéissante et prête à apprendre de nouvelles choses dans n'importe quel domaine.",
            ],
          },
          {
            heading: "Expériences",
            lines: [
              "Stage à la Pharmacie Bonne Santé de Yaoundé en 2022 pendant 3 mois comme vendeuse, je rangeais les médicaments, j'aidais les clients et je nettoyais aussi. Je vends aussi des cosmétiques en ligne avec ma sœur sur Facebook depuis 2021.",
            ],
          },
          { heading: "Diplômes", lines: ["BEPC 2015, Probatoire 2017, Baccalauréat A4 2018, BTS en vente pharmaceutique 2021, Institut supérieur Saint-Jean Yaoundé."] },
          { heading: "Loisirs", lines: ["Cuisine, musique, films, réseaux sociaux, shopping."] },
        ],
      },
      questions: [
        { question: "Quel diplôme a-t-elle dans son domaine ?", options: ["BTS en vente pharmaceutique", "Licence en biologie", "Diplôme d'infirmière", "Aucun"], answer: 0 },
        { question: "Où a-t-elle fait son stage ?", options: ["Un hôpital", "Pharmacie Bonne Santé", "Une banque", "Un supermarché"], answer: 1 },
        { question: "Que vend-elle en ligne ?", options: ["Des téléphones", "Des vêtements", "Des cosmétiques", "De la nourriture"], answer: 2 },
      ],
    },
    {
      label: "CV B",
      cv: {
        layout: "clean",
        name: "Achu Peter Ngwa",
        contact: "achu.ngwa@gmail.com | +237 682 90 11 22 | Yaoundé",
        sections: [
          { heading: "Profil", lines: ["Diplômé d'un BTS en logistique, gestion du stock d'une quincaillerie à 3 points de vente. Pertes de stock réduites de 20 % en un an."] },
          {
            heading: "Expérience",
            lines: ["Magasinier, Quincaillerie Mbakwa, Yaoundé (2023–2024)", "Géré un stock de 1 200 articles dans 3 points de vente", "Réduit les pertes de stock de 20 % grâce à un inventaire hebdomadaire"],
          },
          { heading: "Formation", lines: ["BTS Logistique et transport, Yaoundé (2023)"] },
          { heading: "Compétences", lines: ["Gestion de stock · Microsoft Excel · Permis de conduire B · Anglais et français"] },
        ],
      },
      questions: [
        { question: "Quel était son poste ?", options: ["Chauffeur", "Magasinier", "Professeur", "Caissier"], answer: 1 },
        { question: "De combien a-t-il réduit les pertes de stock ?", options: ["10 %", "20 %", "50 %", "Il ne l'a pas dit"], answer: 1 },
        { question: "Quel permis a-t-il ?", options: ["Aucun", "Permis moto", "Permis de conduire B", "Permis poids lourd"], answer: 2 },
      ],
    },
  ],
};

/* ---------- Étape 2 : lire une offre (3 variantes) ---------- */

const advert1: AdvertHighlightTask = {
  type: "advertHighlight",
  instruction: "Lisez cette offre comme un recruteur. Touchez chaque expression surlignée et dites ce que c'est.",
  passPercent: 80,
  success: "Vous lisez comme un recruteur : vous savez ce qui est indispensable, ce qui aide, quoi envoyer, comment et avant quand.",
  advert: {
    org: "Fondation Ndolo pour la Jeunesse",
    title: "Assistant(e) de terrain (projet emploi des jeunes)",
    location: "Bamenda",
    paragraphs: [
      ["La Fondation Ndolo pour la Jeunesse recrute un(e) assistant(e) de terrain pour son projet d'emploi des jeunes à Bamenda et Bafut."],
      [
        "Profil exigé : ",
        { text: "BTS ou licence en sciences sociales", label: "must", why: "C'est dans le « profil exigé » : sans ce diplôme, pas de présélection." },
        ", ",
        { text: "au moins 1 an de travail communautaire, bénévolat compris", label: "must", why: "Expérience exigée. Le bénévolat compte : mettez-le dans votre CV." },
        " et ",
        { text: "parler couramment anglais et pidgin", label: "must", why: "Une exigence de langue pour le poste." },
        ". ",
        { text: "La connaissance de KoboToolbox est un atout", label: "nice", why: "« Un atout » : postulez même sans cela." },
        ". ",
        { text: "Un permis moto serait un plus", label: "nice", why: "« Un plus » : c'est un atout, pas une obligation." },
        ".",
      ],
      [
        "L'assistant(e) ",
        { text: "visitera environ 20 ménages par semaine", label: null, why: "Cela décrit le travail. Ce n'est ni une exigence ni une consigne." },
        " et rédigera de courts rapports hebdomadaires.",
      ],
      [
        "Pour postuler, ",
        { text: "envoyez votre CV et une lettre de motivation d'une page", label: "documents", why: "Ce sont les pièces à fournir." },
        " ",
        { text: "par e-mail à jobs@ndolofoundation.org", label: "apply", why: "Comment postuler : par e-mail, à cette adresse exacte." },
        " avec pour objet « Assistant de terrain – Votre nom ». ",
        { text: "Date limite : 15 novembre, 17 h", label: "deadline", why: "Les candidatures en retard ne sont généralement pas lues." },
        ". ",
        { text: "Aucun frais n'est demandé", label: null, why: "Bon signe : un vrai employeur ne demande jamais d'argent. Rien à faire." },
        ".",
      ],
    ],
  },
};

const advert2: AdvertHighlightTask = {
  ...advert1,
  advert: {
    org: "Sawa Microfinance",
    title: "Chargé(e) de clientèle",
    location: "Douala (agence d'Akwa)",
    paragraphs: [
      ["Sawa Microfinance recherche un(e) chargé(e) de clientèle pour son agence d'Akwa."],
      [
        "Profil : ",
        { text: "BTS ou licence en banque, comptabilité ou marketing", label: "must", why: "Un diplôme exigé." },
        " ; ",
        { text: "parfaitement bilingue (anglais et français)", label: "must", why: "« Parfaitement bilingue » est exigé, pas facultatif." },
        " ; ",
        { text: "au moins 6 mois dans un poste en contact avec la clientèle", label: "must", why: "Expérience exigée : la vente, une boutique ou un call box comptent." },
        ". ",
        { text: "Une expérience des plateformes Mobile Money est souhaitée", label: "nice", why: "« Souhaitée » : c'est un atout." },
        ".",
      ],
      [
        "Vous ",
        { text: "accueillerez environ 60 clients par jour", label: null, why: "Cela décrit le travail. Rien à préparer." },
        " et les aiderez à ouvrir des comptes.",
      ],
      [
        "Le dossier comprend ",
        { text: "un CV, une lettre de motivation et les copies des diplômes", label: "documents", why: "Les pièces à fournir. Une pièce manquante peut vous éliminer." },
        ". ",
        { text: "Postulez en ligne sur careers.sawamicrofinance.cm", label: "apply", why: "Comment postuler : sur la plateforme en ligne, pas par e-mail." },
        ". ",
        { text: "Date de clôture : 30 novembre", label: "deadline", why: "Le dernier jour pour postuler." },
        ". ",
        { text: "Sawa Microfinance garantit l'égalité des chances", label: null, why: "Une information sur l'employeur. Rien à faire." },
        ".",
      ],
    ],
  },
};

const advert3: AdvertHighlightTask = {
  ...advert1,
  advert: {
    org: "Pharmacie Bonne Santé",
    title: "Vendeur(se) en pharmacie",
    location: "Yaoundé (Bastos)",
    paragraphs: [
      ["La Pharmacie Bonne Santé de Bastos recrute deux vendeurs(ses) en pharmacie."],
      [
        "Vous devez avoir ",
        { text: "un BTS en vente pharmaceutique ou en santé", label: "must", why: "Un diplôme exigé pour ce poste." },
        " et ",
        { text: "un bon français et un anglais courant", label: "must", why: "Un niveau de langue exigé." },
        ". ",
        { text: "Une expérience en pharmacie est un atout", label: "nice", why: "« Un atout » : ce n'est pas obligatoire." },
        ". ",
        { text: "La maîtrise d'un logiciel de stock est appréciée", label: "nice", why: "« Appréciée » : c'est un plus." },
        ".",
      ],
      [
        "L'équipe travaille ",
        { text: "par rotation, certains dimanches compris", label: null, why: "Les conditions de travail : bon à savoir, mais rien à envoyer." },
        ".",
      ],
      [
        "Merci de ",
        { text: "déposer votre CV et une lettre de motivation manuscrite", label: "documents", why: "Les pièces à fournir, dont une lettre manuscrite." },
        " ",
        { text: "à l'accueil de la pharmacie, du lundi au vendredi, de 9 h à 16 h", label: "apply", why: "Comment postuler : sur place, à ces horaires." },
        ", ",
        { text: "avant le 20 novembre", label: "deadline", why: "La date limite." },
        ". ",
        { text: "Seuls les candidats retenus seront appelés pour un entretien", label: null, why: "Bon à savoir, mais rien à faire." },
        ".",
      ],
    ],
  },
};

/* ---------- Étape 3 : fausses offres (3 variantes) ---------- */

const fake1: InboxTask = {
  type: "inbox",
  emails: [
    {
      id: "realngo",
      from: "Fondation Ndolo pour la Jeunesse",
      fromEmail: "jobs@ndolofoundation.org",
      subject: "Votre candidature – Assistant de terrain",
      preview: "Merci pour votre candidature. Les candidats présélectionnés…",
      body: "Madame, Monsieur,\n\nMerci pour votre candidature au poste d'assistant de terrain. Les candidats présélectionnés seront invités à un test écrit à Bamenda.\n\nL'équipe recrutement",
      time: "10:15",
    },
    {
      id: "fee",
      from: "Comité de recrutement pétrolier du Cameroun",
      fromEmail: "comite.recrutement.cm@gmail.com",
      subject: "Félicitations : vous êtes présélectionné(e) (payez 15 000 FCFA)",
      preview: "Payez vos frais de dossier par Mobile Money pour confirmer…",
      body: "Félicitations ! Vous êtes présélectionné(e) pour un emploi à 650 000 FCFA de salaire. Pour confirmer votre place, payez 15 000 FCFA de frais de dossier par Mobile Money au 6 70 00 11 22 sous 48 heures.",
      time: "09:02",
    },
    {
      id: "whatsapp",
      from: "M. Daniel – RH",
      fromEmail: "danielrh.emplois@outlook.com",
      subject: "Recrutement urgent – contactez-moi sur WhatsApp uniquement",
      preview: "Envoyez votre CV et la photo de votre CNI sur WhatsApp…",
      body: "Nous avons 50 postes de réceptionniste dans des hôtels de Douala. Pas d'entretien. Envoyez votre CV, une photo de votre CNI et votre numéro Mobile Money sur WhatsApp uniquement : +237 6 99 00 00 00.",
      time: "Hier",
    },
    {
      id: "school",
      from: "Institut supérieur de commerce",
      fromEmail: "carrieres@isc-buea.cm",
      subject: "Salon de l'emploi – samedi",
      preview: "Rencontrez 20 employeurs sur le campus ce samedi…",
      body: "Cher diplômé, rencontrez 20 employeurs à notre salon de l'emploi ce samedi dès 9 h. Apportez des CV imprimés.",
      time: "Lun",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "fee",
      instruction: "Un e-mail vous demande de payer pour obtenir un emploi. Ouvrez-le et signalez-le comme spam.",
      wrong: "Celui-ci semble authentique : vraie adresse, et on ne vous demande ni argent ni données personnelles.",
      done: "Exact. Un vrai employeur ne demande jamais de frais, et une adresse Gmail gratuite est un signal d'alerte.",
    },
    {
      action: "spam",
      target: "whatsapp",
      instruction: "Un autre est un « recruteur » joignable uniquement sur WhatsApp. Trouvez-le et signalez-le.",
      wrong: "Celui-ci semble authentique : vraie adresse, et on ne vous demande ni argent ni données personnelles.",
      done: "Exact. « Pas d'entretien », WhatsApp uniquement, et on demande votre CNI et votre numéro Mobile Money : arnaque classique.",
    },
  ],
  success: "Vous avez repéré les deux. Un vrai emploi ne demande jamais de frais, la photo de votre CNI ou votre numéro Mobile Money avant un entretien.",
};

const fake2: InboxTask = {
  ...fake1,
  emails: [
    {
      id: "toogood",
      from: "Emplois Internationaux Canada",
      fromEmail: "canada.emplois.visa2025@yahoo.com",
      subject: "Travaillez au Canada : 2 500 000 FCFA par mois, visa gratuit",
      preview: "Aucune expérience exigée. Payez seulement les frais…",
      body: "Vous êtes sélectionné(e) pour travailler au Canada comme ouvrier agricole. Salaire 2 500 000 FCFA par mois, visa et billet gratuits. Aucune expérience exigée. Payez seulement 75 000 FCFA de frais de traitement aujourd'hui.",
      time: "11:40",
    },
    {
      id: "realbank",
      from: "Sawa Microfinance",
      fromEmail: "carrieres@sawamicrofinance.cm",
      subject: "Invitation à un test en ligne",
      preview: "Vous êtes invité(e) à un test en ligne jeudi…",
      body: "Madame, Monsieur,\n\nVous êtes invité(e) à un test en ligne de 30 minutes jeudi à 10 h. Le lien vous sera envoyé la veille.\n\nRessources humaines",
      time: "10:05",
    },
    {
      id: "whatsapp",
      from: "Agent recruteur Paul",
      fromEmail: "paulagent237@gmail.com",
      subject: "Un emploi pour vous – répondez sur WhatsApp",
      preview: "Je peux vous trouver un emploi au port. Contactez-moi…",
      body: "Je peux vous trouver un emploi au port de Douala. Beaucoup de places. Contactez-moi sur WhatsApp uniquement et apportez 20 000 FCFA pour l'inscription.",
      time: "Hier",
    },
    {
      id: "friend",
      from: "Brenda Tanyi",
      fromEmail: "brenda.tanyi@gmail.com",
      subject: "L'offre dont je t'ai parlé",
      preview: "Voici le lien de l'offre en service client…",
      body: "Salut ! Voici l'offre en service client dont je t'ai parlé. La date limite est vendredi. Bonne chance !",
      time: "Lun",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "toogood",
      instruction: "Une offre est trop belle pour être vraie. Ouvrez-la et signalez-la comme spam.",
      wrong: "Celui-ci est authentique : il ne demande rien d'anormal.",
      done: "Exact. Un salaire énorme, « aucune expérience exigée » et des frais : c'est une arnaque.",
    },
    {
      action: "spam",
      target: "whatsapp",
      instruction: "Un autre « agent » veut vous parler sur WhatsApp et demande de l'argent. Signalez-le.",
      wrong: "Celui-ci est authentique : il ne demande rien d'anormal.",
      done: "Exact. Personne ne peut vous vendre un emploi. Signalez et supprimez.",
    },
  ],
};

const fake3: InboxTask = {
  ...fake1,
  emails: [
    {
      id: "realpharma",
      from: "Pharmacie Bonne Santé",
      fromEmail: "rh@bonnesante-pharma.cm",
      subject: "Entretien – Vendeur(se) en pharmacie",
      preview: "Nous souhaitons vous rencontrer mardi à 9 h…",
      body: "Madame, Monsieur,\n\nNous souhaitons vous rencontrer mardi à 9 h à la pharmacie de Bastos. Merci d'apporter vos diplômes originaux.\n\nLe gérant",
      time: "08:50",
    },
    {
      id: "fee",
      from: "Service de recrutement du ministère",
      fromEmail: "ministere.recrutement.cm@gmail.com",
      subject: "Liste définitive : payez 25 000 FCFA pour garder votre place",
      preview: "Votre nom est sur la liste définitive. Payez pour…",
      body: "Votre nom figure sur la liste définitive du recrutement dans la fonction publique. Payez 25 000 FCFA par Orange Money sous 24 heures pour garder votre place, sinon elle sera donnée à quelqu'un d'autre.",
      time: "Hier",
    },
    {
      id: "toogood",
      from: "Groupe Golden Hôtels",
      fromEmail: "goldenhotels.rh@protonmail.com",
      subject: "Réceptionniste : 900 000 FCFA par mois, début lundi",
      preview: "Pas d'entretien. Envoyez votre CNI et vos coordonnées bancaires…",
      body: "Nous recrutons des réceptionnistes à 900 000 FCFA par mois. Pas d'entretien, début lundi. Envoyez la photo de votre CNI et vos coordonnées bancaires ou Mobile Money pour recevoir une avance sur salaire.",
      time: "Hier",
    },
    {
      id: "church",
      from: "Jeunesse paroissiale",
      fromEmail: "jeunesse.biyemassi@gmail.com",
      subject: "Atelier CV après le culte",
      preview: "Apportez votre CV dimanche pour une relecture gratuite…",
      body: "Chers jeunes, apportez votre CV dimanche après le culte pour une relecture gratuite avec des bénévoles RH.",
      time: "Lun",
    },
  ],
  goals: [
    {
      action: "spam",
      target: "fee",
      instruction: "Un e-mail se fait passer pour un recrutement officiel et demande de l'argent. Signalez-le comme spam.",
      wrong: "Celui-ci semble authentique : il ne demande rien d'anormal.",
      done: "Exact. Un recrutement officiel ne demande jamais de paiement par Mobile Money, et un ministère n'utilise pas Gmail.",
    },
    {
      action: "spam",
      target: "toogood",
      instruction: "Une autre offre est trop belle pour être vraie. Signalez-la comme spam.",
      wrong: "Celui-ci semble authentique : il ne demande rien d'anormal.",
      done: "Exact. Un salaire énorme, pas d'entretien, et on demande votre CNI et vos coordonnées de paiement : arnaque.",
    },
  ],
};

/* ---------- Étape 5 : ordre des rubriques (3 variantes) ---------- */

const orderRounds = (fresher: string, experienced: string): SectionOrderTask["rounds"] => [
  {
    persona: fresher,
    instruction: "Mettez les rubriques du CV d'un débutant dans le meilleur ordre.",
    sections: [
      { id: "skills", label: "Compétences", why: "Les compétences appuient votre parcours : elles viennent après la formation et l'expérience." },
      { id: "header", label: "Nom et coordonnées", why: "Toujours tout en haut : le recruteur doit savoir qui vous êtes et comment vous joindre." },
      { id: "experience", label: "Expérience (stages, bénévolat)", why: "Pour un débutant, l'expérience vient après la formation." },
      { id: "interests", label: "Centres d'intérêt", why: "Facultatif, toujours en dernier." },
      { id: "profile", label: "Profil (3 lignes)", why: "Juste sous votre nom : il dit en 7 secondes qui vous êtes et ce que vous visez." },
      { id: "education", label: "Formation", why: "Pour un débutant, le diplôme est la meilleure preuve : avant l'expérience." },
      { id: "languages", label: "Langues", why: "Après les compétences, vers la fin." },
    ],
    answer: ["header", "profile", "education", "experience", "skills", "languages", "interests"],
  },
  {
    persona: experienced,
    instruction: "Mettez maintenant les rubriques du CV d'un candidat expérimenté dans le meilleur ordre.",
    sections: [
      { id: "education", label: "Formation", why: "Avec une vraie expérience, vos emplois comptent plus que l'école : la formation passe après." },
      { id: "languages", label: "Langues", why: "Après les compétences, vers la fin." },
      { id: "header", label: "Nom et coordonnées", why: "Toujours tout en haut." },
      { id: "experience", label: "Expérience", why: "Pour un candidat expérimenté, les emplois récents sont la meilleure preuve : juste après le profil." },
      { id: "interests", label: "Centres d'intérêt", why: "Facultatif, toujours en dernier." },
      { id: "skills", label: "Compétences", why: "Après la formation, pour appuyer l'expérience." },
      { id: "profile", label: "Profil (3 lignes)", why: "Juste sous votre nom." },
    ],
    answer: ["header", "profile", "experience", "education", "skills", "languages", "interests"],
  },
];

const order1: SectionOrderTask = {
  type: "sectionOrder",
  rounds: orderRounds(
    "Candidate 1 : Brenda, 22 ans, vient d'obtenir un BTS en comptabilité. Elle a fait un stage de 2 mois et elle est bénévole à l'église.",
    "Candidat 2 : Paul, 31 ans, gère une boutique depuis 6 ans. Il a un GCE A Level.",
  ),
  success: "Les débutants commencent par la formation ; les candidats expérimentés par l'expérience. Votre CV peut changer de mise en page dans « Mon CV ».",
};
const order2: SectionOrderTask = {
  ...order1,
  rounds: orderRounds(
    "Candidat 1 : Ali, 23 ans, vient de finir une licence en informatique. Il réparait des téléphones dans la boutique de son oncle pendant les vacances.",
    "Candidate 2 : Christine, 35 ans, est secrétaire dans un cabinet d'avocats depuis 9 ans.",
  ),
};
const order3: SectionOrderTask = {
  ...order1,
  rounds: orderRounds(
    "Candidate 1 : Grace, 21 ans, a un BTS en vente pharmaceutique et a fait un stage de 3 mois.",
    "Candidat 2 : Emmanuel, 29 ans, conduit des camions de livraison depuis 7 ans.",
  ),
};

/* ---------- Étape 7 : profil (3 variantes) ---------- */

const profile1: CvProfileTask = {
  type: "cvProfile",
  fix: {
    instruction:
      "Paul a un BTS en marketing et a vendu des téléphones au marché Mokolo pendant 2 ans. Réécrivez son profil en 2 ou 3 lignes : ce qu'il a étudié, son expérience avec un chiffre, et le poste qu'il vise.",
    initial: "Je suis un jeune homme travailleur, honnête et craignant Dieu, prêt à travailler dans toute entreprise qui me donnera l'occasion de montrer mes potentialités.",
    rules: [
      { kind: "changed", message: "Réécrivez le profil." },
      CLICHES,
      { kind: "includesAny", words: ["marketing", "bts"], message: "Dites ce qu'il a étudié : un BTS en marketing." },
      { kind: "includesAny", words: ["vente", "vendu", "vendeur", "téléphones"], message: "Mentionnez son expérience de vente (téléphones, marché Mokolo)." },
      { kind: "regex", pattern: "\\d", message: "Ajoutez un chiffre, par exemple « 2 ans »." },
      { kind: "maxWords", n: 65, message: "Moins de 65 mots." },
    ],
  },
  own: PROFILE_OWN,
  success: "Votre profil est enregistré dans votre CV. C'est la première chose que lit le recruteur.",
};
const profile2: CvProfileTask = {
  ...profile1,
  fix: {
    instruction:
      "Brenda a une licence en comptabilité et a fait un stage de 6 mois dans une microfinance, où elle vérifiait 300 transactions par mois. Réécrivez son profil en 2 ou 3 lignes.",
    initial: "Obtenir un poste stimulant dans une organisation réputée où je pourrai utiliser mes compétences et mes connaissances et m'épanouir en tant que jeune femme dynamique.",
    rules: [
      { kind: "changed", message: "Réécrivez le profil." },
      CLICHES,
      { kind: "includesAny", words: ["comptabilité", "licence"], message: "Dites ce qu'elle a étudié : une licence en comptabilité." },
      { kind: "includesAny", words: ["stage", "stagiaire", "microfinance"], message: "Mentionnez son stage dans la microfinance." },
      { kind: "regex", pattern: "\\d", message: "Ajoutez un chiffre, par exemple « 300 transactions par mois »." },
      { kind: "maxWords", n: 65, message: "Moins de 65 mots." },
    ],
  },
};
const profile3: CvProfileTask = {
  ...profile1,
  fix: {
    instruction:
      "Ali a une licence en informatique et réparait environ 15 téléphones par semaine dans la boutique de son oncle. Il vise un poste de support informatique. Réécrivez son profil en 2 ou 3 lignes.",
    initial: "Je suis une personne sérieuse, ponctuelle et obéissante, prête à apprendre dans n'importe quel domaine. Je cherche n'importe quel emploi.",
    rules: [
      { kind: "changed", message: "Réécrivez le profil." },
      CLICHES,
      { kind: "includesAny", words: ["informatique", "licence"], message: "Dites ce qu'il a étudié : une licence en informatique." },
      { kind: "includesAny", words: ["réparé", "réparation", "réparait", "téléphones"], message: "Mentionnez son expérience de réparation de téléphones." },
      { kind: "includesAny", words: ["support", "technicien", "assistance"], message: "Dites le poste visé : support informatique." },
      { kind: "regex", pattern: "\\d", message: "Ajoutez un chiffre, par exemple « 15 téléphones par semaine »." },
      { kind: "excludesAll", words: ["n'importe quel emploi", "n'importe quel domaine"], message: "Retirez « n'importe quel emploi » : dites le poste visé." },
    ],
  },
};

/* ---------- Étape 10 : stylo rouge (3 variantes) ---------- */

const redPen1: RedPenTask = {
  type: "redPen",
  instruction: "Ce CV a beaucoup de problèmes. Touchez toutes les erreurs que vous trouvez.",
  passPercent: 70,
  success: "Vérifiez maintenant votre propre CV pour les mêmes erreurs avant de l'envoyer.",
  lines: [
    { style: "fancy", parts: [{ text: "Curriculum Vitae de Mbah Lionel", error: "fonts" }] },
    { parts: ["E-mail : ", { text: "lionelthebest@yahoo.com", error: "email" }, "  |  Tél : +237 677 88 99 00  |  Douala"] },
    { parts: [{ text: "CNI N° 112233445 · Père : Mbah John · Mère : Ngum Rose", error: "irrelevant" }] },
    { style: "heading", parts: ["Profil"] },
    { parts: ["Vendeur avec 3 ans d'", { text: "éxpérience", error: "spelling" }, " dans des marchés animés."] },
    { style: "heading", parts: ["Parcours professionnel"] },
    { parts: ["Vendeur, marché de Bonapriso — ", { text: "2019 – 2021", error: "dates" }] },
    { parts: ["• ", { text: "Chargé de la vente et du nettoyage de la boutique", error: "duties" }] },
    { parts: ["Caissier, City Supermarché — ", { text: "mars 2020 à déc. 2022", error: "dates" }] },
    { parts: ["• Géré jusqu'à 400 000 FCFA d'espèces par jour sans aucun écart"] },
    { style: "heading", parts: ["Formation"] },
    { parts: ["GCE A Level ", { text: "obtenue", error: "spelling2" }, " en 2018, GBHS Deido"] },
    { style: "heading", parts: ["Loisirs"] },
    { parts: [{ text: "Dormir, regarder des films, manger", error: "hobbies" }] },
    { style: "small", parts: [{ text: "Page 1 sur 4", error: "pages" }] },
  ],
  errors: [
    { id: "fonts", label: "Titre décoratif, difficile à lire", why: "Utilisez une police simple, et votre nom comme titre, pas « Curriculum Vitae »." },
    { id: "email", label: "Adresse e-mail peu professionnelle", why: "« lionelthebest » ne fait pas sérieux. Utilisez prenom.nom@gmail.com." },
    { id: "irrelevant", label: "Informations personnelles inutiles", why: "Votre numéro de CNI et le nom de vos parents n'aident pas à obtenir le poste, et vous exposent à la fraude." },
    { id: "spelling", label: "Orthographe : « éxpérience »", why: "On écrit « expérience ». Une seule faute peut vous éliminer." },
    { id: "dates", label: "Dates incohérentes et qui se chevauchent", why: "Deux formats de date, et les emplois se chevauchent sans explication. Un seul format, et vérifiez l'ordre." },
    { id: "duties", label: "Une tâche, pas une réussite", why: "« Chargé de » dit ce qu'il devait faire. Dites ce qu'il a réussi, avec un chiffre." },
    { id: "spelling2", label: "Accord : « GCE A Level obtenue »", why: "Le diplôme est masculin ici : « obtenu ». Faites relire votre CV." },
    { id: "hobbies", label: "Des loisirs qui desservent", why: "« Dormir, manger » donne une image de faible énergie. Montrez quelque chose de positif, ou retirez la rubrique." },
    { id: "pages", label: "4 pages", why: "Un premier CV tient en 1 ou 2 pages. Personne ne lit la page 4." },
  ],
};

const redPen2: RedPenTask = {
  ...redPen1,
  lines: [
    { style: "title", parts: [{ text: "CURRICULUM VITAE", error: "title" }] },
    { parts: ["Ngo Bassa Marie-Claire  |  ", { text: "mcsweetheart237@gmail.com", error: "email" }, "  |  ", { text: "691 22 33 44", error: "phone" }] },
    { style: "heading", parts: ["Objectif"] },
    { parts: [{ text: "À la recherche d'un emploi dans n'importe quel domaine pour mettre mes connaissances en pratique.", error: "vague" }] },
    { style: "heading", parts: ["Expérience"] },
    { parts: ["Vendeuse (stage), Pharmacie Bonne Santé — juin 2022 – août 2022"] },
    { parts: ["• ", { text: "Chargée du rangement des médicaments et de l'aide aux clients", error: "duties" }] },
    { parts: ["• Conseillé plus de 40 clients par jour sur les produits sans ordonnance"] },
    { style: "heading", parts: ["Formation"] },
    { parts: ["BTS Vente pharmaceutique, Institut Saint-Jean — 2021"] },
    { parts: [{ text: "Baccalauréat A4 (2018), Probatoire (2017), BEPC (2015), CEP (2011)", error: "oldSchool" }] },
    { style: "heading", parts: ["Compétences"] },
    { parts: [{ text: "Microsoft Ofice, Exel, internet", error: "spelling" }] },
    { style: "fancy", parts: [{ text: "Merci de lire mon CV et que Dieu vous bénisse", error: "fonts" }] },
  ],
  errors: [
    { id: "title", label: "« CURRICULUM VITAE » comme titre", why: "Tout le monde sait que c'est un CV. Mettez votre nom en haut, en gros." },
    { id: "email", label: "Adresse e-mail peu professionnelle", why: "Utilisez votre vrai nom : prenom.nom@gmail.com." },
    { id: "phone", label: "Téléphone sans +237", why: "Écrivez +237 6XX XX XX XX pour que les employeurs internationaux puissent vous appeler." },
    { id: "vague", label: "Objectif vague", why: "« N'importe quel domaine » montre que vous n'avez pas de direction. Nommez le poste visé." },
    { id: "duties", label: "Une tâche, pas une réussite", why: "Remplacez « Chargée de » par ce que vous avez fait et le résultat." },
    { id: "oldSchool", label: "Trop d'anciens diplômes", why: "Gardez vos diplômes les plus élevés. Personne n'a besoin de votre CEP." },
    { id: "spelling", label: "Orthographe : « Ofice », « Exel »", why: "« Microsoft Office », « Excel ». Une faute dans vos compétences est fatale." },
    { id: "fonts", label: "Police décorative et phrase de fin inutile", why: "Un CV ne se termine pas par des remerciements ou des bénédictions. Une seule police simple." },
  ],
};

const redPen3: RedPenTask = {
  ...redPen1,
  lines: [
    { style: "fancy", parts: [{ text: "★ FONYUY BERTRAND NSAH ★", error: "fonts" }] },
    { parts: ["E-mail : ", { text: "bertrandkingofnso@gmail.com", error: "email" }, "  |  +237 650 33 21 09  |  Bamenda"] },
    { parts: [{ text: "Marié · 2 enfants · Catholique · Tribu : Nso", error: "irrelevant" }] },
    { style: "heading", parts: ["Expérience professionnelle"] },
    { parts: ["Agent de saisie, Agence Unity Transport — depuis 2021"] },
    { parts: ["• ", { text: "Responsable de la saisie des données et de l'accueil des clients", error: "duties" }] },
    { parts: ["Professeur de mathématiques, Collège Saint-Paul — ", { text: "sept. 2019 – 2020 juin", error: "dates" }] },
    { parts: ["• Préparé 140 élèves au GCE O Level ; taux de réussite passé de 48 % à 71 %"] },
    { style: "heading", parts: ["Formation"] },
    { parts: ["Licence en mathématiques, Université de ", { text: "Bamanda", error: "spelling" }, " (2019)"] },
    { style: "heading", parts: ["Références"] },
    { parts: [{ text: "M. John Ndze, +237 677 00 11 22 · Mme Rose Fai, +237 699 22 33 44 · Pasteur Paul, +237 680 11 22 33 · M. Kum, +237 651 00 99 88", error: "references" }] },
    { style: "small", parts: [{ text: "Page 1 sur 3", error: "pages" }] },
  ],
  errors: [
    { id: "fonts", label: "Étoiles et police décoratives", why: "Les décorations font peu professionnel et gênent les logiciels de tri. Restez sobre." },
    { id: "email", label: "Adresse e-mail peu professionnelle", why: "« kingofnso » est drôle entre amis, pas pour un recruteur." },
    { id: "irrelevant", label: "Informations qui invitent aux préjugés", why: "La religion, la tribu et les enfants ne sont pas nécessaires et peuvent mener à des jugements injustes." },
    { id: "duties", label: "Une tâche, pas une réussite", why: "Dites ce qu'il a réussi comme agent de saisie, avec un chiffre." },
    { id: "dates", label: "Format de date désordonné", why: "« sept. 2019 – 2020 juin » est confus. Un seul format : 2019 – 2020." },
    { id: "spelling", label: "Orthographe : « Bamanda »", why: "Même le nom de la ville est faux : « Bamenda ». Relisez chaque ligne." },
    { id: "references", label: "Trop de références qui prennent de la place", why: "Deux références suffisent, ou écrivez « Références disponibles sur demande »." },
    { id: "pages", label: "3 pages", why: "Un premier CV tient en 1 ou 2 pages." },
  ],
};

/* ---------- Étapes 12–13 : offres pour la correspondance et l'adaptation ---------- */

const A_SALES: KeywordAdvert = {
  id: "etoile-sales",
  org: "Supermarché Étoile, Buea",
  title: "Vendeur(se)",
  text: "Le Supermarché Étoile recrute des vendeurs. Vous servirez les clients, tiendrez la caisse et les paiements Mobile Money, et garderez les rayons pleins. Profil : GCE A Level ou BTS ; expérience en service client ; caisse tenue avec honnêteté ; travail en équipe ; ponctuel ; anglais et français. Une base en Excel est un atout.",
  terms: ["service client", "vente", "caisse", "mobile money", "travail en équipe", "ponctuel", "anglais", "français", "Excel"],
};
const A_DATA: KeywordAdvert = {
  id: "sahel-data",
  org: "Initiative Santé Sahel, Garoua",
  title: "Enquêteur(trice) (enquête santé)",
  text: "L'Initiative Santé Sahel recrute des enquêteurs pour une enquête santé de 3 mois dans les villages autour de Garoua. Tâches : entretiens auprès des ménages, collecte de données sur smartphone, rapports quotidiens. Profil : Baccalauréat minimum ; expérience d'enquête ou de travail communautaire ; bon français ; mobilité sur le terrain. Le fulfulde est un plus.",
  terms: ["collecte de données", "enquête", "communautaire", "terrain", "rapport", "santé", "français", "smartphone"],
};
const A_ADMIN: KeywordAdvert = {
  id: "mbakwa-admin",
  org: "Cabinet juridique Mbakwa, Yaoundé",
  title: "Assistant(e) administratif(ve)",
  text: "Cabinet d'avocats recherche un(e) assistant(e) administratif(ve) bilingue : accueil, classement, saisie de courriers, gestion de l'agenda et suivi des clients. Profil : BTS en secrétariat ou bureautique ; pack Office (Word, Excel) ; excellent sens de l'organisation ; bilingue anglais/français ; discrétion.",
  terms: ["administration", "accueil", "classement", "pack Office", "Excel", "sens de l'organisation", "bilingue", "client"],
};
const A_CS: KeywordAdvert = {
  id: "sawa-cs",
  org: "Sawa Microfinance, Douala",
  title: "Chargé(e) de clientèle",
  text: "Accueillir les clients, ouvrir des comptes, expliquer les produits et traiter les réclamations. Profil : BTS/licence en banque, comptabilité ou marketing ; 6 mois d'expérience en contact client ; bilingue ; Mobile Money ; résolution de problèmes ; Excel.",
  terms: ["service client", "comptabilité", "bilingue", "mobile money", "résolution de problèmes", "Excel", "caisse", "travail en équipe"],
};
const A_NGO: KeywordAdvert = {
  id: "ndolo-field",
  org: "Fondation Ndolo pour la Jeunesse, Bamenda",
  title: "Assistant(e) de terrain (ONG)",
  text: "Appuyer les activités d'emploi des jeunes à Bamenda et Bafut : mobilisation communautaire, visites de ménages, enquêtes, séances de formation pour les jeunes et rapports hebdomadaires. Profil : diplôme en sciences sociales ; bénévolat ou travail communautaire ; anglais et pidgin ; permis moto apprécié.",
  terms: ["communautaire", "jeunes", "terrain", "enquête", "enseignement", "rapport", "bénévolat", "anglais"],
};
const A_BANK: KeywordAdvert = {
  id: "firstsavings-cs",
  org: "First Savings Bank, Douala",
  title: "Chargé(e) de clientèle (banque)",
  text: "Servir les clients de la banque au guichet et par téléphone : ouverture de comptes, dépôts d'espèces, demandes de cartes et réclamations. Profil : BTS/licence en banque ou comptabilité ; excellent service client ; caisse ; bilingue anglais/français ; Excel ; rigueur et ponctualité.",
  terms: ["service client", "comptabilité", "caisse", "bilingue", "Excel", "résolution de problèmes", "ponctuel"],
};
const A_HOSPITAL: KeywordAdvert = {
  id: "hope-hospital-admin",
  org: "Hôpital de district Hope, Kumba",
  title: "Assistant(e) administratif(ve) d'hôpital",
  text: "Enregistrer les patients à l'accueil, classer les dossiers médicaux, saisir des rapports et gérer les rendez-vous. Profil : diplôme en secrétariat ou bureautique ; pack Office ; bon sens de l'organisation ; anglais et français ; confidentialité ; une expérience dans la santé est un atout.",
  terms: ["patients", "administration", "classement", "rapport", "pack Office", "sens de l'organisation", "santé", "bilingue"],
};
const A_TELECOM: KeywordAdvert = {
  id: "mboa-sales",
  org: "Mboa Telecom Services, Yaoundé",
  title: "Commercial(e) terrain (télécoms)",
  text: "Vendre des cartes SIM, des forfaits internet et des services Mobile Money dans les marchés et les quartiers. Atteindre les objectifs hebdomadaires et faire un rapport quotidien. Profil : expérience de vente ; aisance en communication ; Mobile Money ; réseaux sociaux ; français et anglais ; permis moto apprécié.",
  terms: ["vente", "mobile money", "communication", "réseaux sociaux", "rapport", "terrain", "français", "client"],
};
const A_SCHOOL: KeywordAdvert = {
  id: "bethel-secretary",
  org: "Collège bilingue Bethel, Limbe",
  title: "Secrétaire d'établissement scolaire",
  text: "Accueillir les parents et les visiteurs, saisir les courriers et les documents d'examen, tenir les dossiers des élèves et encaisser les frais de scolarité. Profil : diplôme en secrétariat ; pack Office ; bilingue ; organisé(e) ; une expérience avec les enfants ou en milieu scolaire est un plus.",
  terms: ["secrétariat", "pack Office", "bilingue", "sens de l'organisation", "enfants", "classement", "caisse", "accueil"],
};
const A_LOGISTICS: KeywordAdvert = {
  id: "portline-logistics",
  org: "PortLine Logistics, Douala",
  title: "Agent logistique",
  text: "Enregistrer les entrées et sorties de marchandises, préparer les bons de livraison, compter le stock et mettre à jour les rapports Excel. Profil : BTS en logistique ou gestion ; Excel ; expérience de stock ou d'inventaire ; rigueur ; travail en équipe ; permis de conduire apprécié.",
  terms: ["logistique", "livraison", "Excel", "rapport", "travail en équipe", "permis de conduire"],
};

const keyword = (adverts: KeywordAdvert[]): KeywordMatchTask => ({
  type: "keywordMatch",
  instruction: "Choisissez une offre (ou collez-en une vraie). Voyez à quel point votre CV reprend les mots de l'employeur.",
  adverts,
  allowPaste: true,
  success: "Faites-le avant chaque candidature : reprenez les mots de l'employeur, honnêtement, en haut de votre CV.",
});

const tailor = (a: KeywordAdvert, b: KeywordAdvert): TailorTask => ({
  type: "tailor",
  instruction: "Même CV, deux postes très différents. Pour chacun, montez les bonnes compétences et réécrivez votre profil. Les deux scores doivent augmenter.",
  adverts: [a, b],
  success: "Vous avez maintenant deux versions adaptées. N'envoyez jamais le même CV à toutes les offres.",
});

/* ---------- Le cours ---------- */

const MISSION_ADVERT = {
  org: "Fondation Ndolo pour la Jeunesse, Bamenda",
  title: "Assistant(e) de programme",
  text:
    "La Fondation Ndolo pour la Jeunesse recrute un(e) assistant(e) de programme pour appuyer les activités de formation et d'emploi des jeunes.\n\nVous allez : organiser des séances de formation, tenir les listes de participants sur Excel, rédiger de courts rapports d'activité et communiquer avec les partenaires.\n\nProfil : BTS ou licence ; expérience dans l'organisation d'activités (école, église, bénévolat ou travail) ; bonne maîtrise de l'informatique ; anglais et français.\n\nPour postuler : envoyez votre CV (PDF, 2 pages maximum) par e-mail avec pour objet « Candidature au poste d'assistant(e) de programme – Votre nom ».",
};

const course: Course = {
  id: "cv",
  locale: "fr",
  title: "Un CV qui décroche des entretiens",
  promise: "Repartez avec votre propre CV professionnel en PDF, adapté au poste, construit pas à pas sur votre téléphone.",
  price: 1000,
  track: "career",
  audience: "Pour les diplômés et les chercheurs d’emploi",
  cover: "cv-11-cv-ready",
  outcomes: ["Votre propre CV en PDF soigné, 2 pages maximum", "Des réalisations chiffrées, pas une liste de tâches", "Une version adaptée à une vraie offre d’emploi"],
  series: "Décrocher un emploi · 1 sur 4",
  usesCv: true,
  badge: "cv-certificate-badge",
  freeSteps: 1,
  steps: [
    {
      title: "Pourquoi la plupart des CV sont rejetés en quelques secondes",
      illustration: "cv-01-recruiter-scan",
      body: [
        "Un recruteur reçoit souvent 200 CV pour un seul poste. Le premier regard dure environ 7 secondes.",
        "Pendant ces secondes, il cherche votre nom, le poste visé, votre diplôme et votre expérience. S'il ne les trouve pas, il passe au suivant.",
        "Essayez : mettez-vous à la place du recruteur.",
      ],
      mistake: "Croire qu'un CV long et décoré fait plus sérieux. Les recruteurs préfèrent court, clair et facile à parcourir.",
      task: scan1,
      variants: [scan2, scan3],
    },
    {
      title: "Lire une offre comme un recruteur",
      illustration: "cv-02-job-advert",
      body: [
        "Une offre dit exactement ce que veut l'employeur. « Exigé » ou « obligatoire » : indispensable. « Un atout » ou « un plus » : postulez même sans cela.",
        "Avant d'écrire quoi que ce soit, repérez les pièces à fournir, comment postuler et la date limite.",
      ],
      mistake: "Ne pas postuler parce qu'il vous manque un atout. Si vous avez l'indispensable, postulez.",
      task: advert1,
      variants: [advert2, advert3],
    },
    {
      title: "Repérer la fausse offre",
      illustration: "cv-03-fake-job",
      body: [
        "De faux recruteurs ciblent les chercheurs d'emploi. Signaux d'alerte : des frais à payer, un « recruteur » joignable seulement sur WhatsApp, un salaire trop beau, pas d'entretien, ou on vous demande votre CNI ou votre numéro Mobile Money.",
        "Un vrai employeur ne vous demande jamais de payer pour obtenir un emploi.",
      ],
      mistake: "Payer de « petits frais d'inscription » pour garder sa place. Cet argent n'est jamais rendu, et il n'y a pas d'emploi.",
      task: fake1,
      variants: [fake2, fake3],
    },
    {
      title: "Vous avez plus d'expérience que vous ne le pensez",
      illustration: "cv-04-experience",
      body: [
        "L'expérience, ce n'est pas seulement un emploi payé. Diriger un club, servir à l'église, aider dans la boutique familiale, donner des cours, faire du bénévolat : tout compte.",
        "Répondez à quelques questions. Nous transformerons vos réponses en premières lignes de votre CV.",
      ],
      mistake: "Écrire « Aucune expérience » sur un CV. Presque tout le monde a fait quelque chose à montrer.",
      cvSection: "experience",
      task: {
        type: "experienceMiner",
        intro: "Bonjour ! Je vais vous poser des questions sur 7 parties de votre vie. Répondez simplement ; nous rendrons cela professionnel ensuite.",
        success: "Vos expériences sont dans votre CV. À l'étape 8, vous en ferez des lignes fortes.",
        questions: [
          {
            id: "school",
            ask: "À l'école ou à l'université, avez-vous été délégué, chef de classe ou membre d'un club ?",
            examples: "(ex. délégué de classe, club de débat, club santé, chorale)",
            titleHint: "Membre de club",
            followUps: [
              { key: "what", ask: "Qu'y faisiez-vous ? Une chose que vous faisiez souvent ou dirigiez.", placeholder: "ex. Organisé les séances de débat chaque semaine" },
              { key: "where", ask: "Quelle école ou quel club ?", placeholder: "ex. Lycée bilingue de Deido, club de débat" },
              { key: "when", ask: "Quand ? (années)", placeholder: "ex. 2019–2021" },
              { key: "result", ask: "Un résultat ou un chiffre ? Combien de personnes, qu'est-ce qui a changé ?", placeholder: "ex. 40 membres ; concours régional gagné" },
            ],
          },
          {
            id: "church",
            ask: "Servez-vous dans une église, une mosquée ou une association ?",
            examples: "(ex. responsable des jeunes, chorale, trésorier, accueil, événements)",
            titleHint: "Bénévole",
            followUps: [
              { key: "what", ask: "Qu'y faites-vous ?", placeholder: "ex. Je tiens la caisse du groupe des jeunes" },
              { key: "where", ask: "Quelle église ou association ?", placeholder: "ex. Église presbytérienne de Buea, groupe des jeunes" },
              { key: "when", ask: "Depuis quand ?", placeholder: "ex. 2021–aujourd'hui" },
              { key: "result", ask: "Un résultat ou un chiffre ?", placeholder: "ex. Collecté 85 000 FCFA pour les tenues de la chorale" },
            ],
          },
          {
            id: "family",
            ask: "Avez-vous aidé dans une affaire familiale : boutique, champ, call box, restaurant, transport ?",
            examples: "(Beaucoup l'oublient !)",
            titleHint: "Assistant(e), commerce familial",
            followUps: [
              { key: "what", ask: "Qu'avez-vous fait ?", placeholder: "ex. Vendu, tenu le cahier de stock, géré le Mobile Money" },
              { key: "where", ask: "Quel type d'affaire, et où ?", placeholder: "ex. Épicerie familiale, Mutengene" },
              { key: "when", ask: "Quand ?", placeholder: "ex. Vacances 2018–2022" },
              { key: "result", ask: "Un chiffre ? Clients par jour, argent géré…", placeholder: "ex. Environ 50 clients par jour" },
            ],
          },
          {
            id: "volunteer",
            ask: "Avez-vous fait du bénévolat : journées de propreté, campagnes de santé, événements, ONG ?",
            examples: "(ex. campagne de vaccination, Fête de la jeunesse, comité de mariage ou de funérailles)",
            titleHint: "Bénévole",
            followUps: [
              { key: "what", ask: "Qu'avez-vous fait ?", placeholder: "ex. Enregistré les participants d'un dépistage gratuit" },
              { key: "where", ask: "Avec quel groupe ?", placeholder: "ex. Croix-Rouge, comité de Limbe" },
              { key: "when", ask: "Quand ?", placeholder: "ex. Mars 2023" },
              { key: "result", ask: "Un chiffre ou un résultat ?", placeholder: "ex. 300 personnes enregistrées en 2 jours" },
            ],
          },
          {
            id: "tutoring",
            ask: "Avez-vous enseigné ou donné des cours : frères et sœurs, voisins, cours de vacances ?",
            examples: "(Être répétiteur compte.)",
            titleHint: "Répétiteur(trice)",
            followUps: [
              { key: "what", ask: "Quelle matière, et à qui ?", placeholder: "ex. Mathématiques à des élèves de 3e" },
              { key: "where", ask: "Où ?", placeholder: "ex. Cours de vacances, Bonabéri" },
              { key: "when", ask: "Quand ?", placeholder: "ex. 2020–2022" },
              { key: "result", ask: "Un résultat ?", placeholder: "ex. 5 de mes 6 élèves ont eu le BEPC" },
            ],
          },
          {
            id: "sports",
            ask: "Jouez-vous dans une équipe, ou avez-vous organisé des événements sportifs ou culturels ?",
            examples: "(ex. capitaine d'équipe, festival scolaire, tournoi de quartier)",
            titleHint: "Membre d'équipe / Organisateur",
            followUps: [
              { key: "what", ask: "Quel était votre rôle ?", placeholder: "ex. Capitaine ; entraînements deux fois par semaine" },
              { key: "where", ask: "Quelle équipe ou quel événement ?", placeholder: "ex. Tournoi de football du quartier, Molyko" },
              { key: "when", ask: "Quand ?", placeholder: "ex. 2022" },
              { key: "result", ask: "Un résultat ou un chiffre ?", placeholder: "ex. 8 équipes, 300 spectateurs" },
            ],
          },
          {
            id: "work",
            ask: "Un travail payé : job de vacances, stage, temps partiel, ou votre propre petit commerce ?",
            examples: "(Vendre en ligne compte aussi.)",
            titleHint: "Stagiaire / Employé(e) à temps partiel",
            followUps: [
              { key: "what", ask: "Qu'avez-vous fait ?", placeholder: "ex. Vendu des accessoires de téléphone sur Facebook" },
              { key: "where", ask: "Où, ou pour qui ?", placeholder: "ex. Mon propre commerce, Douala" },
              { key: "when", ask: "Quand ?", placeholder: "ex. 2023–aujourd'hui" },
              { key: "result", ask: "Un chiffre ou un résultat ?", placeholder: "ex. 120 commandes livrées" },
            ],
          },
        ],
      },
    },
    {
      title: "Les bonnes rubriques dans le bon ordre",
      illustration: "cv-05-sections",
      body: [
        "Tout CV a les mêmes blocs : nom et coordonnées, profil, formation, expérience, compétences, langues.",
        "L'ordre dépend de vous. Un débutant commence par la formation ; une personne avec une vraie expérience commence par l'expérience.",
      ],
      mistake: "Commencer par une longue rubrique « État civil ». Mettez vos coordonnées sur une ligne sous votre nom.",
      task: order1,
      variants: [order2, order3],
    },
    {
      title: "Votre en-tête : qui vous êtes et comment vous joindre",
      illustration: "cv-06-header",
      body: [
        "Votre nom en haut, en gros, pas « Curriculum Vitae ». Dessous, une ligne : e-mail professionnel, téléphone avec +237, ville, et LinkedIn si votre profil est soigné.",
        "Photo, date de naissance et situation matrimoniale dépendent de l'employeur. Lisez les usages ci-dessous et choisissez.",
      ],
      mistake: "Utiliser une adresse e-mail-surnom, ou un numéro sans +237.",
      cvSection: "header",
      task: {
        type: "cvHeader",
        instruction: "Remplissez votre en-tête. Il est enregistré dans votre CV immédiatement.",
        localNorm: "Beaucoup d'entreprises camerounaises et de recrutements publics attendent la date de naissance, parfois la situation matrimoniale et une photo.",
        internationalNorm:
          "Les organisations internationales, les ONG et de nombreuses entreprises privées préfèrent sans photo, sans date de naissance ni situation matrimoniale, pour éviter les discriminations.",
        success: "Votre en-tête est prêt. Le recruteur voit qui vous êtes et peut vous joindre en une ligne.",
      },
    },
    {
      title: "Votre profil en 3 lignes",
      illustration: "cv-07-profile",
      body: [
        "Le profil, ce sont 3 lignes sous votre nom : qui vous êtes, votre meilleure preuve, et le poste que vous visez.",
        "Oubliez les clichés comme « travailleur et craignant Dieu ». Tout le monde les écrit. Donnez des preuves.",
      ],
      mistake: "Écrire un long « objectif de carrière » sur votre propre épanouissement. L'employeur veut savoir ce que vous lui apportez.",
      cvSection: "profile",
      task: profile1,
      variants: [profile2, profile3],
    },
    {
      title: "Des tâches aux réussites",
      illustration: "cv-08-achievements",
      body: [
        "Une tâche dit ce que vous deviez faire. Une réussite dit ce que vous avez fait et ce qui a changé.",
        "La formule : verbe d'action + ce que vous avez fait + résultat, avec un chiffre si possible.",
      ],
      mistake: "Commencer chaque ligne par « Chargé(e) de… ». Cela cache ce que vous avez vraiment réussi.",
      cvSection: "bullets",
      task: {
        type: "bulletBuilder",
        instruction: "Construisez 3 lignes fortes à partir de vos propres expériences.",
        verbs: ["Organisé", "Vendu", "Servi", "Enseigné", "Encadré", "Géré", "Dirigé", "Coordonné", "Formé", "Collecté", "Préparé", "Enregistré", "Traité", "Augmenté", "Réduit", "Créé", "Livré", "Supervisé", "Amélioré", "Accueilli"],
        example: { verb: "Organisé", task: "une journée de collecte pour 120 membres de l'église", result: "et récolté 85 000 FCFA pour la chorale des jeunes", before: "Chargée des événements de l'église." },
        required: 3,
        success: "Trois lignes fortes. C'est ce qui fait s'arrêter un recruteur.",
      },
    },
    {
      title: "Formation, compétences et langues",
      illustration: "cv-09-education-skills",
      body: [
        "Indiquez d'abord vos diplômes les plus élevés : diplôme, établissement, ville, année. Inutile de mettre le CEP ou le FSLC.",
        "Donnez à chaque compétence un niveau honnête. Au Cameroun, vos niveaux d'anglais et de français comptent beaucoup.",
      ],
      mistake: "Écrire « Maîtrise parfaite de tous les outils informatiques ». Si l'entretien comporte un test Excel, cela se verra.",
      cvSection: "education",
      task: {
        type: "cvEducationSkills",
        instruction: "Ajoutez votre formation, au moins 4 compétences avec un niveau honnête, et vos langues.",
        honesty:
          "N'indiquez que des compétences que vous pouvez prouver en entretien ou lors d'un test. « Très bon niveau en Excel » veut dire que vous savez faire un tableau avec des formules devant le recruteur.",
        minSkills: 4,
        success: "Votre formation, vos compétences et vos langues sont dans votre CV.",
      },
    },
    {
      title: "Stylo rouge : corrigez ce CV",
      illustration: "cv-10-red-pen",
      body: ["Les recruteurs voient les erreurs tout de suite. Entraînez votre œil sur le CV de quelqu'un d'autre.", "Regardez l'e-mail, les dates, l'orthographe, la longueur et ce que dit chaque ligne."],
      task: redPen1,
      variants: [redPen2, redPen3],
    },
    {
      title: "Votre CV est prêt : aperçu et téléchargement",
      illustration: "cv-11-cv-ready",
      body: [
        "Votre CV utilise une mise en page sobre, sur une colonne, lisible par les personnes et par les logiciels de recrutement (ATS).",
        "Il est enregistré sous Prenom_Nom_CV.pdf, 2 pages maximum. C'est le fichier que vous enverrez.",
      ],
      mistake: "Envoyer un fichier Word ou une photo de votre CV. Envoyez toujours un PDF au nom clair.",
      cvSection: "export",
      task: { type: "cvExport", instruction: "Vérifiez votre CV, choisissez la mise en page, puis téléchargez votre PDF.", success: "Votre CV est téléchargé." },
    },
    {
      title: "Adapter votre CV au poste",
      illustration: "cv-12-keyword-match",
      body: [
        "Les recruteurs et les logiciels ATS cherchent les mots de l'offre. Si l'offre dit « service client » et votre CV « aider les gens », vous risquez d'être écarté(e).",
        "Reprenez les mots de l'employeur, mais seulement pour ce qui est vrai.",
      ],
      mistake: "Recopier toute l'offre dans votre CV, ou ajouter des compétences que vous n'avez pas. L'entretien le révèle.",
      task: keyword([A_SALES, A_DATA, A_ADMIN]),
      variants: [keyword([A_CS, A_NGO, A_ADMIN]), keyword([A_DATA, A_SALES, A_CS])],
    },
    {
      title: "Un CV, deux postes",
      illustration: "cv-13-tailor",
      body: [
        "Des postes différents demandent des versions différentes de votre CV. Vous ne réécrivez pas tout : vous changez le profil et l'ordre de vos compétences.",
        "Dix minutes d'adaptation peuvent doubler vos chances.",
      ],
      task: tailor(A_NGO, A_BANK),
      variants: [tailor(A_HOSPITAL, A_TELECOM), tailor(A_SCHOOL, A_LOGISTICS)],
    },
    {
      title: "Mission finale : envoyez votre vrai CV",
      illustration: "cv-18-mission",
      body: [
        "Votre dernière tâche est réelle. Adaptez votre CV à l'offre ci-dessous, téléchargez-le, et envoyez-le depuis votre propre Gmail.",
        "Après cette étape, touchez « Terminer le cours » : vous y trouverez l'adresse de la mission et votre liste de vérification. Nous vérifions l'e-mail et le PDF automatiquement.",
      ],
      task: {
        type: "missionBrief",
        advert: MISSION_ADVERT,
        points: [
          "Adaptez votre profil et vos compétences à cette offre (l'étape 13 montre comment).",
          "Téléchargez à nouveau votre CV : Prenom_Nom_CV.pdf, 2 pages maximum.",
          "Objet : « Candidature au poste d'assistant(e) de programme – Votre nom ».",
          "Un court message poli avec une formule d'appel, une formule de politesse, et votre signature avec votre numéro.",
        ],
      },
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 2, 4, 6, 8],
    questions: [
      { step: 1, question: "Combien de temps dure environ le premier regard d'un recruteur sur un CV ?", options: ["7 secondes", "2 minutes", "10 minutes", "Il lit toujours tout"], answer: 0 },
      { step: 2, question: "Une offre dit « La maîtrise d'Excel est un atout ». Qu'est-ce que cela veut dire ?", options: ["C'est obligatoire", "C'est un plus : postulez même sans", "C'est la date limite", "C'est une pièce à fournir"], answer: 1 },
      { step: 3, question: "Un « recruteur » demande 15 000 FCFA pour confirmer votre place. Qu'est-ce que c'est ?", options: ["Une pratique normale", "Une arnaque", "Le signe d'une bonne entreprise", "Une règle de l'État"], answer: 1 },
      { step: 4, question: "Vous avez dirigé le groupe des jeunes de votre église pendant 2 ans. Est-ce que cela va dans votre CV ?", options: ["Non, seuls les emplois payés comptent", "Oui, c'est une vraie expérience", "Seulement si vous étiez payé(e)", "Seulement dans les loisirs"], answer: 1 },
      { step: 5, question: "Pour un jeune diplômé, qu'est-ce qui vient en général juste après le profil ?", options: ["Les centres d'intérêt", "La formation", "Les références", "Les langues"], answer: 1 },
      { step: 6, question: "Quel doit être le titre en haut de votre CV ?", options: ["CURRICULUM VITAE", "Votre nom complet", "« Mon CV »", "Seulement l'intitulé du poste"], answer: 1 },
      { step: 7, question: "Quel profil est le meilleur ?", options: ["Jeune homme travailleur, honnête et craignant Dieu, prêt pour tout emploi.", "Diplômé en marketing, 2 ans de vente de téléphones ; recherche un poste commercial.", "Je souhaite m'épanouir dans une entreprise réputée.", "Le profil n'est pas nécessaire."], answer: 1 },
      { step: 8, question: "Quelle ligne est une réussite ?", options: ["Chargé de la caisse", "Responsable des clients", "Géré 300 000 FCFA par jour sans aucun écart", "Mes tâches : nettoyage"], answer: 2 },
      { step: 11, question: "Quel fichier faut-il envoyer ?", options: ["CV.docx", "Photo de mon CV.jpg", "Tabi_Ndip_CV.pdf", "scan0001.pdf"], answer: 2 },
      { step: 12, question: "L'offre demande « service client ». Vous avez servi des clients. Que faites-vous ?", options: ["Rien, ils comprendront", "Utiliser les mots « service client » dans votre CV", "Recopier toute l'offre dans votre CV", "Ajouter des compétences que vous n'avez pas"], answer: 1 },
    ],
  },
  mission: {
    kind: "cv",
    intro: "Prouvez-le pour de vrai : envoyez votre CV adapté, en PDF, depuis votre propre Gmail à notre recruteur test.",
    steps: [
      "Écrivez l'adresse Gmail que vous allez utiliser.",
      "Téléchargez à nouveau votre CV après l'avoir adapté à l'offre d'assistant(e) de programme.",
      "Dans Gmail, écrivez à l'adresse ci-dessous avec pour objet « Candidature au poste d'assistant(e) de programme – Votre nom ».",
      "Écrivez une formule d'appel, 2 ou 3 phrases polies, une formule de politesse et votre signature avec votre numéro.",
      "Joignez votre PDF (Prenom_Nom_CV.pdf) depuis Téléchargements, puis appuyez sur Envoyer. Nous vérifions automatiquement.",
    ],
    subjectWords: ["assistant de programme", "assistante de programme", "assistant(e) de programme", "programme assistant"],
    advert: MISSION_ADVERT,
    subjectExample: "Candidature au poste d'assistant(e) de programme – {name}",
    messages: {
      gmail: "Envoyez depuis l'adresse Gmail saisie ici.",
      subject: "L'objet doit nommer le poste : « Candidature au poste d'assistant(e) de programme – Votre nom ».",
      pdf: "Joignez votre CV en PDF.",
      fileName: "Nommez votre fichier Prenom_Nom_CV.pdf, comme celui téléchargé à l'étape 11.",
      unreadable: "Impossible d'ouvrir votre PDF. Téléchargez-le à nouveau depuis « Mon CV » et joignez ce fichier (pas une photo ni un scan).",
      pages: "Votre CV fait plus de 2 pages. Raccourcissez-le et renvoyez-le.",
      cvEmail: "Nous n'avons pas trouvé votre adresse e-mail dans le CV. Ajoutez-la à votre en-tête.",
      cvPhone: "Nous n'avons pas trouvé votre numéro dans le CV. Ajoutez-le avec +237 à votre en-tête.",
      cvSections: "Votre CV doit contenir les rubriques Formation, Expérience et Compétences.",
      greeting: "Commencez votre message par une formule d'appel, ex. « Madame, Monsieur, ».",
      closing: "Terminez par une formule de politesse comme « Cordialement, ».",
      signature: "Signez avec votre nom et votre numéro de téléphone à la fin du message.",
    },
  },
};

export default course;
