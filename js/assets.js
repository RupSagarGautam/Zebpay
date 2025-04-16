let isBalanceHidden = false;

function toggleBalanceVisibility() {
    isBalanceHidden = !isBalanceHidden;
    const balanceElements = document.querySelectorAll('.balance-value, #totalBalance');
    const eyeBtn = document.querySelector('.eye-btn');

    balanceElements.forEach(element => {
        const value = element.textContent;
        if (isBalanceHidden) {
            element.textContent = value.replace(/[0-9.]/g, '*');
            eyeBtn.textContent = '👁️‍🗨️';
        } else {
            // Restore original value (you might want to store these in data attributes)
            element.textContent = '0.000000';
            eyeBtn.textContent = '👁️';
        }
    });
}

function toggleZeroBalances() {
    const hideZeroBalance = document.getElementById('hideZeroBalance').checked;
    const assetItems = document.querySelectorAll('.asset-item');

    assetItems.forEach(item => {
        const balance = parseFloat(item.getAttribute('data-balance'));
        if (hideZeroBalance && balance === 0) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
    });
} 