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
import { InfoModalPage } from '@commercetools-frontend/application-components';
import Grid from '@commercetools-uikit/grid';

// Local imports
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import DropdownInputField from './components/DropdownInputField';
import { useCartDetails } from './hooks/useCartDetails';
import CartLineItem from './components/CartLineItem';
import PriceSummary from './components/PriceSummary';
import ShippingSummary from './components/ShippingSummary';
import { TLineItem } from '../../types/generated/ctp';

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

  const isLoading = loadingCartDetails || loadingUpdateCart;

  const structureItemName = (item: TLineItem) => {
    if (!item?.nameAllLocales) return '';
    return formatLocalizedString(
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
    );
  };

  // TODO: Fix how to get from commerce-tools api the discounts data

  return (
    <InfoModalPage
      isOpen={true}
      title={`${intl.formatMessage(messages.cartKeyLabel)}: ${cartDetails?.id}`}
      topBarCurrentPathLabel={cartDetails?.id}
      topBarPreviousPathLabel={intl.formatMessage(messages.backToCartsList)}
      onClose={goBack}
    >
      {isLoading && (
        <Spacings.Stack alignItems="center">
          <LoadingSpinner />
        </Spacings.Stack>
      )}
      <Spacings.Stack scale="xl">
        {errorCartDetails && (
          <ContentNotification type="error">
            <Text.Body intlMessage={messages.cartDetailsErrorMessage} />
          </ContentNotification>
        )}
        {cartDetails && (
          <>
            <DropdownInputField
              handleProducts={(products) => setProducts(products)}
              handleSkuValue={(sku: string) => handleAddProduct(sku)}
            />
            <Grid
              gridGap="20px"
              gridRowGap="20px"
              gridAutoFlow="row"
              gridTemplateColumns="8fr 4fr"
            >
              <Grid.Item>
                <Spacings.Stack scale="m">
                  {items?.map((item, idx) => (
                    <CartLineItem
                      key={`idx-${item?.id}-${idx}`}
                      removeItem={() => handleChangeLineItemQuantity(item, 0)}
                      updateItemQuantity={(quantity: string) =>
                        updateItemQuantity(item, quantity)
                      }
                      itemName={structureItemName(item)}
                      imageUrl={item?.variant?.images[0]?.url ?? undefined}
                      sku={item?.variant?.sku ?? ''}
                      quantity={item.quantity}
                      price={
                        item?.totalPrice ?? {
                          type: 'centPrecision',
                          currencyCode: cartDetails?.totalPrice?.currencyCode,
                          centAmount: 0,
                          fractionDigits:
                            cartDetails?.totalPrice?.fractionDigits,
                        }
                      }
                    />
                  ))}
                </Spacings.Stack>
              </Grid.Item>
              <Grid.Item>
                <Spacings.Stack scale="m">
                  <PriceSummary cartDetails={cartDetails} />
                  <ShippingSummary cartDetails={cartDetails} />
                </Spacings.Stack>
              </Grid.Item>
            </Grid>
          </>
        )}
      </Spacings.Stack>
    </InfoModalPage>
  );
};
CartDetails.displayName = 'Cart Details';

export default CartDetails;
