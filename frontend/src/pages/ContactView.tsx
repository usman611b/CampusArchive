import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ContactService } from '../services/contactService';

const categories = [
  ['GENERAL', 'General question'], ['TECHNICAL', 'Technical problem'],
  ['CONTENT_REPORT', 'Report inappropriate content'], ['COPYRIGHT', 'Copyright / removal request'],
  ['PARTNERSHIP', 'University partnership'], ['FEATURE_REQUEST', 'Feature suggestion'],
  ['ACCOUNT_HELP', 'Account assistance']
];

export const ContactView: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', category: 'GENERAL', subject: '', message: '', resourceUrl: '', consent: false, website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    if (user) setForm((current) => ({ ...current, fullName: current.fullName || user.fullName || '', email: current.email || user.email || '' }));
  }, [user]);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await ContactService.submit(form);
      setReferenceId(result.referenceId || 'received');
      setForm((current) => ({ ...current, subject: '', message: '', resourceUrl: '', consent: false, website: '' }));
    } catch (err: any) {
      showError('Message Not Sent', err?.response?.data?.message || 'Unable to submit your inquiry. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16 animate-in fade-in">
      <PageHeader icon={<MessageSquare className="w-7 h-7 text-blue-600" />} title="Contact CampusArchive" subtitle="Questions, technical support, content reports, partnerships, and feature suggestions." />
      <div className="grid lg:grid-cols-[1fr_1.7fr] gap-6">
        <div className="space-y-4">
          <Card className="p-6 space-y-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="font-extrabold">Professional Support</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">Your inquiry is securely recorded and routed to our professional support mailbox.</p>
            <a href="mailto:support@usmanalii.com" className="text-xs font-bold text-blue-600 hover:underline">support@usmanalii.com</a>
          </Card>
          <Card className="p-6 space-y-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="font-extrabold">Privacy & Safety</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">Do not submit passwords, private keys, payment information, or sensitive academic records.</p>
          </Card>
        </div>
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          {referenceId ? (
            <div className="py-14 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-extrabold">Inquiry Received</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">We saved your request and will review it shortly.</p>
              <p className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 rounded-xl p-3">Reference: {referenceId}</p>
              <Button onClick={() => setReferenceId('')} variant="secondary">Send another message</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-xs font-bold">Full Name *<input required minLength={2} maxLength={100} value={form.fullName} onChange={update('fullName')} className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5" /></label>
                <label className="text-xs font-bold">Email Address *<input required type="email" maxLength={254} value={form.email} onChange={update('email')} className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5" /></label>
              </div>
              <label className="text-xs font-bold block">Category *<select required value={form.category} onChange={update('category')} className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5">{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="text-xs font-bold block">Subject *<input required minLength={3} maxLength={150} value={form.subject} onChange={update('subject')} className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5" /></label>
              <label className="text-xs font-bold block">Message *<textarea required minLength={10} maxLength={3000} rows={7} value={form.message} onChange={update('message')} className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5 resize-y" /><span className="block text-right text-[10px] text-slate-500">{form.message.length}/3000</span></label>
              <label className="text-xs font-bold block">Related Resource URL <span className="font-normal text-slate-500">(optional)</span><input type="url" maxLength={500} value={form.resourceUrl} onChange={update('resourceUrl')} placeholder="https://campusarchive.usmanalii.com/..." className="mt-1 w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2.5" /></label>
              <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-400"><input required type="checkbox" checked={form.consent} onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))} className="mt-0.5" /><span>I agree that CampusArchive may store this inquiry and contact me about it. Do not include passwords or sensitive credentials.</span></label>
              <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} /></label></div>
              <Button type="submit" isLoading={submitting} leftIcon={<Send className="w-4 h-4" />} className="w-full">Submit Secure Inquiry</Button>
              <p className="text-[10px] text-center text-slate-500">Limited to 3 submissions per hour to prevent abuse.</p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ContactView;
