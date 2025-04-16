document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const depositForm = document.getElementById("depositForm")
    const cryptoSelect = document.getElementById("cryptoSelect")
    const networkSelect = document.getElementById("network")
    const amountInput = document.getElementById("amount")
    const depositAddress = document.getElementById("depositAddress")
    const copyAddressBtn = document.getElementById("copyAddressBtn")
    const qrCode = document.getElementById("qrCode")
    const maxBtn = document.querySelector(".max-btn")
    const minAmount = document.querySelector(".min-amount")
    const depositHistory = document.getElementById("depositHistory")
    const hideBalanceToggle = document.getElementById("hideBalance")
    const balanceAmounts = document.querySelectorAll(".balance-amount div")
  
    // Sample data - in a real application, this would come from an API
    const cryptoData = {
      BTC: {
        name: "Bitcoin",
        networks: ["BTC"],
        minDeposit: 0.001,
        address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
        balance: 0.25,
      },
      ETH: {
        name: "Ethereum",
        networks: ["ETH", "BSC"],
        minDeposit: 0.01,
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        balance: 1.5,
      },
      USDT: {
        name: "Tether",
        networks: ["ETH", "BSC", "TRX"],
        minDeposit: 20,
        address: "TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS",
        balance: 500,
      },
      BNB: {
        name: "Binance Coin",
        networks: ["BSC"],
        minDeposit: 0.1,
        address: "bnb136ns6lfw4zs5hg4n85vdthaad7hq5m4gtkgf23",
        balance: 2.3,
      },
      XRP: {
        name: "Ripple",
        networks: ["XRP"],
        minDeposit: 10,
        address: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
        balance: 100,
      },
      ADA: {
        name: "Cardano",
        networks: ["ADA"],
        minDeposit: 5,
        address:
          "addr1qxy8p07tr4877d0k5m24rkthrju5s8y5qgxgdn5ps3d7rqtmqr8aq3slj5cykgv3xcklfd7xm0qc4e6evwr9xpyfg9wqpz9z0s",
        balance: 50,
      },
      SOL: {
        name: "Solana",
        networks: ["SOL"],
        minDeposit: 0.5,
        address: "7Vz3S8hpF3QGVKwZH1BUhfQHvQqUZNk5hNiVJ7GdAgJ3",
        balance: 10,
      },
      DOGE: {
        name: "Dogecoin",
        networks: ["DOGE"],
        minDeposit: 50,
        address: "D8vFz4p1L37jdg9xpmmVDYYaJ3V3N1H1bJ",
        balance: 1000,
      },
    }
  
    // Sample transaction history
    const sampleTransactions = [
      {
        id: "tx1",
        crypto: "BTC",
        amount: 0.05,
        date: "2025-04-10T14:30:00",
        status: "completed",
        txHash: "0x7d91c6f28c5b4896a5b37568a8c26e8c8c172fb6d2e1342c1d86efa57d7f2e23",
      },
      {
        id: "tx2",
        crypto: "ETH",
        amount: 0.75,
        date: "2025-04-08T09:15:00",
        status: "completed",
        txHash: "0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      },
      {
        id: "tx3",
        crypto: "USDT",
        amount: 100,
        date: "2025-04-05T18:45:00",
        status: "pending",
        txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
      },
    ]
  
    // Initialize the page
    function init() {
      updateNetworkOptions()
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
  
        // Update minimum deposit amount
        minAmount.textContent = `${cryptoData[selectedCrypto].minDeposit} ${selectedCrypto}`
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
  
    // Update deposit address and QR code
    function updateDepositAddress() {
      const selectedCrypto = cryptoSelect.value
      const selectedNetwork = networkSelect.value
  
      if (selectedCrypto && selectedNetwork && cryptoData[selectedCrypto]) {
        const address = cryptoData[selectedCrypto].address
        depositAddress.innerHTML = address
        copyAddressBtn.disabled = false
  
        // Generate QR code (in a real app, use a QR code library)
        qrCode.innerHTML = `
                  <div style="background-color: white; padding: 10px; text-align: center;">
                      <div style="font-weight: bold; color: black; margin-bottom: 10px;">${selectedCrypto} Deposit</div>
                      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}" alt="QR Code">
                      </div>
                      <div style="font-size: 12px; color: black;">Scan to deposit</div>
                  </div>
              `
      } else {
        depositAddress.innerHTML =
          '<span class="placeholder-text">Select a cryptocurrency and network to view deposit address</span>'
        copyAddressBtn.disabled = true
        qrCode.innerHTML = ""
      }
    }
  
    // Copy address to clipboard
    function copyAddressToClipboard() {
      const address = depositAddress.textContent
      navigator.clipboard.writeText(address).then(() => {
        // Show success message
        const originalText = copyAddressBtn.innerHTML
        copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>'
  
        setTimeout(() => {
          copyAddressBtn.innerHTML = originalText
        }, 2000)
      })
    }
  
    // Set maximum amount
    function setMaxAmount() {
      const selectedCrypto = cryptoSelect.value
  
      if (selectedCrypto && cryptoData[selectedCrypto]) {
        amountInput.value = cryptoData[selectedCrypto].balance
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
        depositHistory.innerHTML = `
                  <div class="empty-state">
                      <i class="fas fa-inbox"></i>
                      <p>No deposit history found</p>
                  </div>
              `
        return
      }
  
      let html = ""
  
      sampleTransactions.forEach((tx) => {
        html += `
                  <div class="transaction-item">
                      <div class="transaction-details">
                          <div class="transaction-crypto">${tx.crypto} Deposit</div>
                          <div class="transaction-date">${formatDate(tx.date)}</div>
                      </div>
                      <div class="transaction-amount">+${tx.amount} ${tx.crypto}</div>
                      <div class="transaction-status status-${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</div>
                  </div>
              `
      })
  
      depositHistory.innerHTML = html
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
  
    // Handle form submission
    function handleFormSubmit(e) {
      e.preventDefault()
  
      const selectedCrypto = cryptoSelect.value
      const selectedNetwork = networkSelect.value
      const amount = amountInput.value
  
      if (!selectedCrypto || !selectedNetwork || !amount) {
        alert("Please fill in all required fields")
        return
      }
  
      if (amount < cryptoData[selectedCrypto].minDeposit) {
        alert(`Minimum deposit amount is ${cryptoData[selectedCrypto].minDeposit} ${selectedCrypto}`)
        return
      }
  
      // In a real app, you would send this data to the server
      alert(`Deposit address generated for ${amount} ${selectedCrypto} on ${getNetworkName(selectedNetwork)}`)
    }
  
    // Setup event listeners
    function setupEventListeners() {
      cryptoSelect.addEventListener("change", updateNetworkOptions)
      networkSelect.addEventListener("change", updateDepositAddress)
      copyAddressBtn.addEventListener("click", copyAddressToClipboard)
      maxBtn.addEventListener("click", setMaxAmount)
      hideBalanceToggle.addEventListener("change", toggleBalanceVisibility)
      depositForm.addEventListener("submit", handleFormSubmit)
    }
  
    // Initialize the page
    init()
  })
  