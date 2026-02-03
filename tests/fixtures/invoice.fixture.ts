export const invoiceFixture = {
    valid: (taxProfileId?: number) => ({
      taxProfileId,
      invoiceNumber: 'INV-2026-001',
      issueDate: new Date('2026-01-10').toISOString(),
      dueDate: new Date('2026-02-03').toISOString(),
      amount: '1000.50',
      currency: 'EUR',
      status: 'PENDING',
      description: 'first invoice test'
    }),
    multiple: (taxProfileId?: number) => [
      {
        taxProfileId,
        invoiceNumber: 'INV-2026-002',
        issueDate: new Date('2026-01-11').toISOString(),
        dueDate: new Date('2026-02-04').toISOString(),
        amount: '1000.00',
        currency: 'EUR',
        status: 'PAID',
      },
      {
        taxProfileId,
        invoiceNumber: 'INV-2026-003',
        issueDate: new Date('2026-01-12').toISOString(),
        dueDate: new Date('2026-02-05').toISOString(),
        amount: '2000.00',
        currency: 'EUR',
        status: 'PENDING',
      },
    ],
  };