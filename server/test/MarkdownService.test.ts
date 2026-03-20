import { describe, it, expect } from 'vitest';
import { MarkdownService } from '../src/services/MarkdownService';

describe('MarkdownService', () => {

    describe('parseTask', () => {
        it('parses a task with full metadata (description, acceptance, subtasks)', () => {
            const raw = [
                '## My Task',
                '',
                '### Description',
                'This is the description.',
                '',
                '### Acceptance',
                'Must pass all tests.',
                '',
                '### Tasks',
                '- [x] Subtask A',
                '- [ ] Subtask B',
            ].join('\n');

            const task = MarkdownService.parseTask(raw);

            expect(task.title).toBe('My Task');
            expect(task.id).toBe(Buffer.from('My Task').toString('base64'));
            expect(task.metadata.description).toBe('This is the description.');
            expect(task.metadata.acceptance).toBe('Must pass all tests.');
            expect(task.metadata.subtasks).toEqual([
                { completed: true, text: 'Subtask A' },
                { completed: false, text: 'Subtask B' },
            ]);
        });

        it('parses a task with only a description (no subtasks/acceptance)', () => {
            const raw = [
                '## Partial Task',
                '',
                '### Description',
                'Only a description here.',
            ].join('\n');

            const task = MarkdownService.parseTask(raw);

            expect(task.title).toBe('Partial Task');
            expect(task.metadata.description).toBe('Only a description here.');
            expect(task.metadata.acceptance).toBeUndefined();
            expect(task.metadata.subtasks).toBeUndefined();
        });

        it('parses a task with just a title and freeform content (no H3 metadata)', () => {
            const raw = '## Bare Task\nSome freeform content here.';

            const task = MarkdownService.parseTask(raw);

            expect(task.title).toBe('Bare Task');
            expect(task.content).toContain('Some freeform content here.');
            expect(task.metadata.description).toBeUndefined();
            expect(task.metadata.subtasks).toBeUndefined();
        });
    });

    describe('parseSubTasks', () => {
        it('parses mixed completed/incomplete subtasks', () => {
            const content = [
                '- [x] Done item',
                '- [ ] Pending item',
                '- [X] Also done',
            ].join('\n');

            const subtasks = MarkdownService.parseSubTasks(content);

            expect(subtasks).toEqual([
                { completed: true, text: 'Done item' },
                { completed: false, text: 'Pending item' },
                { completed: true, text: 'Also done' },
            ]);
        });

        it('returns empty array for empty/blank input', () => {
            expect(MarkdownService.parseSubTasks('')).toEqual([]);
            expect(MarkdownService.parseSubTasks('   \n  \n')).toEqual([]);
        });

        it('parses bracket-only format without leading dash', () => {
            const content = '[x] Item one\n[ ] Item two';
            const subtasks = MarkdownService.parseSubTasks(content);

            expect(subtasks).toEqual([
                { completed: true, text: 'Item one' },
                { completed: false, text: 'Item two' },
            ]);
        });
    });

    describe('serializeTask', () => {
        it('round-trips: parse then serialize preserves essential content', () => {
            const original = [
                '## Round Trip Task',
                '',
                '### Description',
                'A description.',
                '',
                '### Acceptance',
                'Some criteria.',
                '',
                '### Tasks',
                '- [x] Sub 1',
                '- [ ] Sub 2',
            ].join('\n');

            const task = MarkdownService.parseTask(original);
            const serialized = MarkdownService.serializeTask(task);

            expect(serialized).toContain('## Round Trip Task');
            expect(serialized).toContain('### Description');
            expect(serialized).toContain('A description.');
            expect(serialized).toContain('### Acceptance');
            expect(serialized).toContain('Some criteria.');
            expect(serialized).toContain('- [x] Sub 1');
            expect(serialized).toContain('- [ ] Sub 2');
        });

        it('serializes a task with no metadata', () => {
            const task = {
                id: 'abc',
                title: 'Simple',
                content: '',
                metadata: {},
                raw: '## Simple',
            };

            const serialized = MarkdownService.serializeTask(task);
            expect(serialized).toBe('## Simple');
        });
    });

    describe('splitByTasks', () => {
        it('splits a file with multiple tasks', () => {
            const file = [
                '# Column Title',
                '',
                '## Task A',
                'Content A',
                '',
                '## Task B',
                'Content B',
                '',
                '## Task C',
                'Content C',
            ].join('\n');

            const sections = MarkdownService.splitByTasks(file);

            // sections[0] = header, sections[1..3] = tasks (without ## prefix)
            expect(sections).toHaveLength(4);
            expect(sections[0]).toContain('# Column Title');
            expect(sections[1]).toContain('Task A');
            expect(sections[2]).toContain('Task B');
            expect(sections[3]).toContain('Task C');
        });

        it('returns a single section when there are no tasks (only H1)', () => {
            const file = '# Empty Column\n';
            const sections = MarkdownService.splitByTasks(file);

            expect(sections).toHaveLength(1);
            expect(sections[0]).toContain('# Empty Column');
        });
    });
});
