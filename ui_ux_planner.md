# ClassFlow — UI/UX Planner: Individual Teacher Edition (Any School & Any Subject)

Designed as a **Personal Teacher Assistant / Daily Copilot** for individual teachers of any school, grade, and subject:
- **Core Vision**: Empower individual teachers directly with zero administrative bottlenecks or complex approval delays.
- **Workflow**:
  - Teacher signs up and creates their own classes (any subject: Mathematics, Science, English, etc.).
  - Quick student onboarding via single entry or bulk copy-paste (Excel / WhatsApp).
  - Rapid Daily Class Grid (60–90 second logging with tap-cycle pills and 1-tap accelerator).
  - Personal Intervention Attention Queue (🔴 High Priority Red, 🟡 Amber) with direct 1-tap WhatsApp message & Phone call.
  - Comprehensive Export Suite: 1-Page printable PTM Dossier + Class-Wide Consolidated Ledger (with CSV / Excel download).

---

## 1. User Roles & Institutional Hierarchy

```
[ Grade 1-6 Subject / Class Teacher ]
   │  Logs daily HW/CW (post-dismissal in staff room)
   │  Flags academic/behavioral struggles
   │  Generates Individual or Class-Wide Reports (Daily/Weekly/Monthly)
   │  Exports, Saves PDF, or Shares Dossier with Coordinator
   ▼
[ Daily Staff Room Escalation Dossier / Class Ledger ]
   │
   ▼
[ Primary Section Coordinator / School Admin ]
   │  Reviews flagged students across Class 1 to 6
   │  Approves or modifies recommended interventions
   │  Dispatches official school communications / Schedules PTM slot
   ▼
[ Parent of Primary Student ]
```

---

## 2. Staff Room Post-Dismissal Workflow (Classes 1–6)

### The 10-Minute Staff Room Sequence:
1. **Open App at Dismissal (e.g. 2:30 PM – 3:15 PM)**:
   - Dashboard displays assigned primary classes (e.g., *Class 3-A English*, *Class 5-B Mathematics*).
2. **60-Second Rapid Grid Logging per Class**:
   - Organized by **Roll Number** & Student Name.
   - Status options: `Submitted (✓)`, `Incomplete (△)`, `Missing (✗)`, `Absent (A)`.
   - 1-tap accelerator: `[ Mark Remaining as Submitted ]`.
3. **Drop Teacher Flag (If Needed)**:
   - Severity: `🟡 Amber (Minor struggle)` or `🔴 Red (Repeated/Urgent)`.
   - Suggested Action for Admin:
     - `Recommend Official Diary Note`
     - `Recommend Coordinator Call to Parent`
     - `Recommend Remedial Batch Allocation`
     - `Request Formal PTM Slot`
4. **Export, Save & Share Reports**:
   - Individual student PTM reports for upcoming parent meetings.
   - Class-wide ledger for weekly administrative submission.
5. **End-of-Day Batch Submission to Admin**:
   - Teacher reviews **Daily Attention Queue Summary**.
   - Taps `[ Submit Daily Escalation Report to Coordinator ]`.

---

## 3. Screen Layouts: Daily Logging & Escalation

### 3.1 Screen 1: Primary Class Daily Grid (`/classes/[id]/daily`)
```
+---------------------------------------+
| ← Class 4-A Mathematics    [ Oct 4 ]  |
| HW: Chapter 5 - Long Division (Ex 5.2)|
| Dismissal Wrap-up • 32 Students       |
+---------------------------------------+
| ⚡ ACCELERATOR:                        |
| [ ✓ Mark All Remaining as Submitted ] |
+---------------------------------------+
| Roll | Student Name                   |
+---------------------------------------+
| #01  | Aarav Sharma                   |
|      | [ ✓ Submitted ]   [ + Flag ]   |
+------+--------------------------------+
| #02  | Ananya Patel       🔴 2 Missed |
|      | [ ✗ Missing   ]   [ 🚩 Flagged]|
+------+--------------------------------+
| #03  | Devansh Gupta                  |
|      | [ △ Incomplete]   [ + Flag ]   |
+------+--------------------------------+
| #04  | Ishaan Verma       🟡 Concept  |
|      | [ ✓ Submitted ]   [ 📝 Remed ] |
+---------------------------------------+
| [ Submit Class Log & Next Class → ]   |
+---------------------------------------+
```

---

### 3.2 Screen 2: Quick Flag & Admin Action Recommendation
```
+---------------------------------------+
|  Add Observation & Admin Escalation   |
|  Student: Roll #02 Ananya Patel (4-A) |
|---------------------------------------|
| Category:                             |
|  [ Academic ] [ Incomplete HW ] [ Diary ]
|                                       |
| Severity:                             |
|  ( ) 🟡 Amber Warning  (●) 🔴 Red Alert|
|                                       |
| Recommended Action for Administration:|
|  [●] Request Coordinator Call to Parent|
|  [ ] Recommend Remedial Math Batch    |
|  [ ] Request Official School Diary Note|
|  [ ] Request Formal PTM Slot          |
|                                       |
| Teacher's Note to Coordinator:        |
| [ Struggling with 2-digit division.   |
|   Did not bring notebook for 2 days. ]|
|                                       |
| [ Save Recommendation ]               |
+---------------------------------------+
```

---

### 3.3 Screen 3: Teacher's Attention Queue (`/dashboard/attention-queue`)
```
+---------------------------------------+
| Attention Queue                   (3) |
| Pending Admin Review for Today        |
+---------------------------------------+
| 🔴 HIGH PRIORITY                      |
| +-----------------------------------+ |
| | Roll #02 Ananya Patel (Class 4-A) | |
| | Reason: 2 Consecutive Missing HW  | |
| | Rec: Request Coordinator Call     | |
| | Status: [ Ready to Escalate ]     | |
| +-----------------------------------+ |
|                                       |
| 🟡 MEDIUM PRIORITY                    |
| +-----------------------------------+ |
| | Roll #04 Ishaan Verma (Class 4-A) | |
| | Reason: Scoring < 40% on Div Quiz | |
| | Rec: Recommend Remedial Batch     | |
| | Status: [ Ready to Escalate ]     | |
| +-----------------------------------+ |
|                                       |
| [ 📨 SUBMIT DAILY REPORT TO ADMIN ]  |
+---------------------------------------+
```

---

## 4. Export & Reporting Suite (Individual & Class-Wide)

Teachers have dedicated export controls from the mobile navigation bar:

```
+-------------------------------------------------------------+
|   [ 🏠 Home ]   [ 📚 Classes ]   [ 📊 Reports ]   [ 👤 Profile ]   |
+-------------------------------------------------------------+
```

### 4.1 Screen 4A: Individual Student PTM Report Generator (`/students/[id]/ptm`)
*Exportable for: Daily, Weekly, Monthly, or Custom Date Range.*

```
+---------------------------------------+
| ← Student PTM Brief                   |
| Roll #02 • Ananya Patel (Class 4-A)   |
+---------------------------------------+
| TIMEFRAME SELECTOR:                   |
| [ Daily (Today) ]  [★ Weekly ]        |
| [ Monthly (Sept) ] [ Custom Range ]   |
+---------------------------------------+
| 📊 REPORT PREVIEW (This Week):        |
| • Homework Done: 4 / 5 (80%)          |
| • Missing HW: Ex 5.2 (Oct 4)          |
| • Tests: Mental Math Quiz: 18/25 (72%)|
| • Active Flags: 1 Red (Division)      |
| • Admin Status: Call Approved by Coord|
+---------------------------------------+
| ACTION CONTROLS:                      |
| [ 💾 Save PDF to Device ]             |
| [ 📤 Share via WhatsApp / Mail ]      |
| [ 🖨️ Print 1-Page Physical Sheet ]    |
+---------------------------------------+
```

#### Individual PTM Sheet Format (1-Page Printable Dossier):
- **Header**: Official School Letterhead (CBSE / ICSE / State Board).
- **Timeframe Label**: e.g., *"Weekly Progress Report (Sept 28 – Oct 4, 2026)"* or *"Monthly Dossier (September 2026)"*.
- **Student Data**: Roll Number, Admission Number, Class & Section.
- **Subject-Wise Homework Completion**: Total assignments, completed, missing, late.
- **Unit & Periodic Assessments**: Marks obtained vs Max Marks, percentage.
- **Teacher Observations**: Notes logged during the timeframe with coordinator action status.
- **Sign-off Block**:
  - Class Teacher Signature
  - Primary Coordinator Signature
  - Parent / Guardian Acknowledgment Signature

---

### 4.2 Screen 4B: Class-Wide Consolidated Ledger Report (`/classes/[id]/reports`)
*Exports all students in the class together in a structured institutional ledger format.*

```
+---------------------------------------+
| ← Class Reports: Class 4-A Math       |
| Consolidated Ledger for 32 Students   |
+---------------------------------------+
| SELECT PERIOD:                        |
| [ This Week ]  [★ This Month (Sept) ] |
+---------------------------------------+
| SUMMARY METRICS:                      |
| • Class HW Average: 87.4%             |
| • Periodic Test Avg: 68.2%            |
| • Students Needing Attention: 3       |
+---------------------------------------+
| LEDGER PREVIEW:                       |
| Roll | Name         | HW% | Test%| Attn|
| #01  | Aarav Sharma | 96% | 88%  | OK  |
| #02  | Ananya Patel | 65% | 52%  | 🔴  |
| #03  | Devansh Gupta| 80% | 70%  | 🟡  |
| #04  | Ishaan Verma | 90% | 40%  | 🟡  |
| ... (All 32 students in roll order)   |
+---------------------------------------+
| EXPORT & DISTRIBUTION OPTIONS:        |
| [ 💾 Save Consolidated PDF / Excel ]  |
| [ 📤 Share Ledger with Coordinator ]  |
| [ 🖨️ Batch Print Class Dossier ]      |
+---------------------------------------+
```

#### Class-Wide Ledger Format Specification:
A horizontal tabular ledger (landscape A4 or clean mobile view):
1. **Roll Number** (Sorted 1 to N)
2. **Admission Number**
3. **Student Full Name**
4. **Total Homework Given** (in selected period)
5. **Homework Submitted** & **Submission %**
6. **Average Assessment Marks (%)**
7. **Red Flags Count** (Immediate intervention)
8. **Amber Flags Count** (Monitor)
9. **Coordinator Intervention Status** (e.g., *"Parent Call Scheduled"*, *"Remedial Enrolled"*, *"Normal"*)

---

## 5. Technical Implementation of Save & Share

### 5.1 Mobile Native Share (`navigator.share`)
```javascript
// Example 2026 Web Share API integration
async function shareReport(reportBlob, title, fileName) {
  if (navigator.canShare && navigator.canShare({ files: [new File([reportBlob], fileName, { type: 'application/pdf' })] })) {
    await navigator.share({
      title: title,
      text: 'Official ClassFlow Report for Coordinator Review',
      files: [new File([reportBlob], fileName, { type: 'application/pdf' })]
    });
  } else {
    // Fallback: Trigger instant direct download
    saveAs(reportBlob, fileName);
  }
}
```

### 5.2 Mobile Save Options:
- **Save as PDF**: Generates standard vector PDF via `@react-pdf/renderer` or client-side print-to-PDF.
- **Save as Excel / CSV**: For the Class-Wide Consolidated Ledger, allows instant `.csv` download for school administrative archives.
- **Direct Wireless Print**: Leverages browser `window.print()` with custom `@page { size: A4 landscape/portrait; margin: 12mm; }`.
