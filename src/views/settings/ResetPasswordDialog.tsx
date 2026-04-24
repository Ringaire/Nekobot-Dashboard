import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

import { useAuth } from 'contexts/AuthContext';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import RemixIcon from 'ui-component/extended/RemixIcon';

interface FormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const defaultFormState: FormState = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function ResetPasswordDialog({ open, onClose }: ResetPasswordDialogProps) {
  const { isAuthenticated, changeUserPassword } = useAuth();
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const passwordsMatch = useMemo(
    () => formData.confirmPassword === '' || formData.newPassword === formData.confirmPassword,
    [formData.confirmPassword, formData.newPassword]
  );

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords((previous) => ({
      ...previous,
      [field]: !previous[field]
    }));
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [field]: value
    }));
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      confirmPassword: field === 'newPassword' || field === 'confirmPassword' ? undefined : previous.confirmPassword
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!formData.oldPassword) {
      nextErrors.oldPassword = '请输入当前密码';
    }

    if (!formData.newPassword) {
      nextErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 6) {
      nextErrors.newPassword = '新密码长度至少为6位';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = '请再次输入新密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      nextErrors.confirmPassword = '两次输入的新密码不一致';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    setFormData(defaultFormState);
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setErrorMessage('请先登录后再修改密码');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const response = await changeUserPassword(
        formData.oldPassword,
        formData.newPassword
      );

      if (response.success) {
        setFormData(defaultFormState);
        setErrors({});
        setSuccessMessage(response.message || '密码修改成功');
        window.setTimeout(() => {
          handleClose();
        }, 1500);
        return;
      }

      setErrorMessage(response.message || '密码修改失败');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>修改密码</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            <CustomFormControl fullWidth error={Boolean(errors.oldPassword)}>
              <InputLabel htmlFor="dialog-old-password">当前密码</InputLabel>
              <OutlinedInput
                id="dialog-old-password"
                type={showPasswords.oldPassword ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={handleChange('oldPassword')}
                disabled={loading}
                autoComplete="current-password"
                label="当前密码"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle current password visibility"
                      onClick={() => togglePassword('oldPassword')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      <RemixIcon className={showPasswords.oldPassword ? 'ri-eye-line' : 'ri-eye-off-line'} fontSize="1.25rem" />
                    </IconButton>
                  </InputAdornment>
                }
              />
              {errors.oldPassword && <FormHelperText>{errors.oldPassword}</FormHelperText>}
            </CustomFormControl>

            <CustomFormControl fullWidth error={Boolean(errors.newPassword)}>
              <InputLabel htmlFor="dialog-new-password">新密码</InputLabel>
              <OutlinedInput
                id="dialog-new-password"
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                disabled={loading}
                autoComplete="new-password"
                label="新密码"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => togglePassword('newPassword')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      <RemixIcon className={showPasswords.newPassword ? 'ri-eye-line' : 'ri-eye-off-line'} fontSize="1.25rem" />
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{errors.newPassword || '密码长度至少为6位'}</FormHelperText>
            </CustomFormControl>

            <CustomFormControl fullWidth error={Boolean(errors.confirmPassword) || !passwordsMatch}>
              <InputLabel htmlFor="dialog-confirm-password">确认新密码</InputLabel>
              <OutlinedInput
                id="dialog-confirm-password"
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                autoComplete="new-password"
                label="确认新密码"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => togglePassword('confirmPassword')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      <RemixIcon className={showPasswords.confirmPassword ? 'ri-eye-line' : 'ri-eye-off-line'} fontSize="1.25rem" />
                    </IconButton>
                  </InputAdornment>
                }
              />
              <FormHelperText>{errors.confirmPassword || (!passwordsMatch ? '两次输入的密码不一致' : ' ')}</FormHelperText>
            </CustomFormControl>

            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {loading ? '提交中...' : '确认修改'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
