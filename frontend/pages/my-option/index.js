import Call from "../../components/Call";
import CreateOption from "../../components/CreateOption";
import MyCall from "../../components/MyCall";

export default function User() {
  return (
    <div>
      <section>
        Create Option:
        <CreateOption />
      </section>

      <section>
        <div className="px-10 pt-8  mx-20  py-3 border-b   grid grid-cols-4 gap-4">
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
        <MyCall />
        <br /> Put:
        <br />
      </section>
      <br />
      <section>
        Buyer:
        <br /> Call:
        <br /> Put:
        <br />
      </section>
    </div>
  );
}
