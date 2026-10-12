import { Download, UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";

const PREVIEW_ROWS = [
  { row: 2, admNo: "SS2115", name: "JOYLINE CHEMTAI", classroom: "Grade 10", issue: null },
  { row: 3, admNo: "SS2114", name: "ABIGAEL CHEPKEMOI SIRMA", classroom: "Grade 10", issue: null },
  { row: 4, admNo: "SS2122", name: "STELLA CHEYECH LOCHERO", classroom: "Grade 10", issue: "Duplicate Adm No — already registered" },
  { row: 5, admNo: "SS2123", name: "BRENDA CHEPTOO KSANG", classroom: "Grade10", issue: "Unrecognised classroom \"Grade10\" — check spelling" },
  { row: 6, admNo: "SS2131", name: "", classroom: "Grade 10", issue: "Full name is required" },
  { row: 7, admNo: "SS2116", name: "ESTHER NEKESA", classroom: "Grade 10", issue: null },
];

export default function BulkUploadPage() {
  const errorCount = PREVIEW_ROWS.filter((r) => r.issue).length;

  return (
    <div>
      <PageHeader
        eyebrow="Registration · 01"
        title="Bulk Excel Upload"
        subtitle="Register a whole intake class at once. Every row is validated before anything is committed to the roster."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-1">
          <CardHeader eyebrow="Step 1" title="Download the template" />
          <p className="text-sm text-ink-soft mb-4">
            Use the official column layout so the validator can match each field correctly — Adm No, UPI No, Full
            Name, Gender, Date of Birth, Classroom, Stream, Boarder, House, Guardian Name, Guardian Phone, County.
          </p>
          <Button variant="outline" icon={Download} className="w-full">Download template (.xlsx)</Button>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader eyebrow="Step 2" title="Upload your file" />
          <div className="border-2 border-dashed border-line-strong rounded-lg py-10 flex flex-col items-center justify-center text-center bg-paper-dim/40">
            <UploadCloud size={28} className="text-ink-soft mb-3" strokeWidth={1.5} />
            <p className="text-sm text-ink mb-1">Drag and drop your .xlsx file here</p>
            <p className="text-xs text-ink-soft mb-4">or</p>
            <Button variant="primary" size="sm">Choose file</Button>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="p-5 pb-0 flex items-center justify-between flex-wrap gap-3">
          <CardHeader
            eyebrow="Step 3"
            title="Validation preview"
            subtitle="grade-10-intake-2026.xlsx · 6 rows detected"
          />
          <div className="flex items-center gap-2 mb-4">
            <span className="stamp stamp-green"><CheckCircle2 size={11} /> {PREVIEW_ROWS.length - errorCount} ready</span>
            <span className="stamp stamp-rust"><AlertTriangle size={11} /> {errorCount} need attention</span>
          </div>
        </div>

        <DataTable
          keyField={(r) => String(r.row)}
          rows={PREVIEW_ROWS}
          columns={[
            { header: "Row", render: (r) => <span className="figures text-xs text-ink-soft">#{r.row}</span> },
            { header: "Adm No", render: (r) => <span className="figures text-xs">{r.admNo}</span> },
            { header: "Full Name", render: (r) => <span className="text-sm">{r.name || <span className="text-ink-soft italic">blank</span>}</span> },
            { header: "Classroom", render: (r) => <span className="text-sm text-ink-soft">{r.classroom}</span> },
            {
              header: "Validation",
              render: (r) => r.issue ? <StatusStamp status="Outstanding" /> : <StatusStamp status="Matched" />,
            },
            {
              header: "Detail",
              render: (r) => (
                <span className={`text-xs ${r.issue ? "text-stamp-rust" : "text-ink-soft"}`}>
                  {r.issue ?? "No issues found"}
                </span>
              ),
            },
          ]}
        />

        <div className="flex items-center justify-between px-5 py-4 border-t border-line">
          <p className="text-xs text-ink-soft flex items-center gap-1.5">
            <FileSpreadsheet size={13} /> Rows with issues will be skipped — fix and re-upload separately.
          </p>
          <Button variant="primary">Commit {PREVIEW_ROWS.length - errorCount} valid rows</Button>
        </div>
      </Card>
    </div>
  );
}
