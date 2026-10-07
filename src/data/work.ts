export interface Project {
  slug: string;
  title: string;
  line: string;
  body: string[];
}

// Carried over from the old site; to be lightly rewritten.
export const projects: Project[] = [
  {
    slug: "student-arrivals",
    title: "Student arrivals system",
    line: "An intake system for students arriving during COVID.",
    body: [
      "During COVID I built a full intake system: automated forms for returning and incoming students, call-centre data brought in alongside them, and workflows that pulled everything into live dashboards.",
      "The government ended up using it for quarantine planning, which was surreal.",
    ],
  },
  {
    slug: "engagement-data-hub",
    title: "Engagement data hub",
    line: "One place for data that used to live in scattered spreadsheets.",
    body: [
      "A central platform that replaced scattered spreadsheets and siloed data across teams.",
      "I built the data architecture, automated the pipelines and made dashboards, so people could find answers without hunting through files or emailing me.",
    ],
  },
  {
    slug: "events-platform",
    title: "Events and activity platform",
    line: "A single source of truth for events and activities.",
    body: [
      "An app for admins to track events and activities in one place, with an event calendar, automatic calendar invites and reporting.",
      "It sounds boring, but it ended a lot of chaos.",
    ],
  },
];
