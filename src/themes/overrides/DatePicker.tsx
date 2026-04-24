import RemixIcon from 'ui-component/extended/RemixIcon';

// ==============================|| OVERRIDES - DATE PICKER ||============================== //

export default function DatePicker() {
  return {
    MuiDatePicker: {
      defaultProps: {
        slots: { openPickerIcon: () => <RemixIcon className="ri-calendar-line" /> }
      }
    }
  };
}
