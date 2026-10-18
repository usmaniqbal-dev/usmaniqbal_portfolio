const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { windowWrapper, outDir } = require('./visual-templates');

const generators = {};

// 8. Urdu Speech Dataset Pipeline
generators['urdu-speech-pipeline'] = () => windowWrapper({
  title: 'Urdu Speech Dataset Pipeline & Audio Slicing Suite (Python 3.9+ / faster-whisper)',
  badge: 'Dataset Suite Verified',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <!-- Top Stats Row -->
    <g transform="translate(0, 0)">
      ${[
        { label: 'Sample Accuracy', val: '720,000 Samples', sub: 'Exactly 45.000s @ 16 kHz Mono', color: '#00DCA0' },
        { label: 'ASR Engine', val: 'faster-whisper', sub: 'GPU Accelerated Urdu Transcription', color: '#38bdf8' },
        { label: 'Phonetic Transliteration', val: 'Urdu → Roman Urdu', sub: 'High-Frequency Phonetic Rules', color: '#f59e0b' },
        { label: 'Dataset Export Format', val: 'Voice_Transcriptions.xlsx', sub: 'RTL Formatted Excel + CSV', color: '#a855f7' }
      ].map((card, i) => `
        <g transform="translate(${i * 260}, 0)">
          <rect width="245" height="74" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">${card.label}</text>
          <text x="16" y="46" font-family="system-ui, sans-serif" font-size="17" font-weight="900" fill="${card.color}">${card.val}</text>
          <text x="16" y="62" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#cbd5e1">${card.sub}</text>
        </g>
      `).join('')}
    </g>

    <!-- Center Waveform & Audio Slicer Visual -->
    <g transform="translate(0, 95)">
      <rect width="1020" height="455" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
      
      <!-- Audio Waveform Display Box -->
      <g transform="translate(30, 20)">
        <rect width="960" height="150" rx="10" fill="#0f172a" stroke="#00DCA0" stroke-width="1.2" />
        <g transform="translate(20, 20)">
          <text x="0" y="14" font-family="monospace" font-size="12" font-weight="700" fill="#00DCA0">AUDIO TIMELINE: clip_01.wav [00:00.000 ── 00:45.000] • 16-bit PCM • 16,000 Hz</text>
          
          <!-- Realistic Waveform Bars (Cyan & Mint) -->
          <g transform="translate(0, 30)">
            <!-- Central Line -->
            <line x1="0" y1="40" x2="920" y2="40" stroke="#1e293b" stroke-width="1" />
            <!-- Vertical Bars -->
            ${Array.from({ length: 92 }).map((_, idx) => {
              const h = Math.abs(Math.sin(idx * 0.15) * 35 + Math.cos(idx * 0.35) * 25 + ((idx % 7) * 4));
              const cappedH = Math.min(Math.max(h, 4), 65);
              const color = idx > 30 && idx < 65 ? '#00DCA0' : '#38bdf8';
              return `<line x1="${idx * 10}" y1="${40 - cappedH / 2}" x2="${idx * 10}" y2="${40 + cappedH / 2}" stroke="${color}" stroke-width="3" stroke-linecap="round" />`;
            }).join('')}
          </g>

          <!-- Timeline Timecodes -->
          <g transform="translate(0, 105)" fill="#64748b" font-family="monospace" font-size="10">
            <text x="0" y="0">00:00s</text>
            <text x="225" y="0">00:11.25s</text>
            <text x="450" y="0">00:22.50s</text>
            <text x="675" y="0">00:33.75s</text>
            <text x="900" y="0" text-anchor="end">00:45.000s [Slice Marker]</text>
          </g>
        </g>
      </g>

      <!-- Bottom Split: Transcriptions & Excel Dataset Table -->
      <g transform="translate(30, 195)">
        <!-- Left: Urdu & Roman Urdu Text (460 width) -->
        <g>
          <rect width="465" height="235" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <g transform="translate(20, 20)">
            <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#38bdf8">NATIVE URDU SCRIPT (RTL OUTPUT)</text>
            <rect y="28" width="425" height="60" rx="8" fill="#0f172a" />
            <text x="410" y="65" font-family="'Noto Nastaliq Urdu', 'Urdu Typesetting', Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="end">
              یہ اردو اسپیچ ڈیٹاسیٹ کا خودکار پروجیکٹ ہے
            </text>

            <text x="0" y="118" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f59e0b">PHONETIC ROMAN URDU TRANSLITERATION</text>
            <rect y="130" width="425" height="55" rx="8" fill="#0f172a" />
            <text x="16" y="162" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#fde68a">
              "yeh urdu speech dataset ka khud-kaar project hai"
            </text>
          </g>
        </g>

        <!-- Right: Generated Excel Dataset Preview (475 width) -->
        <g transform="translate(485, 0)">
          <rect width="475" height="235" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <g transform="translate(20, 20)">
            <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#10b981">EXCEL DATASET: Voice_Transcriptions.xlsx</text>
            
            <g transform="translate(0, 30)">
              <!-- Table Header -->
              <rect width="435" height="26" rx="4" fill="#059669" />
              <text x="12" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff">Clip ID</text>
              <text x="70" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff">Audio File</text>
              <text x="150" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff">Duration</text>
              <text x="230" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff">Roman Urdu</text>
              <text x="370" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#ffffff">Status</text>

              <!-- Rows -->
              ${[
                { id: '01', file: '01.wav', dur: '45.000s', text: 'mein aaj aap se...', stat: 'Verified' },
                { id: '02', file: '02.wav', dur: '45.000s', text: 'yeh aala nizaam...', stat: 'Verified' },
                { id: '03', file: '03.wav', dur: '45.000s', text: 'audio dataset...', stat: 'Verified' },
                { id: '04', file: '04.wav', dur: '45.000s', text: 'machine learning...', stat: 'Verified' }
              ].map((r, idx) => `
                <g transform="translate(0, ${idx * 34 + 32})">
                  <rect width="435" height="28" rx="4" fill="#0f172a" fill-opacity="0.8" />
                  <text x="12" y="18" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">${r.id}</text>
                  <text x="70" y="18" font-family="monospace" font-size="11" fill="#cbd5e1">${r.file}</text>
                  <text x="150" y="18" font-family="monospace" font-size="11" fill="#10b981">${r.dur}</text>
                  <text x="230" y="18" font-family="system-ui, sans-serif" font-size="11" fill="#f8fafc">${r.text}</text>
                  <rect x="370" y="6" width="55" height="18" rx="4" fill="#10b981" fill-opacity="0.2" />
                  <text x="397" y="18" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">DONE ✓</text>
                </g>
              `).join('')}
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 9. YouTube Audio Splitting & Transcription
generators['youtube-transcription'] = () => windowWrapper({
  title: 'YouTube Audio Extraction & 45-Second Segment Slicer (yt-dlp + Whisper)',
  badge: 'Whisper Pipeline Active',
  bgGradient: ['#0f172a', '#450a0a'],
  bodyContent: `
    <!-- Video Input URL Bar -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" stroke="#ef4444" stroke-width="1.2" />
      <circle cx="28" cy="27" r="14" fill="#ef4444" />
      <polygon points="24,20 36,27 24,34" fill="#ffffff" />
      <text x="56" y="32" font-family="monospace" font-size="13" font-weight="600" fill="#f8fafc">https://www.youtube.com/watch?v=speech_dataset_longform_sample_1080p</text>
      <rect x="850" y="10" width="150" height="34" rx="8" fill="#ef4444" />
      <text x="925" y="32" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">PROCESSING AUDIO</text>
    </g>

    <!-- Main Workflow Layout -->
    <g transform="translate(0, 75)">
      <!-- Left: Sliced Segments Track (620 width) -->
      <g>
        <rect width="620" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <text x="24" y="34" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Sequential 45-Second Clip Slices</text>
        
        <g transform="translate(24, 55)">
          ${[
            { clip: 'clip_01.wav', range: '00:00 - 00:45', size: '1.44 MB', status: 'Transcribed', color: '#10b981' },
            { clip: 'clip_02.wav', range: '00:45 - 01:30', size: '1.44 MB', status: 'Transcribed', color: '#10b981' },
            { clip: 'clip_03.wav', range: '01:30 - 02:15', size: '1.44 MB', status: 'Transcribed', color: '#10b981' },
            { clip: 'clip_04.wav', range: '02:15 - 03:00', size: '1.44 MB', status: 'Processing', color: '#38bdf8' },
            { clip: 'clip_05.wav', range: '03:00 - 03:45', size: '1.44 MB', status: 'Queued', color: '#94a3b8' }
          ].map((item, idx) => `
            <g transform="translate(0, ${idx * 68})">
              <rect width="572" height="56" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
              <circle cx="28" cy="28" r="12" fill="${item.color}" fill-opacity="0.15" />
              <text x="28" y="32" font-family="monospace" font-size="10" font-weight="700" fill="${item.color}" text-anchor="middle">#${idx + 1}</text>
              <text x="56" y="26" font-family="monospace" font-size="13" font-weight="700" fill="#ffffff">${item.clip}</text>
              <text x="56" y="44" font-family="monospace" font-size="11" fill="#94a3b8">Duration: ${item.range} • ${item.size} • 16 kHz Mono</text>
              
              <rect x="460" y="16" width="95" height="24" rx="6" fill="${item.color}" fill-opacity="0.2" />
              <text x="507" y="32" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="${item.color}" text-anchor="middle">${item.status}</text>
            </g>
          `).join('')}
        </g>

        <!-- Slicing Status Indicator -->
        <g transform="translate(24, 410)">
          <rect width="572" height="42" rx="8" fill="#1e293b" />
          <text x="16" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#cbd5e1">Extraction Status: 48 clips generated (100% complete)</text>
          <text x="556" y="26" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Zero Time-Drift</text>
        </g>
      </g>

      <!-- Right: Live Whisper Transcription Stream (380 width) -->
      <g transform="translate(640, 0)">
        <rect width="380" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Whisper ASR Live Output</text>
          
          <rect y="32" width="340" height="395" rx="10" fill="#1e293b" />
          <g transform="translate(16, 20)">
            <text x="0" y="16" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">[00:00.000 ──&gt; 00:08.420]</text>
            <text x="0" y="34" font-family="system-ui, sans-serif" font-size="12" fill="#f8fafc">"Welcome to this comprehensive tutorial on deep learning speech recognition..."</text>
            
            <text x="0" y="76" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">[00:08.420 ──&gt; 00:19.850]</text>
            <text x="0" y="94" font-family="system-ui, sans-serif" font-size="12" fill="#f8fafc">"We will slice continuous audio into standard 45-second samples for model training."</text>

            <text x="0" y="136" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">[00:19.850 ──&gt; 00:32.100]</text>
            <text x="0" y="154" font-family="system-ui, sans-serif" font-size="12" fill="#f8fafc">"Transcripts are validated and structured automatically with confidence scores."</text>

            <rect y="195" width="308" height="150" rx="8" fill="#090d16" />
            <text x="14" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#10b981">TRANSCRIPTION METRICS</text>
            <text x="14" y="52" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Word Error Rate (WER): &lt; 4.2%</text>
            <text x="14" y="74" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Faster-Whisper Inference: 8.4x real-time</text>
            <text x="14" y="96" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• VAD Filtering: Voice-Active Only</text>
            <text x="14" y="118" font-family="system-ui, sans-serif" font-size="11" fill="#38bdf8">• Text Alignment: Exact Millisecond Sync</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 10. Chatbot.AI — AI Chatbot Application
generators['chatbot-ai'] = () => windowWrapper({
  title: 'Chatbot.AI — Multi-Turn Conversational AI Application (GPT-4o & Claude 3.5)',
  badge: 'Conversational LLM Active',
  bgGradient: ['#0f172a', '#0284c7'],
  bodyContent: `
    <!-- Split Screen: Sidebar (280 width) + Chat Window (710 width) -->
    <g transform="translate(0, 0)">
      <!-- Sidebar -->
      <g>
        <rect width="270" height="550" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(18, 20)">
          <!-- New Chat Button -->
          <rect width="234" height="40" rx="8" fill="#0284c7" />
          <text x="117" y="25" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">+ New Conversation</text>

          <text x="0" y="80" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748b">RECENT CHATS</text>
          
          ${[
            'Salesforce Flow Architect',
            'Urdu Audio Pipeline Specs',
            'Real Estate CRM Schema',
            'React Three Fiber Animation',
            'PostgreSQL Visitor Analytics'
          ].map((chat, idx) => `
            <g transform="translate(0, ${idx * 42 + 95})">
              <rect width="234" height="34" rx="6" fill="#1e293b" />
              <circle cx="16" cy="17" r="4" fill="#38bdf8" />
              <text x="30" y="21" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#e2e8f0">${chat}</text>
            </g>
          `).join('')}

          <g transform="translate(0, 380)">
            <rect width="234" height="110" rx="8" fill="#1e293b" />
            <text x="14" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">ACTIVE MODEL</text>
            <text x="14" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">GPT-4o / Claude 3.5 Sonnet</text>
            <text x="14" y="66" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">Context: 128k Tokens</text>
            <text x="14" y="86" font-family="monospace" font-size="10" font-weight="700" fill="#10b981">● API Latency: 190 ms</text>
          </g>
        </g>
      </g>

      <!-- Chat Thread Pane -->
      <g transform="translate(290, 0)">
        <rect width="730" height="550" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        
        <g transform="translate(24, 25)">
          <!-- User Message Bubble -->
          <g transform="translate(260, 0)">
            <rect width="420" height="60" rx="16" fill="#0284c7" />
            <text x="20" y="26" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#ffffff">How can I automate customer support ticket</text>
            <text x="20" y="44" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#ffffff">classification and triage in Salesforce CRM?</text>
          </g>

          <!-- AI Assistant Message Bubble -->
          <g transform="translate(0, 80)">
            <circle cx="20" cy="20" r="16" fill="#00DCA0" />
            <text x="20" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">AI</text>
            
            <rect x="45" width="635" height="300" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <g transform="translate(65, 24)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#00DCA0">Chatbot.AI Assistant</text>
              <text x="0" y="36" font-family="system-ui, sans-serif" font-size="12" fill="#e2e8f0">
                You can automate ticket triage using an Agentforce Service Agent or Record-Triggered Flow:
              </text>

              <!-- Code Snippet Box -->
              <rect y="52" width="595" height="120" rx="8" fill="#090d16" />
              <g transform="translate(16, 20)">
                <text x="0" y="16" font-family="monospace" font-size="11" fill="#7dd3fc">// 1. Apex Invocable Action for AI Classification</text>
                <text x="0" y="36" font-family="monospace" font-size="11" fill="#a7f3d0">public class CaseAIClassifier {</text>
                <text x="14" y="56" font-family="monospace" font-size="11" fill="#fde68a">  @InvocableMethod(label='Predict Case Category')</text>
                <text x="14" y="76" font-family="monospace" font-size="11" fill="#f8fafc">  public static List&lt;String&gt; classify(List&lt;Case&gt; cases) { ... }</text>
                <text x="0" y="96" font-family="monospace" font-size="11" fill="#a7f3d0">}</text>
              </g>

              <text x="0" y="205" font-family="system-ui, sans-serif" font-size="12" fill="#cbd5e1">
                ✓ Reduces manual dispatch latency by 85% • Auto-assigns priority, queue, and SLA milestone.
              </text>
            </g>
          </g>

          <!-- Input Bar -->
          <g transform="translate(0, 420)">
            <rect width="680" height="52" rx="12" fill="#1e293b" stroke="#00DCA0" stroke-width="1.5" />
            <text x="24" y="32" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Ask anything about CRM, AI models, Python, or engineering...</text>
            <rect x="615" y="8" width="52" height="36" rx="8" fill="#00DCA0" />
            <polygon points="636,20 648,26 636,32" fill="#0f172a" />
          </g>
        </g>
      </g>
    </g>
  `
});

// 11. Urdu AI Voice Generation Tool
generators['urdu-voice-generator'] = () => windowWrapper({
  title: 'Urdu AI Voice Generation Studio — Deep Neural Text-to-Speech (TTS)',
  badge: 'Neural Voice Studio',
  bgGradient: ['#0f172a', '#1e1b4b'],
  bodyContent: `
    <!-- Top Configuration Header -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="60" rx="10" fill="#1e293b" />
      <g transform="translate(24, 18)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">VOICE MODEL: Urdu Male Studio Pro (24 kHz)</text>
        <text x="360" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#10b981">PITCH: 0.0 st</text>
        <text x="500" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f59e0b">SPEED: 1.05x</text>
        <text x="640" y="16" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#a855f7">EMOTION: Natural Broadcast</text>
        <rect x="850" y="-4" width="130" height="34" rx="8" fill="#00DCA0" />
        <text x="915" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#0f172a" text-anchor="middle">SYNTHESIZE ⚡</text>
      </g>
    </g>

    <!-- Main Studio Split View -->
    <g transform="translate(0, 80)">
      <!-- Left: Urdu Text Input & Phonetic Breakdown (520 width) -->
      <g>
        <rect width="520" height="470" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Urdu Text Script Input</text>
          
          <rect y="30" width="472" height="180" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="450" y="80" font-family="'Noto Nastaliq Urdu', Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="end">
            مصنوعی ذہانت کے ذریعے قدرتی اور
          </text>
          <text x="450" y="130" font-family="'Noto Nastaliq Urdu', Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="end">
            واضح آواز تیار کرنے کا جدید نظام۔
          </text>

          <text x="0" y="240" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">Phoneme Alignment &amp; Diacritics</text>
          <rect y="255" width="472" height="150" rx="10" fill="#1e293b" />
          <g transform="translate(16, 20)">
            <text x="0" y="16" font-family="monospace" font-size="11" fill="#fde68a">Phonemes: /m/ /a/ /s/ /n/ /u/ /i/ /z/ /i/ /h/ /a/ /n/ /a/ /t/</text>
            <text x="0" y="42" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Stress Pattern: Standard Urdu Polysyllabic</text>
            <text x="0" y="66" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">• Duration Predictor: 4.82 seconds estimated</text>
            <text x="0" y="90" font-family="system-ui, sans-serif" font-size="11" fill="#10b981">• Vocoder: HiFi-GAN Neural Vocoder Ready</text>
          </g>
        </g>
      </g>

      <!-- Right: Spectrogram & Audio Player (470 width) -->
      <g transform="translate(550, 0)">
        <rect width="470" height="470" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Mel-Spectrogram Visualization</text>
          
          <!-- Spectrogram visual -->
          <rect y="30" width="422" height="230" rx="10" fill="#090d16" stroke="#818cf8" stroke-width="1" />
          <g transform="translate(15, 45)">
            ${Array.from({ length: 39 }).map((_, col) => {
              return Array.from({ length: 12 }).map((__, row) => {
                const intensity = Math.sin(col * 0.2 + row * 0.4) * 0.5 + 0.5;
                const colors = ['#090d16', '#1e1b4b', '#4338ca', '#818cf8', '#22d3ee', '#00DCA0'];
                const cIdx = Math.floor(intensity * (colors.length - 1));
                return `<rect x="${col * 10}" y="${row * 13}" width="8" height="10" rx="2" fill="${colors[cIdx]}" />`;
              }).join('');
            }).join('')}
          </g>

          <!-- Audio Player Controls -->
          <g transform="translate(0, 280)">
            <rect width="422" height="135" rx="10" fill="#1e293b" />
            <g transform="translate(20, 20)">
              <!-- Play button & scrub bar -->
              <circle cx="20" cy="20" r="18" fill="#00DCA0" />
              <polygon points="16,12 28,20 16,28" fill="#0f172a" />
              
              <rect x="55" y="16" width="320" height="8" rx="4" fill="#334155" />
              <rect x="55" y="16" width="210" height="8" rx="4" fill="#00DCA0" />
              <circle cx="265" cy="20" r="8" fill="#ffffff" />

              <text x="0" y="65" font-family="monospace" font-size="11" fill="#94a3b8">00:03.18 / 00:04.82</text>
              <text x="375" y="65" font-family="monospace" font-size="11" fill="#00DCA0" text-anchor="end">24 kHz High-Res</text>

              <rect y="82" width="382" height="34" rx="6" fill="#0284c7" />
              <text x="191" y="104" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">Export Studio WAV / MP3</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 12. Skin Cancer Detection System
generators['skin-cancer-detection'] = () => windowWrapper({
  title: 'Skin Lesion Classifier & Diagnostic AI (MobileNetV2 / HAM10000 Dataset)',
  badge: 'Medical AI Verified',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <!-- Top Diagnosis Banner -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#1e293b" />
      <g transform="translate(24, 16)">
        <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#f8fafc">Sample #DERM-10492 • Lesion Target: Dorsal Arm Scan • Resolution: 600x450 px</text>
        <rect x="850" y="-4" width="145" height="30" rx="6" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" />
        <text x="922" y="16" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399" text-anchor="middle">● ANALYSIS COMPLETE</text>
      </g>
    </g>

    <!-- Main Diagnostic Split View -->
    <g transform="translate(0, 75)">
      <!-- Left: Lesion Scan with AI Bounding Box (480 width) -->
      <g>
        <rect width="480" height="475" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Dermoscopic Lesion Image</text>
          
          <!-- Mockup Dermoscopy Canvas -->
          <g transform="translate(0, 35)">
            <rect width="432" height="320" rx="12" fill="#78350f" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.5" />
            <!-- Skin backdrop circles -->
            <circle cx="216" cy="160" r="95" fill="#451a03" />
            <circle cx="205" cy="155" r="75" fill="#1c1917" />
            <circle cx="225" cy="168" r="45" fill="#0c0a09" />
            
            <!-- AI Bounding Contour & Crosshair -->
            <rect x="90" y="45" width="250" height="230" rx="8" fill="none" stroke="#00DCA0" stroke-width="2" stroke-dasharray="8,6" />
            <line x1="216" y1="35" x2="216" y2="285" stroke="#00DCA0" stroke-width="1" stroke-opacity="0.4" />
            <line x1="80" y1="160" x2="350" y2="160" stroke="#00DCA0" stroke-width="1" stroke-opacity="0.4" />
            
            <!-- Pill tag on bounding box -->
            <rect x="100" y="55" width="130" height="24" rx="4" fill="#00DCA0" />
            <text x="165" y="71" font-family="monospace" font-size="11" font-weight="900" fill="#0f172a" text-anchor="middle">TARGET: NV-01 (94.8%)</text>
          </g>

          <text x="0" y="400" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">Image Source: HAM10000 Research Archive (10,015 Scans)</text>
          <text x="0" y="420" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#64748b">Preprocessing: Bilinear Resizing 224x224, Z-Score Normalization</text>
        </g>
      </g>

      <!-- Right: Probability Breakdown & Model Metrics (510 width) -->
      <g transform="translate(510, 0)">
        <rect width="510" height="475" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">MobileNetV2 Classification Probabilities</text>
          
          <g transform="translate(0, 35)">
            ${[
              { label: 'Melanocytic Nevus (NV)', pct: 94.8, barW: 410, color: '#10b981', note: 'Benign Mole (High Confidence)' },
              { label: 'Melanoma (MEL)', pct: 2.8, barW: 24, color: '#ef4444', note: 'Low Probability' },
              { label: 'Basal Cell Carcinoma (BCC)', pct: 1.4, barW: 16, color: '#f59e0b', note: 'Negative' },
              { label: 'Actinic Keratosis (AKIEC)', pct: 0.6, barW: 10, color: '#38bdf8', note: 'Negative' },
              { label: 'Benign Keratosis (BKL)', pct: 0.4, barW: 8, color: '#94a3b8', note: 'Negative' }
            ].map((p, idx) => `
              <g transform="translate(0, ${idx * 60})">
                <text x="0" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${p.label}</text>
                <text x="460" y="16" font-family="monospace" font-size="12" font-weight="800" fill="${p.color}" text-anchor="end">${p.pct}%</text>
                <rect y="24" width="460" height="10" rx="5" fill="#1e293b" />
                <rect y="24" width="${p.barW}" height="10" rx="5" fill="${p.color}" />
                <text x="0" y="46" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">${p.note}</text>
              </g>
            `).join('')}
          </g>

          <!-- Accuracy Card -->
          <g transform="translate(0, 340)">
            <rect width="460" height="65" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
            <g transform="translate(16, 18)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">VALIDATION ACCURACY: 93.4%</text>
              <text x="240" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#10b981">AUC-ROC SCORE: 0.968</text>
              <text x="0" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">TensorFlow 2.x • Transfer Learning • Top-1 Categorical Cross-Entropy</text>
            </g>
          </g>
        </g>
      </g>
    </g>
  `
});

// 13. Tauric TradingAgents
generators['tauric-trading-agents'] = () => windowWrapper({
  title: 'Tauric TradingAgents — Multi-Agent Financial Research & Quantitative Station',
  badge: 'Multi-Agent Quant Active',
  bgGradient: ['#030712', '#0f172a'],
  bodyContent: `
    <!-- Top Bar with Real-Time Ticker -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="54" rx="10" fill="#111827" stroke="#10b981" stroke-width="1" />
      <g transform="translate(24, 18)">
        <text x="0" y="16" font-family="monospace" font-size="14" font-weight="900" fill="#ffffff">BTC/USDT: $64,820.00</text>
        <text x="180" y="16" font-family="monospace" font-size="13" font-weight="800" fill="#10b981">+4.28% (24h)</text>
        <text x="320" y="16" font-family="monospace" font-size="12" fill="#9ca3af">Vol: $28.4B</text>
        <text x="460" y="16" font-family="monospace" font-size="12" fill="#9ca3af">RSI(14): 64.2 [Bullish]</text>
        <rect x="850" y="-4" width="145" height="32" rx="6" fill="#10b981" fill-opacity="0.2" />
        <text x="922" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#10b981" text-anchor="middle">EXECUTION: BUY SIGNAL</text>
      </g>
    </g>

    <!-- Center Candlestick Chart & 3 Specialized Agents -->
    <g transform="translate(0, 75)">
      <!-- Left: Candlestick Chart Canvas (610 width) -->
      <g>
        <rect width="610" height="475" rx="14" fill="#090d16" stroke="#1f2937" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">4-Hour Candlestick Action &amp; Trend Breakout</text>
          
          <!-- Candlestick Visual -->
          <g transform="translate(0, 35)">
            <rect width="560" height="260" rx="8" fill="#111827" />
            <!-- Grid lines -->
            <line x1="0" y1="65" x2="560" y2="65" stroke="#1f2937" stroke-width="1" />
            <line x1="0" y1="130" x2="560" y2="130" stroke="#1f2937" stroke-width="1" />
            <line x1="0" y1="195" x2="560" y2="195" stroke="#1f2937" stroke-width="1" />
            
            <!-- Candlesticks (Green & Red) -->
            ${[
              { x: 30, o: 160, c: 140, h: 120, l: 180, g: true },
              { x: 70, o: 140, c: 155, h: 130, l: 170, g: false },
              { x: 110, o: 155, c: 135, h: 125, l: 165, g: true },
              { x: 150, o: 135, c: 120, h: 105, l: 145, g: true },
              { x: 190, o: 120, c: 130, h: 110, l: 140, g: false },
              { x: 230, o: 130, c: 110, h: 95, l: 140, g: true },
              { x: 270, o: 110, c: 90, h: 80, l: 120, g: true },
              { x: 310, o: 90, c: 105, h: 80, l: 115, g: false },
              { x: 350, o: 105, c: 80, h: 70, l: 115, g: true },
              { x: 390, o: 80, c: 65, h: 55, l: 95, g: true },
              { x: 430, o: 65, c: 50, h: 40, l: 80, g: true },
              { x: 470, o: 50, c: 35, h: 25, l: 60, g: true },
              { x: 510, o: 35, c: 20, h: 10, l: 45, g: true }
            ].map(cd => `
              <line x1="${cd.x}" y1="${cd.h}" x2="${cd.x}" y2="${cd.l}" stroke="${cd.g ? '#10b981' : '#ef4444'}" stroke-width="1.5" />
              <rect x="${cd.x - 8}" y="${Math.min(cd.o, cd.c)}" width="16" height="${Math.abs(cd.o - cd.c)}" rx="2" fill="${cd.g ? '#10b981' : '#ef4444'}" />
            `).join('')}

            <!-- 20 EMA trendline -->
            <path d="M30,150 Q150,130 270,95 T510,25" fill="none" stroke="#38bdf8" stroke-width="2" />
          </g>

          <!-- Strategy Performance Footer -->
          <g transform="translate(0, 315)">
            <rect width="560" height="90" rx="8" fill="#111827" />
            <g transform="translate(16, 20)">
              <text x="0" y="16" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">TRADING STRATEGY: Momentum Trend Breakout</text>
              <text x="0" y="38" font-family="system-ui, sans-serif" font-size="11" fill="#e5e7eb">• Target Price: $69,400 • Stop-Loss: $63,150 • Risk/Reward Ratio: 1 : 3.4</text>
              <text x="0" y="58" font-family="monospace" font-size="11" font-weight="700" fill="#10b981">Backtest Win Rate: 72.8% across 480 simulated market regimes</text>
            </g>
          </g>
        </g>
      </g>

      <!-- Right: 3 Trading Agents (390 width) -->
      <g transform="translate(630, 0)">
        <rect width="390" height="475" rx="14" fill="#111827" stroke="#1f2937" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Specialized Agent Council</text>

          <g transform="translate(0, 32)">
            ${[
              { name: 'Technical Analyst Agent', role: 'Chart Pattern &amp; Momentum', verdict: 'BULLISH BREAKOUT', color: '#10b981', note: 'Golden Cross on 4H chart. Strong volume absorption.' },
              { name: 'Macro Sentiment Agent', role: 'News, Fed Policy &amp; On-Chain', verdict: 'POSITIVE (+0.78)', color: '#38bdf8', note: 'Institutional inflows positive. Low sell pressure detected.' },
              { name: 'Risk Management Agent', role: 'Position Sizing &amp; Kelly Criterion', verdict: 'SIZE: 2.5% RISK', color: '#f59e0b', note: 'Max Drawdown protection active. Stop-loss calculated.' }
            ].map((ag, i) => `
              <g transform="translate(0, ${i * 125})">
                <rect width="350" height="112" rx="10" fill="#1f2937" stroke="${ag.color}" stroke-width="1" />
                <g transform="translate(14, 18)">
                  <text x="0" y="14" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff">${ag.name}</text>
                  <text x="0" y="32" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#9ca3af">${ag.role}</text>
                  
                  <rect y="44" width="135" height="22" rx="4" fill="${ag.color}" fill-opacity="0.2" />
                  <text x="67" y="59" font-family="monospace" font-size="10" font-weight="800" fill="${ag.color}" text-anchor="middle">${ag.verdict}</text>
                  
                  <text x="0" y="86" font-family="system-ui, sans-serif" font-size="10.5" fill="#e5e7eb">${ag.note}</text>
                </g>
              </g>
            `).join('')}
          </g>
        </g>
      </g>
    </g>
  `
});

// 14. Revenue Checker AI
generators['revenue-checker-ai'] = () => windowWrapper({
  title: 'Revenue Checker AI — Automated Bank Statement Extraction & Audit Engine',
  badge: 'Document AI Active',
  bgGradient: ['#0f172a', '#064e3b'],
  bodyContent: `
    <!-- Top Extraction Metric Bar -->
    <g transform="translate(0, 0)">
      ${[
        { label: 'Total Verified Revenue', val: '$184,350.00', sub: 'October 2026 Monthly Total', color: '#10b981' },
        { label: 'Deposit Transactions', val: '42 Deposits', sub: 'Extracted from PDF Statements', color: '#38bdf8' },
        { label: 'Duplicate Check', val: '0 Duplicates', sub: '100% Tamper Verification', color: '#00DCA0' },
        { label: 'Excel Export Status', val: 'Ready (.xlsx)', sub: 'Structured Ledger Generated', color: '#f59e0b' }
      ].map((card, i) => `
        <g transform="translate(${i * 260}, 0)">
          <rect width="245" height="74" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
          <text x="16" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">${card.label}</text>
          <text x="16" y="46" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="${card.color}">${card.val}</text>
          <text x="16" y="62" font-family="system-ui, sans-serif" font-size="10" font-weight="500" fill="#cbd5e1">${card.sub}</text>
        </g>
      `).join('')}
    </g>

    <!-- Split View: Bank Statement PDF Viewer & Extracted Ledger -->
    <g transform="translate(0, 95)">
      <!-- Left: PDF Statement Viewer with OCR Highlights (480 width) -->
      <g>
        <rect width="480" height="455" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Bank Statement PDF Viewer (OCR)</text>
          
          <rect y="30" width="432" height="360" rx="8" fill="#ffffff" />
          <g transform="translate(20, 25)" fill="#0f172a">
            <text x="0" y="16" font-family="sans-serif" font-size="14" font-weight="800">CHASE COMMERCIAL BANKING</text>
            <text x="0" y="32" font-family="sans-serif" font-size="10" fill="#64748b">Account #XXXXXXXX4820 • Period: 10/01/26 - 10/31/26</text>
            
            <line x1="0" y1="45" x2="390" y2="45" stroke="#cbd5e1" stroke-width="1" />

            <!-- Highlighted Row 1 -->
            <rect y="55" width="390" height="28" fill="#a7f3d0" fill-opacity="0.6" />
            <text x="10" y="73" font-family="monospace" font-size="10" font-weight="700">10/04/26  CLIENT ACH WIRE INBOUND        +$32,450.00</text>

            <text x="10" y="105" font-family="monospace" font-size="10" fill="#64748b">10/08/26  SOFTWARE CLOUD SUBSCRIPTION       -$450.00</text>

            <!-- Highlighted Row 2 -->
            <rect y="120" width="390" height="28" fill="#a7f3d0" fill-opacity="0.6" />
            <text x="10" y="138" font-family="monospace" font-size="10" font-weight="700">10/12/26  STRIPE PAYMENTS SETTLEMENT     +$54,200.00</text>

            <!-- Highlighted Row 3 -->
            <rect y="155" width="390" height="28" fill="#a7f3d0" fill-opacity="0.6" />
            <text x="10" y="173" font-family="monospace" font-size="10" font-weight="700">10/18/26  ENTERPRISE CRM RETAINER        +$48,500.00</text>

            <text x="10" y="205" font-family="monospace" font-size="10" fill="#64748b">10/22/26  OFFICE LEASE PAYMENT           -$3,200.00</text>

            <!-- Highlighted Row 4 -->
            <rect y="220" width="390" height="28" fill="#a7f3d0" fill-opacity="0.6" />
            <text x="10" y="238" font-family="monospace" font-size="10" font-weight="700">10/27/26  CONSULTING SERVICES MILESTONE  +$49,200.00</text>
          </g>
        </g>
      </g>

      <!-- Right: AI Revenue Extraction & Excel Generation (510 width) -->
      <g transform="translate(510, 0)">
        <rect width="510" height="455" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <g transform="translate(24, 24)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#ffffff">Automated Audit &amp; Excel Ledger</text>

          <g transform="translate(0, 35)">
            <rect width="460" height="270" rx="10" fill="#1e293b" />
            <g transform="translate(16, 20)">
              <text x="0" y="14" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">MONTHLY AUDIT SUMMARY</text>
              <g transform="translate(0, 25)">
                <text x="0" y="18" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Gross Verified Inflow:</text>
                <text x="428" y="18" font-family="monospace" font-size="13" font-weight="800" fill="#10b981" text-anchor="end">$184,350.00</text>

                <text x="0" y="44" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Operational Outflows:</text>
                <text x="428" y="44" font-family="monospace" font-size="13" font-weight="800" fill="#ef4444" text-anchor="end">-$3,650.00</text>

                <text x="0" y="70" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Net Operating Cash Flow:</text>
                <text x="428" y="70" font-family="monospace" font-size="13" font-weight="800" fill="#00DCA0" text-anchor="end">$180,700.00</text>

                <line x1="0" y1="85" x2="428" y2="85" stroke="#334155" stroke-width="1" />

                <text x="0" y="106" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Duplicate Entry Verification:</text>
                <text x="428" y="106" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#10b981" text-anchor="end">PASSED (0 Duplicate Rows)</text>

                <text x="0" y="132" font-family="system-ui, sans-serif" font-size="11" fill="#cbd5e1">Folder-based Batch Processing:</text>
                <text x="428" y="132" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="end">12 Statements Handled</text>
              </g>
            </g>

            <!-- Export Button -->
            <rect y="295" width="460" height="48" rx="8" fill="#059669" />
            <text x="230" y="325" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">Export Complete Excel Report (Revenue_Report_Oct2026.xlsx)</text>
          </g>
        </g>
      </g>
    </g>
  `
});

// 15. NuraxFlow AI — Workflow Automation
generators['nuraxflow-ai'] = () => windowWrapper({
  title: 'NuraxFlow AI — Next-Gen Autonomous Business Process Automation Platform',
  badge: 'Orchestrator v2.4 Active',
  bgGradient: ['#0f172a', '#0369a1'],
  bodyContent: `
    <!-- Top System Metrics -->
    <g transform="translate(0, 0)">
      <rect width="1020" height="50" rx="10" fill="#1e293b" />
      <text x="24" y="31" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#f8fafc">Enterprise Workflow Canvas: Lead-to-Fulfillment Multi-Step Orchestration</text>
      <text x="996" y="31" font-family="monospace" font-size="12" font-weight="700" fill="#10b981" text-anchor="end">Execution Uptime: 99.98%</text>
    </g>

    <!-- Visual Canvas with Connected Flow Nodes -->
    <g transform="translate(0, 70)">
      <rect width="1020" height="480" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1" />

      <!-- Horizontal Flow Sequence -->
      <g transform="translate(40, 50)">
        <!-- Node 1: Webhook Trigger -->
        <g transform="translate(0, 20)">
          <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
          <rect width="180" height="26" rx="12" fill="#0284c7" />
          <text x="90" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">TRIGGER</text>
          <text x="14" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Inbound Webhook</text>
          <text x="14" y="70" font-family="monospace" font-size="10" fill="#94a3b8">POST /api/v1/lead</text>
          <text x="14" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#10b981">✓ Payload Validated</text>
        </g>

        <!-- Connector 1 -->
        <line x1="180" y1="75" x2="240" y2="75" stroke="#38bdf8" stroke-width="2" />
        <polygon points="240,71 248,75 240,79" fill="#38bdf8" />

        <!-- Node 2: AI Document Processing -->
        <g transform="translate(250, 20)">
          <rect width="190" height="110" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="1.5" />
          <rect width="190" height="26" rx="12" fill="#7e22ce" />
          <text x="95" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">AI PROCESSOR</text>
          <text x="14" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Document Parsing</text>
          <text x="14" y="70" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">Entity Extraction &amp; OCR</text>
          <text x="14" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#c084fc">99.4% Accuracy</text>
        </g>

        <!-- Connector 2 -->
        <line x1="440" y1="75" x2="500" y2="75" stroke="#a855f7" stroke-width="2" />
        <polygon points="500,71 508,75 500,79" fill="#a855f7" />

        <!-- Node 3: Condition Branch -->
        <g transform="translate(510, 20)">
          <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" />
          <rect width="180" height="26" rx="12" fill="#d97706" />
          <text x="90" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">DECISION RULE</text>
          <text x="14" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Value &gt; $5,000?</text>
          <text x="14" y="70" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">Priority SLA Route</text>
          <text x="14" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#fde68a">Branch: High-Value</text>
        </g>

        <!-- Connector 3 -->
        <line x1="690" y1="75" x2="750" y2="75" stroke="#f59e0b" stroke-width="2" />
        <polygon points="750,71 758,75 750,79" fill="#f59e0b" />

        <!-- Node 4: Action: Salesforce & Slack -->
        <g transform="translate(760, 20)">
          <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#00DCA0" stroke-width="1.5" />
          <rect width="180" height="26" rx="12" fill="#00DCA0" fill-opacity="0.3" />
          <text x="90" y="17" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#00DCA0" text-anchor="middle">INTEGRATION</text>
          <text x="14" y="52" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">Salesforce Create</text>
          <text x="14" y="70" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">Slack Ping + Email Alert</text>
          <text x="14" y="90" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#00DCA0">Task Assigned</text>
        </g>
      </g>

      <!-- Bottom Canvas: Execution Telemetry Feed -->
      <g transform="translate(40, 210)">
        <rect width="940" height="225" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <g transform="translate(20, 20)">
          <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#ffffff">Live Multi-Step Execution Telemetry</text>
          
          <g transform="translate(0, 30)">
            ${[
              { time: '10:48:12.410', flow: 'Lead_Orchestrator_01', step: 'Webhook received from Client Landing Page', ms: '12ms', status: 'SUCCESS' },
              { time: '10:48:12.620', flow: 'Lead_Orchestrator_01', step: 'Document entity extraction via Neural Model', ms: '85ms', status: 'SUCCESS' },
              { time: '10:48:12.850', flow: 'Lead_Orchestrator_01', step: 'Salesforce Opportunity created: #OPP-94821', ms: '45ms', status: 'SUCCESS' },
              { time: '10:48:13.010', flow: 'Lead_Orchestrator_01', step: 'Team Slack notification dispatched to #sales-vip', ms: '18ms', status: 'SUCCESS' }
            ].map((log, idx) => `
              <g transform="translate(0, ${idx * 36})">
                <rect width="900" height="30" rx="6" fill="#0f172a" />
                <text x="12" y="20" font-family="monospace" font-size="10" fill="#94a3b8">${log.time}</text>
                <text x="160" y="20" font-family="monospace" font-size="11" font-weight="700" fill="#38bdf8">${log.flow}</text>
                <text x="350" y="20" font-family="system-ui, sans-serif" font-size="11" fill="#f8fafc">${log.step}</text>
                <text x="800" y="20" font-family="monospace" font-size="11" fill="#f59e0b">${log.ms}</text>
                <rect x="840" y="6" width="50" height="18" rx="4" fill="#10b981" fill-opacity="0.2" />
                <text x="865" y="18" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#10b981" text-anchor="middle">PASS</text>
              </g>
            `).join('')}
          </g>
        </g>
      </g>
    </g>
  `
});

async function run() {
  console.log('Generating Category 2: AI, Machine Learning & Python Projects (8 projects)...');
  for (const [key, fn] of Object.entries(generators)) {
    const dest = path.join(outDir, `${key}.jpg`);
    const svg = fn();
    await sharp(Buffer.from(svg)).jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
    const stat = fs.statSync(dest);
    console.log(`✓ [2/4] ${key}.jpg (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

run();
