import { Dropdown } from "@nextui-org/react";
import { useState } from "react";
import { useMemo } from "react";

const options = [
    { key: "new", name: "New File" },
    { key: "copy", name: "Copy Link" },
    { key: "edit", name: "Edit File" },
    { key: "delete", name: "Delete File" },
  ];

export default function App({ placeholder}) {
const options = [
    { key: "new", name: "New File" },
    { key: "copy", name: "Copy Link" },
    { key: "edit", name: "Edit File" },
    { key: "delete", name: "Delete File" },
    ];
    
  const [selected, setSelected] = useState(new Set(["text"]));

  const selectedValue = useMemo(
    () => Array.from(selected).join(", ").replaceAll("_", " "),
    [selected]
  );

  console.log(Array.from(selected)[0])
  return (
    
    <Dropdown >
        <Dropdown.Button flat>{selectedValue}</Dropdown.Button>
        <Dropdown.Menu aria-label="Dynamic Actions"  disallowEmptySelection items={options} selectionMode="single" selectedKeys={selected} onSelectionChange={setSelected}>
            {(item) => (
            <Dropdown.Item
                key={item.key}
                color={item.key === "delete" ? "error" : "default"}
            >
                {item.name}
            </Dropdown.Item>
            )}
        </Dropdown.Menu>
    </Dropdown>
    
  );
}

// not use