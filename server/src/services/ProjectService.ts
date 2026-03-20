import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { ProjectMetadata, ProjectData, Column, Task } from '../types';
import { MarkdownService } from './MarkdownService';

dotenv.config();

const RESOURCES_DIR = process.env.RESOURCES_DIR 
    ? path.resolve(process.cwd(), process.env.RESOURCES_DIR) 
    : path.resolve(__dirname, '../../../resources');

export class ProjectService {
    
    static async listProjects(): Promise<ProjectMetadata[]> {
        try {
            const files = await fs.readdir(RESOURCES_DIR, { withFileTypes: true });
            const projects: ProjectMetadata[] = [];

            for (const dirent of files) {
                if (dirent.isDirectory()) {
                    const projectPath = path.join(RESOURCES_DIR, dirent.name);
                    const indexPath = path.join(projectPath, 'index.json');
                    
                    try {
                        const indexContent = await fs.readFile(indexPath, 'utf-8');
                        const metadata = JSON.parse(indexContent);
                        projects.push({
                            id: dirent.name,
                            ...metadata
                        });
                    } catch (e) {
                         // Skip directories without index.json or invalid json
                         console.warn(`Skipping directory ${dirent.name}: Invalid or missing index.json`);
                    }
                }
            }
            return projects;
        } catch (error) {
            console.error("Error listing projects:", error);
            // If resources folder doesn't exist, return empty or create it
            return [];
        }
    }

    static async getProject(projectId: string): Promise<ProjectData | null> {
        const projectPath = path.join(RESOURCES_DIR, projectId);
        const indexPath = path.join(projectPath, 'index.json');

        try {
            // Check if exists
            await fs.access(indexPath);
            
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const metadata = JSON.parse(indexContent);
            
            const columns: Column[] = [];
            
            if (metadata.columns && Array.isArray(metadata.columns)) {
                // Load columns in order
                for (const fileName of metadata.columns) {
                    const col = await MarkdownService.parseColumnFile(path.join(projectPath, fileName));
                    if (col) {
                        columns.push(col);
                    }
                }
            } else {
                // Fallback: Read all md files
                const files = await fs.readdir(projectPath);
                for (const file of files) {
                    if (file.endsWith('.md')) {
                        const col = await MarkdownService.parseColumnFile(path.join(projectPath, file));
                        if (col) {
                            columns.push(col);
                        }
                    }
                }
                
                // Optional: We could sort by name if falling back
            }

            return {
                metadata: { id: projectId, ...metadata },
                columns
            };

        } catch (error) {
            console.error(`Error getting project ${projectId}:`, error);
            return null;
        }
    }

    static async saveFile(projectId: string, fileName: string, content: string): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, fileName);
            await fs.writeFile(filePath, content, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Error saving file ${fileName}:`, error);
            return false;
        }
    }

    static async createColumn(projectId: string, title: string): Promise<boolean> {
        try {
            // Sanitize title for filename
            const fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
            const filePath = path.join(RESOURCES_DIR, projectId, fileName);
            
            // Allow duplicate names?, maybe check exists
            try {
                await fs.access(filePath);
                // If exists, append timestamp to make unique
                // Or just fail. Let's make unique.
                // fileName = ...
                // For simplified version, simple fail or warn
                console.warn(`Column file ${fileName} already exists.`);
                // If it exists, we still might want to add it to index.json if not present?
                // Let's assume we proceed to ensure it's in index.
            } catch {
                // Good, doesn't exist
            }

            const content = `# ${title}\n`;
            await fs.writeFile(filePath, content, 'utf-8');

            // Update index.json to include this column
            const indexPath = path.join(RESOURCES_DIR, projectId, 'index.json');
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const metadata = JSON.parse(indexContent);

            if (!metadata.columns) {
                // Initialize with existing files if empty?
                // Or just start new list. 
                // Let's check what's on disk.
                const files = await fs.readdir(path.join(RESOURCES_DIR, projectId));
                const existingMds = files.filter(f => f.endsWith('.md') && f !== fileName);
                metadata.columns = existingMds;
            }

            if (!metadata.columns.includes(fileName)) {
                metadata.columns.push(fileName);
                await fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), 'utf-8');
            }

            return true;
        } catch (error) {
            console.error("Error creating column:", error);
            return false;
        }
    }

    static async updateColumnTitle(projectId: string, columnId: string, newTitle: string): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, `${columnId}.md`);
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n');
            
            // Replace first line
            // Check if first line is indeed header
            if (lines.length > 0 && lines[0].startsWith('# ')) {
                lines[0] = `# ${newTitle}`;
            } else {
                // Prepend
                lines.unshift(`# ${newTitle}`);
            }
            
            await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
            return true;
        } catch (error) {
            console.error("Error updating column title:", error);
            return false;
        }
    }

    static async deleteColumn(projectId: string, columnId: string): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, `${columnId}.md`);
            await fs.unlink(filePath);
            
            // Update index.json
            const indexPath = path.join(RESOURCES_DIR, projectId, 'index.json');
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const metadata = JSON.parse(indexContent);
            
            if (metadata.columns) {
                metadata.columns = metadata.columns.filter((c: string) => c !== `${columnId}.md`);
                await fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), 'utf-8');
            }
            
            return true;
        } catch (error) {
            console.error("Error deleting column:", error);
            return false;
        }
    }

    static async reorderColumns(projectId: string, newOrder: string[]): Promise<boolean> {
        try {
            const indexPath = path.join(RESOURCES_DIR, projectId, 'index.json');
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const metadata = JSON.parse(indexContent);
            
            metadata.columns = newOrder;
            
            await fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error("Error reordering columns:", error);
            return false;
        }
    }

    static async updateTask(projectId: string, columnId: string, taskId: string, updates: Partial<Task>): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, `${columnId}.md`);
            const content = await fs.readFile(filePath, 'utf-8');
            const sections = MarkdownService.splitByTasks(content);
            
            // Find task index
            // Task ID is base64(title). Use provided taskId to find original title.
            // Note: If title changes, we need the OLD title to find it. 
            // In a real app we might pass oldTitle? Or trust finding by title encoded in taskId.
            const oldTitle = Buffer.from(taskId, 'base64').toString('utf-8');

            // sections[0] is header. sections[1] is Task 1 (raw body without ## ).
            // We need to compare title lines.
            
            let taskIndex = -1;
            for (let i = 1; i < sections.length; i++) {
                // Section starts with "Title\n" (because ## was stripped)
                const lines = sections[i].split('\n');
                const title = lines[0].trim();
                if (title === oldTitle) {
                    taskIndex = i;
                    break;
                }
            }

            if (taskIndex === -1) {
                console.error(`Task not found: ${oldTitle}`);
                return false;
            }

            // Construct full new Task object
            // We parse the EXISTING one first to merge metadata if needed?
            // Actually `updates` should contain enough info, or we re-parse existing and merge.
            // Let's assume `updates` is the FULL new task state or we merge.
            // Safer to re-parse.
            const existingTask = MarkdownService.parseTask('## ' + sections[taskIndex]);
            
            const newTask: Task = {
                ...existingTask,
                ...updates,
                metadata: {
                    ...existingTask.metadata,
                    ...(updates.metadata || {})
                }
            };
            
            // Serialize
            const newContent = MarkdownService.serializeTask(newTask);
            
            // Update the section. We store RAW section in array (without ##)
            let updatedSection = newContent.substring(newContent.indexOf('## ') + 3);

            // Ensure we have trailing newlines so the next task starts on a new line
            if (!updatedSection.endsWith('\n')) {
                updatedSection += '\n\n';
            } else if (!updatedSection.endsWith('\n\n')) {
                updatedSection += '\n';
            }

            sections[taskIndex] = updatedSection;

            const newFileContent = sections.join('## ');
            await fs.writeFile(filePath, newFileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error("Error updating task:", error);
            return false;
        }
    }

    static async createTask(projectId: string, columnId: string, title: string): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, `${columnId}.md`);
            // Append new task to the end of file
            // Make sure to add newlines before
            const taskContent = `\n\n## ${title}\n### Description\nNew task created via board.\n`;
            
            await fs.appendFile(filePath, taskContent, 'utf-8');
            return true;
        } catch (error) {
            console.error("Error creating task:", error);
            return false;
        }
    }

    static async deleteTask(projectId: string, columnId: string, taskId: string): Promise<boolean> {
        try {
            const filePath = path.join(RESOURCES_DIR, projectId, `${columnId}.md`);
            const content = await fs.readFile(filePath, 'utf-8');
            const sections = MarkdownService.splitByTasks(content);
            
            const oldTitle = Buffer.from(taskId, 'base64').toString('utf-8');
            let taskIndex = -1;
            for (let i = 1; i < sections.length; i++) {
                const lines = sections[i].split('\n');
                const title = lines[0].trim();
                if (title === oldTitle) {
                    taskIndex = i;
                    break;
                }
            }

            if (taskIndex === -1) {
                console.error(`Task not found for deletion: ${oldTitle}`);
                return false;
            }

            sections.splice(taskIndex, 1);
            const newFileContent = sections.join('## ');
            await fs.writeFile(filePath, newFileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error("Error deleting task:", error);
            return false;
        }
    }

    static async createProject(name: string, description: string, backgroundImage?: string): Promise<string | null> {
        try {
            // Sanitize name for folder name
            const folderId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const projectPath = path.join(RESOURCES_DIR, folderId);

            // Check if already exists
            try {
                await fs.access(projectPath);
                // Exists – append timestamp to make unique
                const uniqueId = `${folderId}-${Date.now()}`;
                const uniquePath = path.join(RESOURCES_DIR, uniqueId);
                await fs.mkdir(uniquePath, { recursive: true });
                const metadata: Record<string, any> = { name, description, columns: [] };
                if (backgroundImage) metadata.background_image = backgroundImage;
                await fs.writeFile(path.join(uniquePath, 'index.json'), JSON.stringify(metadata, null, 2), 'utf-8');
                return uniqueId;
            } catch {
                // Good, doesn't exist
            }

            await fs.mkdir(projectPath, { recursive: true });
            const metadata: Record<string, any> = { name, description, columns: [] };
            if (backgroundImage) metadata.background_image = backgroundImage;
            await fs.writeFile(path.join(projectPath, 'index.json'), JSON.stringify(metadata, null, 2), 'utf-8');
            return folderId;
        } catch (error) {
            console.error('Error creating project:', error);
            return null;
        }
    }

    static async updateProjectMetadata(projectId: string, updates: { name?: string; description?: string; background_image?: string }): Promise<boolean> {
        try {
            const indexPath = path.join(RESOURCES_DIR, projectId, 'index.json');
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const metadata = JSON.parse(indexContent);

            if (updates.name !== undefined) metadata.name = updates.name;
            if (updates.description !== undefined) metadata.description = updates.description;
            if (updates.background_image !== undefined) metadata.background_image = updates.background_image;

            await fs.writeFile(indexPath, JSON.stringify(metadata, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('Error updating project metadata:', error);
            return false;
        }
    }

    static async moveTask(projectId: string, taskId: string, sourceColId: string, destColId: string, newIndex: number): Promise<boolean> {
        try {
            const sourcePath = path.join(RESOURCES_DIR, projectId, `${sourceColId}.md`);
            const destPath = path.join(RESOURCES_DIR, projectId, `${destColId}.md`);
            
            const sourceContent = await fs.readFile(sourcePath, 'utf-8');
            const sourceSections = MarkdownService.splitByTasks(sourceContent);
            
            // Find task in source
            const oldTitle = Buffer.from(taskId, 'base64').toString('utf-8');
            let sourceIndex = -1;
            
            for (let i = 1; i < sourceSections.length; i++) {
                const title = sourceSections[i].split('\n')[0].trim();
                if (title === oldTitle) {
                    sourceIndex = i;
                    break;
                }
            }

            if (sourceIndex === -1) return false;

            // Extract section
            let [movedSection] = sourceSections.splice(sourceIndex, 1);

            // Ensure we have trailing newlines on the moved section so it doesn't merge with the next one
            if (!movedSection.endsWith('\n')) {
                movedSection += '\n\n';
            } else if (!movedSection.endsWith('\n\n')) {
                movedSection += '\n';
            }

            if (sourceColId === destColId) {
                // Same file, just insert at new index
                // newIndex corresponds to visual task index (0-based)
                // sourceSections has header at 0. So visual 0 is index 1.
                // We need to account for the fact we just removed one.
                
                // If moving down: visual 0 -> 2. 
                // [H, A, B, C] -> Remove A -> [H, B, C] -> Insert at 2+1=3 -> [H, B, C, A]
                
                // The `newIndex` from frontend is usually "target index".
                sourceSections.splice(newIndex + 1, 0, movedSection);
                
                const newContent = sourceSections.join('## ');
                await fs.writeFile(sourcePath, newContent, 'utf-8');
            } else {
                // Different files
                // Save source
                await fs.writeFile(sourcePath, sourceSections.join('## '), 'utf-8');
                
                // Read dest
                const destContent = await fs.readFile(destPath, 'utf-8');
                const destSections = MarkdownService.splitByTasks(destContent);
                
                // Insert
                destSections.splice(newIndex + 1, 0, movedSection);
                
                await fs.writeFile(destPath, destSections.join('## '), 'utf-8');
            }
            return true;
        } catch (error) {
            console.error("Error moving task:", error);
            return false;
        }
    }
}

