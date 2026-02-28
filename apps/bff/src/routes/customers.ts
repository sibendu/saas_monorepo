import { Router, Request, Response } from 'express';
import { Customer, CustomersResponse, ApiResponse } from '@saas/shared-types';

const router = Router();

// Mock customer data
// In production, this would come from a database
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    company: 'Acme Corp',
    phone: '+1-555-0101',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    company: 'TechStart',
    phone: '+1-555-0102',
    status: 'active',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    email: 'info@globalsolutions.com',
    company: 'Global Solutions',
    phone: '+1-555-0103',
    status: 'pending',
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    name: 'Innovation Labs',
    email: 'contact@innovationlabs.com',
    company: 'Innovation Labs',
    phone: '+1-555-0104',
    status: 'active',
    createdAt: '2024-02-05T11:45:00Z',
  },
  {
    id: '5',
    name: 'Digital Dynamics',
    email: 'support@digitaldynamics.com',
    company: 'Digital Dynamics',
    phone: '+1-555-0105',
    status: 'inactive',
    createdAt: '2024-01-10T16:20:00Z',
  },
];

/**
 * GET /api/customers
 * Returns list of all customers
 * 
 * In production:
 * - Add pagination (page, limit)
 * - Add filtering (status, search)
 * - Add sorting
 * - Fetch from database
 */
router.get('/customers', async (req: Request, res: Response) => {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const response: CustomersResponse = {
      customers: mockCustomers,
      total: mockCustomers.length,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
    });
  }
});

/**
 * GET /api/customers/:id
 * Returns a single customer by ID
 */
router.get('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = mockCustomers.find(c => c.id === id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
    });
  }
});

export default router;
