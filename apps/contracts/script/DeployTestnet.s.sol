// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RampAggregator} from "../src/RampAggregator.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract DeployTestnetScript is Script {
    // Contract addresses will be set during deployment
    address public rampAggregator;
    address public feeCollector;
    
    // Roles - using testnet defaults
    address public defaultAdmin;
    address public pauser;
    
    // Environment variables
    string private constant RPC_URL = "https://alfajores-forno.celo-testnet.org";
    
    function run() external {
        // Get deployer address from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        defaultAdmin = vm.envOr("DEFAULT_ADMIN", vm.addr(deployerPrivateKey)); // Default to deployer if not set
        pauser = vm.envOr("PAUSER", vm.addr(deployerPrivateKey)); // Default to deployer if not set
        
        console.log("Deploying test contracts with the following parameters:");
        console.log("Network: Celo Alfajores Testnet");
        console.log("Deployer: ", vm.addr(deployerPrivateKey));
        console.log("Default Admin: ", defaultAdmin);
        console.log("Pauser: ", pauser);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy FeeCollector (takes no constructor parameters)
        console.log("\nDeploying FeeCollector...");
        FeeCollector feeCollectorContract = new FeeCollector();
        feeCollector = address(feeCollectorContract);
        console.log("FeeCollector deployed to:", feeCollector);
        
        // Deploy RampAggregator
        console.log("\nDeploying RampAggregator...");
        RampAggregator rampAggregatorContract = new RampAggregator(
            pauser,       // Backend signer
            feeCollector  // Fee collector address
        );
        rampAggregator = address(rampAggregatorContract);
        console.log("RampAggregator deployed to:", rampAggregator);
        
        // Transfer ownership of FeeCollector to default admin
        console.log("\nSetting default admin as fee collector owner...");
        feeCollectorContract.transferOwnership(defaultAdmin);
        
        vm.stopBroadcast();
        
        console.log("\n Test deployment complete!");
        console.log("\n Contract Addresses:");
        console.log("RampAggregator:", rampAggregator);
        console.log("FeeCollector:  ", feeCollector);
        
    }
}
