/**
 * SEO constants and structured data.
 *
 * ── Why one canonical host ──────────────────────────────────────────────────
 * One build serves prymeloans.in, prymeloans.com and gopryme.tech. To a search
 * engine that is three sites with identical content, and it will pick one and
 * discount the others — while backlinks, crawl budget and authority split three
 * ways. SITE_URL is the single host every canonical, og:url and sitemap entry
 * points at, so the other two consolidate into it instead of competing with it.
 *
 * prymeloans.in is primary: a .in ccTLD carries a geographic signal for India
 * that a .com does not, it matches the brand, and it is already the domain all
 * transactional email sends from.
 *
 * ── Why structured data matters more than the copy ──────────────────────────
 * The site had none at all. For a local service business this is the largest
 * single gap: LocalBusiness/FinancialService is how Google reads the address,
 * phone, hours and service area as facts rather than guessing them from prose.
 * It is also what makes the business eligible for the Maps local pack, which is
 * where most "loan in Indore" clicks actually land.
 */

export const SITE_URL = "https://www.prymeloans.in";

/** Absolute URL for a path — canonicals must never be relative. */
export const canonical = (path = "/") =>
  `${SITE_URL}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;

/**
 * Name, Address, Phone. One definition, used by both the footer and the schema.
 *
 * NAP consistency is a ranking factor: Google cross-references this against the
 * Google Business Profile and third-party citations, and a mismatch dilutes the
 * local signal rather than adding to it. This block previously existed twice on
 * the site with two different addresses, which is worse than having none.
 *
 * MUST match the verified Google Business Profile character for character.
 */
export const BUSINESS = {
  legalName: "Pryme Consulting India",
  name: "PRYME",
  phone: "+91 92432 94291",
  email: "contact@gopryme.in",
  /**
   * One string, rendered everywhere the address appears: the footer, the contact
   * page, and the LocalBusiness schema.
   *
   * The site previously stated two different addresses -- a "204, Near BATA
   * showroom" version in the footer and a "4th Floor, Above Mr. DIY Showroom"
   * version on the contact page. Google cross-references this against the
   * Business Profile and third-party citations, so contradicting yourself is
   * worse than a single imperfect entry. Anything that renders the address now
   * imports it from here rather than retyping it.
   */
  street: "204, Ranjeet Hanuman Main Road, Near BATA Showroom, Mhow Naka",
  locality: "Indore",
  region: "Madhya Pradesh",
  postalCode: "452009",
  country: "IN",
  // Indore city centre. Replace with the exact pin from the Business Profile —
  // an approximate coordinate is still better than none, but the precise one is
  // what aligns the listing and the site.
  latitude: 22.7196,
  longitude: 75.8577,
} as const;

/**
 * Organisation + local business + site search, emitted once on the homepage.
 *
 * A @graph rather than three separate script tags: the nodes cross-reference by
 * @id, so Google reads one entity described from three angles instead of three
 * entities that happen to share a name.
 */
export const organisationSchema = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": `${SITE_URL}/#organization`,
      name: BUSINESS.name,
      legalName: BUSINESS.legalName,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      image: `${SITE_URL}/icon-512.png`,
      telephone: BUSINESS.phone,
      email: BUSINESS.email,
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.street,
        addressLocality: BUSINESS.locality,
        addressRegion: BUSINESS.region,
        postalCode: BUSINESS.postalCode,
        addressCountry: BUSINESS.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: BUSINESS.latitude,
        longitude: BUSINESS.longitude,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:00",
          closes: "19:00",
        },
      ],
      // Where the business serves, distinct from where it sits. Without this
      // Google infers the service area from the address alone.
      areaServed: [
        { "@type": "City", name: "Indore" },
        { "@type": "State", name: "Madhya Pradesh" },
        { "@type": "Country", name: "India" },
      ],
      // Named services are what let a query like "loan against property in
      // Indore" match a specific offering rather than the homepage generally.
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Loan Products",
        itemListElement: [
          "Home Loan",
          "Loan Against Property",
          "Personal Loan",
          "Business Loan",
          "Balance Transfer and Top-Up",
        ].map((service) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: service, areaServed: "Indore, Madhya Pradesh" },
        })),
      },
      sameAs: [
        "https://www.linkedin.com/company/pryme-consultingindia/",
        "https://www.prymeloans.com",
        "https://www.gopryme.tech",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: BUSINESS.name,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
});

/**
 * FAQPage schema.
 *
 * The one piece of structured data with a visible payoff: eligible questions can
 * render as expandable answers directly in the result, which takes vertical
 * space from competitors on the same page. Only emit it for Q&A that is actually
 * visible on the page — marking up content a visitor cannot see is a
 * spam-policy violation, not a shortcut.
 */
export const faqSchema = (faqs: ReadonlyArray<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

/** BreadcrumbList — renders the path instead of a bare URL under the title. */
export const breadcrumbSchema = (trail: ReadonlyArray<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: canonical(c.path),
  })),
});
