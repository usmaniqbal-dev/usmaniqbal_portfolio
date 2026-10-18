const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { windowWrapper, outDir } = require('./visual-templates');

const generators = {};

// 1. Salesforce Business Process Automation
generators['salesforce-automation'] = () => windowWrapper({
  title: 'Salesforce Lightning Experience — Flow Builder: Lead &amp; Opportunity Automation',
  badge: 'Salesforce Flows Active',
  bgGradient: ['#032D60', '#0a192f'],
  bodyContent: `
    <g transform="translate(0, 0)">
      <rect width="1020" height="42" rx="8" fill="#1e293b" />
      <circle cx="24" cy="21" r="10" fill="#0176D3" />
      <text x="24" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#fff" text-anchor="middle">SF</text>
      <text x="46" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#f8fafc">Setup &gt; Process Automation &gt; Flow Builder &gt; Lead_Routing_Orchestrator_v4</text>
      <rect x="880" y="8" width="125" height="26" rx="6" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" />
      <text x="942" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#10b981" text-anchor="middle">● Active Flow (v4.2)</text>
    </g>

    <g transform="translate(0, 60)">
      <g>
        <rect width="680" height="490" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(240, 25)">
          <rect width="200" height="54" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
          <text x="100" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#bae6fd" text-anchor="middle">RECORD-TRIGGERED FLOW</text>
          <text x="100" y="42" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Lead / Opportunity Created</text>
        </g>

        <line x1="340" y1="79" x2="340" y2="125" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" />
        <polygon points="336,125 344,125 340,132" fill="#38bdf8" />

        <g transform="translate(225, 132)">
          <rect width="230" height="60" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
          <text x="115" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#fde68a" text-anchor="middle">DECISION: QUALIFICATION</text>
          <text x="115" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Score &gt;= 80 &amp; ARR &gt; $50k?</text>
        </g>

        <path d="M225,162 L130,162 L130,225" fill="none" stroke="#10b981" stroke-width="2" />
        <polygon points="126,225 134,225 130,232" fill="#10b981" />
        <rect x="140" y="148" width="45" height="18" rx="4" fill="#10b981" fill-opacity="0.2" />
        <text x="162" y="161" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#10b981" text-anchor="middle">TRUE</text>

        <path d="M455,162 L550,162 L550,225" fill="none" stroke="#94a3b8" stroke-width="2" />
        <polygon points="546,225 554,225 550,232" fill="#94a3b8" />
        <rect x="475" y="148" width="50" height="18" rx="4" fill="#94a3b8" fill-opacity="0.2" />
        <text x="500" y="161" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#cbd5e1" text-anchor="middle">DEFAULT</text>

        <g transform="translate(30, 232)">
          <rect width="200" height="60" rx="10" fill="#064e3b" stroke="#10b981" stroke-width="1.5" />
          <text x="100" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#a7f3d0" text-anchor="middle">ACTION: QUEUE ASSIGNMENT</text>
          <text x="100" y="44" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Route to Enterprise Queue</text>
        </g>

        <g transform="translate(450, 232)">
          <rect width="200" height="60" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
          <text x="100" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#cbd5e1" text-anchor="middle">ACTION: NURTURE SEQUENCE</text>
          <text x="100" y="44" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Assign Standard Cadence</text>
        </g>

        <line x1="130" y1="292" x2="130" y2="340" stroke="#10b981" stroke-width="2" />
        <polygon points="126,340 134,340 130,347" fill="#10b981" />
        <g transform="translate(30, 347)">
          <rect width="200" height="60" rx="10" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" />
          <text x="100" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c7d2fe" text-anchor="middle">AUTOMATED ALERTS</text>
          <text x="100" y="44" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Slack Ping + Follow-Up Task</text>
        </g>

        <g transform="translate(265, 430)">
          <rect width="150" height="38" rx="19" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
          <text x="75" y="23" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle">End Flow Execution</text>
        </g>
      </g>

      <g transform="translate(710, 0)">
        <rect width="310" height="490" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#f8fafc">Automation Performance</text>
        
        <g transform="translate(20, 52)">
          <rect width="270" height="74" rx="10" fill="#1e293b" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Total Monthly Executions</text>
          <text x="16" y="58" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#38bdf8">14,820</text>
          <text x="254" y="58" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">+18.4%</text>
        </g>

        <g transform="translate(20, 138)">
          <rect width="270" height="74" rx="10" fill="#1e293b" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Flow Success Reliability</text>
          <text x="16" y="58" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#10b981">99.94%</text>
          <text x="254" y="58" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="end">0 Faults</text>
        </g>

        <g transform="translate(20, 224)">
          <rect width="270" height="74" rx="10" fill="#1e293b" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Average Trigger Latency</text>
          <text x="16" y="58" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#f59e0b">38 ms</text>
          <text x="254" y="58" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="end">Real-Time</text>
        </g>

        <g transform="translate(20, 310)">
          <text x="0" y="22" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1">Live Execution Audit</text>
          <rect y="32" width="270" height="120" rx="8" fill="#090d16" />
          <text x="12" y="55" font-family="monospace" font-size="11" fill="#10b981">✓ [09:41:02] Lead #10492 -&gt; Ent Queue</text>
          <text x="12" y="78" font-family="monospace" font-size="11" fill="#10b981">✓ [09:40:48] Opp #89201 -&gt; Slack Pinged</text>
          <text x="12" y="101" font-family="monospace" font-size="11" fill="#38bdf8">ℹ [09:40:15] Rule: Min ARR Check Passed</text>
          <text x="12" y="124" font-family="monospace" font-size="11" fill="#10b981">✓ [09:39:55] Contact field synced</text>
        </g>
      </g>
    </g>
  `
});

// 2. Real Estate CRM Dashboard
generators['real-estate-crm'] = () => windowWrapper({
  title: 'NURAX Real Estate CRM — Property Portfolio &amp; Deal Pipeline Manager',
  badge: 'Real Estate CRM Active',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <g transform="translate(0, 0)">
      ${[
        { label: 'Active Property Listings', val: '48 Properties', sub: '$32.4M Portfolio Value', color: '#38bdf8' },
        { label: 'Open Escrow &amp; Deals', val: '14 Deals In-Flight', sub: '$8.6M In Pipeline', color: '#10b981' },
        { label: 'Scheduled Showings', val: '28 This Week', sub: '92% Confirmation', color: '#f59e0b' },
        { label: 'Client Conversion Rate', val: '31.4%', sub: '+5.2% vs Last Mo', color: '#a855f7' }
      ].map((card, i) => `
        <g transform="translate(${i * 260}, 0)">
          <rect width="245" height="80" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">${card.label}</text>
          <text x="16" y="50" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="${card.color}">${card.val}</text>
          <text x="16" y="68" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#cbd5e1">${card.sub}</text>
        </g>
      `).join('')}
    </g>

    <g transform="translate(0, 100)">
      <g>
        <rect width="640" height="450" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="32" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f8fafc">Real Estate Sales Pipeline</text>

        <g transform="translate(20, 50)">
          ${[
            { stage: 'New Inquiries', count: '8', color: '#38bdf8', item1: '742 Highland Ave - $780k', item2: 'Buyer: Michael Vance' },
            { stage: 'Property Tour', count: '5', color: '#f59e0b', item1: 'Penthouse 14B - $1.45M', item2: 'Showing Today 4:00 PM' },
            { stage: 'Offer Made', count: '3', color: '#a855f7', item1: 'Oakwood Villa - $920k', item2: 'Counter Offer In Review' },
            { stage: 'Under Contract', count: '4', color: '#10b981', item1: 'Marina Bay Condo - $640k', item2: 'Closing in 4 Days' }
          ].map((col, idx) => `
            <g transform="translate(${idx * 152}, 0)">
              <rect width="144" height="370" rx="10" fill="#1e293b" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
              <rect width="144" height="34" rx="10" fill="${col.color}" fill-opacity="0.15" />
              <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="${col.color}">${col.stage} (${col.count})</text>
              
              <g transform="translate(8, 48)">
                <rect width="128" height="96" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1" />
                <rect x="8" y="10" width="40" height="16" rx="4" fill="${col.color}" fill-opacity="0.2" />
                <text x="28" y="22" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="${col.color}" text-anchor="middle">ACTIVE</text>
                <text x="8" y="44" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff">${col.item1}</text>
                <text x="8" y="64" font-family="system-ui, sans-serif" font-size="9" font-weight="500" fill="#94a3b8">${col.item2}</text>
                <rect x="8" y="76" width="60" height="12" rx="3" fill="#38bdf8" fill-opacity="0.2" />
                <text x="38" y="85" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#38bdf8" text-anchor="middle">PRIORITY</text>
              </g>
            </g>
          `).join('')}
        </g>
      </g>

      <g transform="translate(660, 0)">
        <rect width="360" height="450" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="32" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f8fafc">Featured Property Showcase</text>

        <g transform="translate(20, 50)">
          <rect width="320" height="170" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <rect x="12" y="12" width="296" height="85" rx="8" fill="#0369a1" />
          <rect x="40" y="30" width="60" height="67" fill="#0c4a6e" />
          <rect x="120" y="20" width="80" height="77" fill="#075985" />
          <rect x="220" y="40" width="70" height="57" fill="#0369a1" />
          <text x="16" y="120" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Grand Beverly Hills Penthouse</text>
          <text x="16" y="140" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#38bdf8">$2,450,000 • 4 Bed • 4.5 Bath • 3,850 sqft</text>
          <text x="16" y="158" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">Agent: Usman Iqbal • MLS #RE-2026-981</text>
        </g>

        <g transform="translate(20, 235)">
          <rect width="320" height="195" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">⚡ Smart CRM Automation Alert</text>
          <text x="16" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#f8fafc">Buyer Inquired: Sarah Jenkins</text>
          <text x="16" y="70" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#94a3b8">Lead Score: 95/100 (Pre-approved $2.5M mortgage)</text>
          
          <rect x="16" y="86" width="288" height="42" rx="6" fill="#0f172a" />
          <text x="26" y="105" font-family="monospace" font-size="11" fill="#38bdf8">SMS Auto-Sent: Showing confirmed!</text>
          <text x="26" y="120" font-family="monospace" font-size="10" fill="#64748b">Calendar invite &amp; brochure delivered</text>

          <rect x="16" y="142" width="138" height="34" rx="8" fill="#0284c7" />
          <text x="85" y="163" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">Call Lead</text>

          <rect x="166" y="142" width="138" height="34" rx="8" fill="#334155" />
          <text x="235" y="163" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#f8fafc" text-anchor="middle">Open Contract</text>
        </g>
      </g>
    </g>
  `
});

// 3. Parent/Guardian & Student Application System
generators['student-application'] = () => windowWrapper({
  title: 'Salesforce Education Cloud — Student Admissions &amp; Program Management Portal',
  badge: 'Admissions Portal Verified',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <g transform="translate(0, 0)">
      <rect width="1020" height="60" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
      ${[
        { step: '1. Parent Info', state: 'Complete', color: '#10b981' },
        { step: '2. Student Details', state: 'Complete', color: '#10b981' },
        { step: '3. Campus &amp; Program', state: 'Complete', color: '#10b981' },
        { step: '4. Document Review', state: 'Verified', color: '#10b981' },
        { step: '5. Admission Status', state: 'APPROVED', color: '#00DCA0' }
      ].map((st, i) => `
        <g transform="translate(${i * 204 + 12}, 12)">
          <circle cx="16" cy="18" r="12" fill="${st.color}" fill-opacity="0.2" stroke="${st.color}" stroke-width="1.5" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="${st.color}" text-anchor="middle">✓</text>
          <text x="36" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${st.step}</text>
          <text x="36" y="30" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="${st.color}">${st.state}</text>
        </g>
      `).join('')}
    </g>

    <g transform="translate(0, 80)">
      <g>
        <rect width="650" height="470" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#f8fafc">Application Dossier: #APP-2026-08412</text>
        
        <g transform="translate(24, 55)">
          <g transform="translate(0, 0)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">STUDENT FULL NAME</text>
            <rect y="22" width="280" height="38" rx="8" fill="#1e293b" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Ayaan Ahmed (6th Grade)</text>
          </g>
          <g transform="translate(320, 0)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">PARENT / GUARDIAN NAME</text>
            <rect y="22" width="280" height="38" rx="8" fill="#1e293b" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Dr. Tariq Ahmed (Verified)</text>
          </g>

          <g transform="translate(0, 75)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">SELECTED ACADEMIC PROGRAM</text>
            <rect y="22" width="280" height="38" rx="8" fill="#1e293b" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">After School Enrichment 2026</text>
          </g>
          <g transform="translate(320, 75)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">CO-ENROLLED PROGRAM</text>
            <rect y="22" width="280" height="38" rx="8" fill="#1e293b" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">Summer Day Camp 2026</text>
          </g>

          <g transform="translate(0, 150)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">CAMPUS ALLOCATION</text>
            <rect y="22" width="280" height="38" rx="8" fill="#1e293b" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">North Central Academy Campus</text>
          </g>
          <g transform="translate(320, 150)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">APPLICATION STATUS</text>
            <rect y="22" width="280" height="38" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="1" />
            <text x="14" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#34d399">ENROLLMENT CONFIRMED ✓</text>
          </g>
        </g>

        <g transform="translate(24, 275)">
          <text x="0" y="20" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1">Verified Document Attachments</text>
          <g transform="translate(0, 32)">
            ${[
              'Birth Certificate (PDF) • Verified by Registrar',
              'Immunization &amp; Health Clearance (PDF) • Cleared',
              'Previous Academic Transcript • Grade A Honors'
            ].map((doc, idx) => `
              <g transform="translate(0, ${idx * 38})">
                <rect width="600" height="30" rx="6" fill="#1e293b" />
                <circle cx="16" cy="15" r="7" fill="#10b981" />
                <text x="16" y="18" font-family="system-ui, sans-serif" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">✓</text>
                <text x="34" y="20" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#f8fafc">${doc}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <g transform="translate(670, 0)">
        <rect width="350" height="470" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f8fafc">Admissions Overview</text>

        <g transform="translate(20, 55)">
          <rect width="310" height="84" rx="10" fill="#1e293b" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Active Program Capacity</text>
          <text x="16" y="58" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#38bdf8">420 / 450 Seats</text>
          <text x="290" y="58" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">93% Full</text>
        </g>

        <g transform="translate(20, 150)">
          <rect width="310" height="84" rx="10" fill="#1e293b" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Total Applications Processed</text>
          <text x="16" y="58" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#10b981">1,248 Apps</text>
          <text x="290" y="58" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="end">Salesforce CRM</text>
        </g>

        <g transform="translate(20, 248)">
          <rect width="310" height="195" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Parent Automated Communication</text>
          <rect x="16" y="40" width="278" height="65" rx="8" fill="#0f172a" />
          <text x="26" y="62" font-family="monospace" font-size="10" fill="#34d399">Email Sent: Welcome Packet &amp; Schedule</text>
          <text x="26" y="80" font-family="monospace" font-size="10" fill="#94a3b8">SMS Alert: Enrollment Confirmed for Ayaan</text>
          <text x="26" y="96" font-family="monospace" font-size="10" fill="#64748b">Student Portal Login credentials active</text>

          <rect x="16" y="125" width="278" height="42" rx="8" fill="#059669" />
          <text x="155" y="152" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Generate Official Admission Letter</text>
        </g>
      </g>
    </g>
  `
});

// 4. Capricorn Coffee Equipment Case Management
generators['capricorn-coffee'] = () => windowWrapper({
  title: 'Salesforce Service Cloud &amp; Agentforce — Commercial Equipment Case Management',
  badge: 'Agentforce AI Active',
  bgGradient: ['#0f172a', '#311006'],
  bodyContent: `
    <g transform="translate(0, 0)">
      <rect width="1020" height="58" rx="10" fill="#1e293b" stroke="#f97316" stroke-width="1" />
      <g transform="translate(20, 16)">
        <rect width="70" height="24" rx="4" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1" />
        <text x="35" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="900" fill="#ef4444" text-anchor="middle">HIGH PRIORITY</text>
        <text x="85" y="18" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#f8fafc">Case #50841 — Commercial Espresso Steam Valve Malfunction</text>
        <text x="680" y="18" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#fdba74">Capricorn Coffee Store #104 (Downtown)</text>
      </g>
    </g>

    <g transform="translate(0, 75)">
      <g>
        <rect width="580" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="32" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f8fafc">Equipment Asset Telemetry</text>

        <g transform="translate(24, 52)">
          <rect width="532" height="130" rx="10" fill="#1e293b" />
          <g transform="translate(18, 24)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">INSTALLED ASSET</text>
            <text x="0" y="36" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Barista Pro Master IV (Dual Boiler)</text>
            <text x="0" y="58" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#38bdf8">Serial: #CP-98402-EXP • Warranty: Active Gold SLA</text>

            <rect x="360" y="0" width="130" height="74" rx="8" fill="#0f172a" />
            <text x="425" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle">BOILER PRESSURE</text>
            <text x="425" y="52" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#ef4444" text-anchor="middle">0.4 BAR ⚠</text>
            <text x="425" y="66" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#ef4444" text-anchor="middle">LOW THRESHOLD</text>
          </g>
        </g>

        <g transform="translate(24, 205)">
          <text x="0" y="20" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#cbd5e1">Automated Incident Timeline</text>
          <g transform="translate(0, 35)">
            ${[
              { time: '08:12 AM', text: 'IoT telemetry sensor flagged pressure drop below 0.8 bar', color: '#f59e0b' },
              { time: '08:14 AM', text: 'Salesforce Agentforce auto-created Case #50841', color: '#38bdf8' },
              { time: '08:15 AM', text: 'Store Manager notified via automated SMS &amp; Store Portal', color: '#10b981' },
              { time: '08:16 AM', text: 'Agentforce matched replacement valve kit in inventory', color: '#a855f7' }
            ].map((ev, i) => `
              <g transform="translate(0, ${i * 48})">
                <circle cx="10" cy="12" r="5" fill="${ev.color}" />
                <line x1="10" y1="20" x2="10" y2="44" stroke="#334155" stroke-width="1.5" />
                <text x="26" y="16" font-family="monospace" font-size="11" font-weight="700" fill="#94a3b8">${ev.time}</text>
                <text x="100" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="500" fill="#f8fafc">${ev.text}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <g transform="translate(600, 0)">
        <rect width="420" height="475" rx="14" fill="#0f172a" stroke="#f97316" stroke-width="1.5" />
        
        <g transform="translate(20, 20)">
          <circle cx="16" cy="16" r="14" fill="#ea580c" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">⚡</text>
          <text x="40" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Agentforce AI Service Agent</text>
          <text x="40" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#fb923c">Autonomous Triage &amp; Resolution Engine</text>
        </g>

        <g transform="translate(20, 75)">
          <rect width="380" height="150" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">DIAGNOSTIC REASONING</text>
          <text x="16" y="50" font-family="system-ui, sans-serif" font-size="12" font-weight="400" fill="#e2e8f0">
            Based on error code ERR-SV04 and sensor telemetry from Barista Pro #CP-98402, the primary solenoid valve has a mechanical seal leak. Preventive shutdown initiated to avoid thermal runaway.
          </text>
          <rect x="16" y="105" width="348" height="30" rx="6" fill="#0f172a" />
          <text x="26" y="125" font-family="monospace" font-size="11" fill="#10b981">Confidence: 98.4% (Matched 14 similar cases)</text>
        </g>

        <g transform="translate(20, 245)">
          <text x="0" y="18" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1">Recommended Next Actions</text>
          <g transform="translate(0, 28)">
            <rect width="380" height="50" rx="8" fill="#1e293b" />
            <text x="16" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Dispatch Tech: Dave Wilson (ETA 45 mins)</text>
            <text x="16" y="38" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">Nearest certified technician with valve replacement kit</text>
            <rect x="290" y="10" width="76" height="28" rx="6" fill="#ea580c" />
            <text x="328" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">DISPATCH</text>
          </g>

          <g transform="translate(0, 90)">
            <rect width="380" height="50" rx="8" fill="#1e293b" />
            <text x="16" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Send Automated Downtime Compensation</text>
            <text x="16" y="38" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">Credit $250 coffee beans to Store #104 SLA account</text>
            <rect x="290" y="10" width="76" height="28" rx="6" fill="#10b981" />
            <text x="328" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">APPROVE</text>
          </g>
        </g>

        <g transform="translate(20, 415)">
          <rect width="380" height="42" rx="8" fill="#047857" />
          <text x="190" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Agentforce Case Triage Completed (0 Manual Clicks)</text>
        </g>
      </g>
    </g>
  `
});

// 5. GoHighLevel Funnel & Workflow Automation
generators['ghl-funnel'] = () => windowWrapper({
  title: 'GoHighLevel (GHL) — Marketing Automation Funnel &amp; Lead Nurture Engine',
  badge: 'GHL Automation Active',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <g transform="translate(0, 0)">
      ${[
        { label: 'Opt-in Funnel Visitors', val: '4,820 Leads', sub: '34.8% Opt-In Rate', color: '#38bdf8' },
        { label: 'SMS &amp; Email Deliverability', val: '99.4%', sub: 'Instant 2-way Trigger', color: '#10b981' },
        { label: 'Appointments Booked', val: '142 Calls', sub: 'Calendar Synced', color: '#f59e0b' },
        { label: 'Pipeline Closed Value', val: '$184,500', sub: 'High-Ticket CRM', color: '#a855f7' }
      ].map((card, i) => `
        <g transform="translate(${i * 260}, 0)">
          <rect width="245" height="74" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">${card.label}</text>
          <text x="16" y="46" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="${card.color}">${card.val}</text>
          <text x="16" y="62" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#cbd5e1">${card.sub}</text>
        </g>
      `).join('')}
    </g>

    <g transform="translate(0, 95)">
      <rect width="1020" height="455" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
      <text x="30" y="36" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Automated Multi-Channel Follow-Up Sequence</text>

      <g transform="translate(30, 60)">
        <g transform="translate(0, 20)">
          <rect width="165" height="110" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <rect width="165" height="26" rx="10" fill="#0284c7" />
          <text x="82" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">TRIGGER ⚡</text>
          <text x="12" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Opt-In Form Submitted</text>
          <text x="12" y="72" font-family="system-ui, sans-serif" font-size="10" font-weight="400" fill="#94a3b8">Name, Email, Phone</text>
          <text x="12" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="400" fill="#10b981">✓ Privacy Verified</text>
        </g>

        <line x1="165" y1="75" x2="205" y2="75" stroke="#38bdf8" stroke-width="2" />
        <polygon points="205,71 213,75 205,79" fill="#38bdf8" />

        <g transform="translate(215, 20)">
          <rect width="165" height="110" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5" />
          <rect width="165" height="26" rx="10" fill="#059669" />
          <text x="82" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">ACTION: SMS (0 MIN)</text>
          <text x="12" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Personalized SMS</text>
          <text x="12" y="70" font-family="monospace" font-size="9" fill="#a7f3d0">Hey name, booking link inside</text>
          <text x="12" y="94" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#10b981">Delivered: 99.8%</text>
        </g>

        <line x1="380" y1="75" x2="420" y2="75" stroke="#10b981" stroke-width="2" />
        <polygon points="420,71 428,75 420,79" fill="#10b981" />

        <g transform="translate(430, 20)">
          <rect width="155" height="110" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
          <rect width="155" height="26" rx="10" fill="#d97706" />
          <text x="77" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">TIME DELAY ⏳</text>
          <text x="12" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Wait 15 Minutes</text>
          <text x="12" y="72" font-family="system-ui, sans-serif" font-size="10" font-weight="400" fill="#94a3b8">If calendar unbooked</text>
          <text x="12" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#fde68a">Condition Evaluator</text>
        </g>

        <line x1="585" y1="75" x2="625" y2="75" stroke="#f59e0b" stroke-width="2" />
        <polygon points="625,71 633,75 625,79" fill="#f59e0b" />

        <g transform="translate(635, 20)">
          <rect width="165" height="110" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
          <rect width="165" height="26" rx="10" fill="#7e22ce" />
          <text x="82" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle">EMAIL CADENCE ✉</text>
          <text x="12" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Case Study Video</text>
          <text x="12" y="70" font-family="monospace" font-size="9" fill="#e9d5ff">How client gained +40% ROI</text>
          <text x="12" y="94" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#c084fc">Open Rate: 62%</text>
        </g>

        <line x1="800" y1="75" x2="840" y2="75" stroke="#a855f7" stroke-width="2" />
        <polygon points="840,71 848,75 840,79" fill="#a855f7" />

        <g transform="translate(850, 20)">
          <rect width="140" height="110" rx="10" fill="#1e293b" stroke="#00DCA0" stroke-width="1.5" />
          <rect width="140" height="26" rx="10" fill="#00DCA0" fill-opacity="0.3" />
          <text x="70" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#00DCA0" text-anchor="middle">CRM UPDATE 🎯</text>
          <text x="10" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Pipeline: Hot</text>
          <text x="10" y="70" font-family="system-ui, sans-serif" font-size="10" font-weight="400" fill="#cbd5e1">Notify Sales Rep</text>
          <text x="10" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#00DCA0">Task Created</text>
        </g>
      </g>

      <g transform="translate(30, 210)">
        <rect width="960" height="160" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Live Funnel Drop-off &amp; Conversion Analytics</text>
          <g transform="translate(0, 30)">
            <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">1. Landing Page Opt-in (4,820)</text>
            <rect y="22" width="550" height="12" rx="6" fill="#334155" />
            <rect y="22" width="550" height="12" rx="6" fill="#38bdf8" />

            <text x="0" y="54" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">2. SMS Follow-up Engaged (3,920)</text>
            <rect y="62" width="550" height="12" rx="6" fill="#334155" />
            <rect y="62" width="446" height="12" rx="6" fill="#10b981" />

            <text x="0" y="94" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">3. Booked Demo Calls (142 closed)</text>
            <rect y="102" width="550" height="12" rx="6" fill="#334155" />
            <rect y="102" width="220" height="12" rx="6" fill="#00DCA0" />
          </g>

          <g transform="translate(600, 20)">
            <rect width="320" height="96" rx="8" fill="#0f172a" />
            <text x="16" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">High-Converting GHL Setup</text>
            <text x="16" y="50" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Automated SMS reply handling with AI</text>
            <text x="16" y="68" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Zapier &amp; Stripe payment synchronization</text>
            <text x="16" y="86" font-family="system-ui, sans-serif" font-size="11" fill="#10b981">• Zero lead slippage across 24/7 campaigns</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 6. NURAX CRM — AI-Powered Multi-Agent CRM
generators['nurax-crm'] = () => windowWrapper({
  title: 'NURAX CRM — Autonomous Multi-Agent Sales &amp; Predictive Intelligence Hub',
  badge: 'Autonomous Multi-Agent',
  bgGradient: ['#030712', '#0f172a'],
  bodyContent: `
    <g transform="translate(0, 0)">
      ${[
        { name: 'Lead Intelligence Agent', role: 'Autonomous Inbound Scoring', status: 'Active (34 leads evaluated)', color: '#00DCA0', icon: '🧠' },
        { name: 'Deal Predictor Agent', role: 'Q4 Revenue Forecasting ($1.4M)', status: '88% Win Probability', color: '#38bdf8', icon: '📈' },
        { name: 'Auto-Outreach Agent', role: 'Dynamic Email &amp; Cadence', status: '62 Follow-ups Drafted', color: '#a855f7', icon: '✉' }
      ].map((agent, i) => `
        <g transform="translate(${i * 350}, 0)">
          <rect width="330" height="90" rx="12" fill="#111827" stroke="${agent.color}" stroke-width="1.2" />
          <g transform="translate(18, 18)">
            <circle cx="16" cy="16" r="16" fill="${agent.color}" fill-opacity="0.15" />
            <text x="16" y="22" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">${agent.icon}</text>
            <text x="42" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">${agent.name}</text>
            <text x="42" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#9ca3af">${agent.role}</text>
            <text x="42" y="52" font-family="monospace" font-size="11" font-weight="700" fill="${agent.color}">● ${agent.status}</text>
          </g>
        </g>
      `).join('')}
    </g>

    <g transform="translate(0, 110)">
      <g>
        <rect width="630" height="440" rx="14" fill="#111827" stroke="#1f2937" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Predictive Opportunity Forecast (AI-Verified)</text>
        
        <g transform="translate(24, 55)">
          <rect width="582" height="30" rx="6" fill="#1f2937" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#9ca3af">OPPORTUNITY</text>
          <text x="210" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#9ca3af">ARR VALUE</text>
          <text x="320" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#9ca3af">AI AGENT PREDICTION</text>
          <text x="500" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#9ca3af">CONFIDENCE</text>

          ${[
            { opp: 'Apex Global Cloud Migration', val: '$240,000', pred: 'Will close by Nov 12', conf: '94% High', color: '#10b981' },
            { opp: 'FinEdge Core Banking CRM', val: '$380,000', pred: 'Decision maker booked', conf: '91% High', color: '#10b981' },
            { opp: 'HealthSync HIPAA Integration', val: '$165,000', pred: 'Contract in legal review', conf: '86% Med', color: '#38bdf8' },
            { opp: 'OmniRetail Point of Sale', val: '$95,000', pred: 'Proposal accepted', conf: '98% Won', color: '#00DCA0' },
            { opp: 'Urban Logistics Flow Setup', val: '$140,000', pred: 'Follow-up requested', conf: '78% Med', color: '#f59e0b' }
          ].map((row, idx) => `
            <g transform="translate(0, ${idx * 48 + 38})">
              <rect width="582" height="40" rx="6" fill="#1f2937" fill-opacity="0.4" />
              <text x="16" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${row.opp}</text>
              <text x="210" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#38bdf8">${row.val}</text>
              <text x="320" y="25" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#e5e7eb">${row.pred}</text>
              <rect x="500" y="10" width="70" height="22" rx="4" fill="${row.color}" fill-opacity="0.2" />
              <text x="535" y="25" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="${row.color}" text-anchor="middle">${row.conf}</text>
            </g>
          `).join('')}
        </g>

        <g transform="translate(24, 380)">
          <rect width="582" height="42" rx="8" fill="#00DCA0" fill-opacity="0.1" stroke="#00DCA0" stroke-width="1" />
          <text x="20" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#00DCA0">Total AI-Predicted Q4 Close: $1,020,000</text>
          <text x="562" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="end">3 Autonomous Agents In Sync</text>
        </g>
      </g>

      <g transform="translate(650, 0)">
        <rect width="370" height="440" rx="14" fill="#111827" stroke="#1f2937" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Autonomous Action Stream</text>

        <g transform="translate(20, 55)">
          ${[
            { agent: 'Lead Agent', msg: 'Evaluated inbound form from FinEdge. ICP fit: 98/100.', time: '2m ago', color: '#00DCA0' },
            { agent: 'Outreach Agent', msg: 'Generated personalized enterprise proposal draft.', time: '5m ago', color: '#a855f7' },
            { agent: 'Predictor Agent', msg: 'Adjusted Q4 win rate from 84% to 88% based on call transcript.', time: '12m ago', color: '#38bdf8' },
            { agent: 'Lead Agent', msg: 'Auto-enriched company data: 450 employees, Series B.', time: '18m ago', color: '#00DCA0' }
          ].map((log, i) => `
            <g transform="translate(0, ${i * 88})">
              <rect width="330" height="76" rx="10" fill="#1f2937" />
              <circle cx="16" cy="18" r="5" fill="${log.color}" />
              <text x="28" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="${log.color}">${log.agent}</text>
              <text x="314" y="22" font-family="monospace" font-size="10" fill="#6b7280" text-anchor="end">${log.time}</text>
              <text x="16" y="44" font-family="system-ui, sans-serif" font-size="11" font-weight="400" fill="#e5e7eb">${log.msg.slice(0, 42)}</text>
              <text x="16" y="60" font-family="system-ui, sans-serif" font-size="11" font-weight="400" fill="#e5e7eb">${log.msg.slice(42)}</text>
            </g>
          `).join('')}
        </g>
      </g>
    </g>
  `
});

// 7. Salesforce CRM Integration Ecosystem
generators['salesforce-ecosystem'] = () => windowWrapper({
  title: 'Enterprise Architecture — Salesforce CRM Unified Integration Ecosystem',
  badge: 'API Hub Active',
  bgGradient: ['#0f172a', '#032D60'],
  bodyContent: `
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="10" fill="#1e293b" />
      <text x="24" y="31" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#f8fafc">Multi-Platform Enterprise Architecture &amp; Data Synchronization</text>
      <text x="996" y="31" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Status: 100% Operational (0 Faults)</text>
    </g>

    <g transform="translate(0, 70)">
      <rect width="1020" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />

      <g transform="translate(385, 140)">
        <rect width="250" height="200" rx="20" fill="#032D60" stroke="#0176D3" stroke-width="3" />
        <circle cx="125" cy="65" r="32" fill="#0176D3" />
        <text x="125" y="73" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">SF</text>
        <text x="125" y="125" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">Salesforce Core CRM</text>
        <text x="125" y="145" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#7dd3fc" text-anchor="middle">Objects • Flows • Data Cloud</text>
        <rect x="50" y="160" width="150" height="24" rx="12" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" />
        <text x="125" y="176" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#10b981" text-anchor="middle">● Central Single Source of Truth</text>
      </g>

      ${[
        { name: 'Full-Stack Web Portals', tech: 'Next.js / REST API / GraphQL', x: 60, y: 35, color: '#38bdf8', icon: '🌐' },
        { name: 'Mobile Applications', tech: 'Android Java / iOS / Firebase Sync', x: 740, y: 35, color: '#a855f7', icon: '📱' },
        { name: 'Payment Gateways', tech: 'Stripe Webhooks / Auto Invoicing', x: 60, y: 320, color: '#10b981', icon: '💳' },
        { name: 'Omnichannel Communication', tech: 'WhatsApp API / EmailJS / Slack', x: 740, y: 320, color: '#f59e0b', icon: '💬' }
      ].map(node => `
        <g transform="translate(${node.x}, ${node.y})">
          <rect width="220" height="110" rx="14" fill="#1e293b" stroke="${node.color}" stroke-width="1.5" />
          <g transform="translate(16, 18)">
            <text x="0" y="16" font-family="system-ui, sans-serif" font-size="20">${node.icon}</text>
            <text x="32" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${node.name}</text>
            <text x="0" y="44" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="${node.color}">${node.tech}</text>
            <rect y="56" width="188" height="22" rx="4" fill="#0f172a" />
            <text x="10" y="71" font-family="monospace" font-size="9" fill="#10b981">✓ Bi-directional Sync Active</text>
          </g>
        </g>
      `).join('')}

      <path d="M280,90 L385,200" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
      <path d="M740,90 L635,200" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="6,4" />
      <path d="M280,375 L385,280" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="6,4" />
      <path d="M740,375 L635,280" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />

      <g transform="translate(385, 390)">
        <rect width="250" height="60" rx="10" fill="#1e1b4b" stroke="#818cf8" stroke-width="1.5" />
        <text x="125" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#c7d2fe" text-anchor="middle">AI Agentforce &amp; LLM Subagents</text>
        <text x="125" y="44" font-family="monospace" font-size="10" fill="#818cf8" text-anchor="middle">OpenAI &amp; Anthropic REST Endpoints</text>
      </g>
      <line x1="510" y1="340" x2="510" y2="390" stroke="#818cf8" stroke-width="2" stroke-dasharray="4,4" />
    </g>
  `
});

async function run() {
  console.log('Generating Category 1: Salesforce & CRM Projects (7 projects)...');
  for (const [key, fn] of Object.entries(generators)) {
    const dest = path.join(outDir, `${key}.jpg`);
    const svg = fn();
    await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`✓ [1/4] ${key}.jpg (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

run();
