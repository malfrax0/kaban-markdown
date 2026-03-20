import fs from 'fs/promises';
import path from 'path';
import { Column, Task, SubTask } from '../types';

export class MarkdownService {
    
    // Parse a generic markdown file into our Kanban Column structure
    static async parseColumnFile(filePath: string): Promise<Column | null> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            const fileName = path.basename(filePath, '.md');

            // Find H1 title
            const h1Index = lines.findIndex(line => line.startsWith('# '));
            if (h1Index === -1) {
                // Invalid file structure for our app
                return null;
            }

            const title = lines[h1Index].substring(2).trim();
            
            // Split by H2 to get tasks
            // We need to keep the content stable, so we'll do some regex splitting
            // This regex matches "## " at the start of a line
            const taskSections = content.split(/^## /m);
            
            // The first section is the header (before first H2), usually just H1
            // Subsequent sections are tasks
            const tasks: Task[] = [];
            
            // taskSections[0] is everything before the first task. 
            // We ignore it for task parsing, but we've already extracted the title.

            for (let i = 1; i < taskSections.length; i++) {
                const sectionRaw = '## ' + taskSections[i];
                tasks.push(this.parseTask(sectionRaw));
            }

            return {
                id: fileName,
                title,
                tasks,
                raw: content
            };

        } catch (error) {
            console.error(`Error parsing file ${filePath}:`, error);
            throw error;
        }
    }

    static parseTask(rawSection: string): Task {
        const lines = rawSection.split('\n');
        // First line is "## Title"
        const titleLine = lines[0];
        const title = titleLine.substring(3).trim();
        
        // Everything else is content
        const contentLines = lines.slice(1);
        const content = contentLines.join('\n');
        
        // Parse metadata (H3 sections)
        const metadata: any = {};
        
        // Split by H3
        const subsections = content.split(/^### /m);
        
        // subsections[0] is generic description before any H3
        // We can treat subsections[1...] as keyed fields
        
        for (let i = 1; i < subsections.length; i++) {
            const subContent = subsections[i];
            const subLines = subContent.split('\n');
            const subTitle = subLines[0].trim().toLowerCase();
            const subBody = subLines.slice(1).join('\n').trim();
            
            if (subTitle === 'tasks') {
                metadata.subtasks = this.parseSubTasks(subBody);
            } else {
                metadata[subTitle] = subBody;
            }
        }

        return {
            id: Buffer.from(title).toString('base64'), // Simple ID generation
            title,
            content,
            metadata,
            raw: rawSection
        };
    }

    static parseSubTasks(content: string): SubTask[] {
        const lines = content.split('\n');
        const tasks: SubTask[] = [];
        const regex = /^\s*-\s*\[([ xX])\]\s*(.*)$/;
        // Also support unordered lists without checkboxes strictly? 
        // The prompt says "using list and []"
        
        // Or strictly [ ] 
        const regexBracket = /^\s*\[([ xX])\]\s*(.*)$/;

        for (const line of lines) {
            // Check formatted list "- [ ]"
            let match = line.match(regex);
            
            if (!match) {
                 // Check simple bracket "[ ]"
                match = line.match(regexBracket);
            }

            if (match) {
                tasks.push({
                    completed: match[1].toLowerCase() === 'x',
                    text: match[2].trim()
                });
            }
        }
        return tasks;
    }

    static serializeTask(task: Task): string {
        const parts = [`## ${task.title}`];

        // Ensure description and acceptance come first if they exist
        const { description, acceptance, subtasks, ...others } = task.metadata;

        if (description) {
            parts.push(`### Description\n${description.trim()}`);
        }

        if (acceptance) {
            parts.push(`### Acceptance\n${acceptance.trim()}`);
        }

        // Other metadata
        for (const [key, value] of Object.entries(others)) {
            const header = key.charAt(0).toUpperCase() + key.slice(1);
            parts.push(`### ${header}\n${String(value).trim()}`);
        }

        // Subtasks
        if (subtasks && subtasks.length > 0) {
            parts.push('### Tasks');
            subtasks.forEach(st => {
                const mark = st.completed ? 'x' : ' ';
                parts.push(`- [${mark}] ${st.text}`);
            });
        }

        return parts.join('\n\n');
    }

    static splitByTasks(rawFileContent: string): string[] {
        // Split by "## " at start of line
        // Capture everything before first task as index 0
        return rawFileContent.split(/^## /m);
    }
}

