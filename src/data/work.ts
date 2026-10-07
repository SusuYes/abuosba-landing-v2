export interface Project {
  slug: string;
  title: string;
  line: string;   // one line for cards and the page's lede
  tags: string[];
  body: string[];
}

export const projects: Project[] = [
  {
    slug: "student-arrivals",
    title: "Student arrivals",
    line: "A COVID intake system that ended up in the government's quarantine planning.",
    tags: ["Automation", "Dashboards"],
    body: [
      "When COVID hit, thousands of students still had to get back to campus, and nobody had one view of who was coming, from where, or when.",
      "I built the intake end to end: automated forms for returning and incoming students, call-centre data flowing in beside them, and workflows that fed it all into live dashboards.",
      "Then the government started using it to plan quarantine. Surreal, and the best kind of scope creep.",
    ],
  },
  {
    slug: "engagement-data-hub",
    title: "Engagement hub",
    line: "Scattered spreadsheets in, one place for answers out.",
    tags: ["Data architecture", "Pipelines"],
    body: [
      "Every team kept its own spreadsheet, and every question meant emailing three people and waiting.",
      "I designed the data model, automated the pipelines and built the dashboards on top, so the answer is now one click away instead of three emails.",
    ],
  },
  {
    slug: "events-platform",
    title: "Events platform",
    line: "Every event in one place. Calendar invites included, chaos retired.",
    tags: ["App", "Reporting"],
    body: [
      "Events and activities were tracked everywhere and nowhere.",
      "I built one app for admins: a shared calendar, invites that send themselves, and reporting that writes itself.",
      "It sounds boring. It ended a lot of chaos.",
    ],
  },
];
