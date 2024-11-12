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
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import type { TCart, TCartQueryResult } from '../../types/generated/ctp';
import { useCartsFetcher } from '../../hooks/use-carts-connector';
import { formatMoneyCurrency } from '../../helpers';
import messages from './messages';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import CartDetails from '../cart-details';
import SelectableSearchInput, {
  TSelectableSearchInputProps,
  TValue,
} from '@commercetools-uikit/selectable-search-input';
import { dataTableColumns, LABEL_KEYS } from './constants';
import Badge from '../badge/badge';

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

  const [searchInputValue, setSearchInputValue] = useState<TValue>({
    option: LABEL_KEYS.ALL_FIELDS,
    text: '',
  });

  // Only used for custom placeholders on dropdown change
  const [dropdownValue, setDropdownValue] = useState<LABEL_KEYS>(
    LABEL_KEYS.ALL_FIELDS
  );

  const { cartsPaginatedResult, total, error, loading } = useCartsFetcher({
    page,
    perPage,
    tableSorting,
    where: searchInputValue.text,
    labelKey: searchInputValue.option,
  });

  const dropdownOptions: TSelectableSearchInputProps['options'] = [
    {
      value: LABEL_KEYS.ALL_FIELDS,
      label: intl.formatMessage(messages.allFieldsLabel),
    },
    {
      value: LABEL_KEYS.CART_ID,
      label: intl.formatMessage(messages.cartIDLabel),
    },
    {
      value: LABEL_KEYS.CUSTOMER_EMAIL,
      label: intl.formatMessage(messages.emailAddressLabel),
    },
  ];

  const showNoResultsMessage =
    (!loading && searchInputValue.text && cartsPaginatedResult?.length === 0) ||
    error;

  const renderItems = (item: TCart, column: TColumn<TCart>) => {
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
        return <Badge cartStatus={item.cartState} />;
      case 'origin':
        return item.origin;
      default:
        return null;
    }
  };

  const renderNoResultsMessage = () => {
    return error ? (
      <ContentNotification type="error">
        <Text.Body
          tone="negative"
          intlMessage={messages.searchTermNotFoundOnError}
        />
      </ContentNotification>
    ) : (
      <ContentNotification type="warning">
        <Text.Body tone="primary" intlMessage={messages.searchTermNotFound} />
      </ContentNotification>
    );
  };

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>
      <Spacings.Stack scale="m">
        <SelectableSearchInput
          id="searchInput"
          name="searchInput"
          value={searchInputValue}
          onSubmit={(val) => {
            val.text.length > 0 && setSearchInputValue(val);
          }}
          onReset={() =>
            setSearchInputValue({
              option: searchInputValue.option,
              text: '',
            })
          }
          onChange={(event) => {
            if (
              event?.target?.name &&
              event?.target?.name.endsWith('.dropdown')
            ) {
              setDropdownValue(event?.target?.value as LABEL_KEYS);
            }
          }}
          placeholder={
            dropdownValue === LABEL_KEYS.ALL_FIELDS
              ? intl.formatMessage(messages.searchForCartsByAllFields)
              : intl.formatMessage(messages.searchForCarts)
          }
          horizontalConstraint={'scale'}
          menuHorizontalConstraint={5}
          options={dropdownOptions}
          showSubmitButton={true}
          hasError={false}
          isClearable={true}
        />
      </Spacings.Stack>
      {loading && <LoadingSpinner />}
      {showNoResultsMessage
        ? renderNoResultsMessage()
        : cartsPaginatedResult && (
            <Spacings.Stack scale="l">
              {/* Wrapper div used in conjunction with disableSelfContainment={true} in order to
            handle horizontal scrolling from Datatable's parent */}
              <div style={{ overflowX: 'scroll', zIndex: '0' }}>
                <DataTable<NonNullable<TCartQueryResult['results']>[0]>
                  disableSelfContainment={true}
                  isCondensed
                  columns={dataTableColumns}
                  rows={cartsPaginatedResult}
                  itemRenderer={(item, column) => renderItems(item, column)}
                  sortedBy={tableSorting.value.key}
                  sortDirection={tableSorting.value.order}
                  onSortChange={tableSorting.onChange}
                  onRowClick={(row) => {
                    push(`${match.url}/${row.id}`);
                  }}
                  wrapHeaderLabels={false}
                />
              </div>
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
          )}
    </Spacings.Stack>
  );
};

Carts.displayName = 'Carts';

export default Carts;
