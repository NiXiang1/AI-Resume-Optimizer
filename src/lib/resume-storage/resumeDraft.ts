import type { ResumeData } from "@/src/types/resume";

const sessionResumeKey = "generated-resume-json";
const activeDraftIdKey = "generated-resume-draft-id";
const latestDraftKey = "generated-resume-latest-draft";
const draftKeyPrefix = "generated-resume-draft:";

export function setSessionResumeDraft(resumeData: ResumeData, draftId?: string) {
  sessionStorage.setItem(sessionResumeKey, JSON.stringify(resumeData));

  if (draftId) {
    sessionStorage.setItem(activeDraftIdKey, draftId);
  }
}

export function getSessionResumeDraft() {
  return readResumeData(sessionStorage.getItem(sessionResumeKey));
}

export function setActiveResumeDraftId(draftId: string) {
  sessionStorage.setItem(activeDraftIdKey, draftId);
}

export function getActiveResumeDraftId() {
  return sessionStorage.getItem(activeDraftIdKey) || "";
}

export function saveResumeDraft(resumeData: ResumeData, draftId?: string) {
  const serialized = JSON.stringify(resumeData);
  localStorage.setItem(latestDraftKey, serialized);
  sessionStorage.setItem(sessionResumeKey, serialized);

  if (draftId) {
    localStorage.setItem(getDraftStorageKey(draftId), serialized);
    sessionStorage.setItem(activeDraftIdKey, draftId);
  }
}

export function getSavedResumeDraft(draftId?: string) {
  if (draftId) {
    const draft = readResumeData(localStorage.getItem(getDraftStorageKey(draftId)));

    if (draft) {
      return draft;
    }
  }

  return readResumeData(localStorage.getItem(latestDraftKey));
}

export function getResumeDraftForCurrentSession() {
  const draftId = getActiveResumeDraftId();
  return getSessionResumeDraft() || getSavedResumeDraft(draftId);
}

function getDraftStorageKey(draftId: string) {
  return `${draftKeyPrefix}${draftId}`;
}

function readResumeData(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ResumeData;
  } catch {
    return null;
  }
}
