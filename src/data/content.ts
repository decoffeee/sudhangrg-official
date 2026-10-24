export const site = {
  name: "Sudhan Gurung",
  title: "Sudhan Gurung — Home Minister of Nepal | Official Portfolio",
  description:
    "Official portfolio of Sudhan Gurung, Home Minister of Nepal and Member of Parliament for Gorkha. His vision for a safer Nepal, ongoing works, the live Gorkha manifesto and the latest updates.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
  keywords: [
    "Sudhan Gurung",
    "Home Minister Nepal",
    "Ministry of Home Affairs Nepal",
    "Gorkha",
    "Member of Parliament Gorkha",
    "Nepal politics",
  ],
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Ministry", href: "#ministry" },
];

export const hero = {
  first: "SUDHAN",
  last: "GURUNG",
  roles: ["HOME", "MINISTER", "NEPAL"],
  roleNote: ["/ MEMBER OF", "PARLIAMENT", "GORKHA"],
  imageAlt: "Sudhan Gurung, wearing a Dhaka topi and khata, standing with elders and people of Gorkha",
  // Bump `v` after re-baking (scripts/bake-shadows.js): the image optimizer and
  // browsers cache by URL, not by file contents.
  front: "/images/hero-front.webp?v=5",
};

export const martyrs = {
  lines: ["THE BRAVE MARTYRS WHO", "GAVE UP THEIR LIFE FOR A BETTER NEPAL WILL ALWAYS BE REMEMBERED"],
  date: "06-26",
};

const beliefs = [
  "I believe public service must be fearless, honest, and close to the people. As Nepal’s Home Minister, I am committed to protecting citizens, strengthening public trust, and ensuring that government institutions serve with discipline, integrity, and compassion. My work is guided by a simple conviction: every Nepali deserves to feel safe, heard, and respected.",
  "I envision a stronger Nepal—secure in its communities, prepared in times of crisis, and united by confidence in the rule of law. I want to build modern, accountable public-safety institutions that act decisively while remaining accessible to the people they serve. Together, we can create a Nepal where safety is not a privilege, but a promise for every citizen.",
];

export const about = {
  personLabel: ["THE PERSON", "BEHIND", "SUDHAN GURUNG"],
  personCopy: beliefs,
  personAlt: "Sudhan Gurung in a Dhaka topi looking out over the Himalayan mountains",
  visionLabel: ["MY VISION", "FOR NEPAL"],
  visionCopy: beliefs,
  visionAlt: "Sudhan Gurung speaking at a press conference, flanked by security personnel",
};

export type Card = {
  id: string;
  title: [string, string];
  href: string;
  date: { label: string; iso: string };
  description: string;
  variant?: "image" | "quote" | "cta";
  image?: string;
  alt?: string;
  quote?: string;
  cta?: string;
};

const standalone = "A standalone project from the Ministry of Home Affairs";
const collaboration =
  "In collaboration with Ministry of Roads & Infrastructure, Ministry of Foreign Affairs, Ministry of Health, Ministry of Law";
const date = { label: "MAY 23, 2026", iso: "2026-05-23" };

export const works = {
  eyebrow: ["STRAIGHT", "TO THE WORKS"],
  heading: "Decisive in Action. Grounded in People. Driven by Nepal.",
  cards: [
    {
      id: "police-apf-ammunition",
      title: ["REWORK ON NEPAL POLICE", "& APF AMMUNITION POLICIES"],
      href: "#journey",
      date,
      description: standalone,
      image: "/images/work-1.webp",
      alt: "Armed Police Force personnel in blue camouflage marching in formation",
    },
    {
      id: "disaster-preparation",
      title: ["BETTER PRE-PREPARATION", "AGAINST DISASTERS"],
      href: "#journey",
      date,
      description: collaboration,
      image: "/images/work-2.webp",
      alt: "A landslide crashing down a hillside beside a mountain road as a man runs away",
    },
    {
      id: "drones-security",
      title: ["DRONES FOR SECURITY, SURVEILLANCE", "& DISASTER"],
      href: "#journey",
      date,
      description: collaboration,
      image: "/images/work-3.webp",
      alt: "A heavy-lift drone carrying a supply package against a grey sky",
    },
    {
      id: "prison-system",
      title: ["A MORE MANAGED", "PRISON SYSTEM FOR NEPAL"],
      href: "#journey",
      date,
      description: standalone,
      image: "/images/work-4.webp",
      alt: "Aerial view of an ageing prison compound with rusted tin roofs",
    },
    {
      id: "all-works",
      title: ["MORE", "ON THE WAY"],
      href: "#journey",
      date,
      description: "Every project, policy and progress report from the Ministry of Home Affairs.",
      variant: "cta",
      cta: "ALL WORKS",
    },
  ] satisfies Card[],
};

export const manifesto = {
  labels: [
    ["THE LIVE", "GORKHA MANIFESTO"],
    ["DEVELOPMENT PROGRESS", "AT GORKHA-1"],
  ],
  heading: ["The Gorkha manifesto", "in progress"],
  sub: "PROJECTS IN GORKHA-1",
  hint: {
    mouse: "DRAG TO MOVE · SHIFT-DRAG TO TURN · PINCH OR ⌘ + SCROLL TO ZOOM",
    touch: "DRAG SIDEWAYS TO MOVE · TAP A SITE · USE + − TO ZOOM",
  },
  // Real projects in the Gorkha-1 constituency (Tsum Nubri, Dharche, Arughat,
  // Bhimsen Thapa, Gandaki and Shahid Lakhan rural municipalities, Gorkha
  // Municipality wards 1–7), as reported up to October 2026. Status lines
  // follow the cited reports; update them as the work moves on. Site
  // positions are approximate, in map units. No site photos yet: add `image`
  // (and `alt`) once licensed photos are available.
  projects: [
    {
      id: "arughat-bridge",
      name: "Arughat Bridge",
      kind: "bridge",
      status: "ongoing",
      x: 565,
      y: 2180,
      place: "Arughat-9 · Gorkha–Dhading crossing",
      note: "The 11 Oct 2026 flood washed away the Gorkha-side concrete section. The Nepal Army installed a 27 m Bailey bridge on 17–18 Oct as a temporary crossing; no permanent rebuild has been announced.",
      by: "Nepal Army · Gorkha Road Project",
      asOf: "Oct 2026",
      source: {
        name: "Kantipur",
        url: "https://ekantipur.com/gandaki-pradesh/2026/10/19/en/179241263023259812.html",
      },
    },
    {
      id: "soti-khola-bridge",
      name: "Soti Khola Bridge",
      kind: "bridge",
      status: "planned",
      x: 545,
      y: 2080,
      place: "Arughat-2 – Arughat-3",
      note: "The truss bridge linking Arughat wards 2 and 3 was completely washed away by the 11 Oct 2026 flood. No rebuilding timeline has been reported yet.",
      by: "Department of Roads",
      asOf: "Oct 2026",
      source: {
        name: "Ratopati",
        url: "https://english.ratopati.com/story/83297/budhi-gandaki-flood-causes-major-damage-to-bridges-over-arughat-and-soti-rivers-road-department-begins-technical-study",
      },
    },
    {
      id: "benighat-arughat-larke-road",
      name: "Benighat–Arughat–Larke Road",
      kind: "road",
      status: "ongoing",
      x: 760,
      y: 1800,
      place: "Along the Budhi Gandaki, Arughat to Tsum Nubri",
      note: "Track being opened up the Budhi Gandaki valley towards Larke. Silt left by the October 2026 flood was cleared and vehicles are running again on the Soti stretch.",
      by: "Nepal Army · Gorkha Road Project",
      asOf: "Oct 2026",
      source: {
        name: "Kantipur",
        url: "https://ekantipur.com/gandaki-pradesh/2026/10/13/en/vehicles-resume-running-on-arughat-road-after-removal-of-silt-accumulated-by-budhi-gandaki-21-58.html",
      },
    },
    {
      id: "machha-khola-hydropower",
      name: "Machha Khola Hydropower",
      kind: "hydro",
      status: "ongoing",
      x: 670,
      y: 2022,
      place: "Dharche-5 · 16 MW",
      note: "Construction officially began in June 2026. Its access road was damaged in the October 2026 flood.",
      by: "Private developer",
      asOf: "Oct 2026",
      source: {
        name: "Hamro Patro",
        url: "https://www.hamropatro.com/en/news/detail/1317394615048370-construction-of-16-mw-machha-khola-hydropower-project-in-gorkha",
      },
    },
    {
      id: "dobhan-khola-hydropower",
      name: "Dobhan Khola Hydropower",
      kind: "hydro",
      status: "ongoing",
      progress: 4,
      x: 727,
      y: 1930,
      place: "Dharche-1 · 24.5 MW",
      note: "Early stage: civil and hydro-mechanical works and the transmission line have not started. The project's camp and Bailey bridge were damaged in the October 2026 flood.",
      by: "Dobhan Khola Hydropower Ltd.",
      asOf: "2026",
      source: { name: "Dobhan Khola Hydropower", url: "https://dobhankholahydro.com.np/projects/" },
    },
    {
      id: "budhi-gandaki-hydroelectric",
      name: "Budhi Gandaki Hydroelectric",
      kind: "hydro",
      status: "planned",
      x: 530,
      y: 2295,
      place: "Gorkha–Dhading border, near Benighat · 1,200 MW",
      note: "Nepal's planned storage project on the Budhi Gandaki, about 2 km above the Trishuli confluence. Main construction has yet to move forward, and the October 2026 flood has added uncertainty.",
      by: "Government of Nepal",
      asOf: "Oct 2026",
      source: {
        name: "Kantipur",
        url: "https://ekantipur.com/business/2026/10/19/en/floods-further-complicate-budhi-gandaki-hydropower-project-construction-process-04-47.html",
      },
    },
  ] satisfies ManifestoProject[],
  /** Snow peaks of the Himalayan north, in map units (public/svg/nepal-map.svg). */
  peaks: [
    { x: 470, y: 1540, h: 1 },
    { x: 560, y: 1605, h: 0.75 },
    { x: 905, y: 1585, h: 1.25 },
    { x: 985, y: 1612, h: 0.9 },
    { x: 700, y: 1655, h: 0.6 },
    { x: 815, y: 1640, h: 0.8 },
  ],
};

export type ProjectKind = "bridge" | "road" | "school" | "health" | "water" | "power" | "hydro";
export type ProjectStatus = "completed" | "ongoing" | "planned";

export type ManifestoProject = {
  id: string;
  name: string;
  kind: ProjectKind;
  status: ProjectStatus;
  /** Percent complete, only where a source reports it. */
  progress?: number;
  /** Site position in map units (public/svg/nepal-map.svg, viewBox 1728×2529). */
  x: number;
  y: number;
  /** Where (ward / municipality) and size. */
  place: string;
  note: string;
  /** Who is building or running it. */
  by: string;
  /** When the status was last reported. */
  asOf: string;
  source: { name: string; url: string };
  image?: string;
  alt?: string;
};

export const projectKinds: Record<ProjectKind, string> = {
  bridge: "Bridge works",
  road: "Road construction",
  school: "School building",
  health: "Health post",
  water: "Drinking water",
  power: "Electrification",
  hydro: "Hydropower",
};

export const projectStatuses: Record<ProjectStatus, string> = {
  completed: "Completed",
  ongoing: "In progress",
  planned: "Not started",
};

export const news = {
  eyebrow: ["NEWS", "& UPDATES"],
  heading: ["ALL THE LATEST UPDATES", "FROM DIFFERENT MEDIA CHANNELS"],
  cards: [
    {
      id: "archive",
      title: ["EARLIER", "UPDATES"],
      href: "#news",
      date,
      description: "Browse the full archive of press coverage and official statements.",
      variant: "cta",
      cta: "VIEW ARCHIVE",
    },
    {
      id: "news-police-apf",
      title: ["REWORK ON NEPAL POLICE", "& APF AMMUNITION POLICIES"],
      href: "#news",
      date,
      description: standalone,
      image: "/images/work-1.webp",
      alt: "Armed Police Force personnel in blue camouflage marching in formation",
    },
    {
      id: "news-disaster",
      title: ["BETTER PRE-PREPARATION", "AGAINST DISASTERS"],
      href: "#news",
      date,
      description: collaboration,
      image: "/images/work-2.webp",
      alt: "A landslide crashing down a hillside beside a mountain road",
    },
    {
      id: "news-drones",
      title: ["DRONES FOR SECURITY, SURVEILLANCE", "& DISASTER"],
      href: "#news",
      date,
      description: "",
      variant: "quote",
      quote: collaboration,
    },
    {
      id: "news-prison",
      title: ["A MORE MANAGED", "PRISON SYSTEM FOR NEPAL"],
      href: "#news",
      date,
      description: standalone,
      image: "/images/work-4.webp",
      alt: "Aerial view of an ageing prison compound with rusted tin roofs",
    },
  ] satisfies Card[],
};

export const contact = {
  heading: "SEND ME YOUR OPINIONS ON ME OR MY WORK SO I CAN BE MORE EFFECTIVE & EFFICIENT",
  imageAlt: "Sudhan Gurung greeting an elderly woman in red in the hills of Gorkha",
  fields: {
    name: "Your name",
    email: "Email address",
    subject: "Subject",
    message: "Your opinion, idea or concern",
  },
  submit: "SUBMIT",
  thanks: "Thank you. Your message has been received and will be read by the office.",
};

export const footer = {
  office: ["Ministry of Home Affairs", "Singha Durbar, Kathmandu", "Nepal"],
  constituency: ["Member of Parliament", "Gorkha-1"],
  // TODO: replace with the official social profile URLs.
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X / Twitter", href: "#" },
    { label: "YouTube", href: "#" },
  ],
  links: [...nav, { label: "News", href: "#news" }, { label: "Contact", href: "#contact" }],
  copyright: `© ${new Date().getFullYear()} Sudhan Gurung. All rights reserved.`,
};
