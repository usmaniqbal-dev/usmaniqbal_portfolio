const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { windowWrapper, phoneWrapper, outDir, usmanPhotoB64, companyLogoB64 } = require('./visual-templates');

const generators = {};

// 16. Usman Iqbal Portfolio Website
generators['usman-portfolio'] = () => windowWrapper({
  title: 'Usman Iqbal — Salesforce Administrator &amp; Developer Portfolio (www.usmaniqbal.tech)',
  badge: 'Portfolio Live',
  bgGradient: ['#0f172a', '#022c22'],
  bodyContent: `
    <!-- Top Navigation Mock -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="46" rx="8" fill="#1e293b" />
      <text x="24" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#00DCA0">USMAN IQBAL</text>
      <text x="500" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#cbd5e1" text-anchor="middle">
        Home    About    Skills    Services    Projects    Contact
      </text>
      <rect x="880" y="8" width="120" height="30" rx="15" fill="#00DCA0" />
      <text x="940" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#0f172a" text-anchor="middle">Get In Touch</text>
    </g>

    <!-- Hero Section Split View -->
    <g transform="translate(0, 65)">
      <!-- Left Hero Text (600 width) -->
      <g>
        <rect width="600" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(35, 45)">
          <rect width="180" height="26" rx="13" fill="#00DCA0" fill-opacity="0.15" stroke="#00DCA0" stroke-width="1" />
          <text x="90" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#00DCA0" text-anchor="middle">FOUNDER OF NURAXTECH</text>
          
          <text x="0" y="70" font-family="system-ui, sans-serif" font-size="34" font-weight="900" fill="#ffffff">Usman Iqbal</text>
          <text x="0" y="105" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#00DCA0">Salesforce Administrator &amp; Developer</text>
          
          <text x="0" y="145" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">
            Specializing in Salesforce CRM, Flows &amp; Process Automation,
          </text>
          <text x="0" y="165" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">
            Agentforce AI Subagents, Full-Stack Web Apps, and Android Solutions.
          </text>

          <!-- Core Metrics Pills -->
          <g transform="translate(0, 195)">
            ${[
              { label: 'Core Skills', val: '16+' },
              { label: 'Services', val: '10+' },
              { label: 'Featured Projects', val: '34' }
            ].map((st, i) => `
              <g transform="translate(${i * 180}, 0)">
                <rect width="165" height="65" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
                <text x="20" y="30" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#00DCA0">${st.val}</text>
                <text x="20" y="50" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#cbd5e1">${st.label}</text>
              </g>
            `).join('')}
          </g>

          <!-- Action Buttons -->
          <g transform="translate(0, 290)">
            <rect width="170" height="44" rx="22" fill="#00DCA0" />
            <text x="85" y="27" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">Explore 34 Projects</text>

            <rect x="190" width="150" height="44" rx="22" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <text x="265" y="27" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">View Full CV</text>
          </g>

          <g transform="translate(0, 360)">
            <text x="0" y="16" font-family="monospace" font-size="11" fill="#38bdf8">Tech Stack: Next.js 15 • TypeScript • Tailwind CSS • Framer Motion</text>
          </g>
        </g>
      </g>

      <!-- Right: Authentic Portrait Frame (390 width) -->
      <g transform="translate(630, 0)">
        <rect width="390" height="480" rx="14" fill="#090d16" stroke="#00DCA0" stroke-width="1.5" />
        ${usmanPhotoB64 ? `
          <g transform="translate(45, 30)">
            <circle cx="150" cy="180" r="140" fill="#00DCA0" fill-opacity="0.1" />
            <image href="data:image/png;base64,${usmanPhotoB64}" x="0" y="0" width="300" height="380" />
          </g>
        ` : `
          <g transform="translate(45, 120)">
            <circle cx="150" cy="120" r="80" fill="#00DCA0" fill-opacity="0.2" />
            <text x="150" y="130" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#00DCA0" text-anchor="middle">UI</text>
          </g>
        `}
        <g transform="translate(25, 410)">
          <rect width="340" height="46" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <circle cx="25" cy="23" r="6" fill="#00DCA0" />
          <text x="42" y="27" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Usman Iqbal — Verified Salesforce Specialist</text>
        </g>
      </g>
    </g>
  `
});

// 17. NuraxTech Company Website
generators['nuraxtech-company'] = () => windowWrapper({
  title: 'NURAXTECH — Enterprise CRM, AI Integration &amp; Software Engineering Agency',
  badge: 'Company Portal Live',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <!-- Top Corporate Header -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="46" rx="8" fill="#1e293b" />
      <text x="24" y="28" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#38bdf8">NURAXTECH</text>
      <text x="500" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#cbd5e1" text-anchor="middle">
        Services    Solutions    Case Studies    Company    Enterprise Consulting
      </text>
      <rect x="860" y="8" width="140" height="30" rx="15" fill="#0284c7" />
      <text x="930" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">Schedule Call</text>
    </g>

    <!-- Center Stage with Authentic Logo &amp; Services -->
    <g transform="translate(0, 65)">
      <!-- Left: Logo &amp; Headline (520 width) -->
      <g>
        <rect width="520" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(30, 30)">
          <!-- Authentic 3D NT Logo Embedded -->
          ${companyLogoB64 ? `
            <g transform="translate(10, 0)">
              <rect width="140" height="150" rx="12" fill="#1e293b" />
              <image href="data:image/jpeg;base64,${companyLogoB64}" x="15" y="10" width="110" height="130" />
            </g>
          ` : `
            <rect width="120" height="120" rx="12" fill="#0284c7" />
            <text x="60" y="70" font-family="system-ui, sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">NT</text>
          `}

          <g transform="translate(170, 20)">
            <rect width="130" height="24" rx="12" fill="#0284c7" fill-opacity="0.2" />
            <text x="65" y="16" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#38bdf8" text-anchor="middle">CORPORATE BRAND</text>
            <text x="0" y="55" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff">NURAXTECH</text>
            <text x="0" y="80" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#38bdf8">Engineering Enterprise Digital Systems</text>
          </g>

          <g transform="translate(0, 180)">
            <text x="0" y="20" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Global Enterprise Consulting Services</text>
            <text x="0" y="42" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">Delivering bespoke Salesforce architecture, autonomous AI agents,</text>
            <text x="0" y="60" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">and high-performance web systems for clients worldwide.</text>

            <!-- Metrics -->
            <g transform="translate(0, 90)">
              <rect width="460" height="80" rx="10" fill="#1e293b" />
              <g transform="translate(20, 25)">
                <text x="0" y="16" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#38bdf8">50+</text>
                <text x="0" y="34" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Delivered Systems</text>

                <text x="160" y="16" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#10b981">99.8%</text>
                <text x="160" y="34" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Client Satisfaction</text>

                <text x="320" y="16" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#00DCA0">Global</text>
                <text x="320" y="34" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Client Reach</text>
              </g>
            </g>
          </g>
        </g>
      </g>

      <!-- Right: Service Capabilities Grid (470 width) -->
      <g transform="translate(550, 0)">
        <rect width="470" height="480" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Core Solutions &amp; Practice Areas</text>
          
          <g transform="translate(0, 35)">
            ${[
              { title: 'Salesforce Administration &amp; Dev', desc: 'Custom CRM, Flow automation, Apex, security &amp; reports', color: '#0176D3', icon: '☁' },
              { title: 'Autonomous AI Multi-Agents', desc: 'Predictive lead scoring, intelligent bots &amp; LLM workflows', color: '#00DCA0', icon: '🤖' },
              { title: 'Full-Stack Web &amp; Mobile Apps', desc: 'Next.js, React, Android Java, Node.js &amp; high-scale cloud', color: '#38bdf8', icon: '⚡' },
              { title: 'Workflow &amp; API Integration Hub', desc: 'Connecting CRMs with payment, ERP, WhatsApp &amp; email APIs', color: '#f59e0b', icon: '🔗' }
            ].map((srv, idx) => `
              <g transform="translate(0, ${idx * 95})">
                <rect width="422" height="82" rx="10" fill="#1e293b" stroke="${srv.color}" stroke-width="1" />
                <circle cx="28" cy="28" r="14" fill="${srv.color}" fill-opacity="0.15" />
                <text x="28" y="34" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">${srv.icon}</text>
                <text x="54" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${srv.title}</text>
                <text x="54" y="46" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">${srv.desc}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>
    </g>
  `
});

// 18. Mian Rent A Car Website
generators['mian-rent-a-car'] = () => windowWrapper({
  title: 'Mian Rent A Car — Vehicle Fleet &amp; Booking Management System (Admin Panel)',
  badge: 'Fleet System Live',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <!-- Top Search &amp; Date Picker -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1" />
      <g transform="translate(20, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">📍 Location: Lahore Airport / Gulberg</text>
        <text x="320" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">📅 Pickup: Today, 10:00 AM</text>
        <text x="560" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">📅 Return: 3 Days Later</text>
        <rect x="850" y="-4" width="140" height="30" rx="6" fill="#f59e0b" />
        <text x="920" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#0f172a" text-anchor="middle">SEARCH FLEET</text>
      </g>
    </g>

    <!-- Fleet Cards &amp; Admin Overview -->
    <g transform="translate(0, 75)">
      <!-- Left: Fleet Cards (660 width) -->
      <g>
        <rect width="660" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Available Luxury &amp; Executive Fleet</text>
          
          <g transform="translate(0, 35)">
            ${[
              { car: 'Toyota Prado TX (4x4 Luxury SUV)', rate: 'PKR 25,000 / day', specs: 'Automatic • Diesel • 7 Seater • Chauffeur Option', color: '#0369a1' },
              { car: 'Honda Civic Oriel (Executive Sedan)', rate: 'PKR 12,000 / day', specs: 'Automatic • Petrol • Sunroof • Leather Interior', color: '#0f766e' },
              { car: 'Toyota Fortuner Legender', rate: 'PKR 28,000 / day', specs: 'Automatic • 4x4 • 7 Seater • VIP Protection Tier', color: '#1d4ed8' }
            ].map((v, idx) => `
              <g transform="translate(0, ${idx * 115})">
                <rect width="612" height="100" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
                <rect x="12" y="12" width="120" height="76" rx="8" fill="${v.color}" />
                <text x="72" y="52" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">🚗</text>
                
                <text x="145" y="32" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">${v.car}</text>
                <text x="145" y="52" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">${v.specs}</text>
                <text x="145" y="74" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#f59e0b">${v.rate}</text>

                <rect x="490" y="30" width="110" height="38" rx="8" fill="#10b981" />
                <text x="545" y="54" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Book Now</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Admin Panel Quick Stats (330 width) -->
      <g transform="translate(690, 0)">
        <rect width="330" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Fleet Admin Console</text>

          <g transform="translate(0, 35)">
            <rect width="290" height="75" rx="8" fill="#1e293b" />
            <text x="14" y="26" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Active Bookings Today</text>
            <text x="14" y="54" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#10b981">18 Vehicles</text>

            <rect y="90" width="290" height="75" rx="8" fill="#1e293b" />
            <text x="14" y="26" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Fleet In-Stock</text>
            <text x="14" y="54" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#38bdf8">14 Vehicles</text>

            <!-- WhatsApp Integration -->
            <rect y="180" width="290" height="160" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1" />
            <g transform="translate(14, 20)">
              <text x="0" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981">WhatsApp Direct Booking API</text>
              <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Customer inquiry sent to operator</text>
              <text x="0" y="58" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Automated PDF agreement export</text>
              <text x="0" y="78" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Live vehicle status tracking</text>
              <rect y="96" width="262" height="32" rx="6" fill="#10b981" />
              <text x="131" y="117" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">Open Admin Dashboard</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 19. PetTrackingCare — Android Application
generators['pet-tracking-care'] = () => phoneWrapper({
  title: 'PetTrackingCare',
  badge: 'Android Java &amp; XML',
  bgGradient: ['#0f172a', '#064e3b'],
  sideContent: `
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#94a3b8">Smart Pet Care &amp; GPS Collars</text>
    <g transform="translate(0, 30)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Real-Time GPS Location Tracking</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Geo-fence safe zones with instant escape push alerts</text>
      </g>
    </g>

    <g transform="translate(0, 130)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">Pet Medical &amp; Vaccination Records</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Automated reminders for rabies shots, deworming &amp; vet visits</text>
      </g>
    </g>

    <g transform="translate(0, 230)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f59e0b">Daily Activity &amp; Feeding Schedule</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Walk distance pedometer and meal calorie tracking</text>
      </g>
    </g>

    <text x="0" y="355" font-family="monospace" font-size="11" fill="#00DCA0">Tech: Android SDK • Java • XML • Google Maps API • Firebase</text>
  `,
  phoneContent: `
    <!-- Top Pet Card -->
    <g transform="translate(0, 0)">
      <rect width="320" height="85" rx="14" fill="#1e293b" />
      <circle cx="45" cy="42" r="28" fill="#f59e0b" fill-opacity="0.2" />
      <text x="45" y="52" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle">🐕</text>
      <text x="88" y="36" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Rocky (Retriever)</text>
      <text x="88" y="54" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#10b981">● Collar Connected (Battery: 88%)</text>
    </g>

    <!-- GPS Map Card -->
    <g transform="translate(0, 100)">
      <rect width="320" height="210" rx="14" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
      <!-- Map grid roads -->
      <line x1="20" y1="105" x2="300" y2="105" stroke="#10b981" stroke-width="4" stroke-opacity="0.4" />
      <line x1="160" y1="20" x2="160" y2="190" stroke="#10b981" stroke-width="4" stroke-opacity="0.4" />
      <!-- Safe zone circle -->
      <circle cx="160" cy="105" r="70" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4" />
      <!-- Pet Pin -->
      <circle cx="160" cy="105" r="14" fill="#ef4444" />
      <circle cx="160" cy="105" r="6" fill="#ffffff" />
      
      <rect x="70" y="160" width="180" height="32" rx="16" fill="#0f172a" fill-opacity="0.9" />
      <text x="160" y="180" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#34d399" text-anchor="middle">Safe Zone: Home Lawn</text>
    </g>

    <!-- Health &amp; Care Metrics -->
    <g transform="translate(0, 325)">
      <g transform="translate(0, 0)">
        <rect width="150" height="85" rx="12" fill="#1e293b" />
        <text x="16" y="26" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Walk Today</text>
        <text x="16" y="52" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#38bdf8">4.8 km</text>
        <text x="16" y="70" font-family="system-ui, sans-serif" font-size="9" fill="#10b981">Goal: 5.0 km</text>
      </g>
      <g transform="translate(170, 0)">
        <rect width="150" height="85" rx="12" fill="#1e293b" />
        <text x="16" y="26" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Next Vaccine</text>
        <text x="16" y="52" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#f59e0b">Oct 28</text>
        <text x="16" y="70" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">Rabies Booster</text>
      </g>
    </g>

    <!-- Bottom App Navigation Bar -->
    <g transform="translate(0, 430)">
      <rect width="320" height="50" rx="25" fill="#1e293b" />
      <text x="40" y="30" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">🏠</text>
      <text x="120" y="30" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">📍</text>
      <text x="200" y="30" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">🩺</text>
      <text x="280" y="30" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">⚙</text>
    </g>
  `
});

// 20. NeoBank — Digital Banking Application
generators['neobank-app'] = () => phoneWrapper({
  title: 'NeoBank Digital Wallet',
  badge: 'FinTech Mobile App',
  bgGradient: ['#0f172a', '#1e1b4b'],
  sideContent: `
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#94a3b8">Easypaisa &amp; JazzCash Inspired FinTech</text>
    <g transform="translate(0, 30)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Instant Money Transfer &amp; QR Payments</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Real-time peer-to-peer wallet transfers, IBAN bank wires &amp; merchant QR</text>
      </g>
    </g>

    <g transform="translate(0, 130)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">Utility Bill Payments &amp; Mobile Load</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">1-click electricity, gas, internet bills &amp; telco top-ups</text>
      </g>
    </g>

    <g transform="translate(0, 230)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f59e0b">Multi-Factor Security &amp; Biometrics</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Fingerprint auth, OTP verification &amp; dynamic transaction encryption</text>
      </g>
    </g>

    <text x="0" y="355" font-family="monospace" font-size="11" fill="#00DCA0">Tech: Android • FinTech UI/UX • REST API • Secure Enclave</text>
  `,
  phoneContent: `
    <!-- Top User Card -->
    <g transform="translate(0, 0)">
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Welcome back,</text>
      <text x="0" y="38" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff">Usman Iqbal</text>
      <circle cx="300" cy="24" r="16" fill="#38bdf8" />
      <text x="300" y="29" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">UI</text>
    </g>

    <!-- Main Balance Card -->
    <g transform="translate(0, 55)">
      <rect width="320" height="135" rx="16" fill="#0284c7" />
      <g transform="translate(20, 20)">
        <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#bae6fd">TOTAL AVAILABLE BALANCE</text>
        <text x="0" y="44" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#ffffff">PKR 485,250.00</text>
        <text x="0" y="66" font-family="system-ui, sans-serif" font-size="11" fill="#e0f2fe">≈ $1,745.50 USD • Master Account</text>

        <rect y="78" width="120" height="26" rx="13" fill="#0c4a6e" />
        <text x="60" y="95" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#38bdf8" text-anchor="middle">+ Add Money</text>
      </g>
    </g>

    <!-- Quick Action Circle Buttons -->
    <g transform="translate(0, 205)">
      ${[
        { label: 'Send Money', icon: '↗', color: '#10b981' },
        { label: 'Pay Bills', icon: '⚡', color: '#f59e0b' },
        { label: 'QR Scan', icon: '⛶', color: '#38bdf8' },
        { label: 'Mobile Load', icon: '📱', color: '#a855f7' }
      ].map((b, idx) => `
        <g transform="translate(${idx * 80 + 10}, 0)">
          <circle cx="30" cy="25" r="22" fill="#1e293b" stroke="${b.color}" stroke-width="1.5" />
          <text x="30" y="31" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="${b.color}" text-anchor="middle">${b.icon}</text>
          <text x="30" y="60" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1" text-anchor="middle">${b.label}</text>
        </g>
      `).join('')}
    </g>

    <!-- Recent Transactions -->
    <g transform="translate(0, 290)">
      <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Recent Transactions</text>
      
      <g transform="translate(0, 26)">
        ${[
          { title: 'Client Wire Inbound', time: 'Today, 2:40 PM', amt: '+PKR 125,000', pos: true },
          { title: 'IESCO Electricity Bill', time: 'Yesterday', amt: '-PKR 14,280', pos: false },
          { title: 'Mobile Load Jazz', time: 'Oct 14', amt: '-PKR 2,000', pos: false }
        ].map((tx, i) => `
          <g transform="translate(0, ${i * 54})">
            <rect width="320" height="46" rx="10" fill="#1e293b" />
            <text x="14" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${tx.title}</text>
            <text x="14" y="34" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">${tx.time}</text>
            <text x="306" y="28" font-family="monospace" font-size="12" font-weight="800" fill="${tx.pos ? '#10b981' : '#f87171'}" text-anchor="end">${tx.amt}</text>
          </g>
        `).join('')}
      </g>
    </g>
  `
});

// 21. Digital Store — E-commerce Website
generators['digital-store'] = () => windowWrapper({
  title: 'Digital Store — Full-Stack E-commerce Platform (PHP &amp; MySQL / XAMPP)',
  badge: 'E-commerce Web Live',
  bgGradient: ['#0f172a', '#0284c7'],
  bodyContent: `
    <!-- Top Nav &amp; Cart -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="8" fill="#1e293b" />
      <text x="24" y="31" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#38bdf8">DIGITAL STORE</text>
      <text x="240" y="31" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">Electronics • Smart Devices • Audio • Accessories</text>
      <rect x="880" y="10" width="120" height="30" rx="6" fill="#0284c7" />
      <text x="940" y="30" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">🛒 Cart (3 Items)</text>
    </g>

    <!-- Product Grid -->
    <g transform="translate(0, 70)">
      <rect width="1020" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
      <text x="30" y="36" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Featured Tech &amp; Gadgets Collection</text>

      <g transform="translate(30, 60)">
        ${[
          { name: 'Wireless Active Noise-Canceling Headphones', price: '$149.99', rating: '★★★★★ (4.9)', color: '#0369a1', badge: 'BESTSELLER' },
          { name: 'Ultra-HD Smart Fitness Watch Pro', price: '$89.99', rating: '★★★★★ (4.8)', color: '#047857', badge: 'NEW' },
          { name: 'Mechanical RGB Gaming Keyboard (Wireless)', price: '$119.50', rating: '★★★★☆ (4.7)', color: '#7e22ce', badge: 'TOP RATED' }
        ].map((item, idx) => `
          <g transform="translate(${idx * 330}, 0)">
            <rect width="300" height="380" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
            
            <rect x="15" y="15" width="270" height="170" rx="10" fill="${item.color}" fill-opacity="0.25" />
            <text x="150" y="105" font-family="system-ui, sans-serif" font-size="44" text-anchor="middle">🎧</text>
            <rect x="25" y="25" width="85" height="22" rx="4" fill="${item.color}" />
            <text x="67" y="40" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">${item.badge}</text>

            <g transform="translate(20, 210)">
              <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${item.name.slice(0, 32)}</text>
              <text x="0" y="34" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${item.name.slice(32)}</text>
              
              <text x="0" y="60" font-family="system-ui, sans-serif" font-size="11" fill="#f59e0b">${item.rating}</text>
              <text x="0" y="90" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#38bdf8">${item.price}</text>
              
              <rect x="140" y="68" width="120" height="34" rx="6" fill="#0284c7" />
              <text x="200" y="90" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">+ Add to Cart</text>
            </g>
          </g>
        `).join('')}
      </g>
    </g>
  `
});

// 22. Fashiony OGS — Fashion Website
generators['fashiony-ogs'] = () => windowWrapper({
  title: 'Fashiony OGS — Luxury Fashion &amp; Apparel Boutique (MySQL &amp; PHP)',
  badge: 'Fashion Web Live',
  bgGradient: ['#0f172a', '#3b0764'],
  bodyContent: `
    <!-- Top Editorial Header -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="46" rx="8" fill="#1e293b" />
      <text x="24" y="28" font-family="serif" font-size="16" font-weight="900" fill="#f8fafc" letter-spacing="2">FASHIONY OGS</text>
      <text x="500" y="28" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">
        Autumn Lookbook    Couture Dresses    Outerwear    Accessories    VIP Runway
      </text>
      <text x="996" y="28" font-family="monospace" font-size="11" fill="#a855f7" text-anchor="end">MySQL: fashiony_ogs</text>
    </g>

    <!-- Lookbook Cards -->
    <g transform="translate(0, 65)">
      <rect width="1020" height="485" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
      
      <!-- Big Editorial Banner (Left 560 width) -->
      <g transform="translate(30, 30)">
        <rect width="540" height="425" rx="12" fill="#1e1b4b" stroke="#7e22ce" stroke-width="1.5" />
        <rect x="20" y="20" width="500" height="230" rx="8" fill="#581c87" />
        <text x="270" y="145" font-family="system-ui, sans-serif" font-size="54" text-anchor="middle">👗</text>
        <rect x="35" y="35" width="140" height="26" rx="13" fill="#a855f7" />
        <text x="105" y="52" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">AUTUMN COLLECTION</text>

        <g transform="translate(30, 275)">
          <text x="0" y="20" font-family="serif" font-size="24" font-weight="900" fill="#ffffff">Midnight Velvet Trench Coat</text>
          <text x="0" y="44" font-family="system-ui, sans-serif" font-size="13" fill="#cbd5e1">Hand-tailored European silhouette with satin lining</text>
          <text x="0" y="78" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#c084fc">$285.00</text>
          
          <rect x="360" y="54" width="120" height="36" rx="8" fill="#a855f7" />
          <text x="420" y="77" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">View Product</text>
        </g>
      </g>

      <!-- Right: Grid of 2 items (380 width) -->
      <g transform="translate(600, 30)">
        ${[
          { title: 'Silk Pleated Evening Dress', price: '$195.00', icon: '👠' },
          { title: 'Cashmere Winter Knitwear', price: '$145.00', icon: '🧣' }
        ].map((it, idx) => `
          <g transform="translate(0, ${idx * 220})">
            <rect width="380" height="205" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <rect x="15" y="15" width="110" height="175" rx="8" fill="#312e81" />
            <text x="70" y="110" font-family="system-ui, sans-serif" font-size="34" text-anchor="middle">${it.icon}</text>
            
            <g transform="translate(140, 45)">
              <text x="0" y="16" font-family="serif" font-size="15" font-weight="800" fill="#ffffff">${it.title}</text>
              <text x="0" y="40" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Boutique Exclusive</text>
              <text x="0" y="75" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#c084fc">${it.price}</text>
              <rect y="95" width="110" height="30" rx="6" fill="#4c1d95" />
              <text x="55" y="115" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Add to Bag</text>
            </g>
          </g>
        `).join('')}
      </g>
    </g>
  `
});

// 23. PDF Text Converter App
generators['pdf-text-converter'] = () => windowWrapper({
  title: 'PDF Text Converter Pro — High-Speed Document Extraction (VS Code / Python)',
  badge: 'Document Utility Live',
  bgGradient: ['#0f172a', '#0369a1'],
  bodyContent: `
    <!-- Top Progress Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="monospace" font-size="13" font-weight="700" fill="#38bdf8">Annual_Financial_Report_2026.pdf (Page 18/24)</text>
        <rect x="440" y="6" width="380" height="12" rx="6" fill="#334155" />
        <rect x="440" y="6" width="285" height="12" rx="6" fill="#10b981" />
        <text x="830" y="17" font-family="monospace" font-size="11" font-weight="700" fill="#10b981">75% Converted</text>
        <rect x="910" y="-4" width="85" height="30" rx="6" fill="#0284c7" />
        <text x="952" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">STOP</text>
      </g>
    </g>

    <!-- Side-by-Side: PDF Preview vs Extracted Plain Text -->
    <g transform="translate(0, 75)">
      <!-- Left: PDF Source (480 width) -->
      <g>
        <rect width="480" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Source PDF Document Page</text>
          
          <rect y="30" width="432" height="370" rx="8" fill="#ffffff" />
          <g transform="translate(25, 30)" fill="#0f172a">
            <text x="0" y="16" font-family="sans-serif" font-size="14" font-weight="800">SECTION 4: OPERATIONAL REVENUE</text>
            <text x="0" y="38" font-family="sans-serif" font-size="11" fill="#475569">
              This report provides a multi-year audit of digital revenues,
            </text>
            <text x="0" y="56" font-family="sans-serif" font-size="11" fill="#475569">
              including enterprise consulting fees, software licenses,
            </text>
            <text x="0" y="74" font-family="sans-serif" font-size="11" fill="#475569">
              and recurring support retainers.
            </text>
            
            <line x1="0" y1="95" x2="380" y2="95" stroke="#cbd5e1" stroke-width="1" />

            <text x="0" y="125" font-family="monospace" font-size="11" font-weight="700">1. Q1 Enterprise Retainer: $148,000</text>
            <text x="0" y="150" font-family="monospace" font-size="11" font-weight="700">2. Q2 Automation Flows:    $192,500</text>
            <text x="0" y="175" font-family="monospace" font-size="11" font-weight="700">3. Q3 CRM Customization:   $215,400</text>
            <text x="0" y="200" font-family="monospace" font-size="11" font-weight="700">4. Q4 AI Bot Deployments:  $280,000</text>
          </g>
        </g>
      </g>

      <!-- Right: Clean Text Editor Output (510 width) -->
      <g transform="translate(510, 0)">
        <rect width="510" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Extracted Structured Text (UTF-8)</text>
          
          <rect y="30" width="460" height="320" rx="8" fill="#1e293b" />
          <g transform="translate(16, 20)">
            <text x="0" y="16" font-family="monospace" font-size="11" fill="#38bdf8">[TEXT EXTRACTION ENGINE - 0 ERRORS]</text>
            <text x="0" y="42" font-family="monospace" font-size="11" fill="#cbd5e1">SECTION 4: OPERATIONAL REVENUE</text>
            <text x="0" y="68" font-family="monospace" font-size="10" fill="#94a3b8">This report provides a multi-year audit of digital revenues,</text>
            <text x="0" y="86" font-family="monospace" font-size="10" fill="#94a3b8">including enterprise consulting fees, software licenses,</text>
            <text x="0" y="104" font-family="monospace" font-size="10" fill="#94a3b8">and recurring support retainers.</text>
            
            <text x="0" y="136" font-family="monospace" font-size="11" fill="#10b981">1. Q1 Enterprise Retainer: $148,000</text>
            <text x="0" y="156" font-family="monospace" font-size="11" fill="#10b981">2. Q2 Automation Flows:    $192,500</text>
            <text x="0" y="176" font-family="monospace" font-size="11" fill="#10b981">3. Q3 CRM Customization:   $215,400</text>
            <text x="0" y="196" font-family="monospace" font-size="11" fill="#10b981">4. Q4 AI Bot Deployments:  $280,000</text>
          </g>

          <!-- Export Buttons -->
          <g transform="translate(0, 365)">
            <rect width="140" height="40" rx="8" fill="#0284c7" />
            <text x="70" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">Copy to Clipboard</text>

            <rect x="155" width="140" height="40" rx="8" fill="#059669" />
            <text x="225" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">Save as .TXT</text>

            <rect x="310" width="150" height="40" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <text x="385" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#cbd5e1" text-anchor="middle">Export as Word/JSON</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 24. POS &amp; Store Management System
generators['pos-management'] = () => windowWrapper({
  title: 'Retail POS &amp; Store Management System (Electron / Node.js / Prisma)',
  badge: 'POS Terminal Online',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <!-- Top Cashier Status Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="8" fill="#1e293b" />
      <g transform="translate(20, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Terminal #01 (Front Register) • Cashier: Usman Iqbal</text>
        <text x="500" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">Shift Total: $1,428.50</text>
        <text x="750" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Prisma SQLite Connected</text>
      </g>
    </g>

    <!-- Split Screen: Touch Tiles &amp; Register Receipt -->
    <g transform="translate(0, 70)">
      <!-- Left: Category Tiles (600 width) -->
      <g>
        <rect width="600" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Product Quick Keys</text>
          
          <g transform="translate(0, 32)">
            ${[
              { name: 'Organic Whole Milk 1L', price: '$3.50', cat: 'Dairy', icon: '🥛', color: '#0369a1' },
              { name: 'Fresh Artisan Bread', price: '$2.80', cat: 'Bakery', icon: '🍞', color: '#b45309' },
              { name: 'Sparkling Mineral Water', price: '$2.00', cat: 'Beverages', icon: '🍾', color: '#0e7490' },
              { name: 'Imported Arabica Coffee', price: '$14.50', cat: 'Pantry', icon: '☕', color: '#78350f' },
              { name: 'Greek Honey Yogurt', price: '$4.20', cat: 'Dairy', icon: '🥣', color: '#0369a1' },
              { name: 'Avocado Bag (4 Pack)', price: '$5.00', cat: 'Produce', icon: '🥑', color: '#15803d' }
            ].map((p, idx) => {
              const row = Math.floor(idx / 3);
              const col = idx % 3;
              return `
                <g transform="translate(${col * 186}, ${row * 165})">
                  <rect width="176" height="150" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
                  <text x="88" y="50" font-family="system-ui, sans-serif" font-size="34" text-anchor="middle">${p.icon}</text>
                  <text x="12" y="86" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${p.name.slice(0, 20)}</text>
                  <text x="12" y="104" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">${p.cat}</text>
                  <text x="12" y="132" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#10b981">${p.price}</text>
                </g>
              `;
            }).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Active Register Receipt &amp; Tender (390 width) -->
      <g transform="translate(630, 0)">
        <rect width="390" height="480" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Current Order #1042</text>
          
          <rect y="30" width="350" height="240" rx="8" fill="#1e293b" />
          <g transform="translate(16, 20)">
            ${[
              { item: '2x Organic Whole Milk 1L', amt: '$7.00' },
              { item: '1x Fresh Artisan Bread', amt: '$2.80' },
              { item: '1x Imported Arabica Coffee', amt: '$14.50' },
              { item: '3x Sparkling Mineral Water', amt: '$6.00' }
            ].map((line, i) => `
              <g transform="translate(0, ${i * 32})">
                <text x="0" y="16" font-family="system-ui, sans-serif" font-size="11" fill="#f8fafc">${line.item}</text>
                <text x="318" y="16" font-family="monospace" font-size="11" font-weight="700" fill="#10b981" text-anchor="end">${line.amt}</text>
              </g>
            `).join('')}

            <line x1="0" y1="135" x2="318" y2="135" stroke="#334155" stroke-width="1" />

            <g transform="translate(0, 145)">
              <text x="0" y="16" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Subtotal: $30.30 • Tax (8%): $2.42</text>
              <text x="0" y="44" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#ffffff">TOTAL DUE: $32.72</text>
            </g>
          </g>

          <!-- Tender Buttons -->
          <g transform="translate(0, 290)">
            <rect width="168" height="45" rx="8" fill="#10b981" />
            <text x="84" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">💵 CASH ($35.00)</text>

            <rect x="182" width="168" height="45" rx="8" fill="#0284c7" />
            <text x="266" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">💳 CREDIT CARD</text>

            <rect y="55" width="350" height="40" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <text x="175" y="80" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">Split Tender • Print Duplicate Receipt</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 25. AI Voice Agent Website
generators['ai-voice-agent'] = () => windowWrapper({
  title: 'AI Voice Agent Website — Conversational Real Estate &amp; Retail Assistant',
  badge: 'Voice AI Online',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <!-- Top System Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="46" rx="8" fill="#1e293b" />
      <text x="24" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Real-Time Voice Assistant • WebRTC Ultra-Low Latency</text>
      <text x="996" y="28" font-family="monospace" font-size="11" font-weight="700" fill="#00DCA0" text-anchor="end">● Latency: 160ms • Microphone Connected</text>
    </g>

    <!-- Center Glowing Voice Orb &amp; Live Transcript -->
    <g transform="translate(0, 65)">
      <!-- Left: Interactive Voice Orb (480 width) -->
      <g>
        <rect width="480" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(240, 200)">
          <!-- Glowing audio wave rings -->
          <circle cx="0" cy="0" r="140" fill="#00DCA0" fill-opacity="0.05" />
          <circle cx="0" cy="0" r="110" fill="#00DCA0" fill-opacity="0.1" />
          <circle cx="0" cy="0" r="80" fill="#38bdf8" fill-opacity="0.2" />
          <circle cx="0" cy="0" r="50" fill="#0284c7" />
          <text x="0" y="8" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle">🎙️</text>
        </g>

        <g transform="translate(240, 360)">
          <rect x="-90" width="180" height="34" rx="17" fill="#00DCA0" />
          <text x="0" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">Agent Speaking...</text>
        </g>

        <text x="240" y="420" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1" text-anchor="middle">Agent Persona: Sophia (Real Estate Leasing Specialist)</text>
      </g>

      <!-- Right: Real-Time Audio Transcript (510 width) -->
      <g transform="translate(510, 0)">
        <rect width="510" height="480" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Live Voice-to-Voice Conversation Stream</text>
          
          <g transform="translate(0, 35)">
            <!-- Message 1 -->
            <rect width="460" height="90" rx="10" fill="#1e293b" />
            <g transform="translate(16, 18)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#00DCA0">SOPHIA (AI VOICE AGENT)</text>
              <text x="0" y="36" font-family="system-ui, sans-serif" font-size="12" fill="#f8fafc">
                "Hello! Welcome to Prime Real Estate. Would you like details on our luxury downtown penthouses or suburban villas?"
              </text>
            </g>

            <!-- Message 2 -->
            <g transform="translate(0, 105)">
              <rect width="460" height="80" rx="10" fill="#0284c7" />
              <g transform="translate(16, 18)">
                <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e0f2fe">USER (VOICE INPUT)</text>
                <text x="0" y="36" font-family="system-ui, sans-serif" font-size="12" fill="#ffffff">
                  "I am looking for a 3-bedroom penthouse with private terrace under $1.5 million. Any available for showing tomorrow?"
                </text>
              </g>
            </g>

            <!-- Message 3 -->
            <g transform="translate(0, 200)">
              <rect width="460" height="110" rx="10" fill="#1e293b" stroke="#00DCA0" stroke-width="1" />
              <g transform="translate(16, 18)">
                <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#00DCA0">SOPHIA (AI VOICE AGENT)</text>
                <text x="0" y="36" font-family="system-ui, sans-serif" font-size="12" fill="#f8fafc">
                  "Yes, Grand Beverly Suite 14B matches perfectly at $1.45 million. I have scheduled your VIP tour for tomorrow at 3:00 PM. A calendar invite is sent to your email!"
                </text>
              </g>
            </g>

            <g transform="translate(0, 330)">
              <rect width="460" height="50" rx="8" fill="#111827" />
              <text x="16" y="30" font-family="monospace" font-size="11" fill="#10b981">✓ CRM Action Triggered: Lead Updated • Appointment Booked</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 26. AI Chatbot Android Application
generators['ai-chatbot-android'] = () => phoneWrapper({
  title: 'ShopBot AI Mobile',
  badge: 'Android AI Assistant',
  bgGradient: ['#0f172a', '#0369a1'],
  sideContent: `
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#94a3b8">Mobile E-commerce &amp; Restaurant Assistant</text>
    <g transform="translate(0, 30)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">In-Chat Interactive Product Cards</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Browse restaurant menus, clothing items &amp; click 1-touch checkout</text>
      </g>
    </g>

    <g transform="translate(0, 130)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">Personalized Recommendation Engine</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Learns user dietary preferences, budget constraints &amp; style tastes</text>
      </g>
    </g>

    <g transform="translate(0, 230)">
      <rect width="520" height="85" rx="10" fill="#1e293b" />
      <g transform="translate(16, 20)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f59e0b">Native Android Performance</text>
        <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Smooth RecyclerView scrolling, local caching &amp; offline fallback</text>
      </g>
    </g>

    <text x="0" y="355" font-family="monospace" font-size="11" fill="#00DCA0">Tech: Android Java • XML Layouts • OpenAI API • Material Design</text>
  `,
  phoneContent: `
    <!-- Top Chatbot Header -->
    <g transform="translate(0, 0)">
      <rect width="320" height="54" rx="12" fill="#1e293b" />
      <circle cx="28" cy="27" r="16" fill="#00DCA0" />
      <text x="28" y="32" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">AI</text>
      <text x="56" y="24" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">ShopBot Assistant</text>
      <text x="56" y="40" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#10b981">● Online (AI Agent)</text>
    </g>

    <!-- Chat Messages -->
    <g transform="translate(0, 68)">
      <!-- User Bubble -->
      <g transform="translate(70, 0)">
        <rect width="250" height="48" rx="12" fill="#0284c7" />
        <text x="14" y="20" font-family="system-ui, sans-serif" font-size="11" fill="#ffffff">Can you recommend a top-rated</text>
        <text x="14" y="34" font-family="system-ui, sans-serif" font-size="11" fill="#ffffff">Italian dinner spot near me?</text>
      </g>

      <!-- AI Response with Interactive Product Card -->
      <g transform="translate(0, 60)">
        <rect width="320" height="250" rx="12" fill="#1e293b" />
        <g transform="translate(14, 16)">
          <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#00DCA0">Here is the top-rated Italian bistro:</text>
          
          <!-- Product Card Inside Message -->
          <g transform="translate(0, 26)">
            <rect width="292" height="175" rx="10" fill="#090d16" stroke="#334155" stroke-width="1" />
            <rect x="10" y="10" width="272" height="80" rx="8" fill="#78350f" />
            <text x="146" y="55" font-family="system-ui, sans-serif" font-size="34" text-anchor="middle">🍝</text>
            
            <text x="12" y="110" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">Trattoria Bella Roma</text>
            <text x="12" y="128" font-family="system-ui, sans-serif" font-size="10" fill="#f59e0b">★★★★★ 4.9 (420 reviews) • 1.2 km away</text>
            <text x="12" y="146" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Handmade Fettuccine Alfredo &amp; Wood-Fired Pizza</text>

            <rect x="190" y="105" width="92" height="28" rx="6" fill="#10b981" />
            <text x="236" y="123" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">Order Now</text>
          </g>
        </g>
      </g>

      <!-- Bottom Chat Bar -->
      <g transform="translate(0, 335)">
        <rect width="320" height="46" rx="23" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="20" y="28" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Ask for food, outfits or tech...</text>
        <circle cx="292" cy="23" r="16" fill="#00DCA0" />
        <polygon points="288,18 298,23 288,28" fill="#0f172a" />
      </g>
    </g>
  `
});

// 27. Custom Business Applications &amp; Dashboards
generators['custom-dashboards'] = () => windowWrapper({
  title: 'Executive Business Intelligence &amp; Multi-Tenant Analytics Suite',
  badge: 'Analytics Suite Active',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <!-- Top KPI Grid -->
    <g transform="translate(0, 0)">
      ${[
        { label: 'Total Annual ARR', val: '$2,840,000', sub: '+24.2% YoY Growth', color: '#10b981' },
        { label: 'Active Business Accounts', val: '1,420 Clients', sub: '96.8% Retention Rate', color: '#38bdf8' },
        { label: 'Avg Operational Speed', val: '1.2s Latency', sub: 'Instant Data Cloud Sync', color: '#00DCA0' },
        { label: 'Conversion Funnel', val: '38.4%', sub: 'High-Performance Pipelines', color: '#f59e0b' }
      ].map((card, i) => `
        <g transform="translate(${i * 260}, 0)">
          <rect width="245" height="74" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">${card.label}</text>
          <text x="16" y="46" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="${card.color}">${card.val}</text>
          <text x="16" y="62" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#cbd5e1">${card.sub}</text>
        </g>
      `).join('')}
    </g>

    <!-- Center Chart &amp; Industry Dashboard Widgets -->
    <g transform="translate(0, 95)">
      <!-- Left: Revenue Area Chart (620 width) -->
      <g>
        <rect width="620" height="455" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Multi-Quarter Performance Curve</text>
          
          <!-- Area Chart Visual -->
          <g transform="translate(0, 35)">
            <rect width="572" height="260" rx="8" fill="#111827" />
            <line x1="0" y1="65" x2="572" y2="65" stroke="#1f2937" stroke-width="1" />
            <line x1="0" y1="130" x2="572" y2="130" stroke="#1f2937" stroke-width="1" />
            <line x1="0" y1="195" x2="572" y2="195" stroke="#1f2937" stroke-width="1" />
            
            <!-- Area Fill -->
            <path d="M0,220 Q140,180 280,120 T572,40 L572,260 L0,260 Z" fill="#00DCA0" fill-opacity="0.15" />
            <path d="M0,220 Q140,180 280,120 T572,40" fill="none" stroke="#00DCA0" stroke-width="3" />

            <!-- Highlight Points -->
            <circle cx="280" cy="120" r="6" fill="#38bdf8" />
            <circle cx="572" cy="40" r="6" fill="#00DCA0" />
          </g>

          <!-- Timeline Legend -->
          <g transform="translate(0, 315)">
            <text x="0" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#00DCA0">● ARR Inflow Curve</text>
            <text x="140" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">● Automation Efficiency</text>
            <text x="320" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#f59e0b">● Client Retention</text>
          </g>
        </g>
      </g>

      <!-- Right: Industry Modules (380 width) -->
      <g transform="translate(640, 0)">
        <rect width="380" height="455" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Industry Applications</text>

          <g transform="translate(0, 32)">
            ${[
              { name: 'Restaurant POS &amp; Table Booking', val: '34 Active Tables • 98.4% Table Turn', color: '#f59e0b', icon: '🍽️' },
              { name: 'Automotive Fleet Telemetry', val: '42 Vehicles Monitored • 0 Downtime', color: '#38bdf8', icon: '🚘' },
              { name: 'E-commerce Fulfillment Hub', val: '1,420 Orders Dispatched Today', color: '#10b981', icon: '📦' },
              { name: 'Healthcare Appointment Portal', val: '280 Patients Synced to EMR', color: '#a855f7', icon: '🏥' }
            ].map((mod, i) => `
              <g transform="translate(0, ${i * 92})">
                <rect width="340" height="78" rx="10" fill="#1e293b" stroke="${mod.color}" stroke-width="1" />
                <text x="16" y="24" font-family="system-ui, sans-serif" font-size="18">${mod.icon}</text>
                <text x="46" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff">${mod.name}</text>
                <text x="16" y="52" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">${mod.val}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>
    </g>
  `
});

// 28. Portfolio Admin Panel &amp; EmailJS Integration
generators['portfolio-admin-panel'] = () => windowWrapper({
  title: 'Portfolio Control Center — Secure Admin Panel &amp; EmailJS Integration',
  badge: 'Admin Panel 2FA Secure',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <!-- Top Security &amp; Status Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#00DCA0" stroke-width="1.2" />
      <g transform="translate(24, 16)">
        <rect width="180" height="26" rx="13" fill="#00DCA0" fill-opacity="0.2" stroke="#00DCA0" stroke-width="1" />
        <text x="90" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#00DCA0" text-anchor="middle">🔒 2FA TOTP ACTIVE</text>
        <text x="210" y="18" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Authenticator App Verified • Single-Use Backup Codes Generated</text>
        <text x="996" y="18" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Session: AES-256 Encrypted</text>
      </g>
    </g>

    <!-- Main Admin Controls Grid -->
    <g transform="translate(0, 75)">
      <!-- Left: CMS Content Editor &amp; 2FA Status (560 width) -->
      <g>
        <rect width="560" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Content Management Studio</text>
          
          <g transform="translate(0, 35)">
            ${[
              { sec: 'Projects Directory', count: '34 Published Projects', desc: 'All dedicated /projects pages verified &amp; active', color: '#00DCA0' },
              { sec: 'Core Skills &amp; Services', count: '16 Skills • 10 Services', desc: 'Real-time category filter tabs &amp; levels', color: '#38bdf8' },
              { sec: 'Two-Factor Authentication', count: 'Active (Authenticator App)', desc: 'TOTP Google/Microsoft Authenticator enabled', color: '#10b981' }
            ].map((c, idx) => `
              <g transform="translate(0, ${idx * 90})">
                <rect width="512" height="78" rx="10" fill="#1e293b" />
                <text x="16" y="24" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${c.sec}</text>
                <text x="500" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="${c.color}" text-anchor="end">${c.count}</text>
                <text x="16" y="50" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">${c.desc}</text>
              </g>
            `).join('')}
          </g>

          <g transform="translate(0, 310)">
            <rect width="512" height="95" rx="10" fill="#111827" stroke="#334155" stroke-width="1" />
            <g transform="translate(16, 18)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#00DCA0">Neon PostgreSQL &amp; Local Fallback Store</text>
              <text x="0" y="34" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• PostgreSQL schema synchronized for production</text>
              <text x="0" y="52" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Zero data loss with atomic JSON fallback persistence</text>
            </g>
          </g>
        </g>
      </g>

      <!-- Right: EmailJS Integration Module (440 width) -->
      <g transform="translate(580, 0)">
        <rect width="440" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">EmailJS Service Integration</text>

          <g transform="translate(0, 35)">
            <rect width="392" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">EMAIL SERVICE CONFIGURATION</text>
              <text x="0" y="40" font-family="monospace" font-size="11" fill="#10b981">SERVICE_ID: service_usman_iqbal [VERIFIED]</text>
              <text x="0" y="65" font-family="monospace" font-size="11" fill="#10b981">TEMPLATE_ID: template_portfolio [ACTIVE]</text>
              <text x="0" y="90" font-family="monospace" font-size="11" fill="#cbd5e1">PUBLIC_KEY: pk_live_••••••••••••••••</text>
              <text x="0" y="115" font-family="system-ui, sans-serif" font-size="11" fill="#00DCA0">✓ Contact inquiries route directly to hello@nuraxtech.com</text>
            </g>

            <rect y="170" width="392" height="170" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#f59e0b">VISITOR ANALYTICS TELEMETRY</text>
              <text x="0" y="42" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">Page Views Today: 1,420 hits</text>
              <text x="0" y="66" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">Unique Inbound Visitors: 342</text>
              <text x="0" y="90" font-family="system-ui, sans-serif" font-size="12" fill="#10b981">Contact Form Inquiries: 18 submitted</text>
              
              <rect y="105" width="360" height="34" rx="6" fill="#0284c7" />
              <text x="180" y="126" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">View Full Analytics Telemetry</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

async function run() {
  console.log('Generating Category 3: Web &amp; Mobile Application Projects (13 projects)...');
  for (const [key, fn] of Object.entries(generators)) {
    const dest = path.join(outDir, `${key}.jpg`);
    const svg = fn();
    await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`✓ [3/4] ${key}.jpg (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

run();
