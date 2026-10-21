export interface Service {
  slug: string; title: string; short: string; description: string; problem: string;
  solution: string; useCases: string[]; capabilities: string[]; icon: string; number: string;
}
export interface Course {
  slug: string; title: string; summary: string; category: string; modules: string[];
  projects: string[]; outcomes: string[]; audience: string; prerequisites: string;
  career: string; technologies: string[];
}

export const SERVICES: Service[] = [
  { slug: 'web-development', title: 'Web Applications and Portals', short: 'Business websites and useful web products.', description: 'Business websites, customer portals and operational web applications designed around usability and maintainability.', problem: 'Slow, confusing or disconnected digital experiences make it harder for customers and teams to get things done.', solution: 'We plan and build responsive web experiences around real user needs, existing workflows and the next stage of your business.', useCases: ['Corporate and service websites', 'Customer and partner portals', 'Internal operational tools'], capabilities: ['Responsive interfaces', 'Accessible interaction patterns', 'Maintainable application architecture'], icon: 'web', number: '01' },
  { slug: 'software-development', title: 'Custom Software Development', short: 'Software that fits the way your business works.', description: 'Workflow automation, approvals, reporting, inventory, operational systems and tailored business software.', problem: 'Spreadsheets and repetitive manual steps can make essential workflows difficult to track and improve.', solution: 'We map the process first, then shape a software solution that supports the people who use it every day.', useCases: ['Approvals and task workflows', 'Inventory and record management', 'Operational reporting'], capabilities: ['Requirements and workflow discovery', 'Business rules and data modeling', 'Iterative implementation and testing'], icon: 'software', number: '02' },
  { slug: 'mobile-app-development', title: 'Mobile App Development', short: 'Thoughtful mobile experiences for people on the move.', description: 'Mobile applications for customers, internal teams and field operations, shaped around the requirements of each project.', problem: 'Mobile users need clear, reliable access to the tasks and information that matter while away from a desk.', solution: 'We help define the right mobile approach, then design and build focused applications with practical user flows.', useCases: ['Customer-facing mobile experiences', 'Field and operations workflows', 'Companion apps for digital services'], capabilities: ['Mobile-first interaction design', 'API-connected application flows', 'Device testing and release support'], icon: 'mobile', number: '03' },
  { slug: 'ecommerce', title: 'E-commerce Solutions', short: 'Clear product discovery and commerce workflows.', description: 'Online storefronts, product catalogues, enquiry-led commerce and transactional shopping experiences.', problem: 'An online catalogue can be difficult to browse, update and connect to the way a business handles orders.', solution: 'We build commerce experiences that make products easier to explore and business processes easier to manage.', useCases: ['Product catalogues', 'Enquiry-led selling', 'Online storefronts'], capabilities: ['Product and collection structures', 'Responsive shopping experiences', 'Integration planning for business systems'], icon: 'commerce', number: '04' },
  { slug: 'branding-digital-marketing', title: 'Branding and Digital Promotion', short: 'A consistent digital presence with a clear purpose.', description: 'Brand positioning, digital presentation and online promotional strategies grounded in your business goals.', problem: 'Inconsistent messaging can make it harder for the right audience to understand what a business offers.', solution: 'We help bring brand presentation and digital promotion together with useful, audience-led communication.', useCases: ['Brand and website refreshes', 'Campaign landing pages', 'Digital content planning'], capabilities: ['Digital brand presentation', 'Campaign and content direction', 'Consistent cross-channel messaging'], icon: 'brand', number: '05' },
  { slug: 'seo-smo', title: 'SEO and SMO', short: 'Make useful content easier to discover.', description: 'Search optimization, technical SEO, content discoverability and social media optimization.', problem: 'A good service or product is less useful online when pages are unclear, technically weak or hard to find.', solution: 'We review the foundations of discoverability and prioritize improvements around your audience and content.', useCases: ['Technical and on-page SEO reviews', 'Search-friendly website structure', 'Social content discoverability'], capabilities: ['Semantic page structure', 'Metadata and internal-link planning', 'Technical optimization guidance'], icon: 'search', number: '06' },
  { slug: 'bulk-sms', title: 'Bulk SMS and Business Messaging', short: 'Practical messaging for customer communication.', description: 'Transactional notifications, customer communication and campaign messaging, subject to provider capabilities and applicable regulations.', problem: 'Important customer updates can get lost when communication is inconsistent or disconnected from business events.', solution: 'We help plan messaging flows and provider integrations that fit the purpose, consent and compliance requirements.', useCases: ['Transactional status notifications', 'Customer updates', 'Permission-based campaigns'], capabilities: ['Messaging workflow design', 'Provider integration planning', 'Consent and compliance considerations'], icon: 'messaging', number: '07' },
  { slug: 'domain-hosting', title: 'Domain and Hosting', short: 'Practical help to get your digital product online.', description: 'Domain configuration, hosting setup, SSL, deployment and maintenance assistance.', problem: 'Deployment and hosting details can distract teams from their product and create avoidable operational friction.', solution: 'We assist with deployment planning, hosting setup and ongoing maintenance within an agreed service scope.', useCases: ['Website deployment', 'Domain and SSL configuration', 'Ongoing maintenance planning'], capabilities: ['Deployment setup', 'Environment configuration', 'Business-hours support options'], icon: 'hosting', number: '08' }
];

export const COURSES: Course[] = [
  { slug: 'frontend-ui-engineering', title: 'Frontend and UI Engineering', summary: 'Build a strong foundation in the languages and patterns behind modern web interfaces.', category: 'Frontend', modules: ['HTML and semantic structure', 'CSS and responsive layouts', 'JavaScript fundamentals', 'TypeScript essentials', 'Angular and component architecture', 'Accessible interface development'], projects: ['Responsive multi-page website', 'Interactive data-driven interface'], outcomes: ['Structure accessible web pages', 'Build responsive interfaces', 'Organize UI code into reusable components'], audience: 'Beginners, students and developers building frontend foundations.', prerequisites: 'No prior framework experience is assumed; comfort using a computer is helpful.', career: 'Junior Frontend Developer / UI Engineer', technologies: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Angular'] },
  { slug: 'java-full-stack-development', title: 'Java Full Stack Development', summary: 'Learn Java fundamentals and connect application logic to web and relational data workflows.', category: 'Backend', modules: ['Core Java and object-oriented programming', 'Collections and Java Streams', 'JSP and Servlets', 'JDBC and database connectivity', 'SQL and relational data', 'Application integration'], projects: ['Java application with persistent records', 'Servlet-based information workflow'], outcomes: ['Write structured Java programs', 'Work with relational data using SQL and JDBC', 'Understand server-side web application foundations'], audience: 'Learners interested in Java application and backend development.', prerequisites: 'Basic computer literacy; programming experience is helpful but not required.', career: 'Java Developer / Full Stack Developer', technologies: ['Java', 'JSP', 'Servlets', 'JDBC', 'SQL'] },
  { slug: 'spring-ecosystem-data', title: 'Spring Ecosystem and Data', summary: 'Explore the Spring ecosystem for data-backed services and REST APIs.', category: 'Backend', modules: ['Spring Framework foundations', 'Spring Boot applications', 'REST API design', 'Spring Data JPA', 'Hibernate and persistence', 'MongoDB fundamentals'], projects: ['REST API with relational persistence', 'Document-data integration exercise'], outcomes: ['Structure a Spring Boot service', 'Build REST endpoints', 'Connect application models to data stores'], audience: 'Learners with basic programming experience exploring Java backends.', prerequisites: 'Basic Java and object-oriented programming are recommended.', career: 'Backend Developer / Spring API Engineer', technologies: ['Spring', 'Spring Boot', 'Spring Data JPA', 'Hibernate', 'MongoDB'] },
  { slug: 'python-ai-productivity', title: 'Python and AI Productivity', summary: 'Combine Python fundamentals, automation and practical generative-AI workflows.', category: 'Programming and AI', modules: ['Python syntax and data structures', 'Functions and reusable code', 'Practical task automation', 'Prompt engineering basics', 'ChatGPT and generative AI workflows', 'Responsible AI-assisted integration'], projects: ['Python workflow automation utility', 'AI-assisted research and productivity workflow'], outcomes: ['Write practical Python scripts', 'Identify useful automation tasks', 'Evaluate and refine AI-assisted workflows'], audience: 'Beginners and professionals exploring Python and productivity-focused AI.', prerequisites: 'No prior Python experience is assumed.', career: 'Python Developer / AI-assisted Engineer', technologies: ['Python', 'ChatGPT workflows', 'Generative AI tools'] },
  { slug: 'dev-workflow-delivery', title: 'Dev Workflow and Delivery', summary: 'Understand the tools and collaborative practices that help software move toward release.', category: 'DevOps', modules: ['Git collaboration and branches', 'Maven fundamentals', 'Gradle fundamentals', 'Jenkins and build automation', 'CI/CD concepts', 'Deployment and interview preparation'], projects: ['Version-controlled application build', 'Introductory automated delivery pipeline'], outcomes: ['Use collaborative Git workflows', 'Understand build and CI/CD pipelines', 'Prepare an application for deployment'], audience: 'Learners with programming fundamentals who want to understand delivery practices.', prerequisites: 'Basic programming and command-line familiarity are recommended.', career: 'Deployment-ready Full Stack Developer', technologies: ['Git', 'Maven', 'Gradle', 'Jenkins', 'CI/CD'] },
  { slug: 'c-cpp-programming', title: 'C and C++ Programming', summary: 'Study programming fundamentals, memory concepts and object-oriented C++.', category: 'Programming', modules: ['C fundamentals and control flow', 'Pointers and memory management', 'Data structures', 'C++ object-oriented programming', 'Templates and STL', 'File handling'], projects: ['Data-structure utility', 'File-based C++ application'], outcomes: ['Reason about pointers and memory', 'Implement foundational data structures', 'Apply object-oriented programming concepts'], audience: 'Beginners and learners interested in systems-level foundations.', prerequisites: 'No prior C or C++ experience is assumed.', career: 'Systems Programming / Embedded Development foundations', technologies: ['C', 'C++', 'Data structures', 'STL'] },
  { slug: 'go-cloud-backend', title: 'Go and Cloud Backend', summary: 'Explore Go services, concurrency concepts and cloud-native foundations.', category: 'Backend and Cloud', modules: ['Go language foundations', 'Packages and error handling', 'Goroutines and channels', 'REST APIs', 'Docker fundamentals', 'Kubernetes and cloud deployment basics'], projects: ['Go REST service', 'Containerized backend exercise'], outcomes: ['Write small Go services', 'Understand Go concurrency fundamentals', 'Recognize container and deployment concepts'], audience: 'Learners interested in backend services and cloud engineering foundations.', prerequisites: 'Basic programming experience is recommended.', career: 'Go Backend Developer / Cloud Engineering foundations', technologies: ['Go', 'Docker', 'Kubernetes', 'REST APIs'] },
  { slug: 'react-frontend-frameworks', title: 'React and Frontend Frameworks', summary: 'Build component-based interfaces and explore common React application patterns.', category: 'Frontend', modules: ['React fundamentals', 'Components and props', 'Hooks and state', 'Context API', 'Redux fundamentals', 'Next.js and API integration'], projects: ['Component-based interactive application', 'API-connected frontend experience'], outcomes: ['Compose reusable React components', 'Manage application state', 'Connect an interface to APIs'], audience: 'Learners with basic JavaScript knowledge who want to explore React.', prerequisites: 'JavaScript fundamentals are recommended.', career: 'React Developer / Frontend Engineer', technologies: ['React', 'Hooks', 'Context API', 'Redux', 'Next.js'] }
];

export type CaseStudy = {
  slug: string;
  client: string;
  category: string;
  title: string;
  summary: string;
  kind: 'carpet' | 'qr' | 'building' | 'wall' | 'fire' | 'audit';
  scope: string[];
  stack: string[];
  url?: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'soft-steps-carpets',
    client: 'Soft Steps Carpets',
    category: 'Business website',
    title: 'A product-focused carpet and rug website',
    summary: 'A catalogue-led website for carpets and rugs, with collections, a shop and enquiry-led shopping routes.',
    kind: 'carpet',
    scope: ['Product and category pages', 'Collections and shop', 'Contact and project enquiries'],
    stack: ['Angular', 'Supabase (project dependency)']
  },
  {
    slug: 'madad-qr',
    client: 'Madad QR',
    category: 'Vehicle safety product',
    title: 'A QR safety tag for vehicles, made for emergencies',
    summary: 'A QR safety tag that sticks onto a vehicle\u2019s mirror. If the owner or driver is ever in an emergency, people nearby can use it to get the right help quickly.',
    kind: 'qr',
    scope: ['Mirror-mounted QR safety tag', 'Built for emergency situations involving the owner or driver', 'Quick to scan for anyone nearby'],
    stack: ['QR code']
  },
  {
    slug: 'suraksha-walls',
    client: 'Suraksha Walls',
    category: 'Business website',
    title: 'A website for boundary wall and RCC specialists',
    summary: 'A business website for Suraksha Walls, presenting its boundary wall and RCC work to customers online.',
    kind: 'wall',
    scope: ['Business website for boundary wall and RCC work'],
    stack: [],
    url: 'https://www.surakshawalls.space/'
  },
  {
    slug: 'all-india-fire-solutions',
    client: 'All India Fire Solutions',
    category: 'Business website',
    title: 'A service and product website for a fire safety company',
    summary: 'A multi-page website for a fire safety supplier and service provider, presenting extinguishers, alarm, sprinkler and hydrant systems, maintenance contracts and safety training, with clear ways to get in touch.',
    kind: 'fire',
    scope: ['Fire safety services overview', 'Product range for extinguishers, alarms, sprinklers and hydrants', 'Enquiry page and contact details for head and branch offices', 'Quick phone, WhatsApp and email contact options'],
    stack: [],
    url: 'https://www.allindiafiresolutions.com/'
  },
  {
    slug: 'square-associates',
    client: 'Square Associates',
    category: 'Business website',
    title: 'A consultancy website for structural audit and building repair',
    summary: 'A professional website for structural audit and building repair consultants in Mumbai, explaining each service, the team and how to get in touch.',
    kind: 'audit',
    scope: ['Service pages for structural audit, NDT testing, rehabilitation, tendering and more', 'About Us, team and blog sections', 'Contact page with phone, email and working hours'],
    stack: [],
    url: 'https://www.squareassociates.org/'
  },
  {
    slug: 'shrinathji-developers',
    client: 'Shrinathji Developers',
    category: 'Case study coming soon',
    title: 'A digital project for Shrinathji Developers',
    summary: 'The full case study for this project is being prepared and will be added soon.',
    kind: 'building',
    scope: [],
    stack: []
  }
];

export const PROCESS = [
  ['01', 'Discovery', 'Understand business requirements, users, workflows and constraints.'],
  ['02', 'Planning', 'Define scope, priorities, architecture and delivery expectations together.'],
  ['03', 'Design', 'Shape information architecture, user flows and responsive interfaces.'],
  ['04', 'Development', 'Implement features with maintainable code and iterative reviews.'],
  ['05', 'Testing', 'Check functionality, accessibility, responsiveness and performance.'],
  ['06', 'Launch', 'Prepare production configuration and release checks.'],
  ['07', 'Support', 'Discuss maintenance and improvements within the agreed scope and business hours.']
];
export const TECHNOLOGIES = [
  ['Frontend implementation', 'Angular · TypeScript'],
  ['Data and integration', 'Supabase project integration'],
  ['Web application delivery', 'Responsive, routed web applications'],
  ['Quality and maintenance', 'Project-specific testing and maintainable implementation']
];
export const FAQS = [
  ['What happens after I share a project enquiry?', 'We review the information you provide and discuss requirements, scope and a suitable next step during business hours.'],
  ['Can you work with our existing software?', 'Share the systems and constraints involved. We can discuss integration and modernization options after understanding the technical context.'],
  ['How are estimates prepared?', 'Estimates depend on agreed scope, requirements and constraints. We discuss these before proposing an approach; no fixed estimate is assumed here.'],
  ['What technologies do you use?', 'Technology choices depend on the product, team context and maintenance needs. The capabilities page describes the areas we can discuss.'],
  ['Do you offer maintenance?', 'Support and maintenance options are available based on the agreed service scope and business hours.'],
  ['Are training fees, schedules or placements guaranteed?', 'Fees, duration and batch schedules are not published until confirmed. Training does not guarantee a job, salary or placement.']
];