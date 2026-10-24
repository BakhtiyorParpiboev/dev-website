import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, LogOut, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  getGetContentQueryKey,
  getGetProfileQueryKey,
  getListContentQueryKey,
  useCreateContent,
  useDeleteContent,
  useGetAdminSession,
  useGetProfile,
  useListContent,
  useUpdateContent,
  useUpdateProfile,
  useUploadImage,
} from "@workspace/api-client-react";
import type { Content, ContentInput, Profile } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/lib/seo";
import { formatDate } from "@/components/site";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const inputCls = "w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[15px] outline-none transition-shadow focus:border-[hsl(var(--green))] focus:shadow-[0_0_0_3px_hsl(var(--green)/0.12)]";

function errMsg(e: unknown) {
  const d = (e as { data?: { error?: string } })?.data;
  return d?.error || (e instanceof Error ? e.message : "Something went wrong");
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-secondary/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5">
          <Link href="/" data-testid="link-site" className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> View site</Link>
          <span className="eyebrow">Owner studio</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-5 py-12">{children}</main>
    </div>
  );
}

function Notice({ title, body, action }: { title: string; body: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-border bg-card p-10">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <div className="mt-4 text-foreground/65">{body}</div>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

const emptyInput = (kind: "project" | "blog"): ContentInput => ({ kind, title: "", slug: "", summary: "", body: "", tags: [], imageUrl: "", liveUrl: "", sourceUrl: "", published: false, featured: false });
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);

function useInvalidate() {
  const qc = useQueryClient();
  return (slugs: string[]) => {
    qc.invalidateQueries({ queryKey: getListContentQueryKey() });
    slugs.forEach((s) => qc.invalidateQueries({ queryKey: getGetContentQueryKey(s) }));
  };
}

function Editor({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: Content | { kind: "project" | "blog" } | null }) {
  const editing = initial && "id" in initial ? initial : null;
  const [form, setForm] = useState<ContentInput>(emptyInput("project"));
  const [tagText, setTagText] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const upload = useUploadImage();

  useEffect(() => {
    if (!imageFile) { setImagePreview(""); return; }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  const create = useCreateContent();
  const update = useUpdateContent();
  const invalidate = useInvalidate();
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !initial) return;
    setImageFile(null);
    setImageError("");
    if ("id" in initial) {
      const { kind, title, slug, summary, body, tags, imageUrl, liveUrl, sourceUrl, published, featured } = initial;
      setForm({ kind, title, slug, summary, body, tags, imageUrl, liveUrl, sourceUrl, published, featured });
      setTagText(tags.join(", "));
      setSlugTouched(true);
    } else {
      setForm(emptyInput(initial.kind));
      setTagText("");
      setSlugTouched(false);
    }
  }, [open, initial]);

  const set = <K extends keyof ContentInput>(k: K, v: ContentInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const pending = create.isPending || update.isPending || upload.isPending;
  const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || !form.title.trim() || !slugValid) return;
    let imageUrl = form.imageUrl;
    if (imageFile) {
      setImageError("");
      try {
        imageUrl = (await upload.mutateAsync({ data: imageFile })).url;
        set("imageUrl", imageUrl);
        setImageFile(null);
      } catch (error) {
        setImageError(errMsg(error));
        return;
      }
    }
    const data: ContentInput = { ...form, imageUrl, tags: tagText.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20) };
    const done = (c: Content) => {
      invalidate([c.slug, ...(editing ? [editing.slug] : [])]);
      toast({ title: editing ? "Saved" : "Created", description: c.published ? "Live on the site." : "Saved as draft." });
      onClose();
    };
    const fail = (err: unknown) => toast({ title: "Couldn't save", description: errMsg(err), variant: "destructive" });
    if (editing) update.mutate({ slug: editing.slug, data }, { onSuccess: done, onError: fail });
    else create.mutate({ data }, { onSuccess: done, onError: fail });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium tracking-tight">{editing ? "Edit" : "New"} {form.kind === "project" ? "project" : "post"}</DialogTitle>
          <DialogDescription>Drafts stay private until you publish.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Title"><input data-testid="input-title" required maxLength={200} className={inputCls} value={form.title} onChange={(e) => { const v = e.target.value; setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) })); }} /></Field>
            <Field label="Slug" hint={form.slug && !slugValid ? "Lowercase letters, numbers and hyphens only." : `URL: ${form.kind === "project" ? "/projects" : "/blog"}/${form.slug || "…"}`}>
              <input data-testid="input-slug" required maxLength={180} className={inputCls} value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
            </Field>
          </div>
          <Field label="Summary"><textarea data-testid="input-summary" rows={2} maxLength={1000} className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
          <Field label="Body" hint="Plain text. Blank line = new paragraph. Lines starting with ## become headings, - become lists, ``` fences become code."><textarea data-testid="input-body" rows={10} maxLength={100000} className={`${inputCls} font-mono text-[13px]`} value={form.body} onChange={(e) => set("body", e.target.value)} /></Field>
          <Field label="Tags" hint="Comma separated. The tag 'example' marks an entry as an example."><input data-testid="input-tags" className={inputCls} value={tagText} onChange={(e) => setTagText(e.target.value)} /></Field>
          <div className="space-y-3 rounded-2xl border border-border p-4">
            <Field label="Cover image" hint="Upload PNG, JPEG, or WebP, up to 5 MB. Changes apply when you save.">
              <input id="cover-image" data-testid="input-image" type="file" accept="image/png,image/jpeg,image/webp" disabled={pending} aria-invalid={!!imageError} aria-describedby={imageError ? "image-error" : undefined} className={`${inputCls} file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-sm`} onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setImageError("");
                if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setImageError("Choose a PNG, JPEG, or WebP image."); return; }
                if (file.size > 5 * 1024 * 1024) { setImageError("Choose an image no larger than 5 MB."); return; }
                setImageFile(file);
              }} />
            </Field>
            {imageError && <p id="image-error" role="alert" className="text-sm text-destructive">{imageError}</p>}
            {(imagePreview || form.imageUrl) && <div className="space-y-2">
              <img src={imagePreview || form.imageUrl} alt="Selected cover preview" width="640" height="360" className="max-h-52 w-full rounded-xl bg-secondary object-contain" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 break-all text-xs text-muted-foreground">{imageFile?.name || "Current cover image"}</p>
                <button type="button" disabled={pending} className="min-h-10 rounded-full px-3 text-sm text-muted-foreground hover:bg-secondary" onClick={() => { setImageFile(null); set("imageUrl", ""); setImageError(""); }}>Remove image</button>
              </div>
            </div>}
            {upload.isPending && <p role="status" className="text-sm text-muted-foreground">Uploading image…</p>}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Live URL" hint="Link to the running website or demo."><input data-testid="input-live" type="url" className={inputCls} value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} /></Field>
            <Field label="Source URL" hint="Link to the code repository, such as GitHub. Optional."><input data-testid="input-source" type="url" className={inputCls} value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap gap-8 rounded-2xl bg-secondary/60 p-4">
            <label className="flex items-center gap-3 text-sm"><Switch data-testid="switch-published" checked={form.published} onCheckedChange={(v) => set("published", v)} /> Published</label>
            <label className="flex items-center gap-3 text-sm"><Switch data-testid="switch-featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} /> Featured</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={pending} className="rounded-full px-5 py-2.5 text-sm hover:bg-secondary disabled:opacity-50">Cancel</button>
            <button type="submit" data-testid="button-save" disabled={pending || !slugValid} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50">{upload.isPending ? "Uploading…" : pending ? "Saving…" : editing ? "Save changes" : "Create"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContentManager() {
  const [kind, setKind] = useState<"project" | "blog">("project");
  const q = useListContent({ kind, admin: true });
  const [editor, setEditor] = useState<Content | { kind: "project" | "blog" } | null>(null);
  const [toDelete, setToDelete] = useState<Content | null>(null);
  const del = useDeleteContent();
  const update = useUpdateContent();
  const invalidate = useInvalidate();
  const { toast } = useToast();

  const togglePublish = (c: Content) => {
    const { kind: k, title, slug, summary, body, tags, imageUrl, liveUrl, sourceUrl, featured } = c;
    update.mutate({ slug, data: { kind: k, title, slug, summary, body, tags, imageUrl, liveUrl, sourceUrl, featured, published: !c.published } }, {
      onSuccess: () => { invalidate([slug]); toast({ title: c.published ? "Moved to drafts" : "Published" }); },
      onError: (e) => toast({ title: "Couldn't update", description: errMsg(e), variant: "destructive" }),
    });
  };

  return (
    <section aria-labelledby="content-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="content-title" className="text-2xl font-medium tracking-tight">Content</h2>
          <div className="mt-4 inline-flex rounded-full bg-secondary p-1">
            {(["project", "blog"] as const).map((k) => (
              <button key={k} type="button" data-testid={`tab-${k}`} onClick={() => setKind(k)} className={`rounded-full px-4 py-1.5 text-sm transition-colors ${kind === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{k === "project" ? "Projects" : "Blog posts"}</button>
            ))}
          </div>
        </div>
        <button type="button" data-testid="button-new" onClick={() => setEditor({ kind })} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"><Plus className="h-4 w-4" /> New {kind === "project" ? "project" : "post"}</button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        {q.isLoading ? (
          <div className="space-y-4 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : q.isError ? (
          <p className="p-8 text-foreground/60">Couldn't load content. <button type="button" onClick={() => q.refetch()} className="link-underline text-foreground">Retry</button></p>
        ) : (q.data ?? []).length === 0 ? (
          <div className="p-14 text-center"><p className="text-lg font-medium">No {kind === "project" ? "projects" : "posts"} yet.</p><p className="mt-1 text-sm text-muted-foreground">Create your first one — it starts as a draft.</p></div>
        ) : (
          <ul className="divide-y divide-border">
            {(q.data ?? []).map((c) => (
              <li key={c.id} data-testid={`row-content-${c.slug}`} className="group flex flex-col gap-3 p-5 transition-colors hover:bg-secondary/40 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{c.title}</span>
                    {c.featured && <Star className="h-3.5 w-3.5 fill-[hsl(var(--green))] text-[hsl(var(--green))]" aria-label="Featured" />}
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${c.published ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{c.published ? "Published" : "Draft"}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">/{c.slug} · updated {formatDate(c.updatedAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" data-testid={`button-toggle-${c.slug}`} onClick={() => togglePublish(c)} disabled={update.isPending} className="rounded-full px-3 py-1.5 text-xs hover:bg-secondary">{c.published ? "Unpublish" : "Publish"}</button>
                  {c.published && <Link href={`${c.kind === "project" ? "/projects" : "/blog"}/${c.slug}`} aria-label="View" className="rounded-full p-2 hover:bg-secondary"><Eye className="h-4 w-4" /></Link>}
                  <button type="button" aria-label="Edit" data-testid={`button-edit-${c.slug}`} onClick={() => setEditor(c)} className="rounded-full p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                  <button type="button" aria-label="Delete" data-testid={`button-delete-${c.slug}`} onClick={() => setToDelete(c)} className="rounded-full p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Editor open={!!editor} initial={editor} onClose={() => setEditor(null)} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes it from the site. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="button-confirm-delete" className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
              if (!toDelete) return;
              const slug = toDelete.slug;
              del.mutate({ slug }, {
                onSuccess: () => { invalidate([slug]); toast({ title: "Deleted" }); },
                onError: (e) => toast({ title: "Couldn't delete", description: errMsg(e), variant: "destructive" }),
              });
              setToDelete(null);
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

const PROFILE_FIELDS: { key: keyof Profile; label: string; multi?: number; max: number; type?: string; hint?: string }[] = [
  { key: "fullName", label: "Full name", max: 120 },
  { key: "headline", label: "Headline", max: 120, hint: "Shown huge in the hero." },
  { key: "intro", label: "Intro", multi: 3, max: 1000 },
  { key: "about", label: "About", multi: 7, max: 10000, hint: "Blank line separates paragraphs." },
  { key: "focusTitle", label: "Current focus — title", max: 200 },
  { key: "focusDescription", label: "Current focus — description", multi: 4, max: 3000 },
  { key: "email", label: "Contact email", max: 254, type: "email" },
  { key: "githubUrl", label: "GitHub URL", max: 2000, type: "url" },
  { key: "linkedinUrl", label: "LinkedIn URL", max: 2000, type: "url" },
  { key: "resumeUrl", label: "Resume URL", max: 2000, type: "url", hint: "Link to a hosted PDF. Leave blank to show 'not added yet'." },
  { key: "portfolioUrl", label: "Portfolio document URL", max: 2000, type: "url" },
];

function ProfileEditor() {
  const q = useGetProfile();
  const save = useUpdateProfile();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Profile | null>(null);

  useEffect(() => { if (q.data && !form) setForm(q.data); }, [q.data, form]);

  if (q.isLoading || !form) return <div className="space-y-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <section aria-labelledby="profile-title">
      <h2 id="profile-title" className="text-2xl font-medium tracking-tight">Profile</h2>
      <form className="mt-6 grid gap-5 rounded-3xl border border-border bg-card p-6 md:grid-cols-2 md:p-8" onSubmit={(e) => {
        e.preventDefault();
        save.mutate({ data: form }, {
          onSuccess: (p) => { qc.setQueryData(getGetProfileQueryKey(), p); qc.invalidateQueries({ queryKey: getGetProfileQueryKey() }); setForm(p); toast({ title: "Profile saved" }); },
          onError: (err) => toast({ title: "Couldn't save profile", description: errMsg(err), variant: "destructive" }),
        });
      }}>
        {PROFILE_FIELDS.map((f) => (
          <div key={f.key} className={f.multi ? "md:col-span-2" : ""}>
            <Field label={f.label} hint={f.hint}>
              {f.multi ? (
                <textarea data-testid={`input-${f.key}`} rows={f.multi} maxLength={f.max} className={inputCls} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <input data-testid={`input-${f.key}`} type={f.type ?? "text"} required={f.key === "fullName" || f.key === "headline"} maxLength={f.max} className={inputCls} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </Field>
          </div>
        ))}
        <div className="flex justify-end md:col-span-2">
          <button type="submit" data-testid="button-save-profile" disabled={save.isPending} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-50">{save.isPending ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
    </section>
  );
}

export default function Admin() {
  useSeo({ title: "Owner studio", description: "Private content management.", noindex: true });
  const session = useGetAdminSession();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [tab, setTab] = useState<"content" | "profile">("content");
  const s = session.data;

  const signOutBtn = <button type="button" data-testid="button-sign-out" onClick={() => signOut({ redirectUrl: basePath || "/" })} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"><LogOut className="h-4 w-4" /> Sign out</button>;

  if (session.isLoading) return <Shell><Skeleton className="mx-auto mt-16 h-64 max-w-lg rounded-3xl" /></Shell>;
  if (session.isError || !s) return <Shell><Notice title="Couldn't check access" body="The session check failed." action={<button type="button" onClick={() => session.refetch()} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Try again</button>} /></Shell>;

  if (!s.ownerConfigured) return <Shell><Notice title="Owner not configured" body={<><p>Editing is locked because no owner email is configured on the server.</p><p className="mt-3">Set the <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm">ADMIN_EMAIL</code> environment variable to the owner's verified email, then sign in with that account. Access can't be granted from the browser.</p></>} action={s.signedIn ? signOutBtn : undefined} /></Shell>;

  if (!s.signedIn) return <Shell><Notice title="Owner sign-in" body="This area is for the site owner. Everything else on the site is public." action={<Link href="/sign-in" data-testid="link-sign-in" className="inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background">Sign in</Link>} /></Shell>;

  if (!s.isAdmin) return <Shell><Notice title="Not the owner account" body={<>You're signed in{user?.primaryEmailAddress ? ` as ${user.primaryEmailAddress.emailAddress}` : ""}, but this account isn't the configured owner. Sign in with the owner's verified email.</>} action={signOutBtn} /></Shell>;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Signed in{user?.primaryEmailAddress ? ` · ${user.primaryEmailAddress.emailAddress}` : ""}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.03em] md:text-5xl">Owner studio<span className="text-[hsl(var(--green))]">.</span></h1>
        </div>
        {signOutBtn}
      </div>
      <nav aria-label="Studio" className="mt-10 flex gap-6 border-b border-border">
        {(["content", "profile"] as const).map((t) => (
          <button key={t} type="button" data-testid={`tab-studio-${t}`} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 text-sm capitalize transition-colors ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </nav>
      <div className="mt-10">{tab === "content" ? <ContentManager /> : <ProfileEditor />}</div>
    </Shell>
  );
}
