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
import type { TMoney } from '../../types/generated/ctp';
import { useCartDetailsFetcher } from '../../hooks/use-carts-connector';
import { formatMoneyCurrency, getErrorMessage } from '../../helpers';
import messages from './messages';
import Card from '@commercetools-uikit/card';
import CartLineItem from './cart-line-item';
import { InfoModalPage } from '@commercetools-frontend/application-components';
import Grid from '@commercetools-uikit/grid';
import { useMemo } from 'react';
import SearchTextInput from '@commercetools-uikit/search-text-input';

type TCartDetailsProps = {
  linkToCarts: string;
};

const CartDetails = (props: TCartDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { push } = useHistory();
  const { loading, error, cart } = useCartDetailsFetcher(params.id);

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

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body tone="negative">{getErrorMessage(error)}</Text.Body>
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
        {loading && (
          <Spacings.Stack alignItems="center">
            <LoadingSpinner />
          </Spacings.Stack>
        )}
        {error && (
          <ContentNotification type="error">
            <Text.Body>
              {intl.formatMessage(messages.cartDetailsErrorMessage)}
            </Text.Body>
          </ContentNotification>
        )}
        {cart && (
          <SearchTextInput
            isClearable={true}
            placeholder="Search by SKU"
            name="Add items to your shopping cart."
            value={value}
            onReset={}
            onSubmit={}
          />
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
                        {cart?.shippingInfo?.price && (<Text.Body>
                          {formatMoneyCurrency(
                            cart?.shippingInfo?.price,
                            dataLocale || projectLanguages[0]
                          )}
                        </Text.Body>)}
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
