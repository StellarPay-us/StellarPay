#!/bin/bash

# Clone the SDP repository
echo "Cloning the Stellar Disbursement Platform repository..."
git clone https://github.com/stellar/stellar-disbursement-platform-backend.git
cd stellar-disbursement-platform-backend

# Install dependencies
echo "Installing dependencies..."
make go-install

# The following portion of this script is based on the Stellar Disbursement Platform (SDP) setup scripts,
# which are licensed under the Apache License 2.0. See LICENSE_SDP for more details.

# Check if .env already exists
echo "====> 👀 Checking if .env environment file exists in $(pwd)"
if [ ! -f ".env" ]; then
    GO_EXECUTABLE="go run ./stellar-disbursement-platform-backend/dev/scripts/create_and_fund.go"
    echo ".env file does not exist. Creating in $(pwd)."

    # Run the Go script to generate keys for SEP-10 without funding
    echo "Generating SEP-10 signing keys..."
    sep10_output=$($GO_EXECUTABLE -fundxlm=false -fundusdc=false)
    sep10_public=$(echo "$sep10_output" | grep 'Public Key:' | awk '{print $3}')
    sep10_private=$(echo "$sep10_output" | grep 'Secret Key:' | awk '{print $3}')

    # Run the Go script to generate keys for distribution with funding
    echo "Generating distribution keys with funding..."
    distribution_output=$($GO_EXECUTABLE -fundxlm=true -fundusdc=true -xlm_amount="20")
    distribution_public=$(echo "$distribution_output" | grep 'Public Key:' | awk '{print $3}')
    distribution_private=$(echo "$distribution_output" | grep 'Secret Key:' | awk '{print $3}')

    # Create .env file with the extracted values
    cat << EOF > .env
# Generate a new keypair for SEP-10 signing
SEP10_SIGNING_PUBLIC_KEY=$sep10_public
SEP10_SIGNING_PRIVATE_KEY=$sep10_private

# Generate a new keypair for the distribution account
DISTRIBUTION_PUBLIC_KEY=$distribution_public
DISTRIBUTION_SEED=$distribution_private

# CHANNEL_ACCOUNT_ENCRYPTION_PASSPHRASE
CHANNEL_ACCOUNT_ENCRYPTION_PASSPHRASE=$distribution_private

# Distribution signer
DISTRIBUTION_ACCOUNT_ENCRYPTION_PASSPHRASE=$distribution_private
EOF

    echo ".env file created successfully in $(pwd)."
else
    echo ".env file already exists in $(pwd). Skipping creation."
fi
echo "====> ✅ Finished .env setup"