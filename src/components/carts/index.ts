import { lazy } from 'react';

const Carts = lazy(
  () => import('./CartsScreen' /* webpackChunkName: "carts" */)
);

export default Carts;
