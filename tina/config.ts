import { defineConfig } from 'tinacms'

const branch = process.env.TINA_PUBLIC_EDIT_BRANCH ?? 'main'

// Date-prefixed slug: 2026/06/27-my-title
function slugifyWithDate(title?: string, date?: string): string {
  const d = date ? new Date(date) : new Date()
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  const slug = (title ?? 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return `${yyyy}/${mm}/${dd}-${slug}`
}

export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID ?? '',
  token:    process.env.TINA_TOKEN ?? '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot:   'media',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [

      // ─── Conversation ────────────────────────────────────────────────────────
      // The thread — the overarching record of a working session.
      {
        name:   'conversation',
        label:  'Conversations',
        path:   'contexts/call-response/data/conversation',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => slugifyWithDate(values.title, values.date),
          },
        },
        fields: [
          {
            name:     'title',
            label:    'Title',
            type:     'string',
            required: true,
            isTitle:  true,
          },
          {
            name:     'date',
            label:    'Date',
            type:     'datetime',
            required: true,
            ui: { dateFormat: 'YYYY-MM-DD' },
          },
          {
            name:  'participants',
            label: 'Participants',
            type:  'string',
            list:  true,
            ui: {
              component: 'tags',
              description: 'Agent handles and AI identifiers (e.g. stephen, claude-sonnet-4-6)',
            },
          },
          {
            name:  'project',
            label: 'Project',
            type:  'string',
            ui: { description: 'Which codebase or product this conversation relates to' },
          },
          {
            name:  'source',
            label: 'Source',
            type:  'object',
            fields: [
              {
                name:    'tool',
                label:   'Tool',
                type:    'string',
                options: [
                  { value: 'claude-code', label: 'Claude Code (CLI)' },
                  { value: 'figma-make', label: 'Figma Make' },
                  { value: 'claude-web',  label: 'Claude (Web)' },
                  { value: 'other',       label: 'Other' },
                ],
              },
              {
                name:  'sessionId',
                label: 'Session ID',
                type:  'string',
                ui: { description: 'JSONL filename or session identifier' },
              },
              {
                name:  'turns',
                label: 'Turn count',
                type:  'number',
              },
            ],
          },
          {
            name:  'tags',
            label: 'Tags',
            type:  'string',
            list:  true,
            ui: { component: 'tags' },
          },
          {
            // Main content in the Markdown body — not in frontmatter.
            // ARC reads this as entry.body.
            name:     'body',
            label:    'Summary',
            type:     'rich-text',
            required: true,
            isBody:   true,
          },
        ],
      },

      // ─── Call ────────────────────────────────────────────────────────────────
      // A significant prompt — the opening move that initiated something durable.
      {
        name:   'call',
        label:  'Calls',
        path:   'contexts/call-response/data/call',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => slugifyWithDate(values.title, values.date),
          },
        },
        fields: [
          {
            name:     'title',
            label:    'Title',
            type:     'string',
            required: true,
            isTitle:  true,
          },
          {
            name:     'date',
            label:    'Date',
            type:     'datetime',
            required: true,
            ui: { dateFormat: 'YYYY-MM-DD' },
          },
          {
            name:        'conversationId',
            label:       'Conversation',
            type:        'reference',
            collections: ['conversation'],
          },
          {
            name:  'intent',
            label: 'Intent',
            type:  'string',
            ui: {
              component:   'textarea',
              description: 'The underlying goal behind this request',
            },
          },
          {
            name:  'tags',
            label: 'Tags',
            type:  'string',
            list:  true,
            ui: { component: 'tags' },
          },
          {
            // The actual prompt verbatim or paraphrased — in the Markdown body.
            name:     'body',
            label:    'Prompt',
            type:     'rich-text',
            required: true,
            isBody:   true,
          },
        ],
      },

      // ─── Response ────────────────────────────────────────────────────────────
      // A significant reply that produced something durable.
      {
        name:   'response',
        label:  'Responses',
        path:   'contexts/call-response/data/response',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => slugifyWithDate(values.title, values.date),
          },
        },
        fields: [
          {
            name:     'title',
            label:    'Title',
            type:     'string',
            required: true,
            isTitle:  true,
          },
          {
            name:     'date',
            label:    'Date',
            type:     'datetime',
            required: true,
            ui: { dateFormat: 'YYYY-MM-DD' },
          },
          {
            name:        'callId',
            label:       'Call',
            type:        'reference',
            collections: ['call'],
          },
          {
            name:    'outcome',
            label:   'Outcome',
            type:    'string',
            options: [
              { value: 'accepted',  label: 'Accepted — implemented as proposed' },
              { value: 'modified',  label: 'Modified — implemented with changes' },
              { value: 'deferred',  label: 'Deferred — noted for later' },
              { value: 'rejected',  label: 'Rejected — not pursued' },
            ],
          },
          {
            name:  'artifacts',
            label: 'Artifacts produced',
            type:  'string',
            list:  true,
            ui: { component: 'tags' },
          },
          {
            name:  'tags',
            label: 'Tags',
            type:  'string',
            list:  true,
            ui: { component: 'tags' },
          },
          {
            name:     'body',
            label:    'Summary',
            type:     'rich-text',
            required: true,
            isBody:   true,
          },
        ],
      },

      // ─── Artifact ────────────────────────────────────────────────────────────
      // A durable output — decision, design, code, pattern, migration, or refactor.
      {
        name:   'artifact',
        label:  'Artifacts',
        path:   'contexts/call-response/data/artifact',
        format: 'md',
        ui: {
          filename: {
            slugify: (values) => slugifyWithDate(values.title, values.date),
          },
        },
        fields: [
          {
            name:     'title',
            label:    'Title',
            type:     'string',
            required: true,
            isTitle:  true,
          },
          {
            name:     'date',
            label:    'Date',
            type:     'datetime',
            required: true,
            ui: { dateFormat: 'YYYY-MM-DD' },
          },
          {
            name:     'kind',
            label:    'Kind',
            type:     'string',
            required: true,
            options:  [
              { value: 'decision',  label: 'Decision — a significant choice made' },
              { value: 'design',    label: 'Design — an architecture or system design' },
              { value: 'code',      label: 'Code — files created or significantly changed' },
              { value: 'migration', label: 'Migration — a data or schema migration' },
              { value: 'pattern',   label: 'Pattern — a reusable approach or convention' },
              { value: 'refactor',  label: 'Refactor — a rename, restructure, or cleanup' },
            ],
          },
          {
            name:  'project',
            label: 'Project',
            type:  'string',
          },
          {
            name:        'conversationId',
            label:       'Conversation',
            type:        'reference',
            collections: ['conversation'],
          },
          {
            name:  'files',
            label: 'Files affected',
            type:  'string',
            list:  true,
            ui: {
              component:   'tags',
              description: 'File paths created or modified',
            },
          },
          {
            name:  'tags',
            label: 'Tags',
            type:  'string',
            list:  true,
            ui: { component: 'tags' },
          },
          {
            name:     'body',
            label:    'Summary',
            type:     'rich-text',
            required: true,
            isBody:   true,
          },
        ],
      },

    ],
  },
})
