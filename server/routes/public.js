import express from 'express';
import supabase from '../db/supabase.js';

const router = express.Router();

// GET /api/public-stories — returns stories marked as public
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('id, data, created_at')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data.map(s => ({ ...s.data, id: s.id })));
    } catch (err) {
        console.error('Public stories error:', err);
        res.status(500).json({ error: 'Failed to load public stories' });
    }
});

export default router;
