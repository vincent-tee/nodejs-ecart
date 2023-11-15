import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItems from './components/cartItems';

describe('CartItems Component', () => {
  const mockItems = [
    { id: 1, name: 'Item A', quantity: 2 },
    { id: 2, name: 'Item B', quantity: 3 }
  ];
  const mockOnDecreaseQuantity = jest.fn();

  it('should render cart items', () => {
    render(<CartItems items={mockItems} onDecreaseQuantity={mockOnDecreaseQuantity} />);
    expect(screen.getByText(/Item A/)).toBeInTheDocument();
    expect(screen.getByText(/Item B/)).toBeInTheDocument();
  });

  it('should handle empty cart items', () => {
    render(<CartItems items={[]} onDecreaseQuantity={mockOnDecreaseQuantity} />);
    expect(screen.queryByText(/Item A/)).not.toBeInTheDocument();
  });

  it('should call onDecreaseQuantity when decrease button is clicked', () => {
    render(<CartItems items={mockItems} onDecreaseQuantity={mockOnDecreaseQuantity} />);
    const decreaseButtons = screen.getAllByText('-');
    fireEvent.click(decreaseButtons[0]);
    expect(mockOnDecreaseQuantity).toHaveBeenCalledWith(mockItems[0].id, mockItems[0].quantity);
  });
});
