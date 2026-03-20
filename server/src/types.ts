export interface ProjectMetadata {
    id: string; // The folder name
    name: string;
    description: string;
    background_image?: string;
    columns?: string[]; // List of ordered column filenames
}

export interface Task {
    id: string; // Generated or based on title hash
    title: string;
    content: string; // Raw content excluding the title
    metadata: {
        description?: string;
        acceptance?: string;
        subtasks?: SubTask[];
        [key: string]: any;
    };
    raw: string; // The full raw markdown for this task
}

export interface SubTask {
    text: string;
    completed: boolean;
}

export interface Column {
    id: string; // file name without extension
    title: string; // From H1
    tasks: Task[];
    raw: string; // Full file content for editing
}

export interface ProjectData {
    metadata: ProjectMetadata;
    columns: Column[];
}
