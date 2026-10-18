const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { windowWrapper, outDir } = require('./visual-templates');

const generators = {};

// 29. Real-Time Traffic Light Control via Flow Density
generators['traffic-light-control'] = () => windowWrapper({
  title: 'Real-Time Traffic Light Control via Flow Density (CCTV Computer Vision & Adaptive Timing)',
  badge: 'Smart City AI Online',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <!-- Top Intersection Status Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.2" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Intersection: Gulberg Main Boulevard &amp; Jail Road (4-Way CCTV Active)</text>
        <rect x="730" y="-4" width="260" height="30" rx="6" fill="#10b981" fill-opacity="0.2" />
        <text x="860" y="16" font-family="monospace" font-size="11" font-weight="800" fill="#10b981" text-anchor="middle">DYNAMIC TIMING: +35s GREEN</text>
      </g>
    </g>

    <!-- 4 CCTV Feeds & Real-Time Flow Analytics -->
    <g transform="translate(0, 75)">
      <!-- Left: 4-Way CCTV Multi-Cam View (580 width) -->
      <g>
        <rect width="580" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Live Intersection Camera Feeds (YOLO Vehicle Detection)</text>
          
          <!-- 4 Camera Quadrants -->
          <g transform="translate(0, 30)">
            ${[
              { name: 'CAM-01: Northbound', cars: 28, status: 'HIGH DENSITY', color: '#10b981', signal: '🟢 GREEN (38s)' },
              { name: 'CAM-02: Southbound', cars: 24, status: 'HIGH DENSITY', color: '#10b981', signal: '🟢 GREEN (38s)' },
              { name: 'CAM-03: Eastbound', cars: 6, status: 'LOW DENSITY', color: '#ef4444', signal: '🔴 RED (14s)' },
              { name: 'CAM-04: Westbound', cars: 4, status: 'LOW DENSITY', color: '#ef4444', signal: '🔴 RED (14s)' }
            ].map((cam, idx) => {
              const x = (idx % 2) * 275;
              const y = Math.floor(idx / 2) * 190;
              return `
                <g transform="translate(${x}, ${y})">
                  <rect width="265" height="175" rx="8" fill="#111827" stroke="#334155" stroke-width="1" />
                  
                  <!-- Asphalt Road & Traffic Markings -->
                  <rect x="8" y="8" width="249" height="105" rx="6" fill="#1e293b" />
                  <line x1="132" y1="12" x2="132" y2="108" stroke="#ffffff" stroke-width="2" stroke-dasharray="6,4" />
                  
                  <!-- Vehicle AI Detection Bounding Boxes -->
                  <rect x="35" y="30" width="40" height="55" rx="3" fill="none" stroke="#00DCA0" stroke-width="1.5" />
                  <text x="35" y="25" font-family="monospace" font-size="8" fill="#00DCA0">Car 98%</text>

                  <rect x="85" y="45" width="38" height="50" rx="3" fill="none" stroke="#00DCA0" stroke-width="1.5" />
                  <text x="85" y="40" font-family="monospace" font-size="8" fill="#00DCA0">Car 95%</text>

                  <rect x="155" y="25" width="55" height="75" rx="3" fill="none" stroke="#38bdf8" stroke-width="1.5" />
                  <text x="155" y="20" font-family="monospace" font-size="8" fill="#38bdf8">Bus 96%</text>

                  <!-- Camera Label & Counts -->
                  <g transform="translate(10, 128)">
                    <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${cam.name}</text>
                    <text x="0" y="30" font-family="monospace" font-size="10" fill="#94a3b8">Vehicles: ${cam.cars} • ${cam.status}</text>
                    <text x="245" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="${cam.color}" text-anchor="end">${cam.signal}</text>
                  </g>
                </g>
              `;
            }).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Density Algorithms & Signal Optimization (420 width) -->
      <g transform="translate(600, 0)">
        <rect width="420" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Adaptive Signal Optimization</text>

          <g transform="translate(0, 35)">
            <rect width="372" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981">DECISION LOGIC: VEHICLE DENSITY RATIO</text>
              <text x="0" y="40" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">North-South Corridor: 52 vehicles (83.8% of total flow)</text>
              <text x="0" y="60" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">East-West Corridor: 10 vehicles (16.2% of total flow)</text>
              
              <rect y="75" width="340" height="45" rx="6" fill="#090d16" />
              <text x="12" y="95" font-family="monospace" font-size="10" fill="#00DCA0">Decision: Extend North-South Green +35s</text>
              <text x="12" y="110" font-family="monospace" font-size="10" fill="#94a3b8">Prevents intersection gridlock &amp; idling emissions</text>
            </g>

            <rect y="170" width="372" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">IMPACT &amp; PERFORMANCE METRICS</text>
              <text x="0" y="42" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">• Average Queue Delay: -42.8% Reduction</text>
              <text x="0" y="66" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">• Emergency Vehicle Preemption: Supported</text>
              <text x="0" y="90" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">• Fuel Consumption Saved: ~18% at Peak Hours</text>
              <text x="0" y="114" font-family="monospace" font-size="11" fill="#10b981">● OpenCV + YOLOv8 + Python Dynamic Schedulers</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 30. Food Donation & NGO Coordination Platform
generators['food-donation-platform'] = () => windowWrapper({
  title: 'Food Donation &amp; NGO Coordination Platform — Surplus Food Rescue Network',
  badge: 'Social Impact Verified',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <!-- Top Impact Banner -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">FoodShare Network • Connecting Commercial Kitchens to Verified NGOs</text>
        <text x="996" y="16" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">18,450 Meals Rescued to Date</text>
      </g>
    </g>

    <!-- Map & Active Surplus Postings -->
    <g transform="translate(0, 75)">
      <!-- Left: Interactive City Dispatch Map (540 width) -->
      <g>
        <rect width="540" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Active Food Rescue Dispatch Map</text>
          
          <!-- Map canvas -->
          <g transform="translate(0, 35)">
            <rect width="492" height="340" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1" />
            <!-- Roads -->
            <path d="M40,50 Q200,120 450,100" fill="none" stroke="#1e293b" stroke-width="8" />
            <path d="M100,280 Q250,200 400,300" fill="none" stroke="#1e293b" stroke-width="8" />
            <line x1="250" y1="20" x2="250" y2="320" stroke="#1e293b" stroke-width="8" />

            <!-- Pickup Points (Restaurants) -->
            <circle cx="150" cy="90" r="14" fill="#f59e0b" />
            <text x="150" y="95" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">🍲</text>
            <rect x="80" y="112" width="140" height="22" rx="4" fill="#111827" />
            <text x="150" y="126" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#fde68a" text-anchor="middle">Pearl Continental Bistro (50 Meals)</text>

            <circle cx="340" cy="180" r="14" fill="#f59e0b" />
            <text x="340" y="185" font-family="system-ui, sans-serif" font-size="11" text-anchor="middle">🥖</text>
            <rect x="270" y="202" width="140" height="22" rx="4" fill="#111827" />
            <text x="340" y="216" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#fde68a" text-anchor="middle">City Bakery Central (30 Loaves)</text>

            <!-- Dropoff NGO Shelter -->
            <circle cx="250" cy="270" r="16" fill="#10b981" />
            <text x="250" y="275" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">🏠</text>
            <rect x="170" y="295" width="160" height="22" rx="4" fill="#111827" />
            <text x="250" y="310" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#86efac" text-anchor="middle">Hope Welfare Home (Verified NGO)</text>
          </g>

          <text x="0" y="415" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">Real-time volunteer courier routing &amp; hygiene compliance tracking</text>
        </g>
      </g>

      <!-- Right: Live Surplus Donations List (450 width) -->
      <g transform="translate(570, 0)">
        <rect width="450" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Available Surplus Food Donations</text>

          <g transform="translate(0, 35)">
            ${[
              { donor: 'Grand Bistro Lahore', item: '50 Hot Packaged Meals (Biryani &amp; Chicken)', time: 'Pickup by 9:00 PM', status: 'CLAIMED', color: '#10b981' },
              { donor: 'Delight Bakery Gulberg', item: '35 Fresh Bread Loaves &amp; Pastries', time: 'Pickup by 8:30 PM', status: 'OPEN', color: '#f59e0b' },
              { donor: 'Royal Palace Banquets', item: '80 Catering Meals (Chilled Containers)', time: 'Pickup by 10:00 PM', status: 'IN TRANSIT', color: '#38bdf8' }
            ].map((d, i) => `
              <g transform="translate(0, ${i * 125})">
                <rect width="402" height="110" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
                <g transform="translate(16, 18)">
                  <text x="0" y="14" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${d.donor}</text>
                  <rect x="280" y="0" width="90" height="22" rx="4" fill="${d.color}" fill-opacity="0.2" />
                  <text x="325" y="15" font-family="monospace" font-size="10" font-weight="800" fill="${d.color}" text-anchor="middle">${d.status}</text>
                  
                  <text x="0" y="40" font-family="system-ui, sans-serif" font-size="11.5" font-weight="600" fill="#e2e8f0">${d.item}</text>
                  <text x="0" y="64" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">⏰ ${d.time} • Food Safety Sealed ✓</text>
                </g>
              </g>
            `).join('')}
          </g>
        </g>
      </g>
    </g>
  `
});

// 31. Library Management System
generators['library-management'] = () => windowWrapper({
  title: 'Library Management System — Book Inventory &amp; Member Circulation (C++ / OOP)',
  badge: 'C++ Software Active',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <!-- Top Search Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="8" fill="#1e293b" />
      <g transform="translate(20, 16)">
        <text x="0" y="16" font-family="monospace" font-size="13" font-weight="700" fill="#38bdf8">SEARCH: [ISBN: 978-0131103627] OR Title: "Algorithms"</text>
        <text x="980" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Library Database: 14,820 Books</text>
      </g>
    </g>

    <!-- Main Book Catalog Table & Member Record -->
    <g transform="translate(0, 70)">
      <!-- Left: Book Ledger Table (650 width) -->
      <g>
        <rect width="650" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Book Catalog Inventory (C++ OOP Class Structure)</text>
          
          <g transform="translate(0, 32)">
            <rect width="602" height="28" rx="4" fill="#1e293b" />
            <text x="12" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">ISBN</text>
            <text x="150" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">TITLE &amp; AUTHOR</text>
            <text x="430" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">SHELF</text>
            <text x="520" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">STATUS</text>

            ${[
              { isbn: '978-0131103627', title: 'The C Programming Language (2nd Ed)', auth: 'Kernighan &amp; Ritchie', shelf: 'CS-B02', status: 'AVAILABLE', color: '#10b981' },
              { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', auth: 'Cormen, Leiserson, Rivest', shelf: 'CS-A01', status: 'ISSUED', color: '#f59e0b' },
              { isbn: '978-0132350884', title: 'Clean Code: Agile Software Craft', auth: 'Robert C. Martin', shelf: 'SE-D04', status: 'AVAILABLE', color: '#10b981' },
              { isbn: '978-0134685991', title: 'Effective Java (3rd Edition)', auth: 'Joshua Bloch', shelf: 'CS-C03', status: 'ISSUED', color: '#f59e0b' },
              { isbn: '978-0201633610', title: 'Design Patterns: Elements of OOP', auth: 'Gang of Four (GoF)', shelf: 'SE-A02', status: 'AVAILABLE', color: '#10b981' }
            ].map((bk, idx) => `
              <g transform="translate(0, ${idx * 56 + 36})">
                <rect width="602" height="48" rx="6" fill="#1e293b" fill-opacity="0.6" />
                <text x="12" y="24" font-family="monospace" font-size="11" fill="#38bdf8">${bk.isbn}</text>
                <text x="150" y="20" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#ffffff">${bk.title}</text>
                <text x="150" y="36" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">${bk.auth}</text>
                <text x="430" y="28" font-family="monospace" font-size="11" fill="#cbd5e1">${bk.shelf}</text>
                <rect x="520" y="14" width="70" height="20" rx="4" fill="${bk.color}" fill-opacity="0.2" />
                <text x="555" y="28" font-family="monospace" font-size="9" font-weight="800" fill="${bk.color}" text-anchor="middle">${bk.status}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Issue/Return Console & Member Record (340 width) -->
      <g transform="translate(680, 0)">
        <rect width="340" height="480" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Member Circulation Terminal</text>

          <g transform="translate(0, 32)">
            <rect width="300" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">STUDENT PROFILE</text>
              <text x="0" y="38" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Usman Iqbal (BCS-F22-084)</text>
              <text x="0" y="58" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Degree: BS Computer Science</text>
              <text x="0" y="78" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Active Borrowed Books: 1 Book</text>
              <text x="0" y="98" font-family="system-ui, sans-serif" font-size="11" fill="#10b981">Overdue Fines: $0.00 (Cleared)</text>
            </g>

            <!-- Actions -->
            <g transform="translate(0, 170)">
              <rect width="300" height="42" rx="8" fill="#0284c7" />
              <text x="150" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Issue Book to Member</text>

              <rect y="55" width="300" height="42" rx="8" fill="#10b981" />
              <text x="150" y="81" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Return Book &amp; Calculate Fine</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 32. Banking Management System
generators['banking-management'] = () => windowWrapper({
  title: 'Banking Management System — Account Operations &amp; Ledger Terminal (C++ / OOP)',
  badge: 'Core Banking Online',
  bgGradient: ['#0f172a', '#0284c7'],
  bodyContent: `
    <!-- Top Account Overview Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#0284c7" stroke-width="1.2" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Account Holder: Usman Iqbal • Account #1008-4921-8840</text>
        <text x="640" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Account Type: Premier Checking</text>
        <text x="996" y="16" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Status: KYC Verified ✓</text>
      </g>
    </g>

    <!-- Main Ledger & Transaction Operations -->
    <g transform="translate(0, 75)">
      <!-- Left: Ledger Table (650 width) -->
      <g>
        <rect width="650" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Audit Ledger (C++ Transaction Class Linked-List)</text>
          
          <g transform="translate(0, 32)">
            <rect width="602" height="28" rx="4" fill="#1e293b" />
            <text x="12" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">DATE</text>
            <text x="110" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">TRANSACTION DETAILS</text>
            <text x="420" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">AMOUNT</text>
            <text x="520" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">BALANCE</text>

            ${[
              { date: '2026-10-18', desc: 'Direct Client Inbound Wire Transfer', amt: '+$14,500.00', bal: '$68,450.00', pos: true },
              { date: '2026-10-15', desc: 'Enterprise Cloud Infrastructure Host', amt: '-$420.00', bal: '$53,950.00', pos: false },
              { date: '2026-10-12', desc: 'ATM Cash Withdrawal (Gulberg Branch)', amt: '-$300.00', bal: '$54,370.00', pos: false },
              { date: '2026-10-08', desc: 'Quarterly Commercial Dividend Payout', amt: '+$8,200.00', bal: '$54,670.00', pos: true },
              { date: '2026-10-01', desc: 'Office Lease &amp; Workspace Retainer', amt: '-$1,850.00', bal: '$46,470.00', pos: false }
            ].map((tx, idx) => `
              <g transform="translate(0, ${idx * 56 + 36})">
                <rect width="602" height="48" rx="6" fill="#1e293b" fill-opacity="0.6" />
                <text x="12" y="28" font-family="monospace" font-size="11" fill="#94a3b8">${tx.date}</text>
                <text x="110" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${tx.desc}</text>
                <text x="490" y="28" font-family="monospace" font-size="12" font-weight="800" fill="${tx.pos ? '#10b981' : '#f87171'}" text-anchor="end">${tx.amt}</text>
                <text x="590" y="28" font-family="monospace" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="end">${tx.bal}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Current Balance & Operations (340 width) -->
      <g transform="translate(680, 0)">
        <rect width="340" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Account Balances &amp; Actions</text>

          <g transform="translate(0, 32)">
            <rect width="300" height="110" rx="12" fill="#0284c7" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#bae6fd">NET AVAILABLE BALANCE</text>
              <text x="0" y="46" font-family="system-ui, sans-serif" font-size="26" font-weight="900" fill="#ffffff">$68,450.00</text>
              <text x="0" y="68" font-family="system-ui, sans-serif" font-size="11" fill="#e0f2fe">Daily Transfer Limit: $50,000.00</text>
            </g>

            <!-- Buttons -->
            <g transform="translate(0, 135)">
              <rect width="300" height="42" rx="8" fill="#10b981" />
              <text x="150" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">+ Deposit Funds</text>

              <rect y="55" width="300" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
              <text x="150" y="81" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Withdrawal / Wire Out</text>

              <rect y="110" width="300" height="42" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
              <text x="150" y="136" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Print Certified Statement</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 33. Student Management System
generators['student-management'] = () => windowWrapper({
  title: 'Student Information System (SIS) — Academic Records &amp; Course Enrollment (PHP / MySQL)',
  badge: 'Academic SIS Online',
  bgGradient: ['#0f172a', '#1e293b'],
  bodyContent: `
    <!-- Top Academic Header -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="8" fill="#1e293b" />
      <g transform="translate(20, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Superior University • Department of Computer Science • Fall 2026 Semester</text>
        <text x="980" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Database: MySQL (student_db)</text>
      </g>
    </g>

    <!-- Student Profile Card & Enrolled Courses Table -->
    <g transform="translate(0, 70)">
      <!-- Left: Enrolled Courses & Attendance (640 width) -->
      <g>
        <rect width="640" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Course Enrollment &amp; Attendance Records</text>
          
          <g transform="translate(0, 32)">
            <rect width="592" height="28" rx="4" fill="#1e293b" />
            <text x="12" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">CODE</text>
            <text x="100" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">COURSE TITLE</text>
            <text x="360" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">ATTENDANCE</text>
            <text x="490" y="18" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8">GRADE</text>

            ${[
              { code: 'CS-301', name: 'Software Engineering &amp; Agile Architectures', att: '96% (32/34)', grade: 'A+ (4.0)', color: '#10b981' },
              { code: 'CS-304', name: 'Artificial Intelligence &amp; Neural Networks', att: '94% (30/32)', grade: 'A (4.0)', color: '#10b981' },
              { code: 'CS-308', name: 'Database Management Systems (SQL/NoSQL)', att: '98% (33/34)', grade: 'A+ (4.0)', color: '#10b981' },
              { code: 'CS-312', name: 'Data Structures &amp; Algorithms', att: '92% (31/34)', grade: 'A (3.8)', color: '#38bdf8' },
              { code: 'CS-318', name: 'Web Engineering &amp; Distributed Cloud', att: '97% (33/34)', grade: 'A+ (4.0)', color: '#10b981' }
            ].map((c, idx) => `
              <g transform="translate(0, ${idx * 56 + 36})">
                <rect width="592" height="48" rx="6" fill="#1e293b" fill-opacity="0.6" />
                <text x="12" y="28" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">${c.code}</text>
                <text x="100" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${c.name}</text>
                <text x="360" y="28" font-family="monospace" font-size="11" fill="#cbd5e1">${c.att}</text>
                <rect x="490" y="14" width="80" height="22" rx="4" fill="${c.color}" fill-opacity="0.2" />
                <text x="530" y="29" font-family="monospace" font-size="10" font-weight="800" fill="${c.color}" text-anchor="middle">${c.grade}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Student Profile & CGPA (350 width) -->
      <g transform="translate(670, 0)">
        <rect width="350" height="480" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Student Transcript Profile</text>

          <g transform="translate(0, 32)">
            <rect width="310" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">ACADEMIC STANDING</text>
              <text x="0" y="38" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#ffffff">Usman Iqbal</text>
              <text x="0" y="58" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Roll No: BCS-F22-108 • 6th Semester</text>
              
              <text x="0" y="90" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#cbd5e1">Cumulative CGPA:</text>
              <text x="140" y="90" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#10b981">3.84 / 4.00</text>
              <text x="0" y="112" font-family="system-ui, sans-serif" font-size="10" fill="#10b981">Status: Dean's Honor Roll</text>
            </g>

            <rect y="170" width="310" height="110" rx="10" fill="#111827" stroke="#334155" stroke-width="1" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#f59e0b">ADMINISTRATIVE ACTIONS</text>
              <text x="0" y="36" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Course Enrollment Approved</text>
              <text x="0" y="54" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Exam Admit Card Generated</text>
              <text x="0" y="72" font-family="system-ui, sans-serif" font-size="11" fill="#10b981">• All Semester Dues Paid ✓</text>
            </g>

            <rect y="300" width="310" height="42" rx="8" fill="#0284c7" />
            <text x="155" y="326" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">Generate Official PDF Transcript</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 34. LifeProof AI — Evidence Verification Platform
generators['lifeproof-ai'] = () => windowWrapper({
  title: 'LifeProof AI — Cryptographic Dispute Evidence &amp; Verification Vault',
  badge: 'Evidence Vault Verified',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <!-- Top Security Cryptographic Banner -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#00DCA0" stroke-width="1.2" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Dossier: #LP-2026-084 • Intellectual Property &amp; Contract Dispute Verification</text>
        <rect x="790" y="-4" width="200" height="30" rx="6" fill="#00DCA0" fill-opacity="0.2" />
        <text x="890" y="16" font-family="monospace" font-size="11" font-weight="800" fill="#00DCA0" text-anchor="middle">● HASH INTEGRITY VERIFIED</text>
      </g>
    </g>

    <!-- Main Evidence Verification Layout -->
    <g transform="translate(0, 75)">
      <!-- Left: Chain of Custody & Document Preview (600 width) -->
      <g>
        <rect width="600" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Tamper-Evident Chain of Custody</text>
          
          <g transform="translate(0, 35)">
            ${[
              { step: '1. Original Document Ingestion', hash: 'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', time: '10:14:02 UTC', verified: true },
              { step: '2. Cryptographic Timestamping', hash: 'Immutable block timestamp proof registered on ledger', time: '10:14:05 UTC', verified: true },
              { step: '3. Digital Signature Multi-Party Key', hash: 'Public Key: 0x489F...C102 signed by verified author', time: '10:14:12 UTC', verified: true },
              { step: '4. AI Tamper &amp; Metadata Analysis', hash: 'EXIF, revision history &amp; byte diffs: 0 anomalies detected', time: '10:14:18 UTC', verified: true }
            ].map((st, i) => `
              <g transform="translate(0, ${i * 85})">
                <rect width="552" height="74" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
                <circle cx="20" cy="22" r="10" fill="#00DCA0" fill-opacity="0.2" />
                <text x="20" y="26" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#00DCA0" text-anchor="middle">✓</text>
                <text x="40" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${st.step}</text>
                <text x="536" y="22" font-family="monospace" font-size="10" fill="#94a3b8" text-anchor="end">${st.time}</text>
                <text x="40" y="44" font-family="monospace" font-size="9.5" fill="#38bdf8">${st.hash.slice(0, 65)}</text>
                <text x="40" y="60" font-family="monospace" font-size="9.5" fill="#38bdf8">${st.hash.slice(65)}</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>

      <!-- Right: Official Verification Seal (390 width) -->
      <g transform="translate(630, 0)">
        <rect width="390" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Verification Certificate</text>

          <!-- Seal Visual -->
          <g transform="translate(175, 120)">
            <circle cx="0" cy="0" r="65" fill="#064e3b" stroke="#00DCA0" stroke-width="3" />
            <circle cx="0" cy="0" r="50" fill="none" stroke="#00DCA0" stroke-width="1" stroke-dasharray="4,3" />
            <text x="0" y="-8" font-family="system-ui, sans-serif" font-size="28" text-anchor="middle">🛡️</text>
            <text x="0" y="20" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#00DCA0" text-anchor="middle">AUTHENTIC</text>
            <text x="0" y="32" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#ffffff" text-anchor="middle">TAMPER-PROOF</text>
          </g>

          <g transform="translate(15, 215)">
            <rect width="320" height="150" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">LEGAL ADMISSIBILITY AUDIT</text>
              <text x="0" y="36" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Cryptographic Non-Repudiation: 100%</text>
              <text x="0" y="56" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Digital Notarization Certificate Issued</text>
              <text x="0" y="76" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Meets Federal Rules of Evidence (FRE)</text>
              <text x="0" y="98" font-family="monospace" font-size="10" font-weight="700" fill="#10b981">● Status: Court-Admissible Dossier</text>
            </g>

            <rect y="170" width="320" height="42" rx="8" fill="#00DCA0" />
            <text x="160" y="196" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">Download Court Admissibility Packet</text>
          </g>
        </g>
      </g>
    </g>
  `
});

async function run() {
  console.log('Generating Category 4: Academic & Social Impact Projects (6 projects)...');
  for (const [key, fn] of Object.entries(generators)) {
    const dest = path.join(outDir, `${key}.jpg`);
    const svg = fn();
    await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`✓ [4/4] ${key}.jpg (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

run();
