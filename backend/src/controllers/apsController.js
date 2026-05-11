import { asyncHandler } from '../utils/asyncHandler.js';
import { getViewerToken } from '../services/apsService.js';

export const viewerToken = asyncHandler(async (_req, res) => {
  return res.json(await getViewerToken());
});
