// Hand-written EN/FR translations for Metropolitan Community College
// Structure: window.MCC_TRANSLATIONS[group][key] = { en: "...", fr: "..." }
// Lookup keys via dot notation, e.g. data-i18n="common.nav_about"

window.MCC_TRANSLATIONS = {
    common: {
        // Top bar
        topbar_portal: { en: "MCC Portal", fr: "Portail MCC" },
        topbar_contact: { en: "Contact", fr: "Contact" },
        topbar_apply: { en: "Apply", fr: "Postuler" },

        // Main navigation
        nav_about: { en: "About", fr: "À propos" },
        nav_about_overview: { en: "About Overview", fr: "Présentation" },
        nav_mission: { en: "Mission Statement", fr: "Énoncé de mission" },
        nav_advantage: { en: "MCC Advantage", fr: "L'avantage MCC" },
        nav_policies: { en: "Policies", fr: "Politiques" },
        nav_alumni: { en: "Alumni", fr: "Anciens élèves" },
        nav_agent_coop: { en: "Agent Cooperation", fr: "Coopération avec les agents" },

        nav_programs: { en: "Programs", fr: "Programmes" },
        nav_micro: { en: "Micro Certificate Programs", fr: "Programmes de microcertificat" },
        nav_program_ai: { en: "AI Microcredential", fr: "Microcertificat en IA" },
        nav_program_caregiver_senior: { en: "Caregiver — Senior", fr: "Aide-soignant·e — Personnes âgées" },
        nav_program_caregiver_infant: { en: "Caregiver — Infant", fr: "Aide-soignant·e — Petite enfance" },
        nav_program_video: { en: "Video & Content Creation", fr: "Vidéo et création de contenu" },
        nav_program_business: { en: "Business Communication", fr: "Communication d'affaires" },
        nav_esl: { en: "English (ESL) Programs", fr: "Programmes d'anglais (ALS)" },
        nav_french: { en: "French Programs", fr: "Programmes de français" },
        nav_french_language: { en: "French Language", fr: "Langue française" },
        nav_french_tcf: { en: "TCF Canada", fr: "TCF Canada" },
        nav_french_tef: { en: "TEF Canada", fr: "TEF Canada" },
        nav_diploma: { en: "Diploma Programs", fr: "Programmes de diplôme" },
        nav_program_esports: { en: "International Esports Management Diploma", fr: "Diplôme en gestion internationale de l'esport" },
        nav_program_hospitality: { en: "Hospitality Operations Diploma", fr: "Diplôme en opérations hôtelières" },
        nav_program_global_hosp: { en: "Global Management in Hospitality Diploma", fr: "Diplôme en gestion internationale en hôtellerie" },

        nav_admissions: { en: "Admissions", fr: "Admissions" },
        nav_admissions_overview: { en: "Admissions Overview", fr: "Aperçu des admissions" },
        nav_admission_procedure: { en: "Admission Procedure", fr: "Procédure d'admission" },
        nav_admission_requirements: { en: "Admission Requirements", fr: "Conditions d'admission" },
        nav_tuition: { en: "Tuition, Fees & Payments", fr: "Frais de scolarité et paiements" },
        nav_international: { en: "International Students", fr: "Étudiants internationaux" },
        nav_apply: { en: "Apply for Admissions", fr: "Postuler aux admissions" },

        nav_student_life: { en: "Student Life", fr: "Vie étudiante" },
        nav_student_life_hub: { en: "Student Life Hub", fr: "Carrefour de la vie étudiante" },
        nav_academic_calendar: { en: "Academic Calendar", fr: "Calendrier scolaire" },
        nav_academic_support: { en: "Academic Support", fr: "Soutien scolaire" },
        nav_career_services: { en: "Career Services", fr: "Services de carrière" },
        nav_financial_aid: { en: "Financial Aid", fr: "Aide financière" },
        nav_housing: { en: "Housing", fr: "Logement" },
        nav_health_safety: { en: "Health & Safety", fr: "Santé et sécurité" },
        nav_arrival: { en: "Arrival in Canada", fr: "Arrivée au Canada" },
        nav_living_vancouver: { en: "Living in Vancouver", fr: "Vivre à Vancouver" },
        nav_community: { en: "Community Integration", fr: "Intégration communautaire" },

        nav_newsletter: { en: "Newsletter", fr: "Bulletin" },

        // Common buttons / labels
        btn_apply_now: { en: "Apply Now", fr: "Postuler maintenant" },
        btn_learn_more: { en: "Learn more", fr: "En savoir plus" },
        btn_contact_advisor: { en: "Talk to an Advisor", fr: "Parler à un conseiller" },
        btn_view_requirements: { en: "View Requirements", fr: "Voir les conditions" },
        btn_book_assessment: { en: "Book a Free French Level Assessment", fr: "Réserver une évaluation gratuite de niveau de français" },
        btn_back: { en: "Back", fr: "Retour" },
        btn_continue: { en: "Continue", fr: "Continuer" },

        // Footer
        footer_quick_links: { en: "Quick Links", fr: "Liens rapides" },
        footer_explore: { en: "Explore MCC", fr: "Explorer MCC" },
        footer_contact_heading: { en: "Contact Us", fr: "Nous contacter" },
        footer_news_newsletter: { en: "News & Newsletter", fr: "Actualités et bulletin" },
        footer_address: { en: "322 Water St #100, Vancouver, BC, V6B 1B6, Canada", fr: "322 Water St #100, Vancouver, C.-B., V6B 1B6, Canada" },
        footer_hours: { en: "Monday - Friday, 9:00 AM - 5:00 PM", fr: "Du lundi au vendredi, de 9 h à 17 h" },
        footer_copyright: { en: "© 2026 Metropolitan Community College. All rights reserved.", fr: "© 2026 Metropolitan Community College. Tous droits réservés." },
        footer_microcredentials: { en: "Microcredentials", fr: "Microcertificats" },
        footer_diploma: { en: "Diploma Programs", fr: "Programmes de diplôme" },
        footer_esl: { en: "English (ESL)", fr: "Anglais (ALS)" },
        footer_french_language: { en: "French Language", fr: "Langue française" },
        footer_about_mcc: { en: "About MCC", fr: "À propos de MCC" },
        footer_contact_us_link: { en: "Contact Us", fr: "Nous contacter" },
        footer_address_line: { en: "322 Water St #100, Vancouver, BC, V6B 1B6, Canada", fr: "322 Water St #100, Vancouver, C.-B., V6B 1B6, Canada" }
    },

    home: {
        // Hero
        hero_eyebrow: { en: "Future Students | Vancouver, BC", fr: "Futurs étudiants | Vancouver, C.-B." },
        hero_title_html: {
            en: 'Study what you love. Build what comes next with <span class="text-gold typewriter">Learning</span><span class="cursor">|</span>',
            fr: 'Étudiez ce que vous aimez. Construisez la suite avec <span class="text-gold typewriter">l\'apprentissage</span><span class="cursor">|</span>'
        },
        hero_subtitle: {
            en: "MCC combines practical teaching, clear admissions support, and a student-first campus experience for learners who want momentum from day one.",
            fr: "MCC allie un enseignement pratique, un accompagnement clair à l'admission et une expérience centrée sur l'étudiant, pour celles et ceux qui veulent avancer dès le premier jour."
        },
        hero_cta_find: { en: "Find Your Program", fr: "Trouvez votre programme" },
        hero_cta_apply: { en: "Apply Now", fr: "Postuler maintenant" },
        hero_proof_apps: { en: "Fall 2026 applications open", fr: "Candidatures ouvertes pour l'automne 2026" },
        hero_proof_accred: { en: "<img class=\"accreditation-logo\" src=\"assets/ptib-designated.jpg\" alt=\"PTIB Designated logo\"><img class=\"accreditation-logo\" src=\"assets/eqa-logo.png\" alt=\"BC EQA logo\"> PTIB accredited and BC EQA designated", fr: "<img class=\"accreditation-logo\" src=\"assets/ptib-designated.jpg\" alt=\"Logo PTIB désigné\"><img class=\"accreditation-logo\" src=\"assets/eqa-logo.png\" alt=\"Logo BC EQA\"> Accrédité PTIB et désigné BC EQA" },
        hero_proof_intl: { en: "International student support available", fr: "Soutien aux étudiants internationaux disponible" },
        hero_note_strong: { en: "Why students choose MCC", fr: "Pourquoi les étudiants choisissent MCC" },
        hero_note_p: {
            en: "Small cohorts, accessible advising, and programs connected to fast-moving industries from AI and digital media to care, hospitality, and esports.",
            fr: "Cohortes à taille humaine, conseils accessibles, et programmes connectés à des industries en mouvement, de l'IA et des médias numériques aux soins, à l'hôtellerie et à l'esport."
        },
        hero_float1_strong: { en: "6+ career-ready programs", fr: "6+ programmes prêts pour la carrière" },
        hero_float1_span: {
            en: "Build skills for high-growth sectors with applied, practical learning.",
            fr: "Développez des compétences pour des secteurs en forte croissance grâce à un apprentissage appliqué et pratique."
        },
        hero_float2_strong: { en: "Admissions made clear", fr: "Une admission limpide" },
        hero_float2_span: {
            en: "Requirements, tuition planning, application steps, and support all mapped in one place.",
            fr: "Conditions, planification des frais, étapes de candidature et soutien : tout est réuni au même endroit."
        },

        // Proof strip
        proof_label_programs: { en: "Programs", fr: "Programmes" },
        proof_label_satisfaction: { en: "Student Satisfaction", fr: "Satisfaction étudiante" },
        proof_label_countries: { en: "Countries Represented", fr: "Pays représentés" },
        proof_label_intake: { en: "Upcoming Intake", fr: "Prochaine rentrée" },
        proof_value_intake: { en: "Fall 2026", fr: "Automne 2026" },
        proof_p_programs: { en: "Career-ready programs built around practical outcomes.", fr: "Des programmes prêts pour la carrière, construits autour de résultats concrets." },
        proof_p_satisfaction: { en: "Supportive advising and small-campus attention from inquiry to intake.", fr: "Un accompagnement bienveillant et l'attention d'un petit campus, de la première question à l'inscription." },
        proof_p_countries: { en: "A global student community studying in downtown Vancouver.", fr: "Une communauté étudiante internationale qui étudie au centre-ville de Vancouver." },
        proof_p_intake: { en: "Applications are now open for students ready to plan their next step.", fr: "Les candidatures sont ouvertes pour les étudiants prêts à préparer la suite." },

        // Spotlight (Open House)
        spot_kicker: { en: "Featured Event", fr: "Événement à la une" },
        spot_title: { en: "Admissions Open House for Fall 2026", fr: "Journée portes ouvertes des admissions — automne 2026" },
        spot_copy: {
            en: "Meet advisors, compare programs, review requirements, and understand your next steps before you apply. This is the fastest way to move from interest to a confident decision.",
            fr: "Rencontrez les conseillers, comparez les programmes, vérifiez les conditions et comprenez vos prochaines étapes avant de postuler. C'est la voie la plus rapide pour passer de la curiosité à une décision éclairée."
        },
        spot_tag1: { en: "Program advising", fr: "Conseils sur les programmes" },
        spot_tag2: { en: "International guidance", fr: "Accompagnement international" },
        spot_tag3: { en: "Application planning", fr: "Préparation à la candidature" },
        spot_btn_start: { en: "Start Your Application", fr: "Commencer votre candidature" },
        spot_btn_explore: { en: "Explore Admissions", fr: "Explorer les admissions" },

        // Pathways
        pathways_kicker: { en: "Programs and Pathways", fr: "Programmes et parcours" },
        pathways_title: { en: "Choose a path with a clear destination", fr: "Choisissez un parcours qui mène quelque part de précis" },
        pathways_copy: {
            en: "We organize learning around career outcomes, applied practice, and student confidence. Explore the program group that best matches the future you want to build.",
            fr: "Nous organisons l'apprentissage autour des résultats de carrière, de la pratique appliquée et de la confiance des étudiants. Explorez le groupe de programmes qui correspond le mieux à l'avenir que vous voulez bâtir."
        },
        path1_title: { en: "Technology and Creative Media", fr: "Technologie et médias créatifs" },
        path1_p: { en: "For students who want modern digital skills with visible portfolios and job-ready tools.", fr: "Pour les étudiants qui veulent des compétences numériques modernes, des portfolios visibles et des outils prêts pour le marché du travail." },
        path1_li1: { en: "AI Microcredential for emerging workflow and automation skills", fr: "Microcertificat en IA pour les compétences émergentes en automatisation et flux de travail" },
        path1_li2: { en: "Video & Content Creation for digital storytelling and production", fr: "Vidéo et création de contenu pour la narration numérique et la production" },
        path1_li3: { en: "Project-based learning with clear portfolio outcomes", fr: "Apprentissage par projets avec des livrables clairs pour le portfolio" },
        path1_link: { en: "Explore media and tech programs", fr: "Explorer les programmes média et technologie" },
        path2_title: { en: "Care and Community Support", fr: "Soins et soutien communautaire" },
        path2_p: { en: "For students preparing for people-focused careers rooted in responsibility, service, and practical care.", fr: "Pour les étudiants qui se préparent à des carrières centrées sur l'humain, ancrées dans la responsabilité, le service et les soins pratiques." },
        path2_li1: { en: "Caregiver Senior and Caregiver Infant pathways", fr: "Parcours Aide-soignant·e — Personnes âgées et Petite enfance" },
        path2_li2: { en: "Hands-on training and real-world support preparation", fr: "Formation pratique et préparation au soutien en situation réelle" },
        path2_li3: { en: "Built for students seeking meaningful community impact", fr: "Conçu pour les étudiants qui cherchent un impact significatif dans la communauté" },
        path2_link: { en: "View entry requirements", fr: "Voir les conditions d'admission" },
        path3_title: { en: "Hospitality, Esports, and Emerging Industries", fr: "Hôtellerie, esport et industries émergentes" },
        path3_p: { en: "For learners who want industry-connected training in sectors shaped by customer experience, operations, and fast-moving culture.", fr: "Pour les apprenants qui veulent une formation connectée à l'industrie dans des secteurs marqués par l'expérience client, les opérations et une culture en mouvement." },
        path3_li1: { en: "Hospitality Operations Diploma with service and operations focus", fr: "Diplôme en opérations hôtelières axé sur le service et les opérations" },
        path3_li2: { en: "International Esports Management Diploma for one of Canada's most distinctive pathways", fr: "Diplôme en gestion internationale de l'esport, l'un des parcours les plus distinctifs au Canada" },
        path3_li3: { en: "Career support for students entering high-energy industries", fr: "Soutien à la carrière pour les étudiants qui entrent dans des industries dynamiques" },
        path3_link: { en: "See career support", fr: "Voir le soutien à la carrière" },

        // Student Experience
        exp_kicker: { en: "Student Experience", fr: "Expérience étudiante" },
        exp_title: { en: "Support that keeps your momentum moving", fr: "Un accompagnement qui maintient votre élan" },
        exp_copy: {
            en: "A strong homepage should not just inspire. It should answer the next questions students actually have once they are interested.",
            fr: "Une bonne page d'accueil ne doit pas seulement inspirer. Elle doit répondre aux questions concrètes que les étudiants se posent dès qu'ils s'intéressent à l'école."
        },
        exp1_kicker: { en: "International Support", fr: "Soutien international" },
        exp1_title: { en: "Study permit guidance, onboarding, and a smooth Vancouver start", fr: "Accompagnement pour le permis d'études, l'intégration et un début en douceur à Vancouver" },
        exp1_p: { en: "International students need more than a brochure. MCC offers document clarity, arrival guidance, and local support so students can begin with confidence.", fr: "Les étudiants internationaux ont besoin de plus qu'une brochure. MCC offre clarté documentaire, accompagnement à l'arrivée et soutien local pour bien commencer." },
        exp1_t1: { en: "Study permit planning", fr: "Planification du permis d'études" },
        exp1_t2: { en: "Arrival support", fr: "Soutien à l'arrivée" },
        exp1_t3: { en: "Language guidance", fr: "Accompagnement linguistique" },
        exp1_link: { en: "Explore support", fr: "Découvrir le soutien" },
        exp2_kicker: { en: "Career Services", fr: "Services de carrière" },
        exp2_title: { en: "Career services built into the journey from first term to first role", fr: "Des services de carrière intégrés au parcours, de la première session au premier emploi" },
        exp2_p: { en: "Resume coaching, interview preparation, and employer-facing guidance help students move toward work with more clarity and less guesswork.", fr: "Coaching de CV, préparation aux entretiens et conseils orientés employeurs aident les étudiants à avancer vers l'emploi avec plus de clarté." },
        exp2_t1: { en: "Resume coaching", fr: "Coaching de CV" },
        exp2_t2: { en: "Interview prep", fr: "Préparation aux entretiens" },
        exp2_t3: { en: "Employer readiness", fr: "Prêt pour les employeurs" },
        exp2_link: { en: "See career services", fr: "Voir les services de carrière" },
        exp3_kicker: { en: "Student Answers", fr: "Réponses aux étudiants" },
        exp3_title: { en: "Real answers for future students before they even need to ask", fr: "De vraies réponses aux futurs étudiants, avant même qu'ils aient à demander" },
        exp3_p: { en: "Requirements, tuition planning, admissions steps, and direct contact points should all be visible right from the homepage.", fr: "Conditions, frais, étapes d'admission et points de contact directs doivent tous être visibles dès la page d'accueil." },
        exp3_t1: { en: "Admissions roadmap", fr: "Feuille de route d'admission" },
        exp3_t2: { en: "Tuition guidance", fr: "Conseils sur les frais" },
        exp3_t3: { en: "Direct support", fr: "Soutien direct" },
        exp3_link: { en: "Talk to admissions", fr: "Parler aux admissions" },

        // Admissions Journey
        journey_kicker: { en: "Admissions Journey", fr: "Parcours d'admission" },
        journey_title: { en: "A clearer path from interest to enrollment", fr: "Un chemin plus clair, de l'intérêt à l'inscription" },
        journey_copy: { en: "This section replaces the large homepage portal block with something more useful for future students: a simple, visible admissions pathway.", fr: "Cette section remplace l'ancien bloc portail par quelque chose de plus utile pour les futurs étudiants : un parcours d'admission simple et visible." },
        j1_title: { en: "Discover your fit", fr: "Trouvez ce qui vous correspond" },
        j1_p: { en: "Compare programs, learning styles, outcomes, and start dates before you begin an application.", fr: "Comparez programmes, styles d'apprentissage, résultats et dates de début avant de commencer une candidature." },
        j1_link: { en: "Browse programs", fr: "Parcourir les programmes" },
        j2_title: { en: "Check requirements", fr: "Vérifiez les conditions" },
        j2_p: { en: "Review academic, language, and program-specific entry expectations with no guesswork.", fr: "Examinez les attentes académiques, linguistiques et propres au programme, sans deviner." },
        j2_link: { en: "View requirements", fr: "Voir les conditions" },
        j3_title: { en: "Plan tuition and support", fr: "Planifiez frais et soutien" },
        j3_p: { en: "Understand payment timing, fee categories, and where to ask for a personalized estimate.", fr: "Comprenez les échéances de paiement, les catégories de frais et où demander une estimation personnalisée." },
        j3_link: { en: "Review tuition guidance", fr: "Voir les frais et conseils" },
        j4_title: { en: "Apply with confidence", fr: "Postulez en toute confiance" },
        j4_p: { en: "Submit your application through a guided step-by-step form and know what happens next.", fr: "Envoyez votre candidature via un formulaire guidé en étapes et sachez ce qui suit." },
        j4_link: { en: "Apply now", fr: "Postuler maintenant" },

        // Community / News
        com_kicker: { en: "Community and News", fr: "Communauté et actualités" },
        com_title: { en: "A homepage with more life, more activity, and more reasons to explore", fr: "Une page d'accueil plus vivante, plus active, et qui donne envie d'explorer" },
        com_copy: { en: "Instead of short generic blocks, the homepage now pulls students into what is happening at MCC: events, newsletters, and practical next steps.", fr: "À la place de blocs génériques, la page d'accueil plonge maintenant les étudiants dans la vie de MCC : événements, bulletins et prochaines étapes concrètes." },
        com1_kicker: { en: "Latest Newsletter", fr: "Dernier bulletin" },
        com1_title: { en: "Read the latest MCC updates, events, and student milestones", fr: "Lisez les dernières actualités MCC, événements et étapes marquantes étudiantes" },
        com1_p: { en: "The newsletter archive is one of the fastest ways for future students to see what campus life, deadlines, and program momentum actually look like here.", fr: "Les archives du bulletin sont l'un des moyens les plus rapides pour les futurs étudiants de voir à quoi ressemblent vraiment la vie de campus, les échéances et la dynamique des programmes." },
        com1_t1: { en: "Events and deadlines", fr: "Événements et échéances" },
        com1_t2: { en: "Program launches", fr: "Lancements de programmes" },
        com1_t3: { en: "Student stories", fr: "Témoignages étudiants" },
        com1_link: { en: "Visit the archive", fr: "Visiter les archives" },
        com2_kicker: { en: "Direct Guidance", fr: "Accompagnement direct" },
        com2_title: { en: "Need direct guidance from admissions and student support?", fr: "Besoin d'un accompagnement direct des admissions et du soutien étudiant ?" },
        com2_p: { en: "Students can connect with MCC for practical help around documents, deadlines, program fit, and next-step planning without the usual confusion.", fr: "Les étudiants peuvent contacter MCC pour une aide concrète sur les documents, les échéances, le bon programme et les prochaines étapes — sans la confusion habituelle." },
        com2_t1: { en: "Inquiry support", fr: "Soutien aux demandes" },
        com2_t2: { en: "Fast next steps", fr: "Prochaines étapes rapides" },
        com2_t3: { en: "Domestic and international help", fr: "Aide nationale et internationale" },
        com2_link: { en: "Connect with MCC", fr: "Contacter MCC" },
        com3_kicker: { en: "Student Outcomes", fr: "Résultats étudiants" },
        com3_title: { en: "Explore the support, alumni stories, and career outcomes behind the experience", fr: "Découvrez le soutien, les histoires d'anciens et les résultats de carrière derrière l'expérience" },
        com3_p: { en: "Career services, alumni connection, and student success stories should reinforce why studying at MCC is worth the decision.", fr: "Services de carrière, lien avec les anciens et histoires de réussite renforcent les raisons de choisir MCC." },
        com3_t1: { en: "Career preparation", fr: "Préparation à la carrière" },
        com3_t2: { en: "Alumni community", fr: "Communauté des anciens" },
        com3_t3: { en: "Long-term success", fr: "Réussite à long terme" },
        com3_link: { en: "Meet the alumni community", fr: "Découvrir la communauté des anciens" },

        // Next Actions
        next_kicker: { en: "Next Actions", fr: "Prochaines actions" },
        next_title: { en: "Take the next step with confidence", fr: "Faites le prochain pas avec confiance" },
        next1_title: { en: "Admissions Hub", fr: "Centre des admissions" },
        next1_p: { en: "Everything future students need in one place, from overview to application.", fr: "Tout ce dont les futurs étudiants ont besoin au même endroit, de l'aperçu à la candidature." },
        next1_link: { en: "Explore admissions", fr: "Explorer les admissions" },
        next2_title: { en: "Requirements", fr: "Conditions" },
        next2_p: { en: "Check general and program-specific entry expectations before you apply.", fr: "Vérifiez les attentes générales et propres au programme avant de postuler." },
        next2_link: { en: "Review requirements", fr: "Voir les conditions" },
        next3_title: { en: "Tuition Guidance", fr: "Frais et conseils" },
        next3_p: { en: "Understand fee categories, payment timing, and where to get a personal estimate.", fr: "Comprenez les catégories de frais, les échéances et où obtenir une estimation personnelle." },
        next3_link: { en: "Plan tuition", fr: "Planifier les frais" },
        next4_title: { en: "Talk to Us", fr: "Parlez-nous" },
        next4_p: { en: "Reach out if you want help comparing programs or preparing your application.", fr: "Écrivez-nous si vous voulez de l'aide pour comparer les programmes ou préparer votre candidature." },
        next4_link: { en: "Contact MCC", fr: "Contacter MCC" }
    },

    // ESL programs (programs-esl.html) — hero + overview + 6 levels
    esl: {
        breadcrumb_html: {
            en: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programs</a> / English (ESL)',
            fr: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programmes</a> / Anglais (ALS)'
        },
        hero_title: { en: "English language training designed for life and work in Canada", fr: "Une formation en anglais conçue pour la vie et le travail au Canada" },
        hero_subtitle: { en: "Six progressive CEFR-aligned levels — from first steps in English through near-native fluency. Build reading, writing, listening, and speaking skills with a structured, outcome-focused program.", fr: "Six niveaux progressifs alignés sur le CECR — des premiers pas en anglais jusqu'à une maîtrise presque native. Développez la lecture, l'écriture, l'écoute et l'oral grâce à un programme structuré, axé sur les résultats." },
        pill_levels: { en: "6 CEFR levels (A1–C1)", fr: "6 niveaux CECR (A1 à C1)" },
        pill_modes: { en: "In-person & online", fr: "En présentiel et en ligne" },
        pill_test: { en: "Free placement test", fr: "Test de placement gratuit" },

        ov_kicker: { en: "Program Overview", fr: "Aperçu du programme" },
        ov_title: { en: "How the ESL program works", fr: "Comment fonctionne le programme d'ALS" },
        ov1_title: { en: "Free Placement Test", fr: "Test de placement gratuit" },
        ov1_p: { en: "All new students complete a placement assessment so you start at the level that matches your current English ability — no guesswork.", fr: "Tous les nouveaux étudiants passent une évaluation de placement pour commencer au niveau qui correspond à leur anglais actuel — sans deviner." },
        ov2_title: { en: "Progressive Levels", fr: "Niveaux progressifs" },
        ov2_p: { en: "Each level builds on the previous one. Clear outcomes at every stage mean you always know what you're working toward and when you're ready to advance.", fr: "Chaque niveau s'appuie sur le précédent. Des objectifs clairs à chaque étape vous indiquent toujours ce que vous visez et quand vous êtes prêt à passer au suivant." },
        ov3_title: { en: "All Four Skills", fr: "Les quatre compétences" },
        ov3_p: { en: "Every level integrates listening, speaking, reading, and writing — the same four skills tested in official Canadian language assessments.", fr: "Chaque niveau intègre l'écoute, l'oral, la lecture et l'écriture — les quatre compétences évaluées par les examens linguistiques officiels canadiens." },
        ov4_title: { en: "Small Class Sizes", fr: "Petites classes" },
        ov4_p: { en: "Capped cohorts ensure every student gets attention from their instructor. Less waiting, more practising.", fr: "Des effectifs limités garantissent à chaque étudiant l'attention de son enseignant. Moins d'attente, plus de pratique." },

        levels_kicker: { en: "Six Levels", fr: "Six niveaux" },
        levels_title: { en: "Find your starting point", fr: "Trouvez votre point de départ" },
        levels_p: { en: "All levels are CEFR-aligned. If you're unsure where you belong, our free placement test will identify the right fit.", fr: "Tous les niveaux sont alignés sur le CECR. Si vous hésitez sur le bon niveau, notre test de placement gratuit vous orientera." },

        l1_title: { en: "Level 1 — Foundation", fr: "Niveau 1 — Fondation" },
        l1_p: { en: "For absolute beginners. Learn greetings, numbers, dates, and the language of everyday survival — building real confidence in English from your very first class.", fr: "Pour les grands débutants. Apprenez les salutations, les nombres, les dates et la langue de la survie quotidienne — gagnez en confiance dès votre tout premier cours." },
        l1_li1: { en: "Introduce yourself and others", fr: "Vous présenter et présenter les autres" },
        l1_li2: { en: "Ask and answer basic questions", fr: "Poser et répondre à des questions simples" },
        l1_li3: { en: "Understand simple written signs and forms", fr: "Comprendre des panneaux et formulaires simples" },
        l1_li4: { en: "Handle basic transactions and directions", fr: "Gérer des transactions de base et des indications" },

        l2_title: { en: "Level 2 — Elementary", fr: "Niveau 2 — Élémentaire" },
        l2_p: { en: "Expand your vocabulary and start holding simple conversations confidently. Navigate everyday situations — shopping, appointments, phone calls — in English.", fr: "Élargissez votre vocabulaire et tenez vos premières conversations simples avec assurance. Gérez les situations courantes — achats, rendez-vous, appels — en anglais." },
        l2_li1: { en: "Describe routines, people, and places", fr: "Décrire des routines, des personnes et des lieux" },
        l2_li2: { en: "Read and write short messages and notes", fr: "Lire et rédiger de courts messages et notes" },
        l2_li3: { en: "Handle common service interactions", fr: "Gérer les interactions de service courantes" },
        l2_li4: { en: "Follow simple instructions and announcements", fr: "Suivre des consignes et des annonces simples" },

        l3_title: { en: "Level 3 — Pre-Intermediate", fr: "Niveau 3 — Pré-Intermédiaire" },
        l3_p: { en: "Move from survival English toward practical fluency. Handle most common real-life situations and begin expressing your opinions clearly.", fr: "Passez d'un anglais de survie à une aisance pratique. Gérez la plupart des situations courantes et commencez à exprimer vos opinions clairement." },
        l3_li1: { en: "Discuss past experiences and future plans", fr: "Discuter d'expériences passées et de projets futurs" },
        l3_li2: { en: "Understand the main points of clear speech", fr: "Comprendre les idées principales d'un discours clair" },
        l3_li3: { en: "Write structured paragraphs and emails", fr: "Rédiger des paragraphes et courriels structurés" },
        l3_li4: { en: "Engage in conversations on familiar topics", fr: "Tenir des conversations sur des sujets familiers" },

        l4_title: { en: "Level 4 — Intermediate", fr: "Niveau 4 — Intermédiaire" },
        l4_p: { en: "Build consistent, confident communication for daily life, study, and entry-level work situations. Begin preparing for Canadian academic and professional contexts.", fr: "Bâtissez une communication régulière et confiante pour la vie quotidienne, les études et les premiers emplois. Commencez à vous préparer aux contextes universitaires et professionnels canadiens." },
        l4_li1: { en: "Express opinions with supporting reasons", fr: "Exprimer des opinions appuyées par des arguments" },
        l4_li2: { en: "Understand longer spoken and written texts", fr: "Comprendre des textes oraux et écrits plus longs" },
        l4_li3: { en: "Write multi-paragraph essays and reports", fr: "Rédiger des essais et rapports en plusieurs paragraphes" },
        l4_li4: { en: "Participate actively in group discussions", fr: "Participer activement à des discussions de groupe" },

        l5_title: { en: "Level 5 — Upper-Intermediate", fr: "Niveau 5 — Intermédiaire avancé" },
        l5_p: { en: "Develop the academic and professional English skills needed for college entry, workplace advancement, and complex communication in Canadian settings.", fr: "Développez l'anglais universitaire et professionnel nécessaire à l'entrée au collège, à la progression au travail et à la communication complexe en contexte canadien." },
        l5_li1: { en: "Read and analyse complex texts independently", fr: "Lire et analyser des textes complexes en autonomie" },
        l5_li2: { en: "Write research-level academic writing", fr: "Rédiger des textes universitaires de niveau recherche" },
        l5_li3: { en: "Follow lectures, debates, and presentations", fr: "Suivre cours, débats et présentations" },
        l5_li4: { en: "Communicate fluently on a wide range of topics", fr: "Communiquer avec aisance sur une grande variété de sujets" },

        l6_title: { en: "Level 6 — Advanced", fr: "Niveau 6 — Avancé" },
        l6_p: { en: "Reach near-native fluency with the ability to communicate spontaneously, precisely, and effectively in complex academic and professional environments.", fr: "Atteignez une maîtrise presque native, capable de communiquer spontanément, avec précision et efficacité, dans des environnements universitaires et professionnels complexes." },
        l6_li1: { en: "Communicate with spontaneity and precision", fr: "Communiquer avec spontanéité et précision" },
        l6_li2: { en: "Understand implicit meaning and nuance", fr: "Comprendre le sens implicite et la nuance" },
        l6_li3: { en: "Produce clear, well-structured complex writing", fr: "Produire un écrit complexe, clair et bien structuré" },
        l6_li4: { en: "Engage confidently in high-level professional settings", fr: "Évoluer avec assurance dans des contextes professionnels exigeants" }
    },

    // Programs landing (programs.html) — hero + categories + why
    progs: {
        hero_eyebrow: { en: "Programs", fr: "Programmes" },
        hero_title: { en: "Build credentials that open doors in Canada and beyond", fr: "Bâtissez des compétences qui ouvrent des portes au Canada et ailleurs" },
        hero_subtitle: { en: "MCC offers diploma programs, structured English language training, and a full French language pathway — all designed around practical outcomes and Canadian standards.", fr: "MCC offre des programmes de diplôme, une formation structurée en anglais et un parcours complet en français — tous conçus autour de résultats concrets et des normes canadiennes." },
        pill_diploma: { en: "Diploma credentials", fr: "Diplômes reconnus" },
        pill_lang: { en: "ESL & French", fr: "ALS et français" },
        pill_imm: { en: "Immigration-aligned", fr: "Aligné sur l'immigration" },

        cats_kicker: { en: "Program Categories", fr: "Catégories de programmes" },
        cats_title: { en: "Choose your pathway", fr: "Choisissez votre parcours" },
        cats_p: { en: "Three distinct program areas — each built with clear learning outcomes, qualified instructors, and a straightforward path from enrollment to credential.", fr: "Trois grands domaines — chacun avec des objectifs d'apprentissage clairs, des enseignants qualifiés et un parcours simple, de l'inscription au diplôme." },
        cat1_title: { en: "Diploma Programs", fr: "Programmes de diplôme" },
        cat1_p: { en: "Career-focused diplomas in high-growth fields. From AI and digital media to caregiving, hospitality, and esports — each program delivers applied skills and a recognized credential.", fr: "Des diplômes axés sur la carrière dans des domaines en forte croissance. De l'IA aux médias numériques en passant par les soins, l'hôtellerie et le sport électronique — chaque programme apporte des compétences appliquées et un diplôme reconnu." },
        cat1_li1: { en: "6 programs available", fr: "6 programmes disponibles" },
        cat1_li2: { en: "PTIB accredited & BC EQA designated", fr: "Accrédité PTIB et désigné BC EQA" },
        cat1_li3: { en: "Applied, career-ready learning", fr: "Apprentissage appliqué et prêt pour la carrière" },
        cat1_li4: { en: "International student support", fr: "Soutien aux étudiants internationaux" },
        cat1_link: { en: "Explore Diploma Programs", fr: "Voir les programmes de diplôme" },

        cat2_title: { en: "English Language (ESL)", fr: "Anglais langue seconde (ALS)" },
        cat2_p: { en: "Six progressive CEFR-aligned levels from absolute beginner through advanced. Build reading, writing, listening, and speaking skills for academic, professional, and everyday life in Canada.", fr: "Six niveaux progressifs alignés sur le CECR, du grand débutant à l'avancé. Développez la lecture, l'écriture, l'écoute et l'oral pour la vie universitaire, professionnelle et quotidienne au Canada." },
        cat2_li1: { en: "6 levels: A1 through C1", fr: "6 niveaux : du A1 au C1" },
        cat2_li2: { en: "Free placement test included", fr: "Test de placement gratuit inclus" },
        cat2_li3: { en: "In-person & online delivery", fr: "En présentiel et en ligne" },
        cat2_li4: { en: "Academic & workplace readiness", fr: "Préparation académique et professionnelle" },
        cat2_link: { en: "Explore ESL Programs", fr: "Voir les programmes d'ALS" },

        cat3_title: { en: "French Language", fr: "Langue française" },
        cat3_p: { en: "A structured French language pathway from beginner to advanced, plus dedicated TEF Canada and TCF Canada exam preparation. Designed for immigration, academic admission, and professional goals.", fr: "Un parcours structuré en français du débutant à l'avancé, accompagné d'une préparation dédiée aux examens TEF Canada et TCF Canada. Conçu pour l'immigration, l'admission universitaire et les objectifs professionnels." },
        cat3_li1: { en: "4 levels: A1 through B2", fr: "4 niveaux : du A1 au B2" },
        cat3_li2: { en: "TEF Canada & TCF Canada prep", fr: "Préparation au TEF Canada et au TCF Canada" },
        cat3_li3: { en: "Immigration-focused outcomes", fr: "Objectifs axés sur l'immigration" },
        cat3_li4: { en: "Small classes, expert instructors", fr: "Petites classes, enseignants experts" },
        cat3_link: { en: "Explore French Programs", fr: "Voir les programmes de français" },

        why_kicker: { en: "Why MCC", fr: "Pourquoi MCC" },
        why_title: { en: "Built for real outcomes", fr: "Conçu pour de vrais résultats" },
        why1_title: { en: "Accredited & Recognized", fr: "Accrédité et reconnu" },
        why1_p: { en: "PTIB accredited and BC EQA designated. French exam preparation is aligned with IRCC requirements for TEF Canada and TCF Canada.", fr: "Accrédité PTIB et désigné BC EQA. La préparation aux examens de français est alignée sur les exigences d'IRCC pour le TEF Canada et le TCF Canada." },
        why2_title: { en: "Small Class Sizes", fr: "Petites classes" },
        why2_p: { en: "Capped cohorts in every program ensure instructors can provide focused feedback and support at every stage of learning.", fr: "Des cohortes à effectif limité dans chaque programme permettent aux enseignants d'offrir un retour ciblé et un soutien à toutes les étapes." },
        why3_title: { en: "Vancouver-Based", fr: "Au cœur de Vancouver" },
        why3_p: { en: "Located in one of Canada's most multilingual cities — a practical advantage for language learners and students building professional networks.", fr: "Situé dans l'une des villes les plus multilingues du Canada — un avantage concret pour les apprenants en langues et pour bâtir un réseau professionnel." },
        why4_title: { en: "In-Person & Online", fr: "En présentiel et en ligne" },
        why4_p: { en: "All language programs are available both in-person and online, giving you flexibility without compromising on instruction quality.", fr: "Tous les programmes de langues sont offerts en présentiel et en ligne, pour plus de flexibilité sans compromis sur la qualité de l'enseignement." },

        cta_kicker: { en: "Get Started", fr: "Commencez ici" },
        cta_title: { en: "Not sure where to begin?", fr: "Vous ne savez pas par où commencer ?" },
        cta_p: { en: "Speak with an advisor or take a free placement test to find the program and level that matches your goals.", fr: "Parlez à un conseiller ou passez un test de placement gratuit pour trouver le programme et le niveau qui correspondent à vos objectifs." },
        cta_btn_advisor: { en: "Talk to an Advisor", fr: "Parler à un conseiller" },
        cta_btn_apply: { en: "Apply Now", fr: "Postuler maintenant" }
    },

    // French Programs hub (programs-french.html)
    frhub: {
        breadcrumb_html: {
            en: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programs</a> / French Language',
            fr: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programmes</a> / Langue française'
        },
        hero_title: { en: "French language programs for immigration, academics, and professional life", fr: "Programmes de français pour l'immigration, les études et la vie professionnelle" },
        hero_subtitle: { en: "A complete, structured French pathway from beginner to advanced — designed to Canadian academic standards. Includes dedicated TEF Canada and TCF Canada exam preparation for immigration and citizenship goals.", fr: "Un parcours de français complet et structuré, du débutant à l'avancé — aligné sur les normes universitaires canadiennes. Comprend une préparation dédiée aux examens TEF Canada et TCF Canada pour l'immigration et la citoyenneté." },
        pill_levels: { en: "4 structured levels (A1–B2)", fr: "4 niveaux structurés (A1 à B2)" },
        pill_exam: { en: "TEF & TCF Canada prep", fr: "Préparation TEF et TCF Canada" },
        pill_modes: { en: "In-person & online", fr: "En présentiel et en ligne" },

        // Use existing flang.* and fexam.* keys for the level descriptions and CRS sections
        // Page-specific narrowed differences:
        why1_p_hub: { en: "Achieving NCLC 7 in French (TEF Canada B2) can add up to 50 CRS bonus points — a significant advantage in Canada's Express Entry immigration system.", fr: "Atteindre le NCLC 7 en français (TEF Canada B2) peut rapporter jusqu'à 50 points CRS supplémentaires — un avantage important dans le système Entrée express." },

        // TEF section header (shared with #tef anchor)
        tef_kicker: { en: "Exam Preparation", fr: "Préparation aux examens" },
        tef_title: { en: "TEF Canada — Test d'Évaluation de Français", fr: "TEF Canada — Test d'Évaluation de Français" },
        tef_p: { en: "TEF Canada is the official French language exam recognized by IRCC (Immigration, Refugees and Citizenship Canada) for Express Entry, Provincial Nominee Programs, and Canadian citizenship applications.", fr: "Le TEF Canada est l'examen officiel de français reconnu par IRCC (Immigration, Réfugiés et Citoyenneté Canada) pour Entrée express, les Programmes des candidats des provinces et les demandes de citoyenneté canadienne." },

        tef_what_title: { en: "What TEF Canada Tests", fr: "Ce que le TEF Canada évalue" },
        tef_what_p: { en: "TEF Canada assesses all four official IRCC language skills. Each component is scored and mapped to the NCLC (Niveaux de compétence linguistique canadiens) scale.", fr: "Le TEF Canada évalue les quatre compétences linguistiques officielles d'IRCC. Chaque épreuve est notée et alignée sur l'échelle NCLC (Niveaux de compétence linguistique canadiens)." },
        tef_how_title: { en: "How MCC Prepares You", fr: "Comment MCC vous prépare" },
        tef_how_p: { en: "Our TEF Canada preparation is targeted and exam-specific — not a general French class. Every session is built around the official exam format.", fr: "Notre préparation au TEF Canada est ciblée et propre à l'examen — pas un cours de français général. Chaque séance est conçue autour du format officiel." },
        tef_how_li1: { en: "Full-length mock exams with real exam conditions", fr: "Examens blancs complets en conditions réelles" },
        tef_how_li2: { en: "Targeted strategies for each of the four components", fr: "Stratégies ciblées pour chacune des quatre épreuves" },
        tef_how_li3: { en: "Individualized feedback on writing and speaking", fr: "Retours individualisés sur l'écrit et l'oral" },
        tef_how_li4: { en: "Score prediction and NCLC estimation", fr: "Prédiction de score et estimation NCLC" },
        tef_how_li5: { en: "CRS simulation to model your immigration profile", fr: "Simulation CRS pour modéliser votre profil d'immigration" },
        tef_how_li6: { en: "Taught by instructors familiar with official TEF format", fr: "Enseigné par des formateurs qui connaissent le format officiel du TEF" },
        tef_how_li7: { en: "Available in small-group or private 1-on-1 formats", fr: "Disponible en petit groupe ou en privé en tête-à-tête" },
        tef_how_li8: { en: "Flexible 10-hour packages — renew at any time, no fixed session lock-in", fr: "Forfaits flexibles de 10 heures — renouvelables à tout moment, sans engagement de session" },

        tcf_title: { en: "TCF Canada — Test de Connaissance du Français", fr: "TCF Canada — Test de connaissance du français" },
        tcf_p: { en: "TCF Canada is the second official French language exam recognized by IRCC. Like TEF Canada, it is accepted for Express Entry, PNPs, and Canadian citizenship applications. Both exams are equally valid — your choice depends on format preference and test availability.", fr: "Le TCF Canada est le second examen officiel de français reconnu par IRCC. Comme le TEF Canada, il est accepté pour Entrée express, les PCP et la citoyenneté. Les deux examens sont également valides — votre choix dépend du format et de la disponibilité." },
        tcf_compare_title: { en: "TEF Canada vs TCF Canada", fr: "TEF Canada vs TCF Canada" },
        tcf_compare_p: { en: "Both are accepted by IRCC with equal weight. The differences are in exam format and question style.", fr: "Les deux examens sont reconnus à parts égales par IRCC. Les différences concernent le format et le style des questions." },
        diff_q_format: { en: "Question Format", fr: "Format des questions" },
        diff_format_tef: { en: "Multiple choice + written", fr: "Choix multiples + écrit" },
        diff_format_tcf: { en: "Adaptive + written", fr: "Adaptatif + écrit" },
        tcf_how_title: { en: "TCF Canada Preparation at MCC", fr: "Préparation au TCF Canada à MCC" },
        tcf_how_p: { en: "Our TCF Canada prep follows the same rigorous approach as our TEF prep — format-specific strategies, mock exams, and personalized feedback.", fr: "Notre préparation au TCF Canada suit la même approche rigoureuse que notre préparation au TEF — stratégies propres au format, examens blancs et retours personnalisés." },
        tcf_how_li1: { en: "Full TCF Canada practice tests under timed conditions", fr: "Examens blancs complets de TCF Canada en conditions chronométrées" },
        tcf_how_li2: { en: "Strategies for the adaptive listening and reading modules", fr: "Stratégies pour les modules adaptatifs d'écoute et de lecture" },
        tcf_how_li3: { en: "Written production practice with examiner-style marking", fr: "Pratique de production écrite avec notation à la manière d'un examinateur" },
        tcf_how_li4: { en: "Oral production coaching and scoring breakdown", fr: "Coaching de production orale et décomposition du score" },
        tcf_how_li5: { en: "NCLC estimation and CRS point projection", fr: "Estimation NCLC et projection des points CRS" },
        tcf_how_li6: { en: "Available in small-group or private 1-on-1 formats", fr: "Disponible en petit groupe ou en privé en tête-à-tête" },
        tcf_how_li7: { en: "Flexible 10-hour packages — renew at any time", fr: "Forfaits flexibles de 10 heures — renouvelables à tout moment" },

        nclc_kicker: { en: "Immigration Context", fr: "Contexte d'immigration" },
        nclc_title: { en: "Understanding NCLC and CRS", fr: "Comprendre le NCLC et le CRS" },
        nclc_path_title: { en: "Your Path at MCC", fr: "Votre parcours à MCC" },
        nclc_path_p: { en: "Most students reach NCLC 7 (B2) after completing Niveau 3 and Niveau 4 of the regular program. The TEF or TCF preparation packages are then used to fine-tune exam performance and maximize your score.", fr: "La plupart des étudiants atteignent le NCLC 7 (B2) après les Niveaux 3 et 4 du programme régulier. Les forfaits de préparation au TEF ou au TCF servent ensuite à peaufiner la performance et à maximiser le score." },
        nclc_path_li1: { en: "Niveau 1–2: Foundation for NCLC 4–5", fr: "Niveaux 1–2 : socle pour le NCLC 4–5" },
        nclc_path_li2: { en: "Niveau 3: NCLC 5–6 range", fr: "Niveau 3 : tranche NCLC 5–6" },
        nclc_path_li3: { en: "Niveau 4: NCLC 7+ target", fr: "Niveau 4 : cible NCLC 7+" },
        nclc_path_li4: { en: "TEF/TCF Prep: Exam-specific score maximization", fr: "Préparation TEF/TCF : maximisation du score propre à l'examen" },

        testimonials_kicker: { en: "Student Voices", fr: "Témoignages d'étudiants" },
        testimonials_title: { en: "From first bonjour to Express Entry", fr: "Du premier bonjour à Entrée express" },
        testimonials_p: { en: "International students share how MCC's French program opened immigration, academic, and career pathways in Canada.", fr: "Des étudiants internationaux racontent comment le programme de français de MCC leur a ouvert des voies d'immigration, d'études et de carrière au Canada." },

        cta_kicker: { en: "Enroll Today", fr: "Inscrivez-vous dès aujourd'hui" },
        cta_title: { en: "Start your French journey", fr: "Lancez votre parcours en français" },
        cta_p: { en: "Speak with an advisor to discuss your immigration goals, current French level, and which combination of regular program and exam prep makes the most sense for your timeline.", fr: "Discutez avec un conseiller de vos objectifs d'immigration, de votre niveau actuel et de la combinaison de programme régulier et de préparation aux examens qui convient le mieux à votre échéancier." }
    },

    // Shared content for the TEF/TCF exam-prep pages
    fexam: {
        // Hero pills + CTAs (shared)
        pill_career: { en: "Career-focused French", fr: "Français axé sur la carrière" },
        pill_speaking: { en: "Real speaking confidence", fr: "Aisance réelle à l'oral" },
        pill_personalized: { en: "Personalized study plan", fr: "Plan d'études personnalisé" },
        cta_apply: { en: "Apply Now", fr: "Postuler maintenant" },

        // Hero shared title/subtitle (the title is identical on both pages)
        hero_title: { en: "More than a test — French for your future in Canada", fr: "Plus qu'un examen — le français pour votre avenir au Canada" },

        // Program Promise (5 benefit cards — shared)
        promise_kicker: { en: "The Program Promise", fr: "Notre engagement" },
        promise_title: { en: "We do more than prepare you for a test", fr: "Nous faisons bien plus que vous préparer à un examen" },
        b1_title: { en: "Career advantage", fr: "Avantage professionnel" },
        b1_p: { en: "French opens access to bilingual workplaces, customer-facing roles, hospitality, education, business, government, and community-serving jobs across Canada.", fr: "Le français donne accès à des milieux de travail bilingues : service à la clientèle, hôtellerie, éducation, affaires, fonction publique et organismes communautaires à travers le Canada." },
        b1_li1: { en: "Bilingual job markets", fr: "Marchés de l'emploi bilingues" },
        b1_li2: { en: "Stronger resume signal", fr: "Un signal plus fort sur le CV" },
        b1_li3: { en: "Federal & public-sector eligibility", fr: "Admissibilité au fédéral et au secteur public" },

        b2_title: { en: "Academic & skill development", fr: "Développement académique et compétences" },
        b2_li1: { en: "Grammar & vocabulary expansion", fr: "Élargissement du vocabulaire et de la grammaire" },
        b2_li2: { en: "Reading and listening accuracy", fr: "Précision en lecture et en écoute" },
        b2_li3: { en: "Writing structure & clarity", fr: "Structure et clarté à l'écrit" },

        b3_title: { en: "Personal confidence & communication", fr: "Confiance personnelle et communication" },
        b3_p: { en: "Practise real situations: interviews, professional conversations, travel, community life. Leave the program more confident speaking French than when you started.", fr: "Pratiquez des situations réelles : entretiens, échanges professionnels, voyages, vie communautaire. Vous quitterez le programme plus à l'aise à l'oral qu'à votre arrivée." },
        b3_li1: { en: "Speaking under pressure", fr: "Parler sous pression" },
        b3_li2: { en: "Pronunciation coaching", fr: "Coaching de prononciation" },
        b3_li3: { en: "Workplace-ready expression", fr: "Expression prête pour le milieu de travail" },

        b4_title: { en: "Immigration & citizenship support", fr: "Soutien à l'immigration et à la citoyenneté" },
        b4_li1: { en: "IRCC-recognized exam", fr: "Examen reconnu par IRCC" },
        b4_li2: { en: "NCLC score targeting", fr: "Cibles de score NCLC" },
        b4_li3: { en: "One pathway among many", fr: "Une voie parmi d'autres" },

        b5_title: { en: "Cultural & Canadian connection", fr: "Lien culturel et canadien" },
        b5_p: { en: "French is one of Canada's two official languages. Learning it helps you connect more deeply with Canadian society, media, communities, and culture.", fr: "Le français est l'une des deux langues officielles du Canada. L'apprendre vous aide à mieux vous connecter à la société, aux médias, aux communautés et à la culture canadiennes." },
        b5_li1: { en: "Bilingual Canadian identity", fr: "Identité canadienne bilingue" },
        b5_li2: { en: "Quebec & Francophone communities", fr: "Communautés québécoise et francophones" },
        b5_li3: { en: "Canadian media & arts access", fr: "Accès aux médias et aux arts canadiens" },

        // Who this is for
        who_kicker: { en: "Who this is for", fr: "À qui ce programme s'adresse" },
        who_title: { en: "Five kinds of students. One supportive program.", fr: "Cinq profils d'étudiants. Un seul programme bienveillant." },
        s1_title: { en: "Career-focused students", fr: "Étudiants axés sur la carrière" },
        s1_p: { en: "You want better job opportunities. French strengthens your resume and helps you stand out in bilingual roles, hospitality, customer service, education, business, and community organizations.", fr: "Vous cherchez de meilleures occasions d'emploi. Le français renforce votre CV et vous distingue dans des rôles bilingues : hôtellerie, service à la clientèle, éducation, affaires et organismes communautaires." },
        s2_title: { en: "Newcomers & international students", fr: "Nouveaux arrivants et étudiants internationaux" },
        s2_p: { en: "You want to feel more confident in Canada. French helps you understand the country's bilingual identity and gives you another communication skill for future opportunities.", fr: "Vous voulez vous sentir plus à l'aise au Canada. Le français vous aide à comprendre l'identité bilingue du pays et vous donne une compétence de communication supplémentaire." },
        s3_title: { en: "Academic students", fr: "Étudiants à visée académique" },
        s4_title: { en: "Working professionals", fr: "Professionnels en activité" },
        s4_p: { en: "You want to upgrade your professional profile. The program helps working adults build practical communication skills while preparing for recognized French language testing.", fr: "Vous souhaitez rehausser votre profil professionnel. Le programme aide les adultes en activité à bâtir des compétences de communication concrètes tout en préparant un examen officiel de français." },
        s5_title: { en: "Immigration / citizenship students", fr: "Étudiants en démarche d'immigration ou de citoyenneté" },

        // What you'll gain (table)
        gain_kicker: { en: "What You'll Gain", fr: "Ce que vous y gagnerez" },
        gain_title: { en: "Outcomes, not just classes", fr: "Des résultats, pas seulement des cours" },
        gain_intro: { en: "Students complete the program with stronger French communication skills, better exam awareness, more speaking confidence, improved writing structure, and a clearer study plan. Here's how each program feature maps to a real student outcome.", fr: "Les étudiants terminent le programme avec une meilleure communication en français, une meilleure connaissance de l'examen, plus d'aisance à l'oral, une structure d'écriture améliorée et un plan d'études clair. Voici comment chaque élément du programme se traduit en résultat concret." },
        gain_th_feature: { en: "Program feature", fr: "Élément du programme" },
        gain_th_outcome: { en: "Student outcome", fr: "Résultat pour l'étudiant" },
        gain_r1_f: { en: "Free level assessment", fr: "Évaluation de niveau gratuite" },
        gain_r1_o: { en: "You know your starting point and the right entry into the program.", fr: "Vous connaissez votre point de départ et l'entrée idéale dans le programme." },
        gain_r3_f: { en: "Speaking practice", fr: "Pratique de l'oral" },
        gain_r3_o: { en: "You become more confident speaking French in real and high-pressure situations.", fr: "Vous prenez confiance à l'oral, en situations réelles et sous pression." },
        gain_r4_f: { en: "Writing correction", fr: "Correction de l'écrit" },
        gain_r4_o: { en: "You improve sentence structure, accuracy, and register for written tasks.", fr: "Vous améliorez la structure des phrases, la précision et le registre à l'écrit." },
        gain_r6_f: { en: "Reading strategies", fr: "Stratégies de lecture" },
        gain_r6_o: { en: "You manage exam time better and read with purpose, not panic.", fr: "Vous gérez mieux le temps d'examen et lisez avec méthode plutôt qu'en panique." },
        gain_r7_f: { en: "Mock tests", fr: "Examens blancs" },
        gain_r7_o: { en: "You practise under test-like conditions and arrive on exam day prepared.", fr: "Vous vous entraînez en conditions d'examen et arrivez préparé le jour J." },
        gain_r8_f: { en: "Teacher feedback", fr: "Retour de l'enseignant" },
        gain_r8_o: { en: "You understand exactly where you lose points and how to fix it.", fr: "Vous savez précisément où vous perdez des points et comment corriger." },
        gain_r9_f: { en: "Progress tracking", fr: "Suivi des progrès" },
        gain_r9_o: { en: "You see measurable improvement across each of the four skills.", fr: "Vous mesurez vos progrès dans chacune des quatre compétences." },
        gain_r10_f: { en: "Career-focused French vocabulary", fr: "Vocabulaire de français axé sur la carrière" },
        gain_r10_o: { en: "You leave with French you can use beyond the exam — in work, study, and daily life.", fr: "Vous repartez avec un français utile au-delà de l'examen — au travail, dans les études et au quotidien." },

        // About the exam
        about_kicker: { en: "About the Exam", fr: "À propos de l'examen" },
        four_components_title: { en: "The Four Components", fr: "Les quatre épreuves" },
        chip_listening: { en: "Compréhension de l'oral (Listening)", fr: "Compréhension de l'oral" },
        chip_reading: { en: "Compréhension des écrits (Reading)", fr: "Compréhension des écrits" },
        chip_writing: { en: "Expression écrite (Writing)", fr: "Expression écrite" },
        chip_speaking: { en: "Expression orale (Speaking)", fr: "Expression orale" },
        ircc_li1: { en: "Recognized by IRCC for permanent residence", fr: "Reconnu par IRCC pour la résidence permanente" },
        ircc_li2: { en: "Required for Express Entry and PNP applications", fr: "Requis pour Entrée express et les demandes PCP" },
        ircc_li3: { en: "Accepted for Canadian citizenship", fr: "Accepté pour la citoyenneté canadienne" },
        ircc_li4: { en: "NCLC 7 = B2 level = up to 50 CRS bonus points", fr: "NCLC 7 = niveau B2 = jusqu'à 50 points CRS supplémentaires" },
        ircc_li5: { en: "Results valid for 2 years from exam date", fr: "Résultats valides 2 ans à compter de la date de l'examen" },

        // Comparison table
        diff_compare_intro: { en: "Both TEF and TCF are accepted by IRCC with equal weight. The differences are in format and question style — choose the one that fits how you test best.", fr: "Le TEF et le TCF sont reconnus par IRCC à parts égales. Les différences résident dans le format et le type de questions — choisissez celui qui correspond le mieux à votre style d'examen." },
        diff_listening: { en: "Listening", fr: "Écoute" },
        diff_reading: { en: "Reading", fr: "Lecture" },
        diff_writing: { en: "Writing", fr: "Écrit" },
        diff_speaking: { en: "Speaking", fr: "Oral" },
        diff_ircc: { en: "IRCC Accepted", fr: "Accepté par IRCC" },
        diff_standard_mcq: { en: "Standard MCQ", fr: "QCM classique" },
        diff_adaptive_mcq: { en: "Adaptive MCQ", fr: "QCM adaptatif" },
        diff_2_writing: { en: "2 written tasks", fr: "2 productions écrites" },
        diff_3_writing: { en: "3 written tasks", fr: "3 productions écrites" },
        diff_15_min: { en: "15-min interview", fr: "Entretien de 15 min" },
        diff_12_min: { en: "12-min interview", fr: "Entretien de 12 min" },

        // Approach
        approach_kicker: { en: "Our Approach", fr: "Notre approche" },
        included_title: { en: "What's included", fr: "Ce qui est inclus" },

        // Immigration block
        imm_kicker: { en: "Immigration & Citizenship Pathways", fr: "Voies d'immigration et de citoyenneté" },
        imm_title: { en: "If immigration is part of your goal", fr: "Si l'immigration fait partie de votre projet" },
        nclc_title: { en: "What is NCLC?", fr: "Qu'est-ce que le NCLC ?" },
        nclc_p: { en: "The Niveaux de compétence linguistique canadiens (NCLC) is Canada's official French language proficiency scale, running from NCLC 1 to NCLC 12. IRCC uses it to assess immigration applicants.", fr: "Les Niveaux de compétence linguistique canadiens (NCLC) constituent l'échelle officielle de français au Canada, de NCLC 1 à NCLC 12. IRCC les utilise pour évaluer les candidats à l'immigration." },
        nclc_li1: { en: "NCLC 4–5 → A2 level (basic)", fr: "NCLC 4–5 → niveau A2 (élémentaire)" },
        nclc_li2: { en: "NCLC 5–6 → B1 level (intermediate)", fr: "NCLC 5–6 → niveau B1 (intermédiaire)" },
        nclc_li3: { en: "NCLC 7–8 → B2 level (advanced)", fr: "NCLC 7–8 → niveau B2 (avancé)" },
        nclc_li4: { en: "NCLC 9–10 → C1 level (proficient)", fr: "NCLC 9–10 → niveau C1 (autonome)" },
        crs_title: { en: "CRS Bonus Points", fr: "Points CRS supplémentaires" },
        crs_p: { en: "Strong French proficiency under Express Entry earns additional Comprehensive Ranking System (CRS) points beyond your core skills score — meaningful in competitive draws.", fr: "Un bon niveau de français dans Entrée express octroie des points CRS supplémentaires au-delà des compétences de base — un atout dans les rondes les plus compétitives." },
        crs_li1: { en: "NCLC 7+ in all 4 skills: up to 50 CRS points", fr: "NCLC 7+ dans les 4 compétences : jusqu'à 50 points CRS" },
        crs_li2: { en: "NCLC 7+ in some skills: up to 25 CRS points", fr: "NCLC 7+ dans certaines compétences : jusqu'à 25 points CRS" },
        crs_li3: { en: "French + English bilingual bonus applies separately", fr: "Le bonus bilingue (français + anglais) s'applique séparément" },

        // Final CTA
        final_kicker: { en: "Start When You're Ready", fr: "Commencez quand vous êtes prêt" },
        final_title: { en: "French skills that open doors", fr: "Des compétences en français qui ouvrent des portes" },
        final_p: { en: "Book a free French level assessment. We'll talk about your goals — career, study, communication, immigration, or all of the above — and map out the right combination of prep, mock testing, and practice for you.", fr: "Réservez une évaluation gratuite de votre niveau. Nous parlerons de vos objectifs — carrière, études, communication, immigration ou tout cela à la fois — et bâtirons la bonne combinaison de préparation, d'examens blancs et de pratique." },
        final_btn_view_lang: { en: "View Regular French Program", fr: "Voir le programme régulier de français" }
    },

    // TEF-page-specific keys (subtitle, pill, prep details, exam name)
    tef: {
        breadcrumb_html: {
            en: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programs</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">French Programs</a> / TEF Canada',
            fr: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programmes</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">Programmes de français</a> / TEF Canada'
        },
        hero_subtitle: { en: "Our TEF Canada Preparation Program helps you build practical French skills for career, study, communication, and future opportunities in Canada — while preparing for the speaking, writing, listening, and reading tasks of the official TEF Canada exam. Improve your confidence, strengthen your resume, and open more doors.", fr: "Notre programme de préparation au TEF Canada vous aide à bâtir un français concret pour la carrière, les études, la communication et vos futures occasions au Canada — tout en préparant les épreuves d'expression, d'écrits, d'écoute et de lecture de l'examen officiel. Gagnez en confiance, renforcez votre CV et ouvrez davantage de portes." },
        pill_format: { en: "TEF-style mock practice", fr: "Examens blancs au format TEF" },

        promise_p: { en: "French is not only for immigration. French is a career advantage, a confidence builder, a study pathway, and a way to participate more fully in Canadian life. Our TEF Preparation Program gives you French skills you can use in real life — not just on exam day.", fr: "Le français n'est pas réservé à l'immigration. C'est un atout professionnel, une source de confiance, un chemin d'études et une façon de prendre part pleinement à la vie canadienne. Notre programme de préparation au TEF vous donne un français utile dans la vraie vie — pas seulement le jour de l'examen." },

        b2_p: { en: "Build structured language habits across speaking, listening, reading, writing, and test strategy — the same skills that translate into academic success.", fr: "Bâtissez des habitudes linguistiques structurées en expression orale, écoute, lecture, écriture et stratégie d'examen — les mêmes compétences qui mènent à la réussite académique." },
        b4_p: { en: "For students exploring immigration or citizenship, TEF Canada may be one accepted way to demonstrate French proficiency. We help you prepare with structured practice and feedback.", fr: "Pour les étudiants qui envisagent l'immigration ou la citoyenneté, le TEF Canada peut être une voie reconnue pour démontrer leur niveau de français. Nous vous aidons à vous y préparer avec une pratique structurée et des retours détaillés." },

        who_p: { en: "Students join our TEF Preparation Program for very different reasons. The structure is the same, but the outcomes are personal — we help you reach your specific goal.", fr: "Les étudiants choisissent notre préparation au TEF pour des raisons très diverses. La structure est la même, mais les résultats sont personnels — nous vous aidons à atteindre votre objectif." },
        s3_p: { en: "You want structured language improvement. The program builds grammar, vocabulary, reading comprehension, writing structure, listening accuracy, and speaking fluency through guided TEF-style practice.", fr: "Vous cherchez une progression linguistique structurée. Le programme renforce grammaire, vocabulaire, compréhension écrite, structure de l'écrit, précision de l'écoute et aisance à l'oral grâce à une pratique guidée au format TEF." },
        s5_p: { en: "You're exploring immigration or citizenship pathways and want to demonstrate French proficiency. TEF Canada may be one accepted route — we help you prepare through structured practice.", fr: "Vous envisagez l'immigration ou la citoyenneté et souhaitez démontrer votre niveau de français. Le TEF Canada peut être une voie reconnue — nous vous y préparons avec une pratique structurée." },

        gain_r2_f: { en: "TEF exam orientation", fr: "Orientation à l'examen TEF" },
        gain_r2_o: { en: "You understand the test format, timing, and scoring before exam day.", fr: "Vous comprenez le format, le minutage et la notation avant le jour de l'examen." },
        gain_r5_f: { en: "Listening training", fr: "Entraînement à l'écoute" },
        gain_r5_o: { en: "You handle native-speed audio with better comprehension and stamina.", fr: "Vous gérez les enregistrements à vitesse native avec plus de compréhension et d'endurance." },

        about_title: { en: "What TEF Canada tests", fr: "Ce qu'évalue le TEF Canada" },
        about_p: { en: "TEF Canada assesses all four core language skills — the same skills that matter in real-world communication. Each component is scored and, for students pursuing immigration or citizenship pathways, mapped to the NCLC (Niveaux de compétence linguistique canadiens) scale.", fr: "Le TEF Canada évalue les quatre compétences linguistiques essentielles — celles qui comptent vraiment dans la communication. Chaque épreuve est notée et, pour les étudiants en démarche d'immigration ou de citoyenneté, alignée sur l'échelle NCLC (Niveaux de compétence linguistique canadiens)." },
        about_format: { en: "TEF Canada uses a standardized multiple-choice format for listening and reading, plus separate written and oral production tasks.", fr: "Le TEF Canada utilise un format à choix multiples standardisé pour l'écoute et la lecture, avec des épreuves distinctes d'écriture et d'expression orale." },

        diff_title: { en: "How TEF Canada Differs", fr: "Ce qui distingue le TEF Canada" },

        approach_title: { en: "How MCC prepares you for TEF Canada", fr: "Comment MCC vous prépare au TEF Canada" },
        approach_p: { en: "Our TEF Canada prep is targeted and exam-specific. Every session is built around the official format, the question types, and the score breakdown that determines your NCLC level.", fr: "Notre préparation au TEF Canada est ciblée et propre à l'examen. Chaque séance est conçue autour du format officiel, des types de questions et de la grille de notation qui détermine votre NCLC." },
        included_li1: { en: "Full-length mock exams under timed conditions", fr: "Examens blancs complets en conditions chronométrées" },
        included_li2: { en: "Targeted strategies for each of the four components", fr: "Stratégies ciblées pour chacune des quatre épreuves" },
        included_li3: { en: "Individualized feedback on writing and speaking", fr: "Retours individualisés sur l'écrit et l'oral" },
        included_li4: { en: "Score prediction and NCLC estimation", fr: "Prédiction de score et estimation NCLC" },
        included_li5: { en: "CRS simulation to model your immigration profile", fr: "Simulation CRS pour modéliser votre profil d'immigration" },
        included_li6: { en: "Taught by instructors familiar with official TEF format", fr: "Enseigné par des formateurs qui connaissent le format officiel du TEF" },
        included_li7: { en: "Available in small-group or private 1-on-1 formats", fr: "Disponible en petit groupe ou en privé en tête-à-tête" },
        included_li8: { en: "Flexible 10-hour packages — renew at any time, no fixed session lock-in", fr: "Forfaits flexibles de 10 heures — renouvelables à tout moment, sans engagement de session" },

        imm_p: { en: "For students whose plans include Canadian immigration or citizenship, TEF Canada is one accepted way to demonstrate French proficiency. It's not the only reason to learn French — but if it's part of your goal, here's the context that matters.", fr: "Pour les étudiants dont le projet inclut l'immigration ou la citoyenneté canadienne, le TEF Canada est une voie reconnue pour démontrer leur niveau de français. Ce n'est pas la seule raison d'apprendre le français — mais si c'est dans vos plans, voici le contexte essentiel." }
    },

    // TCF-page-specific keys
    tcf: {
        breadcrumb_html: {
            en: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programs</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">French Programs</a> / TCF Canada',
            fr: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programmes</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">Programmes de français</a> / TCF Canada'
        },
        hero_subtitle: { en: "Our TCF Canada Preparation Program helps you build practical French skills for career, study, communication, and future opportunities in Canada — while preparing for the adaptive listening, reading, writing, and speaking tasks of the official TCF Canada exam. Improve your confidence, strengthen your resume, and open more doors.", fr: "Notre programme de préparation au TCF Canada vous aide à bâtir un français concret pour la carrière, les études, la communication et vos futures occasions au Canada — tout en préparant les épreuves adaptatives d'écoute, de lecture, d'écriture et d'expression orale de l'examen officiel. Gagnez en confiance, renforcez votre CV et ouvrez davantage de portes." },
        pill_format: { en: "TCF adaptive practice", fr: "Pratique adaptative TCF" },

        promise_p: { en: "French is not only for immigration. French is a career advantage, a confidence builder, a study pathway, and a way to participate more fully in Canadian life. Our TCF Preparation Program gives you French skills you can use in real life — not just on exam day.", fr: "Le français n'est pas réservé à l'immigration. C'est un atout professionnel, une source de confiance, un chemin d'études et une façon de prendre part pleinement à la vie canadienne. Notre programme de préparation au TCF vous donne un français utile dans la vraie vie — pas seulement le jour de l'examen." },

        b2_p: { en: "Build structured language habits across speaking, listening, reading, writing, and adaptive test strategy — the same skills that translate into academic success.", fr: "Bâtissez des habitudes linguistiques structurées en expression orale, écoute, lecture, écriture et stratégie d'examen adaptatif — les mêmes compétences qui mènent à la réussite académique." },
        b4_p: { en: "For students exploring immigration or citizenship, TCF Canada may be one accepted way to demonstrate French proficiency. We help you prepare with structured practice and feedback.", fr: "Pour les étudiants qui envisagent l'immigration ou la citoyenneté, le TCF Canada peut être une voie reconnue pour démontrer leur niveau de français. Nous vous aidons à vous y préparer avec une pratique structurée et des retours détaillés." },

        who_p: { en: "Students join our TCF Preparation Program for very different reasons. The structure is the same, but the outcomes are personal — we help you reach your specific goal.", fr: "Les étudiants choisissent notre préparation au TCF pour des raisons très diverses. La structure est la même, mais les résultats sont personnels — nous vous aidons à atteindre votre objectif." },
        s3_p: { en: "You want structured language improvement. The program builds grammar, vocabulary, reading comprehension, writing structure, listening accuracy, and speaking fluency through guided TCF-style practice.", fr: "Vous cherchez une progression linguistique structurée. Le programme renforce grammaire, vocabulaire, compréhension écrite, structure de l'écrit, précision de l'écoute et aisance à l'oral grâce à une pratique guidée au format TCF." },
        s5_p: { en: "You're exploring immigration or citizenship pathways and want to demonstrate French proficiency. TCF Canada may be one accepted route — we help you prepare through structured practice.", fr: "Vous envisagez l'immigration ou la citoyenneté et souhaitez démontrer votre niveau de français. Le TCF Canada peut être une voie reconnue — nous vous y préparons avec une pratique structurée." },

        gain_r2_f: { en: "TCF exam orientation", fr: "Orientation à l'examen TCF" },
        gain_r2_o: { en: "You understand the adaptive format, timing, and scoring before exam day.", fr: "Vous comprenez le format adaptatif, le minutage et la notation avant le jour de l'examen." },
        gain_r5_f: { en: "Listening training", fr: "Entraînement à l'écoute" },
        gain_r5_o: { en: "You handle adaptive audio with better comprehension and stamina.", fr: "Vous gérez les enregistrements adaptatifs avec plus de compréhension et d'endurance." },

        about_title: { en: "What TCF Canada tests", fr: "Ce qu'évalue le TCF Canada" },
        about_p: { en: "TCF Canada assesses all four core language skills — the same skills that matter in real-world communication. Each component is scored and, for students pursuing immigration or citizenship pathways, mapped to the NCLC (Niveaux de compétence linguistique canadiens) scale.", fr: "Le TCF Canada évalue les quatre compétences linguistiques essentielles — celles qui comptent vraiment dans la communication. Chaque épreuve est notée et, pour les étudiants en démarche d'immigration ou de citoyenneté, alignée sur l'échelle NCLC (Niveaux de compétence linguistique canadiens)." },
        about_format: { en: "TCF Canada uses an adaptive format for the listening and reading sections, plus separate written and oral production tasks.", fr: "Le TCF Canada utilise un format adaptatif pour les sections d'écoute et de lecture, avec des épreuves distinctes d'écriture et d'expression orale." },

        diff_title: { en: "How TCF Canada Differs", fr: "Ce qui distingue le TCF Canada" },
        diff_intro: { en: "Both TCF and TEF are accepted by IRCC with equal weight. The differences are in format and question style — choose the one that fits how you test best.", fr: "Le TCF et le TEF sont reconnus par IRCC à parts égales. Les différences résident dans le format et le type de questions — choisissez celui qui correspond le mieux à votre style d'examen." },

        approach_title: { en: "How MCC prepares you for TCF Canada", fr: "Comment MCC vous prépare au TCF Canada" },
        approach_p: { en: "Our TCF Canada prep is targeted and exam-specific — not a general French class. Every session is built around the official adaptive format and the score breakdown that determines your NCLC level.", fr: "Notre préparation au TCF Canada est ciblée et propre à l'examen — pas un cours de français général. Chaque séance est conçue autour du format adaptatif officiel et de la grille de notation qui détermine votre NCLC." },
        included_li1: { en: "Full TCF Canada practice tests under timed conditions", fr: "Examens blancs complets de TCF Canada en conditions chronométrées" },
        included_li2: { en: "Adaptive listening and reading strategy training", fr: "Stratégies ciblées pour les sections adaptatives d'écoute et de lecture" },
        included_li3: { en: "Written production practice with examiner-style marking", fr: "Pratique de production écrite avec notation à la manière d'un examinateur" },
        included_li4: { en: "Oral production coaching and scoring breakdown", fr: "Coaching de production orale et décomposition du score" },
        included_li5: { en: "NCLC estimation and CRS point projection", fr: "Estimation NCLC et projection des points CRS" },
        included_li6: { en: "Personalized feedback after every mock exam", fr: "Retours personnalisés après chaque examen blanc" },
        included_li7: { en: "Available in small-group or private 1-on-1 formats", fr: "Disponible en petit groupe ou en privé en tête-à-tête" },
        included_li8: { en: "Flexible 10-hour packages — renew at any time", fr: "Forfaits flexibles de 10 heures — renouvelables à tout moment" },

        imm_p: { en: "For students whose plans include Canadian immigration or citizenship, TCF Canada is one accepted way to demonstrate French proficiency. It's not the only reason to learn French — but if it's part of your goal, here's the context that matters.", fr: "Pour les étudiants dont le projet inclut l'immigration ou la citoyenneté canadienne, le TCF Canada est une voie reconnue pour démontrer leur niveau de français. Ce n'est pas la seule raison d'apprendre le français — mais si c'est dans vos plans, voici le contexte essentiel." }
    },

    flang: {
        breadcrumb_html: {
            en: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programs</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">French Programs</a> / French Language',
            fr: '<a href="programs.html" style="color:inherit;text-decoration:none;">Programmes</a> / <a href="programs-french.html" style="color:inherit;text-decoration:none;">Programmes de français</a> / Langue française'
        },
        hero_title: { en: "A complete French pathway, from absolute beginner to advanced", fr: "Un parcours de français complet, du grand débutant au niveau avancé" },
        hero_subtitle: { en: "Four structured levels (A1–B2) designed to Canadian academic standards. Each level runs a 12-week session of 120 instructional hours — 2 hours per class, 5 days per week. In-person in Vancouver or fully online.", fr: "Quatre niveaux structurés (A1 à B2), alignés sur les normes universitaires canadiennes. Chaque niveau dure 12 semaines, à raison de 120 heures d'enseignement — 2 heures par cours, 5 jours par semaine. En présentiel à Vancouver ou entièrement en ligne." },
        pill_levels: { en: "4 structured levels (A1–B2)", fr: "4 niveaux structurés (A1 à B2)" },
        pill_sessions: { en: "12-week sessions", fr: "Sessions de 12 semaines" },
        pill_modes: { en: "In-person & online", fr: "En présentiel et en ligne" },

        why_kicker: { en: "Why French at MCC", fr: "Pourquoi étudier le français à MCC" },
        why_title: { en: "French opens doors across Canada", fr: "Le français ouvre des portes partout au Canada" },
        why_p: { en: "French is an official language of Canada and a direct pathway to faster immigration, higher CRS scores, and academic admission. MCC's French program teaches the language properly — not as a theme, but as a full linguistic and communicative system.", fr: "Le français est l'une des deux langues officielles du Canada et un véritable accélérateur pour l'immigration, les points CRS et l'admission universitaire. Notre programme enseigne le français comme un système linguistique et communicatif complet, pas comme un simple thème." },
        why1_title: { en: "Express Entry Advantage", fr: "Avantage Entrée express" },
        why1_p: { en: "Reaching NCLC 7 in French (B2) can add up to 50 CRS bonus points — a meaningful advantage in Canada's Express Entry immigration system.", fr: "Atteindre le NCLC 7 en français (B2) peut rapporter jusqu'à 50 points CRS supplémentaires — un avantage non négligeable dans Entrée express." },
        why2_title: { en: "Academic Admission", fr: "Admission universitaire" },
        why2_p: { en: "French B2 (Niveau Avancé) meets the language requirements for college and university admission at many Canadian francophone and bilingual institutions.", fr: "Le niveau B2 (Avancé) répond aux exigences linguistiques de nombreux collèges et universités francophones et bilingues du Canada." },
        why3_title: { en: "Professional Reach", fr: "Portée professionnelle" },
        why3_p: { en: "Bilingualism is a competitive edge in the Canadian federal workforce, healthcare, education, and any sector serving Canada's francophone communities.", fr: "Le bilinguisme est un atout dans la fonction publique fédérale, en santé, en éducation et dans tout secteur qui dessert les communautés francophones du Canada." },
        why4_title: { en: "Provincial Nominee Programs", fr: "Programmes des candidats des provinces" },
        why4_p: { en: "French proficiency is recognized across multiple Provincial Nominee Programs (PNPs), opening additional immigration pathways beyond Express Entry.", fr: "La maîtrise du français est reconnue dans plusieurs Programmes des candidats des provinces (PCP), ce qui élargit les voies d'immigration au-delà d'Entrée express." },

        levels_kicker: { en: "Regular French Program", fr: "Programme de français régulier" },
        levels_title: { en: "Four levels. One complete pathway.", fr: "Quatre niveaux. Un parcours complet." },
        levels_p: { en: "Each level follows a 12-week session of 120 instructional hours — 2 hours per class, 5 days per week. Available in-person in Vancouver or fully online.", fr: "Chaque niveau correspond à une session de 12 semaines totalisant 120 heures d'enseignement — 2 heures par cours, 5 jours par semaine. Offert en présentiel à Vancouver ou entièrement en ligne." },

        // Heading variants — bilingual in EN, French-only in FR
        n1_h: { en: "Niveau 1 — Élémentaire / Level 1 — Elementary", fr: "Niveau 1 — Élémentaire" },
        n1_sub: { en: "Absolute beginner. Zero prior French knowledge required.", fr: "Grand débutant. Aucune connaissance préalable du français n'est requise." },
        n1_p: { en: "Learn French pronunciation from the ground up — vowel sounds, liaison, intonation. Build core grammar: articles, gender, present tense, basic sentence structure. Develop the vocabulary for greetings, introductions, numbers, time, dates, and immediate surroundings.", fr: "Apprenez la prononciation française depuis la base — voyelles, liaisons, intonation. Construisez la grammaire essentielle : articles, genre, présent de l'indicatif, structure de phrase. Développez le vocabulaire des salutations, présentations, nombres, heures, dates et environnement immédiat." },
        n1_li1: { en: "Pronunciation and phonetics", fr: "Prononciation et phonétique" },
        n1_li2: { en: "Gender and articles (le, la, les)", fr: "Genre et articles (le, la, les)" },
        n1_li3: { en: "Greetings and introductions", fr: "Salutations et présentations" },
        n1_li4: { en: "Numbers, dates, and time", fr: "Nombres, dates et heures" },
        n1_li5: { en: "Present tense — regular verbs", fr: "Présent de l'indicatif — verbes réguliers" },
        n1_li6: { en: "Describing people and places", fr: "Décrire des personnes et des lieux" },
        n1_li7: { en: "Common nouns and adjectives", fr: "Noms et adjectifs courants" },
        n1_li8: { en: "Simple questions and answers", fr: "Questions et réponses simples" },

        n2_h: { en: "Niveau 2 — Pré-Intermédiaire / Level 2 — Pre-Intermediate", fr: "Niveau 2 — Pré-Intermédiaire" },
        n2_sub: { en: "Expanding vocabulary and daily communication.", fr: "Élargissement du vocabulaire et communication au quotidien." },
        n2_p: { en: "Build the language for daily life in French: shopping, travel, appointments, and social situations. Introduce the passé composé and imparfait to talk about the past. Read simple texts with comprehension and write short messages and descriptions.", fr: "Maîtrisez la langue de la vie quotidienne en français : courses, déplacements, rendez-vous et situations sociales. Introduction au passé composé et à l'imparfait pour parler du passé. Lisez des textes simples avec compréhension et rédigez de courts messages et descriptions." },
        n2_li1: { en: "Passé composé — past actions", fr: "Passé composé — actions passées" },
        n2_li2: { en: "Imparfait — description in the past", fr: "Imparfait — description dans le passé" },
        n2_li3: { en: "Vocabulary for shopping and travel", fr: "Vocabulaire des courses et des déplacements" },
        n2_li4: { en: "Irregular past participles (être, avoir, aller)", fr: "Participes passés irréguliers (être, avoir, aller)" },
        n2_li5: { en: "Negation and question forms", fr: "Négation et formes interrogatives" },
        n2_li6: { en: "Reading simple texts and signs", fr: "Lecture de textes et de signaux simples" },
        n2_li7: { en: "Writing short messages and emails", fr: "Rédaction de courts messages et courriels" },
        n2_li8: { en: "Listening to everyday dialogues", fr: "Écoute de dialogues du quotidien" },

        n3_h: { en: "Niveau 3 — Intermédiaire / Level 3 — Intermediate", fr: "Niveau 3 — Intermédiaire" },
        n3_sub: { en: "All four skills — preparing for academic and work contexts.", fr: "Les quatre compétences — préparation aux contextes universitaires et professionnels." },
        n3_p: { en: "Develop all four core skills — listening, speaking, reading, and writing — with equal attention. Express opinions, narrate stories, handle school and workplace situations, and begin preparing for the TEF and TCF exams. Develop the grammatical and lexical range needed for NCLC 5–6.", fr: "Développez les quatre compétences fondamentales — écoute, expression orale, lecture et écriture — avec la même attention. Exprimez des opinions, racontez des histoires, gérez des situations scolaires et professionnelles, et commencez la préparation aux examens TEF et TCF. Acquérez l'étendue grammaticale et lexicale nécessaire au NCLC 5–6." },
        n3_li1: { en: "Futur simple and conditionnel présent", fr: "Futur simple et conditionnel présent" },
        n3_li2: { en: "Subjonctif présent — expressing opinion", fr: "Subjonctif présent — pour exprimer l'opinion" },
        n3_li3: { en: "Workplace and academic language", fr: "Langue du travail et du milieu universitaire" },
        n3_li4: { en: "Expressing disagreement and nuance", fr: "Exprimer le désaccord et la nuance" },
        n3_li5: { en: "Reading news articles and reports", fr: "Lecture d'articles d'actualité et de rapports" },
        n3_li6: { en: "Structured oral presentations", fr: "Présentations orales structurées" },
        n3_li7: { en: "Formal and informal writing registers", fr: "Registres d'écriture formel et informel" },
        n3_li8: { en: "Introduction to TEF/TCF format", fr: "Introduction au format TEF/TCF" },

        n4_h: { en: "Niveau 4 — Avancé / Level 4 — Advanced", fr: "Niveau 4 — Avancé" },
        n4_sub: { en: "Immigration-ready, university-ready, professionally functional.", fr: "Prêt pour l'immigration, l'université et le milieu professionnel." },
        n4_p: { en: "Reach the level required for Canadian immigration (NCLC 7+), college and university admission, and professional use of French. Understand complex spoken and written content, produce sophisticated written work, and communicate fluently in high-stakes situations.", fr: "Atteignez le niveau requis pour l'immigration canadienne (NCLC 7+), l'admission collégiale et universitaire et l'usage professionnel du français. Comprenez des contenus oraux et écrits complexes, produisez des écrits soignés et communiquez avec aisance dans des situations à fort enjeu." },
        n4_li1: { en: "Complex grammatical structures", fr: "Structures grammaticales complexes" },
        n4_li2: { en: "Idiomatic and register variation", fr: "Expressions idiomatiques et variation des registres" },
        n4_li3: { en: "Argumentative and analytical writing", fr: "Écriture argumentative et analytique" },
        n4_li4: { en: "Listening to native-speed audio", fr: "Écoute d'enregistrements à vitesse native" },
        n4_li5: { en: "NCLC 7–9 target outcomes", fr: "Cibles NCLC 7 à 9" },
        n4_li6: { en: "Strong base for TEF/TCF prep", fr: "Base solide pour la préparation au TEF/TCF" },
        n4_li7: { en: "University-ready academic French", fr: "Français universitaire" },
        n4_li8: { en: "Professional spoken fluency", fr: "Aisance à l'oral en contexte professionnel" },

        info_weeks: { en: "weeks per session", fr: "semaines par session" },
        info_hours: { en: "instructional hours", fr: "heures d'enseignement" },
        info_per_class: { en: "per class, 5 days/week", fr: "par cours, 5 jours/semaine" },
        info_modes: { en: "In-person & online", fr: "En présentiel et en ligne" },

        next_kicker: { en: "Next Steps", fr: "Prochaines étapes" },
        next_title: { en: "Going beyond the regular program", fr: "Au-delà du programme régulier" },
        next_p: { en: "Once you reach Niveau 3 or Niveau 4, most students move into focused exam preparation for Canadian immigration or academic admission. We offer dedicated tracks for both official exams.", fr: "Une fois aux Niveaux 3 ou 4, la plupart des étudiants se tournent vers une préparation ciblée aux examens en vue de l'immigration ou de l'admission universitaire. Nous proposons des parcours dédiés pour les deux examens officiels." },
        tef_title: { en: "TEF Canada Preparation", fr: "Préparation au TEF Canada" },
        tef_p: { en: "Targeted, exam-specific prep for Test d'Évaluation de Français — the IRCC-recognized French exam used for Express Entry, PNPs, and citizenship.", fr: "Préparation ciblée et propre au Test d'Évaluation de Français — l'examen reconnu par IRCC pour Entrée express, les PCP et la citoyenneté." },
        tef_link: { en: "Explore TEF prep", fr: "Découvrir la préparation au TEF" },
        tcf_title: { en: "TCF Canada Preparation", fr: "Préparation au TCF Canada" },
        tcf_p: { en: "Adaptive, format-specific prep for Test de Connaissance du Français — equally recognized by IRCC for immigration and citizenship pathways.", fr: "Préparation adaptative et propre au format du Test de connaissance du français — également reconnu par IRCC pour les voies d'immigration et de citoyenneté." },
        tcf_link: { en: "Explore TCF prep", fr: "Découvrir la préparation au TCF" },

        cta_kicker: { en: "Enroll Today", fr: "Inscrivez-vous dès aujourd'hui" },
        cta_title: { en: "Start your French journey", fr: "Lancez votre parcours en français" },
        cta_p: { en: "Speak with an advisor about your goals and current French level. We'll help you map out the right combination of regular program and, when you're ready, exam prep.", fr: "Discutez avec un conseiller de vos objectifs et de votre niveau actuel. Nous vous aiderons à bâtir la bonne combinaison entre le programme régulier et, le moment venu, la préparation aux examens." },
        cta_btn_advisor: { en: "Talk to an Advisor", fr: "Parler à un conseiller" },
        cta_btn_apply: { en: "Apply Now", fr: "Postuler maintenant" }
    },

    admissions: {
        hero_eyebrow: { en: "Admissions Overview", fr: "Aperçu des admissions" },
        hero_title: { en: "Everything future students need to move forward clearly", fr: "Tout ce qu'il faut aux futurs étudiants pour avancer en clarté" },
        hero_subtitle: { en: "Use this hub to understand your admissions path, review requirements, plan tuition, and start your application with confidence.", fr: "Utilisez ce carrefour pour comprendre votre parcours d'admission, vérifier les conditions, planifier les frais et commencer votre candidature en toute confiance." },
        pill_journey: { en: "Step-by-step admissions journey", fr: "Parcours d'admission étape par étape" },
        pill_intl: { en: "International student guidance", fr: "Accompagnement pour étudiants internationaux" },
        pill_advisor: { en: "Direct support from advisors", fr: "Soutien direct de conseillers" },
        start_strong: { en: "Best place to start", fr: "Le meilleur point de départ" },
        start_p: { en: "If you are new to MCC, begin here before visiting the more detailed pages. This page is designed to reduce confusion and help you choose the right next step.", fr: "Si vous découvrez MCC, commencez ici avant les pages plus détaillées. Cette page est pensée pour réduire la confusion et vous orienter vers la bonne prochaine étape." },

        route_kicker: { en: "Your Admissions Route", fr: "Votre parcours d'admission" },
        route_title: { en: "Choose the page that answers your next question", fr: "Choisissez la page qui répond à votre prochaine question" },
        route_copy: { en: "This hub is structured around the real decisions students make while exploring college: what to study, whether they qualify, how tuition works, and how to apply.", fr: "Ce carrefour est structuré autour des vraies décisions étudiantes : quoi étudier, êtes-vous admissible, comment fonctionnent les frais et comment postuler." },
        r1_title: { en: "Admission Procedure", fr: "Procédure d'admission" },
        r1_p: { en: "See the full application journey from inquiry and documents to offer and acceptance.", fr: "Voyez le parcours complet, de la demande et des documents jusqu'à l'offre et l'acceptation." },
        r1_link: { en: "View the process", fr: "Voir la procédure" },
        r2_title: { en: "Requirements", fr: "Conditions" },
        r2_p: { en: "Review general entrance expectations and program-specific requirements before you apply.", fr: "Examinez les conditions générales et propres au programme avant de postuler." },
        r2_link: { en: "Check requirements", fr: "Vérifier les conditions" },
        r3_title: { en: "Tuition & Payments", fr: "Frais et paiements" },
        r3_p: { en: "Understand the categories of fees, payment timing, and where to request a personalized estimate.", fr: "Comprenez les catégories de frais, les échéances et où demander une estimation personnalisée." },
        r3_link: { en: "Plan tuition", fr: "Planifier les frais" },
        r4_title: { en: "Apply for Admissions", fr: "Postuler aux admissions" },
        r4_p: { en: "Use our step-by-step application form once you are ready to submit your information.", fr: "Utilisez notre formulaire de candidature étape par étape lorsque vous êtes prêt." },
        r4_link: { en: "Start your application", fr: "Commencer votre candidature" },

        d1_title: { en: "Before you apply", fr: "Avant de postuler" },
        d1_p: { en: "We recommend that students review program fit, entry requirements, and tuition planning before beginning the application form.", fr: "Nous recommandons aux étudiants de vérifier le bon programme, les conditions d'admission et la planification des frais avant de commencer le formulaire." },
        d1_li1: { en: "Compare programs and intended career direction", fr: "Comparer les programmes et l'orientation professionnelle visée" },
        d1_li2: { en: "Confirm academic and language eligibility", fr: "Confirmer l'admissibilité académique et linguistique" },
        d1_li3: { en: "Prepare key documents before submission", fr: "Préparer les documents clés avant l'envoi" },
        d2_title: { en: "For international students", fr: "Pour les étudiants internationaux" },
        d2_p: { en: "International applicants should begin earlier to allow time for document preparation, offer processing, and study permit planning.", fr: "Les candidats internationaux devraient commencer plus tôt pour préparer leurs documents, traiter l'offre et planifier le permis d'études." },
        d2_li1: { en: "Passport and prior education documentation", fr: "Passeport et documents de scolarité antérieurs" },
        d2_li2: { en: "English proficiency evidence where required", fr: "Preuve de compétence en anglais lorsque requis" },
        d2_li3: { en: "Planning for visa and arrival timelines", fr: "Planification des délais de visa et d'arrivée" },
        d2_link: { en: "Explore international guidance", fr: "Voir l'accompagnement international" },
        d3_title: { en: "Need personal support?", fr: "Besoin d'un soutien personnalisé ?" },
        d3_p: { en: "Students do not always need another general paragraph. Sometimes they need to speak with someone who can clarify the next step quickly.", fr: "Les étudiants n'ont pas toujours besoin d'un autre paragraphe général. Parfois, il faut parler à quelqu'un qui clarifie rapidement la suite." },
        d3_li1: { en: "Program comparison support", fr: "Aide à la comparaison des programmes" },
        d3_li2: { en: "Questions about documents and deadlines", fr: "Questions sur les documents et les échéances" },
        d3_li3: { en: "Guidance for application readiness", fr: "Conseils pour bien préparer votre candidature" },
        d3_link: { en: "Talk to admissions", fr: "Parler aux admissions" },

        rec_kicker: { en: "Recommended Path", fr: "Parcours recommandé" },
        rec_title: { en: "Start with requirements, then move into the application", fr: "Commencez par les conditions, puis passez à la candidature" },
        rec_p: { en: "Most admissions friction comes from students applying before they understand program fit or required documents. Reviewing the requirements page first usually makes the application itself much smoother.", fr: "La plupart des frictions à l'admission viennent d'étudiants qui postulent avant de comprendre le bon programme ou les documents requis. Consulter d'abord la page des conditions rend souvent la candidature beaucoup plus fluide." },
        rec_btn_review: { en: "Review Requirements", fr: "Voir les conditions" },
        rec_btn_apply: { en: "Go to Application", fr: "Aller au formulaire" }
    },

    about: {
        hero_eyebrow: { en: "About MCC", fr: "À propos de MCC" },
        hero_title: { en: "A college built around clarity, care, and career momentum", fr: "Un collège bâti sur la clarté, l'attention et l'élan professionnel" },
        hero_subtitle: { en: "Metropolitan Community College is designed for students who want a supportive learning environment, practical training, and a more direct path into opportunity.", fr: "Le Metropolitan Community College est conçu pour les étudiants qui veulent un cadre d'apprentissage bienveillant, une formation pratique et un chemin plus direct vers les opportunités." },
        pill_ptib: { en: "PTIB accredited", fr: "Accrédité PTIB" },
        pill_eqa: { en: "BC EQA designated", fr: "Désigné BC EQA" },
        pill_downtown: { en: "Downtown Vancouver", fr: "Centre-ville de Vancouver" },

        mission_title: { en: "Our mission", fr: "Notre mission" },
        mission_p: { en: "We provide accessible, practical education that prepares students for meaningful careers in a changing world. MCC focuses on real skill-building, supportive advising, and programs that connect learning to next steps.", fr: "Nous offrons une éducation accessible et pratique qui prépare les étudiants à des carrières significatives dans un monde en changement. MCC met l'accent sur le développement réel des compétences, un accompagnement bienveillant et des programmes qui relient l'apprentissage aux prochaines étapes." },
        vision_title: { en: "Our vision", fr: "Notre vision" },
        vision_p: { en: "We aim to be a community college experience where students feel guided, capable, and ready to move forward with confidence in both their education and professional future.", fr: "Nous voulons offrir une expérience de collège communautaire où les étudiants se sentent guidés, capables et prêts à avancer avec confiance, tant dans leurs études que dans leur avenir professionnel." },

        values_kicker: { en: "Core Values", fr: "Valeurs fondamentales" },
        values_title: { en: "The values shaping the MCC experience", fr: "Les valeurs qui façonnent l'expérience MCC" },
        v1_title: { en: "Excellence", fr: "Excellence" },
        v1_p: { en: "We build programs, support systems, and communications that aim to be genuinely useful, not just decorative.", fr: "Nous bâtissons des programmes, un soutien et une communication qui se veulent vraiment utiles, et non décoratifs." },
        v2_title: { en: "Innovation", fr: "Innovation" },
        v2_p: { en: "MCC embraces modern fields, evolving industries, and practical ways of teaching students who want to stay current.", fr: "MCC embrasse les domaines modernes, les industries en évolution et des manières pratiques d'enseigner aux étudiants qui veulent rester à jour." },
        v3_title: { en: "Care", fr: "Bienveillance" },
        v3_p: { en: "Students should feel supported through admissions, during study, and while planning what comes next.", fr: "Les étudiants doivent se sentir soutenus, de l'admission jusqu'aux études et au-delà." },

        proof_programs: { en: "Programs", fr: "Programmes" },
        proof_programs_p: { en: "Career-ready pathways designed around practical learning.", fr: "Des parcours prêts pour la carrière, conçus autour de l'apprentissage pratique." },
        proof_grads: { en: "Graduates", fr: "Diplômés" },
        proof_grads_p: { en: "A growing alumni community with diverse next steps.", fr: "Une communauté d'anciens en croissance, aux parcours variés." },
        proof_countries: { en: "Countries", fr: "Pays" },
        proof_countries_p: { en: "An international student population studying in Vancouver.", fr: "Une population étudiante internationale qui étudie à Vancouver." },
        proof_satisfaction: { en: "Student Satisfaction", fr: "Satisfaction étudiante" },
        proof_satisfaction_p: { en: "Supportive advising and student-first communication matter.", fr: "L'accompagnement bienveillant et une communication centrée sur l'étudiant comptent." },

        credentials_kicker: { en: "Credentials & Recognition", fr: "Titres et reconnaissance" },
        credentials_title: { en: "PTIB and BC EQA designations students can recognize", fr: "Des désignations PTIB et BC EQA que les étudiants peuvent reconnaître" },
        credentials_intro: { en: "MCC communicates its institutional designations clearly so students, families, and partners can understand the standards behind the college experience.", fr: "MCC communique clairement ses désignations institutionnelles afin que les étudiants, les familles et les partenaires comprennent les normes derrière l'expérience du collège." },
        credentials_ptib_title: { en: "PTIB designated", fr: "Désigné par le PTIB" },
        credentials_ptib_p: { en: "Metropolitan Community College is designated by the Private Training Institutions Branch of British Columbia, supporting clear expectations for student protection, institutional standards, and approved program delivery.", fr: "Metropolitan Community College est désigné par la Private Training Institutions Branch de la Colombie-Britannique, ce qui soutient des attentes claires en matière de protection des étudiants, de normes institutionnelles et de prestation de programmes approuvés." },
        credentials_eqa_title: { en: "BC EQA designated", fr: "Désigné BC EQA" },
        credentials_eqa_p: { en: "The BC Education Quality Assurance designation identifies post-secondary institutions that meet provincial quality assurance expectations, giving students another signal of accountability and recognized standards.", fr: "La désignation BC Education Quality Assurance identifie les établissements postsecondaires qui répondent aux attentes provinciales en matière d'assurance qualité, offrant aux étudiants un autre signal de responsabilité et de normes reconnues." },
        credentials_dli_title: { en: "International student readiness", fr: "Préparation pour les étudiants internationaux" },
        credentials_dli_p: { en: "MCC also maintains clear admissions, document, and student-support processes for international learners planning their studies in Vancouver.", fr: "MCC maintient également des processus clairs d'admission, de documents et de soutien aux étudiants pour les apprenants internationaux qui planifient leurs études à Vancouver." },

        campus_kicker: { en: "Our Campus", fr: "Notre campus" },
        campus_title: { en: "A downtown Vancouver learning environment with city access built in", fr: "Un environnement d'apprentissage au centre-ville de Vancouver, ouvert sur la ville" },
        campus_p: { en: "Located at 322 Water St #100, Vancouver, BC, V6B 1B6, Canada, MCC places students close to transit, culture, and the pace of city life. The campus setting supports both local and international students who want a connected Vancouver experience.", fr: "Situé au 322 Water St #100, Vancouver, C.-B., V6B 1B6, Canada, MCC place les étudiants à proximité des transports, de la culture et du rythme de la ville. Le campus convient autant aux étudiants locaux qu'internationaux qui souhaitent une expérience de Vancouver bien connectée." },
        campus_btn_contact: { en: "Contact MCC", fr: "Contacter MCC" },
        campus_btn_programs: { en: "Explore Programs", fr: "Explorer les programmes" }
    },

    contact: {
        topbar_active: { en: "Contact", fr: "Contact" },
        hero_eyebrow: { en: "Contact MCC", fr: "Contacter MCC" },
        hero_title: { en: "Get answers from a team that actually helps students move forward", fr: "Obtenez des réponses d'une équipe qui aide vraiment les étudiants à avancer" },
        hero_subtitle: { en: "The contact page should work like the rest of the new MCC site: clear, warm, and useful. Use it when you need admissions help, program guidance, or campus information.", fr: "Cette page fonctionne comme le reste du site MCC : claire, chaleureuse et utile. Utilisez-la pour toute question sur l'admission, les programmes ou le campus." },
        pill_phone: { en: "604-300-3123", fr: "604-300-3123" },
        pill_email: { en: "admin@metropolitancollege.ca", fr: "admin@metropolitancollege.ca" },
        pill_hours: { en: "Monday - Friday, 9:00 AM - 5:00 PM", fr: "Du lundi au vendredi, de 9 h à 17 h" },

        c1_title: { en: "Ask about admissions", fr: "Posez vos questions sur l'admission" },
        c1_p: { en: "Get help with program fit, requirements, documents, and the application process.", fr: "Obtenez de l'aide pour le choix de programme, les conditions, les documents et la procédure de candidature." },
        c2_title: { en: "Plan your next step", fr: "Planifiez votre prochaine étape" },
        c2_p: { en: "Use contact support if you are comparing programs or unsure which page to visit next.", fr: "Contactez-nous si vous comparez des programmes ou ne savez pas où chercher ensuite." },
        c3_title: { en: "Visit and connect", fr: "Visitez et restez en contact" },
        c3_p: { en: "Ask about campus location, student support, and practical planning for studying in Vancouver.", fr: "Renseignez-vous sur l'emplacement du campus, le soutien étudiant et la planification pratique pour étudier à Vancouver." },

        send_kicker: { en: "Send a Message", fr: "Envoyer un message" },
        send_title: { en: "Talk to our team", fr: "Parlez à notre équipe" },
        f_full_name: { en: "Full Name", fr: "Nom complet" },
        f_email: { en: "Email", fr: "Courriel" },
        f_phone: { en: "Phone (optional)", fr: "Téléphone (facultatif)" },
        f_subject: { en: "Subject", fr: "Sujet" },
        f_select_topic: { en: "Select a topic", fr: "Sélectionner un sujet" },
        f_topic_admissions: { en: "Admissions", fr: "Admissions" },
        f_topic_programs: { en: "Programs", fr: "Programmes" },
        f_topic_intl: { en: "International Students", fr: "Étudiants internationaux" },
        f_topic_career: { en: "Career Services", fr: "Services de carrière" },
        f_topic_other: { en: "Other", fr: "Autre" },
        f_message: { en: "Message", fr: "Message" },
        f_send: { en: "Send Message", fr: "Envoyer le message" },
        f_success_title: { en: "Message sent", fr: "Message envoyé" },
        f_success_p: { en: "We will get back to you shortly.", fr: "Nous vous répondrons rapidement." },

        visit_title: { en: "Visit our campus", fr: "Visitez notre campus" },
        visit_note: { en: "MCC is located in Vancouver's Gastown area. Appointments are recommended for admissions or advising visits so the right team member is available for you.", fr: "MCC est situé dans le quartier Gastown de Vancouver. Les rendez-vous sont recommandés pour les visites liées aux admissions ou aux conseils afin que la bonne personne soit disponible pour vous." },
        visit_btn: { en: "Get Directions", fr: "Obtenir l'itinéraire" },

        faq_title: { en: "Frequently Asked Questions", fr: "Questions fréquentes" },
        faq1_q: { en: "How do I apply to MCC?", fr: "Comment postuler à MCC ?" },
        faq1_a: { en: "Use our step-by-step application form on the Apply for Admissions page, then submit the required information and documents for review.", fr: "Utilisez notre formulaire de candidature étape par étape sur la page Postuler aux admissions, puis soumettez les renseignements et documents requis." },
        faq2_q: { en: "What are the admission requirements?", fr: "Quelles sont les conditions d'admission ?" },
        faq2_a: { en: "General requirements include academic readiness, identity documentation, and language readiness appropriate to the selected program.", fr: "Les conditions générales incluent une préparation académique suffisante, des pièces d'identité et un niveau de langue adapté au programme choisi." },
        faq3_q: { en: "Does MCC support international students?", fr: "MCC accompagne-t-il les étudiants internationaux ?" },
        faq3_a: { en: "Yes. International students can explore admissions guidance, document preparation, and Vancouver planning through our International Students page.", fr: "Oui. Les étudiants internationaux trouvent des conseils d'admission, la préparation des documents et la planification à Vancouver sur notre page Étudiants internationaux." },
        faq4_q: { en: "How can I estimate tuition?", fr: "Comment estimer les frais de scolarité ?" },
        faq4_a: { en: "Visit the Tuition, Fees & Payments page for planning guidance, then contact admissions for a program-specific estimate.", fr: "Consultez la page Frais de scolarité et paiements pour des conseils, puis contactez les admissions pour une estimation propre au programme." },
        faq5_q: { en: "Can someone help me choose a program?", fr: "Quelqu'un peut-il m'aider à choisir un programme ?" },
        faq5_a: { en: "Absolutely. The admissions team can help you compare pathways, requirements, and next steps based on your goals.", fr: "Tout à fait. L'équipe des admissions peut vous aider à comparer les parcours, les conditions et les prochaines étapes selon vos objectifs." }
    },

    apply: {
        // Hero
        hero_eyebrow: { en: "Apply for Admissions", fr: "Postuler aux admissions" },
        hero_title: { en: "Start your journey today — in four guided steps", fr: "Commencez votre parcours aujourd'hui — en quatre étapes guidées" },
        hero_subtitle: { en: "Tell us about yourself, your agency (if any), the program you want to study, and upload your documents. Each step is simple, and we'll guide you through.", fr: "Parlez-nous de vous, de votre agence (le cas échéant), du programme qui vous intéresse et téléversez vos documents. Chaque étape est simple, et nous vous accompagnons." },
        pill_four_step: { en: "Four-step application", fr: "Candidature en quatre étapes" },
        pill_secure: { en: "Secure submission", fr: "Soumission sécurisée" },
        pill_advisor: { en: "Advisor support available", fr: "Soutien d'un conseiller disponible" },
        before_strong: { en: "Before you begin", fr: "Avant de commencer" },
        before_p: { en: "Have your passport, study permit (if applicable), academic transcripts, and English-test results ready as PDF or image files (max 15 MB each).", fr: "Préparez votre passeport, votre permis d'études (le cas échéant), vos relevés de notes et vos résultats d'examen d'anglais en format PDF ou image (15 Mo maximum par fichier)." },

        // Sidebar
        sidebar_kicker: { en: "Application Guide", fr: "Guide de candidature" },
        sidebar_title: { en: "What to have ready", fr: "Ce qu'il faut préparer" },
        sidebar_intro: { en: "Four short steps. Here's what each one needs from you.", fr: "Quatre étapes courtes. Voici ce qu'il faut pour chacune." },
        sidebar_p1_strong: { en: "Step 1 — Personal info", fr: "Étape 1 — Renseignements personnels" },
        sidebar_p1_p: { en: "Name, contact, citizenship, status in Canada, and your home address.", fr: "Nom, coordonnées, citoyenneté, statut au Canada et adresse résidentielle." },
        sidebar_p2_strong: { en: "Step 2 — Agency contact", fr: "Étape 2 — Coordonnées de l'agence" },
        sidebar_p2_p: { en: "If an agent is applying on your behalf, share their details. Skip if not.", fr: "Si un agent postule en votre nom, indiquez ses coordonnées. Sinon, passez à l'étape suivante." },
        sidebar_p3_strong: { en: "Step 3 — Program of choice", fr: "Étape 3 — Programme choisi" },
        sidebar_p3_p: { en: "Pick your program, intended semester, campus, and attendance mode.", fr: "Choisissez votre programme, la session souhaitée, le campus et le mode de présence." },
        sidebar_p4_strong: { en: "Step 4 — Upload documents", fr: "Étape 4 — Téléverser les documents" },
        sidebar_p4_p: { en: "Passport, study permit/visa, transcripts, English results, and signature.", fr: "Passeport, permis d'études ou visa, relevés, résultats d'anglais et signature." },

        // Step indicators
        step_personal: { en: "Personal Info", fr: "Renseignements" },
        step_agency: { en: "Agency", fr: "Agence" },
        step_program: { en: "Program", fr: "Programme" },
        step_documents: { en: "Documents", fr: "Documents" },

        // Step 1
        s1_title: { en: "Step 1 — Student's Personal Information", fr: "Étape 1 — Renseignements personnels de l'étudiant" },
        s1_first_name: { en: "First Name", fr: "Prénom" },
        s1_last_name: { en: "Last Name", fr: "Nom de famille" },
        s1_preferred_name: { en: "Preferred Name (i.e. English Name)", fr: "Prénom usuel (p. ex. prénom anglais)" },
        s1_dob: { en: "Date of Birth", fr: "Date de naissance" },
        s1_gender: { en: "Gender", fr: "Genre" },
        s1_select_gender: { en: "Select Gender", fr: "Sélectionner un genre" },
        s1_male: { en: "Male", fr: "Homme" },
        s1_female: { en: "Female", fr: "Femme" },
        s1_other: { en: "Other", fr: "Autre" },
        s1_prefer_not: { en: "Prefer not to say", fr: "Préfère ne pas répondre" },
        s1_citizenship: { en: "Country of Citizenship", fr: "Pays de citoyenneté" },
        s1_phone_code: { en: "Phone Country Code", fr: "Indicatif téléphonique" },
        s1_phone_number: { en: "Student's Own Phone Number", fr: "Numéro de téléphone personnel de l'étudiant" },
        s1_email: { en: "Student's Own Email", fr: "Adresse courriel personnelle de l'étudiant" },
        s1_email_placeholder: { en: "Please do not use qq email", fr: "Veuillez ne pas utiliser une adresse qq" },
        s1_status: { en: "Status in Canada", fr: "Statut au Canada" },
        s1_select_status: { en: "Select Status", fr: "Sélectionner un statut" },
        s1_status_citizen: { en: "Canadian Citizen", fr: "Citoyen·ne canadien·ne" },
        s1_status_pr: { en: "Permanent Resident", fr: "Résident·e permanent·e" },
        s1_status_study: { en: "Study Permit", fr: "Permis d'études" },
        s1_status_work: { en: "Work Permit", fr: "Permis de travail" },
        s1_status_visitor: { en: "Visitor Visa", fr: "Visa de visiteur" },
        s1_status_outside: { en: "Applying from Outside Canada", fr: "Candidature depuis l'étranger" },
        s1_status_other: { en: "Other", fr: "Autre" },
        s1_status_expiry: { en: "Status Expiry Date", fr: "Date d'expiration du statut" },
        s1_optional: { en: "(optional)", fr: "(facultatif)" },
        s1_sin: { en: "Social Insurance Number (SIN)", fr: "Numéro d'assurance sociale (NAS)" },
        s1_address_heading: { en: "Home Address", fr: "Adresse résidentielle" },
        s1_apt: { en: "Apartment / Unit / Suite #", fr: "Appartement / Unité / Bureau" },
        s1_street: { en: "Street Address", fr: "Adresse civique" },
        s1_city: { en: "City", fr: "Ville" },
        s1_province: { en: "Province / State", fr: "Province / État" },
        s1_postal: { en: "Postal / Zip Code", fr: "Code postal" },
        s1_country: { en: "Country", fr: "Pays" },
        s1_select_country: { en: "Select Country", fr: "Sélectionner un pays" },
        s1_info_update: { en: "If any of the above contact information changes, I will update it on the Student Registration Page.", fr: "Si l'un de mes renseignements ci-dessus change, je m'engage à le mettre à jour sur la page d'inscription étudiante." },

        // Step 2
        s2_title: { en: "Step 2 — Agency Contact Information", fr: "Étape 2 — Coordonnées de l'agence" },
        s2_q: { en: "Are you using an agency (or someone else who is authorized to apply on your behalf)?", fr: "Utilisez-vous une agence (ou quelqu'un d'autre autorisé à postuler en votre nom) ?" },
        s2_yes: { en: "Yes", fr: "Oui" },
        s2_no: { en: "No", fr: "Non" },
        s2_agent_first: { en: "Agent First Name", fr: "Prénom de l'agent" },
        s2_agent_last: { en: "Agent Last Name", fr: "Nom de l'agent" },
        s2_agency_company: { en: "Agency Company Name", fr: "Nom de l'agence" },
        s2_agent_phone: { en: "Agent Phone Number", fr: "Téléphone de l'agent" },
        s2_agent_email: { en: "Agent Email Address", fr: "Adresse courriel de l'agent" },
        s2_agency_notes: { en: "Agency Comments / Notes", fr: "Commentaires / Notes de l'agence" },
        s2_agency_notes_ph: { en: "Please share additional comments here", fr: "Partagez vos commentaires ici" },

        // Step 3
        s3_title: { en: "Step 3 — Program of Choice", fr: "Étape 3 — Programme choisi" },
        s3_program: { en: "What program are you applying for?", fr: "À quel programme postulez-vous ?" },
        s3_choose: { en: "Choose an option", fr: "Choisir une option" },
        s3_semester: { en: "Which semester do you intend to start?", fr: "À quelle session prévoyez-vous commencer ?" },
        s3_campus: { en: "Which campus do you want to take your program?", fr: "Sur quel campus souhaitez-vous suivre votre programme ?" },
        s3_attendance: { en: "How will you attend classes?", fr: "Comment suivrez-vous les cours ?" },
        s3_in_person: { en: "In person", fr: "En personne" },
        s3_online: { en: "Online", fr: "En ligne" },
        s3_blended: { en: "Blended", fr: "Mode hybride" },
        s3_pathway: { en: "Are you planning to apply for pathway to university after graduation?", fr: "Comptez-vous postuler à un parcours universitaire après l'obtention du diplôme ?" },
        s3_pathway_no: { en: "No", fr: "Non" },
        s3_pathway_undecided: { en: "Not decided yet", fr: "Pas encore décidé" },

        // Step 4
        s4_title: { en: "Step 4 — Upload Documents", fr: "Étape 4 — Téléverser les documents" },
        s4_intro: { en: "Each file may be up to 15 MB. Accepted formats: PDF, JPG, PNG.", fr: "Chaque fichier peut peser jusqu'à 15 Mo. Formats acceptés : PDF, JPG, PNG." },
        s4_passport: { en: "Passport (Photo Page)", fr: "Passeport (page photo)" },
        s4_permit: { en: "Study Permit / Visa / PR Card", fr: "Permis d'études / Visa / Carte RP" },
        s4_if_applicable: { en: "(if applicable)", fr: "(le cas échéant)" },
        s4_upload_help: { en: "Upload supported file (Max 15 MB)", fr: "Téléverser un fichier accepté (15 Mo max.)" },
        s4_grad_cert: { en: "High School Graduation Certificate", fr: "Diplôme de fin d'études secondaires" },
        s4_transcripts: { en: "High School or College Transcripts", fr: "Relevés de notes (secondaire ou collégial)" },
        s4_english_results: { en: "IELTS or other English Results", fr: "IELTS ou autres résultats d'anglais" },
        s4_other_docs: { en: "Other Document(s)", fr: "Autre(s) document(s)" },
        s4_signature: { en: "Your Signature", fr: "Votre signature" },
        s4_signature_ph: { en: "Type your full legal name as your signature", fr: "Saisissez votre nom légal complet en guise de signature" },
        s4_signature_help: { en: "Typing your full legal name above acts as your electronic signature.", fr: "Saisir votre nom légal complet ci-dessus tient lieu de signature électronique." },
        s4_decl_html: {
            en: "<strong>Declaration &amp; Consent:</strong> By signing this application form, I agree on all policies, terms and conditions. <a href=\"policies.html\" target=\"_blank\" style=\"color:var(--accent-gold);text-decoration:underline;\">View standard policies, terms and conditions.</a>",
            fr: "<strong>Déclaration et consentement :</strong> En signant ce formulaire, j'accepte l'ensemble des politiques, modalités et conditions. <a href=\"policies.html\" target=\"_blank\" style=\"color:var(--accent-gold);text-decoration:underline;\">Voir les politiques, modalités et conditions standards.</a>"
        },
        s4_submit: { en: "Submit Application", fr: "Soumettre la candidature" },

        // Side rail
        rail1_strong: { en: "Application guide", fr: "Guide de candidature" },
        rail1_p: { en: "Review the admissions process page if you want a complete overview before you submit.", fr: "Consultez la page sur le processus d'admission pour un aperçu complet avant de soumettre." },
        rail2_strong: { en: "Requirements matter", fr: "Les conditions comptent" },
        rail2_p: { en: "Students who confirm requirements early usually finish the application with fewer delays.", fr: "Les étudiants qui vérifient les conditions tôt complètent souvent leur candidature avec moins de retards." },
        rail3_strong: { en: "Questions welcome", fr: "Vos questions sont bienvenues" },
        rail3_p: { en: "If anything feels unclear, contact admissions instead of guessing and submitting incomplete information.", fr: "Si quelque chose vous semble flou, contactez les admissions plutôt que de soumettre une candidature incomplète." },

        // Bottom CTA
        bottom_btn_guide: { en: "View Application Guide", fr: "Voir le guide de candidature" },
        bottom_btn_advisor: { en: "Contact Advisors", fr: "Contacter les conseillers" },

        // Success
        success_title: { en: "Application Received", fr: "Candidature reçue" },
        success_p: { en: "Thank you for applying to Metropolitan Community College. Our admissions team will review your application and follow up with next-step communication.", fr: "Merci d'avoir postulé au Metropolitan Community College. Notre équipe des admissions examinera votre candidature et vous communiquera les prochaines étapes." },
        success_btn: { en: "Return to Homepage", fr: "Retour à l'accueil" }
    },

    lang_toggle: {
        aria: { en: "Toggle language between English and French", fr: "Basculer la langue entre l'anglais et le français" },
        title: { en: "Switch language", fr: "Changer de langue" }
    }
};
