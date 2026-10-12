// Finance values are development samples; student identities come from the
// supplied Grade 10 registrar rosters.

import { GRADE_10_ROSTER, GRADE_10_STREAMS } from "@/lib/grade-10-roster";

export const SCHOOL = {
  name: "ST. ELIZABETH GIRLS SENIOR SCHOOL",
  motto: "Elimu ni Ufunguo",
  county: "Meru County",
  address: "P.O. Box 214-60200, Meru",
  phone: "+254 712 345 678",
  email: "info@st.elizabethgirls.ac.ke",
  registration: "MOE/SEC/06114",
  term: "Term 2",
  year: 2026,
};

export const CLASSROOMS = [
  { id: "g10", name: "Grade 10", students: GRADE_10_ROSTER.length, streams: GRADE_10_STREAMS.length },
];

export const STREAMS = GRADE_10_STREAMS.map((stream) => ({
  id: stream.id,
  classroom: stream.grade,
  name: stream.name,
  capacity: 60,
  enrolled: GRADE_10_ROSTER.filter((student) => student.streamId === stream.id).length,
}));

export const HOUSES = [
  { id: "h1", name: "Kilimanjaro", capacity: 120, occupied: 114, patron: "Mr. O. Wambua" },
  { id: "h2", name: "Kenya", capacity: 120, occupied: 118, patron: "Mrs. J. Achieng" },
  { id: "h3", name: "Elgon", capacity: 100, occupied: 96, patron: "Mr. D. Kiptoo" },
  { id: "h4", name: "Longonot", capacity: 100, occupied: 91, patron: "Mrs. F. Chebet" },
];

export const FAMILIES_PLACEHOLDER = ["Baraka", "Amani", "Furaha", "Imani", "Neema", "Tumaini"];

export const VOTE_HEADS = [
  { id: "vh1", code: "1100", name: "Tuition", category: "Instructional", type: "Receipt" },
  { id: "vh2", code: "1200", name: "Boarding", category: "Welfare", type: "Receipt" },
  { id: "vh3", code: "1300", name: "Activity Fee", category: "Co-curricular", type: "Receipt" },
  { id: "vh4", code: "1400", name: "Exam Fee", category: "Instructional", type: "Receipt" },
  { id: "vh5", code: "1500", name: "Lunch Programme", category: "Welfare", type: "Receipt" },
  { id: "vh6", code: "1600", name: "Medical / Insurance", category: "Welfare", type: "Receipt" },
  { id: "vh7", code: "2100", name: "Staff Salaries", category: "Compensation", type: "Payment" },
  { id: "vh8", code: "2200", name: "Repairs & Maintenance", category: "Operations", type: "Payment" },
  { id: "vh9", code: "2300", name: "Teaching Materials", category: "Instructional", type: "Payment" },
  { id: "vh10", code: "2400", name: "Utilities", category: "Operations", type: "Payment" },
  { id: "vh11", code: "2500", name: "Capital — Infrastructure", category: "Capital", type: "Payment" },
];

export const PAYMENT_TYPES = [
  { id: "pt1", name: "M-Pesa Paybill", code: "MPESA" },
  { id: "pt2", name: "Bank Transfer / RTGS", code: "BANK" },
  { id: "pt3", name: "Cash", code: "CASH" },
  { id: "pt4", name: "Cheque", code: "CHQ" },
  { id: "pt5", name: "Bursary — CDF", code: "BURS-CDF" },
  { id: "pt6", name: "Bursary — County", code: "BURS-CTY" },
];

export const BANK_ACCOUNTS = [
  { id: "ba1", bank: "Equity Bank", branch: "Meru", accountName: "ST. ELIZABETH GIRLS SENIOR SCHOOL — Fees", accountNo: "1090 2734 5510", type: "Fees" },
  { id: "ba2", bank: "KCB Bank", branch: "Meru", accountName: "ST. ELIZABETH GIRLS SENIOR SCHOOL — Operations", accountNo: "1122 8890 041", type: "Operations" },
  { id: "ba3", bank: "Co-operative Bank", branch: "Meru", accountName: "ST. ELIZABETH GIRLS SENIOR SCHOOL — Bursary", accountNo: "0114 5567 213", type: "Bursary" },
];

export type Student = {
  id: string;
  admNo: string;
  upi: string;
  name: string;
    gender: "Male" | "Female" | "";
  classroom: string;
  stream: string;
  isBoarder: boolean;
  house?: string;
  guardian: string;
  guardianPhone: string;
  status: "Active" | "Left" | "Graduated" | "Transferred";
  balance: number;
  dateAdmitted: string;
};

export const STUDENTS: Student[] = GRADE_10_ROSTER.map(({ admNo, name, stream }) => ({
  id: `stu-${admNo.toLowerCase()}`,
  admNo,
  upi: "",
  name,
    gender: "",
  classroom: "Grade 10",
  stream,
  isBoarder: false,
  guardian: "",
  guardianPhone: "",
  status: "Active",
  balance: 0,
  dateAdmitted: "",
}));

export type Transaction = {
  id: string;
  receiptNo: string;
  studentAdm: string;
  studentName: string;
  classroom: string;
  voteHead: string;
  amount: number;
  paymentType: string;
  bank: string;
  refNo: string;
  date: string;
  recordedBy: string;
  voided: boolean;
};

const TX_VOTE_HEADS = ["Tuition", "Boarding", "Activity Fee", "Exam Fee", "Lunch Programme"];

function seededTransactions(): Transaction[] {
  const list: Transaction[] = [];
  for (let i = 0; i < 18; i++) {
    const s = STUDENTS[i % STUDENTS.length];
    list.push({
      id: `tx-${i + 1}`,
      receiptNo: `RCT-${8840 + i}`,
      studentAdm: s.admNo,
      studentName: s.name,
      classroom: s.classroom,
      voteHead: TX_VOTE_HEADS[i % TX_VOTE_HEADS.length],
      amount: [2000, 5000, 7500, 10000, 15000, 3200][i % 6],
      paymentType: PAYMENT_TYPES[i % PAYMENT_TYPES.length].name,
      bank: BANK_ACCOUNTS[i % BANK_ACCOUNTS.length].bank,
      refNo: `${["MPX", "FT", "CSH", "CHQ"][i % 4]}${(220000 + i * 731).toString()}`,
      date: `2026-05-${(4 + (i % 24)).toString().padStart(2, "0")}`,
      recordedBy: ["A. Mutiso", "B. Kilonzo", "C. Njeri"][i % 3],
      voided: i === 11,
    });
  }
  return list;
}

export const TRANSACTIONS: Transaction[] = seededTransactions();

export const OTHER_INCOME = [
  { id: "oi1", date: "2026-05-02", source: "Hire of Hall — Community Fundraiser", amount: 18000, voteHead: "Other Income", recordedBy: "A. Mutiso" },
  { id: "oi2", date: "2026-05-09", source: "Sale of Farm Produce", amount: 6400, voteHead: "Other Income", recordedBy: "C. Njeri" },
  { id: "oi3", date: "2026-05-14", source: "Donation — Alumni Association", amount: 55000, voteHead: "Grants & Donations", recordedBy: "A. Mutiso" },
  { id: "oi4", date: "2026-05-20", source: "Bus Hire Income", amount: 12500, voteHead: "Other Income", recordedBy: "B. Kilonzo" },
];

export const PAYMENT_VOUCHERS = [
  { id: "pv1", voucherNo: "PV-2026-041", payee: "Metro Stationers Ltd", voteHead: "Teaching Materials", amount: 24500, status: "Paid", date: "2026-05-03" },
  { id: "pv2", voucherNo: "PV-2026-042", payee: "Kenya Power", voteHead: "Utilities", amount: 38900, status: "Paid", date: "2026-05-06" },
  { id: "pv3", voucherNo: "PV-2026-043", payee: "Meru Water & Sewerage Co.", voteHead: "Utilities", amount: 9700, status: "Pending", date: "2026-05-11" },
  { id: "pv4", voucherNo: "PV-2026-044", payee: "Bidii Builders", voteHead: "Repairs & Maintenance", amount: 142000, status: "Pending", date: "2026-05-15" },
  { id: "pv5", voucherNo: "PV-2026-045", payee: "Highland Foods Suppliers", voteHead: "Lunch Programme", amount: 68300, status: "Paid", date: "2026-05-18" },
];

export const INVOICES = [
  { id: "inv1", invoiceNo: "INV-3301", supplier: "Metro Stationers Ltd", voteHead: "Teaching Materials", amount: 24500, status: "Settled", dateReceived: "2026-04-29" },
  { id: "inv2", invoiceNo: "INV-3302", supplier: "Bidii Builders", voteHead: "Repairs & Maintenance", amount: 142000, status: "Outstanding", dateReceived: "2026-05-10" },
  { id: "inv3", invoiceNo: "INV-3303", supplier: "Highland Foods Suppliers", voteHead: "Lunch Programme", amount: 68300, status: "Settled", dateReceived: "2026-05-15" },
  { id: "inv4", invoiceNo: "INV-3304", supplier: "SafeGuard Security Ltd", voteHead: "Operations", amount: 96000, status: "Outstanding", dateReceived: "2026-05-19" },
];

export const COMMITMENTS = [
  { id: "cm1", ref: "CMT-118", voteHead: "Repairs & Maintenance", description: "Dormitory roof repair — Elgon House", amount: 142000, status: "Committed", date: "2026-05-08" },
  { id: "cm2", ref: "CMT-119", voteHead: "Teaching Materials", description: "Term 2 revision booklets — Form 4", amount: 31500, status: "Committed", date: "2026-05-12" },
  { id: "cm3", ref: "CMT-120", voteHead: "Capital — Infrastructure", description: "Science lab bench replacement", amount: 210000, status: "Draft", date: "2026-05-17" },
];

export const VOTES_ASSIGNMENT = [
  { voteHead: "Tuition", term: "Term 2", budget: 4200000, actual: 3110400 },
  { voteHead: "Boarding", term: "Term 2", budget: 2600000, actual: 1980500 },
  { voteHead: "Staff Salaries", term: "Term 2", budget: 3800000, actual: 3800000 },
  { voteHead: "Teaching Materials", term: "Term 2", budget: 420000, actual: 268500 },
  { voteHead: "Utilities", term: "Term 2", budget: 260000, actual: 197400 },
  { voteHead: "Repairs & Maintenance", term: "Term 2", budget: 500000, actual: 356000 },
  { voteHead: "Capital — Infrastructure", term: "Term 2", budget: 900000, actual: 210000 },
];

export const COLLECTIONS_BY_DAY = [
  { date: "May 04", amount: 182000 },
  { date: "May 06", amount: 241500 },
  { date: "May 08", amount: 96200 },
  { date: "May 11", amount: 310800 },
  { date: "May 13", amount: 274000 },
  { date: "May 15", amount: 156900 },
  { date: "May 18", amount: 402100 },
  { date: "May 20", amount: 218700 },
];

export const COLLECTIONS_BY_TYPE = [
  { type: "M-Pesa Paybill", amount: 1284500 },
  { type: "Bank Transfer / RTGS", amount: 512300 },
  { type: "Cash", amount: 218900 },
  { type: "Cheque", amount: 96400 },
  { type: "Bursary", amount: 371200 },
];

export const DEFAULTERS = STUDENTS.filter((s) => s.balance > 0 && s.status === "Active").sort((a, b) => b.balance - a.balance);

export const RECON_RECORDS = [
  { id: "rc1", date: "2026-05-04", description: "M-Pesa settlement — Paybill 400211", bankAmount: 182000, bookAmount: 182000, status: "Matched" },
  { id: "rc2", date: "2026-05-06", description: "RTGS — County Bursary Board", bankAmount: 241500, bookAmount: 241500, status: "Matched" },
  { id: "rc3", date: "2026-05-08", description: "Cash banking — Equity Meru", bankAmount: 96200, bookAmount: 94200, status: "Variance" },
  { id: "rc4", date: "2026-05-11", description: "M-Pesa settlement — Paybill 400211", bankAmount: 310800, bookAmount: 310800, status: "Matched" },
  { id: "rc5", date: "2026-05-13", description: "Unidentified bank credit", bankAmount: 15000, bookAmount: 0, status: "Unmatched — bank" },
  { id: "rc6", date: "2026-05-15", description: "Fees receipt not yet banked", bankAmount: 0, bookAmount: 8600, status: "Unmatched — books" },
];

export const SMS_TEMPLATES = [
  { id: "tpl1", name: "Fee balance reminder", body: "Dear Parent, {student_name} (Adm {adm_no}) has an outstanding balance of KES {balance}. Kindly clear before {deadline}. — ST. ELIZABETH GIRLS SENIOR SCHOOL" },
  { id: "tpl2", name: "Payment confirmation", body: "Payment of KES {amount} received for {student_name}, Adm {adm_no}. Receipt No. {receipt_no}. New balance: KES {balance}. Thank you." },
  { id: "tpl3", name: "Term opening notice", body: "Reminder: Term {term} opens on {date}. Please ensure fees and requirements are ready. — ST. ELIZABETH GIRLS SENIOR SCHOOL" },
];

export const SMS_DELIVERY_LOG = [
  { id: "sms1", date: "2026-05-19 08:14", recipients: 612, template: "Fee balance reminder", delivered: 598, failed: 14, unitsUsed: 612 },
  { id: "sms2", date: "2026-05-12 09:02", recipients: 799, template: "Term opening notice", delivered: 781, failed: 18, unitsUsed: 799 },
  { id: "sms3", date: "2026-05-06 16:40", recipients: 44, template: "Payment confirmation", delivered: 44, failed: 0, unitsUsed: 44 },
];

export const SMS_UNIT_HISTORY = [
  { id: "u1", date: "2026-05-01", description: "Opening balance", units: 3400 },
  { id: "u2", date: "2026-05-06", description: "Payment confirmations sent", units: -44 },
  { id: "u3", date: "2026-05-12", description: "Term opening notice sent", units: -799 },
  { id: "u4", date: "2026-05-15", description: "Units purchased — Safaricom Bulk", units: 2000 },
  { id: "u5", date: "2026-05-19", description: "Fee balance reminder sent", units: -612 },
];

export type StaffMember = {
  id: string;
  staffNo: string;
  name: string;
  role: string;
  department: string;
  basicSalary: number;
  status: "Active" | "On Leave" | "Exited";
};

export const STAFF: StaffMember[] = [
  { id: "st1", staffNo: "TSC-2201", name: "Alfred Mutiso", role: "Principal", department: "Administration", basicSalary: 185000, status: "Active" },
  { id: "st2", staffNo: "TSC-2244", name: "Beatrice Kilonzo", role: "Deputy Principal", department: "Administration", basicSalary: 152000, status: "Active" },
  { id: "st3", staffNo: "TSC-3110", name: "Caroline Njeri", role: "Bursar", department: "Finance", basicSalary: 98000, status: "Active" },
  { id: "st4", staffNo: "TSC-4402", name: "Dennis Kiptoo", role: "Mathematics Teacher", department: "Academics", basicSalary: 74500, status: "Active" },
  { id: "st5", staffNo: "TSC-4415", name: "Esther Wambui", role: "English Teacher", department: "Academics", basicSalary: 74500, status: "On Leave" },
  { id: "st6", staffNo: "BOM-1102", name: "Felix Kamau", role: "Groundsman", department: "Support Staff", basicSalary: 18500, status: "Active" },
  { id: "st7", staffNo: "BOM-1109", name: "Grace Auma", role: "Cook", department: "Support Staff", basicSalary: 16000, status: "Active" },
  { id: "st8", staffNo: "TSC-4491", name: "Hassan Ali", role: "Chemistry Teacher", department: "Academics", basicSalary: 79000, status: "Exited" },
];

export const IPSAS_RECEIPTS = [
  { code: "1100", item: "Tuition Fees", amount: 4210300 },
  { code: "1200", item: "Boarding Fees", amount: 2680900 },
  { code: "1300", item: "Activity Fees", amount: 512400 },
  { code: "1400", item: "Exam Fees", amount: 398100 },
  { code: "1500", item: "Lunch Programme Fees", amount: 611200 },
  { code: "1700", item: "Bursary & Grants Received", amount: 924300 },
  { code: "1800", item: "Other Income", amount: 91900 },
];

export const IPSAS_PAYMENTS = [
  { code: "2100", item: "Compensation of Employees", amount: 3800000 },
  { code: "2200", item: "Use of Goods and Services", amount: 1240600 },
  { code: "2300", item: "Teaching Materials", amount: 420800 },
  { code: "2400", item: "Utilities", amount: 197400 },
  { code: "2500", item: "Capital — Infrastructure", amount: 610000 },
  { code: "2600", item: "Transfers & Subsidies", amount: 88000 },
];

export const IPSAS_CASHFLOW = {
  openingBalance: 812400,
  operating: 1682900,
  investing: -610000,
  financing: 0,
  closingBalance: 1885300,
};

export const BUDGET_VS_ACTUAL = VOTES_ASSIGNMENT.map((v) => ({
  ...v,
  variance: v.budget - v.actual,
  pct: Math.round((v.actual / v.budget) * 100),
}));
