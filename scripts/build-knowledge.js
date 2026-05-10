import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge', 'text');
const OUTPUT_FILE = path.join(__dirname, '..', 'knowledge', 'embeddings.json');

function parseMarkdown(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) return { frontmatter: {}, body: content.trim() };

  const fmText = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();

  const frontmatter = {};
  for (const line of fmText.split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      const val = rest.join(':').trim();
      try {
        frontmatter[key.trim()] = JSON.parse(val);
      } catch {
        frontmatter[key.trim()] = val;
      }
    }
  }
  return { frontmatter, body };
}

async function build() {
  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md'));
  const embeddings = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), 'utf-8');
    const { frontmatter, body } = parseMarkdown(content);

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: body,
    });

    embeddings.push({
      file,
      frontmatter,
      body: body.slice(0, 2000),
      vector: response.data[0].embedding,
    });

    console.log(`Embedded: ${file}`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));
  console.log(`\nDone. Wrote ${embeddings.length} embeddings to ${OUTPUT_FILE}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
