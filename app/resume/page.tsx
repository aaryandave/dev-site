import { Navigation } from "../components/nav";

export default function ResumePage() {
    return (
      <div className="relative pb-16">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <iframe
            src="/resume/AaryanDave-Resume.pdf"
            width="75%"
            height="800"
            className="border border-zinc-700 rounded-lg bg-white"
            title="Resume"
          >
            Your browser does not support PDFs. Please download the PDF to view it:
            <a href="/resume/AaryanDave-Resume.pdf" download>Download PDF</a>.
          </iframe>
          <p className="mt-4 text-zinc-400">
            If the embedded PDF is not visible, you can{" "}
            <a
              href="/resume/AaryanDave-Resume.pdf"
              download
              className="text-zinc-100 hover:underline"
            >
              download it here
            </a>
            .
          </p>
        </div>
      </div>
    );
  }