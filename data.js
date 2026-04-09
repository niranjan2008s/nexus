/**
 * Nexus AI - Built-in Demo Dataset
 * Fixed data to ensure reliable fraud detection demonstration.
 */

const NEXUS_DATA = {
    individuals: [
        { id: 'ind_1', name: 'James Sterling' },
        { id: 'ind_2', name: 'Elena Vance' },
        { id: 'ind_3', name: 'Arthur Penhaligon' }, // THE PRIMARY TARGET (100% Risk)
        { id: 'ind_4', name: 'Sarah Connor' },
        { id: 'ind_5', name: 'Marcus Wright' },
        { id: 'ind_6', name: 'Kyle Reese' },
        { id: 'ind_7', name: 'John Matrix' }
    ],
    businesses: [
        { id: 'biz_1', name: 'Sterling Holdings', owners: ['ind_1'] },
        { id: 'biz_2', name: 'Vance Tech Ops', owners: ['ind_2'] },
        { id: 'biz_3', name: 'Nexus Shell A', owners: ['ind_3'] }, 
        { id: 'biz_4', name: 'Nexus Shell B', owners: ['ind_3'] }, 
        { id: 'biz_5', name: 'Nexus Shell C', owners: ['ind_3'] }, 
        { id: 'biz_6', name: 'Global Logistics', owners: ['ind_6'] }
    ],
    transactions: [
        // The Circular Loop (ind_3 -> biz_3 -> biz_4 -> ind_3) -> 3-step loop
        { from: 'ind_3', to: 'biz_3', amount: 450000, timestamp: '2024-03-01' },
        { from: 'biz_3', to: 'biz_4', amount: 420000, timestamp: '2024-03-02' },
        { from: 'biz_4', to: 'ind_3', amount: 410000, timestamp: '2024-03-03' },
        
        // Interconnected shell businesses
        { from: 'biz_4', to: 'biz_5', amount: 50000, timestamp: '2024-03-04' },
        { from: 'biz_5', to: 'biz_3', amount: 50000, timestamp: '2024-03-05' },

        // High connection links for ind_3 (> 4 connections)
        { from: 'ind_3', to: 'ind_1', amount: 25000, timestamp: '2024-02-01' },
        { from: 'ind_3', to: 'ind_2', amount: 15000, timestamp: '2024-02-05' },
        { from: 'ind_3', to: 'ind_4', amount: 5000, timestamp: '2024-02-10' },

        // Normal activity
        { from: 'ind_1', to: 'biz_1', amount: 12000, timestamp: '2024-01-05' },
        { from: 'ind_2', to: 'biz_2', amount: 8000, timestamp: '2024-01-08' },
        { from: 'ind_4', to: 'biz_6', amount: 5000, timestamp: '2024-01-12' },
        { from: 'ind_5', to: 'biz_6', amount: 4500, timestamp: '2024-01-15' },
        { from: 'biz_1', to: 'biz_2', amount: 15000, timestamp: '2024-01-20' },
        { from: 'ind_6', to: 'biz_6', amount: 3000, timestamp: '2024-02-10' },
        { from: 'ind_7', to: 'ind_6', amount: 1000, timestamp: '2024-02-15' }
    ]
};
