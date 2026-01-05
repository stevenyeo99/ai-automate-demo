'use strict';

const fs = require('fs/promises');
const path = require('path');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

function getImapConfig() {
  return {
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: String(process.env.IMAP_TLS || 'true').toLowerCase() === 'true',
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD
    },
    logger: false
  };
}

function getImportBaseDir() {
  return process.env.IMAP_IMPORT_BASE_DIR || path.join(process.cwd(), 'imported-mail');
}

function getImportLimit() {
  const limit = Number(process.env.IMAP_IMPORT_LIMIT || 10);
  return Number.isFinite(limit) && limit > 0 ? limit : 10;
}

function sanitizeMessageId(value) {
  const raw = String(value || '').replace(/[<>]/g, '').trim();
  if (!raw) {
    return 'unknown-message-id';
  }

  return raw.replace(/[\\/:*?"<>|\s]+/g, '_');
}

function formatDateParts(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date();
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return { year, month, day };
}

function formatBodyMarkdown(parsed) {
  const lines = [];
  const subject = parsed.subject || 'No subject';
  lines.push(`# ${subject}`);
  lines.push('');
  if (parsed.from?.text) lines.push(`From: ${parsed.from.text}`);
  if (parsed.to?.text) lines.push(`To: ${parsed.to.text}`);
  if (parsed.date) lines.push(`Date: ${parsed.date.toISOString()}`);
  if (parsed.messageId) lines.push(`Message-ID: ${parsed.messageId}`);
  lines.push('');

  if (parsed.text) {
    lines.push('## Text');
    lines.push('');
    lines.push(parsed.text);
    lines.push('');
  }

  if (parsed.html) {
    lines.push('## HTML');
    lines.push('');
    lines.push('```html');
    lines.push(parsed.html);
    lines.push('```');
    lines.push('');
  }

  if (!parsed.text && !parsed.html) {
    lines.push('_No body content found._');
    lines.push('');
  }

  return lines.join('\n');
}

async function importUnseenEmails() {
  const config = getImapConfig();
  const baseDir = getImportBaseDir();
  const limit = getImportLimit();

  if (!config.host || !config.auth.user || !config.auth.pass) {
    throw new Error('Missing IMAP configuration. Set IMAP_HOST, IMAP_USER, and IMAP_PASSWORD.');
  }

  const client = new ImapFlow(config);
  await client.connect();

  try {
    await client.mailboxOpen('INBOX');
    const uids = await client.search({ seen: false });

    if (!uids.length) {
      return { imported: 0, reason: 'No unseen messages.' };
    }

    const metadata = [];
    for await (const msg of client.fetch(uids, { envelope: true, internalDate: true, uid: true })) {
      const dateValue = msg.envelope?.date || msg.internalDate || new Date();
      metadata.push({ uid: msg.uid, date: dateValue });
    }

    metadata.sort((a, b) => a.date - b.date);
    const targets = metadata.slice(0, limit);

    for (const item of targets) {
      for await (const msg of client.fetch(item.uid, { source: true, envelope: true, internalDate: true, uid: true })) {
        const parsed = await simpleParser(msg.source);
        const messageId = sanitizeMessageId(parsed.messageId || msg.envelope?.messageId || `uid-${msg.uid}`);
        const dateValue = msg.envelope?.date || msg.internalDate || new Date();
        const { year, month, day } = formatDateParts(dateValue);
        const messageDir = path.join(baseDir, year, month, day, messageId);

        await fs.mkdir(messageDir, { recursive: true });
        const contentPath = path.join(messageDir, 'content.md');
        const body = formatBodyMarkdown(parsed);
        await fs.writeFile(contentPath, body, 'utf8');

        await client.messageFlagsAdd(msg.uid, ['\\Seen']);
      }
    }

    return { imported: targets.length };
  } finally {
    await client.logout();
  }
}

module.exports = {
  importUnseenEmails
};
