import { getTotalPrice } from './orders';
import { getOrdersByQuery } from './orders';
import { Order } from '../shared/orders.models';
import { Test, TestingModule } from '@nestjs/testing';

describe('getTotalPrice', () => {
  it('should calculate total price correctly', () => {
    const items = [
      { title: 'item1', pricePerUnit: 100, quantity: 2 },
      { title: 'item2', pricePerUnit: 150, quantity: 3 }
    ];
    const total = getTotalPrice(items);
    expect(total).toEqual(100 * 2 + 150 * 3);
  });

  it('should return 0 if items array is empty', () => {
    const items = [];
    const total = getTotalPrice(items);
    expect(total).toEqual(0);
  });
});

describe('getOrdersByQuery', () => {
    it('should filter orders by search query correctly', () => {
        const query = { search: 'item' }; 
        const filteredOrders = getOrdersByQuery(query);
        const allMatched = filteredOrders.every(order =>
          order.title.includes(query.search) ||
          order.items.some(item => item.title.includes(query.search))
        );
        expect(allMatched).toBeTruthy();
      });
  
    it('should throw an error for short search parameters', () => {
      const query = { search: 'et' };
      expect(() => getOrdersByQuery(query)).toThrowError();
    });
  
    it('should filter orders by userIds correctly', () => {
        const userId = '662278f21c038615b2a86b57';
        const query = { userIds: [userId] };
        const filteredOrders = getOrdersByQuery(query);
        const allMatched = filteredOrders.every(order => order.userId === userId);
        expect(allMatched).toBeTruthy();
    });
  
    it('should filter orders by itemsCount correctly', () => {
      const query = { itemsCount: 5 };
      const filteredOrders = getOrdersByQuery(query);
      const allMatched = filteredOrders.every(order => order.items.length === 5);
      expect(allMatched).toBeTruthy();
    });
  
    it('should throw an error if no conditions are specified', () => {
      const query = {};
      expect(() => getOrdersByQuery(query)).toThrowError();
    });
  });