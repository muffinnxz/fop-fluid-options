import React from "react";
import { useState } from "react";
import Select from "react-select";

const DropDownList = ({ options, placeholder }) => {
  const [value, setValue] = useState();

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex jusity-center items-center bg-slate-200 rounded-xl space-x-1">
      <p className="mx-2 text-sm text-slate-400">{placeholder}</p>
      <Select
        options={options}
        // value={value}
        // onChange={handleChange}
        // p-2.5
        className="bg-gray-50 border border-gray-300 text-slate-500 text-sm rounded-lg border-l-gray-100 dark:border-l-gray-700 border-l-2 focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        {/* {options.map((option) => {
          return (
            <option value={option.value} key={option.value}>
              {" "}
              <text className="font-bold bg-blue-300">{option.label}</text>
            </option>
          );
        })} */}
      </Select>
    </div>
  );
};

export default DropDownList;
