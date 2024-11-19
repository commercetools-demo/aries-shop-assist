import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';
import IconButton from '@commercetools-uikit/icon-button';
import { useIntl } from 'react-intl';
import { designTokens } from '@commercetools-uikit/design-system';

import {
  BinFilledIcon,
  MinimizeIcon,
  PlusBoldIcon,
} from '@commercetools-uikit/icons';
import { formatMoneyCurrency } from '../../../helpers';
import { TMoney } from '../../../types/generated/ctp';
import { DECREASE, INCREASE } from '../constants';
import messages from '../messages';

type TLineItemProps = {
  key: string;
  itemName: string;
  imageUrl?: string;
  sku: string;
  quantity: number;
  price: TMoney;
  discountedPrice?: TMoney;
  removeItem: () => void;
  updateItemQuantity: (quantity: string) => void;
};

const CartLineItem = ({
  key,
  itemName,
  imageUrl,
  sku,
  quantity,
  price,
  discountedPrice,
  removeItem,
  updateItemQuantity,
}: TLineItemProps) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));

  const intl = useIntl();

  return (
    <Card type="raised" theme="light" insetScale="m" key={key}>
      <Spacings.Inline justifyContent="space-between">
        {/* IMAGE, SKU, QUANTITY DISPLAY & BUTTONS */}
        <Spacings.Inline scale="m">
          <img
            src={imageUrl}
            alt={sku}
            width="230"
            height="190"
            style={{
              backgroundColor: designTokens.colorPrimary95,
              color: designTokens.colorInfo40,
              textAlign: 'center',
              lineHeight: '190px',
            }}
          />
          <Spacings.Stack scale="l">
            <Spacings.Stack scale="xs">
              <Text.Headline as="h2">{itemName}</Text.Headline>
              <Text.Subheadline tone="primary" as="h5">
                {intl.formatMessage(messages.cartDetailsSku)}: {sku}
              </Text.Subheadline>
            </Spacings.Stack>

            {/* QUANTITY */}
            <Spacings.Inline scale="m" alignItems="center">
              <Text.Body
                isBold={true}
                intlMessage={messages.cartDetailsQuantity}
              />
              <IconButton
                label="Increase quantity"
                icon={<MinimizeIcon />}
                type="button"
                size="medium"
                onClick={() => updateItemQuantity(DECREASE)}
              />
              <Text.Body>{quantity}</Text.Body>
              <IconButton
                label="Decrease quantity"
                icon={<PlusBoldIcon />}
                type="button"
                size="medium"
                onClick={() => updateItemQuantity(INCREASE)}
              />
            </Spacings.Inline>
          </Spacings.Stack>
        </Spacings.Inline>
        {/* PRICE & DELETE */}
        <Spacings.Stack scale="m" alignItems="flex-end">
          <Spacings.Stack scale="xxl" alignItems="flex-end">
            <IconButton
              label="Remove from cart"
              icon={<BinFilledIcon />}
              type="button"
              size="big"
              onClick={removeItem}
            />
            <Text.Headline as="h3">
              {formatMoneyCurrency(price, dataLocale || projectLanguages[0])}
            </Text.Headline>
            {discountedPrice && (
              <Text.Body isStrikethrough={true} tone="negative">
                {formatMoneyCurrency(
                  discountedPrice,
                  dataLocale || projectLanguages[0]
                )}
              </Text.Body>
            )}
          </Spacings.Stack>
        </Spacings.Stack>
      </Spacings.Inline>
    </Card>
  );
};
CartLineItem.displayName = 'Cart Line Item';

export default CartLineItem;
