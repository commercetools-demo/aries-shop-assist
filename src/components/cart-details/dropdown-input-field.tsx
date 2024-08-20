// external imports
import { useEffect, useState } from 'react';
import DropdownMenu from '@commercetools-uikit/dropdown-menu';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';

// local imports
import { useProductBySkuFetcher } from '../../hooks/use-products-connector';
import { TFetchProductBySkuQuery } from '../../types/generated/ctp';

const DropdownInputField = ({
  handleSkuValue,
  handleProducts,
}: {
  handleSkuValue: (val: string) => void;
  handleProducts: (
    product: TFetchProductBySkuQuery['products']['results']
  ) => void;
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const { product } = useProductBySkuFetcher(searchValue);
  const [skus, setSkus] = useState<string[] | null>(null);
  const [selectedSku, setSelectedSku] = useState<string>('');

  useEffect(() => {
    if (product) {
      handleProducts(product);
      let allSkus = product
        ?.map((p) => {
          if (p) {
            return [
              p.masterData.current?.masterVariant.sku,
              p.masterData.current?.variants.map((v) => v && v.sku),
            ];
          } else {
            return '';
          }
        })
        .flat(2)?.filter(
          (sku) => sku !== undefined && sku !== null
        );

      if (
        Array.isArray(allSkus) &&
        allSkus.length > 0 &&
        allSkus !== undefined &&
        allSkus !== null
      ) {
        setSkus([...allSkus]);
      }
    }
  }, [product]);
  return (
    <Spacings.Inline scale="s" alignItems="flex-end">
      <DropdownMenu
        triggerElement={
          <TextField
            title="Add items to your shopping cart."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by Product Id"
          />
        }
        menuHorizontalConstraint={6}
        menuPosition="left"
        menuType="list"
      >
        {skus &&
          skus.map((sku: string) => (
            <DropdownMenu.ListMenuItem
              key={sku}
              onClick={() => setSelectedSku(sku)}
            >
              {sku}
            </DropdownMenu.ListMenuItem>
          ))}
      </DropdownMenu>
      <PrimaryButton
        label="Add to cart"
        onClick={() => handleSkuValue(selectedSku)}
        isDisabled={false}
      />
    </Spacings.Inline>
  );
};

export default DropdownInputField;
