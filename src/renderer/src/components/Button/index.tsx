import React from 'react';

import { Container, ButtonVariant } from './styles';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button: React.FC<Props> = ({ children, variant = 'primary', ...props }) => {
  return (
    <Container $variant={variant} {...props}>
      {children}
    </Container>
  );
};

export type { ButtonVariant };
export default Button;
