import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarkdownService } from '../src/services/MarkdownService';

// Mock fs/promises
vi.mock('fs/promises', () => ({
    default: {
        readdir: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        access: vi.fn(),
        mkdir: vi.fn(),
        unlink: vi.fn(),
        appendFile: vi.fn(),
    },
}));

// We also need to mock dotenv so it doesn't try to load .env
vi.mock('dotenv', () => ({ default: { config: vi.fn() }, config: vi.fn() }));

import fs from 'fs/promises';
import path from 'path';

// Import ProjectService AFTER mocks are set up
const { ProjectService } = await import('../src/services/ProjectService');

const mockedFs = vi.mocked(fs);

describe('ProjectService', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('listProjects', () => {
        it('returns projects with valid index.json files', async () => {
            mockedFs.readdir.mockResolvedValue([
                { name: 'project-a', isDirectory: () => true },
                { name: 'project-b', isDirectory: () => true },
            ] as any);

            mockedFs.readFile.mockImplementation(async (filePath: any) => {
                if (filePath.toString().includes('project-a')) {
                    return JSON.stringify({ name: 'Project A', description: 'Desc A' });
                }
                if (filePath.toString().includes('project-b')) {
                    return JSON.stringify({ name: 'Project B', description: 'Desc B' });
                }
                throw new Error('Not found');
            });

            const projects = await ProjectService.listProjects();
            expect(projects).toHaveLength(2);
            expect(projects[0]).toMatchObject({ id: 'project-a', name: 'Project A' });
            expect(projects[1]).toMatchObject({ id: 'project-b', name: 'Project B' });
        });

        it('skips directories without index.json', async () => {
            mockedFs.readdir.mockResolvedValue([
                { name: 'valid-project', isDirectory: () => true },
                { name: 'invalid-folder', isDirectory: () => true },
                { name: 'somefile.txt', isDirectory: () => false },
            ] as any);

            mockedFs.readFile.mockImplementation(async (filePath: any) => {
                if (filePath.toString().includes('valid-project')) {
                    return JSON.stringify({ name: 'Valid', description: 'OK' });
                }
                throw new Error('ENOENT');
            });

            const projects = await ProjectService.listProjects();
            expect(projects).toHaveLength(1);
            expect(projects[0].id).toBe('valid-project');
        });
    });

    describe('getProject', () => {
        it('returns full project structure with metadata and columns', async () => {
            mockedFs.access.mockResolvedValue(undefined);
            mockedFs.readFile.mockImplementation(async (filePath: any) => {
                const p = filePath.toString();
                if (p.endsWith('index.json')) {
                    return JSON.stringify({
                        name: 'Test Project',
                        description: 'Desc',
                        columns: ['todo.md'],
                    });
                }
                if (p.endsWith('todo.md')) {
                    return '# To Do\n\n## Task 1\n### Description\nFirst task\n';
                }
                throw new Error('Not found');
            });

            const project = await ProjectService.getProject('test-project');

            expect(project).not.toBeNull();
            expect(project!.metadata.name).toBe('Test Project');
            expect(project!.columns).toHaveLength(1);
            expect(project!.columns[0].title).toBe('To Do');
            expect(project!.columns[0].tasks).toHaveLength(1);
            expect(project!.columns[0].tasks[0].title).toBe('Task 1');
        });
    });

    describe('createColumn', () => {
        it('creates a .md file and updates index.json', async () => {
            // Column file doesn't exist yet
            mockedFs.access.mockRejectedValue(new Error('ENOENT'));
            mockedFs.writeFile.mockResolvedValue(undefined);
            mockedFs.readFile.mockResolvedValue(JSON.stringify({
                name: 'Proj',
                description: '',
                columns: ['existing.md'],
            }));

            const result = await ProjectService.createColumn('my-project', 'New Column');

            expect(result).toBe(true);
            // Written the .md file
            expect(mockedFs.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('new-column.md'),
                '# New Column\n',
                'utf-8',
            );
            // Updated index.json
            expect(mockedFs.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('index.json'),
                expect.stringContaining('new-column.md'),
                'utf-8',
            );
        });
    });

    describe('deleteColumn', () => {
        it('removes the file and updates index.json', async () => {
            mockedFs.unlink.mockResolvedValue(undefined);
            mockedFs.readFile.mockResolvedValue(JSON.stringify({
                name: 'Proj',
                columns: ['todo.md', 'done.md'],
            }));
            mockedFs.writeFile.mockResolvedValue(undefined);

            const result = await ProjectService.deleteColumn('my-project', 'done');

            expect(result).toBe(true);
            expect(mockedFs.unlink).toHaveBeenCalledWith(expect.stringContaining('done.md'));
            // Updated index.json should not contain done.md
            const writtenJson = mockedFs.writeFile.mock.calls.find(
                (call) => call[0].toString().includes('index.json')
            );
            expect(writtenJson).toBeDefined();
            const parsed = JSON.parse(writtenJson![1] as string);
            expect(parsed.columns).toEqual(['todo.md']);
        });
    });

    describe('createTask', () => {
        it('appends task markdown to the column file', async () => {
            mockedFs.appendFile.mockResolvedValue(undefined);

            const result = await ProjectService.createTask('proj', 'todo', 'New Task');

            expect(result).toBe(true);
            expect(mockedFs.appendFile).toHaveBeenCalledWith(
                expect.stringContaining('todo.md'),
                expect.stringContaining('## New Task'),
                'utf-8',
            );
        });
    });

    describe('deleteTask', () => {
        it('removes the task section from the file', async () => {
            const fileContent = [
                '# Column',
                '',
                '## Task A',
                'Content A',
                '',
                '## Task B',
                'Content B',
            ].join('\n');

            mockedFs.readFile.mockResolvedValue(fileContent);
            mockedFs.writeFile.mockResolvedValue(undefined);

            const taskId = Buffer.from('Task B').toString('base64');
            const result = await ProjectService.deleteTask('proj', 'col', taskId);

            expect(result).toBe(true);
            const written = mockedFs.writeFile.mock.calls[0][1] as string;
            expect(written).toContain('Task A');
            expect(written).not.toContain('Task B');
        });
    });

    describe('moveTask', () => {
        it('moves a task from one column to another', async () => {
            const sourceContent = [
                '# Source',
                '',
                '## Task X',
                'Content X',
                '',
                '## Task Y',
                'Content Y',
            ].join('\n');

            const destContent = '# Dest\n';

            mockedFs.readFile.mockImplementation(async (filePath: any) => {
                if (filePath.toString().includes('source.md')) return sourceContent;
                if (filePath.toString().includes('dest.md')) return destContent;
                throw new Error('Not found');
            });
            mockedFs.writeFile.mockResolvedValue(undefined);

            const taskId = Buffer.from('Task X').toString('base64');
            const result = await ProjectService.moveTask('proj', taskId, 'source', 'dest', 0);

            expect(result).toBe(true);
            // Source should no longer have Task X
            const sourceWrite = mockedFs.writeFile.mock.calls.find(
                (c) => c[0].toString().includes('source.md')
            );
            expect(sourceWrite).toBeDefined();
            expect(sourceWrite![1] as string).not.toContain('Task X');
            expect(sourceWrite![1] as string).toContain('Task Y');

            // Dest should now have Task X
            const destWrite = mockedFs.writeFile.mock.calls.find(
                (c) => c[0].toString().includes('dest.md')
            );
            expect(destWrite).toBeDefined();
            expect(destWrite![1] as string).toContain('Task X');
        });
    });
});
