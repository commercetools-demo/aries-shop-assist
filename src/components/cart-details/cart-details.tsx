// External imports
import { useIntl } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';
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
import { useMemo, useState } from 'react';
import SearchSelectInput from '@commercetools-uikit/search-select-field';
import PrimaryButton from '@commercetools-uikit/primary-button';

// Local imports
import type { TMoney, TMyCartUpdateAction } from '../../types/generated/ctp';
import {
  useCartDetailsFetcher,
  useUpdateCart,
} from '../../hooks/use-carts-connector';
import { formatMoneyCurrency, getErrorMessage } from '../../helpers';
import messages from './messages';
import CartLineItem from './cart-line-item';
import { useProductBySkuFetcher } from '../../hooks/use-products-connector';
import { INCREASE } from './constants';

type TCartDetailsProps = {
  linkToCarts: string;
};

const CartDetails = (props: TCartDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { push } = useHistory();
  const { loading, error, cart } = useCartDetailsFetcher(params.id);
  const [searchValue, setSearchValue] = useState<string>('');
  const { product } = useProductBySkuFetcher(searchValue);
  const { updateCart, loadingCart, errorCart } = useUpdateCart(
    params.id,
    cart?.version ?? 0,
    []
  );

  const items = useMemo(() => (cart && cart.lineItems) || [], [cart]);

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));

  const itemSubtotal: TMoney = {
    type: 'centPrecision',
    currencyCode: cart?.totalPrice?.currencyCode ?? NO_VALUE_FALLBACK,
    centAmount:
      cart?.lineItems.reduce(
        (acc, lineItem) => acc + (lineItem?.totalPrice?.centAmount ?? 0),
        0
      ) ?? 0,
    fractionDigits: cart?.totalPrice?.fractionDigits ?? 0,
  };
  const handleUpdateCart = async (
    actions: Array<TMyCartUpdateAction> | TMyCartUpdateAction
  ) => {
    try {
      await updateCart({
        cartId: params.id,
        version: cart?.version || 0,
        actions,
      });
    } catch (error) {}
  };

  const handleChangeLineItemQuantity = async (
    lineItem: { id: string; quantity: number },
    quantity: number
  ) => {
    const actions = [
      {
        changeLineItemQuantity: {
          lineItemId: lineItem.id,
          quantity: quantity,
        },
      },
    ];
    await handleUpdateCart(actions);
  };

  const handleAddLineItem = async (sku: string) => {
    const actions = [
      {
        addLineItem: {
          sku: sku,
          quantity: 1,
        },
      },
    ];
    await handleUpdateCart(actions);
  };
  const handleAddProduct = async () => {
    if (product && product.length > 0) {
      const sku = product[0]?.masterData?.current?.masterVariant?.sku;
      const existingLineItem = cart?.lineItems.find(
        (item) => item?.variant?.sku === sku
      );
      existingLineItem
        ? await handleChangeLineItemQuantity(
            existingLineItem,
            existingLineItem.quantity + 1
          )
        : sku && (await handleAddLineItem(sku));
    }
  };

  const updateItemQuantity = async (
    lineItem: { id: string; quantity: number },
    quantity: string
  ) => {
    const updatedQuantity =
      quantity === INCREASE ? lineItem.quantity + 1 : lineItem.quantity - 1;
    handleChangeLineItemQuantity(lineItem, updatedQuantity);
  };

  if (error || errorCart) {
    return (
      <ContentNotification type="error">
        {error && (
          <Text.Body tone="negative">{getErrorMessage(error)} </Text.Body>
        )}
        {errorCart && (
          <Text.Body tone="negative">{getErrorMessage(errorCart)} </Text.Body>
        )}
      </ContentNotification>
    );
  }

  // TO DO: Fix how to get from commerce-tools api the discounts data

  return (
    <InfoModalPage
      isOpen={true}
      title={`${intl.formatMessage(messages.cartKeyLabel)}: ${cart?.id}`}
      topBarCurrentPathLabel={cart?.id}
      topBarPreviousPathLabel={intl.formatMessage(messages.backToCartsList)}
      onClose={() => push(props.linkToCarts)}
    >
      <Spacings.Stack scale="xl">
        {loading ||
          (loadingCart && (
            <Spacings.Stack alignItems="center">
              <LoadingSpinner />
            </Spacings.Stack>
          ))}
        {error && (
          <ContentNotification type="error">
            <Text.Body>
              {intl.formatMessage(messages.cartDetailsErrorMessage)}
            </Text.Body>
          </ContentNotification>
        )}
        {cart && (
          <Spacings.Inline scale="s" alignItems="flex-end">
            <SearchSelectInput
              isClearable={true}
              placeholder="Search by SKU"
              title="Add items to your shopping cart."
              value={searchValue}
              loadingMessage="loading exact matches"
              horizontalConstraint={14}
              optionType="single-property"
              isAutofocussed={false}
              backspaceRemovesValue={true}
              filterOption={() => true}
              loadOptions={async (inputValue) => {
                console.log(inputValue);
                if (inputValue) {
                  setSearchValue(inputValue);
                }
                return [];
              }}
              id="searchBySkuBar"
            />

            <PrimaryButton
              label="Add to cart"
              onClick={handleAddProduct}
              isDisabled={false}
            />
          </Spacings.Inline>
        )}
        {cart && (
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
                        currencyCode: cart?.totalPrice?.currencyCode,
                        centAmount: 0,
                        fractionDigits: cart?.totalPrice?.fractionDigits,
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
                      {cart?.taxedPrice?.totalTax && (
                        <Spacings.Inline scale="s">
                          <Text.Body isBold={true}>Total Tax:</Text.Body>
                          <Text.Body>
                            {formatMoneyCurrency(
                              cart?.taxedPrice?.totalTax,
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
                              currencyCode: cart?.totalPrice?.currencyCode,
                              centAmount: 0,
                              fractionDigits: cart?.totalPrice?.fractionDigits,
                            },
                            dataLocale || projectLanguages[0]
                          )}
                        </Text.Body>
                      </Spacings.Inline>
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Shipping:</Text.Body>
                        {cart?.shippingInfo?.price && (
                          <Text.Body>
                            {formatMoneyCurrency(
                              cart?.shippingInfo?.price,
                              dataLocale || projectLanguages[0]
                            )}
                          </Text.Body>
                        )}
                      </Spacings.Inline>
                      <Spacings.Inline scale="s">
                        <Text.Body isBold={true}>Total:</Text.Body>
                        <Text.Body>
                          {formatMoneyCurrency(
                            cart?.totalPrice,
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
                        {cart?.shippingInfo?.shippingMethodName ??
                          NO_VALUE_FALLBACK}
                      </Text.Subheadline>
                    </Spacings.Stack>
                    <Text.Wrap>
                      <Text.Body>
                        {cart?.customer?.salutation +
                          '. ' +
                          cart?.shippingAddress?.firstName +
                          ' ' +
                          cart?.shippingAddress?.lastName}
                      </Text.Body>
                      <Text.Body>
                        {cart?.shippingAddress?.streetNumber +
                          ' ' +
                          cart?.shippingAddress?.streetName}
                      </Text.Body>
                      <Text.Body>
                        {cart?.shippingAddress?.city +
                          ', ' +
                          cart?.shippingAddress?.state +
                          ' ' +
                          cart?.shippingAddress?.postalCode}
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
