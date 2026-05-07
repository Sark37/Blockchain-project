let currentWallet = null;
let keystoreJson  = null;

async function generateWallet() {
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;

    if (!password)              return showStatus('Please enter a keystore password.', 'danger');
    if (password !== confirm)   return showStatus('Passwords do not match.', 'danger');
    if (password.length < 8)    return showStatus('Password must be at least 8 characters.', 'danger');

    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating...';
    showStatus('Encrypting keystore — this may take a moment.', 'info');

    try {
        currentWallet = ethers.Wallet.createRandom();
        // encrypt() is CPU-heavy; runs async so the UI stays responsive
        keystoreJson  = await currentWallet.encrypt(password);

        document.getElementById('walletAddress').textContent    = currentWallet.address;
        document.getElementById('walletPrivateKey').textContent = currentWallet.privateKey;
        document.getElementById('walletMnemonic').textContent   = currentWallet.mnemonic?.phrase ?? 'Not available';

        document.getElementById('walletResult').style.display = 'block';
        showStatus('Wallet created successfully. Download your backup files below.', 'success');
    } catch (err) {
        showStatus('Error: ' + err.message, 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '&#10024; Generate Wallet';
    }
}

function downloadKeystore() {
    if (!keystoreJson) return;
    const blob = new Blob([keystoreJson], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
        href:     url,
        download: `keystore-${currentWallet.address.slice(0, 10)}.json`
    });
    a.click();
    URL.revokeObjectURL(url);
}

function downloadPlaintext() {
    if (!currentWallet) return;
    const lines = [
        'TICKETCHAIN WALLET BACKUP',
        '=========================',
        'WARNING: Keep this file offline and never share it.',
        '',
        `Address:     ${currentWallet.address}`,
        `Private Key: ${currentWallet.privateKey}`,
        `Seed Phrase: ${currentWallet.mnemonic?.phrase ?? 'Not available'}`,
        '',
        `Generated:   ${new Date().toISOString()}`,
        `Network:     Ethereum Sepolia Testnet (Chain ID: 11155111)`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
        href:     url,
        download: `wallet-backup-${currentWallet.address.slice(0, 10)}.txt`
    });
    a.click();
    URL.revokeObjectURL(url);
}

function copyAddress() {
    if (!currentWallet) return;
    navigator.clipboard.writeText(currentWallet.address)
        .then(() => showStatus('Address copied to clipboard.', 'success'))
        .catch(()  => showStatus('Could not access clipboard.', 'danger'));
}

function showStatus(msg, type) {
    document.getElementById('statusMsg').innerHTML =
        `<div class="alert alert-${type}">${msg}</div>`;
}
