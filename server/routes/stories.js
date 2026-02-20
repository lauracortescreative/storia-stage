import express from 'express';
import supabase from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stories — get all saved stories for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('id, data, is_public, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Return the data field (the full StoryResult JSON) for each story
        res.json(data.map(s => ({ ...s.data, id: s.id, isSaved: true })));
    } catch (err) {
        console.error('Get stories error:', err);
        res.status(500).json({ error: 'Failed to load stories' });
    }
});

// POST /api/stories — save a story
router.post('/', authenticateToken, async (req, res) => {
    const story = req.body;

    if (!story || !story.id) {
        return res.status(400).json({ error: 'Invalid story data' });
    }

    try {
        const { error } = await supabase
            .from('stories')
            .upsert({
                id: story.id,
                user_id: req.user.id,
                data: story,
                is_public: false
            });

        if (error) throw error;
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Save story error:', err);
        res.status(500).json({ error: 'Failed to save story' });
    }
});

// DELETE /api/stories/:id — delete a story
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('stories')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id); // ensure user owns it

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete story error:', err);
        res.status(500).json({ error: 'Failed to delete story' });
    }
});

export default router;
