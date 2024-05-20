import { useIntl } from 'react-intl';
import {
  Link as RouterLink,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import { BackIcon } from '@commercetools-uikit/icons';
import FlatButton from '@commercetools-uikit/flat-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import type { TCartQueryResult } from '../../types/generated/ctp';
import { useCartsFetcher } from '../../hooks/use-carts-connector';
import { formatMoneyCurrency, getErrorMessage } from '../../helpers';
import messages from './messages';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CartDetails from '../cart-details';

const columns = [
  { key: 'id', label: 'ID', isSortable: true },
  { key: 'key', label: 'Key', isSortable: true },
  {
    key: 'customerEmail',
    label: 'Customer email',
    isSortable: true,
  },
  {
    key: 'customerGroup',
    label: 'Customer group',
    isSortable: false,
  },
  {
    key: 'anonymousId',
    label: 'Anonymous ID',
    isSortable: true,
  },
  {
    key: 'businessUnit',
    label: 'Business unit',
    isSortable: true,
  },
  {
    key: 'store',
    label: 'Store',
    isSortable: false,
  },
  {
    key: 'totalLineItemQuantity',
    label: 'Total line item quantity',
    isSortable: false,
  },
  {
    key: 'totalPrice',
    label: 'Total price',
    isSortable: false,
  },
  {
    key: 'cartState',
    label: 'Cart state',
    isSortable: true,
  },
  {
    key: 'origin',
    label: 'Origin',
    isSortable: true,
  },
];

type TCartsProps = {
  linkToWelcome: string;
};

const Carts = (props: TCartsProps) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));
  const { cartsPaginatedResult, total, error, loading } = useCartsFetcher({
    page,
    perPage,
    tableSorting,
  });

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
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {cartsPaginatedResult ? (
        <Spacings.Stack scale="l">
          <DataTable<NonNullable<TCartQueryResult['results']>[0]>
            isCondensed
            columns={columns}
            rows={cartsPaginatedResult}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'id':
                  return item.id;
                case 'key':
                  return item.key;
                case 'customerEmail':
                  return item.customerEmail;
                case 'customerGroup':
                  return item.customerGroup?.id || NO_VALUE_FALLBACK;
                case 'anonymousId':
                  return item.anonymousId;
                case 'businessUnit':
                  return item.businessUnit?.id || NO_VALUE_FALLBACK;
                case 'store':
                  return formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        item.store?.nameAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: projectLanguages,
                      fallback: NO_VALUE_FALLBACK,
                    }
                  );
                case 'totalLineItemQuantity':
                  return item.totalLineItemQuantity;
                case 'totalPrice':
                  return formatMoneyCurrency(
                    item.totalPrice,
                    item.locale || projectLanguages[0]
                  );
                case 'cartState':
                  return item.cartState;
                case 'origin':
                  return item.origin;
                default:
                  return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={total || 0}
          />
          <Switch>
            <SuspendedRoute path={`${match.url}/:id`}>
              <CartDetails linkToCarts={match.url} />
            </SuspendedRoute>
          </Switch>
        </Spacings.Stack>
      ) : null}
    </Spacings.Stack>
  );
};
Carts.displayName = 'Carts';

export default Carts;
