import styles from "../styles/Home.module.css";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Card from "./Card";

export default function Put({ currentItems }) {
  return (
    <div>
      {currentItems &&
        currentItems.map((co, index) => {
          return (
            <div>
              <a href={`/put/${co}`}>
                <Card type="put" option={co} />
                {/* {co} */}
              </a>
            </div>
          );
        })}
    </div>
  );
}
