import React from 'react';
import { render, screen } from '@testing-library/react';
import Totals from './components/totals';

describe('Totals Component', () => {
  const mockTotals = {
    subTotal: 100,
    totalDiscount: 20,
    totalPrice: 80
  };

  it('should render totals correctly', () => {
    render(<Totals totals={mockTotals} />);
    expect(screen.getByText(`Subtotal: $${mockTotals.subTotal.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Discount: -$${mockTotals.totalDiscount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Total Price: $${mockTotals.totalPrice.toFixed(2)}`)).toBeInTheDocument();
  });

  it('should handle totals with default values', () => {
    render(<Totals totals={{}} />);
    expect(screen.getByText('Subtotal: $0.00')).toBeInTheDocument();
    expect(screen.getByText('Discount: -$0.00')).toBeInTheDocument();
    expect(screen.getByText('Total Price: $0.00')).toBeInTheDocument();
  });
});
