const { create } = require('zustand');
const { persist } = require('zustand/middleware');

const createFreshState = () => ({
  a: 1,
  b: 2,
  validationErrors: {}
});

const useStore = create(
  persist(
    () => createFreshState(),
    {
      name: 'test-storage',
      partialize: (state) => ({ a: state.a, b: state.b })
    }
  )
);

console.log(useStore.getState().validationErrors);
