/**
 * Nexus AI - Graph & Visualization Engine
 * Handles network rendering and topological queries.
 */

const graphEngine = {
    network: null,
    nodes: new vis.DataSet([]),
    edges: new vis.DataSet([]),
    nodesMeta: {}, // Stores category and other static info
    
    init() {
        const container = document.getElementById('network-graph');
        const data = { nodes: this.nodes, edges: this.edges };
        
        const options = {
            nodes: {
                shape: 'dot',
                size: 24,
                font: { size: 14, color: '#ffffff', face: 'Inter' },
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 5, x: 2, y: 2 }
            },
            edges: {
                width: 2,
                color: { color: 'rgba(255, 255, 255, 0.1)', highlight: '#00F0FF', hover: '#00F0FF' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                smooth: { type: 'cubicBezier', roundness: 0.5 }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -150,
                    centralGravity: 0.015,
                    springLength: 120,
                    springConstant: 0.08
                },
                solver: 'forceAtlas2Based',
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true
            }
        };

        this.network = new vis.Network(container, data, options);
        this.setupEvents();
    },

    build() {
        this.nodes.clear();
        this.edges.clear();
        this.nodesMeta = {};

        // 1. Add Individuals (Blue)
        NEXUS_DATA.individuals.forEach(ind => {
            this.nodes.add({
                id: ind.id,
                label: ind.name,
                color: { background: '#0A0A0A', border: '#00F0FF' },
                category: 'Individual'
            });
            this.nodesMeta[ind.id] = { category: 'Individual', name: ind.name };
        });

        // 2. Add Businesses (Purple)
        NEXUS_DATA.businesses.forEach(biz => {
            this.nodes.add({
                id: biz.id,
                label: biz.name,
                color: { background: '#0A0A0A', border: '#8A2BE2' },
                category: 'Business'
            });
            this.nodesMeta[biz.id] = { category: 'Business', name: biz.name };

            // Add Ownership Edges (dotted)
            biz.owners.forEach(ownerId => {
                this.edges.add({
                    from: ownerId,
                    to: biz.id,
                    label: 'Owner',
                    dashes: true,
                    font: { size: 10, color: '#A0A0A0' },
                    color: { color: 'rgba(138, 43, 226, 0.3)' }
                });
            });
        });

        // 3. Add Transactions
        NEXUS_DATA.transactions.forEach((trx, index) => {
            this.edges.add({
                id: `trx_${index}`,
                from: trx.from,
                to: trx.to,
                label: `$${(trx.amount / 1000).toFixed(0)}k`,
                font: { size: 10, color: '#A0A0A0', align: 'top' }
            });
        });
        
        // Update Sidebar Stats
        document.getElementById('status-nodes').innerText = `Nodes: ${this.nodes.length}`;
        document.getElementById('status-edges').innerText = `Edges: ${this.edges.length}`;
    },

    setupEvents() {
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                this.showNodeDetails(params.nodes[0]);
                this.focusOnNode(params.nodes[0]);
            } else {
                app.closeDetails();
                this.resetFocus();
            }
        });
    },

    /**
     * Topology Queries
     */
    getAllNodes() {
        return this.nodes.getIds();
    },

    getNodeName(id) {
        return this.nodesMeta[id]?.name || id;
    },

    getConnectionCount(nodeId) {
        return this.network.getConnectedNodes(nodeId).length;
    },

    detect3StepLoop(startNode) {
        // A simple DFS to find a 3-step cycle (A -> B -> C -> A)
        const neighbors = this.network.getConnectedNodes(startNode, 'to');
        
        for (const b of neighbors) {
            const bNeighbors = this.network.getConnectedNodes(b, 'to');
            for (const c of bNeighbors) {
                const cNeighbors = this.network.getConnectedNodes(c, 'to');
                if (cNeighbors.includes(startNode)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Visual Interactions
     */
    showNodeDetails(id) {
        const result = fraudEngine.results[id];
        const meta = this.nodesMeta[id];
        if (!result) return;

        document.getElementById('detail-name').innerText = meta.name;
        document.getElementById('detail-category').innerText = meta.category;
        document.getElementById('detail-score').innerText = `${result.score}%`;
        
        const bar = document.getElementById('detail-bar');
        bar.style.width = `${result.score}%`;
        bar.style.display = 'block';
        bar.style.background = fraudEngine.getRiskColor(result.score);
        document.getElementById('detail-score').style.color = fraudEngine.getRiskColor(result.score);

        const reasonContainer = document.getElementById('detail-reasons');
        reasonContainer.innerHTML = '';
        
        if (result.reasons.length === 0) {
            reasonContainer.innerHTML = '<p class="empty-msg">No suspicious patterns detected for this entity.</p>';
        } else {
            result.reasons.forEach(r => {
                const div = document.createElement('div');
                div.className = 'reason-pill';
                div.innerHTML = `<strong>${r.rule}</strong> <span>${r.text}</span>`;
                reasonContainer.appendChild(div);
            });
        }

        document.getElementById('details-panel').style.display = 'block';
    },

    focusOnNode(nodeId) {
        const allNodes = this.nodes.get();
        const connectedNodes = this.network.getConnectedNodes(nodeId);
        
        const updates = allNodes.map(node => {
            const isRelated = node.id === nodeId || connectedNodes.includes(node.id);
            return {
                id: node.id,
                opacity: isRelated ? 1.0 : 0.1
            };
        });
        
        this.nodes.update(updates);
    },

    resetFocus() {
        const allNodes = this.nodes.get();
        this.nodes.update(allNodes.map(n => ({ id: n.id, opacity: 1.0 })));
    },

    highlightRiskyNodes(results) {
        const updates = [];
        Object.entries(results).forEach(([id, res]) => {
            if (res.score >= 70) {
                updates.push({
                    id: id,
                    shadow: { enabled: true, color: '#FF3B3B', size: 20 },
                    borderWidth: 4,
                    color: { border: '#FF3B3B' }
                });
            } else if (res.score >= 40) {
                updates.push({
                    id: id,
                    color: { border: '#FFD700' },
                    borderWidth: 3
                });
            }
        });
        this.nodes.update(updates);
    }
};
