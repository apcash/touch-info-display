const allowedOrigins = [
  "https://apcash.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// References selected and adapted from OpenBible.info Topical Bible:
// https://www.openbible.info/topics/trust_in_god
// https://www.openbible.info/topics/peace
// https://www.openbible.info/topics/hope
// https://www.openbible.info/topics/gratitude
// Changes: filtered for length, removed overlapping references, combined four topics.
// Source attribution and license information: https://www.openbible.info/topics/
// References only. Scripture text is fetched separately through the ESV API.

const verseReferences = [
  "Proverbs 3:5-6",
  "Psalm 28:7",
  "Romans 15:13",
  "Hebrews 11:6",
  "Psalm 9:10",
  "Psalm 56:3-4",
  "Psalm 112:7",
  "Psalm 46:10",
  "Psalm 118:8",
  "Psalm 32:10",
  "Mark 5:36",
  "Jeremiah 29:11",
  "Jeremiah 17:7",
  "Proverbs 29:25",
  "Joshua 1:9",
  "Isaiah 26:3-4",
  "Romans 8:28",
  "Isaiah 41:10",
  "John 14:1",
  "Hebrews 13:8",
  "Psalm 37:3",
  "Exodus 14:14",
  "Psalm 62:8",
  "Psalm 20:7",
  "2 Corinthians 5:7",
  "Nahum 1:7",
  "Psalm 4:5",
  "Isaiah 12:2",
  "Proverbs 16:20",
  "Psalm 143:8",
  "Philippians 4:19",
  "Hebrews 13:6",
  "Matthew 6:25",
  "James 1:6",
  "Proverbs 16:3",
  "Philippians 4:6-7",
  "1 John 5:14",
  "Isaiah 43:2",
  "Psalm 145:18",
  "Psalm 121:3",
  "Psalm 37:4-6",
  "Isaiah 40:31",
  "Hebrews 11:1",
  "Proverbs 28:26",
  "Romans 12:19",
  "Matthew 6:26",
  "1 John 4:16",
  "Psalm 62:7",
  "Psalm 31:14",
  "Psalm 13:5",
  "Hebrews 13:5",
  "John 10:10",
  "Job 13:15",
  "2 Timothy 3:16-17",
  "Proverbs 30:5",
  "Psalm 91:1-2",
  "Mark 9:24",
  "Genesis 28:15",
  "John 14:27",
  "Psalm 46:1",
  "1 Peter 5:6-7",
  "Psalm 31:19",
  "Psalm 27:14",
  "Psalm 40:4",
  "Exodus 33:14",
  "Malachi 3:6",
  "Luke 1:37",
  "Romans 5:8",
  "Psalm 84:12",
  "Psalm 18:30",
  "John 3:35",
  "Psalm 125:1",
  "John 14:26",
  "John 14:15",
  "Psalm 144:1",
  "Philippians 4:12-13",
  "Psalm 146:3",
  "Psalm 73:25",
  "1 John 4:1",
  "2 Timothy 2:15",
  "Numbers 23:19",
  "Jeremiah 17:5",
  "John 16:33",
  "2 Thessalonians 3:16",
  "Matthew 5:9",
  "Psalm 4:8",
  "Colossians 3:15",
  "Romans 12:18",
  "Hebrews 12:14",
  "Romans 8:6",
  "Psalm 119:165",
  "James 3:18",
  "Psalm 29:11",
  "Romans 5:1-2",
  "Psalm 34:14",
  "Proverbs 16:7",
  "Proverbs 12:20",
  "Isaiah 54:10",
  "Philippians 4:9",
  "2 Corinthians 13:11",
  "James 3:17",
  "Isaiah 9:6",
  "Numbers 6:24-26",
  "Romans 14:19",
  "Jude 1:2",
  "Isaiah 52:7",
  "Romans 16:20",
  "Psalm 85:8",
  "Luke 2:14",
  "Isaiah 55:12",
  "1 Peter 3:10-11",
  "Isaiah 53:5",
  "Hebrews 12:11",
  "Isaiah 32:17",
  "1 Thessalonians 5:23",
  "Matthew 11:28-30",
  "Romans 14:17",
  "Proverbs 20:3",
  "Proverbs 16:32",
  "Colossians 3:13",
  "Psalm 37:37",
  "Isaiah 26:12",
  "1 Thessalonians 5:15",
  "Leviticus 26:6",
  "Romans 15:33",
  "Isaiah 54:13",
  "Job 22:21",
  "Romans 12:17",
  "Proverbs 3:1-2",
  "2 Timothy 2:22",
  "Romans 1:7",
  "Acts 9:31",
  "Jeremiah 33:6",
  "John 20:19",
  "Mark 9:50",
  "2 Timothy 1:7",
  "Proverbs 17:1",
  "Isaiah 32:18",
  "Isaiah 48:22",
  "Psalm 85:10",
  "John 3:16",
  "Matthew 10:34",
  "Isaiah 57:21",
  "Romans 8:2",
  "Colossians 3:1-2",
  "Romans 12:12",
  "Romans 15:4",
  "Colossians 1:27",
  "Romans 5:5",
  "Romans 8:24-25",
  "1 Corinthians 13:13",
  "Deuteronomy 31:6",
  "Proverbs 23:18",
  "Hebrews 10:23",
  "Proverbs 24:14",
  "Psalm 119:114",
  "Revelation 21:4",
  "Psalm 39:7",
  "Proverbs 13:12",
  "Psalm 31:24",
  "Lamentations 3:24",
  "1 Peter 3:15",
  "Psalm 130:5",
  "Psalm 33:22",
  "Psalm 42:11",
  "Zephaniah 3:17",
  "Psalm 147:11",
  "Psalm 71:5",
  "Mark 9:23",
  "Psalm 71:14",
  "1 Peter 1:13",
  "1 Thessalonians 5:8",
  "Micah 7:7",
  "1 Peter 5:10",
  "Galatians 5:5",
  "Psalm 25:5",
  "Philippians 3:13-14",
  "Psalm 9:18",
  "Philippians 1:6",
  "1 John 3:3",
  "Romans 8:18",
  "Job 11:18",
  "Hebrews 3:6",
  "1 Timothy 6:17",
  "2 Corinthians 4:17-18",
  "Psalm 130:7",
  "Matthew 25:21",
  "Psalm 62:5",
  "Galatians 6:8",
  "1 Corinthians 15:19",
  "Psalm 146:5",
  "Psalm 121:7-8",
  "Isaiah 61:1",
  "1 Thessalonians 4:13",
  "Psalm 16:9",
  "Psalm 119:81",
  "Psalm 31:2",
  "Proverbs 13:2",
  "Psalm 43:5",
  "Psalm 25:2",
  "Joel 3:16",
  "1 Thessalonians 5:16-18",
  "Psalm 118:24",
  "Colossians 3:17",
  "Psalm 136:1-3",
  "James 1:17",
  "Psalm 107:1",
  "Psalm 50:23",
  "Acts 24:3",
  "Matthew 6:21",
  "1 Corinthians 15:10",
  "Colossians 3:16",
  "Hebrews 13:15",
  "2 Corinthians 2:14",
  "Psalm 118:28-29",
  "Colossians 4:2",
  "1 Chronicles 16:34",
  "John 11:41",
  "Psalm 92:1",
  "Psalm 105:1",
  "Colossians 2:6-7",
  "1 Corinthians 15:57",
  "Psalm 9:1",
  "Psalm 100:4",
  "Psalm 7:17",
  "Psalm 106:1",
  "2 Corinthians 9:11-12",
  "2 Thessalonians 1:3",
  "Psalm 69:30",
  "Jonah 2:9",
  "Psalm 50:14",
  "James 1:2-4",
  "2 Corinthians 9:15",
  "Psalm 103:1-2",
  "1 Chronicles 16:8",
  "Romans 1:21",
  "Ruth 2:12",
  "1 Timothy 4:4-5",
  "1 Corinthians 1:4",
  "John 15:13",
  "Revelation 11:17",
  "Ruth 1:8",
  "Revelation 5:13",
  "Psalm 95:1-3",
  "Romans 11:36",
  "Ephesians 1:15-16",
  "2 Samuel 2:6",
  "Matthew 11:25",
  "1 Kings 8:66",
  "2 Corinthians 4:15-16",
  "Luke 19:26-27",
  "Psalm 25:6",
  "Luke 22:19",
  "Ecclesiastes 6:9",
];

function createVerseOrder(references: string[]) {
  const shuffled = [...references];
  let seed = 20261019;

  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;

    const j = Math.floor((seed / 4294967296) * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

const orderedReferences = createVerseOrder(verseReferences);

Deno.serve(async (request) => {

  const origin = request.headers.get("Origin") ?? "";

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };

  if (allowedOrigins.includes(origin)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const apiKey = Deno.env.get("ESV_API_KEY");

  if (!apiKey) {
    return Response.json(
      { error: "ESV API key is not configured." },
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const dateParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());

    const getPart = (type: "year" | "month" | "day") => {
    const part = dateParts.find((part) => part.type === type);

    if (!part) {
        throw new Error(`Missing date part: ${type}`);
    }

    return Number(part.value);
    };

    const dayNumber = Math.floor(
      Date.UTC(
        getPart("year"),
        getPart("month") - 1,
        getPart("day")
      ) / 86_400_000
    );

    const verseIndex = dayNumber % orderedReferences.length;
    const reference = orderedReferences[verseIndex];
    const dateKey = [
      getPart("year"),
      String(getPart("month")).padStart(2, "0"),
      String(getPart("day")).padStart(2, "0"),
    ].join("-");

    const url = new URL("https://api.esv.org/v3/passage/text/");
    url.searchParams.set("q", reference);
    url.searchParams.set("include-verse-numbers", "false");
    url.searchParams.set("include-footnotes", "false");
    url.searchParams.set("include-headings", "false");
    url.searchParams.set("include-passage-references", "false");

    const response = await fetch(url, {
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    });

    if (!response.ok) {
      return Response.json(
        { error: "The verse provider could not fulfill the request." },
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await response.json();
    const text = data.passages?.[0];

    if (typeof text !== "string" || !text.trim()) {
      return Response.json(
        { error: "The verse provider returned no passage." },
        { status: 502, headers: corsHeaders }
      );
    }

    return Response.json(
      {
        reference: data.canonical,
        text: text.replace(/^Nun\s*\n\s*\n/, "").trim(),
        translation: "ESV",
        date: dateKey,
      },
      { headers: corsHeaders }
    );
  } catch {
    return Response.json(
      { error: "Unable to retrieve the verse right now." },
      { status: 502, headers: corsHeaders }
    );
  }
});