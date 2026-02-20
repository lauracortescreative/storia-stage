import supabase from '../db/supabase.js';

/**
 * Verifies a Supabase JWT access_token from the Authorization header.
 * Sets req.user = { id, email } on success.
 */
export async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = { id: data.user.id, email: data.user.email };
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
