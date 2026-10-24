import { db, profileTable, contentTable } from "@workspace/db";

export async function seedPortfolio() {
  // Inserting the singleton is the seed marker. Deleted examples stay deleted.
  await db.transaction(async tx => {
    const created = await tx.insert(profileTable).values({
      id: 1,
      data: {
        fullName: "Parpiboev Bakhtiyor",
        headline: "Driven by curiosity. Powered by code. Inspired by possibility.",
        intro: "I build thoughtful full-stack applications and bring ideas to life with AI. From the first interaction to the last API call.",
        about: "I'm Bakhtiyor, a software engineer who enjoys turning complex problems into clear, useful experiences. I build across the stack, connecting intuitive interfaces with dependable backends and thoughtful AI integrations.\n\nI care about the details: readable code, responsive design, and software that makes someone's day a little easier.",
        focusTitle: "Exploring what's next with AI.",
        focusDescription: "Building full-stack applications and exploring practical ways to integrate AI into everyday software.",
        email: "", githubUrl: "", linkedinUrl: "", resumeUrl: "", portfolioUrl: "",
      },
    }).onConflictDoNothing().returning();
    if (!created.length) return;
    await tx.insert(contentTable).values([
      {
        kind: "project", title: "AI workspace", slug: "example-ai-workspace",
        summary: "Example project — a focused workspace for AI-assisted research, notes, and ideas.",
        body: "This is an example portfolio entry, not a claim of completed work.\n\nReplace it with one of your projects from the owner dashboard. Describe the problem, your role, the technical decisions, and the outcome. Add live and source links when ready.",
        tags: ["Example", "Full-stack", "AI"], published: true, featured: true,
      },
      {
        kind: "project", title: "Commerce, considered", slug: "example-commerce",
        summary: "Example project — a thoughtful shopping experience from discovery to checkout.",
        body: "This is an example project for previewing the portfolio layout.\n\nUse the owner dashboard to add your own overview, screenshots, technology stack, and links, or delete this entry.",
        tags: ["Example", "React", "Web development"], published: true, featured: true,
      },
      {
        kind: "project", title: "A clearer dashboard", slug: "example-dashboard",
        summary: "Example project — turning complex information into a clear, useful interface.",
        body: "This is a sample portfolio entry.\n\nReplace this text with your actual project story: what you built, why it matters, and what you learned.",
        tags: ["Example", "TypeScript", "UI engineering"], published: true, featured: false,
      },
      {
        kind: "blog", title: "Building with intention", slug: "example-building-with-intention",
        summary: "Example article — a starting point for notes on software, craft, and the decisions behind the code.",
        body: "This is an example article, ready to be replaced with your own writing.\n\nGood software starts with understanding the problem. Before choosing a framework or writing a component, ask what the person using it needs to accomplish.\n\nKeep the first version focused. Make the important interaction work well, test the assumptions, and improve from there.",
        tags: ["Example", "Engineering"], published: true, featured: true,
      },
      {
        kind: "blog", title: "Making AI useful, not just visible", slug: "example-practical-ai",
        summary: "Example article — thinking about where AI genuinely helps in a full-stack application.",
        body: "This is an example article for the initial website preview.\n\nStart with a task, not a model. A useful AI integration should reduce work while giving people a way to check the result.\n\nConsider latency, privacy, error handling, and a clear fallback before adding AI to a core workflow. The interface should communicate what is happening without overstating certainty.",
        tags: ["Example", "AI"], published: true, featured: false,
      },
    ]);
  });
}
