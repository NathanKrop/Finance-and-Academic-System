import { Printer, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Form";
import { kes } from "@/lib/format";
import { SCHOOL, STAFF } from "@/lib/mock-data";

export default function PayslipsPage() {
  const staff = STAFF[3];
  const basic = staff.basicSalary;
  const houseAllowance = 15000;
  const commuter = 5000;
  const gross = basic + houseAllowance + commuter;
  const paye = Math.round(gross * 0.22);
  const nssf = 2160;
  const sha = Math.round(gross * 0.0275);
  const housingLevy = Math.round(gross * 0.015);
  const totalDeductions = paye + nssf + sha + housingLevy;
  const net = gross - totalDeductions;

  return (
    <div>
      <PageHeader
        eyebrow="PayRoll · 07"
        title="Payslips"
        subtitle="Generate and print an individual payslip for the current pay period."
        actions={
          <>
            <Button variant="outline" icon={Download}>Download PDF</Button>
            <Button variant="primary" icon={Printer}>Print</Button>
          </>
        }
      />

      <Card className="mb-5 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4 items-end">
          <Field label="Staff Member">
            <Select defaultValue={staff.id}>
              {STAFF.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.staffNo}</option>)}
            </Select>
          </Field>
          <Field label="Pay Period"><Select defaultValue="2026-05"><option value="2026-05">May 2026</option><option value="2026-04">April 2026</option></Select></Field>
        </div>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between border-b border-line pb-5 mb-5">
          <div>
            <p className="font-display text-lg text-ink">{SCHOOL.name}</p>
            <p className="text-xs text-ink-soft">{SCHOOL.registration}</p>
          </div>
          <div className="text-right">
            <p className="figures text-[11px] uppercase tracking-[0.14em] text-brass">Payslip</p>
            <p className="figures text-xs text-ink-soft mt-1">May 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><p className="text-ink-soft text-xs">Employee</p><p className="text-ink">{staff.name}</p></div>
          <div><p className="text-ink-soft text-xs">Staff No.</p><p className="figures text-ink">{staff.staffNo}</p></div>
          <div><p className="text-ink-soft text-xs">Role</p><p className="text-ink">{staff.role}</p></div>
          <div><p className="text-ink-soft text-xs">Department</p><p className="text-ink">{staff.department}</p></div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-soft mb-2 pb-1 border-b border-line">Earnings</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">Basic Salary</span><span className="figures">{kes(basic)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">House Allowance</span><span className="figures">{kes(houseAllowance)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Commuter Allowance</span><span className="figures">{kes(commuter)}</span></div>
            </div>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-soft mb-2 pb-1 border-b border-line">Deductions</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">PAYE</span><span className="figures">{kes(paye)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">NSSF</span><span className="figures">{kes(nssf)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">SHA</span><span className="figures">{kes(sha)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Housing Levy</span><span className="figures">{kes(housingLevy)}</span></div>
            </div>
          </div>
        </div>

        <div className="perforated pt-4 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-ink-soft">Gross Pay</span><span className="figures">{kes(gross)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-ink-soft">Total Deductions</span><span className="figures text-stamp-rust">-{kes(totalDeductions)}</span></div>
          <div className="flex justify-between pt-2 border-t border-line mt-2">
            <span className="font-display text-base text-ink">Net Pay</span>
            <span className="figures text-xl font-medium text-stamp-green">{kes(net)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
