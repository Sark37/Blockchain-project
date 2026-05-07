let provider, signer, contract, userAddress;

async function connectWallet() {
    if (!window.ethereum) {
        return showStatus('MetaMask not found. Please install the MetaMask browser extension.', 'danger');
    }
    if (CONFIG.CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return showStatus('Contract not yet deployed. Update CONTRACT_ADDRESS in js/config.js.', 'warning');
    }

    const btn = document.getElementById('connectBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Connecting...';

    try {
        provider    = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        signer      = await provider.getSigner();
        userAddress = await signer.getAddress();

        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(CONFIG.CHAIN_ID)) {
            showStatus(
                `Wrong network detected. Please switch MetaMask to <strong>Sepolia Testnet</strong> (Chain ID: ${CONFIG.CHAIN_ID}).`,
                'danger'
            );
            btn.disabled = false;
            btn.innerHTML = 'Connect MetaMask';
            return;
        }

        contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONFIG.CONTRACT_ABI, signer);
        await refreshInfo();

        document.getElementById('connectCard').style.display  = 'none';
        document.getElementById('walletInfo').style.display   = 'block';
        document.getElementById('purchaseCard').style.display = 'block';
        showStatus('', '');

        // Keep balance fresh if the user switches accounts
        window.ethereum.on('accountsChanged', () => location.reload());
    } catch (err) {
        showStatus('Connection failed: ' + err.message, 'danger');
        btn.disabled = false;
        btn.innerHTML = 'Connect MetaMask';
    }
}

async function refreshInfo() {
    const network   = await provider.getNetwork();
    const sethWei   = await provider.getBalance(userAddress);
    const tokenRaw  = await contract.balanceOf(userAddress);
    const decimals  = await contract.decimals();
    const price     = await contract.ticketPrice();

    document.getElementById('connectedAddress').textContent = userAddress;
    document.getElementById('networkName').innerHTML =
        `<span class="network-badge"><span class="status-dot green"></span>${CONFIG.CHAIN_NAME}</span>`;
    document.getElementById('sethBalance').textContent   = parseFloat(ethers.formatEther(sethWei)).toFixed(6) + ' SETH';
    document.getElementById('ticketBalance').textContent = ethers.formatUnits(tokenRaw, decimals) + ' TKT';
    document.getElementById('ticketPrice').textContent   = ethers.formatEther(price) + ' SETH';
}

async function buyTicket() {
    const btn = document.getElementById('buyBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Awaiting MetaMask...';

    const txResult = document.getElementById('txResult');
    txResult.style.display = 'block';
    setTxStatus('<span class="spinner"></span>&nbsp; Waiting for MetaMask confirmation...');

    try {
        const price = await contract.ticketPrice();
        const tx    = await contract.buyTicket({ value: price });

        setTxStatus('Transaction submitted — waiting for block confirmation...');
        showTxHash(tx.hash);

        const receipt = await tx.wait();

        if (receipt.status === 1) {
            setTxStatus('<span style="color:var(--secondary)">&#10004; Confirmed — ticket purchased!</span>');
            showStatus('Your ticket token (TKT) has been minted to your wallet.', 'success');
            await refreshInfo();
        } else {
            setTxStatus('<span style="color:var(--danger)">&#10008; Transaction reverted.</span>');
            showStatus('Transaction reverted on-chain. Check Etherscan for details.', 'danger');
        }
    } catch (err) {
        const msg = err.reason ?? err.message ?? 'Unknown error';
        setTxStatus(`<span style="color:var(--danger)">&#10008; ${msg}</span>`);
        showStatus('Error: ' + msg, 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '&#127915; Buy Ticket';
    }
}

function setTxStatus(html) {
    document.getElementById('txStatus').innerHTML = html;
}

function showTxHash(hash) {
    document.getElementById('txHashRow').style.display = 'flex';
    const link = document.getElementById('txHashLink');
    link.textContent = hash.slice(0, 22) + '...';
    link.href = `https://sepolia.etherscan.io/tx/${hash}`;
}

function showStatus(msg, type) {
    const el = document.getElementById('statusMsg');
    el.innerHTML = msg ? `<div class="alert alert-${type}">${msg}</div>` : '';
}
