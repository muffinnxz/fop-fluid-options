import React from "react";
import { useState } from "react";
import Select from 'react-select'

const DropDownList = ({options, placeholder}) => {
    const [value, setValue] = useState();

    const handleChange = (e) => {
        setValue(e.target.value);
    }

    return (
        <select value={value} onChange={handleChange} placeholder={'i'}>
            {options.map((option) => (<option value={option.value} key={option.value}>{option.label}</option>))}
        </select>
    )
  }

export default DropDownList;