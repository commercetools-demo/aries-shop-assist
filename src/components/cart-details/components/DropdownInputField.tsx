// external imports
import { useEffect, useState } from 'react';
import DropdownMenu from '@commercetools-uikit/dropdown-menu';
import TextField from '@commercetools-uikit/text-field';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';

// local imports
import { useProductBySkuFetcher } from '../../../hooks/use-products-connector';
import { TFetchProductBySkuQuery } from '../../../types/generated/ctp';

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

  // Here in the useEffect we are checking if the product is available or not
  // If the product is available then we are calling the handleProducts function
  // to set the product in the state and also we are getting all the skus of the product
  // and setting it in the state

  // TODO: This section is complex enough to warrant a unit test and some comments. Consider using a flatMap() to simplify the logic, if feasible.
  useEffect(() => {
    if (product) {
      handleProducts(product);
      let allSkus = product
        ?.map((p) =>
          p
            ? [
                p.masterData.current?.masterVariant.sku,
                p.masterData.current?.variants.map((v) => v?.sku),
              ]
            : ''
        )
        .flat(2)
        .filter((sku) => sku !== undefined && sku !== null);

      if (allSkus) {
        setSkus(allSkus);
      }
    }
  }, [handleProducts, product]);
  return (
    <Spacings.Inline scale="s" alignItems="flex-end">
      <DropdownMenu
        triggerElement={
          <TextField
            title="Add items to your shopping cart."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search Product by sku"
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
