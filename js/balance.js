async function checkBalance() {
    const address = document.getElementById('addressInput').value.trim();

    if (!address)                   return showStatus('Please enter a wallet address.', 'danger');
    if (!ethers.isAddress(address)) return showStatus('Invalid Ethereum address format.', 'danger');

    if (CONFIG.CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return showStatus('Contract not yet deployed. Update CONTRACT_ADDRESS in js/config.js.', 'warning');
    }

    showStatus('<span class="spinner"></span>&nbsp; Fetching balances from Sepolia...', 'info');

    try {
        const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);

        const sethWei  = await provider.getBalance(address);
        const sethBal  = parseFloat(ethers.formatEther(sethWei));

        const contract  = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, provider);
        const decimals  = await contract.decimals();
        const tokenRaw  = await contract.balanceOf(address);
        const tokenBal  = parseFloat(ethers.formatUnits(tokenRaw, decimals));

        document.getElementById('displayAddress').textContent = address;
        document.getElementById('sethBalance').textContent    = sethBal.toFixed(6) + ' SETH';
        document.getElementById('tokenBalance').textContent   = tokenBal + ' TKT';

        if (tokenBal > 0) {
            document.getElementById('holdsTicket').innerHTML =
                `<span style="color:var(--secondary)">&#10004; Yes (${tokenBal} ticket${tokenBal !== 1 ? 's' : ''})</span>`;
        } else {
            document.getElementById('holdsTicket').innerHTML =
                '<span style="color:var(--danger)">&#10008; No</span>';
        }

        document.getElementById('balanceResult').style.display = 'block';
        showStatus('', '');
    } catch (err) {
        showStatus('Error fetching balance: ' + err.message, 'danger');
    }
}

async function useConnectedWallet() {
    if (!window.ethereum) {
        return showStatus('MetaMask not detected. Enter an address manually.', 'warning');
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        document.getElementById('addressInput').value = accounts[0];
        checkBalance();
    } catch (err) {
        showStatus('Could not connect to MetaMask: ' + err.message, 'danger');
    }
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMsg');
    el.innerHTML = msg ? `<div class="alert alert-${type}">${msg}</div>` : '';
}
