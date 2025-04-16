document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const withdrawForm = document.getElementById("withdrawForm")
    const cryptoSelect = document.getElementById("cryptoSelect")
    const networkSelect = document.getElementById("network")
    const withdrawAddress = document.getElementById("withdrawAddress")
    const amountInput = document.getElementById("amount")
    const availableBalance = document.getElementById("availableBalance")
    const networkFee = document.getElementById("networkFee")
    const receiveAmount = document.getElementById("receiveAmount")
    const twoFACode = document.getElementById("twoFACode")
    const maxBtn = document.querySelector(".max-btn")
    const addressBookBtn = document.getElementById("addressBookBtn")
    const withdrawHistory = document.getElementById("withdrawHistory")
    const hideBalanceToggle = document.getElementById("hideBalance")
    const balanceAmounts = document.querySelectorAll(".balance-amount div")
  
    // Sample data - in a real application, this would come from an API
    const cryptoData = {
      BTC: {
        name: "Bitcoin",
        networks: ["BTC"],
        fee: 0.0005,
        balance: 0.25,
        addresses: [
          { label: "Hardware Wallet", address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5" },
          { label: "Exchange", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
        ],
      },
      ETH: {
        name: "Ethereum",
        networks: ["ETH", "BSC"],
        fee: 0.005,
        balance: 1.5,
        addresses: [{ label: "MetaMask", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" }],
      },
      USDT: {
        name: "Tether",
        networks: ["ETH", "BSC", "TRX"],
        fee: 10,
        balance: 500,
        addresses: [{ label: "Binance", address: "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS" }],
      },
      BNB: {
        name: "Binance Coin",
        networks: ["BSC"],
        fee: 0.01,
        balance: 2.3,
        addresses: [],
      },
      XRP: {
        name: "Ripple",
        networks: ["XRP"],
        fee: 0.2,
        balance: 100,
        addresses: [],
      },
      ADA: {
        name: "Cardano",
        networks: ["ADA"],
        fee: 1,
        balance: 50,
        addresses: [],
      },
      SOL: {
        name: "Solana",
        networks: ["SOL"],
        fee: 0.01,
        balance: 10,
        addresses: [],
      },
      DOGE: {
        name: "Dogecoin",
        networks: ["DOGE"],
        fee: 5,
        balance: 1000,
        addresses: [],
      },
    }
  
    // Sample transaction history
    const sampleTransactions = [
      {
        id: "tx1",
        crypto: "BTC",
        amount: 0.05,
        fee: 0.0005,
        date: "2025-04-12T10:30:00",
        status: "completed",
        address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
        txHash: "0x7d91c6f28c5b4896a5b37568a8c26e8c8c172fb6d2e1342c1d86efa57d7f2e23",
      },
      {
        id: "tx2",
        crypto: "ETH",
        amount: 0.5,
        fee: 0.005,
        date: "2025-04-09T15:45:00",
        status: "completed",
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        txHash: "0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      },
      {
        id: "tx3",
        crypto: "USDT",
        amount: 200,
        fee: 10,
        date: "2025-04-07T08:15:00",
        status: "pending",
        address: "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
      },
    ]
  
    // Initialize the page
    function init() {
      updateNetworkOptions()
      updateBalanceAndFees()
      renderTransactionHistory()
      setupEventListeners()
    }
  
    // Update network options based on selected cryptocurrency
    function updateNetworkOptions() {
      const selectedCrypto = cryptoSelect.value
      networkSelect.innerHTML = '<option value="">Select a network</option>'
  
      if (selectedCrypto && cryptoData[selectedCrypto]) {
        const networks = cryptoData[selectedCrypto].networks
        networks.forEach((network) => {
          const option = document.createElement("option")
          option.value = network
          option.textContent = getNetworkName(network)
          networkSelect.appendChild(option)
        })
      }
    }
  
    // Get full network name
    function getNetworkName(networkCode) {
      const networkNames = {
        BTC: "Bitcoin Network",
        ETH: "Ethereum Network",
        BSC: "Binance Smart Chain",
        TRX: "Tron Network",
        XRP: "Ripple Network",
        ADA: "Cardano Network",
        SOL: "Solana Network",
        DOGE: "Dogecoin Network",
      }
  
      return networkNames[networkCode] || networkCode
    }
  
    // Update balance and fees
    function updateBalanceAndFees() {
      const selectedCrypto = cryptoSelect.value
  
      if (selectedCrypto && cryptoData[selectedCrypto]) {
        const crypto = cryptoData[selectedCrypto]
        availableBalance.textContent = `${crypto.balance.toFixed(8)} ${selectedCrypto}`
        networkFee.textContent = `${crypto.fee} ${selectedCrypto}`
        updateReceiveAmount()
      } else {
        availableBalance.textContent = "0.00"
        networkFee.textContent = "0.00"
        receiveAmount.textContent = "0.00"
      }
    }
  
    // Update receive amount based on input amount and fees
    function updateReceiveAmount() {
      const selectedCrypto = cryptoSelect.value
      const amount = Number.parseFloat(amountInput.value) || 0
  
      if (selectedCrypto && cryptoData[selectedCrypto]) {
        const fee = cryptoData[selectedCrypto].fee
        const receive = Math.max(0, amount - fee)
        receiveAmount.textContent = `${receive.toFixed(8)} ${selectedCrypto}`
      }
    }
  
    // Set maximum amount
    function setMaxAmount() {
      const selectedCrypto = cryptoSelect.value
  
      if (selectedCrypto && cryptoData[selectedCrypto]) {
        const crypto = cryptoData[selectedCrypto]
        // Set max amount to balance minus fee to ensure user can withdraw maximum possible
        const maxAmount = Math.max(0, crypto.balance - crypto.fee)
        amountInput.value = maxAmount.toFixed(8)
        updateReceiveAmount()
      }
    }
  
    // Show address book
    function showAddressBook() {
      const selectedCrypto = cryptoSelect.value
  
      if (!selectedCrypto || !cryptoData[selectedCrypto]) {
        alert("Please select a cryptocurrency first")
        return
      }
  
      const addresses = cryptoData[selectedCrypto].addresses
  
      if (addresses.length === 0) {
        alert("No saved addresses found for this cryptocurrency")
        return
      }
  
      // In a real app, you would show a modal with the address book
      // For this demo, we'll use a simple prompt
      let message = "Select an address:\n\n"
  
      addresses.forEach((addr, index) => {
        message += `${index + 1}. ${addr.label}: ${addr.address}\n`
      })
  
      const selection = prompt(message)
  
      if (selection && !isNaN(selection) && selection > 0 && selection <= addresses.length) {
        withdrawAddress.value = addresses[selection - 1].address
      }
    }
  
    // Format date
    function formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  
    // Render transaction history
    function renderTransactionHistory() {
      if (sampleTransactions.length === 0) {
        withdrawHistory.innerHTML = `
                  <div class="empty-state">
                      <i class="fas fa-inbox"></i>
                      <p>No withdrawal history found</p>
                  </div>
              `
        return
      }
  
      let html = ""
  
      sampleTransactions.forEach((tx) => {
        html += `
                  <div class="transaction-item">
                      <div class="transaction-details">
                          <div class="transaction-crypto">${tx.crypto} Withdrawal</div>
                          <div class="transaction-date">${formatDate(tx.date)}</div>
                      </div>
                      <div class="transaction-amount">-${tx.amount} ${tx.crypto}</div>
                      <div class="transaction-status status-${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</div>
                  </div>
              `
      })
  
      withdrawHistory.innerHTML = html
    }
  
    // Toggle balance visibility
    function toggleBalanceVisibility() {
      balanceAmounts.forEach((element) => {
        if (hideBalanceToggle.checked) {
          element.textContent = "******"
        } else {
          // In a real app, you would fetch the actual balance from the server
          element.textContent = element.classList.contains("primary-balance") ? "4229.496313 USDT" : "≈ 354759.999943 INR"
        }
      })
    }
  
    // Validate withdrawal
    function validateWithdrawal() {
      const selectedCrypto = cryptoSelect.value
      const selectedNetwork = networkSelect.value
      const address = withdrawAddress.value.trim()
      const amount = Number.parseFloat(amountInput.value) || 0
      const twoFAValue = twoFACode.value.trim()
  
      if (!selectedCrypto || !selectedNetwork) {
        alert("Please select a cryptocurrency and network")
        return false
      }
  
      if (!address) {
        alert("Please enter a withdrawal address")
        return false
      }
  
      if (amount <= 0) {
        alert("Please enter a valid amount")
        return false
      }
  
      const crypto = cryptoData[selectedCrypto]
  
      if (amount > crypto.balance) {
        alert(`Insufficient balance. Maximum available: ${crypto.balance} ${selectedCrypto}`)
        return false
      }
  
      if (amount <= crypto.fee) {
        alert(`Amount must be greater than the network fee (${crypto.fee} ${selectedCrypto})`)
        return false
      }
  
      if (!twoFAValue || twoFAValue.length !== 6 || isNaN(twoFAValue)) {
        alert("Please enter a valid 6-digit 2FA code")
        return false
      }
  
      return true
    }
  
    // Handle form submission
    function handleFormSubmit(e) {
      e.preventDefault()
  
      if (!validateWithdrawal()) {
        return
      }
  
      const selectedCrypto = cryptoSelect.value
      const selectedNetwork = networkSelect.value
      const address = withdrawAddress.value.trim()
      const amount = Number.parseFloat(amountInput.value)
  
      // In a real app, you would send this data to the server
      alert(
        `Withdrawal request submitted for ${amount} ${selectedCrypto} to ${address} on ${getNetworkName(selectedNetwork)}`,
      )
  
      // Reset form
      withdrawForm.reset()
      updateBalanceAndFees()
    }
  
    // Setup event listeners
    function setupEventListeners() {
      cryptoSelect.addEventListener("change", () => {
        updateNetworkOptions()
        updateBalanceAndFees()
      })
  
      networkSelect.addEventListener("change", updateBalanceAndFees)
  
      amountInput.addEventListener("input", updateReceiveAmount)
  
      maxBtn.addEventListener("click", setMaxAmount)
  
      addressBookBtn.addEventListener("click", showAddressBook)
  
      hideBalanceToggle.addEventListener("change", toggleBalanceVisibility)
  
      withdrawForm.addEventListener("submit", handleFormSubmit)
    }
  
    // Initialize the page
    init()
  })
  