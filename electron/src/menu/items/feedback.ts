import { MenuItemConstructorOptions } from "electron";
import { feedbackCopy } from "../../helpers/feedbackCopy";
import { openFeedbackWindow } from "../../helpers/feedbackUi";

export function reportBugMenuItem(): MenuItemConstructorOptions {
  return {
    label: feedbackCopy["feedback.bug"],
    click: (): void => openFeedbackWindow("bug"),
  };
}

export function requestFeatureMenuItem(): MenuItemConstructorOptions {
  return {
    label: feedbackCopy["feedback.feature"],
    click: (): void => openFeedbackWindow("feature"),
  };
}
