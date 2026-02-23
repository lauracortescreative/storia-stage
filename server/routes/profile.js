import express from 'express';
import supabase from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/profile — fetch child profile for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('child_profiles')
            .select('child_name, child_age, child_avatar')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

        if (!data) {
            return res.json({ childName: '', childAge: null, childAvatar: '' });
        }

        res.json({
            childName: data.child_name || '',
            childAge: data.child_age || null,
            childAvatar: data.child_avatar || '',
        });
    } catch (err) {
        console.error('Get profile error:', err.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/profile — upsert child profile for the logged-in user
router.put('/', authenticateToken, async (req, res) => {
    const { childName, childAge, childAvatar } = req.body;

    try {
        const { error } = await supabase
            .from('child_profiles')
            .upsert({
                user_id: req.user.id,
                child_name: childName || null,
                child_age: childAge || null,
                child_avatar: childAvatar || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Save profile error:', err.message);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

export default router;
