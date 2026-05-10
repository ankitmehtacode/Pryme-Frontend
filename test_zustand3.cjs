const { create } = require('zustand');
const { persist } = require('zustand/middleware');

const createFreshState = () => ({
  applicationId: '123',
  validationErrors: { loanType: "test" },
});

const mockStorage = {
  getItem: () => JSON.stringify({
    state: { applicationId: 'from-storage' },
    version: 4
  }),
  setItem: () => {},
  removeItem: () => {}
};

const useStore = create(
  persist(
    (set, get) => ({
      ...createFreshState(),
    }),
    {
      name: 'test-storage',
      version: 4,
      storage: {
        getItem: (name) => {
          return mockStorage.getItem(name);
        },
        setItem: () => {},
        removeItem: () => {}
      },
      migrate: (persistedState, version) => {
        if (version === 4) return persistedState;
        return persistedState;
      }
    }
  )
);

console.log('After hydration:', useStore.getState().validationErrors);
