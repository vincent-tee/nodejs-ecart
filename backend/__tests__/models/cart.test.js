const Cart = require('../../models/cart'); // Adjust the path to where your Cart class is located.

describe('Cart', () => {
  let dbMock;
  let cart;

  beforeEach(() => {
    // Arrange: Setup the mock database connection
    dbMock = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn()
    };
    cart = new Cart(dbMock, 1); // Assuming 1 is a dummy cartId for testing.
    cart.checkAndApplyPromotions = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    // Cleanup: Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should resolve with the new cart ID', async () => {
      // Arrange: Mock the db.run implementation
      dbMock.run.mockImplementation(function(sql, paramOrCb, cb) {
        const callback = typeof paramOrCb === 'function' ? paramOrCb : cb;
        if (!callback) throw new Error('Callback function is missing');
        const mockContext = { lastID: 123 };
        callback.call(mockContext, null);
      });

      // Act: Create a cart
      const cartId = await cart.create();

      // Assert: Expect the cart ID to match the mocked lastID
      expect(cartId).toEqual(123);
    });

    it('should reject with an error if the database operation fails', async () => {
      // Arrange: Mock the db.run to simulate an error
      const error = new Error('Database error');
      dbMock.run.mockImplementation(function(sql, paramOrCb, cb) {
        const callback = typeof paramOrCb === 'function' ? paramOrCb : cb;
        if (!callback) throw new Error('Callback function is missing');
        callback.call(this, error);
      });

      // Act & Assert: Attempt to create a cart and expect it to throw an error
      await expect(cart.create()).rejects.toEqual(error);
    });
  });

  describe('addItem', () => {
    it('correctly adds an item and applies promotions', async () => {
      // Arrange: Mock the db.get and db.run to simulate adding an item
      dbMock.get.mockImplementation((sql, params, callback) => {
        callback(null, undefined); // Simulate item not existing in cart
      });
      dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      // Act: Add item to the cart
      await cart.addItem('product-id', 2);

      // Assert: Expect the db.get and db.run to have been called with the correct SQL
      expect(dbMock.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT quantity FROM cart_items'),
        [1, 'product-id'],
        expect.any(Function)
      );
      expect(dbMock.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO cart_items'),
        [1, 'product-id', 2],
        expect.any(Function)
      );
      expect(cart.checkAndApplyPromotions).toHaveBeenCalled();
    });

    it('updates the quantity of an existing item in the cart', async () => {
      // Arrange: Mock the db.get and db.run for updating an item's quantity
      const existingQuantity = 2;
      const additionalQuantity = 1;
      const expectedNewQuantity = existingQuantity + additionalQuantity;
      const productId = 12;
      dbMock.get.mockImplementation((sql, params, callback) => {
        callback(null, { quantity: existingQuantity });
      });
      dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      // Act: Add additional quantity to an existing item in the cart
      await cart.addItem(productId, additionalQuantity);

      // Assert: Expect the db.get and db.run to have been called with the correct SQL and parameters
      expect(dbMock.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?'),
        [1, productId],
        expect.any(Function)
      );
      expect(dbMock.run).toHaveBeenCalledWith(
        "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
        [expectedNewQuantity, 1, productId],
        expect.any(Function)
      );
      expect(cart.checkAndApplyPromotions).toHaveBeenCalled();
    });
  });

    // ...

    describe('removeItem', () => {
      it('should remove an item from the cart', async () => {
        // Arrange: Mock the db.run to simulate removing an item
        dbMock.run.mockImplementation((sql, params, callback) => {
          callback(null);
        });

        // Act: Remove an item from the cart
        await cart.removeItem('product-id');

        // Assert: Expect the db.run to have been called with the correct SQL
        expect(dbMock.run).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM cart_items'),
          [1, 'product-id'],
          expect.any(Function)
        );
        expect(cart.checkAndApplyPromotions).toHaveBeenCalled();
      });
    });

    describe('listItems', () => {
      it('should list all items in the cart', async () => {
        // Arrange: Mock the db.all to simulate listing items
        dbMock.all.mockImplementation((sql, params, callback) => {
          callback(null, [
            { product_id: 'product-id', quantity: 2 },
            { product_id: 'product-id-2', quantity: 1 }
          ]);
        });

        // Act: List items from the cart
        const items = await cart.listItems();

        // Assert: Expect the items to be a list of products in the cart
        expect(items).toEqual([
          { product_id: 'product-id', quantity: 2 },
          { product_id: 'product-id-2', quantity: 1 }
        ]);
      });
    });

    describe('checkAndApplyPromotions', () => {
      it('applies promotions when conditions are met', async () => {
        // Arrange: Mock promotion-related methods
        const allPromotions = [
          { id: 'promo1', type: 'multi-buy', required_quantity: 2 },
          { id: 'promo2', type: 'basket-total', threshold_price: 100 }
        ];
        const cartPromotions = [
          { id: 'promo1', cart_id: 1 },
          { id: 'promo2', cart_id: 1 }
        ];
        const cartItems = [{ id: 'item1', price: 50, quantity: 3 }];

        cart.loadAllPromotions = jest.fn().mockResolvedValue(allPromotions);
        cart.loadCartPromotions = jest.fn().mockResolvedValue(cartPromotions);
        cart.listItems = jest.fn().mockResolvedValue(cartItems);
        cart.isPromotionApplicable = jest.fn()
          .mockImplementationOnce(() => true) // Simulate first promotion being applicable
          .mockImplementationOnce(() => false); // Simulate second promotion not being applicable
        cart.addPromotion = jest.fn().mockResolvedValue();
        cart.removePromotion = jest.fn().mockResolvedValue();

        cart.checkAndApplyPromotions = Cart.prototype.checkAndApplyPromotions.bind(cart);

        // Act: Check and apply promotions
        await cart.checkAndApplyPromotions();

        // Assert: Verify that promotion-related methods were called correctly
        expect(cart.loadAllPromotions).toHaveBeenCalled();
        expect(cart.loadCartPromotions).toHaveBeenCalled();
        expect(cart.listItems).toHaveBeenCalled();
        expect(cart.isPromotionApplicable).toHaveBeenNthCalledWith(1, allPromotions[0], cartItems);
        expect(cart.isPromotionApplicable).toHaveBeenNthCalledWith(2, allPromotions[1], cartItems);
        expect(cart.addPromotion).not.toHaveBeenCalledWith('promo1');
        expect(cart.removePromotion).toHaveBeenCalledWith('promo2');
      });
    });

    describe('calculatePromotionDiscount', () => {
      it('should calculate multi-buy promotion discount if the correct quantity is reached', () => {
        // Arrange: Define a multi-buy promotion and items that trigger the promotion
        const promotion = { type: 'multi-buy', target_product_id: 'item1', required_quantity: 3, discount_price: 75 };
        const items = [{ id: 'item1', price: 30, quantity: 3 }];

        // Act: Calculate the promotion discount
        const discount = cart.calculatePromotionDiscount(promotion, items);

        // Assert: Expect the discount to be calculated correctly
        expect(discount).toBe(15);
      });

      it('should not apply basket-total promotion discount if the cart total is not high enough', () => {
        // Arrange: Define a basket-total promotion and items that do not trigger the promotion
        const promotion = { type: 'basket-total', threshold_price: 150, discount_amount: 20 };
        const items = [{ id: 'item1', price: 30, quantity: 4 }];

        // Act: Calculate the promotion discount
        const discount = cart.calculatePromotionDiscount(promotion, items);

        // Assert: Expect no discount to be applied
        expect(discount).toBe(0);
      });
    });

    describe('total', () => {
      it('should calculate the total price of the cart', async () => {
        // Arrange: Mock the db.all to return items and mock calculateTotalDiscount
        dbMock.all.mockImplementation((sql, params, cb) => cb(null, [
          { price: 30, quantity: 3 },
          { price: 20, quantity: 2 }
        ]));
        cart.calculateTotalDiscount = jest.fn().mockResolvedValue(15);

        // Act: Calculate the total price of the cart
        const result = await cart.total();

        // Assert: Expect the total to be calculated correctly
        expect(result).toEqual({
          subTotal: 130,
          totalDiscount: 15,
          totalPrice: 115
        });
      });
    });
});
