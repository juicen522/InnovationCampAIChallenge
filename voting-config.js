// ===== Voting System Configuration =====
const VOTING_CONFIG = {
    SUPABASE_URL: 'local-storage',
    SUPABASE_ANON_KEY: 'local-development',
    VOTING_PAGE_URL: 'https://juicen522.github.io/InnovationCampAIChallenge/vote.html',
    ADMIN_PASSWORD: 'admin123',
    VOTING_TIME_LIMIT_SECONDS: 120,
    VOTES_PER_AWARD: 2,
    AWARDS: [
        { id: 'bestCreative', name: '最佳创意奖', icon: 'fa-palette' },
        { id: 'promptMaster', name: '最佳影片奖', icon: 'fa-film' }
    ],
    CANDIDATES: [
        { id: 1, name: '林秀组', color: '#FF8C42' },
        { id: 2, name: '石奇组', color: '#2E86AB' },
        { id: 3, name: '泉甘组', color: '#A23B72' },
        { id: 4, name: '茶香组', color: '#F18F01' },
        { id: 5, name: '佛圣组', color: '#27AE60' }
    ]
};

// ===== Local Storage Data Adapter =====
const SupabaseAPI = {
    STORAGE_KEY: 'ai_prompt_challenge_db',

    getHeaders() {
        return {
            'Content-类型': 'application/json',
            'Prefer': 'return=representation'
        };
    },

    getDefaultDb() {
        return {
            votes: [],
            voting_session: [
                {
                    id: 1,
                    is_active: true,
                    isActive: true,
                    created_at: new Date().toISOString()
                }
            ]
        };
    },

    readDb() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return this.getDefaultDb();
            const parsed = JSON.parse(stored);
            return {
                votes: Array.isArray(parsed.votes) ? parsed.votes : [],
                voting_session: Array.isArray(parsed.voting_session) && parsed.voting_session.length
                    ? parsed.voting_session.map(session => ({
                        ...session,
                        is_active: session.is_active ?? session.isActive ?? true,
                        isActive: session.isActive ?? session.is_active ?? true
                    }))
                    : this.getDefaultDb().voting_session
            };
        } catch (error) {
            console.warn('Failed to read local voting database:', error);
            return this.getDefaultDb();
        }
    },

    writeDb(db) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    },

    parseQuery(params = '') {
        if (typeof params !== 'string') return params || {};
        return Object.fromEntries(new URLSearchParams(params));
    },

    applyQuery(rows, params = '') {
        const query = this.parseQuery(params);
        let result = [...rows];

        Object.entries(query).forEach(([key, value]) => {
            if (key === 'order' || key === 'limit') return;
            if (typeof value === 'string' && value.startsWith('eq.')) {
                const expected = value.slice(3);
                result = result.filter(row => String(row[key]) === expected);
            }
        });

        if (query.order) {
            const [field, direction = 'asc'] = String(query.order).split('.');
            result.sort((a, b) => {
                const left = a[field] || '';
                const right = b[field] || '';
                return direction === 'desc'
                    ? String(right).localeCompare(String(left))
                    : String(left).localeCompare(String(right));
            });
        }

        if (query.limit) {
            result = result.slice(0, Number(query.limit));
        }

        return result;
    },

    async query(table, params = '') {
        const db = this.readDb();
        return this.applyQuery(db[table] || [], params);
    },

    async create(table, data) {
        const db = this.readDb();
        const rows = db[table] || [];
        const row = {
            id: data.id || Date.now(),
            created_at: data.created_at || new Date().toISOString(),
            ...data
        };
        if (table === 'voting_session') {
            row.is_active = data.is_active ?? data.isActive ?? true;
            row.isActive = row.is_active;
        }
        rows.push(row);
        db[table] = rows;
        this.writeDb(db);
        return [row];
    },

    async update(table, column, value, data) {
        const db = this.readDb();
        const rows = db[table] || [];
        const updated = [];
        db[table] = rows.map(row => {
            if (String(row[column]) !== String(value)) return row;
            const next = { ...row, ...data };
            if (table === 'voting_session') {
                next.is_active = data.is_active ?? data.isActive ?? next.is_active ?? true;
                next.isActive = next.is_active;
            }
            updated.push(next);
            return next;
        });
        this.writeDb(db);
        return updated;
    },

    async delete(table, column, value) {
        const db = this.readDb();
        const rows = db[table] || [];
        const removed = rows.filter(row => String(row[column]) === String(value));
        db[table] = rows.filter(row => String(row[column]) !== String(value));
        this.writeDb(db);
        return removed;
    },

    async checkVoted(sessionId) {
        const votes = await this.getAllVotes();
        return votes.some(vote => vote.voter_session_id === sessionId);
    },

    async getVotingSession() {
        const sessions = await this.query('voting_session', 'order=created_at.desc&limit=1');
        return sessions.length ? sessions[0] : this.getDefaultDb().voting_session[0];
    },

    async getAllVotes() {
        return this.query('votes', 'order=created_at.desc');
    },

    async deleteAllVotes() {
        const db = this.readDb();
        const deleted = db.votes || [];
        db.votes = [];
        this.writeDb(db);
        sessionStorage.removeItem('has_voted');
        return deleted;
    }
};

// ===== Session Management =====
const SessionManager = {
    STORAGE_KEY: 'voter_session_id',

    getSessionId() {
        let sessionId = localStorage.getItem(this.STORAGE_KEY);
        if (!sessionId) {
            sessionId = this.generateId();
            localStorage.setItem(this.STORAGE_KEY, sessionId);
        }
        return sessionId;
    },

    generateId() {
        return 'vs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    },

    hasVoted() {
        return sessionStorage.getItem('has_voted') === 'true';
    },

    markAsVoted() {
        sessionStorage.setItem('has_voted', 'true');
    }
};
