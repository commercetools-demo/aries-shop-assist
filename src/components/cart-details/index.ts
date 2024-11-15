import { lazy } from 'react';

const CartDetails = lazy(
  () => import('./CartDetails' /* webpackChunkName: "cart-details" */)
);

export default CartDetails;
