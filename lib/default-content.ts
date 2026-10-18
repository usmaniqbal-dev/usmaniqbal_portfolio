import type { SiteContent } from "@/types/site-content";
import { defaultBuilder } from "@/lib/builder-defaults";

export const defaultContent: SiteContent = {
  seo: {
    title: "Usman Iqbal | Salesforce Administrator & Developer",
    description:
      "Usman Iqbal is a Salesforce Administrator and Salesforce Developer specializing in Salesforce CRM, Salesforce Automation, and reliable digital solutions.",
    keywords: [
      "Usman Iqbal",
      "Usman",
      "About Usman Iqbal",
      "Usman Iqbal portfolio",
      "Salesforce Administrator Usman Iqbal",
      "Salesforce Developer Usman Iqbal",
      "Salesforce CRM",
      "Salesforce Automation",
      "NURAXTECH",
      "CRM Specialist",
      "Web Developer",
      "AI Bots Developer"
    ],
    canonicalUrl: "https://www.usmaniqbal.tech",
    ogImage: "/images/usman-hero.png",
    author: "Usman Iqbal"
  },
  home: {
    title: "Usman Iqbal",
    subtitle: "Salesforce Administrator & Developer",
    description:
      "I am Usman Iqbal, a Salesforce Administrator, Salesforce Developer and CRM consultant specializing in Salesforce CRM, Salesforce Automation, web development, AI bots, and reliable business solutions.",
    primaryButton: {
      label: "View Projects",
      href: "/projects"
    },
    secondaryButton: {
      label: "Contact Me",
      href: "/contact"
    },
    heroImage: "/images/usman-hero.png",
    profileImage: "/images/usman-hero.png",
    heroTemplate: "layered"
  },
  about: {
    eyebrow: "Founder of NURAXTECH",
    title: "Usman Iqbal builds reliable Salesforce CRM and digital solutions.",
    description:
      "I work across Salesforce administration, Salesforce development, Salesforce CRM customization, Salesforce Automation, reports, dashboards, websites, AI bots, and Android apps. My focus is helping businesses move faster with systems that are clean, reliable, and easy to use.",
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
        "id": "salesforce-business-process-automation",
        "title": "Salesforce Business Process Automation",
        "category": "Salesforce & CRM Projects",
        "description": "Automates business processes using Salesforce Flows, approval processes, validation rules, notifications, and record updates. Includes CRM customization, dashboards, reporting, and workflow management.",
        "image": "/images/projects/salesforce-automation.jpg",
        "tags": [
            "Salesforce",
            "Flows",
            "Automation",
            "CRM"
        ],
        "url": "#"
    },
    {
        "id": "real-estate-crm-dashboard",
        "title": "Real Estate CRM Dashboard",
        "category": "Salesforce & CRM Projects",
        "description": "Manages real estate leads, customers, properties, deals, and business activities through a centralized CRM dashboard. Includes lead tracking, sales pipeline management, and automated follow-ups.",
        "image": "/images/projects/real-estate-crm.jpg",
        "tags": [
            "Real Estate",
            "CRM",
            "Dashboard",
            "Lead Tracking"
        ],
        "url": "#"
    },
    {
        "id": "parent-guardian-student-application-system",
        "title": "Parent/Guardian & Student Application System",
        "category": "Salesforce & CRM Projects",
        "description": "A Salesforce application for managing parents, students, campuses, programs, and academic-year applications. Supports program management for After School and Summer Day Camp applications.",
        "image": "/images/projects/student-application.jpg",
        "tags": [
            "Salesforce",
            "Education",
            "Application Portal",
            "Workflow"
        ],
        "url": "#"
    },
    {
        "id": "capricorn-coffee-case-management",
        "title": "Capricorn Coffee Equipment Case Management",
        "category": "Salesforce & CRM Projects",
        "description": "A Salesforce Agentforce project for retrieving store and equipment information and managing support cases. Uses AI agents, subagents, and automation to assist with equipment-related inquiries.",
        "image": "/images/projects/capricorn-coffee.jpg",
        "tags": [
            "Agentforce",
            "Salesforce AI",
            "Case Management",
            "Subagents"
        ],
        "url": "#"
    },
    {
        "id": "gohighlevel-funnel-workflow-automation",
        "title": "GoHighLevel Funnel & Workflow Automation",
        "category": "Salesforce & CRM Projects",
        "description": "A lead-generation project involving funnel duplication, opt-in forms, privacy disclaimers, and automated follow-up sequences. Focuses on lead capture, contact management, and marketing automation.",
        "image": "/images/projects/ghl-funnel.jpg",
        "tags": [
            "GoHighLevel",
            "Funnels",
            "Marketing Automation",
            "Lead Gen"
        ],
        "url": "#"
    },
    {
        "id": "nurax-crm-multi-agent",
        "title": "NURAX CRM — AI-Powered Multi-Agent CRM",
        "category": "Salesforce & CRM Projects",
        "description": "A proposed CRM platform combining lead management, sales pipelines, AI agents, predictive analytics, and workflow automation. Aims to offer multiple AI agents working on different CRM tasks with custom branding and integrations.",
        "image": "/images/projects/nurax-crm.jpg",
        "tags": [
            "AI CRM",
            "Multi-Agent",
            "Predictive Analytics",
            "Pipelines"
        ],
        "url": "#"
    },
    {
        "id": "salesforce-crm-integration-ecosystem",
        "title": "Salesforce CRM Integration Ecosystem",
        "category": "Salesforce & CRM Projects",
        "description": "A CRM integration concept connecting Salesforce with websites, mobile applications, email platforms, communication tools, payment systems, and AI services. Focuses on unified business data and automated cross-platform workflows.",
        "image": "/images/projects/salesforce-ecosystem.jpg",
        "tags": [
            "Integration",
            "APIs",
            "Salesforce",
            "Ecosystem"
        ],
        "url": "#"
    },
    {
        "id": "urdu-speech-dataset-pipeline",
        "title": "Urdu Speech Dataset Pipeline",
        "category": "AI, Machine Learning & Python Projects",
        "description": "A Python tool for collecting, processing, splitting, renaming, and organizing Urdu speech recordings into structured datasets. Supports speech technology research and audio dataset preparation.",
        "image": "/images/projects/urdu-speech-pipeline.jpg",
        "tags": [
            "Python",
            "Speech AI",
            "Dataset",
            "Audio Processing"
        ],
        "url": "https://github.com/usmaniqbal-dev/Urdu-Speech-Dataset-Pipeline",
        "githubUrl": "https://github.com/usmaniqbal-dev/Urdu-Speech-Dataset-Pipeline"
    },
    {
        "id": "youtube-audio-splitting-transcription",
        "title": "YouTube Audio Splitting & Transcription",
        "category": "AI, Machine Learning & Python Projects",
        "description": "A Python workflow for extracting audio from YouTube videos, splitting it into 45-second clips, and transcribing speech. Organizes processed audio and transcripts using sequential filenames.",
        "image": "/images/projects/youtube-transcription.jpg",
        "tags": [
            "Python",
            "Whisper",
            "Transcription",
            "Audio Splitting"
        ],
        "url": "#"
    },
    {
        "id": "chatbot-ai-application",
        "title": "Chatbot.AI — AI Chatbot Application",
        "category": "AI, Machine Learning & Python Projects",
        "description": "An AI chatbot with API integration, a graphical interface, sidebar navigation, and new-chat functionality. Designed to provide an interactive conversational experience.",
        "image": "/images/projects/chatbot-ai.jpg",
        "tags": [
            "AI Chatbot",
            "LLM",
            "NLP",
            "Conversational AI"
        ],
        "url": "#"
    },
    {
        "id": "urdu-ai-voice-generation-tool",
        "title": "Urdu AI Voice Generation Tool",
        "category": "AI, Machine Learning & Python Projects",
        "description": "An AI-based tool concept for converting Urdu text into natural-sounding speech. Aims to support custom voice training, audio generation, and speech dataset creation.",
        "image": "/images/projects/urdu-voice-generator.jpg",
        "tags": [
            "Text-to-Speech",
            "Voice AI",
            "Urdu TTS",
            "Deep Learning"
        ],
        "url": "#"
    },
    {
        "id": "skin-cancer-detection-system",
        "title": "Skin Cancer Detection System",
        "category": "AI, Machine Learning & Python Projects",
        "description": "An AI/ML application using the HAM10000 dataset and a proposed MobileNetV2 model with TensorFlow. Classifies skin lesion images for research into AI-assisted skin disease detection.",
        "image": "/images/projects/skin-cancer-detection.jpg",
        "tags": [
            "TensorFlow",
            "MobileNetV2",
            "Computer Vision",
            "Healthcare AI"
        ],
        "url": "#"
    },
    {
        "id": "tauric-trading-agents",
        "title": "Tauric TradingAgents",
        "category": "AI, Machine Learning & Python Projects",
        "description": "An AI-powered financial research project based on the TradingAgents framework. Explores multiple specialized agents for financial analysis and trading-related decision support.",
        "image": "/images/projects/tauric-trading-agents.jpg",
        "tags": [
            "Multi-Agent AI",
            "FinTech",
            "Trading Agents",
            "Quantitative"
        ],
        "url": "#"
    },
    {
        "id": "revenue-checker-ai",
        "title": "Revenue Checker AI",
        "category": "AI, Machine Learning & Python Projects",
        "description": "An AI-powered document processing tool that extracts monthly deposits and revenue totals from bank statement PDFs. Includes duplicate detection, folder-based processing, and Excel report generation.",
        "image": "/images/projects/revenue-checker-ai.jpg",
        "tags": [
            "Document AI",
            "PDF Processing",
            "Finance",
            "Python"
        ],
        "url": "#"
    },
    {
        "id": "nuraxflow-ai-automation",
        "title": "NuraxFlow AI — Workflow Automation",
        "category": "AI, Machine Learning & Python Projects",
        "description": "A proposed AI automation platform for connecting business applications and automating repetitive processes. Planned capabilities include document processing, approvals, integrations, and workflow monitoring.",
        "image": "/images/projects/nuraxflow-ai.jpg",
        "tags": [
            "AI Automation",
            "Workflow Engine",
            "Orchestration",
            "SaaS"
        ],
        "url": "#"
    },
    {
        "id": "usman-iqbal-portfolio-website",
        "title": "Usman Iqbal Portfolio Website",
        "category": "Web & Mobile Application Projects",
        "description": "A professional portfolio showcasing Salesforce, CRM consulting, AI, automation, and full-stack development expertise. Includes SEO optimization, content management, security improvements, and visitor tracking.",
        "image": "/images/projects/usman-portfolio.jpg",
        "tags": [
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "SEO"
        ],
        "url": "https://www.usmaniqbal.tech"
    },
    {
        "id": "nuraxtech-company-website",
        "title": "NuraxTech Company Website",
        "category": "Web & Mobile Application Projects",
        "description": "A business website presenting services in Salesforce, CRM solutions, AI integration, workflow automation, and custom software development. Supports company branding, service promotion, and international client acquisition.",
        "image": "/images/projects/nuraxtech-company.jpg",
        "tags": [
            "Corporate Web",
            "Branding",
            "CRM Services",
            "Next.js"
        ],
        "url": "https://nuraxtech.com"
    },
    {
        "id": "mian-rent-a-car-website",
        "title": "Mian Rent A Car Website",
        "category": "Web & Mobile Application Projects",
        "description": "A car rental website for displaying vehicles and providing rental information to customers. Includes an admin panel concept for managing vehicles, bookings, and website content.",
        "image": "/images/projects/mian-rent-a-car.jpg",
        "tags": [
            "Car Rental",
            "Booking System",
            "Admin Panel",
            "Full Stack"
        ],
        "url": "#"
    },
    {
        "id": "pettrackingcare-android-app",
        "title": "PetTrackingCare — Android Application",
        "category": "Web & Mobile Application Projects",
        "description": "An Android application built around Java and XML for pet tracking and pet-care management. Designed to organize pet information and support everyday pet-care activities.",
        "image": "/images/projects/pet-tracking-care.jpg",
        "tags": [
            "Android",
            "Java",
            "Mobile App",
            "Pet Care"
        ],
        "url": "#"
    },
    {
        "id": "neobank-digital-banking-app",
        "title": "NeoBank — Digital Banking Application",
        "category": "Web & Mobile Application Projects",
        "description": "A proposed digital banking application inspired by services such as Easypaisa and JazzCash. Aims to provide convenient digital financial services and account-related functionality.",
        "image": "/images/projects/neobank-app.jpg",
        "tags": [
            "FinTech",
            "Mobile Banking",
            "Wallet",
            "UI/UX"
        ],
        "url": "#"
    },
    {
        "id": "digital-store-ecommerce",
        "title": "Digital Store — E-commerce Website",
        "category": "Web & Mobile Application Projects",
        "description": "A web-based online store developed using PHP, MySQL, and XAMPP. Supports database-driven store functionality and online product management.",
        "image": "/images/projects/digital-store.jpg",
        "tags": [
            "E-commerce",
            "PHP",
            "MySQL",
            "Online Store"
        ],
        "url": "#"
    },
    {
        "id": "fashiony-ogs-fashion-website",
        "title": "Fashiony OGS — Fashion Website",
        "category": "Web & Mobile Application Projects",
        "description": "A fashion-related web development project connected to a MySQL database named fashiony_ogs. Uses a local XAMPP environment for development and database management.",
        "image": "/images/projects/fashiony-ogs.jpg",
        "tags": [
            "Fashion",
            "Web Design",
            "PHP",
            "MySQL"
        ],
        "url": "#"
    },
    {
        "id": "pdf-text-converter-app",
        "title": "PDF Text Converter App",
        "category": "Web & Mobile Application Projects",
        "description": "A document-processing application designed to extract and convert text from PDF files. Developed as a software project using a VS Code development environment.",
        "image": "/images/projects/pdf-text-converter.jpg",
        "tags": [
            "PDF Processing",
            "Document Tool",
            "Utility",
            "Automation"
        ],
        "url": "#"
    },
    {
        "id": "pos-store-management-system",
        "title": "POS & Store Management System",
        "category": "Web & Mobile Application Projects",
        "description": "A desktop application concept built around Electron, Node.js, Prisma, and database technologies. Designed to manage products, inventory, sales transactions, and store operations.",
        "image": "/images/projects/pos-management.jpg",
        "tags": [
            "Electron",
            "Desktop App",
            "POS",
            "Prisma"
        ],
        "url": "#"
    },
    {
        "id": "ai-voice-agent-website",
        "title": "AI Voice Agent Website",
        "category": "Web & Mobile Application Projects",
        "description": "A website concept featuring AI voice agents for real estate and e-commerce businesses. Focuses on conversational customer support, answering inquiries, and lead engagement.",
        "image": "/images/projects/ai-voice-agent.jpg",
        "tags": [
            "Voice AI",
            "Interactive Web",
            "Real Estate",
            "Conversational"
        ],
        "url": "#"
    },
    {
        "id": "ai-chatbot-android-app",
        "title": "AI Chatbot Android Application",
        "category": "Web & Mobile Application Projects",
        "description": "A mobile application concept integrating AI chatbot functionality with restaurant and fashion e-commerce interfaces. Explores conversational AI for customer assistance and mobile business experiences.",
        "image": "/images/projects/ai-chatbot-android.jpg",
        "tags": [
            "Android",
            "AI Assistant",
            "E-commerce",
            "Mobile AI"
        ],
        "url": "#"
    },
    {
        "id": "custom-business-applications-dashboards",
        "title": "Custom Business Applications & Dashboards",
        "category": "Web & Mobile Application Projects",
        "description": "A collection of application concepts covering restaurant interfaces, e-commerce screens, automotive dashboards, and business tools. Focuses on user interface design and practical software solutions for different industries.",
        "image": "/images/projects/custom-dashboards.jpg",
        "tags": [
            "Dashboards",
            "Business Apps",
            "UI/UX",
            "Analytics"
        ],
        "url": "#"
    },
    {
        "id": "portfolio-admin-panel-emailjs",
        "title": "Portfolio Admin Panel & EmailJS Integration",
        "category": "Web & Mobile Application Projects",
        "description": "An administrative system for managing portfolio content and configuring EmailJS integration settings. Includes security improvements and exploration of authenticator-based two-factor authentication.",
        "image": "/images/projects/portfolio-admin-panel.jpg",
        "tags": [
            "Admin Panel",
            "EmailJS",
            "Security",
            "2FA"
        ],
        "url": "#"
    },
    {
        "id": "real-time-traffic-light-control",
        "title": "Real-Time Traffic Light Control via Flow Density",
        "category": "Academic & Social Impact Projects",
        "description": "An AI-based traffic management system that uses CCTV feeds to estimate vehicle density at intersections. Adjusts green-light duration dynamically to reduce congestion and prioritize busy lanes.",
        "image": "/images/projects/traffic-light-control.jpg",
        "tags": [
            "Computer Vision",
            "Smart City",
            "AI Traffic",
            "IoT"
        ],
        "url": "#"
    },
    {
        "id": "food-donation-ngo-coordination",
        "title": "Food Donation & NGO Coordination Platform",
        "category": "Academic & Social Impact Projects",
        "description": "A social-impact platform connecting restaurants with NGOs to distribute surplus food to people in need. Supports food listings, NGO registration, collection coordination, and donation management.",
        "image": "/images/projects/food-donation-platform.jpg",
        "tags": [
            "Social Impact",
            "Food Rescue",
            "NGO Platform",
            "Sustainability"
        ],
        "url": "#"
    },
    {
        "id": "library-management-system",
        "title": "Library Management System",
        "category": "Academic & Social Impact Projects",
        "description": "A C++ application for managing library books, student records, book issuance, and returns. Demonstrates programming fundamentals and object-oriented concepts.",
        "image": "/images/projects/library-management.jpg",
        "tags": [
            "C++",
            "OOP",
            "Data Structures",
            "Academic"
        ],
        "url": "#"
    },
    {
        "id": "banking-management-system",
        "title": "Banking Management System",
        "category": "Academic & Social Impact Projects",
        "description": "An academic application for managing customer accounts and basic banking operations. Focuses on programming logic and object-oriented software development.",
        "image": "/images/projects/banking-management.jpg",
        "tags": [
            "C++",
            "OOP",
            "Banking System",
            "Academic"
        ],
        "url": "#"
    },
    {
        "id": "student-management-system",
        "title": "Student Management System",
        "category": "Academic & Social Impact Projects",
        "description": "A student information management application for organizing student records and academic details. Explores database operations and record management using PHP/MySQL or related technologies.",
        "image": "/images/projects/student-management.jpg",
        "tags": [
            "PHP",
            "MySQL",
            "Education",
            "Student Info"
        ],
        "url": "#"
    },
    {
        "id": "lifeproof-ai-evidence-verification",
        "title": "LifeProof AI — Evidence Verification Platform",
        "category": "Academic & Social Impact Projects",
        "description": "A proposed platform for organizing evidence and documenting disputes in a structured format. Explores AI-assisted analysis, evidence management, and verification workflows.",
        "image": "/images/projects/lifeproof-ai.jpg",
        "tags": [
            "LegalTech",
            "AI Verification",
            "Evidence Management",
            "Integrity"
        ],
        "url": "#"
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
    { id: "linkedin", platform: "LinkedIn", label: "LinkedIn", url: "https://linkedin.com/in/usmaniqbalnurax" },
    { id: "github", platform: "GitHub", label: "GitHub", url: "https://github.com/usmaniqbal-dev" },
    { id: "trailblazer", platform: "Salesforce Trailblazer", label: "Trailblazer", url: "https://www.salesforce.com/trailblazer/usmaniqbal" },
    { id: "fiverr", platform: "Fiverr", label: "Fiverr", url: "https://www.fiverr.com/" },
    { id: "instagram", platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/" }
  ],
  theme: {
    primary: "#00DCA0",
    secondary: "#00DCA0",
    accent: "#00DCA0",
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
