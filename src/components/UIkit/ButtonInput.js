import React from 'react';
import Button from '@material-ui/core/Button';

const ButtonInput = (props) => {
  return (
    <Button onClick={props.onClick}>
      {props.label}
    </Button>
  );
}

export default ButtonInput;
