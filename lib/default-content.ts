import type { SiteContent } from "@/types/site-content";
import { defaultBuilder } from "@/lib/builder-defaults";

export const defaultContent: SiteContent = {
  home: {
    title: "I'm Usman Iqbal",
    subtitle: "Salesforce Administrator & Developer",
    description:
      "I specialize in Salesforce CRM, automation, web development, AI bots, and modern business solutions.",
    primaryButton: {
      label: "View Projects",
      href: "#projects"
    },
    secondaryButton: {
      label: "Contact Me",
      href: "#contact"
    },
    heroImage: "/images/usman-profile.png",
    profileImage: "/images/usman-profile.png",
    heroTemplate: "layered"
  },
  about: {
    eyebrow: "Founder of NURAXTECH",
    title: "Final-year BSCS student building intelligent CRM systems and digital products.",
    description:
      "I work across Salesforce administration, Salesforce development, CRM customization, automation, reports, dashboards, websites, AI bots, and Android apps. My focus is helping businesses move faster with systems that are clean, reliable, and easy to use.",
    highlights: [
      "Salesforce Admin & Developer",
      "CRM customization and business automation",
      "Reports, dashboards, forms, integrations, and AI bots",
      "Websites, Android apps, and modern digital systems"
    ],
    statistics: [
      { id: "core-skills", value: "16+", label: "Core Skills" },
      { id: "services", value: "10+", label: "Services" },
      { id: "projects", value: "8", label: "Featured Projects" }
    ]
  },
  skills: [
    { id: "salesforce-admin", name: "Salesforce Admin", category: "CRM", level: 95, accent: "#22f0a8" },
    { id: "salesforce-development", name: "Salesforce Development", category: "Apex / Flow", level: 90, accent: "#22d3ee" },
    { id: "salesforce-crm", name: "Salesforce CRM", category: "CRM Strategy", level: 94, accent: "#54f7c7" },
    { id: "litify", name: "Litify", category: "Legal CRM", level: 82, accent: "#76e4f7" },
    { id: "hubspot", name: "HubSpot", category: "CRM", level: 86, accent: "#ff7a59" },
    { id: "zoho-crm", name: "Zoho CRM", category: "CRM", level: 84, accent: "#35d399" },
    { id: "gohighlevel", name: "Go High Level CRM", category: "Automation", level: 83, accent: "#10b981" },
    { id: "dynamics", name: "Microsoft Dynamics", category: "Enterprise CRM", level: 78, accent: "#58a6ff" },
    { id: "oracle-cx", name: "Oracle CX", category: "Customer Experience", level: 76, accent: "#f97316" },
    { id: "html-css-js", name: "HTML, CSS, JavaScript", category: "Frontend", level: 92, accent: "#facc15" },
    { id: "react-next", name: "React / Next.js", category: "Web Apps", level: 88, accent: "#38bdf8" },
    { id: "python", name: "Python", category: "Automation", level: 84, accent: "#22c55e" },
    { id: "sql", name: "SQL", category: "Database", level: 82, accent: "#60a5fa" },
    { id: "firebase", name: "Firebase", category: "Backend", level: 80, accent: "#f59e0b" },
    { id: "android", name: "Android Development", category: "Mobile", level: 78, accent: "#a3e635" },
    { id: "ai-bots", name: "AI Bots / Chatbots", category: "AI Automation", level: 90, accent: "#2dd4bf" }
  ],
  services: [
    {
      id: "salesforce-crm-setup",
      title: "Salesforce CRM Setup",
      description: "Objects, fields, page layouts, users, security, pipelines, and clean CRM foundations."
    },
    {
      id: "salesforce-automation",
      title: "Salesforce Automation",
      description: "Flows, approvals, alerts, assignments, reminders, and end-to-end workflow automation."
    },
    {
      id: "reports-dashboards",
      title: "Reports & Dashboards",
      description: "Executive-ready dashboards, business metrics, sales visibility, and reporting systems."
    },
    {
      id: "litify-customization",
      title: "Litify Customization",
      description: "Matter management, intake flows, legal CRM customization, and process optimization."
    },
    {
      id: "website-development",
      title: "Website Development",
      description: "Responsive business websites, landing pages, portfolios, and modern web experiences."
    },
    {
      id: "android-app-development",
      title: "Android App Development",
      description: "Android apps for operations, student systems, business tracking, and internal tools."
    },
    {
      id: "ai-bots-development",
      title: "AI Bots Development",
      description: "Custom chatbots, lead qualification assistants, automation agents, and support bots."
    },
    {
      id: "crm-integrations",
      title: "CRM Integrations",
      description: "Jotform, websites, forms, APIs, and third-party tools connected into CRM workflows."
    },
    {
      id: "business-automation",
      title: "Business Automation",
      description: "Automated pipelines, document workflows, notifications, data sync, and admin systems."
    },
    {
      id: "portfolio-websites",
      title: "Portfolio Websites",
      description: "Premium personal brands, developer portfolios, service pages, and lead-focused websites."
    }
  ],
  projects: [
    {
      id: "nuraxtech-website",
      title: "NURAXTECH Website",
      description: "A premium brand website for CRM, automation, web, AI bot, and app development services.",
      image: "",
      tags: ["Brand", "Web", "CRM"],
      url: "#"
    },
    {
      id: "salesforce-crm-automation",
      title: "Salesforce CRM Automation",
      description: "Automated lead assignment, reminders, dashboards, and workflow logic for sales teams.",
      image: "",
      tags: ["Salesforce", "Flow", "Automation"],
      url: "#"
    },
    {
      id: "jotform-salesforce",
      title: "Jotform to Salesforce Lead Integration",
      description: "A direct lead capture pipeline that sends validated Jotform submissions into Salesforce.",
      image: "",
      tags: ["Jotform", "Salesforce", "API"],
      url: "#"
    },
    {
      id: "student-management",
      title: "Android Student Management System",
      description: "A mobile system for student records, attendance, academic data, and administrative tasks.",
      image: "",
      tags: ["Android", "Firebase", "Admin"],
      url: "#"
    },
    {
      id: "ai-revenue-checker",
      title: "AI Revenue Checker Bot",
      description: "A smart bot that checks revenue data, answers business questions, and flags insights.",
      image: "",
      tags: ["AI Bot", "Analytics", "Automation"],
      url: "#"
    },
    {
      id: "store-pos",
      title: "Store Management POS System",
      description: "Inventory, sales, reports, and daily store operations in one clean management system.",
      image: "",
      tags: ["POS", "Reports", "SQL"],
      url: "#"
    },
    {
      id: "formfill-pro",
      title: "FormFill Pro PDF Automation",
      description: "Automated PDF generation and form filling for repeat documents and business paperwork.",
      image: "",
      tags: ["PDF", "Automation", "Forms"],
      url: "#"
    },
    {
      id: "portfolio-website",
      title: "Portfolio Website",
      description: "A fast, responsive portfolio with smooth animations, modern design, and editable content.",
      image: "",
      tags: ["Next.js", "Tailwind", "Admin"],
      url: "#"
    }
  ],
  contact: {
    email: "hello@nuraxtech.com",
    phone: "+92 300 0000000",
    location: "Pakistan",
    formHeadline: "Let's build a CRM, automation, or web system that feels effortless to run.",
    googleMapUrl: "",
    formFields: ["Name", "Email", "Project Type", "Message"]
  },
  socials: [
    { id: "linkedin", platform: "LinkedIn", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { id: "github", platform: "GitHub", label: "GitHub", url: "https://github.com/" },
    { id: "fiverr", platform: "Fiverr", label: "Fiverr", url: "https://www.fiverr.com/" },
    { id: "instagram", platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/" }
  ],
  theme: {
    primary: "#16f2a4",
    secondary: "#22d3ee",
    accent: "#a7f3d0",
    animations: true
  },
  sliders: {
    heroSlides: [
      "Salesforce dashboards",
      "CRM automation flows",
      "AI chatbot systems",
      "Modern websites"
    ],
    projectSlides: [
      "Lead generation systems",
      "Revenue checker bots",
      "PDF workflow automation",
      "Android business apps"
    ]
  },
  builder: defaultBuilder
};
