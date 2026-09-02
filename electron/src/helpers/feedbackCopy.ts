import { catalogEs } from "./catalogEs.ts";
import { localizedCatalog } from "./i18n.ts";

const feedbackCopyEn = {
  "feedback.bug": "Report a bug",
  "feedback.feature": "Request a feature",
  "feedback.description": "Description",
  "feedback.preview": "Preview",
  "feedback.copy": "Copy",
  "feedback.open_github": "Open GitHub",
  "feedback.discard": "Discard",
  "feedback.github.need_text": "Add a description or stack before opening GitHub.",
  "feedback.github.offline": "GitHub cannot open while offline. Copy still works.",
  "feedback.title.bug": "[bug] Desktop report",
  "feedback.title.feature": "[enhancement] Desktop request",
};

export const feedbackCopy = localizedCatalog(feedbackCopyEn, catalogEs);

export type FeedbackKind = "bug" | "feature";
