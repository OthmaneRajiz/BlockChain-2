const Web3 = require('web3');
const axios = require('axios');
const { ethers } = require('ethers'); // Import ethers

// Configuration (replace with your actual values)
const providerURL = 'YOUR_POLYGON_NODE_URL'; // e.g., Infura, Alchemy
const oracleContractAddress = 'YOUR_ORACLE_CONTRACT_ADDRESS';
const oraclePrivateKey = 'YOUR_ORACLE_PRIVATE_KEY'; // **KEEP THIS SECRET!**
const commodityPriceAPI = 'https://api.example.com/commodity-prices'; // Example API

// Initialize Web3 and Ethers
const web3 = new Web3(providerURL);
const provider = new ethers.providers.JsonRpcProvider(providerURL);
const wallet = new ethers.Wallet(oraclePrivateKey, provider);

// Oracle Contract ABI (replace with your actual ABI)
const oracleContractABI = [
    // ... your oracle contract ABI ...
    {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          }
        ],
        "name": "fulfillRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
];

// Create contract instance
const oracleContract = new ethers.Contract(oracleContractAddress, oracleContractABI, wallet);

// Function to fetch commodity price from API
async function getCommodityPrice(commodity) {
    try {
        const response = await axios.get(`${commodityPriceAPI}?commodity=${commodity}`);
        return response.data.price; // Adjust based on API response structure
    } catch (error) {
        console.error('Error fetching commodity price:', error);
        return null;
    }
}

// Function to fulfill the data request on the oracle contract
async function fulfillDataRequest(requestId, price) {
    try {
        const tx = await oracleContract.fulfillRequest(requestId, price);
        await tx.wait(); // Wait for transaction to be mined
        console.log(`Request ${requestId} fulfilled with price ${price}. Transaction hash: ${tx.hash}`);
    } catch (error) {
        console.error('Error fulfilling data request:', error);
    }
}

// Listen for events from the oracle contract (e.g., "RequestCommodityPrice")
async function listenForEvents() {
    // Replace 'RequestCommodityPrice' with the actual event name from your oracle contract
    oracleContract.on("RequestCommodityPrice", async (requestId, commodity, event) => {
        console.log(`Received request for ${commodity} price (Request ID: ${requestId})`);

        const price = await getCommodityPrice(commodity);

        if (price !== null) {
            await fulfillDataRequest(requestId, price);
        } else {
            console.error(`Failed to retrieve price for ${commodity}`);
            // Handle the error appropriately (e.g., retry, log, etc.)
        }
    });

    console.log('Listening for oracle requests...');
}

// Start listening for events
listenForEvents();
