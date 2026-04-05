// Extended types for new backend features that may be added
// These types represent the new API that the backend will expose

import type { Time } from "../backend";

export interface News {
  id: string;
  title: string;
  content: string;
  imageId: [] | [string];
  isBreaking: boolean;
  createdAt: Time;
}

export interface NewsInput {
  title: string;
  content: string;
  imageId: [] | [string];
  isBreaking: boolean;
}

// Extended Notice type with optional imageId
export interface NoticeWithImage {
  title: string;
  content: string;
  isImportant: boolean;
  imageId?: [] | [string];
  createdAt: Time;
}

export interface NoticeInputWithImage {
  title: string;
  content: string;
  isImportant: boolean;
  imageId: [] | [string];
}
