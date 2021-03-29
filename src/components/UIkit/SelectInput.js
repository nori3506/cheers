import React from 'react';
import Select from '@material-ui/core/Select';


const SelectInput = (props) => {
  
  return (
    <>
      <Select
        label={props.label}
        children={props.children}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
      
    </>
  );
}

export default SelectInput;
