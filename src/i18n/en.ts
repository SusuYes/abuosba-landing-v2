export const en = {
  nav: {
    about: "About",
    experience: "What I Do",
    contact: "Say Hi",
    linkedin: "LinkedIn",
  },
  social: {
    linkedinUrl: "https://www.linkedin.com/in/abuosba",
  },
  hero: {
    brand: "Abuosba",
    headlineA: "Hey, I'm Suhail.",
    headlineB: "Welcome.",
    blurb:
      "I make dashboards, untangle messy data, and help students figure things out. This is my little corner of the internet. Thanks for stopping by.",
    ctaPrimary: "Say hello",
    ctaSecondary: "Email me",
    focus: "Currently into",
    focusItems: [
      { k: "Process design", v: "solving problems by building systems" },
      { k: "Maker stuff", v: "3D printing, smart home, tinkering" },
      { k: "Vibe coding", v: "building things that feel right" },
    ],
    note: "",
  },
  about: {
    title: "About",
    subtitle: "The short version",
    body:
      "I work in higher education, where I build systems, automate workflows, and make sense of messy data - all to help students have a better experience. I spend a lot of time coding and connecting things through APIs. When I have time, I freelance with an NGO on community projects. Outside of work, I tinker with tech - 3D printing, smart home setups, and coding side projects. I like clear thinking, practical tools, and probably too much coffee.",
  },
  experience: {
    title: "What I Do",
    subtitle: "The day-to-day stuff",
    items: [
      {
        role: "Higher ed data & systems person",
        org: "",
        range: "",
        blurb: "Building dashboards, automating workflows, and making student services actually work. Lots of coding, Power Platform (BI, Automate, Apps), and connecting systems through APIs. Also the 'can you add this to the report?' guy.",
      },
      {
        role: "NGO freelancer",
        org: "",
        range: "",
        blurb: "When I have time, I help out with community and cultural projects. Tech setup, process improvement, that kind of thing.",
      },
    ],
  },
  skills: {
    title: "",
    subtitle: "",
    groups: [],
  },
  projects: {
    title: "Things I've Built",
    subtitle: "Some stuff I'm happy I got to work on",
    items: [
      {
        key: "arrivalsDashboard",
        icon: "compass",
        title: "Student arrivals system",
        summary:
          "Built a full intake system during COVID - automated forms for returning and incoming students, call center data integration, and workflows that pulled everything into live dashboards. The government actually used it for quarantine planning, which was kind of surreal.",
      },
      {
        key: "engagementHub",
        icon: "folder",
        title: "Engagement data hub",
        summary:
          "A central platform that replaced scattered spreadsheets and siloed data across teams. Built the data architecture, automated the pipelines, and created dashboards so people could actually find insights without hunting through files or emailing me.",
      },
      {
        key: "activityApp",
        icon: "pin",
        title: "Events & activity platform",
        summary:
          "An app for admins to track events and activities in one place - the single source of truth. Includes an event calendar, automated calendar invites, and reporting. Sounds boring, but it ended a lot of chaos.",
      },
    ],
  },
  contact: {
    title: "Let's Chat",
    subtitle: "I promise I reply. Coffee's on me (virtually).",
    email: "suhail@abuosba.com",
    form: {
      name: "Name",
      email: "Email",
      message: "Message",
      namePh: "Your name",
      emailPh: "you@domain.com",
      messagePh: "Say hi, ask a question, or tell me about your latest rabbit hole...",
      send: "Send",
      fallback: "",
      sendTitle: "Send a message",
    },
  },
  footer: {
    copyright: "© {year} Abuosba",
  },
} as const;
