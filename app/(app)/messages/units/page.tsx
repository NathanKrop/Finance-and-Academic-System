import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { SMS_UNIT_HISTORY } from "@/lib/mock-data";

export default function SmsUnitsPage() {
  const balance = SMS_UNIT_HISTORY.reduce((s, u) => s + u.units, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Message · 06"
        title="SMS Units"
        subtitle="1 SMS unit = KES 1. Purchase units and track consumption across all bulk sends."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <Card padded={false}>
          <div className="p-5 pb-0"><CardHeader eyebrow="Ledger" title="Unit history" /></div>
          <DataTable
            keyField={(u) => u.id}
            rows={SMS_UNIT_HISTORY}
            columns={[
              { header: "Date", render: (u) => <span className="figures text-xs text-ink-soft">{u.date}</span> },
              { header: "Description", render: (u) => <span className="text-sm">{u.description}</span> },
              {
                header: "Units",
                align: "right",
                render: (u) => (
                  <span className={`figures text-sm font-medium ${u.units > 0 ? "text-stamp-green" : "text-ink-soft"}`}>
                    {u.units > 0 ? "+" : ""}{u.units.toLocaleString()}
                  </span>
                ),
              },
            ]}
          />
        </Card>

        <div className="space-y-5">
          <Card className="bg-spine text-paper border-spine">
            <p className="text-[11px] uppercase tracking-[0.16em] text-paper/60 mb-1.5">Current Balance</p>
            <p className="figures text-3xl font-medium">{balance.toLocaleString()}</p>
            <p className="text-xs text-paper/60 mt-1">units available</p>
          </Card>

          <Card>
            <CardHeader title="Purchase units" />
            <form className="space-y-4">
              <Field label="Package" required>
                <Select defaultValue="2000">
                  <option value="1000">1,000 units — KES 1,000</option>
                  <option value="2000">2,000 units — KES 2,000</option>
                  <option value="5000">5,000 units — KES 4,750</option>
                  <option value="custom">Custom amount</option>
                </Select>
              </Field>
              <Field label="Pay via">
                <Select defaultValue="mpesa"><option value="mpesa">M-Pesa Paybill</option><option value="bank">Bank Transfer</option></Select>
              </Field>
              <Button variant="primary" icon={Plus} className="w-full">Purchase units</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
