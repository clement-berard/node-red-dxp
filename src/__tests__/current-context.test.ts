import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Entry } from 'fast-glob';
import { afterEach, describe, expect, it } from 'vitest';
import { listNodeFolders } from '../current-context';

describe('listNodeFolders', () => {
  let dir: string;

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function makeNode(name = 'my-node') {
    dir = mkdtempSync(path.join(tmpdir(), 'nrdxp-'));
    const fullPath = path.join(dir, name).split(path.sep).join('/');
    mkdirSync(path.join(dir, name, 'editor'), { recursive: true });
    const entry: Entry = { path: fullPath, name, dirent: {} as Entry['dirent'], stats: undefined };
    return { fullPath, entry };
  }

  it('returns empty doc/scss arrays when none of the optional files exist', () => {
    const { entry } = makeNode();
    const [node] = listNodeFolders([entry]);

    expect(node.doc.mdFiles).toEqual([]);
    expect(node.doc.mdxFiles).toEqual([]);
    expect(node.editor.scssFiles).toEqual([]);
  });

  it('detects docs.md when present', () => {
    const { entry, fullPath } = makeNode();
    writeFileSync(path.join(dir, entry.name, 'docs.md'), '# hello');
    const [node] = listNodeFolders([entry]);

    expect(node.doc.mdFiles).toEqual([`${fullPath}/docs.md`]);
    expect(node.doc.mdxFiles).toEqual([]);
  });

  it('detects docs.mdx when present', () => {
    const { entry, fullPath } = makeNode();
    writeFileSync(path.join(dir, entry.name, 'docs.mdx'), '# hello');
    const [node] = listNodeFolders([entry]);

    expect(node.doc.mdxFiles).toEqual([`${fullPath}/docs.mdx`]);
    expect(node.doc.mdFiles).toEqual([]);
  });

  it('detects both docs.md and docs.mdx when both are present', () => {
    const { entry, fullPath } = makeNode();
    writeFileSync(path.join(dir, entry.name, 'docs.md'), '# hello');
    writeFileSync(path.join(dir, entry.name, 'docs.mdx'), '# hello');
    const [node] = listNodeFolders([entry]);

    expect(node.doc.mdFiles).toEqual([`${fullPath}/docs.md`]);
    expect(node.doc.mdxFiles).toEqual([`${fullPath}/docs.mdx`]);
  });

  it('detects editor/styles.scss when present', () => {
    const { entry, fullPath } = makeNode();
    writeFileSync(path.join(dir, entry.name, 'editor', 'styles.scss'), 'body{}');
    const [node] = listNodeFolders([entry]);

    expect(node.editor.scssFiles).toEqual([`${fullPath}/editor/styles.scss`]);
  });

  it('builds the rest of the node shape correctly', () => {
    const { entry, fullPath } = makeNode('my-node');
    const [node] = listNodeFolders([entry]);

    expect(node.name).toBe('my-node');
    expect(node.pascalName).toBe('MyNode');
    expect(node.dashName).toBe('my-node');
    expect(node.fullPath).toBe(fullPath);
    expect(node.fullControllerPath).toBe(`${fullPath}/controller.ts`);
    expect(node.editor.tsPath).toBe(`${fullPath}/editor/index.ts`);
    expect(node.editor.htmlPath).toBe(`${fullPath}/editor/index.html`);
    expect(node.editor.pugPath).toBe(`${fullPath}/editor/index.pug`);
  });
});
