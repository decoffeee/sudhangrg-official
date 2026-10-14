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
  sub: "ONGOING PROJECTS",
  projects: ["Project A", "Project B", "Project C", "Project D", "Project E", "Project F", "Project G"],
  /** Marker positions in design units, relative to the works section (Figma y − 4021). */
  markers: [
    { x: 545, y: 2207, label: "Project A" },
    { x: 630, y: 1785, label: "Project B" },
    { x: 883, y: 1692, label: "Project C" },
    { x: 857, y: 1663, label: "Project D" },
    { x: 938, y: 1627, label: "Project E" },
    { x: 938, y: 1602, label: "Project F" },
  ],
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
