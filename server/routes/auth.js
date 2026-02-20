import express from 'express';
import supabase from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register — use Supabase built-in auth
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: true  // skip email verification for now
        });

        if (error) {
            if (error.message.includes('already registered') || error.message.includes('already exists')) {
                return res.status(409).json({ error: 'An account with this email already exists' });
            }
            throw error;
        }

        const userId = data.user.id;

        // Create default stats row
        await supabase.from('user_stats').upsert({
            user_id: userId,
            plan: 'free',
            monthly_used: 0,
            monthly_limit: 5,
            bundles_remaining: 0,
            total_generated: 0,
            next_reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()
        });

        // Sign in to get a session token we can return as JWT
        const { data: session, error: signInErr } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email.toLowerCase()
        });

        // Instead, use signInWithPassword to get an access_token
        const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password
        });

        if (signInError) throw signInError;

        res.status(201).json({
            token: signIn.session.access_token,
            user: { id: userId, email: data.user.email }
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: err.message || 'Registration failed. Please try again.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password
        });

        if (error) return res.status(401).json({ error: 'Invalid email or password' });

        res.json({
            token: data.session.access_token,
            user: { id: data.user.id, email: data.user.email }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// PUT /api/auth/email
router.put('/email', authenticateToken, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
            email: email.toLowerCase()
        });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Update email error:', err.message);
        res.status(500).json({ error: 'Failed to update email' });
    }
});

// DELETE /api/auth/account
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        // Delete stories and stats first (cascade would need FK, so do manually)
        await supabase.from('stories').delete().eq('user_id', req.user.id);
        await supabase.from('user_stats').delete().eq('user_id', req.user.id);

        // Delete the Supabase auth user
        const { error } = await supabase.auth.admin.deleteUser(req.user.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete account error:', err.message);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

export default router;
