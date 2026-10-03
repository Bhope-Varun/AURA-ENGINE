import { getInventoryAnalytics } from '../services/analyticsService.js';

export const getAnalyticsHandler = async (req, res, next) => {
  try {
    const analytics = await getInventoryAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
