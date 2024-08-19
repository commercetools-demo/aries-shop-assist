import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { ApolloError } from '@apollo/client';
import type {
  TFetchProductBySkuQuery,
  TFetchProductBySkuQueryVariables,
} from '../../types/generated/ctp';
import FetchProductBySkuQuery from './fetch-product-by-sku.ctp.graphql';

type TUseProductBySkuFetcher = (where: string) => {
  product?: TFetchProductBySkuQuery['products']['results'];
  error?: ApolloError;
  loading: boolean;
};

export const useProductBySkuFetcher: TUseProductBySkuFetcher = (where) => {
  const { data, error, loading } = useMcQuery<
    TFetchProductBySkuQuery,
    TFetchProductBySkuQueryVariables
  >(FetchProductBySkuQuery, {
    variables: {
      where: where ? `masterData(current(variants(sku="${where}")))` : '',
      // where: where ? `id="${where}"` : '',
      currency: 'USD',
      locale: 'en-US',
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    product: data?.products?.results,
    error,
    loading,
  };
};
