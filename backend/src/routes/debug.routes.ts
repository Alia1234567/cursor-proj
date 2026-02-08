import { Router } from 'express';
import { getStorageInfo } from '../services/tokenStorage';

const router = Router();

/**
 * GET /api/debug/storage
 * Shows which storage mode is active and token counts
 * Safe to expose - no sensitive data
 */
router.get('/storage', async (req, res) => {
  try {
    const info = await getStorageInfo();
    res.json({
      success: true,
      storage: info,
      note: info.mode === 'in-memory' ? 'Data is in RAM. Restart clears it.' : 'Data persists in PostgreSQL.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get storage info',
    });
  }
});

export default router;
