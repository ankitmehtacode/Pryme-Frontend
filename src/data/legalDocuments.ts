// High-Performance Structured Legal Data for PRYME Legal Center

export interface LegalClause {
  title: string;
  body: string;
}

export interface LegalSection {
  partNumber: number;
  id: string;
  title: string;
  summaryTag?: string;
  clauses: LegalClause[];
}

export interface HighlightCard {
  icon: string;
  title: string;
  badge: string;
  description: string;
}

export interface LegalDocument {
  id: 'terms' | 'privacy' | 'fair-lending';
  title: string;
  effectiveDate: string;
  version: string;
  cin: string;
  pdfUrl: string;
  summary: string;
  highlights: HighlightCard[];
  sections: LegalSection[];
}

export const TERMS_HIGHLIGHTS: HighlightCard[] = [
  {
    icon: 'Building2',
    title: 'Technology Facilitator (Not a Lender)',
    badge: 'Platform Role',
    description: 'PRYME is a loan comparison and aggregation platform partnering with RBI-regulated banks and NBFCs. We facilitate credit applications but do not directly issue loans.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Zero Impact On Credit Score',
    badge: 'Soft Inquiries',
    description: 'Checking your initial loan eligibility on PRYME is done via soft inquiries and will NOT hurt your credit score.',
  },
  {
    icon: 'Lock',
    title: 'Bank-Grade Data Security',
    badge: 'DPDP 2023 Compliant',
    description: 'Your financial & personal documents are protected with 256-bit AES encryption. We never sell your data to third parties.',
  },
  {
    icon: 'Headphones',
    title: 'Dedicated Grievance Redressal',
    badge: 'Customer Protection',
    description: 'Direct statutory support with appointed Grievance Officer Aadesh Kothari (aadesh.k@gopryme.in) and dedicated Digital Lending Nodal support.',
  }
];

export const PRIVACY_HIGHLIGHTS: HighlightCard[] = [
  {
    icon: 'KeyRound',
    title: 'Strict Consent-Driven Access',
    badge: 'Explicit Consent',
    description: 'We only access your KYC, identity, and income data with your explicit, revocable consent for loan evaluation.',
  },
  {
    icon: 'DatabaseZap',
    title: 'No Unauthorized Data Selling',
    badge: 'Zero Commercial Sale',
    description: 'PRYME does not sell, rent, or trade your personal or financial data to unverified third-party advertisers.',
  },
  {
    icon: 'Server',
    title: 'Secure Domestic Storage',
    badge: 'RBI Localisation',
    description: 'All lending and identity records are securely hosted on Indian server infrastructure in compliance with RBI localisation norms.',
  },
  {
    icon: 'UserCheck',
    title: 'Right to Erase & Withdraw',
    badge: 'User Control',
    description: 'Under DPDP Act 2023, you can request account deletion, data correction, or consent withdrawal at any time.',
  }
];

export const TERMS_DATA: LegalDocument = {
  id: 'terms',
  title: 'Terms and Conditions of Use',
  effectiveDate: 'July 10, 2026',
  version: '1.0.0',
  cin: 'U70200MP2026PTC081776',
  pdfUrl: '/documents/terms-conditions.pdf',
  summary: "These Terms of Service govern your access to PRYME's loan comparison and application platform operated by GOPRYME FINTECH PRIVATE LIMITED.",
  highlights: TERMS_HIGHLIGHTS,
  sections: [
  {
    "partNumber": 1,
    "id": "part-1",
    "title": "DEFINITIONS AND INTERPRETATION",
    "clauses": [
      {
        "title": "1.1 \"Account\"",
        "body": "Means the unique user profile created on the Platform after successful registration for the\n\npurpose of applying for financial products, tracking applications, communicating with\n\nPRYME, accessing personalised services, or using features that require authentication."
      },
      {
        "title": "1.2 \"Applicable Law\"",
        "body": "Means all laws, statutes, rules, regulations, notifications, circulars, directions, judicial\n\ndecisions, governmental orders, regulatory guidelines, and other legally enforceable\n\nrequirements applicable within the Republic of India, including any amendments or re-\n\nenactments thereof from time to time."
      },
      {
        "title": "1.3 \"Application\"",
        "body": "Means any request, enquiry, expression of interest, or submission made by a User through the\n\nPlatform for obtaining a loan or any other financial product from a participating financial\n\ninstitution."
      },
      {
        "title": "1.4 \"Bank\"",
        "body": "Means any banking company licensed to carry on banking business in India under applicable\n\nlaw and participating on the Platform from time to time."
      },
      {
        "title": "1.5 \"Business Day\"",
        "body": "Means any day other than a Saturday, Sunday, or a day on which banks are officially closed\n\nfor business in the jurisdiction relevant to the transaction."
      },
      {
        "title": "1.6 \"Company\"",
        "body": "Means GOPRYME FINTECH PRIVATE LIMITED, its successors, permitted assigns,\n\naffiliates, subsidiaries (if any), employees, directors, officers, authorised representatives,\n\nagents, consultants, and service providers acting on its behalf."
      },
      {
        "title": "1.7 \"Content\"",
        "body": "Means all text, graphics, logos, icons, illustrations, images, videos, audio, software, algorithms,\n\nuser interfaces, layouts, databases, documentation, reports, calculations, educational material,\n\nblog articles, downloadable resources, and all other information made available on or through\n\nthe Platform."
      },
      {
        "title": "1.8 \"Eligibility Estimate\"",
        "body": "Means the indicative assessment generated through the Platform based on the information\n\nprovided by the User, proprietary methodologies, lender policies available to PRYME, and\n\nother relevant parameters. An Eligibility Estimate is solely informational in nature and shall\n\nnot be interpreted as a loan approval, sanction, commitment, guarantee, or promise by PRYME\n\nor by any participating lender."
      },
      {
        "title": "1.9 \"Financial Institution\"",
        "body": "Means any scheduled commercial bank, cooperative bank, Non-Banking Financial Company\n\n(NBFC), housing finance company, or any other regulated entity legally authorised to offer\n\nfinancial products in India and participating on the Platform."
      },
      {
        "title": "1.10 \"Loan\"",
        "body": "Means any credit facility, including but not limited to personal loans, home loans, business\n\nloans, loans against property, education loans, vehicle loans, gold loans, or any other lending\n\nproduct made available by participating financial institutions through or in connection with the\n\nPlatform."
      },
      {
        "title": "1.11 \"Platform\"",
        "body": "Means the website www.prymeloans.in, any associated mobile applications, software,\n\ndashboards, digital interfaces, communication channels, APIs, tools, calculators, eligibility\n\nengines, customer support systems, and all related products and services owned, operated, or\n\nmade available by PRYME."
      },
      {
        "title": "1.12 \"Participating Lender\"",
        "body": "Means any bank, NBFC, housing finance company, financial institution, or other regulated\n\nlender that has agreed to receive applications, enquiries, or customer referrals through the\n\nPlatform."
      },
      {
        "title": "1.13 \"Services\"",
        "body": "Means all services provided by PRYME from time to time, including but not limited to\n\nfinancial product comparison, eligibility estimation, loan application facilitation, document\n\ncoordination, customer support, educational content, post-disbursal assistance, future AI-\n\nenabled services, and any additional services introduced by the Company."
      },
      {
        "title": "1.14 \"User\", \"You\", or \"Your\"",
        "body": "Means any individual who accesses, visits, browses, registers on, or otherwise uses the\n\nPlatform, irrespective of whether such individual creates an Account or completes a financial\n\nproduct application."
      },
      {
        "title": "1.15 Interpretation",
        "body": "Unless expressly stated otherwise:\n\n(a) headings are inserted solely for convenience and shall not affect interpretation;\n\n(b) references to any law shall include all amendments, modifications, substitutions, re-\n\nenactments, and successor legislation;\n\n(c) references to any document shall include amendments, supplements, replacements, or\n\nrevised versions thereof;\n\n(d) the words \"including\", \"such as\", and similar expressions shall be deemed to mean\n\n\"including, without limitation\";\n\n(e) references to one gender shall include every other gender, and references to the singular\n\nshall include the plural where the context so requires;\n\n(f) any ambiguity shall not be interpreted against either party merely because one party drafted\n\nthese Terms."
      }
    ]
  },
  {
    "partNumber": 2,
    "id": "part-2",
    "title": "ABOUT PRYME, NATURE OF THE PLATFORM, AND SCOPE OF SERVICES",
    "clauses": [
      {
        "title": "2.1 About PRYME",
        "body": "PRYME is a technology-enabled financial services platform owned and operated by\n\nGOPRYME FINTECH PRIVATE LIMITED. The Platform has been developed with the\n\nobjective of simplifying the process of discovering, comparing, understanding, and applying\n\nfor financial products offered by participating banks, Non-Banking Financial Companies\n\n(\"NBFCs\"), housing finance companies, and other regulated financial institutions.\n\nThe Company leverages technology, structured data, proprietary eligibility methodologies, and\n\ncustomer support services to assist users in making more informed financial decisions. PRYME\n\nseeks to improve transparency by enabling users to compare available financial products,\n\nunderstand indicative eligibility, and navigate the application process through a single digital\n\nplatform.\n\nThe Company's guiding principles are transparency, clarity, and security, and these\n\nprinciples govern the manner in which the Platform and its services are designed and delivered."
      },
      {
        "title": "2.2 Nature of the Platform",
        "body": "The User expressly acknowledges and agrees that PRYME is solely a technology platform and\n\nfacilitation service.\n\nThe Platform has been developed to enable users to access information relating to financial\n\nproducts, evaluate indicative eligibility, compare available options, submit loan applications to\n\nparticipating lenders, coordinate documentation, and receive customer support during various\n\nstages of the application journey.\n\nAt no point shall PRYME be construed as:\n\n(a) a bank;\n\n(b) a Non-Banking Financial Company (NBFC);\n\n(c) a housing finance company;\n\n(d) a money lender;\n\n(e) a credit provider;\n\n(f) a financial institution accepting deposits;\n\n(g) a guarantor of any financial product;\n\n(h) an insurer;\n\n(i) an investment adviser;\n\n(j) a financial adviser providing personalised financial advice; or\n\n(k) an authorised representative empowered to approve or reject loan applications on behalf of\n\nany lender.\n\nNothing contained on the Platform shall create or be interpreted as creating a lender-borrower\n\nrelationship between PRYME and any User."
      },
      {
        "title": "2.3 Independent Lending Decisions",
        "body": "All lending decisions remain solely within the discretion of the respective participating lender.\n\nWithout limitation, the participating lender alone shall determine:\n\n(a) whether an application is accepted or rejected;\n\n(b) the amount of credit to be sanctioned;\n\n(c) the applicable interest rate;\n\n(d) the repayment tenure;\n\n(e) processing fees and other charges;\n\n(f) collateral or security requirements;\n\n(g) documentation requirements;\n\n(h) repayment schedules;\n\n(i) conditions precedent to disbursement;\n\n(j) post-disbursal servicing; and\n\n(k) any modification, restructuring, cancellation, or recall of the facility.\n\nPRYME neither participates in nor influences these commercial or credit decisions."
      },
      {
        "title": "2.4 No Representation of Participating Lenders",
        "body": "Unless expressly stated in writing, PRYME does not represent, act as an agent of, or possess\n\nauthority to legally bind any participating lender.\n\nThe availability of a lender or financial product on the Platform shall not be interpreted as:\n\n(a) an endorsement by PRYME;\n\n(b) a guarantee regarding the quality of services offered by that lender;\n\n(c) a representation that the lender will approve a particular application; or\n\n(d) a warranty that the lender's terms shall remain unchanged.\n\nEach participating lender remains independently responsible for its own products, underwriting\n\npolicies, contractual documentation, customer servicing, and regulatory compliance."
      },
      {
        "title": "2.5 Scope of Services",
        "body": "Subject to availability and applicable law, PRYME may provide one or more of the following\n\nservices:\n\n(a) comparison of financial products;\n\n(b) indicative eligibility assessment;\n\n(c) loan discovery services;\n\n(d) loan application facilitation;\n\n(e) document collection and preliminary verification;\n\n(f) customer support before, during, and after loan disbursal;\n\n(g) educational financial content;\n\n(h) calculators and decision-support tools;\n\n(i) notifications regarding application progress;\n\n(j) customer communication through approved channels;\n\n(k) promotional programmes, rewards, cashback, or referral initiatives; and\n\n(l) any additional technology-enabled services introduced by the Company from time to time.\n\nThe Company reserves the absolute right to modify, discontinue, expand, restrict, suspend, or\n\nreplace any feature or service without prior notice where reasonably necessary."
      },
      {
        "title": "2.6 Eligibility Estimation",
        "body": "The Platform may provide Users with an indicative assessment of their potential eligibility for\n\none or more financial products.\n\nSuch assessment may be generated using, among other things:\n\n(a) information provided by the User;\n\n(b) publicly available lender policies;\n\n(c) proprietary algorithms;\n\n(d) internally developed scoring methodologies;\n\n(e) banking-related information, where authorised;\n\n(f) employment information;\n\n(g) business information;\n\n(h) credit-related parameters where expressly consented to by the User;\n\n(i) historical lending criteria available to PRYME; and\n\n(j) any other lawful parameter considered relevant by the Platform.\n\nUsers expressly acknowledge that such assessments are indicative only."
      },
      {
        "title": "2.7 No Guarantee of Approval",
        "body": "An Eligibility Estimate shall not constitute:\n\n(a) a loan sanction;\n\n(b) a loan approval;\n\n(c) a pre-approved offer;\n\n(d) a commitment to lend;\n\n(e) an obligation upon any participating lender;\n\n(f) a guarantee of interest rates;\n\n(g) a guarantee of processing timelines;\n\n(h) a guarantee of loan amount;\n\n(i) a guarantee of loan tenure; or\n\n(j) a guarantee of eventual disbursal.\n\nA lender may approve, reject, or modify any application irrespective of the indicative\n\ninformation displayed by the Platform.\n\nSimilarly, a lender may, based upon its own commercial assessment, offer more favourable\n\nterms than those indicated on the Platform."
      },
      {
        "title": "2.8 Accuracy of Information Displayed",
        "body": "PRYME endeavours to ensure that the information made available on the Platform is accurate,\n\nrelevant, and updated at regular intervals.\n\nHowever, financial products, eligibility criteria, lending policies, interest rates, processing\n\ncharges, documentation requirements, repayment structures, promotional schemes, and other\n\ncommercial terms are determined exclusively by participating lenders and may change without\n\nprior notice.\n\nAccordingly, PRYME does not warrant that every item of information displayed on the\n\nPlatform will always reflect the most recent lender policy at any given moment.\n\nUsers are encouraged to carefully review the final sanction letter and loan documentation\n\nissued by the lender before accepting any financial product."
      },
      {
        "title": "2.9 Customer Support",
        "body": "PRYME may provide customer support before, during, and after loan disbursal in order to\n\nassist Users in understanding application requirements, documentation processes, status\n\nupdates, or other procedural matters.\n\nSuch support is provided on a best-effort basis and shall not create any fiduciary duty, legal\n\nrepresentation, or contractual obligation on the part of PRYME to guarantee any particular\n\noutcome.\n\nFollowing disbursal of a loan, issues relating to repayment, foreclosure, prepayment, penalties,\n\naccount statements, interest computation, restructuring, settlement, or recovery proceedings\n\nshall remain matters exclusively between the User and the respective lender.\n\nPRYME may, at its discretion, assist in coordinating communication between the parties but\n\nshall not assume responsibility for resolving disputes arising from the contractual relationship\n\nbetween the User and the lender."
      },
      {
        "title": "2.10 Future Services",
        "body": "The User acknowledges that PRYME may, from time to time, introduce new products, services,\n\ntechnologies, or business verticals, including but not limited to insurance products, credit cards,\n\nfixed deposits, investment products, wealth management solutions, Account Aggregator\n\nintegrations, artificial intelligence-based financial assistants, financial planning tools,\n\neducational services, or any other lawful financial technology offerings.\n\nThe introduction, suspension, withdrawal, or modification of any such services shall not affect\n\nthe validity or enforceability of these Terms unless expressly stated otherwise.\n\nCertain future services may be governed by separate terms, product-specific agreements, or\n\nadditional disclosures, which shall form an integral part of the contractual relationship between\n\nthe User and PRYME upon acceptance."
      },
      {
        "title": "2.11 User Acknowledgement",
        "body": "By continuing to use the Platform, the User expressly acknowledges and agrees that:\n\n(a) PRYME is solely a technology-enabled facilitation platform;\n\n(b) all lending decisions are made independently by participating financial institutions;\n\n(c) PRYME does not guarantee approval, sanction, disbursal, interest rates, or any commercial\n\nterms;\n\n(d) any Eligibility Estimate provided by the Platform is indicative and informational only;\n\n(e) the User remains solely responsible for evaluating the suitability of any financial product\n\nbefore proceeding with an application; and\n\n(f) the final contractual relationship for any financial product exists exclusively between the\n\nUser and the participating lender, subject to the lender's terms and applicable law."
      }
    ]
  },
  {
    "partNumber": 3,
    "id": "part-3",
    "title": "ELIGIBILITY TO USE THE PLATFORM, USER REGISTRATION, ACCOUNT MANAGEMENT, AND IDENTITY VERIFICATION",
    "clauses": [
      {
        "title": "3.1 Eligibility to Access the Platform",
        "body": "Access to the Platform is available only to individuals who satisfy the eligibility requirements\n\nprescribed under these Terms and applicable laws of India.\n\nBy accessing or using the Platform, the User represents and warrants that:\n\n(a) the User is at least eighteen (18) years of age;\n\n(b) the User is competent to enter into a legally binding contract in accordance with the\n\nprovisions of the Indian Contract Act, 1872;\n\n(c) the User is an Indian resident legally eligible to apply for financial products available\n\nthrough the Platform;\n\n(d) the User has not previously been suspended or prohibited from using the Platform by\n\nPRYME;\n\n(e) all information submitted to PRYME is true, complete, accurate, and capable of\n\nindependent verification; and\n\n(f) the User shall comply with these Terms and all applicable laws, regulations, governmental\n\ndirections, and regulatory requirements while using the Platform.\n\nIf, at any time, PRYME determines that a User no longer satisfies the eligibility criteria\n\nprescribed under these Terms, PRYME reserves the right to suspend, restrict, or terminate\n\naccess to the Platform without prior notice."
      },
      {
        "title": "3.2 Guest Access",
        "body": "PRYME permits Users to access certain portions of the Platform without creating an Account.\n\nA User may, without registration:\n\n(a) browse the Platform;\n\n(b) explore financial products;\n\n(c) compare available loan options;\n\n(d) review educational material;\n\n(e) understand indicative product features;\n\n(f) access publicly available calculators or informational tools; and\n\n(g) use any other functionality specifically designated as publicly accessible.\n\nGuest access does not create any contractual obligation on the part of PRYME to provide\n\npersonalised services, eligibility assessments requiring authentication, application tracking, or\n\nlender-specific processing.\n\nPRYME reserves the right to modify, restrict, or discontinue guest access features at any time."
      },
      {
        "title": "3.3 Requirement for Registration",
        "body": "Registration becomes mandatory when a User elects to proceed with a loan application or\n\nwishes to access features requiring authentication, personalised services, document\n\nsubmission, application tracking, or communication with participating lenders.\n\nCreation of an Account constitutes the User's confirmation that all information submitted\n\nduring registration is accurate and complete.\n\nThe User further agrees to promptly update any information that becomes inaccurate or\n\noutdated.Failure to maintain accurate information may result in interruption of services, delays\n\nin processing, inaccurate eligibility assessments, rejection of applications by participating\n\nlenders, suspension of the Account, or any combination thereof."
      },
      {
        "title": "3.4 Registration Information",
        "body": "During registration, PRYME may request information including, but not limited to:\n\n(a) full name;\n\n(b) mobile number;\n\n(c) email address;\n\n(d) date of birth;\n\n(e) residential address;\n\n(f) employment information;\n\n(g) business information;\n\n(h) income details;\n\n(i) identity information;\n\n(j) loan requirements;\n\n(k) financial information relevant to eligibility assessment; and\n\n(l) any additional information reasonably required for providing the Services.\n\nThe information requested may vary depending upon the financial product selected, regulatory\n\nrequirements, participating lender requirements, technological developments, or changes in\n\napplicable law."
      },
      {
        "title": "3.5 Verification of Contact Details",
        "body": "PRYME may verify the authenticity of the User's mobile number, email address, or other\n\ncontact details through OTP verification, verification links, authentication codes, or any other\n\nverification mechanism considered appropriate.\n\nThe User agrees that successful verification is a prerequisite for accessing certain Services.\n\nPRYME reserves the right to refuse registration where verification cannot be successfully\n\ncompleted."
      },
      {
        "title": "3.6 One Account Policy",
        "body": "Each User shall be entitled to maintain only one active Account on the Platform unless\n\nexpressly authorised by PRYME in writing.\n\nCreation or operation of multiple Accounts for the purpose of obtaining unfair advantages,\n\nmanipulating promotional programmes, misleading lenders, circumventing Platform\n\nrestrictions, or engaging in fraudulent activities shall constitute a material breach of these\n\nTerms.\n\nPRYME reserves the right to merge, suspend, restrict, or permanently terminate duplicate\n\nAccounts without prior notice."
      },
      {
        "title": "3.7 User Credentials and Account Security",
        "body": "The User shall be solely responsible for maintaining the confidentiality of all authentication\n\ncredentials associated with the Account, including passwords, one-time passwords (OTPs),\n\nauthentication codes, and security questions.\n\nThe User agrees:\n\n(a) not to disclose login credentials to any third party;\n\n(b) not to permit any other individual to access the Account;\n\n(c) to immediately notify PRYME of any suspected unauthorised access;\n\n(d) to log out after each session where appropriate; and\n\n(e) to exercise reasonable care to prevent misuse of the Account.\n\nUntil PRYME receives written notification of unauthorised access, all activity occurring\n\nthrough the Account shall be deemed to have been authorised by the User."
      },
      {
        "title": "3.8 Changes to Registered Information",
        "body": "Users may request changes to their registered mobile number, email address, or other profile\n\ninformation through procedures prescribed by PRYME.\n\nPRYME may require fresh verification before implementing such changes.\n\nThe Company reserves the right to refuse any requested modification where there is reasonable\n\nsuspicion of fraud, identity theft, ongoing investigation, regulatory restriction, or any other\n\ncircumstance requiring additional verification."
      },
      {
        "title": "3.9 Identity Verification",
        "body": "In order to facilitate loan applica\u019fons and comply with lender requirements, PRYME may\n\nrequest the submission of iden\u019fty documents, address proof, income documents, business\n\nrecords, property documents, banking informa\u019fon, taxa\u019fon records, or any other\n\ndocumenta\u019fon relevant to the selected \ufb01nancial product.\n\nThe User represents and warrants that every document submitted through the Platform:\n\n(a) is genuine;\n\n(b) belongs to the User or has been lawfully provided;\n\n(c) has not been altered, manipulated, fabricated, or forged;\n\n(d) accurately reflects the information represented; and\n\n(e) may be verified by PRYME and participating lenders.\n\nSubmission of fraudulent documentation shall constitute a material breach of these Terms and\n\nmay result in rejection of the application, suspension or termination of the Account, reporting\n\nto participating lenders, and initiation of appropriate civil or criminal proceedings."
      },
      {
        "title": "3.10 Preliminary Verification by PRYME",
        "body": "Prior to forwarding documentation to a participating lender, PRYME may conduct preliminary\n\nverification for completeness, consistency, and apparent authenticity.\n\nSuch verification is undertaken solely to facilitate processing and improve the quality of\n\napplications submitted through the Platform.\n\nPreliminary verification by PRYME shall not be interpreted as certification of authenticity,\n\napproval of the application, or acceptance of the User's representations.\n\nParticipating lenders shall remain solely responsible for conducting their own independent due\n\ndiligence and verification."
      },
      {
        "title": "3.11 Right to Refuse Registration",
        "body": "PRYME reserves the absolute right to refuse, suspend, restrict, or terminate registration where\n\nit reasonably believes that:\n\n(a) false information has been submitted;\n\n(b) fraudulent documents have been uploaded;\n\n(c) the User has violated these Terms;\n\n(d) continued access may expose PRYME or participating lenders to legal, financial,\n\noperational, cybersecurity, regulatory, or reputational risk;\n\n(e) registration would violate applicable law or regulatory directions; or\n\n(f) any other circumstance exists that, in PRYME's reasonable opinion, justifies such action.\n\nPRYME shall not be obligated to disclose the internal basis of its fraud detection systems, risk\n\nassessment methodologies, or security measures while exercising its rights under this Clause."
      },
      {
        "title": "3.12 Account Deletion",
        "body": "Users may request deletion of their Account through the procedures prescribed by PRYME.\n\nWhere a loan application is pending, under review, approved, awaiting documentation,\n\nawaiting disbursal, or otherwise in progress, PRYME may defer deletion until the relevant\n\napplication has been completed, withdrawn, cancelled, or otherwise closed.\n\nFollowing successful processing of the deletion request:\n\n(a) the User's access to the Account shall be disabled;\n\n(b) downloadable personal data shall remain available for up to thirty (30) days where\n\ntechnically feasible;\n\n(c) PRYME may retain records where required by applicable law, regulatory requirements,\n\nfraud prevention obligations, audit requirements, dispute resolution, taxation, or legitimate\n\nbusiness purposes; and\n\n(d) continued retention of such records shall not be construed as continued operation of the\n\ndeleted Account."
      },
      {
        "title": "3.13 Survival of Obligations",
        "body": "Deletion, suspension, or termination of an Account shall not affect any rights, obligations,\n\nliabilities, indemnities, warranties, confidentiality obligations, dispute resolution provisions,\n\nintellectual property protections, or other clauses which, by their nature, are intended to survive\n\ntermination of these Terms."
      }
    ]
  },
  {
    "partNumber": 4,
    "id": "part-4",
    "title": "USER REPRESENTATIONS, WARRANTIES, OBLIGATIONS, AND PROHIBITED CONDUCT",
    "clauses": [
      {
        "title": "4.1 User Representations and Warranties",
        "body": "By accessing or using the Platform, the User hereby represents, warrants, and undertakes that:\n\n(a) all information, declarations, statements, documents, and records submitted to PRYME are\n\ntrue, accurate, complete, current, and not misleading in any respect;\n\n(b) the User possesses the legal authority and capacity to submit such information and\n\ndocuments to PRYME;\n\n(c) the User shall immediately notify PRYME if any material information previously submitted\n\nbecomes inaccurate, incomplete, or outdated;\n\n(d) the User is accessing the Platform solely for lawful purposes and shall not use the Platform\n\nfor any activity prohibited under these Terms or applicable law;\n\n(e) the User shall not knowingly make any false declaration for the purpose of obtaining a\n\nfinancial advantage or influencing an eligibility assessment or lending decision;\n\n(f) where information relating to another individual is submitted, the User has obtained all\n\nnecessary permissions and lawful authority to disclose such information;\n\n(g) the User understands that participating lenders may independently verify the information\n\nand documents submitted through the Platform; and\n\n(h) the User acknowledges that any breach of the above representations may result in\n\nsuspension of services, termination of the Account, rejection of applications, reporting to\n\nparticipating lenders, and legal proceedings where appropriate."
      },
      {
        "title": "4.2 Accuracy and Completeness of Information",
        "body": "The quality and reliability of the Services provided by PRYME depend upon the accuracy of\n\ninformation supplied by the User.\n\nAccordingly, the User agrees that all personal, financial, employment, business, banking,\n\ntaxation, property, and other information submitted through the Platform shall be complete and\n\ntruthful.\n\nPRYME shall not be responsible for any incorrect Eligibility Estimate, recommendation,\n\nlender response, processing delay, rejection, or other consequence arising directly or indirectly\n\nfrom inaccurate, incomplete, misleading, outdated, or false information provided by the User."
      },
      {
        "title": "4.3 Continuous Obligation to Update Information",
        "body": "The User acknowledges that financial circumstances may change after registration or\n\nsubmission of an application.\n\nAccordingly, the User agrees to promptly update PRYME whenever there is a material change\n\nin any information previously submitted, including but not limited to:\n\n(a) employment status;\n\n(b) employer;\n\n(c) income;\n\n(d) business turnover;\n\n(e) GST registration status;\n\n(f) residential address;\n\n(g) contact details;\n\n(h) banking information;\n\n(i) existing loan obligations;\n\n(j) property ownership details; or\n\n(k) any other information reasonably relevant to the Services.\n\nFailure to provide updated information may affect the accuracy of eligibility assessments and\n\nmay result in delays or rejection by participating lenders."
      },
      {
        "title": "4.4 Lawful Use of the Platform",
        "body": "The User agrees to use the Platform only for legitimate personal purposes relating to the\n\ndiscovery, comparison, assessment, and application of financial products.\n\nThe User shall not use the Platform for any unlawful, fraudulent, malicious, commercial,\n\ncompetitive, or unauthorised purpose.\n\nNothing contained on the Platform shall be interpreted as granting the User any ownership or\n\nunrestricted right to use the Company's technology, systems, databases, algorithms, software,\n\nor intellectual property."
      },
      {
        "title": "4.5 Prohibited Conduct",
        "body": "Without limiting the generality of these Terms, the User shall not:\n\n(a) submit forged, fabricated, altered, manipulated, or misleading documents;\n\n(b) impersonate another individual or entity;\n\n(c) create or operate multiple Accounts without authorisation;\n\n(d) misrepresent identity, employment, income, assets, liabilities, business turnover, GST\n\ndetails, banking information, or credit history;\n\n(e) attempt to obtain financial products through deception or fraudulent means;\n\n(f) interfere with the operation, security, stability, or functionality of the Platform;\n\n(g) introduce malware, viruses, ransomware, spyware, malicious code, or any harmful\n\nsoftware;\n\n(h) gain or attempt to gain unauthorised access to any account, database, server, network, or\n\nsystem associated with PRYME;\n\n(i) attempt to reverse engineer, decompile, disassemble, decode, or otherwise derive the source\n\ncode, algorithms, models, or technical architecture of the Platform except where expressly\n\npermitted by applicable law;\n\n(j) use robots, automated scripts, crawlers, bots, scraping tools, artificial traffic generators, or\n\nsimilar technologies to access or extract information from the Platform without prior written\n\nconsent;\n\n(k) conduct penetration testing, vulnerability scanning, or security assessments without the\n\nCompany's prior written authorisation;\n\n(l) interfere with another User's access to or use of the Platform;\n\n(m) misuse any promotional programme, cashback scheme, referral initiative, or reward\n\nmechanism;\n\n(n) upload content that is unlawful, defamatory, obscene, abusive, discriminatory, hateful,\n\nthreatening, or otherwise objectionable;\n\n(o) use the Platform in a manner that infringes the intellectual property or proprietary rights of\n\nPRYME or any third party;\n\n(p) knowingly assist, encourage, facilitate, or enable another person to commit any prohibited\n\nactivity described in these Terms; or\n\n(q) engage in any conduct that, in PRYME's reasonable opinion, exposes the Company,\n\nparticipating lenders, Users, or third parties to legal, financial, operational, cybersecurity,\n\nregulatory, or reputational risk."
      },
      {
        "title": "4.6 Fraud Prevention",
        "body": "PRYME maintains internal fraud detection and risk management procedures to protect Users,\n\nparticipating lenders, and the integrity of the Platform.\n\nWhere PRYME reasonably suspects fraudulent activity, identity theft, document manipulation,\n\nmoney laundering, unauthorised access, account compromise, regulatory non-compliance, or\n\nany other suspicious activity, PRYME may, without prejudice to any other rights available\n\nunder law:\n\n(a) temporarily suspend processing of an application;\n\n(b) request additional information or documentation;\n\n(c) conduct enhanced verification procedures;\n\n(d) suspend or restrict the User's Account;\n\n(e) refuse to facilitate the application;\n\n(f) notify the relevant participating lender;\n\n(g) cooperate with law enforcement agencies, regulators, governmental authorities, or judicial\n\nbodies where legally required; and\n\n(h) initiate appropriate civil or criminal proceedings where warranted.\n\nThe User acknowledges that PRYME shall not be obligated to disclose the internal criteria,\n\nalgorithms, or security measures used for fraud detection or risk assessment."
      },
      {
        "title": "4.7 User Responsibility for Documents",
        "body": "The User shall remain solely responsible for every document uploaded or submitted through\n\nthe Platform.\n\nThe User expressly warrants that each document:\n\n(a) is genuine and authentic;\n\n(b) has not been altered except for lawful redactions where permitted;\n\n(c) accurately represents the underlying facts;\n\n(d) belongs to the User or has been lawfully obtained and submitted with appropriate authority;\n\nand\n\n(e) may be verified by PRYME, participating lenders, or authorised third parties.\n\nSubmission of false or fraudulent documentation may result in immediate rejection of the\n\napplication and any other action available under these Terms or applicable law."
      },
      {
        "title": "4.8 Compliance with Applicable Laws",
        "body": "The User agrees to comply at all times with all applicable laws, regulations, governmental\n\nnotifications, and regulatory directions while accessing or using the Platform.\n\nNothing contained in these Terms shall be interpreted as permitting any activity prohibited\n\nunder applicable law."
      },
      {
        "title": "4.9 Duty to Cooperate",
        "body": "The User agrees to reasonably cooperate with PRYME during registration, verification,\n\napplication processing, post-submission clarification, dispute resolution, fraud investigations,\n\nand any lawful compliance process.\n\nFailure to cooperate may result in delays, suspension of services, or closure of the relevant\n\napplication where such cooperation is reasonably necessary."
      },
      {
        "title": "4.10 Consequences of Breach",
        "body": "Without prejudice to any other rights or remedies available under these Terms or applicable\n\nlaw, PRYME may, upon determining that a User has breached this Article:\n\n(a) issue a warning;\n\n(b) temporarily suspend specific Platform features;\n\n(c) suspend or terminate the User's Account;\n\n(d) reject or discontinue processing of any application;\n\n(e) cancel eligibility assessments or promotional benefits;\n\n(f) permanently prohibit future use of the Platform;\n\n(g) report the matter to participating lenders or competent authorities where legally appropriate;\n\n(h) seek recovery of losses, damages, investigation costs, legal expenses, or other amounts\n\narising from the User's misconduct; and\n\n(i) pursue any other civil, criminal, contractual, or equitable remedy available under applicable\n\nlaw.\n\nThe rights and remedies provided under this Article are cumulative and shall not exclude any\n\nother rights or remedies available to PRYME under these Terms or applicable law."
      }
    ]
  },
  {
    "partNumber": 5,
    "id": "part-5",
    "title": "ELIGIBILITY ASSESSMENT, LOAN COMPARISON, APPLICATION FACILITATION, AND RELATIONSHIP WITH PARTICIPATING",
    "clauses": [
      {
        "title": "5.1 Purpose of the Services",
        "body": "The Platform has been developed to enable Users to make more informed financial decisions\n\nby providing access to financial product information, indicative eligibility assessments, product\n\ncomparisons, application facilitation, and customer support throughout various stages of the\n\nborrowing journey.\n\nThe Services are intended to improve accessibility, transparency, and efficiency in the loan\n\napplication process by reducing the need for Users to independently approach multiple\n\nfinancial institutions for preliminary assessment.\n\nThe User acknowledges that the Services are technology-enabled facilitation services only and\n\ndo not constitute lending, underwriting, financial advisory, investment advisory, or credit\n\ndecision-making services."
      },
      {
        "title": "5.2 Loan Comparison Services",
        "body": "PRYME may provide comparisons of financial products offered by participating lenders.\n\nSuch comparisons may include information relating to, among other things:\n\n(a) indicative interest rates;\n\n(b) loan amounts;\n\n(c) repayment tenure;\n\n(d) eligibility criteria;\n\n(e) processing fees;\n\n(f) documentation requirements;\n\n(g) repayment options;\n\n(h) special lender programmes;\n\n(i) product features;\n\n(j) promotional offers; and\n\n(k) any other information considered relevant by PRYME.\n\nThe User acknowledges that such information is compiled from lender communications,\n\npublicly available information, product documentation, and other reliable sources available to\n\nPRYME.\n\nDespite reasonable efforts to maintain accuracy, participating lenders may revise, withdraw,\n\nsuspend, or replace product features at any time without prior notice.\n\nAccordingly, PRYME does not warrant that any comparison displayed on the Platform will\n\nalways reflect the latest commercial terms offered by a participating lender."
      },
      {
        "title": "5.3 Eligibility Assessment",
        "body": "The Platform may generate an indicative Eligibility Estimate using proprietary methodologies\n\ndeveloped by PRYME together with information provided by the User and lending policies\n\navailable to the Company.\n\nDepending upon the selected financial product, such assessment may consider factors\n\nincluding:\n\n(a) age;\n\n(b) residential profile;\n\n(c) employment details;\n\n(d) employer category;\n\n(e) income;\n\n(f) business turnover;\n\n(g) GST-related information;\n\n(h) banking behaviour;\n\n(i) existing financial obligations;\n\n(j) repayment capacity;\n\n(k) property-related information;\n\n(l) declared loan purpose;\n\n(m) credit-related information where expressly authorised by the User;\n\n(n) lender-specific policies available to PRYME; and\n\n(o) other lawful parameters considered relevant to the assessment.\n\nThe methodology used by PRYME constitutes proprietary intellectual property and may be\n\nmodified from time to time without prior notice.\n\nNothing contained in these Terms shall require PRYME to disclose the internal logic,\n\nalgorithms, weightages, scoring mechanisms, or proprietary methodologies used for generating\n\nEligibility Estimates."
      },
      {
        "title": "5.4 Nature of Eligibility Estimates",
        "body": "The User expressly understands and agrees that every Eligibility Estimate displayed on the\n\nPlatform is indicative only.\n\nAn Eligibility Estimate shall not constitute:\n\n(a) a loan approval;\n\n(b) a sanction letter;\n\n(c) a commitment to lend;\n\n(d) a binding financial offer;\n\n(e) a guarantee of approval;\n\n(f) a guarantee of interest rates;\n\n(g) a guarantee of loan amount;\n\n(h) a guarantee of repayment tenure;\n\n(i) a guarantee of processing timelines; or\n\n(j) a guarantee of loan disbursal.\n\nThe Eligibility Estimate is intended solely to assist Users in evaluating potential options before\n\ndeciding whether to proceed with a loan application."
      },
      {
        "title": "5.5 Independent Assessment by Participating Lenders",
        "body": "Every participating lender maintains independent underwriting policies, internal risk models,\n\nregulatory obligations, and commercial criteria.\n\nAccordingly, each participating lender may independently:\n\n(a) verify the information submitted by the User;\n\n(b) request additional documents;\n\n(c) conduct field investigations;\n\n(d) perform employment verification;\n\n(e) verify business information;\n\n(f) obtain credit bureau reports where authorised;\n\n(g) conduct property valuation;\n\n(h) perform legal due diligence;\n\n(i) modify commercial terms; or\n\n(j) reject an application notwithstanding the Eligibility Estimate displayed by the Platform.\n\nThe User acknowledges that such actions remain entirely outside the control of PRYME."
      },
      {
        "title": "5.6 Variations in Commercial Terms",
        "body": "The User acknowledges that the commercial terms ultimately offered by a participating lender\n\nmay differ from those displayed on the Platform.\n\nWithout limitation, a participating lender may determine:\n\n(a) a different interest rate;\n\n(b) a different sanctioned amount;\n\n(c) a different repayment tenure;\n\n(d) revised documentation requirements;\n\n(e) revised processing fees;\n\n(f) additional conditions precedent;\n\n(g) collateral requirements;\n\n(h) guarantor requirements; or\n\n(i) any other contractual condition considered appropriate by that lender.\n\nConversely, a lender may also offer more favourable commercial terms than those indicated by\n\nthe Platform based upon its own internal assessment, customer relationship, promotional\n\ncampaigns, or commercial discretion.\n\nPRYME shall not be liable for any such variation."
      },
      {
        "title": "5.7 Loan Application Facilitation",
        "body": "Where a User elects to proceed with a loan application through the Platform, PRYME may\n\nfacilitate the application process by:\n\n(a) collecting required information;\n\n(b) assisting in document submission;\n\n(c) conducting preliminary verification;\n\n(d) coordinating with participating lenders;\n\n(e) communicating application updates;\n\n(f) responding to procedural queries;\n\n(g) assisting with additional documentation requests; and\n\n(h) providing reasonable customer support before and after loan disbursal.\n\nSuch facilitation services are administrative and technological in nature and shall not be\n\ninterpreted as assuming responsibility for any lending decision."
      },
      {
        "title": "5.8 Preliminary Document Review",
        "body": "PRYME may review documents submitted by the User for completeness, apparent consistency,\n\nreadability, and basic authenticity before forwarding them to a participating lender.\n\nSuch review is intended solely to improve processing efficiency and reduce avoidable delays.\n\nThe User acknowledges that:\n\n(a) PRYME does not certify the authenticity of any document;\n\n(b) PRYME does not guarantee that documents will satisfy lender requirements;\n\n(c) participating lenders shall independently verify every document according to their own\n\npolicies; and\n\n(d) preliminary review by PRYME shall not prejudice or influence any subsequent verification\n\nundertaken by a participating lender."
      },
      {
        "title": "5.9 Customer Support",
        "body": "PRYME may provide support throughout various stages of the customer journey, including:\n\n(a) registration;\n\n(b) eligibility assessment;\n\n(c) document collection;\n\n(d) application submission;\n\n(e) communication with participating lenders;\n\n(f) application tracking;\n\n(g) clarification regarding procedural requirements;\n\n(h) coordination during disbursal; and\n\n(i) reasonable post-disbursal assistance.\n\nThe User acknowledges that such support is provided on a best-effort basis and does not create\n\nany fiduciary duty or legal obligation requiring PRYME to secure a particular outcome."
      },
      {
        "title": "5.10 Matters Remaining Between the User and the Lender",
        "body": "Following submission of a loan application, the contractual relationship concerning the\n\nfinancial product exists exclusively between the User and the participating lender.\n\nWithout limitation, matters relating to:\n\n(a) loan sanction;\n\n(b) loan rejection;\n\n(c) loan documentation;\n\n(d) execution of agreements;\n\n(e) disbursal;\n\n(f) EMI collection;\n\n(g) repayment schedules;\n\n(h) foreclosure;\n\n(i) prepayment;\n\n(j) penal charges;\n\n(k) restructuring;\n\n(l) recovery proceedings;\n\n(m) settlement; and\n\n(n) closure of the loan account,\n\nshall remain the responsibility of the participating lender and the User.\n\nPRYME may assist in facilitating communication where reasonably possible but shall not\n\nassume responsibility for obligations arising under the loan agreement."
      },
      {
        "title": "5.11 No Guarantee of Processing Time",
        "body": "Although PRYME endeavours to facilitate efficient processing, the Company does not\n\nguarantee any specific timeline for:\n\n(a) application review;\n\n(b) document verification;\n\n(c) lender response;\n\n(d) sanction;\n\n(e) execution of documentation;\n\n(f) disbursal; or\n\n(g) post-disbursal servicing.\n\nProcessing timelines depend upon numerous factors beyond PRYME's control, including\n\nlender policies, regulatory requirements, completeness of documentation, verification\n\noutcomes, and the User's responsiveness."
      },
      {
        "title": "5.12 Right to Refuse Facilitation",
        "body": "PRYME reserves the right, at its sole discretion, to decline or discontinue facilitation of any\n\napplication where it reasonably believes that:\n\n(a) information provided is false or misleading;\n\n(b) documents appear forged or manipulated;\n\n(c) fraudulent activity is suspected;\n\n(d) applicable laws or regulatory requirements may be violated;\n\n(e) continued processing may expose PRYME or participating lenders to legal, operational,\n\nfinancial, cybersecurity, or reputational risk; or\n\n(f) any other circumstance exists that reasonably justifies refusal.\n\nSuch refusal shall not be construed as a lending decision or as an assessment of the User's\n\ncreditworthiness."
      },
      {
        "title": "5.13 No Financial or Legal Advice",
        "body": "Information, comparisons, educational content, calculators, recommendations, and Eligibility\n\nEstimates made available through the Platform are provided solely for informational purposes.\n\nNothing contained on the Platform shall constitute financial advice, legal advice, tax advice,\n\ninvestment advice, accounting advice, or any other professional advice.\n\nUsers are encouraged to independently evaluate the suitability of any financial product and,\n\nwhere appropriate, seek advice from qualified professionals before making financial decisions."
      },
      {
        "title": "5.14 User Acknowledgement",
        "body": "By proceeding with any application through the Platform, the User expressly acknowledges\n\nand agrees that:\n\n(a) PRYME functions solely as a technology-enabled facilitation platform;\n\n(b) PRYME does not influence or control lending decisions;\n\n(c) all approvals, rejections, and commercial terms are determined independently by\n\nparticipating lenders;\n\n(d) Eligibility Estimates are indicative only;\n\n(e) PRYME shall not be liable for variations between Platform information and final lender\n\nterms; and\n\n(f) the User voluntarily assumes responsibility for evaluating and accepting any financial\n\nproduct offered by a participating lender."
      },
      {
        "title": "5.15 Compliance with RBI Digital Lending Directions",
        "body": "Where the Services involve facilitation of a loan application to a Participating Lender that\n\nqualifies as a Regulated Entity under the Reserve Bank of India (Digital Lending) Directions,\n\n2025 (as amended or replaced from time to time), PRYME shall, in its capacity as a Lending\n\nService Provider, act in accordance with the due diligence, disclosure, data-handling, and\n\ngrievance redressal requirements prescribed thereunder. PRYME shall remain impartial in the\n\npresentation of loan offers from Participating Lenders and shall not engage in dark patterns,\n\ndeceptive design, or any practice intended to mislead a User into selecting a particular lender\n\nor product. Ranking of loan offers according to a publicly disclosed and consistently applied\n\nmetric shall not be considered promotion of any specific Participating Lender."
      },
      {
        "title": "5.16 Key Fact Statement",
        "body": "Prior to execution of any loan contract facilitated through the Platform, the User shall be\n\nprovided with a Key Fact Statement (\"KFS\") issued by the relevant Participating Lender,\n\ncontaining, without limitation, the Annual Percentage Rate, recovery mechanism, applicable\n\nfees and penal charges, the cooling-off period, and the contact details of the Participating\n\nLender's and PRYME's nodal grievance redressal officer. The User acknowledges that the\n\nKFS, and not any indicative information displayed elsewhere on the Platform, constitutes the\n\nauthoritative disclosure of loan terms prior to execution."
      },
      {
        "title": "5.17 Cooling-Off Period",
        "body": "Every loan facilitated through the Platform shall be subject to a cooling-off period, the\n\nduration of which shall be determined by the relevant Participating Lender in accordance\n\nwith applicable RBI directions and shall be disclosed in the KFS. During the cooling-off\n\nperiod, the User may exit the loan by repaying the disbursed principal together with the\n\napplicable annualised interest for the period the loan was availed, without further penalty\n\nother than a nominal processing fee where applicable. PRYME shall reasonably assist in\n\nfacilitating such exit but the obligation to process it remains that of the Participating Lender."
      }
    ]
  },
  {
    "partNumber": 6,
    "id": "part-6",
    "title": "USER DATA, PRIVACY, CONSENT, COMMUNICATIONS, AND INFORMATION SHARING",
    "clauses": [
      {
        "title": "6.1 Commitment to Privacy",
        "body": "PRYME recognises that the protection of personal information is fundamental to maintaining\n\nthe trust of its Users.\n\nThe Company is committed to collecting, processing, storing, using, sharing, retaining, and\n\nsafeguarding personal information in accordance with applicable laws of India, including the\n\nDigital Personal Data Protection Act, 2023 and any other applicable data protection,\n\ninformation technology, cybersecurity, or regulatory requirements that may apply from time to\n\ntime.\n\nThis Article forms an integral part of these Terms and shall be read together with the Privacy\n\nPolicy published by PRYME. In the event of any inconsistency between this Article and the\n\nPrivacy Policy with respect to data processing practices, the Privacy Policy shall prevail to the\n\nextent of such inconsistency."
      },
      {
        "title": "6.2 Consent to Collection of Information",
        "body": "By accessing or using the Platform, the User expressly consents to the collection and processing\n\nof information necessary for providing the Services.\n\nDepending upon the nature of the Services requested, PRYME may collect information\n\nincluding, but not limited to:\n\n(a) identification details;\n\n(b) contact information;\n\n(c) residential information;\n\n(d) employment details;\n\n(e) employer information;\n\n(f) business information;\n\n(g) income declarations;\n\n(h) banking-related information;\n\n(i) loan requirements;\n\n(j) property-related information;\n\n(k) documents uploaded by the User;\n\n(l) communication preferences;\n\n(m) technical and device information;\n\n(n) website usage information;\n\n(o) authentication information;\n\n(p) information required by participating lenders; and\n\n(q) any other information voluntarily submitted by the User or reasonably required for\n\nproviding the Services.\n\nThe User acknowledges that refusal to provide information reasonably required for processing\n\nan application may limit or prevent PRYME from providing certain Services."
      },
      {
        "title": "6.3 Purpose of Processing",
        "body": "Information collected through the Platform may be processed for purposes including:\n\n(a) creating and maintaining User Accounts;\n\n(b) verifying identity and submitted information;\n\n(c) generating Eligibility Estimates;\n\n(d) facilitating applications with participating lenders;\n\n(e) communicating with Users;\n\n(f) responding to customer support requests;\n\n(g) preventing fraud and unauthorised activity;\n\n(h) improving Platform functionality;\n\n(i) complying with applicable legal and regulatory obligations;\n\n(j) conducting internal audits;\n\n(k) resolving disputes;\n\n(l) maintaining security of the Platform;\n\n(m) analysing Platform performance;\n\n(n) improving customer experience; and\n\n(o) any other lawful purpose reasonably connected with the Services.\n\nPRYME shall process personal information only for legitimate business purposes consistent\n\nwith these Terms and the Privacy Policy."
      },
      {
        "title": "6.4 User Consent for Sharing Information",
        "body": "Where a User chooses to proceed with a financial product application, the User expressly\n\nauthorises PRYME to share the relevant information and documents with the selected\n\nparticipating lender for the purpose of processing that application.\n\nSuch sharing shall occur only after the User has provided the necessary consent through the\n\nPlatform.\n\nThe User acknowledges that participating lenders may require additional information or\n\ndocumentation directly from the User during the course of their independent assessment."
      },
      {
        "title": "6.5 Withdrawal of Consent",
        "body": "The User may withdraw consent for sharing information with a participating lender at any time\n\nbefore the relevant application is submitted through the Platform.\n\nWhere consent is withdrawn prior to submission, PRYME shall discontinue processing the\n\napplication to the extent reasonably practicable.\n\nHowever, once information has been shared with a participating lender pursuant to the User's\n\nconsent, PRYME shall not have the authority to require that lender to return, erase, or cease\n\nprocessing such information.\n\nAny request relating to information already shared with a participating lender shall be governed\n\nby the policies of that lender and applicable law."
      },
      {
        "title": "6.6 Communication Consent",
        "body": "The User expressly consents to receiving communications from PRYME relating to the\n\nServices through one or more of the following channels:\n\n(a) email;\n\n(b) SMS;\n\n(c) WhatsApp;\n\n(d) telephone calls;\n\n(e) dashboard notifications;\n\n(f) website notices; and\n\n(g) any other communication channel lawfully adopted by PRYME.\n\nSuch communications may relate to:\n\n(i) registration;\n\n(ii) account verification;\n\n(iii) OTP authentication;\n\n(iv) application status;\n\n(v) document requests;\n\n(vi) service updates;\n\n(vii) security notifications;\n\n(viii) grievance resolution;\n\n(ix) legal notices;\n\n(x) regulatory disclosures;\n\n(xi) educational financial content where the User has opted to receive such communications;\n\nand\n\n(xii) any other communication reasonably necessary for providing the Services."
      },
      {
        "title": "6.7 Marketing Communications",
        "body": "Where permitted by applicable law and the User's communication preferences, PRYME may\n\nsend information regarding new products, educational resources, promotional campaigns,\n\nrewards, referral programmes, and future services.\n\nThe User may opt out of promotional communications at any time.\n\nOpting out of promotional communications shall not prevent PRYME from sending\n\ncommunications necessary for:\n\n(a) authentication;\n\n(b) account security;\n\n(c) application processing;\n\n(d) transaction confirmations;\n\n(e) legal or regulatory compliance; or\n\n(f) administration of the User's Account."
      },
      {
        "title": "6.8 Call Recording",
        "body": "The User acknowledges and agrees that telephone conversations with PRYME may be\n\nmonitored or recorded, after appropriate notification where required, for purposes including:\n\n(a) quality assurance;\n\n(b) staff training;\n\n(c) dispute resolution;\n\n(d) fraud prevention;\n\n(e) regulatory compliance;\n\n(f) service improvement; and\n\n(g) evidentiary purposes where permitted by law.\n\nSuch recordings shall be handled in accordance with applicable law and the Privacy Policy."
      },
      {
        "title": "6.9 Cookies and Similar Technologies",
        "body": "The Platform may use cookies, pixels, local storage, software development kits (SDKs), and\n\nsimilar technologies to:\n\n(a) authenticate Users;\n\n(b) maintain secure sessions;\n\n(c) remember preferences;\n\n(d) improve performance;\n\n(e) analyse Platform usage;\n\n(f) enhance security;\n\n(g) detect fraudulent activity;\n\n(h) improve user experience; and\n\n(i) support future Platform functionality.\n\nAdditional information regarding the use of cookies shall be provided in the Cookie Policy."
      },
      {
        "title": "6.10 Third-Party Service Providers",
        "body": "In order to operate the Platform efficiently, PRYME may engage trusted third-party service\n\nproviders for functions including:\n\n(a) cloud infrastructure;\n\n(b) data hosting;\n\n(c) cybersecurity;\n\n(d) email delivery;\n\n(e) SMS delivery;\n\n(f) WhatsApp communication;\n\n(g) analytics;\n\n(h) identity verification;\n\n(i) document processing;\n\n(j) customer support technology;\n\n(k) payment services where applicable;\n\n(l) credit bureau integrations where authorised by the User;\n\n(m) Account Aggregator integrations where introduced; and\n\n(n) other technology services reasonably necessary for operating the Platform.\n\nSuch service providers shall receive only such information as is reasonably necessary to\n\nperform the relevant services on behalf of PRYME, subject to appropriate contractual and legal\n\nsafeguards."
      },
      {
        "title": "6.11 Credit Bureau and Future Integrations",
        "body": "At the time of publication of these Terms, PRYME does not obtain a User's credit bureau report\n\nas part of the standard eligibility assessment unless expressly authorised by the User through a\n\nfuture integrated service.\n\nShould PRYME introduce credit bureau integrations, Account Aggregator services, digital\n\nKYC solutions, or similar regulated services, the Company shall obtain the User's explicit\n\nconsent before initiating such requests, wherever required under applicable law."
      },
      {
        "title": "6.12 Data Retention",
        "body": "PRYME shall retain personal information only for as long as reasonably necessary to fulfil the\n\npurposes described in these Terms, comply with legal obligations, resolve disputes, prevent\n\nfraud, maintain audit records, or enforce contractual rights.\n\nWhere a User requests deletion of an Account, PRYME may defer deletion until any pending\n\napplication has been completed, withdrawn, cancelled, or otherwise closed.\n\nFollowing deletion, certain information may continue to be retained for legally permissible\n\npurposes, including compliance, taxation, audits, fraud prevention, dispute resolution, and\n\ndefence of legal claims.\n\nWhere technically feasible, Users may access downloadable personal information for a period\n\nof up to thirty (30) days following confirmation of account deletion."
      },
      {
        "title": "6.13 Security Measures",
        "body": "PRYME implements administrative, organisational, contractual, and technical safeguards\n\ndesigned to protect information against unauthorised access, disclosure, alteration, misuse,\n\ndestruction, or loss.\n\nWhile the Company continuously strives to maintain appropriate security standards, no\n\ninternet-based platform, electronic storage system, or method of transmission can be\n\nguaranteed to be completely secure.\n\nAccordingly, except where prohibited by applicable law, PRYME does not warrant absolute\n\nsecurity of information transmitted electronically."
      },
      {
        "title": "6.14 User Responsibilities",
        "body": "The User shall:\n\n(a) maintain confidentiality of Account credentials;\n\n(b) promptly notify PRYME of suspected unauthorised access;\n\n(c) provide accurate information;\n\n(d) avoid sharing sensitive credentials with unauthorised persons;\n\n(e) use secure devices where reasonably possible; and\n\n(f) cooperate with security verification procedures initiated by PRYME."
      },
      {
        "title": "6.15 User Rights",
        "body": "Subject to applicable law, Users may request:\n\n(a) access to personal information maintained by PRYME;\n\n(b) correction of inaccurate information;\n\n(c) withdrawal of consent where legally permissible;\n\n(d) deletion of personal information, subject to lawful retention requirements; and\n\n(e) such other rights as may become available under applicable data protection legislation.\n\nRequests may be submitted through the contact details specified in the Privacy Policy or such\n\nother mechanism as may be made available by PRYME."
      },
      {
        "title": "6.16 Data Storage Location",
        "body": "Personal information collected from Users for the purpose of digital lending facilitation shall\n\nbe stored on servers located within India, in accordance with applicable RBI directions and the\n\nDigital Personal Data Protection Act, 2023. Collection of information through the Platform\n\nshall be purpose-specific and limited to what is reasonably necessary for the Services; access\n\nto device-level data such as contact lists, call logs, or media files shall not be sought except\n\nwhere strictly required for a one-time identity verification process expressly consented to by\n\nthe User."
      },
      {
        "title": "6.17 Survival",
        "body": "The provisions of this Article shall survive suspension, deletion, or termination of the User's\n\nAccount to the extent necessary for compliance with applicable law, enforcement of contractual\n\nrights, protection of legitimate business interests, resolution of disputes, or fulfilment of legal\n\nobligations."
      }
    ]
  },
  {
    "partNumber": 7,
    "id": "part-7",
    "title": "INTELLECTUAL PROPERTY RIGHTS, PLATFORM OWNERSHIP, LIMITED LICENCE, AND RESTRICTIONS",
    "clauses": [
      {
        "title": "7.1 Ownership of Intellectual Property",
        "body": "The User acknowledges and agrees that the Platform, together with all software, source code,\n\nobject code, databases, interfaces, user experience designs, layouts, workflows, algorithms,\n\neligibility models, scoring methodologies, business logic, calculators, dashboards, application\n\nprogramming interfaces (APIs), artificial intelligence models, machine learning systems,\n\ndocumentation, reports, text, graphics, illustrations, logos, icons, photographs, audio, video,\n\ntrademarks, trade names, service marks, domain names, trade secrets, confidential information,\n\nknow-how, inventions, processes, and all other content, technology, and materials made\n\navailable on or through the Platform (collectively referred to as the \"Intellectual Property\")\n\nare and shall remain the exclusive property of PRYME or its respective licensors.\n\nNothing contained in these Terms shall be construed as transferring, assigning, licensing, or\n\notherwise granting any ownership rights in the Intellectual Property to the User, except for the\n\nlimited licence expressly granted under this Article.\n\nAll rights not expressly granted to the User are hereby reserved by PRYME."
      },
      {
        "title": "7.2 Proprietary Technology",
        "body": "Without limiting the generality of Clause 7.1, the User expressly acknowledges that PRYME\n\nhas invested substantial financial, technical, operational, and intellectual resources in\n\ndeveloping proprietary technologies, including but not limited to:\n\n(a) eligibility estimation methodologies;\n\n(b) product recommendation systems;\n\n(c) financial comparison engines;\n\n(d) customer workflow automation;\n\n(e) document management processes;\n\n(f) fraud detection mechanisms;\n\n(g) application routing systems;\n\n(h) customer communication workflows;\n\n(i) data processing methodologies;\n\n(j) artificial intelligence and automation tools introduced from time to time; and\n\n(k) any enhancements, modifications, upgrades, or derivative works thereof.\n\nSuch proprietary technologies constitute valuable confidential intellectual property of PRYME\n\nand shall remain protected under applicable intellectual property laws, trade secret laws,\n\ncontractual obligations, and principles of equity."
      },
      {
        "title": "7.3 Trademarks",
        "body": "The names PRYME, PRYME Loans, GOPRYME FINTECH PRIVATE LIMITED, the\n\nCompany's logos, trade dress, visual identity, branding elements, slogans, graphics, domain\n\nnames, icons, and any other identifying marks displayed on the Platform are proprietary\n\ntrademarks or branding assets belonging to PRYME or its licensors unless otherwise indicated.\n\nNothing contained on the Platform grants any licence or permission to use any trademark\n\nwithout the Company's prior written consent.\n\nUnauthorised use of any trademark, logo, branding element, or domain name that is identical\n\nwith or confusingly similar to PRYME's intellectual property is strictly prohibited."
      },
      {
        "title": "7.4 Copyright",
        "body": "All copyright and related rights in the Platform, including software, website content, reports,\n\ndocumentation, articles, educational material, images, graphics, videos, downloadable content,\n\ndatabases, and compilations, belong to PRYME or its licensors.\n\nSuch works are protected under the Copyright Act, 1957, applicable international treaties, and\n\nother applicable intellectual property laws.\n\nThe User shall not reproduce, distribute, modify, publish, transmit, publicly display, publicly\n\nperform, create derivative works from, or otherwise exploit any copyrighted material without\n\nprior written permission from PRYME."
      },
      {
        "title": "7.5 Limited Licence",
        "body": "Subject to continued compliance with these Terms, PRYME grants the User a limited, personal,\n\nrevocable, non-exclusive, non-transferable, non-sublicensable licence to access and use the\n\nPlatform solely for lawful personal purposes related to the Services.\n\nThis licence does not permit the User to:\n\n(a) commercially exploit the Platform;\n\n(b) copy substantial portions of the Platform;\n\n(c) create competing products or services;\n\n(d) distribute Platform content to third parties;\n\n(e) use Platform content for commercial gain;\n\n(f) remove proprietary notices;\n\n(g) access systems beyond those ordinarily available to Users; or\n\n(h) engage in any activity inconsistent with these Terms.\n\nThe licence granted under this Article automatically terminates upon suspension or termination\n\nof the User's Account or upon cessation of these Terms for any reason."
      },
      {
        "title": "7.6 Restrictions on Use",
        "body": "Except where expressly authorised by PRYME in writing or permitted under mandatory\n\nprovisions of applicable law, the User shall not directly or indirectly:\n\n(a) reproduce any portion of the Platform;\n\n(b) copy or duplicate software;\n\n(c) download Platform databases;\n\n(d) extract substantial quantities of data;\n\n(e) scrape lender information;\n\n(f) harvest customer information;\n\n(g) create mirror websites;\n\n(h) modify Platform content;\n\n(i) translate proprietary software;\n\n(j) adapt Platform technology;\n\n(k) commercially exploit any portion of the Platform;\n\n(l) use Platform content to train artificial intelligence models without written permission;\n\n(m) attempt to reconstruct eligibility algorithms;\n\n(n) use automated systems to collect Platform information; or\n\n(o) otherwise exploit PRYME's Intellectual Property in any manner inconsistent with these\n\nTerms."
      },
      {
        "title": "7.7 Reverse Engineering",
        "body": "Except where expressly permitted by applicable law that cannot lawfully be excluded, the User\n\nshall not:\n\n(a) reverse engineer;\n\n(b) decompile;\n\n(c) disassemble;\n\n(d) decode;\n\n(e) circumvent security mechanisms;\n\n(f) analyse internal architecture;\n\n(g) reconstruct databases;\n\n(h) derive source code;\n\n(i) discover proprietary algorithms; or\n\n(j) otherwise attempt to determine the underlying implementation of any software, algorithm,\n\nmodel, or technology used by PRYME."
      },
      {
        "title": "7.8 User Feedback",
        "body": "PRYME welcomes suggestions, comments, ideas, feature requests, testimonials, reviews, and\n\nother feedback submitted by Users.\n\nUnless otherwise agreed in writing, the User grants PRYME a perpetual, worldwide,\n\nirrevocable, royalty-free, transferable, sublicensable, and non-exclusive right to use, reproduce,\n\nmodify, publish, translate, distribute, adapt, display, and incorporate such feedback into the\n\nPlatform or the Company's business without payment of compensation.\n\nNothing in this Clause obligates PRYME to implement any suggestion or maintain any\n\ncommunication regarding submitted feedback."
      },
      {
        "title": "7.9 User Content",
        "body": "To the extent that a User uploads documents, information, photographs, communications, or\n\nother content to the Platform, the User retains ownership of such material.\n\nHowever, the User grants PRYME a limited, non-exclusive, royalty-free licence to store,\n\nreproduce, transmit, process, verify, analyse, and share such material with participating lenders\n\nand authorised service providers solely for purposes connected with the Services, regulatory\n\ncompliance, fraud prevention, dispute resolution, and operation of the Platform.\n\nSuch licence shall continue only for as long as reasonably necessary to fulfil the purposes\n\ncontemplated under these Terms or applicable law."
      },
      {
        "title": "7.10 Third-Party Intellectual Property",
        "body": "Certain content, trademarks, logos, software, financial product information, lender names, or\n\nother materials displayed on the Platform may belong to participating lenders or other third\n\nparties.\n\nNothing contained on the Platform shall be interpreted as granting the User any right to use\n\nsuch third-party intellectual property.\n\nUsers shall independently comply with any applicable rights relating to third-party content."
      },
      {
        "title": "7.11 Monitoring and Enforcement",
        "body": "PRYME reserves the right to investigate suspected infringements of its Intellectual Property\n\nand may, without limitation:\n\n(a) suspend User Accounts;\n\n(b) restrict Platform access;\n\n(c) remove infringing material;\n\n(d) issue cease and desist notices;\n\n(e) seek injunctive relief;\n\n(f) recover damages;\n\n(g) claim legal costs;\n\n(h) report unlawful activity to competent authorities; and\n\n(i) pursue any other remedy available under applicable law.\n\nThe exercise of one remedy shall not preclude PRYME from exercising any other remedy\n\navailable under law or equity."
      },
      {
        "title": "7.12 No Implied Rights",
        "body": "No provision of these Terms shall be interpreted as granting the User any licence, ownership\n\ninterest, assignment, or right by implication, estoppel, waiver, or otherwise in respect of the\n\nIntellectual Property of PRYME or any third party.\n\nAny rights not expressly granted under these Terms are expressly reserved."
      },
      {
        "title": "7.13 Survival",
        "body": "The provisions contained in this Article shall survive suspension, deletion, termination of the\n\nUser's Account, discontinuation of the Platform, expiration of these Terms, or completion of\n\nany Services provided by PRYME, to the extent necessary to protect the Company's intellectual\n\nproperty rights and enforce its legal remedies."
      }
    ]
  },
  {
    "partNumber": 8,
    "id": "part-8",
    "title": "FEES, REWARDS, CASHBACK, REFERRAL PROGRAMMES, PROMOTIONAL CAMPAIGNS, AND COMMERCIAL POLICIES",
    "clauses": [
      {
        "title": "8.1 No Charges to Users",
        "body": "Unless expressly communicated otherwise in writing for a specific product or service\n\nintroduced in the future, PRYME does not charge Users any fee for:\n\n(a) accessing the Platform;\n\n(b) browsing or comparing financial products;\n\n(c) obtaining an Eligibility Estimate;\n\n(d) creating or maintaining a User Account;\n\n(e) submitting a loan application through the Platform;\n\n(f) receiving customer support relating to the application process; or\n\n(g) using any feature expressly identified as free on the Platform.\n\nThe User acknowledges that access to the Platform and the Services described above is\n\npresently provided without any platform fee, convenience fee, consultation fee, subscription\n\nfee, or application submission fee payable to PRYME."
      },
      {
        "title": "8.2 Future Paid Services",
        "body": "PRYME reserves the right to introduce paid products, premium services, subscriptions,\n\nadvisory tools, software features, or additional financial services in the future.\n\nWhere any paid service is introduced:\n\n(a) the applicable charges shall be clearly disclosed before the User incurs any payment\n\nobligation;\n\n(b) acceptance of such charges shall require the User's express consent;\n\n(c) additional product-specific terms may apply; and\n\n(d) nothing in this Article shall require a User to purchase optional paid services in order to\n\ncontinue using those portions of the Platform that remain free."
      },
      {
        "title": "8.3 Promotional Campaigns",
        "body": "From time to time, PRYME may introduce promotional campaigns intended to encourage\n\ncustomer engagement or reward eligible Users.\n\nSuch campaigns may include, without limitation:\n\n(a) cashback programmes;\n\n(b) referral programmes;\n\n(c) reward points;\n\n(d) discount vouchers;\n\n(e) promotional coupons;\n\n(f) seasonal campaigns;\n\n(g) contests;\n\n(h) incentive programmes;\n\n(i) partner offers; or\n\n(j) any other promotional initiative determined by PRYME.\n\nParticipation in any promotional campaign shall always remain subject to the specific terms\n\ngoverning that campaign in addition to these Terms."
      },
      {
        "title": "8.4 Cashback Eligibility",
        "body": "Unless otherwise specified under a particular promotional campaign, cashback or similar\n\nmonetary rewards shall become payable only after all applicable eligibility conditions have\n\nbeen satisfied.\n\nWithout limitation, PRYME may require that:\n\n(a) the application has been submitted through the Platform;\n\n(b) the loan has been approved by the participating lender;\n\n(c) the loan has been successfully disbursed;\n\n(d) the User has complied with these Terms;\n\n(e) the promotional campaign remains applicable to the relevant transaction; and\n\n(f) any additional conditions published for the campaign have been fulfilled.\n\nNo User shall acquire any vested right to cashback until all applicable conditions have been\n\nsatisfied."
      },
      {
        "title": "8.5 Circumstances in Which Cashback May Be Refused",
        "body": "PRYME reserves the right to refuse, suspend, reverse, or cancel cashback, promotional\n\nrewards, or incentives where:\n\n(a) the application is rejected;\n\n(b) the application is withdrawn by the User;\n\n(c) the loan is cancelled before disbursal;\n\n(d) the User submits false or misleading information;\n\n(e) fraudulent documentation is identified;\n\n(f) duplicate Accounts are used;\n\n(g) self-referrals are detected;\n\n(h) promotional abuse is identified;\n\n(i) the transaction does not satisfy the campaign requirements;\n\n(j) the User breaches these Terms; or\n\n(k) payment would otherwise violate applicable law or regulatory requirements.\n\nThe exercise of this right shall not prejudice any additional legal remedies available to PRYME."
      },
      {
        "title": "8.6 Honouring Valid Rewards",
        "body": "Notwithstanding Clause 8.5, where a User has validly qualified for a cashback or promotional\n\nreward in accordance with the applicable campaign terms and PRYME has expressly\n\ncommunicated that such reward is payable, PRYME shall honour the commitment within the\n\napplicable timeline, subject to verification of eligibility and compliance with these Terms.\n\nNothing contained in these Terms shall permit PRYME to arbitrarily deny a reward that has\n\nbeen legitimately earned under an applicable promotional programme."
      },
      {
        "title": "8.7 Referral Programmes",
        "body": "PRYME may introduce referral programmes in the future to encourage Users to introduce new\n\ncustomers to the Platform.\n\nParticipation in any referral programme shall be entirely voluntary and governed by separate\n\npromotional terms published by PRYME.\n\nPRYME reserves the right to determine:\n\n(a) referral eligibility;\n\n(b) qualifying events;\n\n(c) reward structures;\n\n(d) payment timelines;\n\n(e) programme duration;\n\n(f) geographical availability; and\n\n(g) any other conditions applicable to the programme."
      },
      {
        "title": "8.8 Referral Abuse",
        "body": "Without limiting any other rights available to PRYME, referral rewards may be withheld,\n\ncancelled, reversed, or recovered where PRYME reasonably determines that a User has\n\nengaged in:\n\n(a) self-referrals;\n\n(b) creation of multiple Accounts;\n\n(c) fake registrations;\n\n(d) automated referrals;\n\n(e) impersonation;\n\n(f) fraudulent applications;\n\n(g) misleading information;\n\n(h) manipulation of referral tracking mechanisms;\n\n(i) collusive activity; or\n\n(j) any conduct intended to unfairly obtain referral benefits.\n\nPRYME's determination regarding referral abuse shall be based upon its internal fraud\n\ndetection procedures and reasonable assessment of the relevant circumstances."
      },
      {
        "title": "8.9 Promotional Changes",
        "body": "PRYME reserves the right to introduce, amend, suspend, extend, replace, or discontinue any\n\npromotional campaign, referral programme, cashback scheme, or reward initiative at any time.\n\nSuch modifications shall operate prospectively unless otherwise required by applicable law.\n\nNo modification shall affect rewards that have already been validly earned and expressly\n\nconfirmed in accordance with the applicable promotional terms."
      },
      {
        "title": "8.10 Taxes",
        "body": "Unless expressly stated otherwise, any tax implications arising from cashback, referral\n\nincentives, rewards, or other promotional benefits shall remain the responsibility of the User to\n\nthe extent required under applicable law.\n\nWhere PRYME is required by law to deduct or withhold taxes before making any payment,\n\nPRYME may do so in accordance with applicable legal requirements."
      },
      {
        "title": "8.11 No Right to Continued Promotions",
        "body": "The User acknowledges that promotional campaigns are discretionary business initiatives\n\nintroduced by PRYME from time to time.\n\nNothing contained in these Terms shall be interpreted as creating a continuing obligation upon\n\nPRYME to:\n\n(a) continue any promotion;\n\n(b) maintain identical reward structures;\n\n(c) repeat previous campaigns;\n\n(d) provide equivalent benefits in future campaigns; or\n\n(e) introduce promotions at any minimum frequency."
      },
      {
        "title": "8.12 Errors and Administrative Corrections",
        "body": "If PRYME discovers that a cashback, reward, referral payment, voucher, coupon, or other\n\npromotional benefit has been issued due to a technical error, system malfunction, duplicate\n\nprocessing, fraudulent activity, or administrative mistake, PRYME reserves the right to correct\n\nthe error.\n\nSuch correction may include:\n\n(a) cancellation of the reward;\n\n(b) adjustment of the amount payable;\n\n(c) recovery of excess payments where legally permissible;\n\n(d) suspension of further promotional benefits pending investigation; or\n\n(e) any other reasonable corrective action.\n\nBefore recovering any amount from a User, PRYME may provide the User with an opportunity\n\nto explain the circumstances where appropriate."
      },
      {
        "title": "8.13 Commercial Independence",
        "body": "Participation in any promotional campaign shall not influence:\n\n(a) the Eligibility Estimate generated by the Platform;\n\n(b) the credit assessment undertaken by a participating lender;\n\n(c) the lender's underwriting process;\n\n(d) the lender's commercial terms; or\n\n(e) the lender's decision to approve or reject an application.\n\nAll lending decisions remain solely within the discretion of the participating lender irrespective\n\nof any promotional programme operated by PRYME."
      },
      {
        "title": "8.14 Future Commercial Policies",
        "body": "PRYME may introduce additional commercial policies governing premium subscriptions,\n\nvalue-added services, insurance products, credit cards, investments, Account Aggregator\n\nservices, artificial intelligence features, financial planning tools, or other financial technology\n\nservices.\n\nWhere such services are introduced, they may be governed by separate product-specific terms\n\nin addition to these Terms."
      },
      {
        "title": "8.15 Survival",
        "body": "The provisions of this Article shall survive termination of the User's Account to the extent\n\nnecessary for the administration of pending promotional claims, investigation of fraud,\n\nrecovery of amounts lawfully due, compliance with legal obligations, or enforcement of\n\nPRYME's rights under these Terms."
      }
    ]
  },
  {
    "partNumber": 9,
    "id": "part-9",
    "title": "THIRD-PARTY SERVICES, PARTICIPATING LENDERS, EXTERNAL PLATFORMS, AND REGULATORY INDEPENDENCE",
    "clauses": [
      {
        "title": "9.1 Independent Third-Party Relationships",
        "body": "The User acknowledges and agrees that, in order to provide the Services efficiently, PRYME\n\nmay integrate with, communicate with, or facilitate interactions between the User and various\n\nindependent third parties.\n\nSuch third parties may include, without limitation:\n\n(a) scheduled commercial banks;\n\n(b) Non-Banking Financial Companies (NBFCs);\n\n(c) housing finance companies;\n\n(d) regulated financial institutions;\n\n(e) credit information companies and credit bureaus, where expressly authorised by the User;\n\n(f) digital identity verification providers;\n\n(g) Account Aggregator ecosystem participants, if introduced in the future;\n\n(h) cloud infrastructure providers;\n\n(i) cybersecurity service providers;\n\n(j) communication service providers, including SMS, email, and messaging platforms;\n\n(k) analytics providers;\n\n(l) document verification service providers;\n\n(m) payment service providers, if applicable; and\n\n(n) any other third-party service provider reasonably required for the operation, enhancement,\n\nsecurity, or delivery of the Platform.\n\nEach such entity operates independently of PRYME and remains responsible for its own\n\nproducts, services, policies, contractual obligations, operational procedures, and legal\n\ncompliance."
      },
      {
        "title": "9.2 No Partnership or Agency",
        "body": "Unless expressly stated in a written agreement, nothing contained in these Terms or on the\n\nPlatform shall be construed as creating:\n\n(a) a partnership;\n\n(b) a joint venture;\n\n(c) an employment relationship;\n\n(d) an agency relationship;\n\n(e) a franchise;\n\n(f) a fiduciary relationship; or\n\n(g) any other legal relationship empowering PRYME to bind or legally represent a\n\nparticipating lender or third-party service provider.\n\nSimilarly, no participating lender or third-party service provider shall be deemed to be an\n\nagent, employee, representative, or legal extension of PRYME solely by virtue of being\n\naccessible through the Platform."
      },
      {
        "title": "9.3 Independence of Participating Lenders",
        "body": "Every participating lender maintains complete operational, commercial, legal, and regulatory\n\nindependence.\n\nAccordingly, participating lenders retain exclusive authority over matters including, but not\n\nlimited to:\n\n(a) customer onboarding;\n\n(b) underwriting criteria;\n\n(c) credit evaluation;\n\n(d) risk assessment;\n\n(e) documentation requirements;\n\n(f) interest rates;\n\n(g) processing fees;\n\n(h) sanction conditions;\n\n(i) collateral requirements;\n\n(j) legal verification;\n\n(k) technical verification;\n\n(l) valuation processes;\n\n(m) loan documentation;\n\n(n) disbursal timelines;\n\n(o) repayment administration;\n\n(p) foreclosure policies;\n\n(q) recovery proceedings; and\n\n(r) closure of loan accounts.\n\nPRYME neither directs nor controls these decisions."
      },
      {
        "title": "9.4 No Liability for Third-Party Decisions",
        "body": "PRYME shall not be liable for any act, omission, negligence, delay, error, breach, default,\n\nrefusal, or decision of any participating lender or third-party service provider.\n\nWithout limitation, PRYME shall not be responsible for:\n\n(a) rejection of a loan application;\n\n(b) modification of commercial terms;\n\n(c) delay in processing;\n\n(d) delay in disbursal;\n\n(e) refusal to process an application;\n\n(f) requests for additional documentation;\n\n(g) technical failures occurring within third-party systems;\n\n(h) operational errors of third-party service providers;\n\n(i) customer service deficiencies of participating lenders;\n\n(j) recovery actions initiated by lenders;\n\n(k) foreclosure charges imposed by lenders;\n\n(l) interest calculations undertaken by lenders;\n\n(m) closure of financial products by lenders; or\n\n(n) any contractual dispute arising between the User and a participating lender."
      },
      {
        "title": "9.5 Information Provided by Third Parties",
        "body": "Certain information displayed on the Platform, including product features, indicative interest\n\nrates, lender programmes, eligibility criteria, documentation requirements, and promotional\n\ncampaigns, may originate from participating lenders or other reliable third-party sources.\n\nAlthough PRYME undertakes reasonable efforts to maintain current information, the Company\n\ndoes not warrant that such information shall always remain complete, accurate, or up to date,\n\nas third parties may modify or withdraw information without prior notice.\n\nUsers are advised to carefully review all documentation issued directly by the participating\n\nlender before accepting any financial product."
      },
      {
        "title": "9.6 External Websites and Links",
        "body": "The Platform may contain hyperlinks, references, integrations, embedded services, or\n\nredirections to websites or applications operated by third parties.\n\nSuch links are provided solely for the convenience of Users.\n\nPRYME does not control, monitor, endorse, certify, or assume responsibility for:\n\n(a) third-party websites;\n\n(b) external content;\n\n(c) third-party privacy practices;\n\n(d) availability of external services;\n\n(e) security of external platforms;\n\n(f) products offered by third parties; or\n\n(g) contractual relationships entered into by Users with third parties.\n\nAccessing any external platform is undertaken entirely at the User's own discretion and risk."
      },
      {
        "title": "9.7 Third-Party Terms",
        "body": "Certain Services made available through the Platform may require the User to separately\n\naccept the terms, privacy policies, or contractual conditions of participating lenders or other\n\nthird-party service providers.\n\nThe User acknowledges that such third-party agreements exist independently of these Terms.\n\nNothing contained herein shall modify, replace, or override any agreement entered into\n\ndirectly between the User and a participating lender or third-party service provider."
      },
      {
        "title": "9.8 Credit Bureau Services",
        "body": "Where PRYME introduces integrations with credit bureaus or credit information companies\n\nin the future, such services shall be accessed only after obtaining the User's express consent\n\nwherever required under applicable law.\n\nThe User acknowledges that:\n\n(a) PRYME does not presently perform routine credit bureau enquiries as part of the standard\n\neligibility assessment;\n\n(b) future credit bureau integrations may be governed by additional terms;\n\n(c) participating lenders may independently obtain credit reports as part of their own\n\nunderwriting process; and\n\n(d) PRYME shall not be responsible for the contents, accuracy, completeness, or decisions\n\narising from information maintained by any credit bureau."
      },
      {
        "title": "9.9 Account Aggregator and Future Integrations",
        "body": "If PRYME introduces services through the Account Aggregator ecosystem or other regulated\n\nfinancial technology frameworks in the future, such services shall be subject to:\n\n(a) the User's explicit consent wherever required;\n\n(b) applicable regulatory requirements;\n\n(c) separate product-specific terms where necessary; and\n\n(d) the policies of the relevant regulated entities participating in such ecosystems.\n\nNothing contained in these Terms shall require PRYME to introduce or maintain any\n\nparticular integration."
      },
      {
        "title": "9.10 Technology Service Providers",
        "body": "PRYME may engage independent technology service providers for purposes including\n\nhosting, storage, cybersecurity, communication, analytics, document management,\n\nauthentication, fraud prevention, software development, artificial intelligence, customer\n\nsupport, and operational efficiency.\n\nThe engagement of such providers shall not diminish the Company's commitment to\n\nsafeguarding User information in accordance with applicable law and the Privacy Policy."
      },
      {
        "title": "9.11 Regulatory Independence",
        "body": "Each participating lender, third-party financial institution, and regulated service provider\n\nremains independently responsible for obtaining and maintaining all licences, registrations,\n\napprovals, and authorisations required under applicable law.\n\nThe User acknowledges that PRYME's use of or integration with any such entity shall not be\n\ninterpreted as:\n\n(a) regulatory endorsement of PRYME;\n\n(b) a guarantee of regulatory compliance by any third party;\n\n(c) a representation regarding the financial condition of any participating lender; or\n\n(d) a guarantee regarding the quality or suitability of any third-party service."
      },
      {
        "title": "9.12 Changes in Third-Party Relationships",
        "body": "PRYME reserves the right to add, remove, replace, suspend, or modify participating lenders,\n\nservice providers, integrations, partnerships, and external technologies at any time in\n\nresponse to commercial, operational, regulatory, technical, or strategic considerations.\n\nThe removal or addition of any third party shall not create any liability on the part of PRYME\n\ntoward the User."
      },
      {
        "title": "9.13 User Responsibility",
        "body": "The User remains solely responsible for reviewing and understanding:\n\n(a) the terms issued by participating lenders;\n\n(b) loan agreements;\n\n(c) sanction letters;\n\n(d) repayment schedules;\n\n(e) security documents;\n\n(f) privacy policies of third parties where applicable; and\n\n(g) any contractual documentation executed directly with a participating lender.\n\nPRYME strongly encourages Users to seek independent professional advice where they do\n\nnot fully understand the legal or financial implications of any financial product."
      },
      {
        "title": "9.14 Survival",
        "body": "The rights, protections, limitations of liability, acknowledgements, disclaimers, and\n\nobligations contained in this Article shall survive suspension, termination, deletion of the\n\nUser's Account, discontinuation of the Platform, or expiry of these Terms to the extent\n\nnecessary to protect the lawful interests of PRYME and participating third parties."
      }
    ]
  },
  {
    "partNumber": 10,
    "id": "part-10",
    "title": "LIMITATION OF LIABILITY, DISCLAIMER OF WARRANTIES, INDEMNIFICATION, AND ALLOCATION OF RISK",
    "clauses": [
      {
        "title": "10.1 Allocation of Risk",
        "body": "The User acknowledges that the Platform is a technology-enabled facilitation platform intended\n\nto assist Users in comparing financial products, obtaining indicative eligibility assessments,\n\nand connecting with participating financial institutions.\n\nThe User further acknowledges that lending decisions involve numerous commercial,\n\nregulatory, financial, technological, legal, and operational factors that remain outside the\n\ncontrol of PRYME.\n\nAccordingly, the Parties expressly agree that the risks associated with any financial product\n\nobtained through the Platform shall be allocated in accordance with this Article."
      },
      {
        "title": "10.2 No Warranty of Loan Approval",
        "body": "PRYME expressly disclaims any representation, warranty, assurance, or guarantee that:\n\n(a) a loan application will be approved;\n\n(b) a lender will issue a sanction letter;\n\n(c) a lender will offer a particular loan amount;\n\n(d) a lender will offer a particular interest rate;\n\n(e) a lender will offer a particular repayment tenure;\n\n(f) a lender will process an application within any specified period;\n\n(g) a lender will disburse funds; or\n\n(h) a lender will continue to offer a financial product displayed on the Platform.\n\nAll such decisions remain exclusively within the discretion of the participating lender."
      },
      {
        "title": "10.3 Eligibility Estimates",
        "body": "The User understands and agrees that every Eligibility Estimate displayed on the Platform is\n\nindicative in nature.\n\nAn Eligibility Estimate shall not constitute:\n\n(a) financial advice;\n\n(b) legal advice;\n\n(c) tax advice;\n\n(d) investment advice;\n\n(e) a loan approval;\n\n(f) a commitment to lend;\n\n(g) a contractual offer; or\n\n(h) a legally enforceable promise.\n\nUsers should independently evaluate every financial product before accepting any offer made\n\nby a participating lender."
      },
      {
        "title": "10.4 Technology and Platform Availability",
        "body": "PRYME continuously endeavours to provide a secure, reliable, and efficient Platform.\n\nHowever, the User acknowledges that technology is inherently subject to limitations,\n\ninterruptions, maintenance activities, software defects, internet failures, cyber threats, human\n\nerror, and events beyond reasonable control.\n\nAccordingly, PRYME does not warrant that:\n\n(a) the Platform will always remain uninterrupted;\n\n(b) every feature will always function without error;\n\n(c) temporary outages will never occur;\n\n(d) data transmission will always be instantaneous;\n\n(e) the Platform will always remain compatible with every device or browser; or\n\n(f) technical issues will never arise.\n\nNothing contained in this Clause shall be interpreted as reducing PRYME's commitment to\n\nmaintaining appropriate operational and security standards."
      },
      {
        "title": "10.5 No Financial Advisory Relationship",
        "body": "Information, calculators, educational material, comparisons, recommendations, AI-assisted\n\nsuggestions, blogs, articles, FAQs, and other informational resources made available through\n\nthe Platform are intended solely to assist Users in understanding financial products.\n\nSuch information shall not be interpreted as creating:\n\n(a) a financial adviser-client relationship;\n\n(b) an investment adviser relationship;\n\n(c) a legal adviser-client relationship;\n\n(d) a fiduciary relationship; or\n\n(e) any professional advisory engagement."
      },
      {
        "title": "10.6 Limitation of Liability",
        "body": "To the fullest extent permitted under applicable law, PRYME shall not be liable for any direct,\n\nindirect, incidental, consequential, special, exemplary, punitive, or economic loss arising out\n\nof or in connection with:\n\n(a) rejection of a loan application;\n\n(b) delay in processing;\n\n(c) lender decisions;\n\n(d) modification of lender terms;\n\n(e) delay in disbursal;\n\n(f) inaccuracies resulting from incorrect information supplied by the User;\n\n(g) interruption of Platform services;\n\n(h) unauthorised acts of third parties;\n\n(i) reliance placed upon indicative Eligibility Estimates;\n\n(j) business interruption;\n\n(k) loss of profits;\n\n(l) loss of business opportunity;\n\n(m) loss of goodwill;\n\n(n) reputational harm;\n\n(o) data loss caused by circumstances beyond PRYME's reasonable control; or\n\n(p) any act or omission of a participating lender or independent third-party service provider.\n\nNothing contained in these Terms shall exclude or limit liability where such exclusion is\n\nprohibited under applicable law."
      },
      {
        "title": "10.7 User Responsibility",
        "body": "The User remains solely responsible for:\n\n(a) evaluating the suitability of financial products;\n\n(b) reviewing sanction letters and loan documentation;\n\n(c) understanding repayment obligations;\n\n(d) ensuring the accuracy of information submitted;\n\n(e) safeguarding Account credentials;\n\n(f) complying with applicable laws; and\n\n(g) making independent financial decisions.\n\nThe User acknowledges that reliance upon the Platform shall not replace independent\n\njudgment."
      },
      {
        "title": "10.8 Indemnification",
        "body": "The User agrees to defend, indemnify, and hold harmless GOPRYME FINTECH PRIVATE\n\nLIMITED, its directors, officers, employees, consultants, affiliates, service providers,\n\nsuccessors, assigns, and authorised representatives from and against any claims, proceedings,\n\ndemands, damages, liabilities, losses, penalties, fines, costs, expenses, and reasonable legal\n\nfees arising out of or relating to:\n\n(a) breach of these Terms;\n\n(b) submission of false, misleading, or fraudulent information;\n\n(c) forged or manipulated documentation;\n\n(d) misuse of the Platform;\n\n(e) violation of applicable law;\n\n(f) infringement of intellectual property rights;\n\n(g) unauthorised access to the Platform using the User's credentials;\n\n(h) disputes arising from the User's relationship with a participating lender; or\n\n(i) any negligent, unlawful, or fraudulent act or omission of the User."
      },
      {
        "title": "10.9 Mitigation",
        "body": "Nothing contained in this Article shall prevent PRYME from taking reasonable steps to\n\nmitigate losses, investigate suspected fraud, cooperate with regulatory authorities, or enforce\n\nits contractual and legal rights."
      },
      {
        "title": "10.10 Survival",
        "body": "The provisions contained in this Article shall survive suspension or termination of the User's\n\nAccount, discontinuation of the Platform, completion of Services, expiry of these Terms, and\n\nany subsequent contractual relationship between the User and a participating lender."
      }
    ]
  },
  {
    "partNumber": 11,
    "id": "part-11",
    "title": "SUSPENSION, RESTRICTION, TERMINATION, ACCOUNT DELETION, AND EFFECT OF TERMINATION",
    "clauses": [
      {
        "title": "11.1 General Right to Suspend or Restrict Access",
        "body": "In order to protect the integrity of the Platform, safeguard the interests of Users and\n\nparticipating lenders, maintain compliance with applicable laws, and preserve the security of\n\nits technology infrastructure, PRYME reserves the right, at its sole but reasonable discretion,\n\nto suspend, restrict, limit, or terminate access to all or any part of the Platform.\n\nSuch action may be taken temporarily or permanently depending upon the nature, severity,\n\nrecurrence, and potential impact of the relevant circumstances.\n\nNothing contained in this Article shall obligate PRYME to continue providing access to the\n\nPlatform where doing so may expose the Company, its Users, participating lenders, service\n\nproviders, or regulatory standing to unreasonable legal, financial, operational, cybersecurity,\n\nor reputational risk."
      },
      {
        "title": "11.2 Suspension Without Prior Notice",
        "body": "Without prejudice to any other rights available under these Terms or applicable law, PRYME\n\nmay immediately suspend or restrict access to the Platform, with or without prior notice, where\n\nit reasonably believes that:\n\n(a) false, inaccurate, misleading, or incomplete information has been submitted;\n\n(b) forged, manipulated, fabricated, or fraudulent documentation has been uploaded;\n\n(c) the User has violated these Terms;\n\n(d) the User has violated applicable law;\n\n(e) fraudulent activity is suspected;\n\n(f) identity theft is suspected;\n\n(g) unauthorised access has been detected;\n\n(h) the User has attempted to compromise the security of the Platform;\n\n(i) multiple unauthorised Accounts have been created;\n\n(j) referral abuse or promotional fraud has been detected;\n\n(k) the User has attempted to interfere with Platform operations;\n\n(l) the User has engaged in abusive, threatening, defamatory, discriminatory, or unlawful\n\nconduct toward PRYME personnel or other Users;\n\n(m) PRYME receives a lawful direction from a competent authority; or\n\n(n) any other circumstance exists which, in PRYME's reasonable opinion, justifies immediate\n\nprotective action."
      },
      {
        "title": "11.3 Restriction of Specific Features",
        "body": "Instead of suspending an entire Account, PRYME may restrict specific Platform features where\n\nsuch action is proportionate to the circumstances.\n\nSuch restrictions may include limitation or suspension of:\n\n(a) loan application submissions;\n\n(b) document uploads;\n\n(c) promotional benefits;\n\n(d) referral programmes;\n\n(e) account modifications;\n\n(f) eligibility assessments;\n\n(g) customer communications; or\n\n(h) any other Platform functionality reasonably considered necessary."
      },
      {
        "title": "11.4 Investigation",
        "body": "Where suspicious activity is detected, PRYME may initiate an internal investigation.\n\nDuring such investigation, PRYME may:\n\n(a) temporarily suspend processing of an application;\n\n(b) seek clarification from the User;\n\n(c) request additional documents;\n\n(d) verify information with participating lenders where appropriate;\n\n(e) engage specialised fraud detection procedures;\n\n(f) cooperate with competent governmental or regulatory authorities where legally required;\n\nand\n\n(g) take any other reasonable step necessary to protect the Platform and its stakeholders.\n\nThe User agrees to reasonably cooperate during any such investigation.\n\nFailure to cooperate may result in continued suspension or termination of access."
      },
      {
        "title": "11.5 Termination by PRYME",
        "body": "PRYME may permanently terminate a User's Account where it reasonably determines that:\n\n(a) material fraud has occurred;\n\n(b) repeated breaches of these Terms have occurred;\n\n(c) the User has intentionally misled PRYME or participating lenders;\n\n(d) forged or fabricated documents have been submitted;\n\n(e) the Platform has been used for unlawful purposes;\n\n(f) the User has attempted to circumvent fraud detection systems;\n\n(g) continued access would expose PRYME to unreasonable legal or operational risk; or\n\n(h) termination is otherwise necessary to protect the legitimate interests of PRYME,\n\nparticipating lenders, Users, or third-party service providers.\n\nTermination under this Clause shall not prejudice PRYME's right to pursue any other remedy\n\navailable under these Terms or applicable law."
      },
      {
        "title": "11.6 Termination by the User",
        "body": "The User may discontinue use of the Platform at any time.\n\nWhere the User has created an Account, the User may request deletion in accordance with the\n\nprocedures prescribed by PRYME.\n\nWhere a loan application remains pending, under review, approved but awaiting\n\ndocumentation, awaiting disbursal, or otherwise in progress, PRYME may postpone processing\n\nof the deletion request until the relevant application has been completed, cancelled, withdrawn,\n\nor otherwise closed."
      },
      {
        "title": "11.7 Effect of Suspension",
        "body": "During the period of suspension, PRYME may, depending upon the circumstances:\n\n(a) prevent login to the Platform;\n\n(b) suspend ongoing application processing;\n\n(c) restrict access to documents;\n\n(d) disable promotional benefits;\n\n(e) suspend referral eligibility;\n\n(f) prevent modification of profile information;\n\n(g) temporarily disable communications through the Platform; or\n\n(h) implement any other reasonable restriction considered necessary.\n\nSuspension shall not automatically release the User from obligations that arose before the date\n\nof suspension."
      },
      {
        "title": "11.8 Effect of Termination",
        "body": "Upon termination of an Account:\n\n(a) the User's right to access the Platform shall immediately cease except where limited access\n\nis required by applicable law;\n\n(b) pending applications may be discontinued where legally permissible;\n\n(c) promotional benefits not yet earned may be forfeited;\n\n(d) access credentials shall be disabled;\n\n(e) licences granted under these Terms shall automatically terminate; and\n\n(f) PRYME may retain information where permitted or required by applicable law, the Privacy\n\nPolicy, or legitimate business purposes.\n\nTermination of the User's Account shall not automatically terminate or modify any contractual\n\nrelationship existing directly between the User and a participating lender."
      },
      {
        "title": "11.9 Deletion of User Data",
        "body": "Following successful processing of an Account deletion request, PRYME shall take reasonable\n\nsteps to delete or anonymise personal information no longer required for lawful purposes.\n\nNotwithstanding the foregoing, PRYME may continue to retain information where reasonably\n\nnecessary for:\n\n(a) compliance with applicable law;\n\n(b) taxation requirements;\n\n(c) audit purposes;\n\n(d) fraud prevention;\n\n(e) regulatory compliance;\n\n(f) dispute resolution;\n\n(g) enforcement of contractual rights;\n\n(h) defence of legal claims; or\n\n(i) any other legitimate business purpose recognised under applicable law."
      },
      {
        "title": "11.10 Outstanding Rights and Obligations",
        "body": "Termination of these Terms or deletion of an Account shall not affect:\n\n(a) obligations accrued before termination;\n\n(b) outstanding liabilities;\n\n(c) indemnity obligations;\n\n(d) confidentiality obligations;\n\n(e) intellectual property rights;\n\n(f) dispute resolution provisions;\n\n(g) payment obligations, if any arise under future paid services;\n\n(h) fraud investigations;\n\n(i) legal proceedings; or\n\n(j) any provision which, by its nature or express wording, is intended to survive termination."
      },
      {
        "title": "11.11 No Liability for Suspension or Termination",
        "body": "Subject to applicable law, PRYME shall not be liable for any loss, inconvenience, delay,\n\nreputational impact, or consequential damages arising solely from the lawful suspension,\n\nrestriction, or termination of a User's Account in accordance with these Terms.\n\nNothing in this Clause shall affect any rights that cannot lawfully be excluded under applicable\n\nlaw."
      },
      {
        "title": "11.12 Reinstatement",
        "body": "Where an Account has been suspended rather than permanently terminated, PRYME may, at\n\nits sole discretion, reinstate the Account after the User has satisfactorily addressed the issues\n\nthat gave rise to the suspension.\n\nReinstatement shall not constitute a waiver of any rights available to PRYME under these\n\nTerms and shall not prevent PRYME from taking future action in respect of subsequent\n\nviolations."
      },
      {
        "title": "11.13 Survival",
        "body": "The provisions relating to intellectual property, confidentiality, data retention, limitation of\n\nliability, indemnification, dispute resolution, governing law, fraud prevention, and any other\n\nprovisions which by their nature are intended to survive shall remain in full force and effect\n\nnotwithstanding suspension, termination, deletion of the Account, or expiry of these Terms."
      }
    ]
  },
  {
    "partNumber": 12,
    "id": "part-12",
    "title": "COMPLAINTS, CUSTOMER SUPPORT, AND GRIEVANCE REDRESSAL",
    "clauses": [
      {
        "title": "12.1 Commitment to Customer Service",
        "body": "PRYME is committed to providing prompt, transparent, and professional customer support\n\nthroughout the User's interaction with the Platform. The Company recognises that timely\n\nresolution of concerns contributes to maintaining confidence in the Platform and therefore\n\nendeavours to address complaints in a fair, objective, and efficient manner.\n\nCustomer support provided by PRYME shall primarily relate to matters concerning the\n\nPlatform, application facilitation, document coordination, communication with participating\n\nlenders, technical assistance, and other services offered directly by PRYME."
      },
      {
        "title": "12.2 Scope of Support",
        "body": "Subject to these Terms, PRYME may provide assistance relating to:\n\n(a) Account registration and access;\n\n(b) Platform functionality;\n\n(c) Eligibility Estimates;\n\n(d) document submission and preliminary verification;\n\n(e) application tracking;\n\n(f) coordination with participating lenders where reasonably possible;\n\n(g) clarification regarding Platform features;\n\n(h) promotional campaigns administered by PRYME; and\n\n(i) any other matter directly relating to the Services."
      },
      {
        "title": "12.3 Matters Outside PRYME's Control",
        "body": "PRYME shall not be responsible for resolving disputes arising solely between the User and a\n\nparticipating lender.\n\nSuch matters include, without limitation:\n\n(a) loan approval or rejection;\n\n(b) sanction conditions;\n\n(c) interest rates;\n\n(d) repayment obligations;\n\n(e) EMIs;\n\n(f) foreclosure charges;\n\n(g) prepayment penalties;\n\n(h) recovery proceedings;\n\n(i) restructuring requests; and\n\n(j) interpretation of loan agreements.\n\nPRYME may, at its discretion, assist in facilitating communication between the User and the\n\nparticipating lender, however such assistance shall not impose any legal obligation upon\n\nPRYME to resolve the underlying dispute."
      },
      {
        "title": "12.4 Submission of Complaints",
        "body": "Users may submit complaints through the communication channels made available by\n\nPRYME, including email, website support forms, dashboard support features, or any other\n\nofficially notified channel.\n\nThe User agrees to provide sufficient information to enable PRYME to understand and\n\ninvestigate the concern."
      },
      {
        "title": "12.5 Acknowledgement of Complaints",
        "body": "PRYME shall endeavour to acknowledge complaints within twenty-four (24) hours to three\n\n(3) Business Days from receipt, depending upon the complexity of the matter and operational\n\ncircumstances.\n\nAcknowledgement of a complaint shall not constitute acceptance of liability."
      },
      {
        "title": "12.6 Resolution Timeline",
        "body": "PRYME shall use reasonable efforts to resolve complaints falling within its responsibility\n\nwithin thirty (30) days from receipt of all reasonably necessary information.\n\nCertain matters may require additional time where they involve third parties, regulatory\n\nauthorities, fraud investigations, or circumstances beyond PRYME's reasonable control."
      },
      {
        "title": "12.7 User Cooperation",
        "body": "The User agrees to cooperate in good faith during the grievance resolution process by providing\n\ntimely responses, accurate information, and supporting documentation where reasonably\n\nrequested.\n\nFailure to provide requested information may delay investigation or resolution."
      },
      {
        "title": "12.8 Escalation",
        "body": "If a User remains dissatisfied after the initial review, the matter may be escalated through the\n\ngrievance mechanism prescribed by PRYME.\n\nDetails of the Grievance Officer shall be published separately by the Company and may be\n\nupdated from time to time."
      },
      {
        "title": "12.8A Escalation to the Reserve Bank of India",
        "body": "Where a User's complaint relating to a digital loan facilitated through the Platform is not\n\nresolved to the User's satisfaction within thirty (30) days of submission, or where the User is\n\notherwise dissatisfied with the response received, the User may escalate the complaint through\n\nthe Complaint Management System of the Reserve Bank of India, or lodge a physical complaint\n\nbefore the competent Reserve Bank of India Ombudsman, in accordance with applicable RBI\n\ndirections then in force."
      },
      {
        "title": "12.9 Good Faith Resolution",
        "body": "Before commencing legal proceedings against PRYME, the User agrees to first make\n\nreasonable efforts to resolve the matter through the Company's grievance mechanism.\n\nNothing contained in this Clause shall restrict any statutory rights available under applicable\n\nlaw."
      },
      {
        "title": "12.10 Survival",
        "body": "The grievance procedure described in this Article shall survive termination of the User's\n\nAccount to the extent necessary for resolving disputes relating to Services previously provided."
      }
    ]
  },
  {
    "partNumber": 13,
    "id": "part-13",
    "title": "ELECTRONIC COMMUNICATIONS, ELECTRONIC RECORDS, AND DIGITAL CONSENT",
    "clauses": [
      {
        "title": "13.1 Electronic Communications",
        "body": "By accessing or using the Platform, the User consents to receive communications from\n\nPRYME in electronic form.\n\nSuch communications may be transmitted through:\n\n(a) email;\n\n(b) SMS;\n\n(c) WhatsApp;\n\n(d) dashboard notifications;\n\n(e) website notices;\n\n(f) push notifications, where applicable; and\n\n(g) any other lawful electronic communication channel adopted by PRYME."
      },
      {
        "title": "13.2 Legal Validity",
        "body": "The User agrees that electronic communications satisfy any legal requirement that such\n\ncommunications be in writing, to the extent permitted by applicable law.\n\nElectronic records maintained by PRYME may be relied upon as evidence of communications,\n\ninstructions, acknowledgements, and transactions."
      },
      {
        "title": "13.3 Electronic Acceptance",
        "body": "Acceptance of these Terms or any related policy through electronic means, including clicking\n\nan acceptance checkbox, OTP verification, digital confirmation, electronic signature, or any\n\nsimilar authentication mechanism, shall constitute valid and legally binding acceptance."
      },
      {
        "title": "13.4 Delivery of Notices",
        "body": "Any notice sent by PRYME to the email address, mobile number, or other contact details\n\nregistered by the User shall be deemed to have been duly delivered when transmitted by\n\nPRYME, irrespective of whether the User has actually read or accessed the communication.\n\nThe User remains responsible for ensuring that registered contact information remains accurate\n\nand operational."
      },
      {
        "title": "13.5 User Responsibility",
        "body": "The User agrees to:\n\n(a) regularly monitor registered communication channels;\n\n(b) promptly update contact information where changes occur;\n\n(c) ensure that communications from PRYME are not blocked by spam filters or other technical\n\nsettings; and\n\n(d) promptly notify PRYME if access to registered communication channels has been lost or\n\ncompromised."
      },
      {
        "title": "13.6 Electronic Records",
        "body": "PRYME may maintain electronic records relating to:\n\n(a) Account registration;\n\n(b) login activity;\n\n(c) document submissions;\n\n(d) Eligibility Estimates;\n\n(e) communications;\n\n(f) application history;\n\n(g) consent records;\n\n(h) audit logs;\n\n(i) grievance records; and\n\n(j) other operational activities relating to the Services.\n\nSuch records may be retained in accordance with applicable law and PRYME's data retention\n\npractices."
      },
      {
        "title": "13.7 Security of Communications",
        "body": "While PRYME implements reasonable security measures, electronic communications may be\n\nsubject to delays, interception, corruption, unauthorised access, or technical failures beyond\n\nthe Company's reasonable control.\n\nUsers acknowledge these inherent risks associated with electronic communication and agree to\n\nexercise appropriate caution when accessing or responding to communications."
      },
      {
        "title": "13.8 Continued Consent",
        "body": "The User's continued use of the Platform following receipt of notices regarding amendments,\n\nfeature updates, operational changes, or revised policies shall constitute acceptance of such\n\nchanges where acceptance is permitted to be inferred under applicable law."
      },
      {
        "title": "13.9 Preservation of Records",
        "body": "PRYME may preserve electronic communications and transaction records for purposes\n\nincluding regulatory compliance, audit requirements, dispute resolution, fraud prevention,\n\nenforcement of contractual rights, cybersecurity investigations, and defence of legal claims."
      },
      {
        "title": "13.10 Survival",
        "body": "The provisions of this Article shall survive termination of the User's Account to the extent\n\nnecessary for evidentiary purposes, legal compliance, dispute resolution, and enforcement of\n\nthe rights and obligations of the Parties."
      }
    ]
  },
  {
    "partNumber": 14,
    "id": "part-14",
    "title": "PLATFORM MODIFICATIONS, FUTURE SERVICES, BETA FEATURES, AND SERVICE AVAILABILITY",
    "clauses": [
      {
        "title": "14.1 Continuous Improvement of the Platform",
        "body": "PRYME is committed to continuously improving the Platform and enhancing the Services\n\noffered to Users. In furtherance of this objective, PRYME may from time to time introduce\n\nnew features, discontinue existing functionality, redesign user interfaces, improve\n\ntechnological infrastructure, implement security enhancements, modify workflows, or expand\n\nthe range of financial products and services available through the Platform.\n\nThe User acknowledges that continuous development is an essential characteristic of a\n\ntechnology platform and agrees that modifications to the Platform shall not, by themselves,\n\nconstitute a breach of these Terms."
      },
      {
        "title": "14.2 Right to Modify Services",
        "body": "PRYME reserves the right, at its sole discretion, to:\n\n(a) introduce new services;\n\n(b) modify existing services;\n\n(c) suspend specific features;\n\n(d) discontinue any feature or service;\n\n(e) change eligibility requirements for particular services;\n\n(f) revise operational workflows;\n\n(g) improve or redesign the Platform interface;\n\n(h) modify application procedures;\n\n(i) enhance security protocols; and\n\n(j) introduce new technological capabilities.\n\nWhere reasonably practicable, material changes affecting Users shall be communicated\n\nthrough appropriate channels."
      },
      {
        "title": "14.3 Future Financial Products",
        "body": "The User acknowledges that PRYME may expand its business to facilitate additional financial\n\nproducts and technology-enabled services, including but not limited to:\n\n(a) insurance products;\n\n(b) credit cards;\n\n(c) business loans;\n\n(d) gold loans;\n\n(e) vehicle loans;\n\n(f) education loans;\n\n(g) fixed deposits;\n\n(h) investment products;\n\n(i) wealth management tools;\n\n(j) financial planning services;\n\n(k) Account Aggregator integrations;\n\n(l) digital identity verification services;\n\n(m) artificial intelligence-powered financial assistance; and\n\n(n) other lawful financial technology services.\n\nSuch services may be governed by additional product-specific agreements."
      },
      {
        "title": "14.4 Beta, Pilot and Experimental Features",
        "body": "PRYME may introduce certain features on a beta, pilot, trial, preview, or experimental basis.\n\nSuch features may:\n\n(a) contain defects;\n\n(b) undergo frequent modifications;\n\n(c) be subject to limited availability;\n\n(d) be discontinued without notice;\n\n(e) produce experimental results; or\n\n(f) require additional user feedback.\n\nThe User understands that participation in beta features is voluntary and that such features are\n\nprovided for evaluation and improvement purposes."
      },
      {
        "title": "14.5 Artificial Intelligence and Automated Systems",
        "body": "PRYME may utilise artificial intelligence, machine learning, automation, or similar\n\ntechnologies to assist Users in navigating the Platform, understanding financial products,\n\nobtaining indicative eligibility assessments, or receiving general informational assistance.\n\nThe User expressly acknowledges that:\n\n(a) AI-generated outputs are informational in nature;\n\n(b) automated recommendations are generated using available data and predefined\n\nmethodologies;\n\n(c) AI outputs should not be interpreted as financial, legal, tax, investment, or professional\n\nadvice;\n\n(d) Users remain responsible for independently evaluating all financial decisions; and\n\n(e) lending decisions remain exclusively with participating lenders."
      },
      {
        "title": "14.6 Platform Availability",
        "body": "PRYME shall use commercially reasonable efforts to maintain the availability and performance\n\nof the Platform.\n\nHowever, the User acknowledges that temporary interruptions may occur due to:\n\n(a) scheduled maintenance;\n\n(b) emergency maintenance;\n\n(c) software updates;\n\n(d) security upgrades;\n\n(e) internet failures;\n\n(f) telecommunications issues;\n\n(g) cyber incidents;\n\n(h) hardware failures;\n\n(i) third-party service interruptions; or\n\n(j) circumstances beyond PRYME's reasonable control.\n\nTemporary interruptions shall not constitute a breach of these Terms."
      },
      {
        "title": "14.7 Suspension of Services",
        "body": "PRYME may temporarily suspend all or part of the Platform where reasonably necessary for:\n\n(a) maintenance;\n\n(b) security investigations;\n\n(c) regulatory compliance;\n\n(d) fraud prevention;\n\n(e) implementation of technological improvements;\n\n(f) migration of systems;\n\n(g) disaster recovery procedures; or\n\n(h) protection of Users or participating lenders."
      },
      {
        "title": "14.8 Compatibility",
        "body": "PRYME does not warrant that the Platform shall remain compatible with every browser,\n\noperating system, hardware configuration, software environment, or future technological\n\nstandard.\n\nUsers remain responsible for maintaining suitable devices and internet connectivity required to\n\naccess the Platform."
      },
      {
        "title": "14.9 Service Expansion",
        "body": "The introduction of new services shall not obligate PRYME to continue offering any existing\n\nservice indefinitely.\n\nPRYME may, subject to applicable law, expand, reduce, replace, or discontinue any Service\n\naccording to commercial, operational, technological, or regulatory requirements."
      },
      {
        "title": "14.10 Survival",
        "body": "This Article shall survive suspension or termination of the User's Account to the extent\n\nnecessary for interpretation of future service rights and obligations."
      }
    ]
  },
  {
    "partNumber": 15,
    "id": "part-15",
    "title": "REGULATORY COMPLIANCE, FRAUD PREVENTION, RISK MANAGEMENT, AND COOPERATION WITH AUTHORITIES",
    "clauses": [
      {
        "title": "15.1 Commitment to Compliance",
        "body": "PRYME is committed to conducting its operations in accordance with all applicable laws,\n\nregulations, governmental directions, judicial orders, and regulatory requirements applicable\n\nto its business.\n\nThe Company may implement policies, procedures, technological controls, and operational\n\nsafeguards to ensure continued compliance with applicable legal obligations."
      },
      {
        "title": "15.2 User Compliance",
        "body": "The User agrees to comply with all applicable laws while accessing or using the Platform.\n\nThe User shall not use the Platform for any unlawful purpose or in any manner that could\n\nexpose PRYME, participating lenders, or other Users to legal or regulatory risk."
      },
      {
        "title": "15.3 Fraud Prevention Measures",
        "body": "PRYME may implement fraud detection systems designed to identify suspicious activities,\n\nincluding but not limited to:\n\n(a) submission of false information;\n\n(b) forged documentation;\n\n(c) duplicate Accounts;\n\n(d) identity theft;\n\n(e) referral abuse;\n\n(f) unusual transaction patterns;\n\n(g) automated misuse of the Platform;\n\n(h) account compromise; or\n\n(i) other indicators of potentially fraudulent conduct.\n\nThe specific methodologies, rules, algorithms, thresholds, and internal procedures used for\n\nfraud detection constitute confidential proprietary information of PRYME."
      },
      {
        "title": "15.4 Temporary Review",
        "body": "Where PRYME reasonably suspects fraudulent or suspicious activity, the Company may\n\ntemporarily pause processing of an application while conducting an internal review.\n\nDuring such review, PRYME may request additional documentation or clarification from the\n\nUser.\n\nFailure to provide reasonably requested information may result in refusal to continue\n\nprocessing the relevant application."
      },
      {
        "title": "15.5 Cooperation with Authorities",
        "body": "Where required or permitted under applicable law, PRYME may cooperate with:\n\n(a) courts;\n\n(b) law enforcement agencies;\n\n(c) regulatory authorities;\n\n(d) governmental bodies;\n\n(e) investigating agencies;\n\n(f) participating lenders; and\n\n(g) other competent authorities.\n\nSuch cooperation may include the disclosure of information where legally required or\n\notherwise permitted by law."
      },
      {
        "title": "15.6 Reporting of Fraud",
        "body": "Where PRYME reasonably believes that fraudulent, unlawful, or criminal activity has\n\noccurred, the Company reserves the right to report the matter to the appropriate authorities and\n\nparticipating lenders.\n\nSuch reporting shall be undertaken in accordance with applicable law and shall not require\n\nprior consent from the User where disclosure is legally authorised or required."
      },
      {
        "title": "15.7 Internal Risk Controls",
        "body": "PRYME may implement operational controls including:\n\n(a) identity verification;\n\n(b) document verification;\n\n(c) device verification;\n\n(d) communication verification;\n\n(e) behavioural analysis;\n\n(f) access controls;\n\n(g) cybersecurity measures;\n\n(h) audit logging;\n\n(i) transaction monitoring; and\n\n(j) other risk management procedures considered reasonably necessary."
      },
      {
        "title": "15.8 Regulatory Changes",
        "body": "If any applicable law, governmental notification, judicial decision, or regulatory direction\n\nrequires modification of the Platform or the Services, PRYME may immediately amend its\n\noperational procedures, technical architecture, policies, or these Terms to ensure compliance.\n\nThe User agrees that continued use of the Platform following such changes shall be subject to\n\nthe revised legal and regulatory framework."
      },
      {
        "title": "15.9 Reservation of Rights",
        "body": "Nothing contained in these Terms shall limit PRYME's right to take any action reasonably\n\nnecessary to:\n\n(a) protect the integrity of the Platform;\n\n(b) safeguard Users;\n\n(c) comply with legal obligations;\n\n(d) prevent financial crime;\n\n(e) protect participating lenders;\n\n(f) preserve evidence;\n\n(g) defend legal proceedings; or\n\n(h) enforce its contractual rights."
      },
      {
        "title": "15.10 Survival",
        "body": "The rights, powers, obligations, and protections contained in this Article shall survive\n\nsuspension, termination, deletion of the User's Account, or expiry of these Terms to the extent\n\nnecessary for legal compliance, fraud investigations, regulatory proceedings, enforcement of\n\nrights, and defence of legal claims."
      }
    ]
  },
  {
    "partNumber": 16,
    "id": "part-16",
    "title": "GOVERNING LAW, JURISDICTION, DISPUTE RESOLUTION, AND LEGAL PROCEEDINGS",
    "clauses": [
      {
        "title": "16.1 Governing Law",
        "body": "These Terms, together with all policies incorporated by reference, shall be governed by and\n\nconstrued in accordance with the laws of the Republic of India, without regard to any principles\n\nrelating to conflict of laws.\n\nThe rights and obligations of the Parties shall be interpreted in a manner consistent with\n\napplicable Indian legislation, judicial precedents, governmental notifications, and regulatory\n\ndirections in force from time to time."
      },
      {
        "title": "16.2 Good Faith Resolution",
        "body": "PRYME believes that most concerns can be resolved efficiently through open communication.\n\nAccordingly, before initiating any legal proceedings against PRYME, the User agrees to first\n\nsubmit the grievance through the grievance redressal mechanism established by the Company.\n\nThe Parties shall make reasonable efforts to resolve the dispute amicably and in good faith.\n\nNothing contained in this Clause shall restrict any statutory remedy available to either Party\n\nunder applicable law."
      },
      {
        "title": "16.3 Internal Resolution Period",
        "body": "Upon receipt of a grievance, PRYME shall endeavour to investigate and resolve the matter in\n\naccordance with the timelines specified in these Terms or any applicable policy.\n\nDuring this period, both Parties shall cooperate in good faith by providing information,\n\nclarification, and supporting documents reasonably necessary for resolution."
      },
      {
        "title": "16.4 Arbitration",
        "body": "Any dispute, controversy, or claim arising out of or relating to these Terms, the Platform, or\n\nthe Services, including any question regarding their existence, validity, interpretation,\n\nperformance, breach, or termination, shall be referred to and finally resolved by arbitration in\n\naccordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended\n\nfrom time to time.\n\nThe arbitration shall be conducted by a sole arbitrator appointed by mutual agreement of both\n\nthe Parties. The seat and venue of arbitration shall be Indore, Madhya Pradesh, India. The\n\nproceedings shall be conducted in the English language. The arbitral award shall be final and\n\nbinding on the Parties."
      },
      {
        "title": "16.5 Exclusive Jurisdiction",
        "body": "Subject to Clause"
      },
      {
        "title": "16.4 (Arbitration), the courts at Indore, Madhya Pradesh shall have",
        "body": "exclusive jurisdiction over matters relating to arbitration, enforcement of awards, interim relief,\n\nor any matter for which court intervention is permitted under applicable law.\n\nThe User irrevocably submits to the jurisdiction of such courts and waives any objection based\n\nupon venue or forum convenience to the extent permitted by law."
      },
      {
        "title": "16.6 Injunctive Relief",
        "body": "The User acknowledges that any unauthorised use of PRYME's Intellectual Property,\n\nconfidential information, proprietary technology, software, databases, algorithms, or trade\n\nsecrets may cause irreparable harm for which monetary damages alone may not be an adequate\n\nremedy.\n\nAccordingly, PRYME shall be entitled to seek temporary, interim, or permanent injunctive\n\nrelief, specific performance, or other equitable remedies before any competent court, in\n\naddition to any other remedies available under applicable law."
      },
      {
        "title": "16.7 Continuing Obligations",
        "body": "The existence of any dispute shall not relieve either Party from performing obligations that are\n\nnot directly affected by the dispute.\n\nWhere reasonably possible, the Parties shall continue to comply with their respective\n\nobligations while the dispute remains pending."
      },
      {
        "title": "16.8 Limitation Period",
        "body": "Nothing contained in these Terms shall extend, reduce, or otherwise modify any statutory\n\nlimitation period prescribed under applicable law."
      },
      {
        "title": "16.9 Costs",
        "body": "Each Party shall ordinarily bear its own legal costs and expenses relating to any dispute unless\n\notherwise determined by a competent court or agreed in writing between the Parties.\n\nNothing in this Clause shall restrict PRYME from recovering costs where expressly permitted\n\nunder these Terms or applicable law."
      },
      {
        "title": "16.10 Survival",
        "body": "This Article shall survive suspension, termination, deletion of the User's Account,\n\ndiscontinuation of the Platform, and expiry of these Terms."
      }
    ]
  },
  {
    "partNumber": 17,
    "id": "part-17",
    "title": "FORCE MAJEURE",
    "clauses": [
      {
        "title": "17.1 Definition",
        "body": "PRYME shall not be liable for any delay, interruption, deficiency in performance, failure to\n\nperform, or inability to perform any obligation under these Terms where such delay or failure\n\narises from circumstances beyond its reasonable control.\n\nSuch events shall constitute a Force Majeure Event."
      },
      {
        "title": "17.2 Force Majeure Events",
        "body": "Force Majeure Events include, without limitation:\n\n(a) natural disasters including earthquakes, floods, cyclones, storms, lightning, droughts,\n\nlandslides, and other natural calamities;\n\n(b) fires, explosions, accidents, structural failures, or industrial incidents;\n\n(c) epidemics, pandemics, public health emergencies, quarantines, or similar events;\n\n(d) acts of war, armed conflict, invasion, terrorism, civil unrest, riots, rebellion, or sabotage;\n\n(e) strikes, lockouts, labour disputes, or industrial action not directly attributable to PRYME;\n\n(f) governmental actions, regulatory restrictions, court orders, embargoes, sanctions, or\n\nchanges in applicable law;\n\n(g) nationwide or regional internet outages;\n\n(h) disruption of telecommunications networks;\n\n(i) failures affecting cloud infrastructure, data centres, hosting providers, internet service\n\nproviders, or utility providers;\n\n(j) widespread cybersecurity incidents, distributed denial-of-service attacks, ransomware\n\nattacks, or other malicious cyber events;\n\n(k) prolonged power failures;\n\n(l) failures of third-party systems that are beyond the reasonable control of PRYME; and\n\n(m) any other event that could not reasonably have been anticipated or prevented through the\n\nexercise of reasonable care."
      },
      {
        "title": "17.3 Suspension of Obligations",
        "body": "During the continuance of a Force Majeure Event, PRYME's affected obligations under these\n\nTerms shall be suspended only to the extent and for the duration reasonably necessary to\n\naddress the effects of the Force Majeure Event.\n\nPRYME shall use commercially reasonable efforts to restore normal operations as soon as\n\npracticable."
      },
      {
        "title": "17.4 No Liability",
        "body": "To the fullest extent permitted by applicable law, PRYME shall not be liable for any loss, delay,\n\ninconvenience, business interruption, data delay, missed opportunity, or other consequence\n\narising solely from a Force Majeure Event."
      },
      {
        "title": "17.5 Mitigation",
        "body": "PRYME shall make reasonable efforts to mitigate the impact of a Force Majeure Event by\n\nimplementing appropriate business continuity measures, disaster recovery procedures,\n\nalternative communication mechanisms, or temporary operational arrangements where\n\nreasonably practicable.\n\nNothing in this Clause shall require PRYME to incur unreasonable expenditure or assume\n\ndisproportionate commercial risk."
      },
      {
        "title": "17.6 Notice",
        "body": "Where reasonably practicable, PRYME may notify Users through appropriate communication\n\nchannels regarding significant Force Majeure Events that materially affect the availability or\n\nfunctioning of the Platform.\n\nFailure to provide such notice shall not prejudice PRYME's rights under this Article where\n\ncircumstances make prior or timely notice impracticable."
      },
      {
        "title": "17.7 Resumption of Services",
        "body": "Upon cessation of the Force Majeure Event, PRYME shall endeavour to resume affected\n\nServices within a commercially reasonable period, taking into account operational, technical,\n\nlegal, and security considerations."
      },
      {
        "title": "17.8 Survival",
        "body": "The provisions of this Article shall survive termination of these Terms and shall continue to\n\napply in relation to any Force Majeure Event occurring during the subsistence of the contractual\n\nrelationship between the Parties."
      }
    ]
  },
  {
    "partNumber": 18,
    "id": "part-18",
    "title": "MISCELLANEOUS PROVISIONS",
    "clauses": [
      {
        "title": "18.1 Entire Agreement",
        "body": "These Terms, together with the Privacy Policy, Cookie Policy, Disclaimer, Consent and\n\nCommunication Policy, and any additional policies, product-specific terms, notices, or\n\nagreements expressly incorporated by reference, constitute the entire agreement between the\n\nUser and PRYME concerning access to and use of the Platform.\n\nThese Terms supersede all prior discussions, understandings, negotiations, representations,\n\ncommunications, or agreements, whether oral or written, relating to the subject matter herein.\n\nNothing contained in this Clause shall supersede any separate engagement letter, loan\n\napplication documentation, product-specific agreement, or other written agreement executed\n\nbetween the User and PRYME for a specific service, to the extent such agreement expressly\n\nprovides otherwise."
      },
      {
        "title": "18.2 Amendments",
        "body": "PRYME reserves the right to amend, modify, update, replace, supplement, or revise these\n\nTerms from time to time in response to:\n\n(a) changes in applicable law;\n\n(b) regulatory requirements;\n\n(c) judicial decisions;\n\n(d) operational improvements;\n\n(e) technological developments;\n\n(f) introduction of new products or services;\n\n(g) security enhancements;\n\n(h) changes in business practices; or\n\n(i) any other legitimate commercial or legal reason.\n\nMaterial amendments shall become effective upon publication on the Platform or upon\n\ncommunication through any authorised communication channel, unless a different effective\n\ndate is expressly specified.\n\nContinued access to or use of the Platform after the effective date of any amendment shall\n\nconstitute acceptance of the revised Terms."
      },
      {
        "title": "18.3 Assignment",
        "body": "PRYME may assign, transfer, novate, delegate, or otherwise dispose of its rights, obligations,\n\nor interests under these Terms to any affiliate, successor entity, purchaser, acquirer, or other\n\nlawful person in connection with a merger, acquisition, restructuring, business transfer, sale of\n\nassets, or similar corporate transaction.\n\nThe User shall not assign, transfer, delegate, sublicense, or otherwise dispose of any rights or\n\nobligations under these Terms without the prior written consent of PRYME.\n\nAny unauthorised assignment by the User shall be void to the fullest extent permitted by\n\napplicable law."
      },
      {
        "title": "18.4 No Waiver",
        "body": "No failure, delay, omission, or partial exercise by PRYME of any right, remedy, power, or\n\nprivilege under these Terms shall constitute or be construed as a waiver of that right.\n\nAny waiver shall be valid only if made expressly in writing by an authorised representative of\n\nPRYME.\n\nA waiver of any breach shall not constitute a waiver of any preceding, continuing, or\n\nsubsequent breach."
      },
      {
        "title": "18.5 Severability",
        "body": "If any provision of these Terms is held by a court or other competent authority to be invalid,\n\nillegal, unenforceable, or void, such provision shall be enforced to the maximum extent\n\npermissible under applicable law.\n\nThe remaining provisions shall continue in full force and effect and shall not be affected by the\n\ninvalidity or unenforceability of any individual provision.\n\nWhere reasonably possible, the invalid provision shall be replaced by a lawful provision that\n\nmost closely reflects the original commercial intent."
      },
      {
        "title": "18.6 Independent Relationship",
        "body": "Nothing contained in these Terms shall be construed as creating any partnership, joint venture,\n\nagency, employment relationship, franchise, fiduciary relationship, or other legal association\n\nbetween PRYME and the User.\n\nThe relationship between the Parties shall at all times remain that of independent contracting\n\nparties."
      },
      {
        "title": "18.7 Interpretation",
        "body": "Headings, titles, and formatting used in these Terms are included solely for convenience of\n\nreference and shall not affect interpretation.\n\nThe words \"including\", \"includes\", and \"such as\" shall be deemed to mean \"including without\n\nlimitation.\"\n\nReferences to statutes shall include amendments, re-enactments, subordinate legislation, and\n\nsuccessor legislation unless the context otherwise requires."
      },
      {
        "title": "18.8 Rights and Remedies",
        "body": "The rights, powers, and remedies available to PRYME under these Terms are cumulative and\n\nare in addition to any rights or remedies available under applicable law.\n\nThe exercise of one right or remedy shall not preclude the exercise of any other right or remedy."
      },
      {
        "title": "18.9 Language",
        "body": "These Terms have been drafted in the English language.\n\nWhere PRYME provides translations for convenience, the English version shall prevail in the\n\nevent of any inconsistency, ambiguity, conflict, or discrepancy."
      },
      {
        "title": "18.10 Survival",
        "body": "All provisions which by their nature are intended to survive termination, including but not\n\nlimited to provisions relating to intellectual property, confidentiality, limitation of liability,\n\nindemnification, dispute resolution, governing law, data retention, regulatory compliance, and\n\npayment obligations (where applicable), shall survive termination, suspension, or expiry of\n\nthese Terms."
      }
    ]
  },
  {
    "partNumber": 19,
    "id": "part-19",
    "title": "NOTICES, OFFICIAL COMMUNICATIONS, AND CONTACT INFORMATION",
    "clauses": [
      {
        "title": "19.1 Official Communications",
        "body": "PRYME may issue notices, disclosures, alerts, updates, announcements, and other\n\ncommunications relating to the Platform or the Services through one or more authorised\n\ncommunication channels.\n\nSuch communications may include operational notices, legal notices, regulatory disclosures,\n\npolicy updates, security alerts, maintenance notifications, promotional communications (where\n\nconsent has been provided), and other information reasonably connected with the Services."
      },
      {
        "title": "19.2 Modes of Communication",
        "body": "Without limitation, PRYME may communicate with the User through:\n\n(a) email;\n\n(b) SMS;\n\n(c) WhatsApp;\n\n(d) notifications displayed within the User's Account;\n\n(e) notifications displayed on the Platform;\n\n(f) website announcements;\n\n(g) telephone calls where appropriate; or\n\n(h) any other lawful communication channel adopted by PRYME."
      },
      {
        "title": "19.3 Deemed Delivery",
        "body": "Unless otherwise required by applicable law, any notice or communication issued by PRYME\n\nshall be deemed duly delivered:\n\n(a) in the case of email, upon transmission to the registered email address;\n\n(b) in the case of SMS or messaging services, upon successful transmission to the registered\n\nmobile number;\n\n(c) in the case of dashboard or website notices, upon publication on the Platform;\n\n(d) in the case of postal communication, upon delivery in accordance with the records of the\n\nrelevant postal or courier service.\n\nThe User acknowledges that failure to read or access a communication shall not invalidate its\n\nlegal effect where it has been duly transmitted."
      },
      {
        "title": "19.4 User Responsibility",
        "body": "The User agrees to:\n\n(a) maintain accurate and up-to-date contact information;\n\n(b) promptly notify PRYME of any change to the registered mobile number, email address, or\n\ncorrespondence details;\n\n(c) regularly review communications received from PRYME; and\n\n(d) ensure that communications from PRYME are not intentionally blocked or filtered.\n\nPRYME shall not be responsible for any consequence arising from the User's failure to\n\nmaintain accurate contact information."
      },
      {
        "title": "19.5 Legal Notices to PRYME",
        "body": "Any legal notice intended for PRYME shall be addressed to the registered office of the\n\nCompany or such other address as may be notified by PRYME from time to time.\n\nWhere PRYME specifies an email address for legal correspondence, notices transmitted\n\nthrough such authorised email address shall also be accepted, subject to applicable law."
      },
      {
        "title": "19.6 Company Contact Information",
        "body": "As of the Effective Date of these Terms, the Company's contact details are:\n\nGOPRYME FINTECH PRIVATE LIMITED\n\nRegistered Office: 204, Ranjeet Hanuman Main Road, Near BATA Showroom, Mhow Naka,\n\nIndore, Madhya Pradesh, India\n\nWebsite: www.prymeloans.in\n\nCustomer Support Email: contact@gopryme.in\n\nCustomer Support Number: +91 92432 94291\n\nPRYME reserves the right to update the above contact details from time to time. Updated\n\ncontact information published on the Platform shall supersede previously published details."
      },
      {
        "title": "19.7 Business Communications",
        "body": "Communications exchanged between the User and PRYME for purposes relating to\n\napplications, customer support, grievances, document verification, regulatory compliance, or\n\noperational matters may be retained by PRYME as business records in accordance with\n\napplicable law and the Company's data retention practices."
      },
      {
        "title": "19.8 Survival",
        "body": "The provisions of this Article shall survive termination of these Terms to the extent necessary\n\nfor the delivery of legal notices, regulatory communications, enforcement of rights, defence of\n\nlegal proceedings, or compliance with applicable law."
      }
    ]
  },
  {
    "partNumber": 20,
    "id": "part-20",
    "title": "GRIEVANCE OFFICER, REGULATORY INFORMATION, STATUTORY DISCLOSURES, AND COMPLIANCE",
    "clauses": [
      {
        "title": "20.1 Commitment to Transparency",
        "body": "PRYME is committed to conducting its business with transparency, integrity, accountability,\n\nand fairness. The Company endeavours to maintain appropriate governance standards,\n\nestablish responsible customer support mechanisms, and comply with all applicable legal and\n\nregulatory requirements governing its operations.\n\nThe Company recognises that maintaining customer trust requires timely communication,\n\nresponsible handling of grievances, protection of personal information, and continuous\n\nimprovement of its operational processes."
      },
      {
        "title": "20.2 Nature of the Platform",
        "body": "The User expressly acknowledges that PRYME operates as a technology-enabled loan\n\ncomparison, eligibility estimation, application facilitation, and loan aggregation platform.\n\nPRYME is not:\n\n(a) a bank;\n\n(b) a Non-Banking Financial Company (NBFC);\n\n(c) a housing finance company;\n\n(d) a money lender;\n\n(e) a deposit-taking institution;\n\n(f) an insurer;\n\n(g) an investment adviser;\n\n(h) a stock broker;\n\n(i) a mutual fund distributor unless separately authorised in the future; or\n\n(j) a financial institution empowered to independently approve or reject loan applications.\n\nAll lending decisions remain exclusively with the respective participating lender."
      },
      {
        "title": "20.3 Regulatory Compliance",
        "body": "PRYME shall make reasonable efforts to conduct its business in accordance with applicable\n\nlaws and regulatory requirements relevant to the services provided by the Company.\n\nWhere any applicable law, governmental notification, regulatory direction, or judicial order\n\nrequires modification of the Platform, operational procedures, customer processes, or legal\n\ndocumentation, PRYME reserves the right to implement such modifications as reasonably\n\nnecessary to maintain compliance."
      },
      {
        "title": "20.4 Grievance Officer",
        "body": "The Company shall designate a Grievance Officer responsible for overseeing the receipt,\n\nacknowledgement, review, and resolution of customer grievances relating to the Platform and\n\nthe Services.\n\nAs of the Effective Date of these Terms, the designated Grievance Officer is:\n\nName: Aadesh Kothari, aadesh.k@gopryme.in, +91 92432 94291.\n\nThe Company reserves the right to appoint another individual as the Grievance Officer at any\n\ntime.\n\nAny such appointment or change shall become effective upon publication on the Platform\n\nwithout requiring amendment of these Terms."
      },
      {
        "title": "20.4A Nodal Officer for Digital Lending and Data Grievances",
        "body": "In addition to the Grievance Officer designated under Clause 20.4, PRYME shall designate a\n\nnodal officer responsible for complaints specifically relating to digital lending facilitation and\n\nthe processing of personal data under the Digital Personal Data Protection Act, 2023. The\n\ncontact details of such nodal officer shall be published on the Platform and included in the Key\n\nFact Statement issued in respect of every loan facilitated through the Platform, and may be\n\nupdated by PRYME from time to time without requiring amendment of these Terms."
      },
      {
        "title": "20.5 Scope of the Grievance Officer",
        "body": "The Grievance Officer may, subject to applicable law and internal procedures:\n\n(a) acknowledge customer grievances;\n\n(b) coordinate internal investigation;\n\n(c) seek clarification from Users;\n\n(d) coordinate with relevant departments;\n\n(e) issue responses on behalf of the Company;\n\n(f) recommend corrective action where appropriate;\n\n(g) maintain grievance records; and\n\n(h) perform such other responsibilities as may reasonably be assigned by the Company."
      },
      {
        "title": "20.6 Matters Outside the Scope of PRYME",
        "body": "The Grievance Officer shall not possess authority to:\n\n(a) overturn lending decisions made by participating lenders;\n\n(b) compel a lender to approve an application;\n\n(c) modify contractual terms offered by a lender;\n\n(d) interfere with a lender's underwriting process;\n\n(e) determine repayment obligations under a loan agreement; or\n\n(f) resolve disputes arising solely under agreements executed directly between the User and a\n\nparticipating lender."
      },
      {
        "title": "20.7 Statutory Compliance",
        "body": "Nothing contained in these Terms shall be interpreted as limiting any statutory rights available\n\nto Users under applicable law.\n\nSimilarly, nothing contained herein shall require PRYME to undertake any activity that would\n\nbe contrary to applicable law or regulatory requirements."
      },
      {
        "title": "20.8 Preservation of Records",
        "body": "PRYME may preserve grievance records, correspondence, investigation materials, customer\n\ncommunications, and supporting documentation for such period as may be reasonably\n\nnecessary for:\n\n(a) legal compliance;\n\n(b) regulatory requirements;\n\n(c) audit purposes;\n\n(d) dispute resolution;\n\n(e) fraud prevention;\n\n(f) enforcement of contractual rights; or\n\n(g) defence of legal proceedings."
      },
      {
        "title": "20.9 Future Regulatory Changes",
        "body": "The User acknowledges that the financial technology sector is subject to continuous regulatory\n\nevolution.\n\nAccordingly, PRYME may revise its processes, customer journeys, technological architecture,\n\ndocumentation requirements, and legal policies to comply with future legislative or regulatory\n\ndevelopments."
      },
      {
        "title": "20.10 Survival",
        "body": "This Article shall survive termination, suspension, deletion of the User's Account, or expiry of\n\nthese Terms to the extent necessary for regulatory compliance, grievance resolution, legal\n\nproceedings, or enforcement of the Company's rights."
      }
    ]
  },
  {
    "partNumber": 21,
    "id": "part-21",
    "title": "FINAL ACKNOWLEDGEMENT, ACCEPTANCE OF TERMS, AND EFFECTIVE PROVISIONS",
    "clauses": [
      {
        "title": "21.1 User Acknowledgement",
        "body": "By accessing or using the Platform, the User acknowledges that the User has carefully read,\n\nunderstood, and voluntarily accepted these Terms in their entirety.\n\nThe User further acknowledges that these Terms have been presented in a manner reasonably\n\nintended to explain the legal relationship between the User and PRYME and that the User has\n\nhad sufficient opportunity to review the Terms before accepting them."
      },
      {
        "title": "21.2 Acceptance",
        "body": "Acceptance of these Terms may occur through any legally recognised electronic or digital\n\nmethod, including but not limited to:\n\n(a) clicking an \"I Agree\" or similar acceptance button;\n\n(b) selecting an acceptance checkbox;\n\n(c) OTP verification;\n\n(d) digital authentication;\n\n(e) electronic signature;\n\n(f) registration of an Account;\n\n(g) submission of an application; or\n\n(h) continued use of the Platform where acceptance may lawfully be inferred.\n\nSuch acceptance shall constitute a legally binding agreement between the User and PRYME."
      },
      {
        "title": "21.3 Effective Date",
        "body": "These Terms shall become effective on the Effective Date specified at the beginning of this\n\ndocument or, where no Effective Date is specified, on the date they are first published on the\n\nPlatform.\n\nFor each individual User, these Terms shall become binding upon the earliest of:\n\n(a) creation of an Account;\n\n(b) submission of information through the Platform;\n\n(c) initiation of a loan application;\n\n(d) acceptance through electronic means; or\n\n(e) continued use of the Platform following publication of these Terms."
      },
      {
        "title": "21.4 Continued Use",
        "body": "The User acknowledges that continued access to or use of the Platform following publication\n\nof revised Terms shall constitute acceptance of such revised Terms to the extent permitted by\n\napplicable law.\n\nWhere applicable law requires express consent for a particular amendment, PRYME shall\n\nobtain such consent through appropriate means."
      },
      {
        "title": "21.5 Independent Decision",
        "body": "The User confirms that use of the Platform and any decision to apply for a financial product is\n\nmade voluntarily and based upon the User's own independent judgment.\n\nThe User acknowledges that PRYME has not guaranteed approval of any financial product or\n\nrepresented that any participating lender will offer particular commercial terms."
      },
      {
        "title": "21.6 Entire Understanding",
        "body": "The User confirms that no oral statement, marketing material, advertisement, social media\n\ncommunication, customer support interaction, demonstration, presentation, or informal\n\ncommunication shall modify these Terms unless expressly incorporated into a written\n\nagreement authorised by PRYME."
      },
      {
        "title": "21.7 Reservation of Rights",
        "body": "Any right, power, privilege, remedy, or protection not expressly granted to the User under these\n\nTerms shall remain reserved by PRYME.\n\nFailure by PRYME to exercise any right under these Terms shall not constitute a waiver of that\n\nright."
      },
      {
        "title": "21.8 Severability of Acceptance",
        "body": "If any provision relating to acceptance or formation of this Agreement is held unenforceable\n\nby a competent court, the remaining provisions shall continue in full force and effect to the\n\nmaximum extent permitted by applicable law."
      },
      {
        "title": "21.9 Contact for Legal Queries",
        "body": "Questions regarding these Terms may be addressed to the Company's official contact channels\n\npublished on the Platform.\n\nThe Company may update such contact details from time to time without requiring amendment\n\nof these Terms."
      },
      {
        "title": "21.10 Closing Statement",
        "body": "PRYME has been established with the objective of helping borrowers make informed financial\n\ndecisions through greater transparency, privacy, technological innovation, and responsible\n\ncustomer support.\n\nBy accepting these Terms and using the Platform, the User acknowledges the respective rights\n\nand responsibilities of both Parties and agrees to use the Platform responsibly, lawfully, and in\n\ngood faith.\n\nThese Terms constitute a legally binding agreement between the User and GOPRYME\n\nFINTECH PRIVATE LIMITED and shall remain in force until terminated in accordance with\n\ntheir provisions."
      }
    ]
  }
]
};

export const PRIVACY_DATA: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy & Data Protection',
  effectiveDate: 'July 10, 2026',
  version: '1.0.0',
  cin: 'U70200MP2026PTC081776',
  pdfUrl: '/documents/privacy-policy.pdf',
  summary: 'This Privacy Policy details how GOPRYME FINTECH PRIVATE LIMITED collects, protects, processes, and respects your personal and financial data.',
  highlights: PRIVACY_HIGHLIGHTS,
  sections: [
  {
    "partNumber": 1,
    "id": "privacy-part-1",
    "title": "Scope of this Privacy Policy",
    "clauses": [
      {
        "title": "1.1 Applicability",
        "body": "This Privacy Policy applies to every individual who accesses or uses the Platform, whether as\n\na visitor, registered user, prospective borrower, applicant, customer, or any other person\n\ninteracting with PRYME through its digital channels.\n\nThis Privacy Policy applies regardless of whether you create an account on the Platform. Even\n\nif you only browse loan products, compare financial products, submit an enquiry, or\n\ncommunicate with our customer support team, this Privacy Policy will govern how your\n\npersonal information is handled by PRYME."
      },
      {
        "title": "1.2 Platforms Covered",
        "body": "This Privacy Policy applies to information collected through:\n\n(a) the official PRYME website;\n\n(b) future mobile applications developed by PRYME;\n\n(c) customer support interactions;\n\n(d) email communications;\n\n(e) telephone conversations;\n\n(f) SMS communications;\n\n(g) WhatsApp communications;\n\n(h) online application forms;\n\n(i) promotional campaigns conducted by PRYME;\n\n(j) surveys and feedback forms;\n\n(k) future digital products introduced by PRYME; and\n\n(l) any other lawful channel through which PRYME collects personal information\n\n."
      },
      {
        "title": "1.3 Purpose of this Privacy Policy",
        "body": "The purpose of this Privacy Policy is to clearly explain:\n\n(a) what information PRYME collects;\n\n(b) how information is collected;\n\n(c) why information is collected;\n\n(d) how information is processed;\n\n(e) when information may be shared;\n\n(f) how information is protected;\n\n(g) how long information may be retained;\n\n(h) the rights available to you under applicable law; and\n\n(i) how you may contact PRYME regarding any privacy-related concern.\n\nThis Privacy Policy is intended to provide transparency regarding our information handling\n\npractices and should not be interpreted as limiting any statutory rights available to you under\n\napplicable law."
      },
      {
        "title": "1.4 Third Party Services",
        "body": "This Privacy Policy applies only to information processed by PRYME.\n\nWhere you choose to proceed with a loan application through a participating bank, Non-\n\nBanking Financial Company (NBFC), housing finance company, insurance provider, or any\n\nother independent financial institution, your relationship with such institution shall also be\n\ngoverned by its own privacy policy, terms and conditions, and other applicable legal\n\ndocumentation.\n\nPRYME encourages every User to carefully review the privacy policies of such third parties\n\nbefore sharing personal information directly with them."
      },
      {
        "title": "1.5 Changes to the Scope",
        "body": "As PRYME continues to introduce new products, services, technologies, and business\n\nverticals, the scope of this Privacy Policy may expand accordingly.\n\nWhere required by applicable law, material changes shall be communicated through\n\nappropriate communication channels before becoming effective."
      }
    ]
  },
  {
    "partNumber": 2,
    "id": "privacy-part-2",
    "title": "Definitions",
    "clauses": [
      {
        "title": "2.1 Account",
        "body": "\"Account\" means the registered profile created by a User for accessing personalised features,\n\nsubmitting loan applications, tracking applications, managing documents, communicating with\n\nPRYME, and accessing future services available on the Platform."
      },
      {
        "title": "2.2 Consent",
        "body": "\"Consent\" means any freely given, specific, informed, unconditional, and unambiguous\n\nindication of your agreement permitting PRYME to process your personal information for one\n\nor more lawful purposes through a clear affirmative action or any other legally recognised\n\nmechanism."
      },
      {
        "title": "2.3 Personal Information",
        "body": "\"Personal Information\" means any information relating to an identified or identifiable\n\nindividual and includes any information recognised as personal data or digital personal data\n\nunder applicable law."
      },
      {
        "title": "2.4 Processing",
        "body": "\"Processing\" means any operation performed on personal information, whether automated or\n\nmanual, including collection, recording, organisation, storage, adaptation, retrieval,\n\nconsultation, analysis, verification, transmission, sharing, use, disclosure, retention,\n\nanonymisation, deletion, or destruction."
      },
      {
        "title": "2.5 Platform",
        "body": "\"Platform\" means the website www.prymeloans.in, together with all associated software,\n\nfuture mobile applications, APIs, dashboards, communication channels, eligibility engines,\n\ncalculators, customer support systems, and other digital services operated by PRYME."
      },
      {
        "title": "2.6 User",
        "body": "\"User\", \"You\", or \"Your\" means any individual who accesses, browses, registers on,\n\ncommunicates with, or otherwise uses the Platform in any manner whatsoever."
      },
      {
        "title": "2.7 Interpretation",
        "body": "Unless the context otherwise requires:\n\n(a) words importing the singular shall include the plural and vice versa;\n\n(b) references to one gender shall include all genders;\n\n(c) references to statutes shall include amendments, modifications, and successor legislation;\n\n(d) the words \"including\", \"includes\", and \"such as\" shall be interpreted as \"including without\n\nlimitation\"; and\n\n(e) headings are inserted solely for convenience and shall not affect interpretation of this\n\nPrivacy Policy."
      }
    ]
  },
  {
    "partNumber": 3,
    "id": "privacy-part-3",
    "title": "Information We Collect",
    "clauses": [
      {
        "title": "3.1 Overview",
        "body": "In order to provide the Services offered through the Platform, PRYME may collect personal\n\ninformation directly from you, automatically through your use of the Platform, or from\n\nauthorised third parties where permitted by applicable law and with your consent where\n\nrequired.\n\nThe categories of information collected may vary depending upon the Services you choose to\n\nuse, the financial product selected, applicable legal requirements, and the requirements of\n\nparticipating financial institutions.\n\nPRYME follows the principle of collecting only such information as is reasonably necessary\n\nto provide the requested Services, comply with applicable laws, protect the Platform, and\n\nimprove the overall customer experience."
      },
      {
        "title": "3.2 Information You Provide",
        "body": "You may voluntarily provide information including, but not limited to:\n\n(a) full name;\n\n(b) date of birth;\n\n(c) gender, where voluntarily provided or required for a particular financial product;\n\n(d) mobile number;\n\n(e) email address;\n\n(f) residential and correspondence address;\n\n(g) city, state, and postal code;\n\n(h) employment details;\n\n(i) employer information;\n\n(j) occupation;\n\n(k) monthly or annual income;\n\n(l) business information;\n\n(m) GST registration details;\n\n(n) business turnover;\n\n(o) existing loan obligations;\n\n(p) property details;\n\n(q) purpose of the loan;\n\n(r) preferred financial product;\n\n(s) banking-related information required for eligibility assessment;\n\n(t) communication preferences; and\n\n(u) any other information voluntarily submitted through the Platform."
      },
      {
        "title": "3.3 Identity and Verification Information",
        "body": "Where required for processing a financial product application, PRYME may collect or receive\n\ndocuments and information including:\n\n(a) identity proof;\n\n(b) address proof;\n\n(c) income proof;\n\n(d) employment documents;\n\n(e) business registration documents;\n\n(f) GST-related documents;\n\n(g) property documents;\n\n(h) bank statements;\n\n(i) financial statements;\n\n(j) photographs;\n\n(k) signatures;\n\n(l) loan-related supporting documents; and\n\n(m) any additional documentation reasonably required by a participating lender.\n\nSubmission of such documents shall remain voluntary; however, failure to provide documents\n\nnecessary for processing a particular application may prevent PRYME from facilitating that\n\napplication."
      },
      {
        "title": "3.4 Technical Information",
        "body": "When you access the Platform, certain technical information may be collected automatically,\n\nincluding:\n\n(a) IP address;\n\n(b) browser type and version;\n\n(c) operating system;\n\n(d) device information;\n\n(e) screen resolution;\n\n(f) language preferences;\n\n(g) access dates and times;\n\n(h) referring website information;\n\n(i) pages visited;\n\n(j) session duration;\n\n(k) clickstream data;\n\n(l) error logs; and\n\n(m) other technical information reasonably necessary for operating and securing the Platform."
      },
      {
        "title": "3.5 Usage Information",
        "body": "PRYME may collect information relating to how you interact with the Platform, including:\n\n(a) searches performed;\n\n(b) products viewed;\n\n(c) eligibility assessments requested;\n\n(d) applications initiated;\n\n(e) applications completed;\n\n(f) customer support interactions;\n\n(g) promotional participation;\n\n(h) feature usage; and\n\n(i) preferences that help improve your experience."
      },
      {
        "title": "3.6 Communication Information",
        "body": "Where you communicate with PRYME, we may maintain records of:\n\n(a) emails;\n\n(b) customer support requests;\n\n(c) WhatsApp conversations;\n\n(d) SMS communications;\n\n(e) telephone conversations, where lawfully recorded;\n\n(f) grievance submissions;\n\n(g) feedback;\n\n(h) survey responses; and\n\n(i) other communications exchanged with the Company."
      },
      {
        "title": "3.7 Information from Participating Lenders",
        "body": "Where you have applied for a financial product through PRYME and have authorised the\n\nnecessary information sharing, participating lenders may provide PRYME with information\n\nrelating to:\n\n(a) application status;\n\n(b) documentation requirements;\n\n(c) approval status;\n\n(d) rejection status;\n\n(e) disbursal status;\n\n(f) post-disbursal updates where applicable; and\n\n(g) other information reasonably necessary for facilitating the Services."
      },
      {
        "title": "3.8 Future Services",
        "body": "As PRYME introduces additional financial products or technology-enabled services, additional\n\ncategories of information may be collected where reasonably necessary and permitted by\n\napplicable law.\n\nWhere such collection requires your consent, PRYME shall obtain the necessary consent before\n\nprocessing such information."
      },
      {
        "title": "3.9 Device Permissions",
        "body": "Depending upon the Services requested by the User and the features enabled on the Platform,\n\nPRYME may request access to certain device permissions solely for legitimate and specified\n\npurposes and only after obtaining the User's explicit consent wherever required under\n\napplicable law.\n\nSuch permissions may include, without limitation:\n\n(a) Camera Access for capturing photographs, identity documents, live verification, video\n\nKYC (where applicable), document scanning, or uploading supporting documents;\n\n(b) Microphone Access where required for video verification, customer support interactions,\n\nor other features expressly initiated by the User;\n\n(c) Location Access for fraud prevention, security verification, regulatory compliance,\n\nbranch identification, service availability, or other lawful operational purposes;\n\n(d) Storage or Media Access for uploading documents, photographs, or other files\n\nvoluntarily selected by the User;\n\n(e) Notification Permissions to deliver application updates, security alerts, OTP\n\nnotifications, grievance updates, and other service-related communications.\n\nPRYME shall request only those permissions that are reasonably necessary for providing the\n\nrelevant Service. Refusing to grant certain permissions may limit or prevent the availability\n\nof specific Platform features; however, such refusal shall not affect access to unrelated\n\nServices where technically feasible.\n\nPRYME does not access a User's contacts, call logs, SMS messages, photographs, videos,\n\naudio files, or other personal device content unless such access is expressly initiated by the\n\nUser and is reasonably required for a specific Service."
      }
    ]
  },
  {
    "partNumber": 4,
    "id": "privacy-part-4",
    "title": "How We Collect Information",
    "clauses": [
      {
        "title": "4.1 Direct Collection",
        "body": "PRYME primarily collects information directly from you when you:\n\n(a) visit the Platform;\n\n(b) create an Account;\n\n(c) compare financial products;\n\n(d) request an Eligibility Estimate;\n\n(e) complete online forms;\n\n(f) upload documents;\n\n(g) communicate with customer support;\n\n(h) participate in surveys;\n\n(i) submit feedback;\n\n(j) participate in promotional campaigns; or\n\n(k) otherwise interact with the Platform."
      },
      {
        "title": "4.2 Automatic Collection",
        "body": "Certain information may be collected automatically through the operation of the Platform using\n\ntechnologies such as cookies, log files, analytics tools, pixels, device identifiers, and similar\n\ntechnologies.\n\nSuch collection helps PRYME maintain Platform security, improve performance, analyse\n\nusage patterns, and enhance the overall user experience."
      },
      {
        "title": "4.3 Collection Through Communications",
        "body": "Information may also be collected when you communicate with PRYME through:\n\n(a) email;\n\n(b) telephone;\n\n(c) WhatsApp;\n\n(d) SMS;\n\n(e) website chat functionality;\n\n(f) customer support tickets;\n\n(g) social media channels officially operated by PRYME; or\n\n(h) any other authorised communication channel."
      },
      {
        "title": "4.4 Information Received from Third Parties",
        "body": "Subject to applicable law and your consent where required, PRYME may receive information\n\nfrom:\n\n(a) participating banks;\n\n(b) participating NBFCs;\n\n(c) housing finance companies;\n\n(d) technology service providers;\n\n(e) document verification partners;\n\n(f) identity verification providers;\n\n(g) Account Aggregator ecosystem participants, if introduced;\n\n(h) credit information companies where expressly authorised by you; and\n\n(i) other lawful sources necessary for providing the Services."
      },
      {
        "title": "4.5 Information Generated During Your Use",
        "body": "As you continue to use the Platform, PRYME may generate operational information including:\n\n(a) application history;\n\n(b) eligibility assessment history;\n\n(c) customer support history;\n\n(d) consent records;\n\n(e) login records;\n\n(f) security logs;\n\n(g) fraud prevention records;\n\n(h) communication history; and\n\n(i) audit records maintained for compliance and operational purposes."
      },
      {
        "title": "4.6 Information Required by Law",
        "body": "In certain circumstances, PRYME may collect or retain information where required to comply\n\nwith applicable laws, judicial orders, governmental directions, regulatory requirements, fraud\n\nprevention obligations, taxation requirements, or lawful requests from competent authorities."
      },
      {
        "title": "4.7 Accuracy of Information",
        "body": "You are responsible for ensuring that all information provided to PRYME is accurate,\n\ncomplete, and kept up to date.\n\nFailure to provide accurate information may affect the quality of the Services, the accuracy of\n\nEligibility Estimates, or the processing of applications by participating financial institutions."
      },
      {
        "title": "4.8 Data Minimisation",
        "body": "PRYME endeavours to collect only the information that is reasonably necessary for the specific\n\npurpose for which it is collected.\n\nWe do not knowingly collect information that is excessive, irrelevant, or unrelated to the\n\nServices requested by you."
      }
    ]
  },
  {
    "partNumber": 5,
    "id": "privacy-part-5",
    "title": "How We Use Your Information",
    "clauses": [
      {
        "title": "5.1 Purpose of Processing",
        "body": "PRYME processes personal information only for lawful, fair, and legitimate purposes\n\nconnected with the operation of the Platform and the delivery of its Services.\n\nThe information collected by PRYME is processed only to the extent reasonably necessary to\n\nprovide the requested Services, fulfil contractual obligations, comply with applicable laws,\n\nprotect the Platform, improve user experience, and safeguard the interests of Users and\n\nparticipating financial institutions."
      },
      {
        "title": "5.2 Account Creation and Management",
        "body": "PRYME may process your personal information to:\n\n(a) create and manage your Account;\n\n(b) verify your identity;\n\n(c) authenticate your login credentials;\n\n(d) maintain your profile;\n\n(e) enable secure access to Platform features;\n\n(f) recover access to your Account where necessary; and\n\n(g) manage your relationship with PRYME."
      },
      {
        "title": "5.3 Eligibility Assessment",
        "body": "Where you request an Eligibility Estimate, PRYME may process your information to:\n\n(a) analyse the information submitted by you;\n\n(b) generate indicative eligibility results;\n\n(c) compare available financial products;\n\n(d) recommend potentially suitable loan options;\n\n(e) improve the accuracy of eligibility assessments; and\n\n(f) provide a more personalised borrowing experience.\n\nEligibility Estimates are generated using the information available to PRYME at the time of\n\nassessment and are intended solely for informational purposes."
      },
      {
        "title": "5.4 Loan Application Facilitation",
        "body": "Where you decide to proceed with a loan application through the Platform, PRYME may\n\nprocess your information to:\n\n(a) prepare the application;\n\n(b) collect supporting documents;\n\n(c) conduct preliminary verification;\n\n(d) communicate with participating financial institutions;\n\n(e) respond to document requests;\n\n(f) facilitate application tracking;\n\n(g) provide procedural assistance before, during, and after disbursal; and\n\n(h) improve the overall application experience."
      },
      {
        "title": "5.5 Customer Support",
        "body": "PRYME processes information to provide customer support, including:\n\n(a) responding to enquiries;\n\n(b) resolving complaints;\n\n(c) assisting with technical issues;\n\n(d) investigating reported concerns;\n\n(e) providing application updates;\n\n(f) maintaining communication history; and\n\n(g) improving customer service quality."
      },
      {
        "title": "5.6 Security and Fraud Prevention",
        "body": "Your information may be processed for purposes including:\n\n(a) protecting the Platform against unauthorised access;\n\n(b) detecting fraudulent activity;\n\n(c) verifying submitted information;\n\n(d) preventing misuse of promotional programmes;\n\n(e) protecting Users and participating lenders;\n\n(f) investigating suspicious activity;\n\n(g) maintaining audit trails; and\n\n(h) preserving the integrity of the Platform."
      },
      {
        "title": "5.7 Regulatory Compliance",
        "body": "PRYME may process information where reasonably necessary to:\n\n(a) comply with applicable laws;\n\n(b) comply with judicial orders;\n\n(c) comply with governmental directions;\n\n(d) satisfy regulatory obligations;\n\n(e) maintain legally required records;\n\n(f) respond to lawful requests from competent authorities; and\n\n(g) establish, exercise, or defend legal rights."
      },
      {
        "title": "5.8 Platform Improvement",
        "body": "Information may be analysed to improve:\n\n(a) Platform performance;\n\n(b) user interface design;\n\n(c) application workflows;\n\n(d) customer experience;\n\n(e) system reliability;\n\n(f) security measures;\n\n(g) new product development;\n\n(h) reporting and analytics; and\n\n(i) operational efficiency.\n\nWhere reasonably practicable, PRYME may use aggregated or anonymised information for\n\nresearch, statistical analysis, business intelligence, and service improvement."
      },
      {
        "title": "5.9 Communications",
        "body": "Subject to your communication preferences and applicable law, PRYME may process your\n\ninformation to:\n\n(a) send OTPs;\n\n(b) verify your identity;\n\n(c) communicate application status;\n\n(d) request documents;\n\n(e) provide customer support;\n\n(f) send security alerts;\n\n(g) notify you of policy updates;\n\n(h) respond to grievances;\n\n(i) inform you about new services; and\n\n(j) send promotional communications where you have consented to receive them."
      },
      {
        "title": "5.10 Future Services",
        "body": "Where PRYME introduces additional products or services, including insurance, credit cards,\n\ninvestments, Account Aggregator integrations, artificial intelligence-powered financial tools,\n\nor other financial technology services, your information may be processed for those Services\n\nafter providing any disclosures or obtaining any consent required under applicable law."
      },
      {
        "title": "5.11 No Sale of Personal Information",
        "body": "PRYME does not sell your personal information to third parties.\n\nPersonal information shall be shared only in accordance with this Privacy Policy, your consent,\n\napplicable law, or where reasonably necessary for providing the Services."
      }
    ]
  },
  {
    "partNumber": 6,
    "id": "privacy-part-6",
    "title": "Legal Basis for Processing and User Consent",
    "clauses": [
      {
        "title": "6.1 General Principle",
        "body": "PRYME processes personal information only where there is a lawful basis for doing so under\n\napplicable law.\n\nThe legal basis for processing may vary depending upon the nature of the information, the\n\nService requested by you, and the purpose for which the information is processed."
      },
      {
        "title": "6.2 Processing Based on Your Consent",
        "body": "Where required under applicable law, PRYME shall process your personal information only\n\nafter obtaining your consent.\n\nConsent may be obtained through:\n\n(a) acceptance of these Terms and the Privacy Policy;\n\n(b) selecting consent checkboxes;\n\n(c) OTP verification;\n\n(d) electronic confirmation;\n\n(e) digital authentication;\n\n(f) document upload confirmations;\n\n(g) application submission; or\n\n(h) any other lawful mechanism demonstrating a clear affirmative action."
      },
      {
        "title": "6.3 Contractual Necessity",
        "body": "Certain information is processed because it is necessary for PRYME to provide the Services\n\nrequested by you.\n\nWithout such information, PRYME may be unable to:\n\n(a) create your Account;\n\n(b) generate Eligibility Estimates;\n\n(c) facilitate loan applications;\n\n(d) communicate with participating lenders;\n\n(e) provide customer support; or\n\n(f) deliver other requested Services."
      },
      {
        "title": "6.4 Legal and Regulatory Obligations",
        "body": "PRYME may process personal information where reasonably necessary to comply with\n\napplicable legal obligations, judicial directions, regulatory requirements, taxation obligations,\n\naudit requirements, fraud prevention obligations, or lawful requests from competent\n\nauthorities."
      },
      {
        "title": "6.5 Legitimate Business Purposes",
        "body": "Subject to applicable law, PRYME may process certain information for legitimate business\n\npurposes including:\n\n(a) improving the Platform;\n\n(b) enhancing cybersecurity;\n\n(c) preventing fraud;\n\n(d) analysing Platform performance;\n\n(e) developing new products;\n\n(f) maintaining operational efficiency;\n\n(g) resolving disputes; and\n\n(h) protecting the lawful interests of PRYME, Users, and participating financial institutions."
      },
      {
        "title": "6.6 Withdrawal of Consent",
        "body": "Where processing is based on your consent, you may withdraw such consent at any time\n\nthrough the procedures made available by PRYME.\n\nWithdrawal of consent shall not affect the lawfulness of processing undertaken before the\n\nwithdrawal became effective.\n\nThe User acknowledges that withdrawal of consent may prevent PRYME from continuing to\n\nprovide certain Services."
      },
      {
        "title": "6.7 Consent for Sharing Information",
        "body": "Where you choose to proceed with a loan application through PRYME, you expressly authorise\n\nPRYME to share relevant information and supporting documentation with the participating\n\nfinancial institution selected by you for the purpose of evaluating and processing your\n\napplication.\n\nSuch sharing shall occur only for purposes connected with the requested Service and in\n\naccordance with this Privacy Policy."
      },
      {
        "title": "6.8 Future Consent",
        "body": "If PRYME introduces new Services that require additional categories of personal information\n\nor additional processing activities, PRYME shall provide appropriate disclosures and obtain\n\nany additional consent required under applicable law before commencing such processing."
      },
      {
        "title": "6.9 Record of Consent",
        "body": "PRYME may maintain records of your consent, including timestamps, authentication methods,\n\nIP addresses, device information, and other relevant metadata, for purposes including legal\n\ncompliance, audit, dispute resolution, fraud prevention, and evidentiary requirements."
      },
      {
        "title": "6.10 Continuing Responsibility",
        "body": "You are responsible for ensuring that the information and consents provided by you are\n\naccurate, lawful, and current.\n\nWhere you provide information relating to another individual, you represent that you have\n\nobtained all necessary authority or consent required to share such information with PRYME."
      }
    ]
  },
  {
    "partNumber": 7,
    "id": "privacy-part-7",
    "title": "Sharing and Disclosure of Information",
    "clauses": [
      {
        "title": "7.1 General Principle",
        "body": "PRYME respects the confidentiality of your personal information and does not sell, rent, trade,\n\nor otherwise commercially exploit your personal information.\n\nPersonal information shall only be shared where it is reasonably necessary for providing the\n\nServices, where you have provided consent, where sharing is required under applicable law, or\n\nwhere disclosure is otherwise permitted under this Privacy Policy."
      },
      {
        "title": "7.2 Sharing with Participating Financial Institutions",
        "body": "Where you choose to proceed with a loan application through the Platform, PRYME may share\n\nrelevant information and supporting documentation with the participating bank, Non-Banking\n\nFinancial Company (NBFC), housing finance company, or other regulated financial institution\n\nselected by you.\n\nInformation shared may include:\n\n(a) personal identification details;\n\n(b) contact information;\n\n(c) employment details;\n\n(d) income information;\n\n(e) business information;\n\n(f) banking information;\n\n(g) loan requirements;\n\n(h) property information;\n\n(i) documents uploaded by you; and\n\n(j) any additional information reasonably necessary for evaluating your application.\n\nSuch information shall be shared solely for the purpose of processing, evaluating, verifying,\n\nservicing, or supporting your application."
      },
      {
        "title": "7.3 Sharing with Service Providers",
        "body": "PRYME may share information with trusted third-party service providers engaged for purposes\n\nincluding:\n\n(a) cloud hosting;\n\n(b) cybersecurity;\n\n(c) software development;\n\n(d) customer support;\n\n(e) document processing;\n\n(f) communication services including email, SMS, and WhatsApp;\n\n(g) analytics;\n\n(h) fraud prevention;\n\n(i) authentication services;\n\n(j) secure data storage; and\n\n(k) other operational services reasonably required for providing the Platform.\n\nSuch service providers shall receive only the information reasonably necessary for performing\n\nthe services assigned to them and shall be contractually required to maintain appropriate\n\nconfidentiality and security standards."
      },
      {
        "title": "7.4 Sharing with Regulatory and Government Authorities",
        "body": "PRYME may disclose personal information where required or permitted under applicable law,\n\nincluding in response to:\n\n(a) judicial orders;\n\n(b) court directions;\n\n(c) statutory notices;\n\n(d) requests from law enforcement agencies;\n\n(e) governmental authorities;\n\n(f) regulatory authorities;\n\n(g) investigative agencies; or\n\n(h) any other competent authority having lawful jurisdiction.\n\nWhere legally permissible, PRYME shall endeavour to limit such disclosure to the information\n\nreasonably necessary for the relevant purpose."
      },
      {
        "title": "7.5 Sharing During Corporate Transactions",
        "body": "In the event of a merger, acquisition, restructuring, amalgamation, demerger, sale of assets,\n\ninvestment transaction, business transfer, or any similar corporate transaction involving\n\nPRYME, personal information may be transferred to the acquiring or successor entity, subject\n\nto applicable law and appropriate confidentiality obligations.\n\nAny successor entity shall continue to process such information in accordance with this Privacy\n\nPolicy or a substantially similar privacy framework until revised in accordance with applicable\n\nlaw."
      },
      {
        "title": "7.6 Professional Advisers",
        "body": "PRYME may disclose information to its professional advisers, including legal counsel,\n\nauditors, consultants, accountants, compliance advisers, insurers, or other professional service\n\nproviders where reasonably necessary for legitimate business, legal, regulatory, or contractual\n\npurposes.\n\nSuch disclosures shall be subject to applicable professional confidentiality obligations."
      },
      {
        "title": "7.7 Business Protection",
        "body": "PRYME may disclose personal information where reasonably necessary to:\n\n(a) protect the rights, property, or safety of PRYME;\n\n(b) protect Users;\n\n(c) protect participating financial institutions;\n\n(d) detect or prevent fraud;\n\n(e) investigate unlawful activities;\n\n(f) enforce these Terms;\n\n(g) defend legal claims; or\n\n(h) protect the security and integrity of the Platform."
      },
      {
        "title": "7.8 Aggregated and Anonymised Information",
        "body": "PRYME may generate aggregated, anonymised, statistical, or de-identified information\n\nderived from Platform usage.\n\nSuch information shall not reasonably identify any individual User and may be used for:\n\n(a) business analytics;\n\n(b) research;\n\n(c) service improvement;\n\n(d) product development;\n\n(e) performance reporting;\n\n(f) operational planning; and\n\n(g) other lawful business purposes."
      },
      {
        "title": "7.9 User Consent",
        "body": "Where applicable law requires consent before sharing personal information, PRYME shall\n\nobtain such consent before making the relevant disclosure.\n\nWhere disclosure is mandated by law, separate consent may not be required to the extent\n\npermitted under applicable law."
      },
      {
        "title": "7.10 No Sale of Personal Information",
        "body": "PRYME does not sell personal information to advertisers, marketing agencies, data brokers, or\n\nunrelated third parties.\n\nAny sharing undertaken by PRYME shall be consistent with this Privacy Policy and the\n\npurposes for which the information was originally collected."
      }
    ]
  },
  {
    "partNumber": 8,
    "id": "privacy-part-8",
    "title": "Third Party Service Providers, Participating Lenders, and Future Integrations",
    "clauses": [
      {
        "title": "8.1 Independent Third Parties",
        "body": "The Platform may integrate with or facilitate interactions between Users and independent third\n\nparties.\n\nSuch third parties may include:\n\n(a) participating banks;\n\n(b) Non-Banking Financial Companies (NBFCs);\n\n(c) housing finance companies;\n\n(d) technology providers;\n\n(e) cloud service providers;\n\n(f) communication service providers;\n\n(g) identity verification providers;\n\n(h) document verification partners;\n\n(i) analytics providers;\n\n(j) cybersecurity providers;\n\n(k) payment service providers, where applicable;\n\n(l) Account Aggregator ecosystem participants, if introduced in the future;\n\n(m) credit information companies where authorised by the User; and\n\n(n) other service providers reasonably required for the operation of the Platform.\n\nEach such entity remains independently responsible for its own services, privacy practices,\n\nlegal compliance, and contractual obligations."
      },
      {
        "title": "8.2 Participating Lenders",
        "body": "Where you apply for a financial product through PRYME, participating lenders may\n\nindependently collect, verify, process, and retain your information in accordance with their\n\nown privacy policies and applicable law.\n\nOnce information has been shared with a participating lender based upon your request and\n\nconsent, the subsequent processing of that information by the lender shall be governed by the\n\nlender's own legal documentation.\n\nPRYME encourages Users to carefully review the privacy policies of participating lenders\n\nbefore accepting any financial product."
      },
      {
        "title": "8.3 Credit Bureau Integrations",
        "body": "At the time of publication of this Privacy Policy, PRYME does not obtain your credit bureau\n\nreport as part of its standard Eligibility Estimate unless you expressly authorise such access\n\nthrough a future integrated service.\n\nWhere credit bureau integrations are introduced, PRYME shall provide appropriate disclosures\n\nand obtain any consent required under applicable law before initiating such requests."
      },
      {
        "title": "8.4 Account Aggregator Ecosystem",
        "body": "PRYME may, in the future, integrate with entities operating within the Account Aggregator\n\necosystem.\n\nWhere such services are introduced, PRYME shall collect and process information only in\n\naccordance with:\n\n(a) your explicit consent where required;\n\n(b) applicable laws and regulatory requirements;\n\n(c) the operational framework governing the Account Aggregator ecosystem; and\n\n(d) any additional product-specific terms published by PRYME."
      },
      {
        "title": "8.5 Artificial Intelligence Services",
        "body": "PRYME may introduce artificial intelligence or machine learning features to improve customer\n\nsupport, financial education, eligibility estimation, document processing, and user experience.\n\nWhere such services process personal information, PRYME shall implement reasonable\n\nsafeguards and comply with applicable legal requirements governing such processing.\n\nAI-generated outputs shall be intended to assist Users and shall not constitute financial, legal,\n\ntax, or investment advice."
      },
      {
        "title": "8.6 Security Expectations for Third Parties",
        "body": "PRYME endeavours to engage service providers that maintain reasonable administrative,\n\ntechnical, and organisational security measures appropriate to the services they perform.\n\nHowever, PRYME cannot guarantee the security practices of independent third parties\n\noperating outside the Company's control."
      },
      {
        "title": "8.7 Changes to Integrations",
        "body": "PRYME may add, remove, replace, or modify third-party integrations from time to time in\n\nresponse to technological, commercial, operational, or regulatory developments.\n\nSuch modifications shall not affect the validity of this Privacy Policy unless material changes\n\nto information processing require an update under applicable law."
      },
      {
        "title": "8.8 Limitation",
        "body": "Nothing contained in this Part shall be interpreted as making PRYME responsible for the\n\nindependent privacy practices, contractual obligations, operational procedures, or regulatory\n\ncompliance of participating lenders or other independent third parties.\n\nUsers are encouraged to independently review the privacy practices of every third party with\n\nwhom they choose to interact through the Platform."
      }
    ]
  },
  {
    "partNumber": 9,
    "id": "privacy-part-9",
    "title": "Cookies, Analytics, and Similar Technologies",
    "clauses": [
      {
        "title": "9.1 Use of Cookies",
        "body": "PRYME uses cookies and similar technologies to improve the functionality, security,\n\nperformance, and usability of the Platform.\n\nCookies are small text files stored on your device that enable the Platform to recognise your\n\nbrowser, remember your preferences, maintain secure sessions, and provide a better browsing\n\nexperience."
      },
      {
        "title": "9.2 Types of Technologies Used",
        "body": "Depending upon the functionality of the Platform, PRYME may use:\n\n(a) essential cookies;\n\n(b) authentication cookies;\n\n(c) session cookies;\n\n(d) preference cookies;\n\n(e) analytics technologies;\n\n(f) performance monitoring tools;\n\n(g) security technologies;\n\n(h) device identifiers;\n\n(i) local storage technologies; and\n\n(j) similar technologies that support the operation of the Platform."
      },
      {
        "title": "9.3 Purpose",
        "body": "These technologies may be used to:\n\n(a) authenticate Users;\n\n(b) maintain secure login sessions;\n\n(c) remember user preferences;\n\n(d) improve Platform performance;\n\n(e) analyse user behaviour;\n\n(f) identify technical issues;\n\n(g) prevent fraudulent activity;\n\n(h) enhance cybersecurity;\n\n(i) measure website performance; and\n\n(j) improve future products and services."
      },
      {
        "title": "9.4 Analytics",
        "body": "PRYME may use analytics tools to understand how Users interact with the Platform.\n\nAnalytics information may include:\n\n(a) pages visited;\n\n(b) navigation patterns;\n\n(c) device characteristics;\n\n(d) browser information;\n\n(e) approximate geographic region;\n\n(f) session duration;\n\n(g) referring websites; and\n\n(h) user interactions.\n\nWhere reasonably practicable, analytics information shall be processed in aggregated or\n\nanonymised form."
      },
      {
        "title": "9.5 Managing Cookies",
        "body": "Most internet browsers permit Users to manage or disable cookies through browser settings.\n\nDisabling certain cookies may affect the availability, functionality, security, or performance of\n\nsome features of the Platform\n\n."
      },
      {
        "title": "9.6 Future Technologies",
        "body": "PRYME may adopt additional technologies in the future to improve Platform security,\n\nfunctionality, accessibility, fraud prevention, or customer experience.\n\nWhere required under applicable law, appropriate disclosures or consent mechanisms shall be\n\nprovided before such technologies are used."
      },
      {
        "title": "9.7 Separate Cookie Policy",
        "body": "Additional information regarding cookies and similar technologies may be provided through\n\nPRYME's separate Cookie Policy, which shall be read together with this Privacy Policy."
      }
    ]
  },
  {
    "partNumber": 10,
    "id": "privacy-part-10",
    "title": "Data Security and Information Protection",
    "clauses": [
      {
        "title": "10.1 Commitment to Security",
        "body": "PRYME recognises the importance of protecting personal information against accidental loss,\n\nunauthorised access, misuse, disclosure, alteration, destruction, or other unlawful processing.\n\nThe Company continuously endeavours to implement reasonable administrative,\n\norganisational, contractual, physical, and technical safeguards appropriate to the nature of the\n\ninformation processed."
      },
      {
        "title": "10.2 Security Measures",
        "body": "Without limiting the generality of the foregoing, PRYME may implement measures including:\n\n(a) encrypted communication channels;\n\n(b) secure cloud infrastructure;\n\n(c) controlled access mechanisms;\n\n(d) authentication procedures;\n\n(e) role based access controls;\n\n(f) audit logging;\n\n(g) cybersecurity monitoring;\n\n(h) vulnerability management;\n\n(i) regular software updates;\n\n(j) backup procedures;\n\n(k) disaster recovery planning; and\n\n(l) employee access controls.\n\nThe implementation of any particular safeguard may evolve over time in response to\n\ntechnological developments and operational requirements."
      },
      {
        "title": "10.3 Employee Confidentiality",
        "body": "Access to personal information is limited to employees, consultants, contractors, and\n\nauthorised representatives who reasonably require such access for performing their\n\nresponsibilities.\n\nSuch persons may be subject to contractual confidentiality obligations and internal information\n\nsecurity policies."
      },
      {
        "title": "10.4 User Responsibilities",
        "body": "Users also play an important role in protecting their information.\n\nAccordingly, Users are encouraged to:\n\n(a) maintain confidentiality of Account credentials;\n\n(b) avoid sharing OTPs or passwords;\n\n(c) use trusted devices;\n\n(d) promptly report suspected unauthorised access;\n\n(e) keep contact information updated; and\n\n(f) exercise reasonable caution while using public networks."
      },
      {
        "title": "10.5 No Absolute Security",
        "body": "Although PRYME endeavours to maintain appropriate security standards, no internet based\n\nplatform, electronic storage system, communication network, or method of data transmission\n\ncan be guaranteed to be completely secure.\n\nAccordingly, PRYME cannot guarantee absolute security of personal information and shall not\n\nrepresent that any security measure is infallible."
      },
      {
        "title": "10.6 Security Incidents",
        "body": "Where PRYME becomes aware of a security incident affecting personal information, the\n\nCompany shall respond in accordance with its internal incident response procedures and\n\napplicable legal requirements.\n\nWhere notification is required under applicable law, PRYME shall notify the appropriate\n\nauthorities and affected individuals within the timelines prescribed by law.\n\nWhere required under the Digital Personal Data Protection Act, 2023, such notification shall\n\nbe made to the Data Protection Board of India and to the affected individuals in the manner\n\nand within the timelines prescribed thereunder."
      },
      {
        "title": "10.7 Continuous Improvement",
        "body": "PRYME may periodically review and improve its information security practices in response to\n\nevolving threats, technological advancements, regulatory developments, operational\n\nexperience, and industry standards."
      }
    ]
  },
  {
    "partNumber": 11,
    "id": "privacy-part-11",
    "title": "Data Retention and Deletion",
    "clauses": [
      {
        "title": "11.1 Retention Principle",
        "body": "PRYME retains personal information only for as long as reasonably necessary to fulfil the\n\npurposes described in this Privacy Policy, provide the requested Services, comply with legal\n\nobligations, resolve disputes, prevent fraud, maintain audit records, and enforce contractual\n\nrights."
      },
      {
        "title": "11.2 Retention During Active Use",
        "body": "While your Account remains active or while an application is pending, approved, under review,\n\nawaiting documentation, awaiting disbursal, or otherwise being processed, PRYME may retain\n\nthe information reasonably necessary for providing the Services."
      },
      {
        "title": "11.3 Account Deletion",
        "body": "You may request deletion of your Account in accordance with the procedures prescribed by\n\nPRYME.\n\nWhere a loan application remains active, PRYME may postpone deletion until the relevant\n\napplication has been completed, cancelled, withdrawn, or otherwise closed."
      },
      {
        "title": "11.4 Retention After Deletion",
        "body": "Even after deletion of an Account, PRYME may retain certain information where reasonably\n\nnecessary for:\n\n(a) compliance with applicable law;\n\n(b) taxation requirements;\n\n(c) audit obligations;\n\n(d) fraud prevention;\n\n(e) dispute resolution;\n\n(f) enforcement of contractual rights;\n\n(g) defence of legal claims;\n\n(h) regulatory compliance; or\n\n(i) other legitimate business purposes recognised under applicable law."
      },
      {
        "title": "11.5 Anonymisation",
        "body": "Where appropriate, PRYME may anonymise or de identify information so that it no longer\n\nidentifies an individual.\n\nSuch information may be retained for research, statistical analysis, product development,\n\nbusiness intelligence, security improvement, or other lawful purposes."
      },
      {
        "title": "11.6 Secure Disposal",
        "body": "Where information is no longer required to be retained, PRYME shall endeavour to securely\n\ndelete, anonymise, or otherwise dispose of such information using methods reasonably\n\nappropriate to the nature of the information and applicable technology."
      }
    ]
  },
  {
    "partNumber": 12,
    "id": "privacy-part-12",
    "title": "Your Privacy Rights",
    "clauses": [
      {
        "title": "12.1 Commitment to User Rights",
        "body": "PRYME respects the rights available to individuals under applicable law and endeavours to\n\nprovide reasonable mechanisms for exercising such rights.\n\nThe availability of particular rights may depend upon the nature of the information processed\n\nand the applicable legal framework."
      },
      {
        "title": "12.2 Right to Access",
        "body": "Subject to applicable law, you may request confirmation regarding whether PRYME processes\n\nyour personal information and may request access to such information."
      },
      {
        "title": "12.3 Right to Correction",
        "body": "You may request correction or updating of inaccurate, incomplete, or outdated personal\n\ninformation maintained by PRYME.\n\nPRYME may require reasonable verification before implementing requested changes."
      },
      {
        "title": "12.4 Right to Withdraw Consent",
        "body": "Where processing is based upon your consent, you may withdraw such consent at any time.\n\nWithdrawal of consent shall not affect processing lawfully undertaken before such withdrawal.\n\nWithdrawal may affect PRYME's ability to continue providing certain Services."
      },
      {
        "title": "12.5 Right to Deletion",
        "body": "Subject to applicable law and lawful retention requirements, you may request deletion of your\n\npersonal information.\n\nPRYME shall evaluate such requests in accordance with applicable legal obligations and\n\noperational requirements."
      },
      {
        "title": "12.6 Right to Grievance Redressal",
        "body": "You may submit complaints or concerns regarding the processing of your personal information\n\nthrough the grievance mechanism established by PRYME.\n\nThe Company shall endeavour to address such concerns within a reasonable period in\n\naccordance with applicable law."
      },
      {
        "title": "12.7 Verification",
        "body": "For the protection of Users, PRYME may verify the identity of the requesting individual before\n\nprocessing any request relating to personal information."
      },
      {
        "title": "12.8 Limitations",
        "body": "Certain requests may be declined or restricted where:\n\n(a) compliance would violate applicable law;\n\n(b) the information must be retained for legal or regulatory purposes;\n\n(c) disclosure may adversely affect the rights of another person;\n\n(d) the request is manifestly unfounded or excessive; or\n\n(e) another lawful basis exists for refusing the request.\n\nWhere a request cannot be fully accommodated, PRYME shall endeavour to provide an\n\nappropriate explanation to the extent permitted by applicable law."
      },
      {
        "title": "12.9 Right of Nomination",
        "body": "Subject to applicable law, you may nominate another individual to exercise your rights under\n\nthis Privacy Policy in the event of your death or incapacity, in the manner prescribed under\n\nthe Digital Personal Data Protection Act, 2023, through such mechanism as PRYME may\n\nmake available from time to time."
      }
    ]
  },
  {
    "partNumber": 13,
    "id": "privacy-part-13",
    "title": "Children's Privacy",
    "clauses": [
      {
        "title": "13.1 Services Intended for Adults",
        "body": "The Platform is intended for individuals who are legally competent to enter into a binding\n\ncontract under the laws of India.\n\nPRYME does not knowingly provide its Services to individuals who are not legally eligible to\n\napply for financial products offered through the Platform."
      },
      {
        "title": "13.2 Personal Information of Children",
        "body": "PRYME does not knowingly collect personal information from children except where\n\nexpressly permitted or required under applicable law and after obtaining any consent or\n\nauthorisation required by law.\n\nIf PRYME becomes aware that personal information has been collected in violation of\n\napplicable law, the Company shall take reasonable steps to delete or otherwise handle such\n\ninformation in accordance with applicable legal requirements."
      },
      {
        "title": "13.3 Responsibility of Users",
        "body": "Users represent and warrant that the information submitted through the Platform belongs to\n\nthem or has been lawfully submitted with the necessary authority.\n\nUsers shall not knowingly submit personal information relating to another individual without\n\nthe lawful authority or consent required under applicable law."
      },
      {
        "title": "13.4 Parent or Guardian Requests",
        "body": "Where applicable law grants a parent or lawful guardian the right to make requests concerning\n\na child's personal information, PRYME may require reasonable verification before processing\n\nsuch requests."
      },
      {
        "title": "13.5 Future Changes",
        "body": "If PRYME introduces services specifically intended for minors or legally protected individuals\n\nin the future, this Privacy Policy may be amended to reflect the applicable legal requirements\n\ngoverning such services."
      },
      {
        "title": "13.6 Processing of a Child's Personal Information",
        "body": "Where PRYME processes personal information relating to an individual below eighteen (18)\n\nyears of age in connection with a User's application \u2014 for example, where such information is\n\nsubmitted as part of a dependent's or family member's details relevant to an eligibility\n\nassessment \u2014 such processing shall be limited to what is strictly necessary for that purpose.\n\nPRYME shall not undertake tracking, behavioural monitoring, or targeted advertising directed\n\nat any such individual, and shall process such information only with the verifiable consent of\n\nthe individual's parent or lawful guardian where required under the Digital Personal Data\n\nProtection Act, 2023."
      }
    ]
  },
  {
    "partNumber": 14,
    "id": "privacy-part-14",
    "title": "Cross Border Data Transfers",
    "clauses": [
      {
        "title": "14.1 Localisation of Lending-Related Information",
        "body": "Notwithstanding anything contained in this Part, personal information collected\n\nfrom a User in connection with a loan application, eligibility assessment, or any\n\nother digital lending facilitation activity shall be stored on servers located within\n\nIndia, in accordance with applicable directions of the Reserve Bank of India,\n\nincluding the Reserve Bank of India (Digital Lending) Directions, 2025, as amended\n\nor replaced from time to time. The remainder of this Part shall apply only to\n\ntechnical, analytical, and operational information that does not constitute borrower\n\nor lending data under such directions."
      },
      {
        "title": "14.2 General Principle",
        "body": "PRYME primarily endeavours to process and store personal information using infrastructure\n\nand service providers that comply with applicable legal and security requirements.\n\nWhere necessary for providing the Services or improving Platform operations, certain\n\ninformation may be processed through infrastructure or service providers operating in\n\njurisdictions outside India, subject to applicable law."
      },
      {
        "title": "14.3 Appropriate Safeguards",
        "body": "Where cross border processing is undertaken, PRYME shall endeavour to ensure that\n\nappropriate contractual, organisational, and technical safeguards are implemented to protect\n\npersonal information."
      },
      {
        "title": "14.4 Service Providers",
        "body": "Cross border processing may occur where PRYME utilises internationally recognised\n\nproviders for services including:\n\n(a) cloud infrastructure;\n\n(b) cybersecurity;\n\n(c) software development;\n\n(d) analytics;\n\n(e) customer communications;\n\n(f) authentication services;\n\n(g) operational monitoring; or\n\n(h) other technology services reasonably necessary for operating the Platform."
      },
      {
        "title": "14.5 Compliance",
        "body": "PRYME shall endeavour to ensure that any cross border processing remains consistent with\n\napplicable legal requirements and this Privacy Policy."
      },
      {
        "title": "14.6 Future Regulatory Requirements",
        "body": "Where future legislation or regulatory directions impose additional obligations relating to\n\ninternational data transfers, PRYME reserves the right to implement such measures as may be\n\nreasonably necessary to maintain compliance."
      }
    ]
  },
  {
    "partNumber": 15,
    "id": "privacy-part-15",
    "title": "Third Party Websites and External Services",
    "clauses": [
      {
        "title": "15.1 External Platforms",
        "body": "The Platform may contain links, integrations, references, or redirections to websites,\n\napplications, or digital services operated by independent third parties.\n\nSuch links are provided solely for the convenience of Users."
      },
      {
        "title": "15.2 Independent Privacy Practices",
        "body": "PRYME does not own or control third party websites or applications.\n\nAccordingly, PRYME shall not be responsible for the privacy practices, security measures,\n\nterms of use, content, products, services, or policies adopted by such third parties.\n\nUsers are encouraged to review the privacy policies and legal documentation of every third\n\nparty before sharing personal information."
      },
      {
        "title": "15.3 Participating Financial Institutions",
        "body": "Where a User chooses to proceed with a loan application through a participating bank, NBFC,\n\nhousing finance company, or other regulated financial institution, the subsequent collection\n\nand processing of information by such institution shall be governed by its own privacy policy\n\nand legal documentation.\n\nPRYME shall not be responsible for the independent privacy practices of such institutions."
      },
      {
        "title": "15.4 Third Party Technologies",
        "body": "The Platform may utilise third party technologies for purposes including analytics,\n\ncommunications, hosting, cybersecurity, authentication, document processing, and operational\n\nsupport.\n\nSuch technologies shall operate in accordance with their contractual arrangements with\n\nPRYME and applicable law."
      },
      {
        "title": "15.5 User Responsibility",
        "body": "Accessing any third party website or service is undertaken voluntarily and at the User's own\n\ndiscretion.\n\nPRYME recommends exercising appropriate caution before submitting personal information\n\nto any third party."
      }
    ]
  },
  {
    "partNumber": 16,
    "id": "privacy-part-16",
    "title": "Updates to this Privacy Policy",
    "clauses": [
      {
        "title": "16.1 Right to Update",
        "body": "PRYME reserves the right to amend, modify, supplement, replace, or update this Privacy\n\nPolicy from time to time in response to:\n\n(a) changes in applicable law;\n\n(b) regulatory requirements;\n\n(c) judicial decisions;\n\n(d) technological developments;\n\n(e) operational improvements;\n\n(f) introduction of new products or services;\n\n(g) cybersecurity requirements;\n\n(h) business restructuring; or\n\n(i) other legitimate legal or commercial reasons."
      },
      {
        "title": "16.2 Publication of Updates",
        "body": "Updated versions of this Privacy Policy shall be published on the Platform together with the\n\nrevised Effective Date.\n\nMaterial updates may also be communicated through email, dashboard notifications, website\n\nnotices, or other authorised communication channels where considered appropriate."
      },
      {
        "title": "16.3 Continued Use",
        "body": "Your continued use of the Platform after the effective date of any revised Privacy Policy shall\n\nconstitute acknowledgement of the updated Privacy Policy to the extent permitted by\n\napplicable law.\n\nWhere applicable law requires fresh consent for a particular processing activity, PRYME shall\n\nobtain such consent before undertaking the relevant processing."
      },
      {
        "title": "16.4 Previous Versions",
        "body": "PRYME may retain previous versions of this Privacy Policy for audit, legal, compliance,\n\noperational, or historical reference purposes.\n\nPrevious versions may not necessarily remain publicly available after a revised version\n\nbecomes effective."
      },
      {
        "title": "16.5 Questions Regarding Changes",
        "body": "Users who have questions regarding amendments to this Privacy Policy may contact PRYME\n\nthrough the official communication channels published on the Platform."
      }
    ]
  },
  {
    "partNumber": 17,
    "id": "privacy-part-17",
    "title": "Contact Information, Privacy Requests, and Grievance Redressal",
    "clauses": [
      {
        "title": "17.1 Contacting PRYME",
        "body": "If you have any questions, concerns, requests, or complaints regarding this Privacy Policy or\n\nthe manner in which your personal information is collected, processed, stored, shared, retained,\n\nor protected, you may contact PRYME using the official contact details provided below.\n\nGOPRYME FINTECH PRIVATE LIMITED\n\nCorporate Identification Number (CIN): U70200MP2026PTC081776\n\nRegistered Office:\n\n204, Ranjeet Hanuman Main Road\n\nNear BATA Showroom\n\nMhow Naka\n\nIndore, Madhya Pradesh, India\n\nWebsite: www.prymeloans.in\n\nEmail: contact@gopryme.in\n\nCustomer Support: +91 92432 94291\n\nPRYME may update its contact information from time to time. The latest contact details\n\npublished on the Platform shall prevail."
      },
      {
        "title": "17.2 Privacy Requests",
        "body": "Subject to applicable law, you may contact PRYME to submit requests relating to:\n\n(a) access to your personal information;\n\n(b) correction or updating of your personal information;\n\n(c) withdrawal of consent where applicable;\n\n(d) deletion of personal information;\n\n(e) reporting suspected unauthorised access to your Account;\n\n(f) reporting suspected misuse of your personal information;\n\n(g) raising concerns regarding this Privacy Policy; or\n\n(h) exercising any other rights available under applicable law.\n\nPRYME may require reasonable information to verify your identity before processing any such\n\nrequest."
      },
      {
        "title": "17.3 Grievance Officer",
        "body": "PRYME shall designate a Grievance Officer responsible for addressing grievances relating to\n\nthe processing of personal information and compliance with this Privacy Policy.\n\nAs on the Effective Date of this Privacy Policy, the Grievance Officer is:\n\nName: Aadesh Kothari, aadesh.k@gopryme.in, +91 92432 94291.\n\nThe Company reserves the right to appoint or replace the Grievance Officer at any time.\n\nAny such appointment or change shall become effective upon publication on the Platform and\n\nshall not require amendment of this Privacy Policy."
      },
      {
        "title": "17.4 Resolution of Privacy Complaints",
        "body": "Upon receiving a privacy-related complaint or request, PRYME shall endeavour to\n\nacknowledge the communication within a reasonable period.\n\nThe Company shall make reasonable efforts to investigate and resolve privacy-related\n\ngrievances within thirty (30) days, subject to the complexity of the matter, availability of\n\nrelevant information, involvement of third parties, or other circumstances beyond the\n\nreasonable control of PRYME.\n\nWhere additional information is required to process a request, PRYME may contact the User\n\nfor clarification or supporting documentation.\n\nWhere a privacy-related grievance is not resolved to your satisfaction within the aforesaid\n\nperiod, or where you remain dissatisfied with the resolution provided, you may escalate the\n\nmatter to the Data Protection Board of India in accordance with the Digital Personal Data\n\nProtection Act, 2023."
      },
      {
        "title": "17.5 Verification",
        "body": "For the protection of Users and to prevent unauthorised disclosure of personal information,\n\nPRYME may verify the identity of any individual submitting a privacy-related request before\n\ntaking action on such request.\n\nFailure to provide information reasonably necessary for verification may result in delay or\n\nrefusal of the request to the extent permitted by applicable law."
      },
      {
        "title": "17.6 Good Faith Cooperation",
        "body": "Users are encouraged to first contact PRYME directly regarding any privacy concern before\n\npursuing any external remedy.\n\nPRYME remains committed to resolving privacy concerns fairly, transparently, and in\n\naccordance with applicable law."
      }
    ]
  },
  {
    "partNumber": 18,
    "id": "privacy-part-18",
    "title": "Final Provisions",
    "clauses": [
      {
        "title": "18.1 Relationship with Other Policies",
        "body": "This Privacy Policy should be read together with the Terms and Conditions, Cookie Policy,\n\nDisclaimer, Consent and Communication Policy, and any other legal documents published by\n\nPRYME.\n\nIn the event of any inconsistency relating specifically to the processing of personal information,\n\nthe provisions of this Privacy Policy shall prevail to the extent of such inconsistency unless\n\notherwise required by applicable law."
      },
      {
        "title": "18.2 Entire Privacy Framework",
        "body": "This Privacy Policy constitutes the complete statement of PRYME's privacy practices relating\n\nto the collection, processing, storage, sharing, protection, retention, and deletion of personal\n\ninformation through the Platform.\n\nNothing contained in this Privacy Policy shall limit any rights or obligations imposed by\n\napplicable law."
      },
      {
        "title": "18.3 No Waiver",
        "body": "Any failure or delay by PRYME in exercising any right or remedy under this Privacy Policy\n\nshall not constitute a waiver of that right.\n\nAny waiver shall be valid only if expressly made in writing by an authorised representative of\n\nPRYME."
      },
      {
        "title": "18.4 Severability",
        "body": "If any provision of this Privacy Policy is held to be invalid, unlawful, or unenforceable by a\n\ncourt or competent authority, the remaining provisions shall continue in full force and effect.\n\nThe invalid provision shall, to the extent reasonably possible, be interpreted or replaced in a\n\nmanner that most closely reflects its original intent while remaining legally enforceable."
      },
      {
        "title": "18.5 Survival",
        "body": "Any provisions of this Privacy Policy which, by their nature, are intended to survive\n\ntermination of your Account or discontinuation of the Services, including provisions relating\n\nto data retention, legal compliance, dispute resolution, limitation of liability, regulatory\n\nobligations, fraud prevention, and protection of PRYME's legal rights, shall continue to remain\n\nin effect for as long as reasonably necessary."
      },
      {
        "title": "18.6 Governing Law",
        "body": "This Privacy Policy shall be governed by and construed in accordance with the laws of the\n\nRepublic of India.\n\nAny dispute arising out of or relating to this Privacy Policy shall be subject to the dispute\n\nresolution mechanism and jurisdiction provisions contained in the Terms and Conditions of the\n\nPlatform."
      },
      {
        "title": "18.7 User Acknowledgement",
        "body": "By accessing or using the Platform, creating an Account, requesting an Eligibility Estimate,\n\nsubmitting a loan application, communicating with PRYME, or otherwise using the Services,\n\nyou acknowledge that you have read, understood, and accepted this Privacy Policy.\n\nWhere your consent is required under applicable law, PRYME shall obtain such consent\n\nthrough appropriate electronic or other legally recognised means before processing your\n\npersonal information."
      },
      {
        "title": "18.8 Our Commitment",
        "body": "PRYME was founded with a simple objective: to help borrowers make informed financial\n\ndecisions with greater transparency, privacy, and trust.\n\nWe recognise that protecting your personal information is fundamental to earning and\n\nmaintaining that trust. We are committed to processing your information responsibly,\n\nimplementing reasonable safeguards to protect it, complying with applicable legal\n\nrequirements, and continuously improving our privacy practices as our Platform evolves.\n\nYour trust is one of our most valuable assets, and we remain committed to protecting it."
      }
    ]
  }
]
};

export const FAIR_LENDING_DISCLOSURES = {
  title: 'RBI Digital Lending & Fair Practice Code',
  effectiveDate: 'July 10, 2026',
  items: [
    {
      title: 'Lending Service Provider (LSP) Role',
      content: 'GOPRYME FINTECH PRIVATE LIMITED acts strictly as a Lending Service Provider (LSP) facilitating loan products for RBI-regulated Regulated Entities (REs / Banks / NBFCs).'
    },
    {
      title: 'Key Fact Statement (KFS)',
      content: 'A standardised Key Fact Statement (KFS) containing all-inclusive Annual Percentage Rate (APR), processing fees, tenure, and repayment schedule will be provided prior to loan agreement execution.'
    },
    {
      title: 'Cooling-Off / Look-Up Period',
      content: 'Borrowers are provided a cooling-off look-up period as prescribed by RBI norms during which they can exit the digital loan without penal charges by repaying principal and proportionate APR.'
    },
    {
      title: 'Direct Disbursement & Repayment',
      content: 'All loan disbursements and repayments are executed directly between the borrower bank account and the Regulated Entity (Bank/NBFC) without pass-through via any third-party pool accounts.'
    }
  ]
};
