import React from 'react';
import { render, screen } from '@testing-library/react';
import Promotions from './components/promotions';

describe('Promotions Component', () => {
  const mockPromotions = [
    { id: 1, description: '10% off on all products' },
    { id: 2, description: 'Free shipping on orders over $50' }
  ];

  it('should render promotions', () => {
    render(<Promotions promotions={mockPromotions} />);
    expect(screen.getByText('10% off on all products')).toBeInTheDocument();
    expect(screen.getByText('Free shipping on orders over $50')).toBeInTheDocument();
  });

  it('should handle empty promotions', () => {
    render(<Promotions promotions={[]} />);
    expect(screen.queryByText('10% off on all products')).not.toBeInTheDocument();
  });
});
