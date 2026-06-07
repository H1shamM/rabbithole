import { useState } from "react";
import type { FormEvent } from "react";

/**
 * Props for the SubmissionForm component.
 */
interface Props {
  onSuccess: () => void;
  authenticatedFetch: (url: string, options: RequestInit) => Promise<Response>;
}

/**
 * Component to submit a new URL.
 */
export function SubmissionForm({ onSuccess, authenticatedFetch }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authenticatedFetch("http://localhost:3000/api/v1/submissions", {
        method: "POST",
        body: JSON.stringify({ url, title }),
      });
      setUrl("");
      setTitle("");
      onSuccess();
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="submission-form">
      <h3>Submit a Link</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
