import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Martyrs from "@/components/Martyrs";
import About from "@/components/About";
import Works from "@/components/Works";
import News from "@/components/News";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageMotion from "@/components/motion/PageMotion";
import { site } from "@/data/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: "Sudhan Gurung",
      givenName: "Sudhan",
      familyName: "Gurung",
      jobTitle: "Home Minister of Nepal",
      description: site.description,
      url: site.url,
      image: `${site.url}/images/person-front.webp`,
      nationality: { "@type": "Country", name: "Nepal" },
      worksFor: {
        "@type": "GovernmentOrganization",
        name: "Ministry of Home Affairs, Government of Nepal",
        address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
      },
      hasOccupation: [
        { "@type": "Occupation", name: "Home Minister" },
        { "@type": "Occupation", name: "Member of Parliament", description: "Gorkha" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: `${site.name} — Official Portfolio`,
      inLanguage: "en",
      about: { "@id": `${site.url}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/#page`,
      url: site.url,
      name: site.title,
      description: site.description,
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: { "@id": `${site.url}/#person` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main id="main">
        <Hero />
        <Martyrs />
        <About />
        <Works />
        <News />
        <Contact />
      </main>
      <Footer />
      <PageMotion />
    </>
  );
}
