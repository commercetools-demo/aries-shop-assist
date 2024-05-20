import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import type { TProductPrice } from '../../types/generated/ctp';
import { formatMoneyCurrency } from '../../helpers';
import Card from '@commercetools-uikit/card';

type TLineItemProps = {
  key: string;
  itemName: string;
  imageUrl?: string;
  sku: string;
  color?: string;
  size?: string;
  quantity: number;
  price: TProductPrice;
  discountedPrice?: TProductPrice;
};

const CartLineItem = ({
  key,
  itemName,
  imageUrl,
  sku,
  color,
  size,
  quantity,
  price,
  discountedPrice,
}: TLineItemProps) => {
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
  }));

  return (
    <Card type="raised" theme="light" insetScale="s" key={key}>
      <Spacings.Inline scale="m">
        <Spacings.Stack scale="m">
          <img
            src={imageUrl}
            alt={`${itemName}-${color || 'nocolor'}-${size || 'onesize'}`}
          />
        </Spacings.Stack>
        <Spacings.Stack scale="m">
          <Text.Headline as="h3">{itemName}</Text.Headline>
          <Text.Wrap>
            <Text.Body isBold={true}>SKU: </Text.Body>
            <Text.Body>{sku}</Text.Body>
          </Text.Wrap>
          {color ?? (
            <Text.Wrap>
              <Text.Body isBold={true}>Color: </Text.Body>
              <Text.Body>{color}</Text.Body>
            </Text.Wrap>
          )}
          {size ?? (
            <Text.Wrap>
              <Text.Body isBold={true}>Size: </Text.Body>
              <Text.Body>{size}</Text.Body>
            </Text.Wrap>
          )}
          <Text.Wrap>
            <Text.Body isBold={true}>Quantity: </Text.Body>
            <Text.Body>{quantity}</Text.Body>
          </Text.Wrap>
        </Spacings.Stack>
        <Spacings.Stack scale="m">
          {discountedPrice ?? (
            <Text.Body isStrikethrough={true}>$ 100.00</Text.Body>
          )}
          <Text.Body isBold={true}>
            {price}
          </Text.Body>
        </Spacings.Stack>
      </Spacings.Inline>
    </Card>
  );
};
CartLineItem.displayName = 'Cart Line Item';

export default CartLineItem;
