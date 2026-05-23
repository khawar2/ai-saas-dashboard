import { DocumentUploadPanel } from "@/components/documents/document-upload-panel";

export default function DocumentsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium text-sky-300">Documents</p>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">Knowledge uploads</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Upload documents, extract their text, and prepare them for future AI chat grounding and document-based Q&A.
        </p>
      </div>
      <DocumentUploadPanel />
    </section>
  );
}
