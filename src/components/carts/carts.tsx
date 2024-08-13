import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
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
import SelectableSearchInput, {
  TSelectableSearchInputProps,
} from '@commercetools-uikit/selectable-search-input';

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

const Carts = () => {
  const match = useRouteMatch();
  const intl = useIntl();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState();
  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages ?? [],
  }));
  const [textInputValue, setTextInputValue] = useState<string>('');
  const [dropdownValue, setDropdownValue] = useState<string>('allCarts');

  const cartId = dropdownValue === 'cartId'  && textInputValue ? textInputValue : undefined;
  const emailId = dropdownValue === 'emailId' && textInputValue ? textInputValue : undefined;

  const where = cartId ? cartId : emailId;

  const { cartsPaginatedResult, total, error, loading } = useCartsFetcher({
    page,
    perPage,
    tableSorting,
    where,
    labelKey : dropdownValue,
  });

  const options: TSelectableSearchInputProps['options'] = [
    { value: 'allCarts', label: intl.formatMessage(messages.allFieldsLabel) },
    { value: 'cartId', label: intl.formatMessage(messages.cartIDLabel) },
    { value: 'emailId', label: intl.formatMessage(messages.emailIDLabel) },
  ];

  const value = {
    text: textInputValue,
    option: dropdownValue,
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body tone="negative">{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  const showNoResultsMessage =
    !loading && textInputValue && cartsPaginatedResult?.length === 0;

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>
      <Spacings.Stack scale="m">
        <SelectableSearchInput
          id="searchBar"
          name="searchBar"
          value={value}
          onChange={(event) => {
            setTextInputValue('');
            if (
              event?.target?.name !== undefined &&
              event?.target?.name.endsWith('.textInput')
            ) {
              const searchText = event?.target?.value;
              setTextInputValue(
                Array.isArray(searchText)
                  ? searchText.join('')
                  : searchText || ''
              );
            }
            if (
              event?.target?.name !== undefined &&
              event?.target?.name.endsWith('.dropdown')
            ) {
              const selectValue = event?.target?.value;
              setDropdownValue(
                Array.isArray(selectValue)
                  ? selectValue.join('')
                  : selectValue || ''
              );
            }
          }}
          onSubmit={(submitValues) => {
            console.log(JSON.stringify(submitValues));
          }}
          isClearable={true}
          showSubmitButton={true}
          hasError={false}
          placeholder="Search for Carts"
          horizontalConstraint={'scale'}
          menuHorizontalConstraint={5}
          options={options}
        />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {showNoResultsMessage ? (
        <ContentNotification type="warning">
          <Text.Body tone="primary">
            No matches found for your search term
          </Text.Body>
        </ContentNotification>
      ) : (
        cartsPaginatedResult && (
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
              onRowClick={(row) => {
                push(`${match.url}/${row.id}`);
              }}
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
        )
      )}
    </Spacings.Stack>
  );
};
Carts.displayName = 'Carts';

export default Carts;
