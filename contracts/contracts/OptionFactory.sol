//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {TradeableCallOption} from "./TradeableCallOption.sol";
import {ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAllCallOption.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OptionFactory {
    ISuperfluid host = ISuperfluid(0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9);
    IConstantFlowAgreementV1 cfa =
        IConstantFlowAgreementV1(0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8);

    mapping(address => address[]) public walletToCallOptions;

    address[] public callOptions;

    function getCallOptions() public view returns (address[] memory) {
        return callOptions;
    }

    function getCallOptionsByWallet(address _wallet)
        public
        view
        returns (address[] memory)
    {
        return walletToCallOptions[_wallet];
    }

    function mintCallOption(
        address owner,
        string memory _name,
        ISuperToken acceptedToken,
        ERC20 dai,
        ERC20 underlyingAsset,
        uint256 underlyingAmount,
        uint8 underlyingDecimals,
        AggregatorV3Interface priceFeed,
        uint8 priceFeedDecimals,
        int96 requiredFlowRate,
        uint256 expirationDate,
        int256 strikePrice
    ) public {
        TradeableCallOption _option = new TradeableCallOption(
            owner,
            _name,
            "FOP",
            host,
            cfa,
            acceptedToken,
            dai
        );
        _option.createOption(
            underlyingAsset,
            underlyingAmount,
            underlyingDecimals,
            priceFeed,
            priceFeedDecimals,
            requiredFlowRate,
            expirationDate,
            strikePrice
        );

        walletToCallOptions[owner].push(address(_option));
        callOptions.push(address(_option));
    }

    function changeCallOptionOwner(
        address _option,
        address _from,
        address _to
    ) public {
        for (uint256 i = 0; i <= walletToCallOptions[_from].length; i++) {
            if (walletToCallOptions[_from][i] == _option) {
                walletToCallOptions[_from][i] = walletToCallOptions[_from][
                    walletToCallOptions[_from].length - 1
                ];
                walletToCallOptions[_from].pop();
                break;
            }
        }

        walletToCallOptions[_to].push(_option);
    }
}
