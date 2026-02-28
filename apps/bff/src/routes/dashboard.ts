import { Router, Request, Response } from 'express';
import { DashboardData, DashboardRequest } from '@saas/shared-types';

const router = Router();

router.post('/dashboard', async (req: Request, res: Response) => {
  try {
    const payload = req.body as DashboardRequest;
    const email = payload?.user?.email?.toLowerCase().trim();
    const name = payload?.user?.name || 'there';

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'user.email is required',
      });
    }

    const dashboard: DashboardData = {
      welcomeMessage: `Welcome back, ${name}!`,
      kpiCards: [
        { label: 'Total Revenue', value: '$328,420', delta: '+12.4%', trend: 'up' },
        { label: 'Active Users', value: '24,981', delta: '+8.2%', trend: 'up' },
        { label: 'Conversion Rate', value: '5.62%', delta: '-0.6%', trend: 'down' },
        { label: 'Avg. Order Value', value: '$57.18', delta: '+3.1%', trend: 'up' },
      ],
      revenueSeries: [65, 52, 78, 83, 70, 91, 88, 72, 95, 86, 99, 92],
      channelBreakdown: [
        { label: 'Organic Search', value: 38 },
        { label: 'Paid Ads', value: 27 },
        { label: 'Direct', value: 19 },
        { label: 'Referral', value: 16 },
      ],
      topCampaigns: [
        { name: 'Spring Promo', spend: '$8,240', roas: '4.9x' },
        { name: 'Retargeting Q1', spend: '$5,120', roas: '4.1x' },
        { name: 'New Users Push', spend: '$3,880', roas: '3.7x' },
        { name: 'Brand Lift', spend: '$2,640', roas: '3.2x' },
      ],
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error building dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
    });
  }
});

export default router;
