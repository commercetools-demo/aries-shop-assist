// external imports
import { useEffect, useState } from 'react';
import DropdownMenu from '@commercetools-uikit/dropdown-menu';
import TextField from '@commercetools-uikit/text-field';
// local imports
import { useProductBySkuFetcher } from '../../hooks/use-products-connector';

const DropdownInputField = ({handleSkuValue, handleProducts}: {handleSkuValue: (val:string) => void, handleProducts: (products: any) => void}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const { product } = useProductBySkuFetcher(searchValue);
  const [skus, setSkus] = useState<any>([]);

  useEffect(() => {
    handleProducts(product);
    if(product) {
      let allSkus = product
      ?.map((p) => {
        if (p) {
          return [
            p.masterData.current?.masterVariant.sku,
            p.masterData.current?.variants.map((v) => v.sku),
          ];
        } else {
          return null;
        }
      });
      const flattenSku = allSkus?.flat(2);
      if(Array.isArray(flattenSku) && flattenSku.length > 0 && flattenSku !== undefined && flattenSku !== null) {
        setSkus([...flattenSku]);
      }
    }
    
  }, [product]);
  return (
    <div>
      <DropdownMenu
        triggerElement={
          <TextField
            title="Username"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        }
        menuHorizontalConstraint={6}
        menuPosition="left"
        menuType="list"
      >
        {
            skus && skus.map((sku: string) => (
              <DropdownMenu.ListMenuItem key={sku} onClick={() => handleSkuValue(sku)}>
                {sku}
              </DropdownMenu.ListMenuItem>
            ))
        }
      </DropdownMenu>
    </div>
  );
};

export default DropdownInputField;
