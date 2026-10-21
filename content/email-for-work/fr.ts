import type { Course } from "../types";

const course: Course = {
  id: "email-for-work",
  locale: "fr",
  title: "L'e-mail au travail",
  promise: "Écrivez et envoyez des e-mails professionnels en toute confiance, depuis votre téléphone.",
  price: 850,
  freeSteps: 1,
  steps: [
    // 1
    {
      title: "Pourquoi l'e-mail est toujours important",
      illustration: "email-01-why",
      body: [
        "Les employeurs, les écoles et les banques utilisent encore l'e-mail pour les choses importantes : offres d'emploi, contrats et lettres officielles.",
        "WhatsApp sert aux échanges rapides. L'e-mail est votre voix professionnelle, et il garde une trace écrite.",
        "Dans ce cours, vous pratiquez chaque étape sur des écrans qui ressemblent aux vrais.",
      ],
    },
    // 2
    {
      title: "Choisir une adresse professionnelle",
      illustration: "email-02-address",
      body: [
        "Votre adresse e-mail est la première chose que voit un recruteur. Utilisez votre vrai nom, par exemple prenom.nom@gmail.com.",
        "Si votre nom est déjà pris, ajoutez une initiale ou un petit numéro, pas un surnom.",
      ],
      mistake: "Utiliser une adresse « fun » comme sexy.princesse237@… ou grandboss2000@… pour postuler. Gardez ces adresses pour les amis.",
      task: {
        type: "multipleChoice",
        question: "Nkeng Ateh cherche du travail. Quelle adresse doit-elle utiliser ?",
        options: ["douce.nkeng237@gmail.com", "nkeng.ateh@gmail.com", "reine_de_douala@gmail.com", "nkeng2000xx@gmail.com"],
        answer: 1,
        explanation: "nkeng.ateh@gmail.com contient seulement son vrai nom. Elle paraît sérieuse et elle est facile à retenir.",
        hints: ["« douce » est personnel, pas professionnel.", null, "Un surnom ne dit pas au recruteur qui elle est.", "Des chiffres et lettres au hasard font négligé."],
      },
    },
    // 3
    {
      title: "Créer un compte Gmail",
      illustration: "email-03-account",
      body: [
        "Sur votre téléphone, ouvrez gmail.com ou l'application Gmail et appuyez sur « Créer un compte ».",
        "Google demande votre nom, votre date de naissance, l'adresse souhaitée, un mot de passe et un numéro de téléphone. Entraînons-nous sur une copie sans risque de ces écrans.",
      ],
      mistake: "Écrire son mot de passe sur un papier que tout le monde voit, ou utiliser sa date de naissance comme mot de passe.",
      task: {
        type: "signup",
        instruction: "Remplissez chaque écran comme si vous créiez votre vrai compte.",
        success: "Votre compte d'entraînement est prêt. Sur le vrai Gmail, les écrans sont presque identiques.",
      },
    },
    // 4
    {
      title: "Sécuriser le compte : téléphone de récupération et validation en deux étapes",
      illustration: "email-04-security",
      body: [
        "Ajoutez votre numéro comme téléphone de récupération, pour pouvoir revenir dans le compte si vous oubliez le mot de passe.",
        "Activez la validation en deux étapes dans les paramètres de votre compte Google. Quand vous vous connectez sur un nouveau téléphone, Google vous envoie un code.",
        "Ce code est seulement pour vous. Personne de chez Google ne vous le demandera jamais.",
      ],
      mistake: "Envoyer votre code de validation sur WhatsApp à quelqu'un qui dit être « de Google » ou qui veut « vous aider ».",
      task: {
        type: "multipleChoice",
        question: "Vous recevez un code Google à 6 chiffres par SMS. Une minute après, quelqu'un sur WhatsApp vous demande de le lui envoyer. Que faites-vous ?",
        options: [
          "Je l'envoie, il dit que c'est urgent",
          "J'envoie seulement les 3 premiers chiffres",
          "Je ne l'envoie pas et je change mon mot de passe",
          "Je lui demande d'appeler d'abord, puis je l'envoie",
        ],
        answer: 2,
        explanation: "Le code est la clé de votre compte. Celui qui le demande veut le voler. Ne le partagez jamais et changez votre mot de passe par précaution.",
      },
    },
    // 5
    {
      title: "Visite de la boîte de réception : lire, archiver, spam, rechercher",
      illustration: "email-05-inbox",
      body: [
        "Touchez un e-mail pour le lire. « Archiver » le retire de la boîte de réception mais le garde. « Spam » sert pour les e-mails inutiles ou dangereux.",
        "Utilisez la barre de recherche en haut pour retrouver n'importe quel e-mail en quelques secondes.",
      ],
      mistake: "Supprimer des e-mails importants pour « faire de la place ». Archivez-les plutôt, pour les retrouver plus tard.",
      task: {
        type: "inbox",
        emails: [
          { id: "promo", from: "Promo Téléphones", fromEmail: "news@promotel.cm", subject: "-50 % sur les téléphones ce week-end", preview: "Nos plus grandes soldes de l'année commencent…", body: "Nos plus grandes soldes de l'année commencent maintenant. Passez à notre boutique de Bonamoussadi.", time: "09:12" },
          { id: "family", from: "Tata Grace", fromEmail: "grace.fon@gmail.com", subject: "Déjeuner de dimanche", preview: "N'oublie pas d'apporter les plantains…", body: "N'oublie pas d'apporter les plantains dimanche. À bientôt !", time: "08:40" },
          { id: "prize", from: "Service des Gains", fromEmail: "gains@gagnant-prix.xyz", subject: "VOUS AVEZ GAGNÉ 5 000 000 FCFA !!!", preview: "Envoyez votre CNI et des frais pour recevoir…", body: "Félicitations !!! Vous avez gagné 5 000 000 FCFA. Envoyez une copie de votre CNI et 10 000 FCFA de frais de dossier pour recevoir votre gain aujourd'hui.", time: "Hier" },
          { id: "course", from: "Centre de Formation Sawa", fromEmail: "info@sawatraining.cm", subject: "Votre emploi du temps", preview: "Les cours commencent lundi à 8 h…", body: "Cher apprenant, les cours commencent lundi à 8 h en salle 3.", time: "Hier" },
          { id: "interview", from: "Ndi Recrutement", fromEmail: "rh@ndirecrutement.cm", subject: "Invitation à un entretien – jeudi 10 h", preview: "Nous avons le plaisir de vous inviter à un entretien…", body: "Madame, Monsieur,\n\nNous avons le plaisir de vous inviter à un entretien jeudi à 10 h dans nos bureaux d'Akwa, Douala. Merci de confirmer par retour d'e-mail.\n\nCordialement,\nNdi Recrutement", time: "Lun" },
        ],
        goals: [
          { action: "open", target: "interview", instruction: "Tapez « entretien » dans la recherche, puis ouvrez l'e-mail de l'entretien.", wrong: "Ce n'est pas l'e-mail de l'entretien. Cherchez « entretien ».", done: "Trouvé. La recherche évite de faire défiler longtemps." },
          { action: "archive", target: "promo", instruction: "Ouvrez maintenant la publicité sur les téléphones et archivez-la.", wrong: "Archivez la publicité sur les téléphones, pas celui-ci.", done: "Archivé. Il a quitté la boîte de réception mais n'est pas supprimé." },
          { action: "spam", target: "prize", instruction: "Dernière étape : ouvrez l'e-mail du gain et signalez-le comme spam.", wrong: "Cet e-mail est normal. Trouvez celui qui promet de l'argent.", done: "Signalé. Gmail rangera ce genre d'e-mail dans les spams." },
        ],
        success: "Vous savez maintenant rechercher, lire, archiver et signaler un spam.",
      },
    },
    // 6
    {
      title: "Les parties d'un e-mail : À, Cc, Cci, Objet",
      illustration: "email-06-parts",
      body: [
        "À : la personne principale à qui vous écrivez. Cc : les personnes qui doivent voir l'e-mail, pour information.",
        "Cci : copie cachée ; les autres ne voient pas ces adresses. Objet : un titre court qui dit de quoi parle l'e-mail.",
      ],
      mistake: "Mettre 30 adresses dans À ou Cc pour un message de groupe. Tout le monde voit l'adresse de tout le monde. Utilisez Cci.",
      task: {
        type: "multipleChoice",
        question: "Vous envoyez un rapport à votre responsable et vous voulez que votre collègue Paul le voie aussi, pour information. Où mettez-vous l'adresse de Paul ?",
        options: ["À", "Cc", "Cci", "Objet"],
        answer: 1,
        explanation: "Cc veut dire « pour information ». Votre responsable est le destinataire principal (À), et Paul est en copie (Cc).",
        hints: ["« À » est pour la personne principale, votre responsable.", null, "Avec Cci, votre responsable ne saurait pas que Paul l'a reçu.", "L'objet est le titre, pas une adresse."],
      },
    },
    // 7
    {
      title: "Écrire un objet clair",
      illustration: "email-07-subject",
      body: [
        "Un bon objet dit au lecteur de quoi parle l'e-mail avant même de l'ouvrir.",
        "Faites court et précis, par exemple : « Candidature au poste d'assistante commerciale – Nkeng Ateh ».",
      ],
      mistake: "Laisser l'objet vide ou écrire « Bonjour », « Urgent » ou « Svp lisez ». Les recruteurs ignorent ces e-mails.",
      task: {
        type: "fixText",
        instruction: "Nkeng postule au poste d'assistante commerciale. Réécrivez son objet.",
        initial: "bonjour",
        rules: [
          { kind: "changed", message: "Changez l'objet. « bonjour » ne dit rien." },
          { kind: "excludesAll", words: ["bonjour", "salut", "urgent", "svp", "stp"], message: "Retirez les salutations et les mots comme « urgent ». L'objet est un titre, pas une salutation." },
          { kind: "includesAny", words: ["candidature", "postuler", "demande d'emploi"], message: "Dites qu'il s'agit d'une candidature, par exemple « Candidature au poste… »." },
          { kind: "includesAny", words: ["assistante commerciale", "assistant commercial"], message: "Nommez le poste : assistante commerciale." },
          { kind: "maxWords", n: 12, message: "Faites court : 12 mots maximum." },
        ],
        success: "Clair et précis. Le recruteur sait de quoi il s'agit avant d'ouvrir.",
      },
    },
    // 8
    {
      title: "Formules d'appel et de politesse en français et en anglais",
      illustration: "email-08-greetings",
      body: [
        "Français : commencez par « Monsieur, », « Madame, » ou « Madame, Monsieur, » et terminez par « Cordialement, » suivi de votre nom.",
        "Anglais : commencez par « Dear Mr Tabi, » ou « Dear Sir or Madam, » et terminez par « Kind regards, » suivi de votre nom.",
        "Gardez « Salut » ou « Hi » pour les personnes que vous connaissez bien.",
      ],
      mistake: "Commencer par « Cc », « Slt » ou « Yo » quand on écrit à un employeur.",
      task: {
        type: "multipleChoice",
        question: "Vous écrivez en français à une entreprise. Vous ne savez pas qui va lire. Quelle formule d'appel est la meilleure ?",
        options: ["Salut !", "Madame, Monsieur,", "Coucou,", "Bonjour mon frère,"],
        answer: 1,
        explanation: "« Madame, Monsieur, » est la formule polie et standard quand on ne connaît pas le nom du lecteur.",
      },
    },
    // 9
    {
      title: "Écrire le message : court, poli, clair",
      illustration: "email-09-body",
      body: [
        "Dites qui vous êtes, ce que vous voulez et ce qui doit se passer ensuite. Trois petits paragraphes suffisent.",
        "Écrivez les mots en entier, pas en langage SMS, et dites s'il vous plaît et merci.",
      ],
      mistake: "Écrire en style SMS (« stp », « bjr », « jveux ») ou TOUT EN MAJUSCULES, ce qui donne l'impression de crier.",
      task: {
        type: "fixText",
        instruction: "Réécrivez ce message pour qu'il soit poli et clair. Demandez des informations sur le poste.",
        initial: "stp jveux le travail envoi moi les infos vite",
        multiline: true,
        rules: [
          { kind: "changed", message: "Réécrivez le message avec vos propres mots." },
          { kind: "excludesAll", words: ["stp", "svp", "jveux", "vite", "bjr", "slt", "mrc"], message: "Remplacez les mots SMS (stp, jveux, mrc) et « vite » par des mots complets et polis." },
          { kind: "includesAny", words: ["s'il vous plaît", "s’il vous plaît", "pourriez-vous", "pourriez vous", "je vous prie", "merci de bien vouloir", "auriez-vous"], message: "Demandez poliment, par exemple « Pourriez-vous m'envoyer… »." },
          { kind: "includesAny", words: ["merci", "remercie"], message: "Remerciez le lecteur à la fin." },
          { kind: "minWords", n: 12, message: "Ajoutez un peu plus : dites ce que vous voulez et pourquoi (au moins 12 mots)." },
          { kind: "maxWords", n: 90, message: "Faites court : moins de 90 mots." },
          { kind: "regex", pattern: "^(?![^a-zà-ÿ]*$)", message: "N'écrivez pas tout en majuscules." },
        ],
        success: "Poli et clair. C'est ainsi qu'écrivent les professionnels.",
      },
    },
    // 10
    {
      title: "Nommer et joindre un fichier",
      illustration: "email-10-attach",
      body: [
        "Avant de joindre un fichier, donnez-lui un nom clair, par exemple Nkeng_Ateh_CV.pdf, pas scan0012.pdf.",
        "Envoyez vos documents en PDF. Touchez le trombone pour joindre, et vérifiez que le fichier apparaît avant d'envoyer.",
      ],
      mistake: "Écrire « veuillez trouver mon CV ci-joint » et oublier de le joindre. Vérifiez toujours avant d'appuyer sur Envoyer.",
      task: {
        type: "compose",
        instruction: "Aidez Nkeng à envoyer son CV à rh@sawalogistics.cm. Joignez le fichier bien nommé et écrivez un objet court.",
        files: ["scan0012.pdf", "Nkeng_Ateh_CV.pdf", "photo.jpg"],
        rules: [
          { kind: "validEmail", field: "to", message: "L'adresse « À » n'est pas valide. Elle doit ressembler à nom@entreprise.cm." },
          { kind: "equals", field: "to", value: "rh@sawalogistics.cm", message: "Envoyez-le à rh@sawalogistics.cm." },
          { kind: "notEmpty", field: "subject", message: "Ajoutez un objet, par exemple « CV – Nkeng Ateh »." },
          { kind: "attachment", file: "Nkeng_Ateh_CV.pdf", message: "Joignez le fichier bien nommé : Nkeng_Ateh_CV.pdf." },
          { kind: "noAttachment", file: "scan0012.pdf", message: "Retirez scan0012.pdf. Son nom ne dit pas au lecteur ce que c'est." },
          { kind: "greeting", message: "Commencez le message par une formule d'appel, par exemple « Madame, Monsieur, »." },
        ],
        success: "Envoyé ! Le bon fichier, un nom clair et un objet.",
      },
      variants: [
        {
          type: "compose",
          instruction: "Aidez Nkeng à envoyer son CV à recrutement@mbokoconsulting.cm. Joignez le fichier bien nommé et écrivez un objet court.",
          files: ["Document1.pdf", "IMG_4471.jpg", "Nkeng_Ateh_CV.pdf"],
          rules: [
            { kind: "validEmail", field: "to", message: "L'adresse « À » n'est pas valide. Elle doit ressembler à nom@entreprise.cm." },
            { kind: "equals", field: "to", value: "recrutement@mbokoconsulting.cm", message: "Envoyez-le à recrutement@mbokoconsulting.cm." },
            { kind: "notEmpty", field: "subject", message: "Ajoutez un objet, par exemple « CV – Nkeng Ateh »." },
            { kind: "attachment", file: "Nkeng_Ateh_CV.pdf", message: "Joignez le fichier bien nommé : Nkeng_Ateh_CV.pdf." },
            { kind: "noAttachment", file: "Document1.pdf", message: "Retirez Document1.pdf. Son nom ne dit pas au lecteur ce que c'est." },
            { kind: "noAttachment", file: "IMG_4471.jpg", message: "Retirez la photo. Seul le CV est demandé." },
            { kind: "greeting", message: "Commencez le message par une formule d'appel, par exemple « Madame, Monsieur, »." },
          ],
          success: "Envoyé ! Le bon fichier, un nom clair et un objet.",
        },
      ],
    },
    // 11
    {
      title: "Partager de gros fichiers avec un lien Drive",
      illustration: "email-11-drive",
      body: [
        "Les pièces jointes Gmail sont limitées à 25 Mo. Pour les fichiers plus lourds, mettez-les sur Google Drive et partagez un lien.",
        "Dans Drive, touchez Partager, choisissez « Tous les utilisateurs disposant du lien » en mode Lecteur, puis collez le lien dans votre e-mail.",
      ],
      mistake: "Partager en mode « Éditeur ». N'importe qui ayant le lien pourrait modifier ou supprimer votre fichier.",
      task: {
        type: "multipleChoice",
        question: "Votre portfolio pèse 60 Mo. Comment l'envoyez-vous à un recruteur ?",
        options: [
          "Je le joins quand même et j'espère que ça passe",
          "Je le mets sur Drive et je partage un lien en mode Lecteur dans l'e-mail",
          "Je l'envoie sur WhatsApp au numéro général de l'entreprise",
          "Je le partage en mode Éditeur pour qu'ils puissent l'ouvrir",
        ],
        answer: 1,
        explanation: "Un lien Drive en mode Lecteur fonctionne quelle que soit la taille et protège votre fichier des modifications.",
      },
    },
    // 12
    {
      title: "Répondre, Répondre à tous, Transférer",
      illustration: "email-12-reply",
      body: [
        "Répondre envoie votre réponse seulement à l'expéditeur. Répondre à tous l'envoie à l'expéditeur et à tous ceux en À et Cc.",
        "Transférer envoie l'e-mail à une nouvelle personne, avec les pièces jointes.",
      ],
      mistake: "Utiliser « Répondre à tous » pour dire « Merci » ou « OK ». Tout le monde reçoit votre message pour rien.",
      task: {
        type: "multipleChoice",
        question: "Votre responsable a écrit à 20 collègues au sujet de la réunion de demain. Vous voulez dire seulement à votre responsable que vous aurez 10 minutes de retard. Que choisissez-vous ?",
        options: ["Répondre", "Répondre à tous", "Transférer", "Écrire un nouvel e-mail aux 20 personnes"],
        answer: 0,
        explanation: "« Répondre » envoie votre réponse seulement à votre responsable. Les 19 autres n'en ont pas besoin.",
      },
    },
    // 13
    {
      title: "Créer une signature",
      illustration: "email-13-signature",
      body: [
        "La signature s'ajoute à la fin de chaque e-mail. Application Gmail : Paramètres › votre compte › Signature mobile.",
        "Restez simple : votre nom complet, ce que vous faites ou voulez faire, et votre numéro de téléphone.",
      ],
      mistake: "Garder « Envoyé de mon téléphone » comme seule signature, ou ajouter de longues citations et de grandes images.",
      task: {
        type: "fixText",
        instruction: "Remplacez « Envoyé de mon téléphone » par une signature simple : votre nom sur une ligne, puis votre rôle ou objectif, puis votre numéro (ex. +237 6XX XX XX XX).",
        initial: "Envoyé de mon téléphone",
        multiline: true,
        rules: [
          { kind: "excludesAll", words: ["envoyé de mon", "envoye de mon"], message: "Retirez « Envoyé de mon téléphone »." },
          { kind: "minWords", n: 3, message: "Écrivez votre nom complet et votre rôle ou objectif." },
          { kind: "regex", pattern: "\\n\\s*\\S", message: "Mettez chaque élément sur sa propre ligne." },
          { kind: "regex", pattern: "(\\+?237[\\s.-]?)?6([\\s.-]?\\d){8}", message: "Ajoutez votre numéro, par exemple +237 6XX XX XX XX." },
        ],
        success: "Votre signature fait professionnelle. Ajoutez-la dans les paramètres Gmail dès aujourd'hui.",
      },
    },
    // 14
    {
      title: "Repérer les arnaques et les fausses offres d'emploi",
      illustration: "email-14-scam",
      body: [
        "Signaux d'alerte : on vous demande de payer pour un emploi, l'expéditeur utilise une adresse gratuite ou bizarre, on vous presse, ou on demande votre mot de passe ou un code.",
        "Un vrai employeur ne vous demande jamais de payer pour obtenir un emploi.",
      ],
      mistake: "Cliquer sur un lien dans un e-mail qui dit que votre compte « va être fermé ». Ouvrez plutôt Gmail vous-même.",
      task: {
        type: "inbox",
        emails: [
          { id: "realhr", from: "Sawa Logistics RH", fromEmail: "rh@sawalogistics.cm", subject: "Nous avons bien reçu votre candidature", preview: "Merci d'avoir postulé au poste d'assistant de bureau…", body: "Madame,\n\nMerci d'avoir postulé au poste d'assistante de bureau. Nous contacterons les candidats retenus d'ici deux semaines.\n\nCordialement,\nService RH", time: "10:05" },
          { id: "fakejob", from: "Global Oil Recrutement", fromEmail: "globaloil.emplois2024@gmail.com", subject: "Félicitations, vous êtes RECRUTÉ(E) !", preview: "Payez 25 000 FCFA de frais d'inscription pour commencer…", body: "Félicitations ! Vous avez été sélectionné(e) pour un emploi avec un salaire de 850 000 FCFA. Pour confirmer, payez 25 000 FCFA de frais d'inscription par mobile money dans les 24 heures.", time: "09:30" },
          { id: "school", from: "Centre de Formation Sawa", fromEmail: "info@sawatraining.cm", subject: "Attestation disponible", preview: "Votre attestation est disponible à l'accueil…", body: "Cher apprenant, votre attestation est prête. Vous pouvez la retirer à l'accueil à partir de lundi.", time: "Hier" },
          { id: "phish", from: "Équipe Sécurité du Compte", fromEmail: "securite@gmai1-support.com", subject: "Votre compte sera fermé dans 24 heures", preview: "Cliquez ici et saisissez votre mot de passe pour vérifier…", body: "Nous avons détecté un problème. Votre compte sera FERMÉ dans 24 heures. Cliquez ici et saisissez le mot de passe de votre e-mail pour vérifier votre identité.", time: "Hier" },
        ],
        goals: [
          { action: "spam", target: "fakejob", instruction: "Un e-mail est une fausse offre d'emploi. Ouvrez-le et signalez-le comme spam.", wrong: "Cet e-mail est vrai : il vient d'une adresse d'entreprise et ne demande rien d'anormal.", done: "Exact. Demander des frais et utiliser une adresse Gmail gratuite sont de gros signaux d'alerte." },
          { action: "spam", target: "phish", instruction: "Un autre e-mail essaie de voler votre mot de passe. Trouvez-le et signalez-le comme spam.", wrong: "Cet e-mail est vrai : il vient d'une adresse d'entreprise et ne demande rien d'anormal.", done: "Exact. Regardez l'adresse : « gmai1 » avec le chiffre 1, pas Gmail." },
        ],
        success: "Vous avez repéré les deux arnaques. Vérifiez toujours l'expéditeur et ne payez jamais pour obtenir un emploi.",
      },
      variants: [
        {
          type: "inbox",
          emails: [
            { id: "bank", from: "Service Clients", fromEmail: "alerte@banque-securisee-cm.info", subject: "URGENT : votre compte est bloqué", preview: "Envoyez votre code PIN et numéro de carte pour débloquer…", body: "Cher client, votre compte bancaire est BLOQUÉ. Répondez avec votre code PIN et votre numéro de carte dans les 2 heures pour le débloquer.", time: "11:20" },
            { id: "interview", from: "Mboko Consulting", fromEmail: "recrutement@mbokoconsulting.cm", subject: "Entretien mardi", preview: "Nous souhaitons vous rencontrer mardi à 9 h…", body: "Madame,\n\nNous souhaitons vous rencontrer mardi à 9 h dans nos bureaux de Bastos, Yaoundé. Merci de confirmer en répondant à cet e-mail.\n\nCordialement,\nRH", time: "10:02" },
            { id: "visa", from: "Programme Emplois Canada", fromEmail: "emploiscanada.programme@yahoo.com", subject: "Vous êtes sélectionné(e) pour travailler au Canada !", preview: "Envoyez 150 000 FCFA pour votre visa et votre billet…", body: "Félicitations ! Vous avez été sélectionné(e) pour un emploi au Canada avec visa gratuit. Envoyez 150 000 FCFA de frais de dossier au numéro ci-dessous aujourd'hui.", time: "Hier" },
            { id: "friend", from: "Brenda Tanyi", fromEmail: "brenda.tanyi@gmail.com", subject: "Notes du cours", preview: "Voici les notes que tu m'as demandées…", body: "Salut Nkeng, voici les notes que tu m'as demandées. À demain !", time: "Lun" },
          ],
          goals: [
            { action: "spam", target: "visa", instruction: "Un e-mail est une fausse offre d'emploi à l'étranger. Ouvrez-le et signalez-le comme spam.", wrong: "Cet e-mail est vrai : l'expéditeur est connu et ne demande rien d'anormal.", done: "Exact. Un vrai employeur ne demande jamais de payer pour un emploi ou un visa." },
            { action: "spam", target: "bank", instruction: "Un autre e-mail essaie de voler vos données bancaires. Trouvez-le et signalez-le comme spam.", wrong: "Cet e-mail est vrai : l'expéditeur est connu et ne demande rien d'anormal.", done: "Exact. Une banque ne demande jamais votre code PIN par e-mail." },
          ],
          success: "Vous avez repéré les deux arnaques. Vérifiez toujours l'expéditeur et ne payez jamais pour obtenir un emploi.",
        },
      ],
    },
    // 15
    {
      title: "Épreuve finale : envoyer une vraie candidature complète",
      illustration: "email-15-success",
      body: [
        "Utilisez tout ce que vous avez appris : bonne adresse, objet clair, formule d'appel, message court et poli, formule de politesse et CV joint.",
      ],
      task: {
        type: "compose",
        instruction: "Postulez à cette offre en votre propre nom.",
        context: "OFFRE : Assistant(e) de bureau chez Sawa Logistics, Douala.\nEnvoyez votre candidature avec votre CV à jobs@sawalogistics.cm.\nMettez en copie (Cc) le responsable : m.ebai@sawalogistics.cm.",
        files: ["CV.pdf", "photo.jpg"],
        rules: [
          { kind: "validEmail", field: "to", message: "L'adresse « À » n'est pas valide." },
          { kind: "equals", field: "to", value: "jobs@sawalogistics.cm", message: "Envoyez-la à l'adresse de l'offre : jobs@sawalogistics.cm." },
          { kind: "validEmail", field: "cc", message: "L'adresse « Cc » n'est pas valide." },
          { kind: "equals", field: "cc", value: "m.ebai@sawalogistics.cm", message: "Mettez le responsable en Cc : m.ebai@sawalogistics.cm." },
          { kind: "notEmpty", field: "subject", message: "Ajoutez un objet." },
          { kind: "includesAny", field: "subject", words: ["candidature", "postuler", "application"], message: "Dites dans l'objet qu'il s'agit d'une candidature." },
          { kind: "includesAny", field: "subject", words: ["assistant de bureau", "assistante de bureau", "assistant(e) de bureau"], message: "Nommez le poste dans l'objet : assistant(e) de bureau." },
          { kind: "excludesAll", field: "subject", words: ["urgent", "bonjour", "svp", "stp"], message: "Retirez « urgent », « bonjour » ou « svp » de l'objet." },
          { kind: "greeting", message: "Commencez par une formule d'appel, par exemple « Madame, Monsieur, »." },
          { kind: "includesAny", field: "body", words: ["ci-joint", "ci-jointe", "pièce jointe", "en pièce jointe", "attached"], message: "Indiquez que votre CV est joint (« ci-joint »)." },
          { kind: "minWords", field: "body", n: 30, message: "Votre message est trop court. Dites qui vous êtes et pourquoi vous voulez ce poste (au moins 30 mots)." },
          { kind: "maxWords", field: "body", n: 200, message: "Votre message est trop long. Restez sous 200 mots." },
          { kind: "excludesAll", field: "body", words: ["stp", "svp", "bjr", "slt", "mrc", "jveux"], message: "Remplacez les mots SMS (stp, bjr, mrc) par des mots complets." },
          { kind: "closing", message: "Terminez par une formule de politesse comme « Cordialement, » suivie de votre nom." },
          { kind: "attachment", file: "CV.pdf", message: "Joignez votre CV.pdf." },
          { kind: "noAttachment", file: "photo.jpg", message: "Retirez photo.jpg. L'offre demande seulement votre CV." },
        ],
        success: "Excellent ! C'est une candidature complète et professionnelle.",
      },
      variants: [
        {
          type: "compose",
          instruction: "Postulez à cette offre en votre propre nom.",
          context: "OFFRE : Agent(e) service client chez Mboa Services, Yaoundé.\nEnvoyez votre candidature avec votre CV à careers@mboaservices.cm.\nMettez en copie (Cc) la responsable RH : hr.manager@mboaservices.cm.",
          files: ["CV.pdf", "photo.jpg"],
          rules: [
            { kind: "validEmail", field: "to", message: "L'adresse « À » n'est pas valide." },
            { kind: "equals", field: "to", value: "careers@mboaservices.cm", message: "Envoyez-la à l'adresse de l'offre : careers@mboaservices.cm." },
            { kind: "validEmail", field: "cc", message: "L'adresse « Cc » n'est pas valide." },
            { kind: "equals", field: "cc", value: "hr.manager@mboaservices.cm", message: "Mettez la responsable RH en Cc : hr.manager@mboaservices.cm." },
            { kind: "notEmpty", field: "subject", message: "Ajoutez un objet." },
            { kind: "includesAny", field: "subject", words: ["candidature", "postuler", "application"], message: "Dites dans l'objet qu'il s'agit d'une candidature." },
            { kind: "includesAny", field: "subject", words: ["service client", "service clientèle"], message: "Nommez le poste dans l'objet : agent(e) service client." },
            { kind: "excludesAll", field: "subject", words: ["urgent", "bonjour", "svp", "stp"], message: "Retirez « urgent », « bonjour » ou « svp » de l'objet." },
            { kind: "greeting", message: "Commencez par une formule d'appel, par exemple « Madame, Monsieur, »." },
            { kind: "includesAny", field: "body", words: ["ci-joint", "ci-jointe", "pièce jointe", "en pièce jointe", "attached"], message: "Indiquez que votre CV est joint (« ci-joint »)." },
            { kind: "minWords", field: "body", n: 30, message: "Votre message est trop court. Dites qui vous êtes et pourquoi vous voulez ce poste (au moins 30 mots)." },
            { kind: "maxWords", field: "body", n: 200, message: "Votre message est trop long. Restez sous 200 mots." },
            { kind: "excludesAll", field: "body", words: ["stp", "svp", "bjr", "slt", "mrc", "jveux"], message: "Remplacez les mots SMS (stp, bjr, mrc) par des mots complets." },
            { kind: "closing", message: "Terminez par une formule de politesse comme « Cordialement, » suivie de votre nom." },
            { kind: "attachment", file: "CV.pdf", message: "Joignez votre CV.pdf." },
            { kind: "noAttachment", file: "photo.jpg", message: "Retirez photo.jpg. L'offre demande seulement votre CV." },
          ],
          success: "Excellent ! C'est une candidature complète et professionnelle.",
        },
      ],
    },
  ],
  assessment: {
    passMark: 7,
    warmup: [0, 3, 4, 6, 9],
    questions: [
      { step: 2, question: "Quelle adresse est la meilleure pour une candidature ?", options: ["grandboss237@gmail.com", "paul.nji@gmail.com", "doux.paul@gmail.com", "pn2000xx@gmail.com"], answer: 1 },
      { step: 4, question: "Quelqu'un sur WhatsApp vous demande le code que Google vient de vous envoyer par SMS. Que faites-vous ?", options: ["Je l'envoie vite", "J'en envoie la moitié", "Je ne l'envoie jamais et je change mon mot de passe", "Je l'envoie s'il dit travailler chez Google"], answer: 2 },
      { step: 5, question: "Que fait « Archiver » sur un e-mail ?", options: ["Le supprime pour toujours", "Le retire de la boîte de réception mais le garde", "L'envoie dans les spams", "Le transfère à votre chef"], answer: 1 },
      { step: 6, question: "Vous écrivez à 40 parents et ne voulez pas qu'ils voient les adresses des autres. Où mettez-vous leurs adresses ?", options: ["À", "Cc", "Cci", "Objet"], answer: 2 },
      { step: 7, question: "Quel objet est le meilleur ?", options: ["Bonjour", "URGENT svp lisez", "Candidature au poste de comptable – Paul Nji", "(aucun objet)"], answer: 2 },
      { step: 8, question: "Vous écrivez en français à un recruteur que vous ne connaissez pas. Quelle formule d'appel choisir ?", options: ["Slt !", "Madame, Monsieur,", "Yo chef,", "Coucou,"], answer: 1 },
      { step: 10, question: "Quel nom de fichier est le meilleur pour votre CV ?", options: ["scan0012.pdf", "CV_final_final2.pdf", "Paul_Nji_CV.pdf", "document.pdf"], answer: 2 },
      { step: 11, question: "Votre fichier pèse 60 Mo. Comment l'envoyer ?", options: ["Je le joins quand même", "Je le mets sur Drive et partage un lien en mode Lecteur", "Je le partage en mode Éditeur", "Je le coupe en 10 e-mails"], answer: 1 },
      { step: 12, question: "Votre chef a écrit à toute l'équipe. Vous voulez répondre seulement à votre chef. Que choisissez-vous ?", options: ["Répondre", "Répondre à tous", "Transférer", "Nouvel e-mail à tout le monde"], answer: 0 },
      { step: 14, question: "Une « offre d'emploi » vous demande de payer 20 000 FCFA d'inscription. Qu'est-ce que c'est ?", options: ["Une étape normale", "Une arnaque : je la signale comme spam", "Une bonne affaire", "Un message du gouvernement"], answer: 1 },
    ],
  },
  mission: {
    kind: "email",
    intro: "Dernière étape : prouvez que vous savez le faire pour de vrai. Envoyez une candidature depuis votre propre Gmail à notre recruteur test.",
    steps: [
      "Écrivez l'adresse Gmail que vous allez utiliser.",
      "Ouvrez Gmail sur votre téléphone et écrivez un nouvel e-mail à l'adresse ci-dessous.",
      "Écrivez un objet clair, par exemple « Candidature au poste d'assistant(e) de bureau – votre nom ».",
      "Écrivez une formule d'appel, un message court et poli, une formule de politesse et votre signature avec votre numéro.",
      "Joignez votre CV en PDF avec un nom clair, par exemple Prenom_Nom_CV.pdf. Si vous n'avez pas encore de CV, joignez n'importe quel PDF nommé ainsi.",
      "Appuyez sur Envoyer, puis revenez ici. Nous vérifions automatiquement.",
    ],
    subjectWords: ["candidature", "postuler", "application"],
    messages: {
      gmail: "Envoyez depuis l'adresse Gmail que vous avez saisie ici.",
      nickname: "Votre adresse ressemble à un surnom. Pour le travail, utilisez une adresse avec votre vrai nom.",
      subject: "Votre objet doit indiquer une candidature, ex. « Candidature au poste d'assistant(e) de bureau – votre nom ».",
      pdf: "Joignez votre CV en fichier PDF.",
      fileName: "Donnez un nom clair à votre PDF, ex. Prenom_Nom_CV.pdf, pas scan ou document.",
      greeting: "Commencez votre message par une formule d'appel, ex. « Madame, Monsieur, ».",
      closing: "Terminez par une formule de politesse comme « Cordialement, ».",
      signature: "Ajoutez à la fin une signature avec votre nom et votre numéro de téléphone.",
      length: "Votre message est trop court. Dites qui vous êtes et pourquoi vous voulez ce poste (au moins 30 mots).",
    },
  },
};

export default course;
