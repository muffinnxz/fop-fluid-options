import Call from "../../components/Call";
import CreateOption from "../../components/CreateOption";
import MyCall from "../../components/MyCall";
import { useState, useEffect } from "react";
export default function User() {
  const [filterCall, setFilterCall] = useState(false);
  const [filterPut, setFilterPut] = useState(false);

  return (
    <div>
      <h1 className="font-bold text-2xl mx-24 px-4 mt-6">My Options</h1>

      <section>
        <CreateOption />
      </section>

      <div className="ml-32 mt-8 gap-2 flex flex-row w-64">
        Filter by:
        <div className="border px-1  py-1 -mt-1 gap-1 rounded-md flex flex-row">
          <div class="flex  items-center ">
            <button
              className={`rounded-xl border ${
                filterCall ? "bg-teal-400 text-white" : ""
              }
              px-4 `}
              onClick={(e) => setFilterCall(!filterCall)}
            >
              Call
            </button>
          </div>
          <div class="flex items-center">
            <button
              className={`rounded-xl border ${
                filterPut ? "bg-teal-400 text-white" : ""
              }
              px-4 `}
              onClick={(e) => setFilterPut(!filterPut)}
            >
              Put
            </button>
          </div>
        </div>
      </div>

      <section>
        <div className="px-5 pt-4  mx-20  py-3 border-b   grid grid-cols-4 gap-4">
          <div className="pl-8 col-span-2">Name</div>

          {/* <div ></div> */}
          <div className="-ml-16 flex flex-row justify-start gap-12">
            <h1 className="-ml-2 w-20">Strike</h1>
            <h1 className="ml-6 w-20">Expiry</h1>

            <div className={`-ml-3 px-1 rounded-md justify-self-center `}>
              Type
            </div>
          </div>

          <div className="flex flex-row justify-center ">
            <h1 className="-ml-12 w-32">Owner</h1>
          </div>
        </div>
        {filterCall ? <MyCall /> : <div></div>}
        {/* {filterPut ? <MyPut /> : <div></div>}  TODO waiting for Put*/}
      </section>
    </div>
  );
}
