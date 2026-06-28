import A4PreviewFrame from "@/src/components/resume-templates/A4PreviewFrame";
import Template2 from "@/src/components/resume-templates/Template2";
import { sampleResume } from "@/src/data/sampleResume";

export default function Template2PreviewPage() {
  return (
    <main className="template2-preview-shell">
      <A4PreviewFrame>
        <Template2 resumeData={sampleResume} />
      </A4PreviewFrame>
    </main>
  );
}
