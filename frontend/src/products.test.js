import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react';
import Products from './components/products';

describe('Products Component', () => {
  const mockProducts = [{ id: 1, name: 'Product A', price: 10 }];
  const mockAddToCart = jest.fn();

  it('should render product list', () => {
    render(<Products products={mockProducts} onAddToCart={mockAddToCart} />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
  });

  it('should call onAddToCart when add button is clicked', () => {
    render(<Products products={mockProducts} onAddToCart={mockAddToCart} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
  });
});
