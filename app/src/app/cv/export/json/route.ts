import { generateCVJSON } from "@patorsiang/cv-engine";
import { buildCvExportFilename, parseCvSelection } from "@/lib/cv-routes";

export function GET(request: Request): Response {
  const selection = parseCvSelection(new URL(request.url).searchParams);

  if (!selection) {
    return new Response("Unsupported CV role or language.", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  return new Response(generateCVJSON(selection.role, selection.lang, { pretty: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildCvExportFilename(
        selection.role,
        selection.lang,
        "json",
      )}"`,
    },
  });
}
