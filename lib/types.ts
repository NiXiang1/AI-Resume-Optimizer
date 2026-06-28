export type ResumeAnalysis = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  jd_keywords: {
    technical: string[];
    experience: string[];
    soft_skills: string[];
    bonus: string[];
  };
  jd_match: {
    level: string;
    matched_keywords: string[];
    gap_description: string;
  };
  suggestions: {
    education: string[];
    projects: string[];
    skills: string[];
    experience: string[];
    summary: string[];
  };
  rewrite_comparison: {
    section: string;
    original: string;
    optimized: string;
    improvement: string;
  }[];
  optimized_resume: string;
};

export type AnalyzeResumeRequest = {
  resumeText: string;
  jobDescription: string;
  aiMode?: "auto" | "mock" | "real";
};
