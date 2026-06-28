import A4PreviewFrame from "@/src/components/resume-templates/A4PreviewFrame";
import Template3 from "@/src/components/resume-templates/Template3";
import { sampleResume } from "@/src/data/sampleResume";

export default function Template3PreviewPage() {
  return (
    <main className="template3-preview-shell">
      <A4PreviewFrame>
        <Template3 resumeData={sampleResume} />
      </A4PreviewFrame>
    </main>
  );
}
