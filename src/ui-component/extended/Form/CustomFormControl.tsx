// ==============================|| FORM CONTROL - CUSTOM ||============================== //

import { forwardRef } from 'react';

import FormControl from '@mui/material/FormControl';

const CustomFormControl = forwardRef(({ ...props }, ref) => <FormControl ref={ref} variant="outlined" {...props} />);

CustomFormControl.displayName = 'CustomFormControl';

export default CustomFormControl;
