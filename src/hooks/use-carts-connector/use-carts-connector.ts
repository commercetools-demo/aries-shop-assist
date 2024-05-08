/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchCartsQuery,
  TFetchCartsQueryVariables,
} from '../../types/generated/ctp';
import FetchCartsQuery from './fetch-carts.ctp.graphql';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};
type TUseCartsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps
) => {
  cartsPaginatedResult?: TFetchCartsQuery['carts']['results'];
  total?: number;
  error?: ApolloError;
  loading: boolean;
};

export const useCartsFetcher: TUseCartsFetcher = ({
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    TFetchCartsQuery,
    TFetchCartsQueryVariables
  >(FetchCartsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    cartsPaginatedResult: data?.carts?.results,
    total: data?.carts?.total,
    error,
    loading,
  };


};
