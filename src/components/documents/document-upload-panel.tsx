"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { formatBytes } from "@/lib/format";

type UploadedDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: "ready" | "processing" | "failed";
  textPreview: string;
  pageCount: number | null;
  error: string | null;
  createdAt: string;
};

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export function DocumentUploadPanel() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/documents", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = (await response.json()) as { documents: UploadedDocument[] };
      setDocuments(payload.documents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDocuments();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const payload = (await response.json()) as { document: UploadedDocument };
      setDocuments((current) => [payload.document, ...current]);
      setSelectedFile(null);
      event.currentTarget.reset();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload document.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6">
        <p className="text-sm font-medium text-sky-300">Document upload</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Prepare files for AI Q&A</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Upload PDF, TXT, or Markdown files. Files are stored outside the public directory and extracted text is saved for future retrieval workflows.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.04] p-6 text-center transition hover:border-sky-300/60 hover:bg-white/[0.07]">
            <span className="text-lg font-semibold text-white">Choose a document</span>
            <span className="mt-2 text-sm text-slate-400">PDF, TXT, or Markdown up to 10MB</span>
            <input
              type="file"
              name="file"
              accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>

          {selectedFile ? (
            <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
              Selected: <span className="font-medium text-white">{selectedFile.name}</span> · {formatBytes(selectedFile.size)}
            </div>
          ) : null}

          {error ? (
            <Alert variant="error">{error}</Alert>
          ) : null}

          <Button type="submit" disabled={!selectedFile || isUploading} className="w-full">
            {isUploading ? "Uploading and extracting..." : "Upload document"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h3 className="text-xl font-semibold text-white">Uploaded documents</h3>
          <p className="mt-1 text-sm text-slate-400">Extracted previews are ready for future AI chat and document Q&A.</p>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-slate-400">Loading documents...</div>
        ) : null}

        {!isLoading && documents.length === 0 ? (
          <EmptyState title="No documents uploaded yet" description="Upload a PDF, TXT, or Markdown file to prepare it for future document Q&A." />
        ) : null}

        <div className="divide-y divide-white/10">
          {documents.map((document) => (
            <article key={document.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-semibold text-white">{document.originalName}</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(document.sizeBytes)} · {document.mimeType}
                    {document.pageCount ? ` · ${document.pageCount} pages` : ""}
                  </p>
                </div>
                <StatusPill className="bg-emerald-400/10 text-emerald-300">{document.status}</StatusPill>
              </div>
              {document.textPreview ? (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{document.textPreview}</p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No text preview available.</p>
              )}
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
