import { defineMessages } from 'react-intl';

export default defineMessages({
  backToCartsList: {
    id: 'CartDetails.backToCartsList',
    defaultMessage: 'Back to carts list',
  },
  cartKeyLabel: {
    id: 'CartDetails.cartKeyLabel',
    defaultMessage: 'Cart key',
  },
  cartNameLabel: {
    id: 'CartDetails.cartNameLabel',
    defaultMessage: 'Cart name',
  },
  cartSummaryLabel: {
    id: 'CartDetails.cartSummaryLabel',
    defaultMessage: 'Summary',
  },
  cartShippingLabel: {
    id: 'CartDetails.cartShippingLabel',
    defaultMessage: 'Shipping',
  },
  cartDetailsErrorMessage: {
    id: 'CartDetails.errorMessage',
    defaultMessage:
      'We were unable to fetch the cart details. Please check your connection, the provided cart ID and try again.',
  },
});
