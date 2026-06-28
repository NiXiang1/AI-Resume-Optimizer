import A4PreviewFrame from "@/src/components/resume-templates/A4PreviewFrame";
import Template1 from "@/src/components/resume-templates/Template1";
import { sampleResume } from "@/src/data/sampleResume";

export default function Template1PreviewPage() {
  return (
    <main className="template1-preview-shell">
      <A4PreviewFrame>
        <Template1 data={sampleResume} />
      </A4PreviewFrame>
    </main>
  );
}
