const db = require('../../database');
jest.mock('../../database');
const Product = require('../../models/product')

describe('Product', () => {
  describe('findAll', () => {
    afterEach(() => {
      db.all.mockReset();
    });

    it('should resolve with all products', async () => {
      const mockProducts = [
          { id: 1, name: 'A', price: 30 },
          { id: 2, name: 'B', price: 20 },
          { id: 3, name: 'C', price: 50 },
          { id: 4, name: 'D', price: 15 },
      ];

      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockProducts);
      });

      // Act
      const products = await Product.findAll();

      // Assert
      expect(products).toEqual(mockProducts);
      expect(db.all).toHaveBeenCalledWith('SELECT * FROM products', [], expect.any(Function));
    });

    it('should reject if there is a database error', async () => {
      // Arrange
      const mockError = new Error('Database error');
      db.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null);
      });

      // Act & Assert
      await expect(Product.findAll()).rejects.toThrow(mockError);
      expect(db.all).toHaveBeenCalledWith('SELECT * FROM products', [], expect.any(Function));
    });
  });
});
