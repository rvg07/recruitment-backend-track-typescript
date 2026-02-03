import { describe, it, expect, beforeEach } from 'vitest';
import { TaxProfileService } from '../../../src/services/taxProfile.service';
import { prisma } from '../../setup';
import { taxProfileFixture } from '../../fixtures/taxProfile.fixture';
import { userFixture } from '../../fixtures/user.fixture';
const taxProfileService = new TaxProfileService(prisma);

describe('TaxProfileService', () => {
    let userId: number;

    beforeEach(async () => {
        await prisma.taxProfile.deleteMany();
        await prisma.user.deleteMany();
        const userData = await userFixture.validHashed();
        const user = await prisma.user.create({
            data: userData
        });
        userId = user.id;
    });

    describe('create', () => {
        it('should create a tax profile successfully', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            expect(taxProfileCreated).toHaveProperty('id');
            expect(taxProfileCreated.companyName).toBe(taxProfileDTO.companyName);
            expect(taxProfileCreated.vatNumber).toBe(taxProfileDTO.vatNumber);
            expect(taxProfileCreated.userId).toBe(userId);
        });
    });

    describe('findAll', () => {
        it('should return paginated tax profiles', async () => {
            const taxProfilesData = taxProfileFixture.multiple(userId);
            for (const taxProfile of taxProfilesData) {
                await taxProfileService.create(userId, taxProfile);
            }
            const first10TaxProfileData = await taxProfileService.findAll({ page: 1, limit: 10 });
            expect(first10TaxProfileData.data).toHaveLength(taxProfilesData.length);
            expect(first10TaxProfileData.total).toBe(taxProfilesData.length);
        });

        it('should filter tax profile by company name', async () => {
            const taxProfilesData = taxProfileFixture.multiple(userId);
            for (const taxProfile of taxProfilesData) {
                await taxProfileService.create(userId, taxProfile);
            }
            const companyNameToSearch = "Anvedi";
            const filterSearchTaxProfileByCompanyName = await taxProfileService.findAll({ companyName: companyNameToSearch });
            expect(filterSearchTaxProfileByCompanyName.data.length).toBeGreaterThan(0);
            expect(filterSearchTaxProfileByCompanyName.data[0].companyName).toContain(companyNameToSearch);
        });

        it('should filter tax profile by userId', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            await taxProfileService.create(userId, taxProfileDTO);
            const filterSearchTaxProfileByUserId = await taxProfileService.findAll({}, userId);
            expect(filterSearchTaxProfileByUserId.data).toHaveLength(1);
            expect(filterSearchTaxProfileByUserId.data[0].userId).toBe(userId);
        });
    });

    describe('findOne', () => {
        it('should return a tax profile by id', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            const taxProfileFound = await taxProfileService.findOne(taxProfileCreated.id);
            expect(taxProfileFound).toBeDefined();
            expect(taxProfileFound?.id).toBe(taxProfileCreated.id);
        });

        it('should return null if tax profile is not found', async () => {
            const notFoundTaxProfile = await taxProfileService.findOne(999999999);
            expect(notFoundTaxProfile).toBeNull();
        });
    });

    describe('update', () => {
        it('should update tax profile details', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            const updateData = { address: 'New address update test 198', city: 'Milano' };
            const updated = await taxProfileService.update(taxProfileCreated.id, updateData);
            expect(updated.address).toBe(updateData.address);
            expect(updated.city).toBe(updateData.city);
            expect(updated.vatNumber).toBe(taxProfileDTO.vatNumber);
        });
    });

    describe('soft delete and restore tax profile', () => {
        it('should soft delete a profile', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            const deletedTaxProfile = await taxProfileService.softDelete(taxProfileCreated.id);
            expect(deletedTaxProfile.deletedAt).not.toBeNull();
        });

        it('should restore a tax profile', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            await taxProfileService.softDelete(taxProfileCreated.id);
            const restoredTaxProfile = await taxProfileService.restore(taxProfileCreated.id);
            expect(restoredTaxProfile.deletedAt).toBeNull();
        });
    });

    describe('hard delete tax profile', () => {
        it('should permanently remove profile', async () => {
            const taxProfileDTO = taxProfileFixture.valid(userId);
            const taxProfileCreated = await taxProfileService.create(userId, taxProfileDTO);
            await taxProfileService.hardDelete(taxProfileCreated.id);
            const foundTaxProfile = await taxProfileService.findOne(taxProfileCreated.id);
            expect(foundTaxProfile).toBeNull();
        });
    });

});