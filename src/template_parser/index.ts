export type TemplateParserInput = {
  file: File;
  fileType: "pdf" | "docx" | "image";
};

export type ParsedTemplateSchema = {
  layout: "single-column" | "two-column" | "unknown";
  colors: string[];
  sections: string[];
};

export async function parseTemplateVisualSchema(_input: TemplateParserInput): Promise<ParsedTemplateSchema> {
  throw new Error("template_parser is reserved for future visual-model template parsing.");
}
