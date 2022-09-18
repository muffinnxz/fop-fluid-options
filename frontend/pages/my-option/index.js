import Call from "../../components/Call";
import CreateOption from "../../components/CreateOption";

export default function User() {
  return (
    <div>
      <section>
        Create Option:
        <CreateOption />
      </section>

      <section>
        Seller:
        <br /> Call:
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
