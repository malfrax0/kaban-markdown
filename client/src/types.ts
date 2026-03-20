export interface ProjectMetadata {
    id: string; 
    name: string;
    description: string;
    background_image?: string;
    columns?: string[];
}

export interface SubTask {
    text: string;
    completed: boolean;
}

export interface Task {
    id: string; 
    title: string;
    content: string; 
    metadata: {
        description?: string;
        acceptance?: string;
        subtasks?: SubTask[];
        [key: string]: any;
    };
    raw: string; 
}

export interface Column {
    id: string; 
    title: string; 
    tasks: Task[];
    raw: string;
}

export interface ProjectData {
    metadata: ProjectMetadata;
    columns: Column[];
}
