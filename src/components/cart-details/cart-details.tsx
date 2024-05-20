import { useIntl } from 'react-intl';
import {
  Link as RouterLink,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { BackIcon } from '@commercetools-uikit/icons';
import FlatButton from '@commercetools-uikit/flat-button';
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

type TCartDetailsProps = {
  linkToCarts: string;
};

const CartDetails = (props: TCartDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { loading, error, cart } = useCartDetailsFetcher(params.id);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
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
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToCarts}
          label={intl.formatMessage(messages.backToCartsList)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.cartNameLabel} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}
      {cart && (
        <Spacings.Stack scale="xs">
          <Card type="raised" theme="light" insetScale="m">
            <Spacings.Inline scale="m">
              <Spacings.Stack scale="m">
                {cart &&
                  cart?.lineItems &&
                  cart.lineItems.map((item, key) => <CartLineItem 
                    key={`item-${key}`} 
                    itemName={item?.nameAllLocales && formatLocalizedString(
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
                    )} 
                    imageUrl={item?.variant?.images[0]?.url ?? ''} 
                    sku={item?.variant?.sku ?? NO_VALUE_FALLBACK} 
                    color={'No Color'} 
                    size={'One Size'} 
                    quantity={item.quantity} 
                    price={item?.price}
                  />)}
              </Spacings.Stack>
              <Spacings.Stack scale="m">
                <Card type="raised" theme="light" insetScale="s">
                  <Text.Headline
                    as="h3"
                    intlMessage={messages.cartSummaryLabel}
                  />
                  <Text.Wrap>
                    <Text.Body isBold={true}>Items Subtotal:</Text.Body>
                    <Text.Body>
                      {formatMoneyCurrency(itemSubtotal, dataLocale || 'en-US')}
                    </Text.Body>
                  </Text.Wrap>
                  <Text.Wrap>
                    <Text.Body isBold={true}>Discounts:</Text.Body>
                    <Text.Body>
                      {formatMoneyCurrency(itemSubtotal, dataLocale || 'en-US')}
                    </Text.Body>
                  </Text.Wrap>
                  <Text.Wrap>
                    <Text.Body isBold={true}>Shipping:</Text.Body>
                    <Text.Body>
                      {formatMoneyCurrency(
                        cart?.shippingInfo?.price ?? {
                          type: 'centPrecision',
                          centAmount: 0,
                          currencyCode: cart?.totalPrice?.currencyCode,
                          fractionDigits: cart?.totalPrice?.fractionDigits,
                        },
                        dataLocale || 'en-US'
                      )}
                    </Text.Body>
                  </Text.Wrap>
                  <Text.Wrap>
                    <Text.Body isBold={true}>Total:</Text.Body>
                    <Text.Body>
                      {formatMoneyCurrency(
                        cart?.totalPrice,
                        dataLocale || 'en-US'
                      )}
                    </Text.Body>
                  </Text.Wrap>
                </Card>
                <Card type="raised" theme="light" insetScale="s">
                  <Text.Headline
                    as="h3"
                    intlMessage={messages.cartShippingLabel}
                  />
                  <Text.Caption>
                    {cart?.shippingInfo?.shippingMethodName ??
                      NO_VALUE_FALLBACK}
                  </Text.Caption>
                  <Text.Wrap>
                    <Text.Body>
                      {cart?.customer?.salutation +
                        ' ' +
                        cart?.customer?.firstName +
                        ' ' +
                        cart?.customer?.lastName}
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
                </Card>
              </Spacings.Stack>
            </Spacings.Inline>
          </Card>
        </Spacings.Stack>
      )}
    </Spacings.Stack>
  );
};
CartDetails.displayName = 'Cart Details';

export default CartDetails;
