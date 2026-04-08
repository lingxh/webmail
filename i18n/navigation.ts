import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import { useRouteTransitionStore } from '@/stores/route-transition-store';

const navigation = createNavigation(routing);

export const { Link, redirect, usePathname } = navigation;

export function useRouter() {
  const router = navigation.useRouter();

  return {
    ...router,
    push: (...args: Parameters<typeof router.push>) => {
      useRouteTransitionStore.getState().start();
      return router.push(...args);
    },
    replace: (...args: Parameters<typeof router.replace>) => {
      useRouteTransitionStore.getState().start();
      return router.replace(...args);
    },
    back: () => {
      useRouteTransitionStore.getState().start();
      return router.back();
    },
    forward: () => {
      useRouteTransitionStore.getState().start();
      return router.forward();
    },
  };
}
