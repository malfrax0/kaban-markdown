import axios from 'axios';
import type { ProjectMetadata, ProjectData, Task } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create();

let _getAccessToken: (() => Promise<string>) | null = null;

export function setAccessTokenGetter(getter: () => Promise<string>) {
    _getAccessToken = getter;
}

apiClient.interceptors.request.use(async (config) => {
    if (_getAccessToken) {
        const token = await _getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    getProjects: async (): Promise<ProjectMetadata[]> => {
        const response = await apiClient.get(`${API_URL}/projects?_t=${Date.now()}`);
        return response.data;
    },
    getProject: async (id: string): Promise<ProjectData> => {
        const response = await apiClient.get(`${API_URL}/projects/${id}?_t=${Date.now()}`);
        return response.data;
    },
    saveFile: async (projectId: string, fileName: string, content: string): Promise<void> => {
        await apiClient.put(`${API_URL}/projects/${projectId}/files/${fileName}`, content, {
            headers: { 'Content-Type': 'text/plain' }
        });
    },
    updateTask: async (projectId: string, columnId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
        await apiClient.put(`${API_URL}/projects/${projectId}/tasks/${taskId}`, { columnId, updates });
    },
    createTask: async (projectId: string, columnId: string, title: string): Promise<void> => {
        await apiClient.post(`${API_URL}/projects/${projectId}/tasks`, { columnId, title });
    },
    moveTask: async (projectId: string, taskId: string, sourceColId: string, destColId: string, newIndex: number): Promise<void> => {
        await apiClient.post(`${API_URL}/projects/${projectId}/tasks/move`, { taskId, sourceColId, destColId, newIndex });
    },
    createColumn: async (projectId: string, title: string): Promise<void> => {
        await apiClient.post(`${API_URL}/projects/${projectId}/columns`, { title });
    },
    updateColumnTitle: async (projectId: string, columnId: string, title: string): Promise<void> => {
        await apiClient.put(`${API_URL}/projects/${projectId}/columns/${columnId}`, { title });
    },
    deleteColumn: async (projectId: string, columnId: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/projects/${projectId}/columns/${columnId}`);
    },
    deleteTask: async (projectId: string, columnId: string, taskId: string): Promise<void> => {
        await apiClient.delete(`${API_URL}/projects/${projectId}/tasks/${taskId}?columnId=${columnId}`);
    },
    reorderColumns: async (projectId: string, newOrder: string[]): Promise<void> => {
        await apiClient.put(`${API_URL}/projects/${projectId}/columns/reorder`, { newOrder });
    },
    createProject: async (name: string, description: string, backgroundImage?: string): Promise<string> => {
        const response = await apiClient.post(`${API_URL}/projects`, { name, description, background_image: backgroundImage });
        return response.data.projectId;
    },
    updateProjectMetadata: async (projectId: string, updates: { name?: string; description?: string; background_image?: string }): Promise<void> => {
        await apiClient.put(`${API_URL}/projects/${projectId}/metadata`, updates);
    }
};
