import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { useCreateVisitorMessage, useGetProfile } from "@workspace/api-client-react";
import { PublicShell } from "@/components/site";
import { useSeo } from "@/lib/seo";

function ContactRow({ href, icon, label, value, testId }: { href?: string; icon: React.ReactNode; label: string; value: string; testId: string }) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary">{icon}</span>
        <span className="min-w-0">
          <span className="block text-[13px] text-muted-foreground">{label}</span>
          <span className={`block break-all text-base md:text-lg ${href ? "" : "text-muted-foreground"}`}>{value}</span>
        </span>
      </span>
      {href && <ArrowUpRight aria-hidden="true" className="h-5 w-5 opacity-40 transition-[transform,border-color,background-color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />}
    </>
  );
  const cls = "contact-row group flex items-center justify-between border-t border-border py-6";
  return href ? <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" data-testid={testId} className={cls}>{content}</a> : <div data-testid={testId} className={cls}>{content}</div>;
}

function MessageForm() {
  const send = useCreateVisitorMessage();
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [notice, setNotice] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  useEffect(() => {
    if (notice?.kind !== "success") return;
    const timer = window.setTimeout(() => navigate("/"), 3000);
    return () => window.clearTimeout(timer);
  }, [notice, navigate]);

  return (
    <form className="contact-form" onSubmit={(event) => {
      event.preventDefault();
      if (send.isPending || notice?.kind === "success") return;
      if (!name.trim() || !message.trim()) {
        setNotice({ text: "Please enter your name and a message.", kind: "error" }); return;
      }
      setNotice(null);
      send.mutate({ data: { name: name.trim(), message: message.trim(), website } }, {
        onSuccess: () => { setName(""); setMessage(""); setWebsite(""); setNotice({ text: "Your message has been sent. Taking you back home…", kind: "success" }); },
        onError: () => setNotice({ text: "Your message couldn't be sent. Please try again or use email.", kind: "error" }),
      });
    }}>
      <label htmlFor="visitor-name">Your name</label>
      <input id="visitor-name" name="name" autoComplete="name" maxLength={100} required value={name} onChange={(event) => setName(event.target.value)} placeholder="What should I call you?" />
      <label htmlFor="visitor-message">Your message</label>
      <textarea id="visitor-message" name="message" rows={4} maxLength={2000} required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share your thoughts…" />
      <div className="contact-form-trap" aria-hidden="true">
        <label htmlFor="visitor-website">Website</label><input id="visitor-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
      </div>
      <div className="contact-form-footer">
        <button type="submit" disabled={send.isPending || notice?.kind === "success"}>{send.isPending ? "Sending…" : notice?.kind === "success" ? "Message sent" : "Send message"}<ArrowUpRight aria-hidden="true" size={16} /></button>
        <span>{message.length} / 2000</span>
      </div>
      <p className={`contact-form-notice ${notice?.kind === "error" ? "is-error" : ""}`} role="status" aria-live="polite">{notice?.text || " "}</p>
    </form>
  );
}

export default function TalkWithMe() {
  useSeo({ title: "Let's talk", description: "Get in touch with Parpiboev Bakhtiyor about projects, opportunities, or ideas.", path: "/talkwithme" });
  const profileQ = useGetProfile();
  const profile = profileQ.data;
  const hasContact = !!(profile?.email || profile?.githubUrl || profile?.linkedinUrl);
  return (
    <PublicShell>
      <section className="talk-page" aria-labelledby="talk-title">
        <header className="talk-header">
          <div className="talk-topline"><span className="eyebrow">Get in touch</span><Link href="/" className="collection-back"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back home</Link></div>
          <h1 id="talk-title">Let's talk<span>.</span></h1>
          <p>Have an idea, an opportunity, or just want to say hello? I’d love to hear from you.</p>
        </header>
        <div className="talk-content">
          <MessageForm />
          <section className="talk-details" aria-labelledby="contact-details-title">
            <div className="talk-details-intro"><p className="eyebrow">Find me elsewhere</p><h2 id="contact-details-title">Other ways to connect<span>.</span></h2><p>Prefer to reach out directly? Find me through the links below.</p></div>
            {profileQ.isLoading ? <p role="status">Loading contact details…</p> : profileQ.isError ? <p role="status">Contact details couldn't load. <button type="button" className="link-underline" onClick={() => profileQ.refetch()}>Try again</button></p> : <div className="talk-links">
              <ContactRow testId="link-email" href={profile?.email ? `mailto:${profile.email}` : undefined} icon={<Mail aria-hidden="true" className="h-4 w-4" />} label="Email" value={profile?.email || "Not added yet"} />
              <ContactRow testId="link-github" href={profile?.githubUrl || undefined} icon={<Github aria-hidden="true" className="h-4 w-4" />} label="GitHub" value={profile?.githubUrl ? profile.githubUrl.replace(/^https?:\/\/(www\.)?/, "") : "Not added yet"} />
              <ContactRow testId="link-linkedin" href={profile?.linkedinUrl || undefined} icon={<Linkedin aria-hidden="true" className="h-4 w-4" />} label="LinkedIn" value={profile?.linkedinUrl ? profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "") : "Not added yet"} />
            </div>}
            {!profileQ.isLoading && !profileQ.isError && !hasContact && <p className="mt-5 text-sm text-muted-foreground">Contact details haven't been published yet. Check back soon.</p>}
          </section>
        </div>
      </section>
    </PublicShell>
  );
}
