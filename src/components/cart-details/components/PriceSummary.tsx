import { formatMoneyCurrency } from '../../../helpers';
import { TCart, TMoney } from '../../../types/generated/ctp';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import Text from '@commercetools-uikit/text';

import messages from '../messages';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

interface IPriceSummary {
  cartDetails: TCart;
}

const PriceSummary = ({ cartDetails }: IPriceSummary) => {
  const { taxedPrice, totalPrice, shippingInfo } = cartDetails;

  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));

  const itemSubtotal: TMoney = {
    type: 'centPrecision',
    currencyCode: totalPrice?.currencyCode ?? NO_VALUE_FALLBACK,
    centAmount:
      cartDetails?.lineItems.reduce(
        (acc, lineItem) => acc + (lineItem?.totalPrice?.centAmount ?? 0),
        0
      ) ?? 0,
    fractionDigits: totalPrice?.fractionDigits ?? 0,
  };
  return (
    <Card type="raised" theme="light" insetScale="m">
      <Spacings.Stack scale="m">
        <Text.Headline as="h2" intlMessage={messages.cartSummaryLabel} />
        <Spacings.Stack scale="xs">
          {/* SUBTOTAL */}
          <Spacings.Inline scale="s" justifyContent="space-between">
            <Text.Body
              isBold={true}
              intlMessage={messages.cartItemsSubtotalLabel}
            />
            <Text.Body>
              {formatMoneyCurrency(
                itemSubtotal,
                dataLocale || projectLanguages[0]
              )}
            </Text.Body>
          </Spacings.Inline>
          {/* TAXES */}
          {taxedPrice?.totalTax && (
            <Spacings.Inline scale="s" justifyContent="space-between">
              <Text.Body
                isBold={true}
                intlMessage={messages.cartTotalTaxLabel}
              />
              <Text.Body>
                {formatMoneyCurrency(
                  taxedPrice?.totalTax,
                  dataLocale || projectLanguages[0]
                )}
              </Text.Body>
            </Spacings.Inline>
          )}
          {/* DISCOUNTS */}
          <Spacings.Inline scale="s" justifyContent="space-between">
            <Text.Body
              isBold={true}
              intlMessage={messages.cartDiscountslLabel}
            />
            <Text.Body>
              {formatMoneyCurrency(
                {
                  type: 'centPrecision',
                  currencyCode: totalPrice?.currencyCode,
                  centAmount: 0,
                  fractionDigits: totalPrice?.fractionDigits,
                },
                dataLocale || projectLanguages[0]
              )}
            </Text.Body>
          </Spacings.Inline>
          {/* SHIPPING */}
          <Spacings.Inline scale="s" justifyContent="space-between">
            <Text.Body isBold={true}>Shipping:</Text.Body>
            {shippingInfo?.price && (
              <Text.Body>
                {formatMoneyCurrency(
                  shippingInfo.price,
                  dataLocale || projectLanguages[0]
                )}
              </Text.Body>
            )}
          </Spacings.Inline>
        </Spacings.Stack>
        {/* TOTAL */}
        <Spacings.Inline scale="s" justifyContent="space-between">
          <Text.Subheadline
            as="h4"
            tone="primary"
            intlMessage={messages.cartTotalLabel}
          />
          <Text.Subheadline as="h4" tone="primary">
            {formatMoneyCurrency(totalPrice, dataLocale || projectLanguages[0])}
          </Text.Subheadline>
        </Spacings.Inline>
      </Spacings.Stack>
    </Card>
  );
};

export default PriceSummary;
