/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import { type ApolloError } from '@apollo/client';
import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { TDataTableSortingState } from '@commercetools-uikit/hooks';
import type {
  TFetchCartDetailsQuery,
  TFetchCartDetailsQueryVariables,
  TFetchCartsQuery,
  TFetchCartsQueryVariables,
  TUpdateCartMutationVariables,
  TUpdateCartMutation,
} from '../../types/generated/ctp';
import FetchCartsQuery from './fetch-carts.ctp.graphql';
import FetchCartDetailsQuery from './fetch-cart-details.ctp.graphql';
import UpdateCartMutation from './update-cart.ctp.graphql';

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
  where?: string;
  labelKey?: string;
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
  where,
  labelKey,
}) => {
  const searchQuery =
    labelKey === 'cartId' ? `id="${where}"` : `customerEmail="${where}"`;
  const { data, error, loading } = useMcQuery<
    TFetchCartsQuery,
    TFetchCartsQueryVariables
  >(FetchCartsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sort: [`${tableSorting.value.key} ${tableSorting.value.order}`],
      where: where ? searchQuery : null,
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

type TUseCartDetailsFetcher = (cartId: string) => {
  cart?: TFetchCartDetailsQuery['cart'];
  error?: ApolloError;
  loading: boolean;
};

export const useCartDetailsFetcher: TUseCartDetailsFetcher = (cartId) => {
  const { data, error, loading } = useMcQuery<
    TFetchCartDetailsQuery,
    TFetchCartDetailsQueryVariables
  >(FetchCartDetailsQuery, {
    variables: {
      cartId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    cart: data?.cart,
    error,
    loading,
  };
};

type TUseUpdateCart = (
  cartId: string,
  version: number,
  actions: Array<
    | { addLineItem?: { sku: string; quantity: number } }
    | { changeLineItemQuantity?: { lineItemId: string; quantity: number } }
  >
) => {
  updateCart: (variables: TUpdateCartMutationVariables) => Promise<void>;
  errorCart?: ApolloError;
  loadingCart: boolean;
};

export const useUpdateCart: TUseUpdateCart = (cartId, version, actions) => {
  const [updateCartMutation, { error, loading }] = useMcMutation<
    TUpdateCartMutation,
    TUpdateCartMutationVariables
  >(UpdateCartMutation);

  const updateCart = async (variables: TUpdateCartMutationVariables) => {
    try {
      await updateCartMutation({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables,
      });
    } catch (error) {
      console.log(error);
      error = error;
    }
  };

  return {
    updateCart,
    errorCart: error,
    loadingCart: loading,
  };
};
