import express from 'express';
import supabase from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error) throw error;

        res.json({
            plan: data.plan,
            monthlyUsed: data.monthly_used,
            monthlyLimit: data.monthly_limit,
            bundlesRemaining: data.bundles_remaining,
            totalGenerated: data.total_generated,
            nextResetDate: data.next_reset_date
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// PUT /api/stats
router.put('/', authenticateToken, async (req, res) => {
    const { plan, monthlyUsed, monthlyLimit, bundlesRemaining, totalGenerated, nextResetDate } = req.body;

    try {
        const updates = {};
        if (plan !== undefined) updates.plan = plan;
        if (monthlyUsed !== undefined) updates.monthly_used = monthlyUsed;
        if (monthlyLimit !== undefined) updates.monthly_limit = monthlyLimit;
        if (bundlesRemaining !== undefined) updates.bundles_remaining = bundlesRemaining;
        if (totalGenerated !== undefined) updates.total_generated = totalGenerated;
        if (nextResetDate !== undefined) updates.next_reset_date = nextResetDate;

        const { error } = await supabase
            .from('user_stats')
            .update(updates)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Update stats error:', err);
        res.status(500).json({ error: 'Failed to update stats' });
    }
});

export default router;
