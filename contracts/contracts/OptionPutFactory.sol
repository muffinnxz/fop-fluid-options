//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAllPutOption.sol";
import {TradeablePutOption} from "./TradeablePutOption.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OptionPutFactory {
    ISuperfluid host = ISuperfluid(0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9);
    IConstantFlowAgreementV1 cfa =
        IConstantFlowAgreementV1(0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8);
    mapping(address => address[]) public walletToPutOptions;

    address[] putOptions;

    function getPutOptions() public view returns (address[] memory) {
        return putOptions;
    }

    function getPutOptionsByWallet(address _wallet)
        public
        view
        returns (address[] memory)
    {
        return walletToPutOptions[_wallet];
    }

    function mintPutOption(
        address owner,
        string memory _name,
        ISuperToken acceptedToken,
        ERC20 dai,
        uint256 underlyingAmount,
        ERC20 purchasingAsset,
        int256 strikePrice,
        uint8 purchasingDecimals,
        AggregatorV3Interface priceFeed,
        uint8 priceFeedDecimals,
        int96 requiredFlowRate,
        uint256 expirationDate
    ) public {
        TradeablePutOption _option = new TradeablePutOption(
            owner,
            _name,
            "FOP",
            host,
            cfa,
            acceptedToken,
            dai
        );

        _option.createOption(
            underlyingAmount,
            purchasingAsset,
            strikePrice,
            purchasingDecimals,
            priceFeed,
            priceFeedDecimals,
            requiredFlowRate,
            expirationDate
        );

        walletToPutOptions[owner].push(address(_option));
        putOptions.push(address(_option));
    }

    function changePutOptionOwner(
        address _option,
        address _from,
        address _to
    ) public {
        for (uint256 i = 0; i <= walletToPutOptions[_from].length; i++) {
            if (walletToPutOptions[_from][i] == _option) {
                walletToPutOptions[_from][i] = walletToPutOptions[_from][
                    walletToPutOptions[_from].length - 1
                ];
                walletToPutOptions[_from].pop();
                break;
            }
        }

        walletToPutOptions[_to].push(_option);
    }
}
