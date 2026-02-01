/**
 * OpenClaw Automation Dashboard
 * Main JavaScript functionality for managing cron jobs and system status
 */

class AutomationDashboard {
    constructor() {
        this.apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000' 
            : 'https://api.openclaw.dev';
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
        document.getElementById('new-job-btn').addEventListener('click', () => this.showJobModal());
        
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
        // Simulate checking gateway status
        // In real implementation, this would be: GET /api/gateway/status
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(Math.random() > 0.2 ? 'online' : 'offline');
            }, 500);
        });
    }

    updateGatewayStatus(status) {
        const statusElement = document.getElementById('gateway-status');
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `status-badge ${status}`;
    }

    async loadCronJobs() {
        try {
            // Simulate loading cron jobs
            // In real implementation: GET /api/cron/jobs
            const mockJobs = await this.getMockJobs();
            this.jobs = mockJobs;
            this.renderJobs();
            this.updateJobsCount();
            
        } catch (error) {
            console.error('Error loading cron jobs:', error);
            this.showJobsError();
        }
    }

    async getMockJobs() {
        // Mock data for demonstration
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: '1',
                        name: 'Daily Backup',
                        schedule: '0 2 * * *',
                        command: 'openclaw backup --daily',
                        description: 'Performs daily system backup',
                        enabled: true,
                        lastRun: '2024-01-15T02:00:00Z',
                        nextRun: '2024-01-16T02:00:00Z'
                    },
                    {
                        id: '2',
                        name: 'Weather Update',
                        schedule: '0 */6 * * *',
                        command: 'openclaw weather --update',
                        description: 'Updates weather information every 6 hours',
                        enabled: true,
                        lastRun: '2024-01-15T12:00:00Z',
                        nextRun: '2024-01-15T18:00:00Z'
                    },
                    {
                        id: '3',
                        name: 'System Monitor',
                        schedule: '*/15 * * * *',
                        command: 'openclaw monitor --check-all',
                        description: 'Monitors system health every 15 minutes',
                        enabled: false,
                        lastRun: '2024-01-15T14:45:00Z',
                        nextRun: null
                    }
                ]);
            }, 300);
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
                        <button class="btn btn-primary" onclick="dashboard.editJob('${job.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-secondary" onclick="dashboard.toggleJob('${job.id}')">
                            <i class="fas fa-${job.enabled ? 'pause' : 'play'}"></i>
                        </button>
                        <button class="btn btn-danger" onclick="dashboard.deleteJob('${job.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="job-schedule">
                    <i class="fas fa-clock"></i> ${job.schedule}
                    ${job.enabled ? 
                        `<span style="color: var(--success-color); margin-left: 10px;">
                            <i class="fas fa-circle" style="font-size: 8px;"></i> Active
                        </span>` :
                        `<span style="color: var(--danger-color); margin-left: 10px;">
                            <i class="fas fa-circle" style="font-size: 8px;"></i> Disabled
                        </span>`
                    }
                </div>
                <div class="job-description">${this.escapeHtml(job.description || 'No description')}</div>
                <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
                    <div><strong>Command:</strong> <code>${this.escapeHtml(job.command)}</code></div>
                    ${job.lastRun ? `<div><strong>Last run:</strong> ${this.formatDate(job.lastRun)}</div>` : ''}
                    ${job.nextRun ? `<div><strong>Next run:</strong> ${this.formatDate(job.nextRun)}</div>` : ''}
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
            // Simulate API call to toggle job
            // In real implementation: POST /api/cron/jobs/{id}/toggle
            job.enabled = !job.enabled;
            this.renderJobs();
            this.updateJobsCount();
            
            this.addActivity(`${job.enabled ? 'Enabled' : 'Disabled'} job: ${job.name}`);
            
        } catch (error) {
            console.error('Error toggling job:', error);
            this.showError('Failed to toggle job');
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