import React from "react";
import { useState } from "react";
import BaseSelect from "react-select";
import FixRequiredSelect from "./FixRequiredSelect";

const Select = (props) => (
    <FixRequiredSelect
        {...props}
        SelectComponent={BaseSelect}
        options={props.options || options}
    />
);

const DropDownList = ({ onChangeF, options, placeholder }) => {
    // const [value, setValue] = useState();

    return (
        <div className="flex jusity-center items-center bg-slate-200 rounded-xl space-x-1">
            <p className="mx-2 text-sm text-slate-400">{placeholder}</p>
            <div className="w-full">
                <Select
                    isSearchable
                    required
                    options={options}
                    onChange={(e) => {
                        console.log(e);
                        onChangeF(e);
                    }}
                    // p-2.5
                    className="w-full g-gray-50 border border-gray-300 text-slate-500 text-sm rounded-lg border-l-gray-100 dark:border-l-gray-700 border-l-2 focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                </Select>
            </div>
        </div>
    );
};

export default DropDownList;
