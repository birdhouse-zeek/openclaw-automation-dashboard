#!/usr/bin/env node

/**
 * Simple API bridge to connect the dashboard to OpenClaw CLI
 */

const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Helper to execute OpenClaw CLI commands
async function execOpenClaw(args) {
    return new Promise((resolve, reject) => {
        const process = spawn('openclaw', args);
        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

// Parse OpenClaw cron list output
function parseCronList(output) {
    const lines = output.split('\n').filter(line => line.trim());
    const jobs = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse the table format
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
            const id = parts[0];
            const name = parts.slice(1, -5).join(' ');
            const schedule = parts[parts.length - 5];
            const next = parts[parts.length - 4];
            const last = parts[parts.length - 3];
            const status = parts[parts.length - 2];
            const agent = parts[parts.length - 1];
            
            jobs.push({
                id,
                name,
                schedule,
                next,
                last,
                enabled: status !== 'disabled',
                status,
                agent
            });
        }
    }
    
    return jobs;
}

// API Endpoints

// Get all cron jobs
app.get('/api/cron/jobs', async (req, res) => {
    try {
        const output = await execOpenClaw(['cron', 'list', '--all']);
        const jobs = parseCronList(output);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching cron jobs:', error);
        res.status(500).json({ error: 'Failed to fetch cron jobs' });
    }
});

// Get gateway status
app.get('/api/gateway/status', async (req, res) => {
    try {
        const output = await execOpenClaw(['health']);
        // Simple check - if health command succeeds, gateway is online
        res.json({ status: 'online' });
    } catch (error) {
        res.json({ status: 'offline' });
    }
});

// Toggle job (enable/disable)
app.post('/api/cron/jobs/:id/toggle', async (req, res) => {
    const { id } = req.params;
    try {
        // First get current status
        const output = await execOpenClaw(['cron', 'list', '--all']);
        const jobs = parseCronList(output);
        const job = jobs.find(j => j.id === id);
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Toggle the job
        const action = job.enabled ? 'disable' : 'enable';
        await execOpenClaw(['cron', action, id]);
        
        res.json({ success: true, action });
    } catch (error) {
        console.error('Error toggling job:', error);
        res.status(500).json({ error: 'Failed to toggle job' });
    }
});

// Run job now
app.post('/api/cron/jobs/:id/run', async (req, res) => {
    const { id } = req.params;
    try {
        await execOpenClaw(['cron', 'run', id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error running job:', error);
        res.status(500).json({ error: 'Failed to run job' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`OpenClaw API Bridge running on port ${PORT}`);
});