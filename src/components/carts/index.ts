import { lazy } from 'react';

const Carts = lazy(() => import('./Carts' /* webpackChunkName: "carts" */));

export default Carts;
