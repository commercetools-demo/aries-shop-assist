import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { useReducer } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import type { TMoney } from '../../types/generated/ctp';
import { formatMoneyCurrency } from '../../helpers';
import Card from '@commercetools-uikit/card';
import Grid from '@commercetools-uikit/grid';
import IconButton from '@commercetools-uikit/icon-button';
import {
  AngleDownIcon,
  AngleUpIcon,
  CheckInactiveIcon,
} from '@commercetools-uikit/icons';

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
  const [quantityState, dispatchQuantity] = useReducer(
    (state: number, action: number) => action,
    quantity
  );
  const setQuantity = (newQuantity: number) => dispatchQuantity(newQuantity);

  const [priceState, dispatchPrice] = useReducer(
    (state: TMoney, action: TMoney) => action,
    price
  );
  const setPrice = (newPrice: TMoney) => dispatchPrice(newPrice);

  const lineItemPrice = {
    centAmount: price.centAmount / quantity,
    currencyCode: price.currencyCode,
    fractionDigits: price.fractionDigits,
  };

  return (
    <div key={key}>
      <Card type="raised" theme="light" insetScale="s">
        <Grid gridGap="xl" gridAutoFlow="row" gridTemplateColumns="20fr 2fr">
          <Grid.Item>
            <Spacings.Inline scale="m">
              <Spacings.Stack scale="m">
                <img src={imageUrl} alt={sku} width="246" height="190" />
              </Spacings.Stack>
              <Spacings.Stack scale="m">
                <Text.Headline as="h3">{itemName}</Text.Headline>
                <Spacings.Stack scale="xs">
                  <Spacings.Inline scale="s">
                    <Text.Body isBold={true}>SKU </Text.Body>
                    <Text.Body>{sku}</Text.Body>
                  </Spacings.Inline>
                  <Spacings.Inline scale="s" alignItems="center">
                    <Text.Body isBold={true}>Quantity </Text.Body>
                    <Spacings.Inline scale="m" alignItems="center">
                      <Text.Body>{quantityState}</Text.Body>
                      <Spacings.Stack scale="xs">
                        <IconButton
                          label="Increase quantity"
                          icon={<AngleUpIcon />}
                          type="button"
                          size="small"
                          theme="default"
                          onClick={() => {
                            setQuantity(quantityState + 1);
                            setPrice({
                              centAmount:
                                lineItemPrice.centAmount * (quantityState + 1),
                              currencyCode: price.currencyCode,
                              fractionDigits: price.fractionDigits,
                              type: price.type,
                            });
                          }}
                        />
                        <IconButton
                          label="Decrease quantity"
                          icon={<AngleDownIcon />}
                          type="button"
                          size="small"
                          theme="default"
                          onClick={() => {
                            setQuantity(quantityState - 1);
                            setPrice({
                              centAmount:
                                lineItemPrice.centAmount * (quantityState - 1),
                              currencyCode: price.currencyCode,
                              fractionDigits: price.fractionDigits,
                              type: price.type,
                            });
                          }}
                        />
                      </Spacings.Stack>
                    </Spacings.Inline>
                  </Spacings.Inline>
                </Spacings.Stack>
              </Spacings.Stack>
            </Spacings.Inline>
          </Grid.Item>
          <Grid.Item>
            <Spacings.Stack scale="xxxl" alignItems="flex-end">
              <IconButton
                label="Remove from cart"
                icon={<CheckInactiveIcon />}
                type="button"
                shape="round"
                size="big"
                theme="default"
                onClick={() => console.log('Remove from cart')}
              />
              <Spacings.Stack scale="xs" alignItems="flex-end">
                {discountedPrice && (
                  <Text.Body isStrikethrough={true} tone="negative">
                    {formatMoneyCurrency(
                      discountedPrice,
                      dataLocale || projectLanguages[0]
                    )}
                  </Text.Body>
                )}
                <Text.Body fontWeight="medium">
                  {formatMoneyCurrency(
                    priceState,
                    dataLocale || projectLanguages[0]
                  )}
                </Text.Body>
              </Spacings.Stack>
            </Spacings.Stack>
          </Grid.Item>
        </Grid>
      </Card>
    </div>
  );
};
CartLineItem.displayName = 'Cart Line Item';

export default CartLineItem;
