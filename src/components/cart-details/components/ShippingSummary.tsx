import messages from '../messages';
import { TCart } from '../../../types/generated/ctp';
import Text from '@commercetools-uikit/text';
import Card from '@commercetools-uikit/card';
import Spacings from '@commercetools-uikit/spacings';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';

interface IShippingSummary {
  cartDetails: TCart;
}

const ShippingSummary = ({ cartDetails }: IShippingSummary) => {
  const {
    firstName,
    lastName,
    streetName,
    streetNumber,
    city,
    state,
    postalCode,
  } = cartDetails?.shippingAddress ?? {};

  const shippingMethod = cartDetails?.shippingInfo?.shippingMethodName;
  const salutation = cartDetails?.customer?.salutation;

  //TODO: Improve string concat, spacings, etc.

  return (
    <Card type="raised" theme="light" insetScale="s">
      <Spacings.Stack scale="l">
        <Spacings.Stack scale="xs">
          <Text.Headline as="h2" intlMessage={messages.cartShippingLabel} />
          <Text.Subheadline as="h4">
            {shippingMethod ?? NO_VALUE_FALLBACK}
          </Text.Subheadline>
        </Spacings.Stack>
        <Text.Wrap>
          <Text.Body>
            {salutation + '. ' + firstName + ' ' + lastName}
          </Text.Body>
          <Text.Body>{streetNumber + ' ' + streetName}</Text.Body>
          <Text.Body>{city + ', ' + state + ' ' + postalCode}</Text.Body>
        </Text.Wrap>
      </Spacings.Stack>
    </Card>
  );
};

export default ShippingSummary;
