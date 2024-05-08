import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  PageNotFound,
  FormModalPage,
} from '@commercetools-frontend/application-components';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../constants';
import { useCartDetailsFetcher } from '../../hooks/use-carts-connector';
import { docToFormValues } from './conversions';
import CartsDetailsForm from './cart-details-form';
import messages from './messages';
import { ApplicationPageTitle } from '@commercetools-frontend/application-shell';

type TCartDetailsProps = {
  onClose: () => void;
};

const CartDetails = (props: TCartDetailsProps) => {
  const intl = useIntl();
  const params = useParams<{ id: string }>();
  const { loading, error, cart } = useCartDetailsFetcher(params.id);
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  return (
    <CartsDetailsForm
      initialValues={docToFormValues(cart, projectLanguages)}
      onSubmit={() => console.log('onSubmit')}
      isReadOnly={!canManage}
      dataLocale={dataLocale}
    >
      {(formProps) => {
        const cartName = formatLocalizedString(
          {
            name: formProps.values?.name,
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
        return (
          <FormModalPage
            title={cartName}
            isOpen
            onClose={props.onClose}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty || !canManage
            }
            isSecondaryButtonDisabled={!formProps.isDirty}
            onSecondaryButtonClick={formProps.handleReset}
            onPrimaryButtonClick={() => formProps.submitForm()}
            labelPrimaryButton={FormModalPage.Intl.save}
            labelSecondaryButton={FormModalPage.Intl.revert}
          >
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
            {cart && formProps.formElements}
            {cart && <ApplicationPageTitle additionalParts={[cartName]} />}
            {cart === null && <PageNotFound />}
          </FormModalPage>
        );
      }}
    </CartsDetailsForm>
  );
};
CartDetails.displayName = 'CartDetails';

export default CartDetails;
