// https://docs.commercetools.com/api/projects/carts#ctp:api:type:CartState
// Consider also using shadcn/ui as alternative.

import { TCartState } from '../../types/generated/ctp';

const Badge = ({ cartStatus }: { cartStatus: TCartState }) => {
  return (
    <div
      style={{
        background:
          cartStatus === TCartState.Active
            ? 'lightgreen'
            : TCartState.Frozen
            ? 'orange'
            : 'gray',
        borderRadius: '1rem',
        padding: '0.1rem',
        textAlign: 'center',
        margin: 'auto',
        fontWeight: 'semi-bold',
      }}
    >
      {cartStatus}
    </div>
  );
};

export default Badge;
