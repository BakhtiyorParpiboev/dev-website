export type ProjectSlide = { src: string; title: string };
export type ProjectGallery = { note: string; slides: ProjectSlide[] };

// Public walkthrough assets supplied by the project owner.
export const projectGalleries: Record<string, ProjectGallery> = {
  "ai-web-builder": {
    "note": "Annotated screenshots of the existing application. Controls shown are not proof that every action was verified; payments are in test mode.",
    "slides": [
      {
        "src": "images/projects/ai-web-builder/01-prompt-to-website.webp",
        "title": "Prompt to website"
      },
      {
        "src": "images/projects/ai-web-builder/02-project-library.webp",
        "title": "Project library"
      },
      {
        "src": "images/projects/ai-web-builder/03-ai-revision-workspace.webp",
        "title": "AI revision workspace"
      },
      {
        "src": "images/projects/ai-web-builder/04-visual-style-editor.webp",
        "title": "Visual element editor"
      },
      {
        "src": "images/projects/ai-web-builder/05-responsive-device-preview.webp",
        "title": "Responsive device previews"
      },
      {
        "src": "images/projects/ai-web-builder/06-version-history.webp",
        "title": "Version history"
      },
      {
        "src": "images/projects/ai-web-builder/07-published-website.webp",
        "title": "Published website output"
      },
      {
        "src": "images/projects/ai-web-builder/08-community-gallery.webp",
        "title": "Community gallery"
      },
      {
        "src": "images/projects/ai-web-builder/09-credits-pricing.webp",
        "title": "Credits and pricing"
      },
      {
        "src": "images/projects/ai-web-builder/10-account-settings.webp",
        "title": "Account settings"
      }
    ]
  },
  "friendly": {
    "note": "Annotated screenshots with QA sample data. AI replies require funded API credits; timetable AI and Calendar import limitations are marked in the images.",
    "slides": [
      {
        "src": "images/projects/friendly/01-plan-your-week.webp",
        "title": "Plan your week"
      },
      {
        "src": "images/projects/friendly/02-add-any-schedule-item.webp",
        "title": "Add schedule items"
      },
      {
        "src": "images/projects/friendly/03-ai-timetable-import.webp",
        "title": "Import a timetable image"
      },
      {
        "src": "images/projects/friendly/04-ai-study-assistant.webp",
        "title": "AI study assistant"
      },
      {
        "src": "images/projects/friendly/05-class-files.webp",
        "title": "Class files"
      },
      {
        "src": "images/projects/friendly/06-class-notes.webp",
        "title": "Class notes"
      },
      {
        "src": "images/projects/friendly/07-lecture-audio.webp",
        "title": "Lecture audio"
      },
      {
        "src": "images/projects/friendly/08-assignment-progress.webp",
        "title": "Assignment progress"
      },
      {
        "src": "images/projects/friendly/09-community.webp",
        "title": "Community"
      },
      {
        "src": "images/projects/friendly/10-account-and-guidance.webp",
        "title": "Account and guidance"
      }
    ]
  }
};
