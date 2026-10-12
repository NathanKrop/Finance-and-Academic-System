import { Send, Coins, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea, Checkbox } from "@/components/ui/Form";
import { SMS_TEMPLATES } from "@/lib/mock-data";

export default function BulkSmsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Message · 06"
        title="Bulk SMS"
        subtitle="Send fee reminders, balance notices, or general announcements to guardian phone numbers via Africa's Talking."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <Card>
          <CardHeader eyebrow="Compose" title="New message" />
          <form className="space-y-4">
            <Field label="Template" hint="Optional — start from a saved template">
              <Select defaultValue="">
                <option value="">Blank message</option>
                {SMS_TEMPLATES.map((t) => <option key={t.id}>{t.name}</option>)}
              </Select>
            </Field>
            <Field label="Recipients" required>
              <Select defaultValue="defaulters">
                <option value="all">All guardians</option>
                <option value="defaulters">Defaulters only (612)</option>
                <option value="classroom">By classroom…</option>
                <option value="custom">Custom list</option>
              </Select>
            </Field>
            <Field label="Message" required hint="Use {student_name}, {adm_no}, {balance} to personalise per recipient">
              <Textarea
                rows={5}
                defaultValue={SMS_TEMPLATES[0].body}
              />
            </Field>
            <div className="flex items-center justify-between">
              <Checkbox label="Schedule for later" />
              <span className="figures text-xs text-ink-soft">160 characters ≈ 1 unit per recipient</span>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" icon={Send}>Send to 612 guardians</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-1.5 flex items-center gap-1.5"><Coins size={12} /> SMS Units Available</p>
            <p className="figures text-2xl font-medium">2,989</p>
            <p className="text-xs text-ink-soft mt-1">This send will use approximately 612 units</p>
          </Card>
          <Card className="bg-brass-dim border-brass/30">
            <div className="flex items-start gap-2.5">
              <Info size={15} className="text-brass mt-0.5 shrink-0" />
              <p className="text-[11.5px] text-ink-soft leading-relaxed">
                Each guardian&apos;s message is personalised before sending — balances and receipt numbers are pulled
                live so no two messages in a batch are identical.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
