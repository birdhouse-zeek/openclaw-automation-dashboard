/**
 * OpenClaw Automation Dashboard
 * Main JavaScript functionality for managing cron jobs and system status
 */

class AutomationDashboard {
    constructor() {
        this.apiBase = 'http://127.0.0.1:18789';
        this.apiToken = '1f3c24e8659887020b2ab6312df8de1f12f351aa0a8f6f4b';
        this.jobs = [];
        this.lastUpdate = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
        
        // Set up auto-refresh
        setInterval(() => this.loadData(), 30000); // 30 seconds
    }

    bindEvents() {
        // Header buttons
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadData());
        // New Job button disabled - use OpenClaw CLI instead
        document.getElementById('new-job-btn').addEventListener('click', () => {
            alert('Use OpenClaw CLI to create new jobs:\nopenclaw cron add');
        });
        
        // Modal events
        document.querySelector('.close-btn').addEventListener('click', () => this.hideJobModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideJobModal());
        document.getElementById('job-form').addEventListener('submit', (e) => this.handleJobSubmit(e));
        
        // Close modal on outside click
        document.getElementById('job-modal').addEventListener('click', (e) => {
            if (e.target.id === 'job-modal') {
                this.hideJobModal();
            }
        });
    }

    async loadData() {
        try {
            this.updateLastUpdate();
            await Promise.all([
                this.loadSystemStatus(),
                this.loadCronJobs()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadSystemStatus() {
        try {
            // For now, we'll simulate API calls since OpenClaw APIs might not be publicly accessible
            // In a real deployment, these would be actual API calls to the OpenClaw gateway
            
            const gatewayStatus = await this.checkGatewayStatus();
            this.updateGatewayStatus(gatewayStatus);
            
        } catch (error) {
            console.error('Error loading system status:', error);
            this.updateGatewayStatus('offline');
        }
    }

    async checkGatewayStatus() {
        try {
            const response = await fetch(`${this.apiBase}/api/status`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });
            const data = await response.json();
            return data.ok ? 'online' : 'offline';
        } catch (error) {
            console.error('Gateway status check failed:', error);
            return 'offline';
        }
    }

    updateGatewayStatus(status) {
        const statusElement = document.getElementById('gateway-status');
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `status-badge ${status}`;
    }

    async loadCronJobs() {
        try {
            const response = await fetch(`${this.apiBase}/api/cron/list`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'list',
                    includeDisabled: true
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            this.jobs = this.convertOpenClawJobs(data.jobs || []);
            this.renderJobs();
            this.updateJobsCount();
            
        } catch (error) {
            console.error('Error loading cron jobs:', error);
            this.showJobsError();
        }
    }

    convertOpenClawJobs(openclawJobs) {
        return openclawJobs.map(job => {
            let schedule = 'Unknown';
            if (job.schedule) {
                if (job.schedule.kind === 'cron') {
                    schedule = job.schedule.expr;
                } else if (job.schedule.kind === 'every') {
                    const minutes = job.schedule.everyMs / (1000 * 60);
                    schedule = `Every ${minutes}m`;
                } else if (job.schedule.kind === 'at') {
                    const date = new Date(job.schedule.atMs);
                    schedule = `At ${date.toLocaleString()}`;
                }
            }

            let nextRun = '-';
            if (job.state && job.state.nextRunAtMs) {
                nextRun = new Date(job.state.nextRunAtMs).toLocaleString();
            }

            let lastRun = '-';
            if (job.state && job.state.lastRunAtMs) {
                lastRun = new Date(job.state.lastRunAtMs).toLocaleString();
            }

            return {
                id: job.id,
                name: job.name || 'Unnamed Job',
                schedule: schedule,
                next: nextRun,
                last: lastRun,
                enabled: job.enabled !== false,
                status: job.enabled !== false ? 'enabled' : 'disabled',
                agent: job.agentId || 'main'
            };
        });
    }

    renderJobs() {
        const container = document.getElementById('jobs-container');
        
        if (this.jobs.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-info-circle"></i> No cron jobs configured
                </div>
            `;
            return;
        }

        container.innerHTML = this.jobs.map(job => `
            <div class="job-item" data-job-id="${job.id}">
                <div class="job-header">
                    <div class="job-name">${this.escapeHtml(job.name)}</div>
                    <div class="job-actions">
                        <button class="btn btn-secondary" onclick="dashboard.runJob('${job.id}')" title="Run Now">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.toggleJob('${job.id}')" title="${job.enabled ? 'Disable' : 'Enable'}">
                            <i class="fas fa-${job.enabled ? 'pause' : 'play'}"></i>
                        </button>
                    </div>
                </div>
                <div class="job-schedule">
                    <i class="fas fa-clock"></i> ${job.schedule}
                    ${job.enabled ? 
                        `<span style="color: var(--success-color); margin-left: 10px;">
                            <i class="fas fa-circle" style="font-size: 8px;"></i> ${job.status}
                        </span>` :
                        `<span style="color: var(--danger-color); margin-left: 10px;">
                            <i class="fas fa-circle" style="font-size: 8px;"></i> ${job.status}
                        </span>`
                    }
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                    <div><strong>Agent:</strong> ${this.escapeHtml(job.agent)}</div>
                    ${job.last && job.last !== '-' ? `<div><strong>Last run:</strong> ${job.last}</div>` : ''}
                    ${job.next && job.next !== '-' ? `<div><strong>Next run:</strong> ${job.next}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    updateJobsCount() {
        const countElement = document.getElementById('jobs-count');
        const activeCount = this.jobs.filter(job => job.enabled).length;
        countElement.textContent = `${this.jobs.length} jobs (${activeCount} active)`;
        
        const activeJobsElement = document.getElementById('active-jobs-count');
        activeJobsElement.textContent = activeCount.toString();
    }

    showJobsError() {
        const container = document.getElementById('jobs-container');
        container.innerHTML = `
            <div class="loading" style="color: var(--danger-color);">
                <i class="fas fa-exclamation-triangle"></i> Failed to load cron jobs
            </div>
        `;
    }

    showJobModal(job = null) {
        const modal = document.getElementById('job-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('job-form');
        
        if (job) {
            title.textContent = 'Edit Cron Job';
            document.getElementById('job-name').value = job.name;
            document.getElementById('job-schedule').value = job.schedule;
            document.getElementById('job-command').value = job.command;
            document.getElementById('job-description').value = job.description || '';
            form.dataset.editingId = job.id;
        } else {
            title.textContent = 'New Cron Job';
            form.reset();
            delete form.dataset.editingId;
        }
        
        modal.classList.add('show');
    }

    hideJobModal() {
        const modal = document.getElementById('job-modal');
        modal.classList.remove('show');
        document.getElementById('job-form').reset();
    }

    async handleJobSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const jobData = {
            name: document.getElementById('job-name').value,
            schedule: document.getElementById('job-schedule').value,
            command: document.getElementById('job-command').value,
            description: document.getElementById('job-description').value,
            enabled: true
        };

        try {
            if (form.dataset.editingId) {
                await this.updateJob(form.dataset.editingId, jobData);
                this.addActivity(`Updated job: ${jobData.name}`);
            } else {
                await this.createJob(jobData);
                this.addActivity(`Created job: ${jobData.name}`);
            }
            
            this.hideJobModal();
            this.loadCronJobs();
            
        } catch (error) {
            console.error('Error saving job:', error);
            this.showError('Failed to save job');
        }
    }

    async createJob(jobData) {
        // Simulate API call to create job
        // In real implementation: POST /api/cron/jobs
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ id: Date.now().toString(), ...jobData });
                } else {
                    reject(new Error('Failed to create job'));
                }
            }, 500);
        });
    }

    async updateJob(id, jobData) {
        // Simulate API call to update job
        // In real implementation: PUT /api/cron/jobs/{id}
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({ id, ...jobData });
                } else {
                    reject(new Error('Failed to update job'));
                }
            }, 500);
        });
    }

    async editJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (job) {
            this.showJobModal(job);
        }
    }

    async toggleJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const action = job.enabled ? 'remove' : 'update'; // OpenClaw uses remove/update instead of disable/enable
            const response = await fetch(`${this.apiBase}/api/cron/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: action,
                    jobId: id,
                    patch: action === 'update' ? { enabled: !job.enabled } : undefined
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.addActivity(`${!job.enabled ? 'Enabled' : 'Disabled'} job: ${job.name}`);
            
            // Reload jobs to get updated status
            await this.loadCronJobs();
            
        } catch (error) {
            console.error('Error toggling job:', error);
            this.showError('Failed to toggle job');
        }
    }

    async runJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const response = await fetch(`${this.apiBase}/api/cron/run`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'run',
                    jobId: id
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.addActivity(`Triggered job: ${job.name}`);
            
        } catch (error) {
            console.error('Error running job:', error);
            this.showError('Failed to run job');
        }
    }

    async deleteJob(id) {
        const job = this.jobs.find(j => j.id === id);
        if (!job) return;

        if (!confirm(`Are you sure you want to delete the job "${job.name}"?`)) {
            return;
        }

        try {
            // Simulate API call to delete job
            // In real implementation: DELETE /api/cron/jobs/{id}
            this.jobs = this.jobs.filter(j => j.id !== id);
            this.renderJobs();
            this.updateJobsCount();
            
            this.addActivity(`Deleted job: ${job.name}`);
            
        } catch (error) {
            console.error('Error deleting job:', error);
            this.showError('Failed to delete job');
        }
    }

    updateLastUpdate() {
        this.lastUpdate = new Date();
        const element = document.getElementById('last-update');
        element.textContent = this.formatTime(this.lastUpdate);
    }

    addActivity(description) {
        const container = document.getElementById('activity-container');
        const now = new Date();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${this.formatTime(now)}</span>
            <span class="activity-description">${this.escapeHtml(description)}</span>
        `;
        
        container.insertBefore(activityItem, container.firstChild);
        
        // Keep only last 20 items
        while (container.children.length > 20) {
            container.removeChild(container.lastChild);
        }
    }

    showError(message) {
        this.addActivity(`Error: ${message}`);
        console.error(message);
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return 'Invalid date';
        }
    }

    formatTime(date) {
        try {
            return date.toLocaleTimeString();
        } catch {
            return 'Invalid time';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AutomationDashboard();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomationDashboard;
}