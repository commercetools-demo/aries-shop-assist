// external imports
import { useState } from 'react';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Spacings from '@commercetools-uikit/spacings';
import SearchTextInput from '@commercetools-uikit/search-text-input';

// local imports
import { useIntl } from 'react-intl';
import messages from '../messages';
import { useCartDetails } from '../hooks/useCartDetails';

const DropdownInputField = () => {
  const intl = useIntl();
  const { handleAddProduct } = useCartDetails();

  const [searchValue, setSearchValue] = useState<string>('');

  // TODO: Consider refactoring this component to use SearchSelectField component from CT UI KIT
  // to improve the whole search experience, with option suggestions and more.
  // https://uikit.commercetools.com/?path=/docs/form-fields-searchselectfield-readme--props

  return (
    <Spacings.Inline scale="m" alignItems="flex-end">
      <SearchTextInput
        id="searchInput"
        name="searchInput"
        value={searchValue}
        placeholder={intl.formatMessage(messages.cartDetailsSearchBySku)}
        onChange={(event) => setSearchValue(event.target.value)}
        onSubmit={() => handleAddProduct(searchValue)}
        onReset={() => setSearchValue('')}
        horizontalConstraint={12}
        hasError={false}
        isClearable={true}
      />
      <PrimaryButton
        label="Add to cart"
        onClick={() => handleAddProduct(searchValue)}
        isDisabled={!searchValue}
      />
    </Spacings.Inline>
  );
};

export default DropdownInputField;
