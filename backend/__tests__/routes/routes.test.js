const request = require('supertest')
const index = require('../../app')
const express = require("express")
const app = express()
app.use(express.urlencoded({ extended: false }));
app.use("/", index);

const cartId = 9

describe('cartRoutes', () => {
  // describe('POST /cart/:cartid/items', () => {
  //   it('should add an item to the cart', async () => {
  //     const response = await request(app)
        // .post(`/cart/${cartId}/items`)
  //       .send({
  //         productId: 13,
  //         quantity: 1
  //       })

  //     expect(response.status).toBe(201)
  //     expect(response.body).toHaveProperty('items')
  //     expect(response.body).toHaveProperty('promotions')
  //     expect(response.body).toHaveProperty('totals')
  //   })
  // });

  describe('GET /:cartid/', () => {
    it('should get items from the cart', async () => {
      const response = await request(app)
        .get(`/cart/${cartId}/`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('items')
    })
  });
})

describe('productRoutes', () => {
  describe('GET /', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get(`/products`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true);
    })
  });
})
