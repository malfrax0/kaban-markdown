import express from 'express';
import https from 'https';
import fs from 'fs';
import { auth } from 'express-oauth2-jwt-bearer';
import { ProjectService } from './services/ProjectService';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.text()); // For raw markdown updates

const authEnabled = !!process.env.AUTH0_DOMAIN;

// Public route: serve Auth0 config to the client
app.get('/api/client_config', (_req, res) => {
    res.json({
        authEnabled,
        domain: process.env.AUTH0_DOMAIN || '',
        clientId: process.env.AUTH0_CLIENT_ID || '',
        audience: process.env.AUTH0_AUDIENCE || '',
        scope: process.env.AUTH0_SCOPE || 'openid profile email',
    });
});

// JWT middleware - protects all /api/* routes below this point (only when auth is enabled)
if (authEnabled) {
    const checkJwt = auth({
        audience: process.env.AUTH0_AUDIENCE!,
        issuerBaseURL: `https://${process.env.AUTH0_DOMAIN!}`,
    });
    app.use('/api', checkJwt);
}

// Routes
// 1. List Projects
app.get('/api/projects', async (req, res) => {
    const projects = await ProjectService.listProjects();
    res.json(projects);
});

// 2. Get Project Details (Board)
app.get('/api/projects/:id', async (req, res) => {
    const project = await ProjectService.getProject(req.params.id);
    if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
    }
    res.json(project);
});

// Create Project
app.post('/api/projects', async (req, res) => {
    const { name, description, background_image } = req.body;

    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }

    const projectId = await ProjectService.createProject(name, description || '', background_image);
    if (projectId) {
        res.json({ success: true, projectId });
    } else {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update Project Metadata
app.put('/api/projects/:id/metadata', async (req, res) => {
    const { id } = req.params;
    const { name, description, background_image } = req.body;

    const success = await ProjectService.updateProjectMetadata(id, { name, description, background_image });
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update project metadata' });
    }
});

// 3. Save Raw File (VSCode editor mode)
app.put('/api/projects/:id/files/:filename', async (req, res) => {
    const { id, filename } = req.params;
    const content = req.body; // Expecting raw string body for text/plain
    
    if (typeof content !== 'string') {
        res.status(400).json({ error: 'Body must be raw string' });
        return;
    }

    const success = await ProjectService.saveFile(id, filename, content);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// 4. Update Task (Granular)
app.put('/api/projects/:id/tasks/:taskId', async (req, res) => {
    const { id, taskId } = req.params;
    const { columnId, updates } = req.body;
    
    if (!columnId || !updates) {
        res.status(400).json({ error: 'Missing columnId or updates' });
        return;
    }

    const success = await ProjectService.updateTask(id, columnId, taskId, updates);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/api/projects/:id/tasks/:taskId', async (req, res) => {
    const { id, taskId } = req.params;
    const { columnId } = req.query;
    
    if (!columnId || typeof columnId !== 'string') {
        res.status(400).json({ error: 'Missing columnId query param' });
        return;
    }

    const success = await ProjectService.deleteTask(id, columnId, taskId);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// 6. Column Management
app.post('/api/projects/:id/columns', async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    const success = await ProjectService.createColumn(id, title);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to create column' });
    }
});

app.put('/api/projects/:id/columns/reorder', async (req, res) => {
    const { id } = req.params;
    const { newOrder } = req.body;

    if (!newOrder || !Array.isArray(newOrder)) {
        res.status(400).json({ error: 'newOrder array is required' });
        return;
    }

    const success = await ProjectService.reorderColumns(id, newOrder);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to reorder columns' });
    }
});

app.put('/api/projects/:id/columns/:columnId', async (req, res) => {
    const { id, columnId } = req.params;
    const { title } = req.body;

    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    const success = await ProjectService.updateColumnTitle(id, columnId, title);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to update column title' });
    }
});

app.delete('/api/projects/:id/columns/:columnId', async (req, res) => {
    const { id, columnId } = req.params;

    const success = await ProjectService.deleteColumn(id, columnId);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete column' });
    }
});

app.post('/api/projects/:id/tasks', async (req, res) => {
    const { id } = req.params;
    const { columnId, title } = req.body;

    if (!columnId || !title) {
        res.status(400).json({ error: 'Missing columnId or title' });
        return;
    }

    const success = await ProjectService.createTask(id, columnId, title);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to create task' });
    }
});
// 5. Move Task
app.post('/api/projects/:id/tasks/move', async (req, res) => {
    const { id } = req.params;
    const { taskId, sourceColId, destColId, newIndex } = req.body;

    if (!taskId || !sourceColId || !destColId || newIndex === undefined) {
        res.status(400).json({ error: 'Missing required move parameters' });
        return;
    }

    const success = await ProjectService.moveTask(id, taskId, sourceColId, destColId, newIndex);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to move task' });
    }
});

// Serve static files from the public directory
const PUBLIC_PATH = path.join(__dirname, '../public');
app.use(express.static(PUBLIC_PATH));

// Handle React routing, return all requests to React app
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(PUBLIC_PATH, 'index.html'));
});

// Load resources path from env or default, matching ProjectService logic for logging
const RESOURCES_DIR = process.env.RESOURCES_DIR 
    ? path.resolve(process.cwd(), process.env.RESOURCES_DIR) 
    : path.resolve(__dirname, '../../resources');

const SSL_KEY = process.env.SSL_KEY_PATH || '/app/certs/key.pem';
const SSL_CERT = process.env.SSL_CERT_PATH || '/app/certs/cert.pem';

if (fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)) {
    const httpsServer = https.createServer(
        { key: fs.readFileSync(SSL_KEY), cert: fs.readFileSync(SSL_CERT) },
        app
    );
    httpsServer.listen(PORT, () => {
        console.log(`Server running on https://localhost:${PORT}`);
        console.log(`Resources root expected at: ${RESOURCES_DIR}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Resources root expected at: ${RESOURCES_DIR}`);
    });
}
