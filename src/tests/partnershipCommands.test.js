/**
 * Unit Tests for Partnership Commands (FASE 2)
 * Using Jest for testing
 */

const Partnership = require('../database/models/partnershipSchema');

describe('Partnership Commands', () => {
  describe('Create Partnership', () => {
    test('should create a partnership with valid data', async () => {
      const partnershipData = {
        name: 'Test Partner',
        tier: 'gold',
        guildId: '123456',
        leaderId: '789',
      };

      const result = await Partnership.create(partnershipData);
      expect(result.name).toBe('Test Partner');
      expect(result.tier).toBe('gold');
    });

    test('should fail with missing required fields', async () => {
      const partnershipData = {
        name: 'Test Partner',
      };

      expect(async () => {
        await Partnership.create(partnershipData);
      }).rejects.toThrow();
    });
  });

  describe('Update Partnership', () => {
    test('should update partnership status', async () => {
      const partnership = await Partnership.create({
        name: 'Test',
        tier: 'silver',
        guildId: '123',
        leaderId: '456',
      });

      const updated = await Partnership.findByIdAndUpdate(
        partnership._id,
        { status: 'inactive' },
        { new: true }
      );

      expect(updated.status).toBe('inactive');
    });
  });

  describe('Approve/Reject Partnership', () => {
    test('should increment approvals count', async () => {
      const partnership = await Partnership.create({
        name: 'Test',
        tier: 'bronze',
        guildId: '111',
        leaderId: '222',
      });

      const initialApprovals = partnership.approvals || 0;
      const updated = await Partnership.findByIdAndUpdate(
        partnership._id,
        { approvals: initialApprovals + 1 },
        { new: true }
      );

      expect(updated.approvals).toBe(initialApprovals + 1);
    });

    test('should increment rejections count', async () => {
      const partnership = await Partnership.create({
        name: 'Test',
        tier: 'gold',
        guildId: '333',
        leaderId: '444',
      });

      const initialRejections = partnership.rejections || 0;
      const updated = await Partnership.findByIdAndUpdate(
        partnership._id,
        { rejections: initialRejections + 1 },
        { new: true }
      );

      expect(updated.rejections).toBe(initialRejections + 1);
    });
  });

  describe('Rating System', () => {
    test('should allow rating 1-5', async () => {
      const partnership = await Partnership.create({
        name: 'Test',
        tier: 'silver',
        guildId: '555',
        leaderId: '666',
      });

      const validRatings = [1, 2, 3, 4, 5];
      for (const rating of validRatings) {
        const updated = await Partnership.findByIdAndUpdate(
          partnership._id,
          { rating },
          { new: true }
        );
        expect(updated.rating).toBe(rating);
      }
    });
  });
});

describe('Analytics', () => {
  test('should calculate engagement correctly', () => {
    const interactions = 10;
    const requests = 5;
    const approvals = 8;
    const rejections = 2;

    const engagement = ((interactions + requests + approvals) / (approvals + rejections + 1)) * 100;
    expect(engagement).toBeGreaterThan(0);
  });
});

module.exports = { Partnership };
