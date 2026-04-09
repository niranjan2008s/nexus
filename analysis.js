/**
 * Nexus AI - Intelligence Detection Engine
 * Implements deterministic fraud detection rules based on network topology.
 */

const fraudEngine = {
    isAnalyzed: false,
    results: {},

    /**
     * Run the multi-rule analysis on the current dataset
     */
    runAnalysis() {
        if (!app.dataLoaded) {
            alert("No data loaded. Please return to the welcome screen and load demo data.");
            return;
        }

        const btn = document.getElementById('run-analysis-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="pulse">Processing Neural Paths...</span>';
        btn.disabled = true;

        // Reset state
        this.results = {};
        
        // Visual "Working" delay
        setTimeout(() => {
            this.detectFraud();
            this.isAnalyzed = true;
            
            // Update UI
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Update Dashboard
            this.updateDashboardUI();
            
            // Highlight Risky Nodes
            graphEngine.highlightRiskyNodes(this.results);
            
            // Generate Alerts
            this.updateAlertsFeed();
        }, 1200);
    },

    /**
     * Core Detection Logic
     */
    detectFraud() {
        const nodes = graphEngine.getAllNodes();
        
        nodes.forEach(nodeId => {
            const nodeInfo = graphEngine.nodesMeta[nodeId];
            let score = 0;
            let reasons = [];

            // Rule 1: High Connections (> 4) -> +30
            const connections = graphEngine.getConnectionCount(nodeId);
            if (connections > 4) {
                score += 30;
                reasons.push({ rule: 'R1', text: 'High number of connections', weight: 30 });
            }

            // Rule 2: Circular Transactions (3-step loops) -> +40
            const isCircular = graphEngine.detect3StepLoop(nodeId);
            if (isCircular) {
                score += 40;
                reasons.push({ rule: 'R2', text: 'Part of circular transaction (A→B→C→A)', weight: 40 });
            }

            // Rule 3: Shared Ownership (One person owns multiple businesses) -> +30
            if (nodeInfo.category === 'Individual') {
                const businessesOwned = this.getBusinessesOwnedCount(nodeId);
                if (businessesOwned > 1) {
                    score += 30;
                    reasons.push({ rule: 'R3', text: 'Owns multiple businesses', weight: 30 });
                }
            }

            this.results[nodeId] = {
                score: Math.min(score, 100),
                reasons: reasons,
                connections: connections
            };
        });
    },

    /**
     * Helper to count businesses owned by an individual
     */
    getBusinessesOwnedCount(individualId) {
        let count = 0;
        NEXUS_DATA.businesses.forEach(biz => {
            if (biz.owners.includes(individualId)) count++;
        });
        return count;
    },

    /**
     * Update Dashboard Statistics
     */
    updateDashboardUI() {
        // Calculate Peak Risk
        let maxScore = 0;
        Object.values(this.results).forEach(r => {
            if (r.score > maxScore) maxScore = r.score;
        });

        const scoreEl = document.getElementById('risk-score-number');
        const labelEl = document.getElementById('risk-score-label');
        const barFill = document.getElementById('risk-bar-fill');

        // Animate score number
        app.animateValue(scoreEl, 0, maxScore, 1000);
        
        // Update bar and color
        barFill.style.width = `${maxScore}%`;
        const color = this.getRiskColor(maxScore);
        barFill.style.background = color;
        scoreEl.style.color = color;

        if (maxScore >= 70) labelEl.innerText = 'High Risk Network';
        else if (maxScore >= 40) labelEl.innerText = 'Elevated Risk Profile';
        else labelEl.innerText = 'Low Risk Stability';
    },

    /**
     * Update Alerts Feed and Sidebar Badge
     */
    updateAlertsFeed() {
        const feed = document.getElementById('alerts-feed');
        const badge = document.getElementById('alert-badge');
        const grid = document.getElementById('alerts-grid');
        
        feed.innerHTML = '';
        if (grid) grid.innerHTML = '';
        
        let highRiskCount = 0;

        Object.entries(this.results).forEach(([id, result]) => {
            if (result.score >= 70) {
                highRiskCount++;
                const nodeName = graphEngine.getNodeName(id);
                
                // Add to side panel feed
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item glass';
                alertItem.innerHTML = `
                    <div class="alert-title">${nodeName}</div>
                    <div class="alert-reason">${result.reasons[0].text}</div>
                `;
                feed.appendChild(alertItem);

                // Add to alerts page grid if it exists
                if (grid) {
                    const alertBox = document.createElement('div');
                    alertBox.className = 'alert-box glass';
                    alertBox.innerHTML = `
                        <h3 class="neon-text">${nodeName}</h3>
                        <p style="margin-top:10px;">Risk Score: <span style="color:var(--danger);font-weight:700;">${result.score}%</span></p>
                        <div style="margin-top:15px;">
                            ${result.reasons.map(r => `<div class="reason-pill"><strong>${r.rule}:</strong> ${r.text}</div>`).join('')}
                        </div>
                    `;
                    grid.appendChild(alertBox);
                }
            }
        });

        if (highRiskCount > 0) {
            badge.innerText = highRiskCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }

        if (feed.children.length === 0) {
            feed.innerHTML = '<p class="empty-msg">No high-risk entities detected.</p>';
        }
    },

    getRiskColor(score) {
        if (score >= 70) return '#FF3B3B'; // Red
        if (score >= 40) return '#FFD700'; // Yellow/Gold
        return '#00FF9C'; // Green
    }
};
