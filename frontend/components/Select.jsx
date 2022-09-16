import React from 'react'
import Select from 'react-select'

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

const MyComponent = ({options}) => {
   
        console.log(options)
        return(
            <div>
                <Select options={options} value={value}/>
            </div>
            
        )
  
        }