export type ResumeData = {
  basicInfo?: BasicInfo;
  education?: EducationItem[];
  awards?: AwardItem[] | string[];
  projects?: ProjectItem[];
  internshipExperience?: WorkExperienceItem[];
  workExperience?: WorkExperienceItem[];
  campusExperience?: CampusExperienceItem[];
  skills?: SkillData;
  advantages?: string[];
  certificates?: CertificateItem[] | string[];
  volunteerExperience?: VolunteerExperienceItem[];
  selfEvaluation?: string[] | string;
  customSections?: CustomSection[];
  hiddenSections?: string[];
};

export type BasicInfo = {
  name?: string;
  role?: string;
  jobIntention?: string;
  phone?: string;
  email?: string;
  city?: string;
  location?: string;
  birthDate?: string;
  gender?: string;
  ethnicity?: string;
  github?: string;
  website?: string;
  avatar?: string;
  avatarUrl?: string;
  originalImage?: string;
  contacts?: {
    phone?: string;
    email?: string;
    location?: string;
    city?: string;
    github?: string;
    website?: string;
  };
  [key: string]: unknown;
};

export type EducationItem = {
  school?: string;
  major?: string;
  degree?: string;
  dateRange?: string;
  time?: string;
  gpa?: string;
  ranking?: string;
  courses?: string[];
  relatedCourses?: string[];
  description?: string[] | string;
  [key: string]: unknown;
};

export type SkillData = string[] | SkillCategory[] | Record<string, string[] | string>;

export type SkillCategory = {
  category?: string;
  name?: string;
  items?: string[];
  skills?: string[];
};

export type ProjectItem = {
  name?: string;
  dateRange?: string;
  time?: string;
  summary?: string;
  description?: string[] | string;
  techStack?: string[];
  responsibilities?: string[] | string;
  coreFeatures?: string[] | string;
  results?: string[] | string;
  link?: string;
  [key: string]: unknown;
};

export type WorkExperienceItem = {
  company?: string;
  role?: string;
  position?: string;
  dateRange?: string;
  time?: string;
  description?: string[] | string;
  responsibilities?: string[] | string;
  contributions?: string[] | string;
  results?: string[] | string;
  [key: string]: unknown;
};

export type CampusExperienceItem = {
  organization?: string;
  role?: string;
  dateRange?: string;
  time?: string;
  description?: string[] | string;
  results?: string[] | string;
  [key: string]: unknown;
};

export type AwardItem = {
  name?: string;
  date?: string;
  level?: string;
  description?: string;
};

export type CertificateItem = {
  name?: string;
  date?: string;
  description?: string;
};

export type VolunteerExperienceItem = {
  name?: string;
  dateRange?: string;
  time?: string;
  description?: string[] | string;
  hours?: string;
};

export type CustomSection = {
  title: string;
  items?: string[];
  content?: string;
};
