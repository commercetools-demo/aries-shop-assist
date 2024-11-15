// External imports
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import Card from '@commercetools-uikit/card';
import { InfoModalPage } from '@commercetools-frontend/application-components';
import Grid from '@commercetools-uikit/grid';

// Local imports
import type { TMoney } from '../../types/generated/ctp';
import { formatMoneyCurrency, getErrorMessage } from '../../helpers';
import messages from './messages';
import CartLineItem from './cart-line-item';
import DropdownInputField from './dropdown-input-field';
import { useCartDetails } from './useCartDetails';

const CartDetails = () => {
  const intl = useIntl();
  const { goBack } = useHistory();
  const {
    setProducts,
    handleAddProduct,
    updateItemQuantity,
    handleChangeLineItemQuantity,
    loadingCartDetails,
    loadingUpdateCart,
    errorCartDetails,
    errorUpdateCart,
    cartDetails,
    items,
  } = useCartDetails();

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));

  const itemSubtotal: TMoney = {
    type: 'centPrecision',
    currencyCode: cartDetails?.totalPrice?.currencyCode ?? NO_VALUE_FALLBACK,
    centAmount:
      cartDetails?.lineItems.reduce(
        (acc, lineItem) => acc + (lineItem?.totalPrice?.centAmount ?? 0),
        0
      ) ?? 0,
    fractionDigits: cartDetails?.totalPrice?.fractionDigits ?? 0,
  };

  if (errorCartDetails || errorUpdateCart) {
    return (
      <ContentNotification type="error">
        {errorCartDetails && (
          <Text.Body tone="negative">
            {getErrorMessage(errorCartDetails)}{' '}
          </Text.Body>
        )}
        {errorUpdateCart && (
          <Text.Body tone="negative">
            {getErrorMessage(errorUpdateCart)}{' '}
          </Text.Body>
        )}
      </ContentNotification>
    );
  }

  // TODO: Fix how to get from commerce-tools api the discounts data

  return (
    <InfoModalPage
      isOpen={true}
      title={`${intl.formatMessage(messages.cartKeyLabel)}: ${cartDetails?.id}`}
      topBarCurrentPathLabel={cartDetails?.id}
      topBarPreviousPathLabel={intl.formatMessage(messages.backToCartsList)}
      onClose={goBack}
    >
      <Spacings.Stack scale="xl">
        {loadingCartDetails ||
          (loadingUpdateCart && (
            <Spacings.Stack alignItems="center">
              <LoadingSpinner />
            </Spacings.Stack>
          ))}
        {errorCartDetails && (
          <ContentNotification type="error">
            <Text.Body>
              {intl.formatMessage(messages.cartDetailsErrorMessage)}
            </Text.Body>
          </ContentNotification>
        )}
        {cartDetails && (
          <DropdownInputField
            handleProducts={(products) => setProducts(products)}
            handleSkuValue={(sku: string) => handleAddProduct(sku)}
          />
        )}
        {cartDetails && (
          <Grid
            gridGap="20px"
            gridRowGap="20px"
            gridAutoFlow="row"
            gridTemplateColumns="10fr 4fr"
          >
            <Grid.Item>
              <Spacings.Stack scale="m">
                {items?.map((item, idx) => (
                  <CartLineItem
                    removeItem={() => handleChangeLineItemQuantity(item, 0)}
                    updateItemQuantity={(quantity: string) =>
                      updateItemQuantity(item, quantity)
                    }
                    key={`idx-${item?.id}-${idx}`}
                    itemName={
                      item?.nameAllLocales &&
                      formatLocalizedString(
                        {
                          name: transformLocalizedFieldToLocalizedString(
                            item.nameAllLocales ?? []
                          ),
                        },
                        {
                          key: 'name',
                          locale: dataLocale,
                          fallbackOrder: projectLanguages,
                          fallback: NO_VALUE_FALLBACK,
                        }
                      )
                    }
                    imageUrl={item?.variant?.images[0]?.url ?? ''}
                    sku={item?.variant?.sku ?? ''}
                    quantity={item.quantity}
                    price={
                      item?.totalPrice ?? {
                        type: 'centPrecision',
                        currencyCode: cartDetails?.totalPrice?.currencyCode,
                        centAmount: 0,
                        fractionDigits: cartDetails?.totalPrice?.fractionDigits,
                      }
                    }
                  />
                ))}
              </Spacings.Stack>
            </Grid.Item>
            <Grid.Item>
              <Spacings.Stack scale="m">
                <Card type="raised" theme="light" insetScale="s">
                  <Spacings.Stack scale="m">
                    <Text.Headline
                      as="h2"
                      intlMessage={messages.cartSummaryLabel}
                    />
                    <Spacings.Stack scale="xs">
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Items Subtotal:</Text.Body>
                        <Text.Body>
                          {formatMoneyCurrency(
                            itemSubtotal,
                            dataLocale || projectLanguages[0]
                          )}
                        </Text.Body>
                      </Spacings.Inline>
                      {cartDetails?.taxedPrice?.totalTax && (
                        <Spacings.Inline scale="s">
                          <Text.Body isBold={true}>Total Tax:</Text.Body>
                          <Text.Body>
                            {formatMoneyCurrency(
                              cartDetails?.taxedPrice?.totalTax,
                              dataLocale || projectLanguages[0]
                            )}
                          </Text.Body>
                        </Spacings.Inline>
                      )}
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Discounts:</Text.Body>
                        <Text.Body>
                          {formatMoneyCurrency(
                            {
                              type: 'centPrecision',
                              currencyCode:
                                cartDetails?.totalPrice?.currencyCode,
                              centAmount: 0,
                              fractionDigits:
                                cartDetails?.totalPrice?.fractionDigits,
                            },
                            dataLocale || projectLanguages[0]
                          )}
                        </Text.Body>
                      </Spacings.Inline>
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Shipping:</Text.Body>
                        {cartDetails?.shippingInfo?.price && (
                          <Text.Body>
                            {formatMoneyCurrency(
                              cartDetails?.shippingInfo?.price,
                              dataLocale || projectLanguages[0]
                            )}
                          </Text.Body>
                        )}
                      </Spacings.Inline>
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Total:</Text.Body>
                        <Text.Body>
                          {formatMoneyCurrency(
                            cartDetails?.totalPrice,
                            dataLocale || projectLanguages[0]
                          )}
                        </Text.Body>
                      </Spacings.Inline>
                    </Spacings.Stack>
                  </Spacings.Stack>
                </Card>
                <Card type="raised" theme="light" insetScale="s">
                  <Spacings.Stack scale="l">
                    <Spacings.Stack scale="xs">
                      <Text.Headline
                        as="h2"
                        intlMessage={messages.cartShippingLabel}
                      />
                      <Text.Subheadline as="h4">
                        {cartDetails?.shippingInfo?.shippingMethodName ??
                          NO_VALUE_FALLBACK}
                      </Text.Subheadline>
                    </Spacings.Stack>
                    <Text.Wrap>
                      <Text.Body>
                        {cartDetails?.customer?.salutation +
                          '. ' +
                          cartDetails?.shippingAddress?.firstName +
                          ' ' +
                          cartDetails?.shippingAddress?.lastName}
                      </Text.Body>
                      <Text.Body>
                        {cartDetails?.shippingAddress?.streetNumber +
                          ' ' +
                          cartDetails?.shippingAddress?.streetName}
                      </Text.Body>
                      <Text.Body>
                        {cartDetails?.shippingAddress?.city +
                          ', ' +
                          cartDetails?.shippingAddress?.state +
                          ' ' +
                          cartDetails?.shippingAddress?.postalCode}
                      </Text.Body>
                    </Text.Wrap>
                  </Spacings.Stack>
                </Card>
              </Spacings.Stack>
            </Grid.Item>
          </Grid>
        )}
      </Spacings.Stack>
    </InfoModalPage>
  );
};
CartDetails.displayName = 'Cart Details';

export default CartDetails;
