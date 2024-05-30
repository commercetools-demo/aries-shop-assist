import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import type { TMoney } from '../../types/generated/ctp';
import { formatMoneyCurrency } from '../../helpers';
import Card from '@commercetools-uikit/card';
import Grid from '@commercetools-uikit/grid';

type TLineItemProps = {
  key: string;
  itemName: string;
  imageUrl?: string;
  sku: string;
  quantity: number;
  price: TMoney;
  discountedPrice?: TMoney;
};

const CartLineItem = ({
  key,
  itemName,
  imageUrl,
  sku,
  quantity,
  price,
  discountedPrice,
}: TLineItemProps) => {
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));

  return (
    <div key={key}>
      <Card type="raised" theme="light" insetScale="s">
        <Grid gridGap="xl" gridAutoFlow="row" gridTemplateColumns="20fr 2fr">
          <Grid.Item>
            <Spacings.Inline scale="m">
              <Spacings.Stack scale="m">
                <img src={imageUrl} alt={sku} width="246" />
              </Spacings.Stack>
              <Spacings.Stack scale="m">
                <Text.Headline as="h3">{itemName}</Text.Headline>
                <Spacings.Stack scale="xs">
                  <Spacings.Inline scale="s">
                    <Text.Body isBold={true}>SKU: </Text.Body>
                    <Text.Body>{sku}</Text.Body>
                  </Spacings.Inline>
                  <Spacings.Inline scale="s">
                    <Text.Body isBold={true}>Quantity: </Text.Body>
                    <Text.Body>{quantity}</Text.Body>
                  </Spacings.Inline>
                </Spacings.Stack>
              </Spacings.Stack>
            </Spacings.Inline>
          </Grid.Item>
          <Grid.Item alignSelf="end">
            <Spacings.Stack scale="xs">
              {discountedPrice && (
                <Text.Body isStrikethrough={true} tone="negative">
                  {formatMoneyCurrency(
                    discountedPrice,
                    dataLocale || projectLanguages[0]
                  )}
                </Text.Body>
              )}
              <Text.Body fontWeight="medium">
                {formatMoneyCurrency(price, dataLocale || projectLanguages[0])}
              </Text.Body>
            </Spacings.Stack>
          </Grid.Item>
        </Grid>
      </Card>
    </div>
  );
};
CartLineItem.displayName = 'Cart Line Item';

export default CartLineItem;
