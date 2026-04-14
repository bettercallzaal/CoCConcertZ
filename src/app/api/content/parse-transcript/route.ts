import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(request: NextRequest) {
  const role = request.cookies.get("coc-role")?.value;
  if (role !== "admin" && role !== "artist") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const segments: {
      filename: string;
      segmentId: string;
      segmentLabel: string;
      text: string;
    }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let text: string;
      if (file.name.endsWith(".docx")) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        text = buffer.toString("utf-8");
      }

      // Auto-detect segment from filename
      // Pattern: cocconcertz4-seg1-intro.docx → segmentId: "seg1", label: "Intro"
      const nameMatch = file.name.match(/seg(\d+)-([a-z0-9-]+)/i);
      let segmentId = file.name;
      let segmentLabel = file.name;

      if (nameMatch) {
        const num = nameMatch[1];
        const slug = nameMatch[2];
        segmentId = `seg${num}`;

        // Map common slugs to labels
        const labelMap: Record<string, string> = {
          intro: "Intro",
          outro: "Outro",
          jose: "Joseph Goats",
          "joseph-goats": "Joseph Goats",
          fellenz: "Tom Fellenz",
          "tom-fellenz": "Tom Fellenz",
          stilo: "Stilo World",
          stilo1: "Stilo World",
          "stilo-world": "Stilo World",
        };

        segmentLabel = labelMap[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
      }

      segments.push({ filename: file.name, segmentId, segmentLabel, text: text.trim() });
    }

    // Sort by segment number
    segments.sort((a, b) => {
      const numA = parseInt(a.segmentId.replace(/\D/g, "") || "0");
      const numB = parseInt(b.segmentId.replace(/\D/g, "") || "0");
      return numA - numB;
    });

    return NextResponse.json({ segments });
  } catch (err) {
    console.error("Parse transcript error:", err);
    return NextResponse.json({ error: "Failed to parse transcripts" }, { status: 500 });
  }
}
