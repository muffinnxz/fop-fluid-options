import styles from "../styles/Home.module.css";
import OptionFactory from "../../contracts/artifacts/contracts/OptionFactory.sol/OptionFactory.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Card from "./Card";
import PaginatedItems from "./CallPagination";

export default function Call({ currentItems }) {
  return (
    <div>
      {currentItems &&
        currentItems.map((co, index) => {
          return (
            <div>
              <a href={`/call/${co}`}>
                <Card type="call" option={co} />
                {/* {co} */}
              </a>
            </div>
          );
        })}
    </div>
  );
}
