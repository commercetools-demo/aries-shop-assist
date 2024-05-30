import { defineMessages } from 'react-intl';

export default defineMessages({
  backToCartsList: {
    id: 'CartDetails.backToCartsList',
    defaultMessage: 'Back to Carts List',
  },
  cartKeyLabel: {
    id: 'CartDetails.cartIdLabel',
    defaultMessage: 'Cart ID',
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
