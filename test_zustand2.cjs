const { create } = require('zustand');
const { persist, createJSONStorage } = require('zustand/middleware');

const STORE_VERSION = 4;

const createFreshState = () => ({
  applicationId: '123',
  validationErrors: {},
  basicKYC: { fullName: '' }
});

const useStore = create(
  persist(
    (set, get) => ({
      ...createFreshState(),
    }),
    {
      name: 'test-storage-2',
      version: STORE_VERSION,
      partialize: (state) => ({
        applicationId: state.applicationId,
        basicKYC: state.basicKYC,
        // no validationErrors
      }),
      migrate: (persistedState, version) => {
        if (version === STORE_VERSION) {
          return persistedState; // Return exactly what was parsed!
        }
        return persistedState;
      }
    }
  )
);

// Manually set some state so it persists
useStore.setState({ applicationId: '456' });

// In Node.js, we don't have real sessionStorage, but we can see the initialized state.
// Wait, to test hydration from storage, we need to mock storage.
